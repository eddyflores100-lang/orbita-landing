#!/usr/bin/env npx tsx
// Finance/Crypto MCP Server — 6 tools, JSON-RPC 2.0
// APIs: open.er-api.com (free, no auth) + api.coingecko.com (free, no auth)
// Supports LATAM currencies: USD, EUR, MXN, COP, PEN, BRL, ARS, CLP
// No external deps, Node.js built-in http only

import { createServer, IncomingMessage, ServerResponse } from "http";

const PORT = parseInt(process.env.PORT || "3103", 10);
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL_RATES = 600_000; // 10 min for exchange rates
const CACHE_TTL_CRYPTO = 120_000; // 2 min for crypto prices

function getCached(key: string, ttl: number): any | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < ttl) return entry.data;
  cache.delete(key);
  return null;
}

function setCached(key: string, data: any) {
  cache.set(key, { data, ts: Date.now() });
  if (cache.size > 100) { const firstKey = cache.keys().next().value; cache.delete(firstKey); }
}

async function fetchJSON(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    require("https").get(url, { headers: { "User-Agent": "AliceLabs-Finance-MCP/1.0" } }, (res: IncomingMessage) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse failed: ${e.message}`)); }
      });
      res.on("error", reject);
    }).on("error", reject);
  });
}

const SUPPORTED_CURRENCIES = ["USD", "EUR", "MXN", "COP", "PEN", "BRL", "ARS", "CLP", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR"];

const tools = [
  {
    name: "get_exchange_rate",
    description: "Get current exchange rate between two currencies. Supports USD, EUR, MXN, COP, PEN, BRL, ARS, CLP, GBP, JPY, CAD, AUD, CHF, CNY, INR. Uses open.er-api.com (free, no auth).",
    inputSchema: { type: "object", properties: { from: { type: "string", description: "Source currency (e.g. 'USD')" }, to: { type: "string", description: "Target currency (e.g. 'MXN')" } }, required: ["from", "to"] },
  },
  {
    name: "list_currencies",
    description: "List all supported currencies with their current rates against USD.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_crypto_price",
    description: "Get current price of a cryptocurrency in USD (or another fiat). Uses CoinGecko API (free, no auth).",
    inputSchema: { type: "object", properties: { coin: { type: "string", description: "Coin ID (e.g. 'bitcoin', 'ethereum', 'solana')" }, vs: { type: "string", default: "usd", description: "VS currency (e.g. 'usd', 'eur', 'mxn')" } }, required: ["coin"] },
  },
  {
    name: "get_crypto_list",
    description: "Get top 10 cryptocurrencies by market cap with current price, 24h change, and market cap. Uses CoinGecko API.",
    inputSchema: { type: "object", properties: { limit: { type: "number", default: 10, description: "Max results (max 50)" } } },
  },
  {
    name: "convert_currency",
    description: "Convert an amount from one currency to another. Supports all fiat currencies + major cryptos.",
    inputSchema: { type: "object", properties: { amount: { type: "number", description: "Amount to convert" }, from: { type: "string" }, to: { type: "string" } }, required: ["amount", "from", "to"] },
  },
  {
    name: "get_historical_rate",
    description: "Get historical exchange rate for a specific date. Format: YYYY-MM-DD. Uses open.er-api.com.",
    inputSchema: { type: "object", properties: { date: { type: "string", description: "Date in YYYY-MM-DD format (e.g. '2025-01-01')" }, from: { type: "string" }, to: { type: "string" } }, required: ["date", "from", "to"] },
  },
];

async function handleToolCall(name: string, args: any): Promise<any> {
  switch (name) {
    case "get_exchange_rate": {
      if (!args.from || !args.to) throw new Error("Missing required params: from, to");
      const from = args.from.toUpperCase();
      const to = args.to.toUpperCase();
      const cacheKey = `rate:${from}-${to}`;
      const cached = getCached(cacheKey, CACHE_TTL_RATES);
      if (cached) return cached;
      const result = await fetchJSON(`https://open.er-api.com/v6/latest/${from}`);
      const rate = result.rates?.[to];
      if (!rate) throw new Error(`Currency ${to} not supported. Supported: ${Object.keys(result.rates || {}).slice(0, 20).join(", ")}`);
      const data = { from, to, rate, date: result.date, last_updated: result.time_last_update_utc };
      setCached(cacheKey, data);
      return data;
    }

    case "list_currencies": {
      const cached = getCached("currencies", CACHE_TTL_RATES);
      if (cached) return cached;
      const result = await fetchJSON("https://open.er-api.com/v6/latest/USD");
      const rates = result.rates || {};
      const currencies = SUPPORTED_CURRENCIES.map(c => ({ code: c, rate_vs_usd: rates[c] || "N/A" }));
      setCached("currencies", currencies);
      return currencies;
    }

    case "get_crypto_price": {
      if (!args.coin) throw new Error("Missing required param: coin");
      const vs = (args.vs || "usd").toLowerCase();
      const cacheKey = `crypto:${args.coin}-${vs}`;
      const cached = getCached(cacheKey, CACHE_TTL_CRYPTO);
      if (cached) return cached;
      const result = await fetchJSON(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(args.coin)}&vs_currencies=${vs}&include_24hr_change=true`);
      const data = result[args.coin];
      if (!data) throw new Error(`Crypto '${args.coin}' not found. Try: bitcoin, ethereum, solana, cardano, dogecoin`);
      const price = data[vs];
      const change = data[`${vs}_24h_change`];
      setCached(cacheKey, { coin: args.coin, currency: vs, price, change_24h: change });
      return { coin: args.coin, currency: vs, price, change_24h: change };
    }

    case "get_crypto_list": {
      const limit = Math.min(args.limit || 10, 50);
      const cached = getCached("crypto_list", CACHE_TTL_CRYPTO);
      if (cached) return cached;
      const result = await fetchJSON(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1`);
      const data = result.map((c: any) => ({ symbol: c.symbol?.toUpperCase(), name: c.name, price: c.current_price, change_24h: c.price_change_percentage_24h, market_cap: c.market_cap, rank: c.market_cap_rank }));
      setCached("crypto_list", data);
      return data;
    }

    case "convert_currency": {
      if (!args.amount || !args.from || !args.to) throw new Error("Missing required params: amount, from, to");
      const from = args.from.toUpperCase();
      const to = args.to.toUpperCase();
      const result = await fetchJSON(`https://open.er-api.com/v6/latest/${from}`);
      const rate = result.rates?.[to];
      if (!rate) throw new Error(`Currency ${to} not supported`);
      const converted = (args.amount * rate).toFixed(2);
      return { amount: args.amount, from, to, rate, converted: parseFloat(converted) };
    }

    case "get_historical_rate": {
      if (!args.date || !args.from || !args.to) throw new Error("Missing required params: date, from, to");
      const from = args.from.toUpperCase();
      const to = args.to.toUpperCase();
      const result = await fetchJSON(`https://open.er-api.com/v6/history/${args.date}`);
      const rate = result.rates?.[from]?.[to] || result.rates?.[to];
      if (!rate) throw new Error(`No historical rate for ${from}→${to} on ${args.date}`);
      return { date: args.date, from, to, rate };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// JSON-RPC 2.0 server
const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }
  if (req.method === "GET") { res.writeHead(200); res.end(JSON.stringify({ name: "finance-mcp", version: "1.0.0", tools: tools.map(t => t.name), protocol: "jsonrpc-2.0" })); return; }
  if (req.method !== "POST") { res.writeHead(405); res.end(JSON.stringify({ error: "Method not allowed" })); return; }

  let body = "";
  for await (const chunk of req) body += chunk;

  let request: any;
  try { request = JSON.parse(body); }
  catch { res.writeHead(400); res.end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null })); return; }

  const { jsonrpc, id, method, params } = request;

  if (method === "initialize") {
    res.writeHead(200);
    res.end(JSON.stringify({ jsonrpc: "2.0", id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "finance-mcp", version: "1.0.0", description: "Finance/Crypto MCP — 6 tools: exchange rates, crypto prices, currency conversion, historical rates. LATAM currencies supported." } } }));
    return;
  }

  if (method === "tools/list") {
    res.writeHead(200);
    res.end(JSON.stringify({ jsonrpc: "2.0", id, result: { tools } }));
    return;
  }

  if (method === "tools/call") {
    try {
      const result = await handleToolCall(params?.name, params?.arguments || {});
      res.writeHead(200);
      res.end(JSON.stringify({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] } }));
    } catch (e: any) {
      res.writeHead(200);
      res.end(JSON.stringify({ jsonrpc: "2.0", id, error: { code: -32603, message: e.message } }));
    }
    return;
  }

  res.writeHead(200);
  res.end(JSON.stringify({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } }));
});

server.listen(PORT, () => {
  console.log(`[finance-mcp] Finance/Crypto MCP server running on http://localhost:${PORT}`);
  console.log(`[finance-mcp] 6 tools: get_exchange_rate, list_currencies, get_crypto_price, get_crypto_list, convert_currency, get_historical_rate`);
  console.log(`[finance-mcp] APIs: open.er-api.com (free) + api.coingecko.com (free)`);
  console.log(`[finance-mcp] LATAM currencies: USD, EUR, MXN, COP, PEN, BRL, ARS, CLP`);
});
