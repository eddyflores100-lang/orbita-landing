// Finance/Crypto MCP — Cloudflare Workers edition
const cache = new Map<string, { data: any; ts: number }>();
const TTL_RATES = 600_000, TTL_CRYPTO = 120_000;
function getCached(k: string, t: number): any | null { const e = cache.get(k); if (e && Date.now() - e.ts < t) return e.data; cache.delete(k); return null; }
function setCached(k: string, d: any) { cache.set(k, { data: d, ts: Date.now() }); if (cache.size > 100) { const f = cache.keys().next().value; cache.delete(f); } }

async function fetchJSON(url: string): Promise<any> { const r = await fetch(url, { headers: { "User-Agent": "AliceLabs-Finance-MCP/1.0" } }); return r.json(); }

const SUPPORTED = ["USD","EUR","MXN","COP","PEN","BRL","ARS","CLP","GBP","JPY","CAD","AUD","CHF","CNY","INR"];

const tools = [
  { name: "get_exchange_rate", description: "Get exchange rate between two currencies. Supports LATAM: MXN, COP, PEN, BRL, ARS, CLP.", inputSchema: { type: "object", properties: { from: { type: "string" }, to: { type: "string" } }, required: ["from", "to"] } },
  { name: "list_currencies", description: "List all supported currencies with current USD rates.", inputSchema: { type: "object", properties: {} } },
  { name: "get_crypto_price", description: "Get current price of a cryptocurrency in USD.", inputSchema: { type: "object", properties: { coin: { type: "string" }, vs: { type: "string", default: "usd" } }, required: ["coin"] } },
  { name: "get_crypto_list", description: "Get top 10 cryptocurrencies by market cap.", inputSchema: { type: "object", properties: { limit: { type: "number", default: 10 } } } },
  { name: "convert_currency", description: "Convert amount between currencies.", inputSchema: { type: "object", properties: { amount: { type: "number" }, from: { type: "string" }, to: { type: "string" } }, required: ["amount", "from", "to"] } },
  { name: "get_historical_rate", description: "Get historical exchange rate for a date (YYYY-MM-DD).", inputSchema: { type: "object", properties: { date: { type: "string" }, from: { type: "string" }, to: { type: "string" } }, required: ["date", "from", "to"] } },
];

async function handleToolCall(name: string, args: any): Promise<any> {
  switch (name) {
    case "get_exchange_rate": { if (!args.from || !args.to) throw new Error("Missing: from, to"); const from = args.from.toUpperCase(), to = args.to.toUpperCase(); const c = getCached(`r:${from}-${to}`, TTL_RATES); if (c) return c; const r = await fetchJSON(`https://open.er-api.com/v6/latest/${from}`); const rate = r.rates?.[to]; if (!rate) throw new Error(`Currency ${to} not supported`); const d = { from, to, rate, date: r.date }; setCached(`r:${from}-${to}`, d); return d; }
    case "list_currencies": { const c = getCached("curr", TTL_RATES); if (c) return c; const r = await fetchJSON("https://open.er-api.com/v6/latest/USD"); const rates = r.rates || {}; const d = SUPPORTED.map(c => ({ code: c, rate_vs_usd: rates[c] || "N/A" })); setCached("curr", d); return d; }
    case "get_crypto_price": { if (!args.coin) throw new Error("Missing: coin"); const vs = (args.vs || "usd").toLowerCase(); const c = getCached(`c:${args.coin}-${vs}`, TTL_CRYPTO); if (c) return c; const r = await fetchJSON(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(args.coin)}&vs_currencies=${vs}&include_24hr_change=true`); const d = r[args.coin]; if (!d) throw new Error(`Crypto '${args.coin}' not found. Try: bitcoin, ethereum, solana`); const data = { coin: args.coin, currency: vs, price: d[vs], change_24h: d[`${vs}_24h_change`] }; setCached(`c:${args.coin}-${vs}`, data); return data; }
    case "get_crypto_list": { const limit = Math.min(args.limit || 10, 50); const c = getCached("clist", TTL_CRYPTO); if (c) return c; const r = await fetchJSON(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1`); const d = r.map((c: any) => ({ symbol: c.symbol?.toUpperCase(), name: c.name, price: c.current_price, change_24h: c.price_change_percentage_24h, market_cap: c.market_cap })); setCached("clist", d); return d; }
    case "convert_currency": { if (!args.amount || !args.from || !args.to) throw new Error("Missing: amount, from, to"); const from = args.from.toUpperCase(), to = args.to.toUpperCase(); const r = await fetchJSON(`https://open.er-api.com/v6/latest/${from}`); const rate = r.rates?.[to]; if (!rate) throw new Error(`Currency ${to} not supported`); return { amount: args.amount, from, to, rate, converted: parseFloat((args.amount * rate).toFixed(2)) }; }
    case "get_historical_rate": { if (!args.date || !args.from || !args.to) throw new Error("Missing: date, from, to"); const from = args.from.toUpperCase(), to = args.to.toUpperCase(); const r = await fetchJSON(`https://open.er-api.com/v6/history/${args.date}`); const rate = r.rates?.[from]?.[to] || r.rates?.[to]; if (!rate) throw new Error(`No rate for ${from}→${to} on ${args.date}`); return { date: args.date, from, to, rate }; }
    default: throw new Error(`Unknown: ${name}`);
  }
}

function json(data: any, status = 200): Response { return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } }); }

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
    if (request.method === "GET") return json({ name: "finance-mcp", version: "1.0.0", tools: tools.map(t => t.name) });
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
    let req: any; try { req = await request.json(); } catch { return json({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null }, 400); }
    const { jsonrpc, id, method, params } = req;
    if (method === "initialize") return json({ jsonrpc: "2.0", id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "finance-mcp", version: "1.0.0", description: "Finance/Crypto MCP — 6 tools, LATAM currencies" } } });
    if (method === "tools/list") return json({ jsonrpc: "2.0", id, result: { tools } });
    if (method === "tools/call") { try { const result = await handleToolCall(params?.name, params?.arguments || {}); return json({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] } }); } catch (e: any) { return json({ jsonrpc: "2.0", id, error: { code: -32603, message: e.message } }); } }
    return json({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } });
  }
};
