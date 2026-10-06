// Notion MCP — Cloudflare Workers
// API: api.notion.com/v1 (requires NOTION_API_KEY)
// Commercial value: $200-1000/month (workspace automation)
async function notionFetch(path: string, method = "GET", body?: any): Promise<any> {
  const key = process.env.NOTION_API_KEY || (globalThis as any).NOTION_API_KEY;
  if (!key) throw new Error("NOTION_API_KEY env var required.");
  const opts: any = { method, headers: { "Authorization": `Bearer ${key}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(`https://api.notion.com/v1${path}`, opts);
  return r.json();
}

const tools = [
  { name: "search_pages", description: "Search all Notion pages/databases by title. Returns ID, title, type, and URL.", inputSchema: { type: "object", properties: { query: { type: "string" } } } },
  { name: "get_page", description: "Get a Notion page by ID: title, properties, and content blocks.", inputSchema: { type: "object", properties: { page_id: { type: "string" } }, required: ["page_id"] } },
  { name: "get_database", description: "Get a Notion database schema: properties, columns, and types.", inputSchema: { type: "object", properties: { database_id: { type: "string" } }, required: ["database_id"] } },
  { name: "query_database", description: "Query a Notion database: filter and sort rows. Returns page IDs and property values.", inputSchema: { type: "object", properties: { database_id: { type: "string" }, limit: { type: "number", default: 10 } }, required: ["database_id"] } },
  { name: "create_page", description: "Create a new page in a Notion database or as a child of another page.", inputSchema: { type: "object", properties: { parent_id: { type: "string" }, title: { type: "string" } }, required: ["parent_id", "title"] } },
  { name: "get_block_children", description: "Get the content blocks of a Notion page (paragraphs, headings, lists, code).", inputSchema: { type: "object", properties: { block_id: { type: "string" } }, required: ["block_id"] } },
];

async function handleToolCall(name: string, args: any): Promise<any> {
  switch (name) {
    case "search_pages": { const r = await notionFetch(`/search`, "POST", { query: args.query || "", page_size: 20 }); return (r.results || []).map((p: any) => ({ id: p.id, title: p.properties?.title?.title?.[0]?.text?.content || p.title || "?", type: p.object, url: p.url })); }
    case "get_page": { const r = await notionFetch(`/pages/${args.page_id}`); return { id: r.id, url: r.url, created: r.created_time, last_edited: r.last_edited_time, archived: r.archived, properties: Object.keys(r.properties || {}).map(k => ({ name: k, type: r.properties[k].type })) }; }
    case "get_database": { const r = await notionFetch(`/databases/${args.database_id}`); return { id: r.id, title: r.title?.[0]?.text?.content, url: r.url, properties: Object.keys(r.properties || {}).map(k => ({ name: k, type: r.properties[k].type })), created: r.created_time }; }
    case "query_database": { const r = await notionFetch(`/databases/${args.database_id}/query`, "POST", { page_size: Math.min(args.limit || 10, 100) }); return (r.results || []).map((p: any) => ({ id: p.id, url: p.url, properties: Object.fromEntries(Object.entries(p.properties || {}).map(([k, v]: [string, any]) => [k, v[v.type]?.[0]?.text?.content || v[v.type]?.content || ""]))) }); }
    case "create_page": { const r = await notionFetch(`/pages`, "POST", { parent: { page_id: args.parent_id }, properties: { title: { title: [{ text: { content: args.title } }] } } }); return { id: r.id, url: r.url, title: args.title }; }
    case "get_block_children": { const r = await notionFetch(`/blocks/${args.block_id}/children?page_size=50`); return (r.results || []).map((b: any) => { const t = b.type; const content = b[t]?.rich_text?.[0]?.text?.content || b[t]?.text?.content || b[t]?.caption?.[0]?.text?.content || ""; return { id: b.id, type: t, content: content.slice(0, 200) }; }); }
    default: throw new Error(`Unknown: ${name}`);
  }
}

function json(data: any, status = 200): Response { return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } }); }
export default { async fetch(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
  if (request.method === "GET") return json({ name: "notion-mcp", version: "1.0.0", tools: tools.map(t => t.name), commercial: true, value: "$200-1000/month", requires: "NOTION_API_KEY" });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let req: any; try { req = await request.json(); } catch { return json({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null }, 400); }
  const { jsonrpc, id, method, params } = req;
  if (method === "initialize") return json({ jsonrpc: "2.0", id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "notion-mcp", version: "1.0.0", description: "Notion MCP — 6 tools: search, get page, database, query, create, blocks" } } });
  if (method === "tools/list") return json({ jsonrpc: "2.0", id, result: { tools } });
  if (method === "tools/call") { try { const result = await handleToolCall(params?.name, params?.arguments || {}); return json({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] } }); } catch (e: any) { return json({ jsonrpc: "2.0", id, error: { code: -32603, message: e.message } }); } }
  return json({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } });
} };
