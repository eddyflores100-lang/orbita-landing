// MercadoLibre MCP — Cloudflare Workers
// APIs: api.mercadolibre.com (free for categories/products/users, OAuth for search)
// Commercial value: $200-1000/month (LATAM e-commerce management)
const cache = new Map<string, { data: any; ts: number }>();
const TTL = 600_000;
function getCached(k: string): any | null { const e = cache.get(k); if (e && Date.now() - e.ts < TTL) return e.data; cache.delete(k); return null; }
function setCached(k: string, d: any) { cache.set(k, { data: d, ts: Date.now() }); if (cache.size > 100) { const f = cache.keys().next().value; cache.delete(f); } }
async function fetchJSON(url: string, token?: string): Promise<any> {
  const headers: any = { "Accept": "application/json", "User-Agent": "AliceLabs-ML-MCP/1.0" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const r = await fetch(url, { headers });
  return r.json();
}

const SITES = { MEC: "Ecuador", MCO: "Colombia", MLM: "Mexico", MLA: "Argentina", MLB: "Brazil", MLC: "Chile", MLU: "Uruguay", MPE: "Peru" };

const tools = [
  { name: "get_categories", description: "Get all MercadoLibre categories for a country. Returns category ID, name, and total items. Supports: MEC (Ecuador), MCO (Colombia), MLM (Mexico), MLA (Argentina), MLB (Brazil), MLC (Chile), MPE (Peru), MLU (Uruguay).", inputSchema: { type: "object", properties: { site: { type: "string", description: "Site code (e.g. MEC, MCO, MLM)", default: "MEC" } } } },
  { name: "get_category_detail", description: "Get detailed info for a MercadoLibre category: name, total items, subcategories, and permalink.", inputSchema: { type: "object", properties: { category_id: { type: "string", description: "Category ID (e.g. MEC1039)" } }, required: ["category_id"] } },
  { name: "get_product", description: "Get detailed product info by MercadoLibre item ID: title, price, currency, available quantity, sold quantity, condition, seller ID, pictures, and permalink.", inputSchema: { type: "object", properties: { item_id: { type: "string", description: "ML item ID (e.g. MEC23456789)" } }, required: ["item_id"] } },
  { name: "get_seller", description: "Get MercadoLibre seller profile: nickname, registration date, country, and reputation.", inputSchema: { type: "object", properties: { seller_id: { type: "number", description: "Seller/user ID" } }, required: ["seller_id"] } },
  { name: "get_product_description", description: "Get the plain text description of a MercadoLibre product.", inputSchema: { type: "object", properties: { item_id: { type: "string" } }, required: ["item_id"] } },
  { name: "get_site_info", description: "Get MercadoLibre site info for a country: currency, country code, categories count, and instant categories.", inputSchema: { type: "object", properties: { site: { type: "string", default: "MEC" } } } },
];

async function handleToolCall(name: string, args: any): Promise<any> {
  switch (name) {
    case "get_categories": { const site = args.site || "MEC"; const c = getCached(`cat:${site}`); if (c) return c; const r = await fetchJSON(`https://api.mercadolibre.com/sites/${site}/categories`); const d = r.map((cat: any) => ({ id: cat.id, name: cat.name })); setCached(`cat:${site}`, d); return d; }
    case "get_category_detail": { if (!args.category_id) throw new Error("Missing: category_id"); const r = await fetchJSON(`https://api.mercadolibre.com/categories/${args.category_id}`); return { id: r.id, name: r.name, total_items: r.total_items_in_this_category, permalink: r.permalink, path: r.path_from_root?.map((p: any) => p.name) }; }
    case "get_product": { if (!args.item_id) throw new Error("Missing: item_id"); const r = await fetchJSON(`https://api.mercadolibre.com/items/${args.item_id}`); if (r.error || r.status === 404) throw new Error(`Product ${args.item_id} not found`); return { id: r.id, title: r.title, price: r.price, currency: r.currency_id, available: r.available_quantity, sold: r.sold_quantity, condition: r.condition, seller_id: r.seller_id, permalink: r.permalink, pictures: r.pictures?.slice(0, 5).map((p: any) => p.url), shipping: r.shipping?.free_shipping }; }
    case "get_seller": { if (!args.seller_id) throw new Error("Missing: seller_id"); const r = await fetchJSON(`https://api.mercadolibre.com/users/${args.seller_id}`); if (r.error) throw new Error(`Seller ${args.seller_id} not found`); return { nickname: r.nickname, registration: r.registration_date, country: r.country_id, state: r.state_name, city: r.city_name, phone_area: r.phone?.area_code, verified: r.verified, seller_reputation: r.seller_reputation?.level_id, transactions: r.seller_reputation?.transactions?.total, rating: r.seller_reputation?.transactions?.ratings?.positive }; }
    case "get_product_description": { if (!args.item_id) throw new Error("Missing: item_id"); const r = await fetchJSON(`https://api.mercadolibre.com/items/${args.item_id}/description`); return { item_id: args.item_id, description: (r.plain_text || r.text || "").slice(0, 2000) }; }
    case "get_site_info": { const site = args.site || "MEC"; const r = await fetchJSON(`https://api.mercadolibre.com/sites/${site}`); return { name: r.name, country: r.country_id, currency: r.default_currency_id, categories: r.categories?.length || 0, instant_payment: r.instant_payment, listings: r.listings, status: r.status }; }
    default: throw new Error(`Unknown: ${name}`);
  }
}

function json(data: any, status = 200): Response { return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } }); }
export default { async fetch(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
  if (request.method === "GET") return json({ name: "mercadolibre-mcp", version: "1.0.0", tools: tools.map(t => t.name), commercial: true, value: "$200-1000/month" });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let req: any; try { req = await request.json(); } catch { return json({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null }, 400); }
  const { jsonrpc, id, method, params } = req;
  if (method === "initialize") return json({ jsonrpc: "2.0", id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "mercadolibre-mcp", version: "1.0.0", description: "MercadoLibre MCP — 6 tools: categories, product detail, seller info, product description, site info. LATAM e-commerce." } } });
  if (method === "tools/list") return json({ jsonrpc: "2.0", id, result: { tools } });
  if (method === "tools/call") { try { const result = await handleToolCall(params?.name, params?.arguments || {}); return json({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] } }); } catch (e: any) { return json({ jsonrpc: "2.0", id, error: { code: -32603, message: e.message } }); } }
  return json({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } });
} };
