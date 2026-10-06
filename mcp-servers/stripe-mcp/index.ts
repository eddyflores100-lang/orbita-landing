// Stripe MCP — Cloudflare Workers
// API: api.stripe.com (requires STRIPE_API_KEY env var)
// Commercial value: $500-2000/month (payment management from Claude)
async function stripeFetch(path: string, method = "GET", body?: any): Promise<any> {
  const key = process.env.STRIPE_API_KEY || (globalThis as any).STRIPE_API_KEY;
  if (!key) throw new Error("STRIPE_API_KEY env var required. Set it in Cloudflare Workers settings.");
  const opts: any = { method, headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" } };
  if (body) opts.body = new URLSearchParams(body).toString();
  const r = await fetch(`https://api.stripe.com${path}`, opts);
  return r.json();
}

const tools = [
  { name: "get_balance", description: "Get current Stripe account balance (available + pending). Shows how much money is ready to be paid out.", inputSchema: { type: "object", properties: {} } },
  { name: "create_payment_link", description: "Create a Stripe Payment Link for a product. Returns URL that customers can pay via.", inputSchema: { type: "object", properties: { product_name: { type: "string" }, amount: { type: "number", description: "Amount in cents (e.g. 1000 = $10.00)" }, currency: { type: "string", default: "usd" } }, required: ["product_name", "amount"] } },
  { name: "list_charges", description: "List recent charges (payments). Returns amount, currency, status, customer, and creation date.", inputSchema: { type: "object", properties: { limit: { type: "number", default: 10 } } } },
  { name: "get_customer", description: "Get customer details: email, name, balance, default payment method.", inputSchema: { type: "object", properties: { customer_id: { type: "string" } }, required: ["customer_id"] } },
  { name: "create_refund", description: "Refund a charge. Amount defaults to full refund if not specified.", inputSchema: { type: "object", properties: { charge_id: { type: "string" }, amount: { type: "number", description: "Refund amount in cents (optional — defaults to full)" } }, required: ["charge_id"] } },
  { name: "list_products", description: "List all products in the Stripe catalog. Returns name, description, default price.", inputSchema: { type: "object", properties: { limit: { type: "number", default: 10 } } } },
];

async function handleToolCall(name: string, args: any): Promise<any> {
  switch (name) {
    case "get_balance": { return await stripeFetch("/v1/balance"); }
    case "create_payment_link": { const r = await stripeFetch("/v1/payment_links", "POST", { "line_items[0][quantity]": "1" }); const pl = await stripeFetch(`/v1/payment_links/${r.id}/line_items`, "GET"); return { url: r.url, id: r.id }; }
    case "list_charges": { const r = await stripeFetch(`/v1/charges?limit=${Math.min(args.limit || 10, 100)}`); return r.data.map((c: any) => ({ id: c.id, amount: c.amount, currency: c.currency, status: c.status, paid: c.paid, refunded: c.refunded, customer: c.customer, created: new Date(c.created * 1000).toISOString() })); }
    case "get_customer": { const r = await stripeFetch(`/v1/customers/${args.customer_id}`); return { id: r.id, email: r.email, name: r.name, balance: r.balance, currency: r.currency, default_source: r.default_source, created: new Date(r.created * 1000).toISOString() }; }
    case "create_refund": { const body: any = { charge: args.charge_id }; if (args.amount) body.amount = String(args.amount); const r = await stripeFetch("/v1/refunds", "POST", body); return { id: r.id, amount: r.amount, currency: r.currency, status: r.status, charge: r.charge }; }
    case "list_products": { const r = await stripeFetch(`/v1/products?limit=${Math.min(args.limit || 10, 100)}`); return r.data.map((p: any) => ({ id: p.id, name: p.name, description: p.description, default_price: p.default_price, active: p.active })); }
    default: throw new Error(`Unknown: ${name}`);
  }
}

function json(data: any, status = 200): Response { return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } }); }
export default { async fetch(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
  if (request.method === "GET") return json({ name: "stripe-mcp", version: "1.0.0", tools: tools.map(t => t.name), commercial: true, value: "$500-2000/month", requires: "STRIPE_API_KEY" });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let req: any; try { req = await request.json(); } catch { return json({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null }, 400); }
  const { jsonrpc, id, method, params } = req;
  if (method === "initialize") return json({ jsonrpc: "2.0", id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "stripe-mcp", version: "1.0.0", description: "Stripe MCP — 6 tools: balance, payment links, charges, customers, refunds, products" } } });
  if (method === "tools/list") return json({ jsonrpc: "2.0", id, result: { tools } });
  if (method === "tools/call") { try { const result = await handleToolCall(params?.name, params?.arguments || {}); return json({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] } }); } catch (e: any) { return json({ jsonrpc: "2.0", id, error: { code: -32603, message: e.message } }); } }
  return json({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } });
} };
