// Wikipedia MCP — Cloudflare Workers
const cache = new Map<string, { data: any; ts: number }>();
const TTL = 600_000;
function getCached(k: string): any | null { const e = cache.get(k); if (e && Date.now() - e.ts < TTL) return e.data; cache.delete(k); return null; }
function setCached(k: string, d: any) { cache.set(k, { data: d, ts: Date.now() }); if (cache.size > 100) { const f = cache.keys().next().value; cache.delete(f); } }
async function fetchJSON(url: string): Promise<any> { const r = await fetch(url, { headers: { "User-Agent": "AliceLabs-Wiki-MCP/1.0" } }); return r.json(); }

const tools = [
  { name: "search_articles", description: "Search Wikipedia articles by keyword. Returns title, snippet, and page ID.", inputSchema: { type: "object", properties: { query: { type: "string" }, limit: { type: "number", default: 10 } }, required: ["query"] } },
  { name: "get_summary", description: "Get a concise summary of a Wikipedia article (first paragraph).", inputSchema: { type: "object", properties: { title: { type: "string", description: "Article title (e.g. 'Artificial intelligence')" } }, required: ["title"] } },
  { name: "get_article", description: "Get full Wikipedia article content as plain text (HTML stripped, max 5000 chars).", inputSchema: { type: "object", properties: { title: { type: "string" } }, required: ["title"] } },
  { name: "get_geocode", description: "Geocode a place name to coordinates using Wikipedia's geocoding.", inputSchema: { type: "object", properties: { place: { type: "string" } }, required: ["place"] } },
  { name: "get_random", description: "Get a random Wikipedia article title and summary.", inputSchema: { type: "object", properties: {} } },
  { name: "get_on_this_day", description: "Get historical events that happened on this day (month/day).", inputSchema: { type: "object", properties: { mmdd: { type: "string", description: "MM/DD format (e.g. 10/06). Defaults to today." } } } },
];

async function handleToolCall(name: string, args: any): Promise<any> {
  switch (name) {
    case "search_articles": { if (!args.query) throw new Error("Missing: query"); const limit = Math.min(args.limit || 10, 50); const r = await fetchJSON(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(args.query)}&srlimit=${limit}&format=json`); return r.query.search.map((s: any) => ({ title: s.title, snippet: s.snippet?.replace(/<[^>]+>/g, "").slice(0, 150), pageid: s.pageid })); }
    case "get_summary": { if (!args.title) throw new Error("Missing: title"); const c = getCached(`s:${args.title}`); if (c) return c; const r = await fetchJSON(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(args.title)}`); const d = { title: r.title, extract: r.extract, thumbnail: r.thumbnail?.source, coordinates: r.coordinates?.[0] }; setCached(`s:${args.title}`, d); return d; }
    case "get_article": { if (!args.title) throw new Error("Missing: title"); const r = await fetchJSON(`https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(args.title)}&format=json&prop=wikitext`); const text = r.parse?.wikitext?.["*"] || ""; return { title: r.parse?.title, content: text.replace(/\{\{[^}]+\}\}/g, "").replace(/\[\[([^\]|]+)\|?[^\]]*\]\]/g, "$1").replace(/<[^>]+>/g, "").slice(0, 5000) }; }
    case "get_geocode": { if (!args.place) throw new Error("Missing: place"); const r = await fetchJSON(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(args.place)}&format=json&limit=1`); if (!r.length) throw new Error(`Place '${args.place}' not found`); return { place: args.place, lat: parseFloat(r[0].lat), lon: parseFloat(r[0].lon), display: r[0].display_name }; }
    case "get_random": { const r = await fetchJSON("https://en.wikipedia.org/api/rest_v1/page/random/summary"); return { title: r.title, extract: r.extract, thumbnail: r.thumbnail?.source }; }
    case "get_on_this_day": { const now = new Date(); const mmdd = args.mmdd || `${now.getMonth()+1}/${now.getDate()}`; const r = await fetchJSON(`https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/events/${mmdd}`); const events = r.events || []; return events.slice(0, 10).map((e: any) => ({ year: e.year, text: e.text, pages: e.pages?.map((p: any) => p.title).slice(0, 2) })); }
    default: throw new Error(`Unknown: ${name}`);
  }
}

function json(data: any, status = 200): Response { return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } }); }
export default { async fetch(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
  if (request.method === "GET") return json({ name: "wikipedia-mcp", version: "1.0.0", tools: tools.map(t => t.name) });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let req: any; try { req = await request.json(); } catch { return json({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null }, 400); }
  const { jsonrpc, id, method, params } = req;
  if (method === "initialize") return json({ jsonrpc: "2.0", id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "wikipedia-mcp", version: "1.0.0", description: "Wikipedia MCP — 6 tools: search, summary, full article, geocode, random, on this day" } } });
  if (method === "tools/list") return json({ jsonrpc: "2.0", id, result: { tools } });
  if (method === "tools/call") { try { const result = await handleToolCall(params?.name, params?.arguments || {}); return json({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] } }); } catch (e: any) { return json({ jsonrpc: "2.0", id, error: { code: -32603, message: e.message } }); } }
  return json({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } });
} };
