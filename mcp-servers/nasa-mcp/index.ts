// NASA/Space MCP — Cloudflare Workers
const cache = new Map<string, { data: any; ts: number }>();
const TTL = 3600_000; // 1 hour
function getCached(k: string): any | null { const e = cache.get(k); if (e && Date.now() - e.ts < TTL) return e.data; cache.delete(k); return null; }
function setCached(k: string, d: any) { cache.set(k, { data: d, ts: Date.now() }); if (cache.size > 100) { const f = cache.keys().next().value; cache.delete(f); } }
const API_KEY = process.env.NASA_API_KEY || "DEMO_KEY";
async function fetchJSON(url: string): Promise<any> { const r = await fetch(url); return r.json(); }

const tools = [
  { name: "get_apod", description: "Get NASA's Astronomy Picture of the Day (APOD) with title, explanation, and image URL.", inputSchema: { type: "object", properties: { date: { type: "string", description: "Date in YYYY-MM-DD format (optional, defaults to today)" } } } },
  { name: "search_images", description: "Search NASA's image library by keyword. Returns titles, descriptions, and image URLs.", inputSchema: { type: "object", properties: { query: { type: "string" }, limit: { type: "number", default: 10 } }, required: ["query"] } },
  { name: "get_mars_photos", description: "Get latest Mars rover photos (Curiosity, Opportunity, Spirit). Returns image URLs from Mars.", inputSchema: { type: "object", properties: { rover: { type: "string", default: "curiosity", description: "Rover name (curiosity, opportunity, spirit)" }, limit: { type: "number", default: 5 } } } },
  { name: "get_asteroids", description: "Get near-Earth asteroids approaching Earth in the next 7 days. Returns name, diameter, distance, and velocity.", inputSchema: { type: "object", properties: {} } },
  { name: "get_tech_transfer", description: "Get NASA technology transfer items (patents, software, spinoffs available for commercial use).", inputSchema: { type: "object", properties: { category: { type: "string", default: "patent", description: "Category: patent, software, spinoff" } } } },
  { name: "get_earth_image", description: "Get satellite imagery of Earth for a specific date and coordinates. Returns image URL.", inputSchema: { type: "object", properties: { lat: { type: "number" }, lon: { type: "number" }, date: { type: "string", description: "YYYY-MM-DD (defaults to yesterday)" } }, required: ["lat", "lon"] } },
];

async function handleToolCall(name: string, args: any): Promise<any> {
  switch (name) {
    case "get_apod": { const c = getCached("apod"); if (c) return c; const date = args.date || ""; const r = await fetchJSON(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}${date ? `&date=${date}` : ""}`); const d = { title: r.title, date: r.date, explanation: r.explanation, media_type: r.media_type, url: r.url, hdurl: r.hdurl, copyright: r.copyright }; setCached("apod", d); return d; }
    case "search_images": { if (!args.query) throw new Error("Missing: query"); const limit = Math.min(args.limit || 10, 50); const r = await fetchJSON(`https://images-api.nasa.gov/search?q=${encodeURIComponent(args.query)}&media_type=image&page_size=${limit}`); return (r.collection?.items || []).map((item: any) => ({ nasa_id: item.data?.[0]?.nasa_id, title: item.data?.[0]?.title, description: item.data?.[0]?.description?.slice(0, 200), image_url: item.links?.[0]?.href })); }
    case "get_mars_photos": { const rover = args.rover || "curiosity"; const limit = Math.min(args.limit || 5, 25); const r = await fetchJSON(`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/latest_photos?api_key=${API_KEY}`); return (r.latest_photos || []).slice(0, limit).map((p: any) => ({ id: p.id, sol: p.sol, camera: p.camera?.full_name, img_src: p.img_src, earth_date: p.earth_date, rover: p.rover?.name })); }
    case "get_asteroids": { const c = getCached("asteroids"); if (c) return c; const r = await fetchJSON(`https://api.nasa.gov/neo/rest/v1/feed?api_key=${API_KEY}`); const objects = r.near_earth_objects || {}; const all = Object.entries(objects).flatMap(([date, items]: [string, any[]]) => items.map((a: any) => ({ name: a.name, diameter_meters: a.estimated_diameter?.meters?.estimated_diameter_max, close_approach_date: a.close_approach_data?.[0]?.close_approach_date, miss_distance_km: a.close_approach_data?.[0]?.miss_distance?.kilometers, velocity_kmh: a.close_approach_data?.[0]?.relative_velocity?.kilometers_per_hour, hazardous: a.is_potentially_hazardous_asteroid }))); setCached("asteroids", all.slice(0, 20)); return all.slice(0, 20); }
    case "get_tech_transfer": { const cat = args.category || "patent"; const r = await fetchJSON(`https://api.nasa.gov/techtransfer/${cat}?api_key=${API_KEY}`); return (r.results || []).slice(0, 10).map((t: any) => ({ id: t[0], title: t[2], description: t[3]?.slice(0, 200) })); }
    case "get_earth_image": { if (!args.lat || !args.lon) throw new Error("Missing: lat, lon"); const now = new Date(); now.setDate(now.getDate() - 1); const date = args.date || now.toISOString().slice(0, 10); const r = await fetchJSON(`https://api.nasa.gov/planetary/earth/imagery?lon=${args.lon}&lat=${args.lat}&date=${date}&api_key=${API_KEY}`); return { latitude: args.lat, longitude: args.lon, date, image_url: r.url, id: r.id }; }
    default: throw new Error(`Unknown: ${name}`);
  }
}

function json(data: any, status = 200): Response { return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } }); }
export default { async fetch(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
  if (request.method === "GET") return json({ name: "nasa-mcp", version: "1.0.0", tools: tools.map(t => t.name) });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let req: any; try { req = await request.json(); } catch { return json({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null }, 400); }
  const { jsonrpc, id, method, params } = req;
  if (method === "initialize") return json({ jsonrpc: "2.0", id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "nasa-mcp", version: "1.0.0", description: "NASA/Space MCP — 6 tools: APOD, image search, Mars photos, asteroids, tech transfer, Earth imagery" } } });
  if (method === "tools/list") return json({ jsonrpc: "2.0", id, result: { tools } });
  if (method === "tools/call") { try { const result = await handleToolCall(params?.name, params?.arguments || {}); return json({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] } }); } catch (e: any) { return json({ jsonrpc: "2.0", id, error: { code: -32603, message: e.message } }); } }
  return json({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } });
} };
