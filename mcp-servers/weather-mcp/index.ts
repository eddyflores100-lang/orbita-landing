// Weather MCP — Cloudflare Workers (Open-Meteo API, free, no auth)
const cache = new Map<string, { data: any; ts: number }>();
const TTL = 600_000;
function getCached(k: string): any | null { const e = cache.get(k); if (e && Date.now() - e.ts < TTL) return e.data; cache.delete(k); return null; }
function setCached(k: string, d: any) { cache.set(k, { data: d, ts: Date.now() }); if (cache.size > 100) { const f = cache.keys().next().value; cache.delete(f); } }
async function fetchJSON(url: string): Promise<any> { const r = await fetch(url, { headers: { "User-Agent": "AliceLabs-Weather-MCP/1.0" } }); return r.json(); }

const tools = [
  { name: "get_weather", description: "Get current weather for any location (lat/lon). Returns temperature, wind, humidity, precipitation. Uses Open-Meteo (free, no auth).", inputSchema: { type: "object", properties: { lat: { type: "number" }, lon: { type: "number" } }, required: ["lat", "lon"] } },
  { name: "get_weather_by_city", description: "Get current weather by city name. Auto-geocodes city to coordinates. Supports any city worldwide.", inputSchema: { type: "object", properties: { city: { type: "string", description: "City name (e.g. 'Quito', 'Miami', 'Madrid')" } }, required: ["city"] } },
  { name: "get_forecast", description: "Get 7-day weather forecast for a location.", inputSchema: { type: "object", properties: { lat: { type: "number" }, lon: { type: "number" }, days: { type: "number", default: 7 } }, required: ["lat", "lon"] } },
  { name: "geocode_city", description: "Geocode a city name to latitude/longitude coordinates. Returns country, timezone, and population.", inputSchema: { type: "object", properties: { city: { type: "string" } }, required: ["city"] } },
  { name: "get_air_quality", description: "Get air quality index (PM2.5, PM10, ozone, NO2, SO2) for a location.", inputSchema: { type: "object", properties: { lat: { type: "number" }, lon: { type: "number" } }, required: ["lat", "lon"] } },
  { name: "get_elevation", description: "Get elevation (meters above sea level) for a location.", inputSchema: { type: "object", properties: { lat: { type: "number" }, lon: { type: "number" } }, required: ["lat", "lon"] } },
];

async function handleToolCall(name: string, args: any): Promise<any> {
  switch (name) {
    case "get_weather": { if (!args.lat || !args.lon) throw new Error("Missing: lat, lon"); const r = await fetchJSON(`https://api.open-meteo.com/v1/forecast?latitude=${args.lat}&longitude=${args.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,wind_direction_10m,weather_code&timezone=auto`); const c = r.current || {}; return { temperature_c: c.temperature_2m, feels_like_c: c.apparent_temperature, humidity: c.relative_humidity_2m, precipitation: c.precipitation, wind_speed_kmh: c.wind_speed_10m, wind_direction: c.wind_direction_10m, weather_code: c.weather_code, time: c.time }; }
    case "get_weather_by_city": { if (!args.city) throw new Error("Missing: city"); const geo = await fetchJSON(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(args.city)}&count=1&language=en&format=json`); if (!geo.results?.length) throw new Error(`City '${args.city}' not found`); const loc = geo.results[0]; const w = await fetchJSON(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,weather_code&timezone=auto`); const c = w.current || {}; return { city: loc.name, country: loc.country, temperature_c: c.temperature_2m, feels_like_c: c.apparent_temperature, humidity: c.relative_humidity_2m, precipitation: c.precipitation, wind_speed_kmh: c.wind_speed_10m, weather_code: c.weather_code }; }
    case "get_forecast": { if (!args.lat || !args.lon) throw new Error("Missing: lat, lon"); const days = Math.min(args.days || 7, 16); const r = await fetchJSON(`https://api.open-meteo.com/v1/forecast?latitude=${args.lat}&longitude=${args.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,weather_code&timezone=auto&forecast_days=${days}`); const d = r.daily || {}; return d.time?.map((t: string, i: number) => ({ date: t, max_c: d.temperature_2m_max?.[i], min_c: d.temperature_2m_min?.[i], precipitation_mm: d.precipitation_sum?.[i], wind_max_kmh: d.wind_speed_10m_max?.[i], weather_code: d.weather_code?.[i] })) || []; }
    case "geocode_city": { if (!args.city) throw new Error("Missing: city"); const r = await fetchJSON(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(args.city)}&count=5&language=en&format=json`); if (!r.results?.length) throw new Error(`City '${args.city}' not found`); return r.results.map((c: any) => ({ name: c.name, country: c.country, admin1: c.admin1, latitude: c.latitude, longitude: c.longitude, timezone: c.timezone, population: c.population })); }
    case "get_air_quality": { if (!args.lat || !args.lon) throw new Error("Missing: lat, lon"); const r = await fetchJSON(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${args.lat}&longitude=${args.lon}&current=pm10,pm2_5,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide&timezone=auto`); const c = r.current || {}; return { pm10: c.pm10, pm2_5: c.pm2_5, ozone: c.ozone, no2: c.nitrogen_dioxide, so2: c.sulphur_dioxide, co: c.carbon_monoxide, time: c.time }; }
    case "get_elevation": { if (!args.lat || !args.lon) throw new Error("Missing: lat, lon"); const r = await fetchJSON(`https://api.open-meteo.com/v1/elevation?latitude=${args.lat}&longitude=${args.lon}`); return { latitude: args.lat, longitude: args.lon, elevation_meters: r.elevation }; }
    default: throw new Error(`Unknown: ${name}`);
  }
}

function json(data: any, status = 200): Response { return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } }); }
export default { async fetch(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
  if (request.method === "GET") return json({ name: "weather-mcp", version: "1.0.0", tools: tools.map(t => t.name) });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let req: any; try { req = await request.json(); } catch { return json({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null }, 400); }
  const { jsonrpc, id, method, params } = req;
  if (method === "initialize") return json({ jsonrpc: "2.0", id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "weather-mcp", version: "1.0.0", description: "Weather MCP — 6 tools: current weather, forecast, geocode, air quality, elevation" } } });
  if (method === "tools/list") return json({ jsonrpc: "2.0", id, result: { tools } });
  if (method === "tools/call") { try { const result = await handleToolCall(params?.name, params?.arguments || {}); return json({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] } }); } catch (e: any) { return json({ jsonrpc: "2.0", id, error: { code: -32603, message: e.message } }); } }
  return json({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } });
} };
