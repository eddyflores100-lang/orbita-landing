// WhatsApp Business MCP — Cloudflare Workers
// API: graph.facebook.com/v18.0 (requires WHATSAPP_TOKEN + WHATSAPP_PHONE_ID)
// Commercial value: $300-1500/month (LATAM communication automation)
async function waFetch(path: string, method = "GET", body?: any): Promise<any> {
  const token = process.env.WHATSAPP_TOKEN || (globalThis as any).WHATSAPP_TOKEN;
  if (!token) throw new Error("WHATSAPP_TOKEN env var required.");
  const opts: any = { method, headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(`https://graph.facebook.com/v18.0${path}`, opts);
  return r.json();
}

const tools = [
  { name: "send_text", description: "Send a text message to a WhatsApp number. Phone must include country code (e.g. '593991234567').", inputSchema: { type: "object", properties: { phone: { type: "string", description: "Phone number with country code (no +)" }, message: { type: "string" } }, required: ["phone", "message"] } },
  { name: "send_template", description: "Send a pre-approved template message. Templates must be pre-registered in WhatsApp Business Manager.", inputSchema: { type: "object", properties: { phone: { type: "string" }, template_name: { type: "string" }, language: { type: "string", default: "es" } }, required: ["phone", "template_name"] } },
  { name: "send_media", description: "Send an image/document/audio via WhatsApp. Requires a media URL.", inputSchema: { type: "object", properties: { phone: { type: "string" }, media_type: { type: "string", description: "image, document, audio, video" }, media_url: { type: "string" }, caption: { type: "string" } }, required: ["phone", "media_type", "media_url"] } },
  { name: "get_message_status", description: "Check the status of a sent message (sent, delivered, read).", inputSchema: { type: "object", properties: { message_id: { type: "string" } }, required: ["message_id"] } },
  { name: "get_business_profile", description: "Get WhatsApp Business profile info: name, description, category, email, website.", inputSchema: { type: "object", properties: { phone: { type: "string", description: "Business phone number" } }, required: ["phone"] } },
  { name: "list_templates", description: "List all approved message templates for the WhatsApp Business account.", inputSchema: { type: "object", properties: {} } },
];

async function handleToolCall(name: string, args: any): Promise<any> {
  const phoneId = process.env.WHATSAPP_PHONE_ID || (globalThis as any).WHATSAPP_PHONE_ID;
  switch (name) {
    case "send_text": { const r = await waFetch(`/${phoneId}/messages`, "POST", { messaging_product: "whatsapp", to: args.phone, type: "text", text: { body: args.message } }); return { status: r.messaging_product ? "sent" : "error", message_id: r.messages?.[0]?.id, recipient: args.phone }; }
    case "send_template": { const r = await waFetch(`/${phoneId}/messages`, "POST", { messaging_product: "whatsapp", to: args.phone, type: "template", template: { name: args.template_name, language: { code: args.language || "es" } } }); return { status: r.messaging_product ? "sent" : "error", message_id: r.messages?.[0]?.id }; }
    case "send_media": { const typeMap: any = { image: "image", document: "document", audio: "audio", video: "video" }; const wt = typeMap[args.media_type] || "image"; const body: any = { messaging_product: "whatsapp", to: args.phone, type: wt, [wt]: { link: args.media_url } }; if (args.caption && (wt === "image" || wt === "document" || wt === "video")) body[wt].caption = args.caption; const r = await waFetch(`/${phoneId}/messages`, "POST", body); return { status: r.messaging_product ? "sent" : "error", message_id: r.messages?.[0]?.id }; }
    case "get_message_status": { const r = await waFetch(`/${args.message_id}`); return { id: r.id, status: r.status, to: r.to, created: r.created_time }; }
    case "get_business_profile": { const r = await waFetch(`/whatsapp_business_profile?phone=${args.phone}`); return { name: r.name, description: r.about, category: r.category, email: r.email, website: r.website, address: r.address }; }
    case "list_templates": { const r = await waFetch(`/whatsapp_business_templates`); return (r.data || []).map((t: any) => ({ name: t.name, language: t.language, status: t.status, category: t.category })); }
    default: throw new Error(`Unknown: ${name}`);
  }
}

function json(data: any, status = 200): Response { return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } }); }
export default { async fetch(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
  if (request.method === "GET") return json({ name: "whatsapp-mcp", version: "1.0.0", tools: tools.map(t => t.name), commercial: true, value: "$300-1500/month", requires: "WHATSAPP_TOKEN + WHATSAPP_PHONE_ID" });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let req: any; try { req = await request.json(); } catch { return json({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null }, 400); }
  const { jsonrpc, id, method, params } = req;
  if (method === "initialize") return json({ jsonrpc: "2.0", id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "whatsapp-mcp", version: "1.0.0", description: "WhatsApp Business MCP — 6 tools: send text, template, media, status, profile, templates" } } });
  if (method === "tools/list") return json({ jsonrpc: "2.0", id, result: { tools } });
  if (method === "tools/call") { try { const result = await handleToolCall(params?.name, params?.arguments || {}); return json({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] } }); } catch (e: any) { return json({ jsonrpc: "2.0", id, error: { code: -32603, message: e.message } }); } }
  return json({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } });
} };
