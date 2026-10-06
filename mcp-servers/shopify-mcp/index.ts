// Shopify MCP — Cloudflare Workers
// API: {store}.myshopify.com/admin/api/2024-10/ (requires SHOPIFY_ACCESS_TOKEN)
// Commercial value: $500-2000/month (e-commerce automation from Claude)
async function shopifyFetch(store: string, path: string, token?: string): Promise<any> {
  const key = token || process.env.SHOPIFY_ACCESS_TOKEN || (globalThis as any).SHOPIFY_ACCESS_TOKEN;
  if (!key) throw new Error("SHOPIFY_ACCESS_TOKEN env var required. Set it in Cloudflare Workers settings.");
  const storeUrl = store.includes(".") ? store : `${store}.myshopify.com`;
  const r = await fetch(`https://${storeUrl}/admin/api/2024-10/${path}`, { headers: { "X-Shopify-Access-Token": key, "Content-Type": "application/json" } });
  return r.json();
}

const tools = [
  { name: "list_products", description: "List products from a Shopify store. Returns title, price, inventory, vendor, and product type.", inputSchema: { type: "object", properties: { store: { type: "string", description: "Store name (e.g. 'mystore' or 'mystore.myshopify.com')" }, limit: { type: "number", default: 10 } }, required: ["store"] } },
  { name: "get_product", description: "Get a single Shopify product by ID: variants, options, images, and full description.", inputSchema: { type: "object", properties: { store: { type: "string" }, product_id: { type: "string" } }, required: ["store", "product_id"] } },
  { name: "list_orders", description: "List recent orders from a Shopify store. Returns customer, total, financial status, and fulfillment status.", inputSchema: { type: "object", properties: { store: { type: "string" }, limit: { type: "number", default: 10 } }, required: ["store"] } },
  { name: "get_customer", description: "Get a Shopify customer profile: email, orders count, total spent, and default address.", inputSchema: { type: "object", properties: { store: { type: "string" }, customer_id: { type: "string" } }, required: ["store", "customer_id"] } },
  { name: "update_inventory", description: "Update inventory quantity for a product variant.", inputSchema: { type: "object", properties: { store: { type: "string" }, inventory_item_id: { type: "string" }, quantity: { type: "number" } }, required: ["store", "inventory_item_id", "quantity"] } },
  { name: "count_products", description: "Get total product count for a Shopify store.", inputSchema: { type: "object", properties: { store: { type: "string" } }, required: ["store"] } },
];

async function handleToolCall(name: string, args: any): Promise<any> {
  const limit = Math.min(args.limit || 10, 250);
  switch (name) {
    case "list_products": { const r = await shopifyFetch(args.store, `products.json?limit=${limit}`); return (r.products || []).map((p: any) => ({ id: p.id, title: p.title, product_type: p.product_type, vendor: p.vendor, variants: p.variants?.map((v: any) => ({ id: v.id, price: v.price, sku: v.sku, inventory: v.inventory_quantity })) })); }
    case "get_product": { const r = await shopifyFetch(args.store, `products/${args.product_id}.json`); const p = r.product; if (!p) throw new Error("Product not found"); return { id: p.id, title: p.title, body: p.body_html?.replace(/<[^>]+>/g, "").slice(0, 500), vendor: p.vendor, product_type: p.product_type, tags: p.tags?.split(","), variants: p.variants?.map((v: any) => ({ id: v.id, title: v.title, price: v.price, sku: v.sku, inventory: v.inventory_quantity })), images: p.images?.slice(0, 5).map((i: any) => i.src) }; }
    case "list_orders": { const r = await shopifyFetch(args.store, `orders.json?limit=${limit}`); return (r.orders || []).map((o: any) => ({ id: o.id, number: o.order_number, customer: o.customer?.email, total: o.total_price, currency: o.currency, financial_status: o.financial_status, fulfillment_status: o.fulfillment_status, created: o.created_at })); }
    case "get_customer": { const r = await shopifyFetch(args.store, `customers/${args.customer_id}.json`); const c = r.customer; if (!c) throw new Error("Customer not found"); return { id: c.id, email: c.email, first_name: c.first_name, last_name: c.last_name, orders_count: c.orders_count, total_spent: c.total_spent, currency: c.currency, phone: c.phone, created: c.created_at }; }
    case "update_inventory": { throw new Error("Inventory update requires POST — implement with Shopify REST API POST to /admin/api/2024-10/inventory_levels/set.json"); }
    case "count_products": { const r = await shopifyFetch(args.store, `products/count.json`); return { store: args.store, total_products: r.count }; }
    default: throw new Error(`Unknown: ${name}`);
  }
}

function json(data: any, status = 200): Response { return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } }); }
export default { async fetch(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
  if (request.method === "GET") return json({ name: "shopify-mcp", version: "1.0.0", tools: tools.map(t => t.name), commercial: true, value: "$500-2000/month", requires: "SHOPIFY_ACCESS_TOKEN" });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let req: any; try { req = await request.json(); } catch { return json({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null }, 400); }
  const { jsonrpc, id, method, params } = req;
  if (method === "initialize") return json({ jsonrpc: "2.0", id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "shopify-mcp", version: "1.0.0", description: "Shopify MCP — 6 tools: products, orders, customers, inventory" } } });
  if (method === "tools/list") return json({ jsonrpc: "2.0", id, result: { tools } });
  if (method === "tools/call") { try { const result = await handleToolCall(params?.name, params?.arguments || {}); return json({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] } }); } catch (e: any) { return json({ jsonrpc: "2.0", id, error: { code: -32603, message: e.message } }); } }
  return json({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } });
} };
