#!/usr/bin/env node
/**
 * Finance (Currency & Crypto) MCP Server
 *
 * A Model Context Protocol (MCP) server that exposes foreign-exchange and
 * cryptocurrency data through six tools. Implements JSON-RPC 2.0 over a
 * newline-delimited TCP transport (and stdio) using only Node.js built-in
 * modules -- no external dependencies.
 *
 * External APIs (all free, no auth):
 *   - https://open.er-api.com/v6                 (exchange rates, 166 currencies)
 *   - https://api.frankfurter.dev/v1             (historical ECB reference rates)
 *   - https://api.coingecko.com/api/v3           (cryptocurrency prices)
 *
 * Note on currency coverage: open.er-api.com provides 166 live currencies
 * including every LATAM currency we target (USD, EUR, MXN, COP, PEN, CLP, ARS,
 * BRL, CUP). Historical rates use the European Central Bank reference set
 * (frankfurter.dev), which covers ~30 major currencies including USD, EUR,
 * MXN and BRL but excludes some LATAM currencies such as COP, ARS, PEN, CLP
 * and CUP. Historical queries for unsupported currencies return a clear
 * error so callers can fall back to the latest rate.
 *
 * License: AL-1.0 (AliceLabs Source-Available)
 */

import * as http from 'http';
import * as https from 'https';
import * as net from 'net';
import { URL } from 'url';

/* =========================================================================
 * Types
 * ========================================================================= */

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number | string | null;
  method: string;
  params?: Record<string, unknown> | unknown[];
}

interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number | string | null;
  result?: unknown;
  error?: JsonRpcError;
}

interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

interface ToolEntry {
  tool: ToolDefinition;
  handler: ToolHandler;
}

/* =========================================================================
 * HTTP helper (redirects, JSON parsing, status validation)
 * ========================================================================= */

interface FetchOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
}

function httpGetJson(url: string, opts: FetchOptions = {}, maxRedirects = 5): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let redirects = 0;
    const headers = opts.headers || {};
    const timeoutMs = opts.timeoutMs ?? 15000;

    const doGet = (currentUrl: string): void => {
      let parsed: URL;
      try {
        parsed = new URL(currentUrl);
      } catch {
        reject(new Error(`Invalid URL: ${currentUrl}`));
        return;
      }
      const lib = parsed.protocol === 'https:' ? https : http;

      const req = lib.get(currentUrl, { headers, timeout: timeoutMs }, (res) => {
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          res.resume();
          if (redirects >= maxRedirects) {
            reject(new Error(`Too many redirects (max ${maxRedirects})`));
            return;
          }
          redirects++;
          const nextUrl = new URL(res.headers.location, currentUrl).href;
          doGet(nextUrl);
          return;
        }
        if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
          let body = '';
          res.setEncoding('utf8');
          res.on('data', (c: string) => (body += c));
          res.on('end', () => {
            let message = `HTTP ${res.statusCode} for ${currentUrl}`;
            try {
              const parsed = body ? JSON.parse(body) : null;
              if (parsed?.error?.info) message += ` -- ${parsed.error.info}`;
              else if (parsed?.status?.error_message) message += ` -- ${parsed.status.error_message}`;
              else if (parsed?.message) message += ` -- ${parsed.message}`;
            } catch {
              if (body) message += ` -- ${body.substring(0, 200)}`;
            }
            reject(new Error(message));
          });
          return;
        }
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk: string) => (data += chunk));
        res.on('end', () => {
          if (data.length === 0) {
            resolve(null);
            return;
          }
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(
              new Error(`Failed to parse JSON from ${currentUrl}: ${data.substring(0, 200)}`),
            );
          }
        });
      });

      req.on('timeout', () => {
        req.destroy(new Error(`Request timeout after ${timeoutMs}ms for ${currentUrl}`));
      });
      req.on('error', (err: Error) => {
        reject(new Error(`Request error for ${currentUrl}: ${err.message}`));
      });
    };

    doGet(url);
  });
}

/* =========================================================================
 * In-memory cache (TTL based)
 * ========================================================================= */

class Cache {
  private store = new Map<string, { value: unknown; expires: number }>();

  set(key: string, value: unknown, ttlMs: number): void {
    this.store.set(key, { value, expires: Date.now() + ttlMs });
  }

  get<T = unknown>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }
}

/* =========================================================================
 * Rate limiter (serializes requests with a minimum interval)
 * ========================================================================= */

class RateLimiter {
  private last = 0;
  private busy = false;
  private queue: Array<() => void> = [];

  constructor(private intervalMs: number) {}

  acquire(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.queue.push(resolve);
      this.drain();
    });
  }

  private drain(): void {
    if (this.busy || this.queue.length === 0) return;
    this.busy = true;
    const elapsed = Date.now() - this.last;
    const wait = Math.max(0, this.intervalMs - elapsed);
    setTimeout(() => {
      this.last = Date.now();
      this.busy = false;
      const next = this.queue.shift();
      if (next) next();
      this.drain();
    }, wait);
  }
}

/* =========================================================================
 * Constants & helpers
 * ========================================================================= */

const ER_API_BASE = 'https://open.er-api.com/v6';
const FRANKFURTER_BASE = 'https://api.frankfurter.dev/v1';
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

const CACHE = new Cache();
const LIMITER = new RateLimiter(600); // max ~1.6 req/s, respectful of free tiers

const TEN_MINUTES = 10 * 60_000;
const TWO_MINUTES = 2 * 60_000;
const ONE_MINUTE = 60_000;

const CURRENCY_NAMES: Record<string, string> = {
  USD: 'United States Dollar',
  EUR: 'Euro',
  MXN: 'Mexican Peso',
  COP: 'Colombian Peso',
  PEN: 'Peruvian Sol',
  CLP: 'Chilean Peso',
  ARS: 'Argentine Peso',
  BRL: 'Brazilian Real',
  CUP: 'Cuban Peso',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  CNY: 'Chinese Yuan',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
  CHF: 'Swiss Franc',
  INR: 'Indian Rupee',
  KRW: 'South Korean Won',
  SGD: 'Singapore Dollar',
  NZD: 'New Zealand Dollar',
  HKD: 'Hong Kong Dollar',
  SEK: 'Swedish Krona',
  NOK: 'Norwegian Krone',
  DKK: 'Danish Krone',
  ZAR: 'South African Rand',
  TRY: 'Turkish Lira',
  RUB: 'Russian Ruble',
  THB: 'Thai Baht',
  PHP: 'Philippine Peso',
  IDR: 'Indonesian Rupiah',
  MYR: 'Malaysian Ringgit',
  VND: 'Vietnamese Dong',
  SAR: 'Saudi Riyal',
  AED: 'UAE Dirham',
  ILS: 'Israeli Shekel',
  PLN: 'Polish Zloty',
  CZK: 'Czech Koruna',
  HUF: 'Hungarian Forint',
  RON: 'Romanian Leu',
  BGN: 'Bulgarian Lev',
  ISK: 'Icelandic Krona',
  UAH: 'Ukrainian Hryvnia',
  EGP: 'Egyptian Pound',
  PKR: 'Pakistani Rupee',
  BDT: 'Bangladeshi Taka',
  NGN: 'Nigerian Naira',
  KES: 'Kenyan Shilling',
  GHS: 'Ghanaian Cedi',
  TWD: 'Taiwan Dollar',
};

// Currencies supported by frankfurter.dev historical endpoint (ECB set).
const FRANKFURTER_CURRENCIES = new Set([
  'AUD', 'BGN', 'BRL', 'CAD', 'CHF', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP',
  'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'ISK', 'JPY', 'KRW', 'MXN', 'MYR',
  'NOK', 'NZD', 'PHP', 'PLN', 'RON', 'SEK', 'SGD', 'THB', 'TRY', 'USD',
  'ZAR',
]);

function sanitizeCurrencyCode(value: unknown, field: string): string {
  const s = String(value ?? '').trim().toUpperCase();
  if (!s) throw new Error(`Parameter "${field}" must be a non-empty currency code.`);
  if (!/^[A-Z]{3}$/.test(s)) {
    throw new Error(`Parameter "${field}" must be a 3-letter ISO 4217 currency code (e.g. USD).`);
  }
  return s;
}

function sanitizeAmount(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error('Parameter "amount" must be a non-negative finite number.');
  }
  return n;
}

function sanitizeDate(value: unknown): string {
  const s = String(value ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    throw new Error('Parameter "date" must be in YYYY-MM-DD format.');
  }
  const d = new Date(s + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) {
    throw new Error('Parameter "date" is not a valid date.');
  }
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (d.getTime() > today.getTime()) {
    throw new Error('Parameter "date" cannot be in the future.');
  }
  // Frankfurter earliest data is 1999-01-04.
  const earliest = new Date(Date.UTC(1999, 0, 4));
  if (d.getTime() < earliest.getTime()) {
    throw new Error('Parameter "date" must be on or after 1999-01-04 (ECB data start).');
  }
  return s;
}

function sanitizeCryptoId(value: unknown): string {
  const s = String(value ?? '').trim().toLowerCase();
  if (!s) throw new Error('Parameter "id" must be a non-empty coin id (e.g. "bitcoin").');
  if (!/^[a-z0-9][a-z0-9-]{0,49}$/.test(s)) {
    throw new Error('Parameter "id" contains invalid characters for a CoinGecko coin id.');
  }
  return s;
}

function sanitizeVsCurrency(value: unknown): string {
  const s = String(value ?? 'usd').trim().toLowerCase();
  if (!/^[a-z]{3}$/.test(s)) {
    throw new Error('Parameter "vs" must be a 3-letter currency code (e.g. usd).');
  }
  return s;
}

async function fetchRates(base: string): Promise<{ rates: Record<string, number>; updated: string }> {
  const cacheKey = `rates:${base}`;
  const cached = CACHE.get<{ rates: Record<string, number>; updated: string }>(cacheKey);
  if (cached !== undefined) return cached;
  await LIMITER.acquire();
  const data = (await httpGetJson(`${ER_API_BASE}/latest/${encodeURIComponent(base)}`)) as any;
  if (!data || data.result !== 'success' || !data.rates) {
    throw new Error(`Could not fetch rates for base ${base} (provider response: ${data?.['error-type'] || 'unknown'}).`);
  }
  const result = {
    rates: data.rates as Record<string, number>,
    updated: data.time_last_update_utc || data.date || new Date().toUTCString(),
  };
  CACHE.set(cacheKey, result, TEN_MINUTES);
  return result;
}

/* =========================================================================
 * Tools
 * ========================================================================= */

const tools: ToolEntry[] = [
  {
    tool: {
      name: 'get_exchange_rate',
      description:
        'Get the current exchange rate from one currency to another. Returns the base currency, target currency, the rate (1 base = rate target) and the time the rate was last updated.',
      inputSchema: {
        type: 'object',
        properties: {
          base: { type: 'string', description: 'Source currency ISO code, e.g. USD.' },
          target: { type: 'string', description: 'Target currency ISO code, e.g. EUR.' },
        },
        required: ['base', 'target'],
      },
    },
    handler: async (args) => {
      const base = sanitizeCurrencyCode(args.base, 'base');
      const target = sanitizeCurrencyCode(args.target, 'target');
      const { rates, updated } = await fetchRates(base);
      const rate = rates[target];
      if (rate === undefined || typeof rate !== 'number') {
        throw new Error(`No exchange rate available from ${base} to ${target}.`);
      }
      return {
        base,
        target,
        rate,
        description: `1 ${base} = ${rate} ${target}`,
        lastUpdated: updated,
      };
    },
  },
  {
    tool: {
      name: 'list_currencies',
      description:
        'List all supported currencies with their ISO 4217 code, descriptive name and the current rate against USD. Useful to discover which currency codes can be used with get_exchange_rate and convert_currency.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    handler: async () => {
      const cacheKey = 'currencies:list';
      const cached = CACHE.get<any>(cacheKey);
      if (cached !== undefined) return cached;
      const { rates, updated } = await fetchRates('USD');
      const codes = Object.keys(rates).sort();
      const currencies = codes.map((code) => ({
        code,
        name: CURRENCY_NAMES[code] || code,
        ratePerUsd: rates[code],
      }));
      const result = {
        count: currencies.length,
        lastUpdated: updated,
        currencies,
      };
      CACHE.set(cacheKey, result, TEN_MINUTES);
      return result;
    },
  },
  {
    tool: {
      name: 'get_crypto_price',
      description:
        'Get the current price of a cryptocurrency in one or more fiat currencies. Uses CoinGecko. Example: get_crypto_price({ id: "bitcoin", vs: "usd" }) returns the current Bitcoin price in USD.',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'CoinGecko coin id (e.g. "bitcoin", "ethereum", "solana").' },
          vs: { type: 'string', description: 'Target fiat currency (default "usd").' },
        },
        required: ['id'],
      },
    },
    handler: async (args) => {
      const id = sanitizeCryptoId(args.id);
      const vs = sanitizeVsCurrency(args.vs);
      const cacheKey = `crypto:price:${id}:${vs}`;
      const cached = CACHE.get<any>(cacheKey);
      if (cached !== undefined) return cached;
      const url = new URL(`${COINGECKO_BASE}/simple/price`);
      url.searchParams.set('ids', id);
      url.searchParams.set('vs_currencies', vs);
      url.searchParams.set('include_market_cap', 'true');
      url.searchParams.set('include_24hr_change', 'true');
      await LIMITER.acquire();
      const data = (await httpGetJson(url.href)) as any;
      const entry = data?.[id];
      if (!entry || typeof entry[vs] !== 'number') {
        throw new Error(`Could not fetch price for "${id}" in ${vs} (CoinGecko may be rate-limiting or the id is unknown).`);
      }
      const result = {
        id,
        currency: vs,
        price: entry[vs],
        marketCap: entry[`${vs}_market_cap`] ?? null,
        change24hPercent: entry[`${vs}_24h_change`] ?? null,
      };
      CACHE.set(cacheKey, result, TWO_MINUTES);
      return result;
    },
  },
  {
    tool: {
      name: 'get_crypto_list',
      description:
        'List the top 100 cryptocurrencies by market capitalization with current price, 24h change, market cap and 24h volume. Uses CoinGecko markets endpoint.',
      inputSchema: {
        type: 'object',
        properties: {
          vs: { type: 'string', description: 'Currency to quote prices in (default "usd").' },
        },
      },
    },
    handler: async (args) => {
      const vs = sanitizeVsCurrency(args.vs);
      const cacheKey = `crypto:list:${vs}`;
      const cached = CACHE.get<any[]>(cacheKey);
      if (cached !== undefined) return cached;
      const url = new URL(`${COINGECKO_BASE}/coins/markets`);
      url.searchParams.set('vs_currency', vs);
      url.searchParams.set('order', 'market_cap_desc');
      url.searchParams.set('per_page', '100');
      url.searchParams.set('page', '1');
      url.searchParams.set('sparkline', 'false');
      await LIMITER.acquire();
      const data = (await httpGetJson(url.href)) as any;
      if (!Array.isArray(data)) {
        const msg = data?.status?.error_message || 'unknown error';
        throw new Error(`Could not fetch crypto list from CoinGecko: ${msg}`);
      }
      const list = data.map((c: any) => ({
        rank: c.market_cap_rank,
        id: c.id,
        symbol: (c.symbol || '').toUpperCase(),
        name: c.name,
        price: c.current_price,
        marketCap: c.market_cap,
        volume24h: c.total_volume,
        change24hPercent: c.price_change_percentage_24h,
        lastUpdated: c.last_updated,
      }));
      CACHE.set(cacheKey, list, TWO_MINUTES);
      return { currency: vs, count: list.length, coins: list };
    },
  },
  {
    tool: {
      name: 'convert_currency',
      description:
        'Convert an amount from one currency to another using current exchange rates. Example: convert_currency({ amount: 100, from: "USD", to: "MXN" }) returns how many Mexican Pesos equal 100 US Dollars.',
      inputSchema: {
        type: 'object',
        properties: {
          amount: { type: 'number', description: 'Amount in the source currency to convert.' },
          from: { type: 'string', description: 'Source currency ISO code, e.g. USD.' },
          to: { type: 'string', description: 'Target currency ISO code, e.g. MXN.' },
        },
        required: ['amount', 'from', 'to'],
      },
    },
    handler: async (args) => {
      const amount = sanitizeAmount(args.amount);
      const from = sanitizeCurrencyCode(args.from, 'from');
      const to = sanitizeCurrencyCode(args.to, 'to');
      const { rates, updated } = await fetchRates(from);
      const rate = rates[to];
      if (rate === undefined || typeof rate !== 'number') {
        throw new Error(`No exchange rate available from ${from} to ${to}.`);
      }
      const converted = amount * rate;
      return {
        amount,
        from,
        to,
        rate,
        converted,
        description: `${amount} ${from} = ${converted.toFixed(2)} ${to} (rate ${rate})`,
        lastUpdated: updated,
      };
    },
  },
  {
    tool: {
      name: 'get_historical_rate',
      description:
        'Get the historical exchange rate from one currency to another for a specific past date (YYYY-MM-DD). Uses ECB reference rates via frankfurter.dev. Historical data covers ~30 major currencies including USD, EUR, MXN, BRL; some LATAM currencies (COP, ARS, PEN, CLP, CUP) are not available historically.',
      inputSchema: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'Date in YYYY-MM-DD format (between 1999-01-04 and today).' },
          base: { type: 'string', description: 'Source currency ISO code, e.g. USD.' },
          target: { type: 'string', description: 'Target currency ISO code, e.g. EUR.' },
        },
        required: ['date', 'base', 'target'],
      },
    },
    handler: async (args) => {
      const date = sanitizeDate(args.date);
      const base = sanitizeCurrencyCode(args.base, 'base');
      const target = sanitizeCurrencyCode(args.target, 'target');
      if (!FRANKFURTER_CURRENCIES.has(base)) {
        throw new Error(`Historical rates are not available for base currency ${base}. Supported: ${[...FRANKFURTER_CURRENCIES].sort().join(', ')}.`);
      }
      if (!FRANKFURTER_CURRENCIES.has(target)) {
        throw new Error(`Historical rates are not available for target currency ${target}. Supported: ${[...FRANKFURTER_CURRENCIES].sort().join(', ')}.`);
      }
      if (base === target) {
        return { date, base, target, rate: 1, description: `1 ${base} = 1 ${target}` };
      }
      const cacheKey = `hist:${date}:${base}:${target}`;
      const cached = CACHE.get<any>(cacheKey);
      if (cached !== undefined) return cached;
      const url = new URL(`${FRANKFURTER_BASE}/${date}`);
      url.searchParams.set('from', base);
      url.searchParams.set('to', target);
      await LIMITER.acquire();
      const data = (await httpGetJson(url.href)) as any;
      const rate = data?.rates?.[target];
      if (typeof rate !== 'number') {
        throw new Error(`No historical rate for ${base} to ${target} on ${date}.`);
      }
      const result = {
        date,
        base,
        target,
        rate,
        description: `1 ${base} = ${rate} ${target} on ${date}`,
      };
      CACHE.set(cacheKey, result, ONE_MINUTE);
      return result;
    },
  },
];

const TOOL_REGISTRY: Record<string, ToolEntry> = Object.fromEntries(
  tools.map((t) => [t.tool.name, t]),
);

/* =========================================================================
 * JSON-RPC handler
 * ========================================================================= */

async function handleJsonRpc(request: JsonRpcRequest): Promise<JsonRpcResponse> {
  const { id, method, params } = request;
  const base: Pick<JsonRpcResponse, 'jsonrpc' | 'id'> = { jsonrpc: '2.0', id };

  if (method === 'notifications/initialized') {
    return { ...base, result: {} };
  }

  if (method === 'initialize') {
    return {
      ...base,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'finance-mcp', version: '1.0.0' },
      },
    };
  }

  if (method === 'tools/list') {
    return { ...base, result: { tools: tools.map((t) => t.tool) } };
  }

  if (method === 'tools/call') {
    const p = (params || {}) as { name?: string; arguments?: Record<string, unknown> };
    const toolName = p.name;
    const args = p.arguments || {};
    const entry = toolName ? TOOL_REGISTRY[toolName] : undefined;
    if (!entry) {
      return { ...base, error: { code: -32601, message: `Tool not found: ${toolName}` } };
    }
    const required = entry.tool.inputSchema.required || [];
    for (const r of required) {
      if (args[r] === undefined || args[r] === null) {
        return { ...base, error: { code: -32602, message: `Missing required parameter: ${r}` } };
      }
    }
    try {
      const result = await entry.handler(args);
      return {
        ...base,
        result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] },
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return {
        ...base,
        result: { content: [{ type: 'text', text: `Error: ${message}` }], isError: true },
      };
    }
  }

  return { ...base, error: { code: -32601, message: `Method not found: ${method}` } };
}

/* =========================================================================
 * Transport: TCP (newline-delimited JSON-RPC) and stdio
 * ========================================================================= */

function processLine(line: string, respond: (msg: JsonRpcResponse) => void): void {
  const trimmed = line.trim();
  if (!trimmed) return;
  let request: JsonRpcRequest;
  try {
    request = JSON.parse(trimmed) as JsonRpcRequest;
  } catch {
    respond({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32700, message: 'Parse error: invalid JSON' },
    });
    return;
  }
  if (request.id === null || request.id === undefined) {
    return;
  }
  handleJsonRpc(request)
    .then(respond)
    .catch((err) => {
      respond({
        jsonrpc: '2.0',
        id: request.id,
        error: { code: -32603, message: err instanceof Error ? err.message : String(err) },
      });
    });
}

function runTcp(port: number): void {
  const server = net.createServer((socket) => {
    let buffer = '';
    socket.setEncoding('utf8');
    socket.on('data', (chunk: string) => {
      buffer += chunk;
      let idx: number;
      while ((idx = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        processLine(line, (msg) => {
          socket.write(JSON.stringify(msg) + '\n');
        });
      }
    });
    socket.on('error', () => {
      /* ignore teardown errors */
    });
  });
  server.on('error', (err) => {
    process.stderr.write(`Server error: ${err.message}\n`);
    process.exit(1);
  });
  server.listen(port, '127.0.0.1', () => {
    const addr = server.address();
    const actualPort = typeof addr === 'object' && addr ? addr.port : port;
    process.stdout.write(`LISTENING ${actualPort}\n`);
  });
}

function runStdio(): void {
  let buffer = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk: string) => {
    buffer += chunk;
    let idx: number;
    while ((idx = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      processLine(line, (msg) => {
        process.stdout.write(JSON.stringify(msg) + '\n');
      });
    }
  });
  process.stdin.on('end', () => process.exit(0));
  process.stdin.on('error', () => process.exit(0));
}

const transportArg = process.argv[2];
if (transportArg && transportArg !== 'stdio' && transportArg !== '--stdio') {
  runTcp(parseInt(transportArg, 10));
} else {
  runStdio();
}
