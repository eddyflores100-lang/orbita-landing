// HubSpot CRM MCP — Cloudflare Workers
// API: api.hubapi.com (requires HUBSPOT_API_KEY)
// Commercial value: $500-2000/month (sales pipeline automation)
async function hubFetch(path: string, method = "GET", body?: any): Promise<any> {
  const key = process.env.HUBSPOT_API_KEY || (globalThis as any).HUBSPOT_API_KEY;
  if (!key) throw new Error("HUBSPOT_API_KEY env var required.");
  const opts: any = { method, headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(`https://api.hubapi.com${path}`, opts);
  return r.json();
}

const tools = [
  { name: "list_contacts", description: "List HubSpot contacts: name, email, company, lifecycle stage, and last activity.", inputSchema: { type: "object", properties: { limit: { type: "number", default: 10 } } } },
  { name: "get_contact", description: "Get a single HubSpot contact by ID: all properties and custom fields.", inputSchema: { type: "object", properties: { contact_id: { type: "string" } }, required: ["contact_id"] } },
  { name: "create_contact", description: "Create a new HubSpot contact with email, first name, last name, and company.", inputSchema: { type: "object", properties: { email: { type: "string" }, firstname: { type: "string" }, lastname: { type: "string" }, company: { type: "string" } }, required: ["email"] } },
  { name: "list_deals", description: "List HubSpot deals (sales opportunities): deal name, amount, stage, and probability.", inputSchema: { type: "object", properties: { limit: { type: "number", default: 10 } } } },
  { name: "get_deal", description: "Get a single HubSpot deal by ID: amount, stage, close date, and associated contacts.", inputSchema: { type: "object", properties: { deal_id: { type: "string" } }, required: ["deal_id"] } },
  { name: "get_pipeline", description: "Get HubSpot deal pipeline stages: name, display order, and probability.", inputSchema: { type: "object", properties: {} } },
];

async function handleToolCall(name: string, args: any): Promise<any> {
  const limit = Math.min(args.limit || 10, 100);
  switch (name) {
    case "list_contacts": { const r = await hubFetch(`/crm/v3/objects/contacts?limit=${limit}&properties=firstname,lastname,email,company,lifecyclestage,hs_last_activity`); return (r.results || []).map((c: any) => ({ id: c.id, email: c.properties?.email, name: `${c.properties?.firstname || ""} ${c.properties?.lastname || ""}`.trim(), company: c.properties?.company, stage: c.properties?.lifecyclestage, created: c.createdAt })); }
    case "get_contact": { const r = await hubFetch(`/crm/v3/objects/contacts/${args.contact_id}?properties=firstname,lastname,email,phone,company,lifecyclestage,hs_lead_status,dealstage`); return { id: r.id, email: r.properties?.email, phone: r.properties?.phone, name: `${r.properties?.firstname || ""} ${r.properties?.lastname || ""}`.trim(), company: r.properties?.company, lifecycle: r.properties?.lifecyclestage, created: r.createdAt, updated: r.updatedAt }; }
    case "create_contact": { const props: any = { email: args.email }; if (args.firstname) props.firstname = args.firstname; if (args.lastname) props.lastname = args.lastname; if (args.company) props.company = args.company; const r = await hubFetch(`/crm/v3/objects/contacts`, "POST", { properties: props }); return { id: r.id, email: args.email, created: r.createdAt }; }
    case "list_deals": { const r = await hubFetch(`/crm/v3/objects/deals?limit=${limit}&properties=dealname,amount,dealstage,closedate,probability`); return (r.results || []).map((d: any) => ({ id: d.id, name: d.properties?.dealname, amount: d.properties?.amount, stage: d.properties?.dealstage, close_date: d.properties?.closedate })); }
    case "get_deal": { const r = await hubFetch(`/crm/v3/objects/deals/${args.deal_id}?properties=dealname,amount,dealstage,closedate,probability_,hubspot_owner_id`); return { id: r.id, name: r.properties?.dealname, amount: r.properties?.amount, stage: r.properties?.dealstage, close_date: r.properties?.closedate, created: r.createdAt }; }
    case "get_pipeline": { const r = await hubFetch(`/crm/v3/pipelines/deals`); return (r.results || []).map((p: any) => ({ id: p.id, label: p.label, stages: (p.stages || []).map((s: any) => ({ id: s.id, label: s.label, probability: s.metadata?.probability, display_order: s.displayOrder })) })); }
    default: throw new Error(`Unknown: ${name}`);
  }
}

function json(data: any, status = 200): Response { return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } }); }
export default { async fetch(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
  if (request.method === "GET") return json({ name: "hubspot-mcp", version: "1.0.0", tools: tools.map(t => t.name), commercial: true, value: "$500-2000/month", requires: "HUBSPOT_API_KEY" });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let req: any; try { req = await request.json(); } catch { return json({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null }, 400); }
  const { jsonrpc, id, method, params } = req;
  if (method === "initialize") return json({ jsonrpc: "2.0", id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "hubspot-mcp", version: "1.0.0", description: "HubSpot CRM MCP — 6 tools: contacts, deals, pipeline" } } });
  if (method === "tools/list") return json({ jsonrpc: "2.0", id, result: { tools } });
  if (method === "tools/call") { try { const result = await handleToolCall(params?.name, params?.arguments || {}); return json({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] } }); } catch (e: any) { return json({ jsonrpc: "2.0", id, error: { code: -32603, message: e.message } }); } }
  return json({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } });
} };
