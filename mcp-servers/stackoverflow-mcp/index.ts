// StackOverflow MCP — Cloudflare Workers
// API: api.stackexchange.com (free, no auth, 300 req/day without key)
const cache = new Map<string, { data: any; ts: number }>();
const TTL = 600_000;
function getCached(k: string): any | null { const e = cache.get(k); if (e && Date.now() - e.ts < TTL) return e.data; cache.delete(k); return null; }
function setCached(k: string, d: any) { cache.set(k, { data: d, ts: Date.now() }); if (cache.size > 100) { const f = cache.keys().next().value; cache.delete(f); } }
async function fetchJSON(url: string): Promise<any> { const r = await fetch(url); return r.json(); }

const tools = [
  { name: "search_questions", description: "Search StackOverflow questions by keyword. Returns title, score, tags, and answer count.", inputSchema: { type: "object", properties: { query: { type: "string" }, tagged: { type: "string", description: "Tag filter (e.g. 'typescript', 'react')" }, limit: { type: "number", default: 10 } }, required: ["query"] } },
  { name: "get_question", description: "Get a single StackOverflow question with full body and top 5 answers (with code snippets).", inputSchema: { type: "object", properties: { question_id: { type: "number" } }, required: ["question_id"] } },
  { name: "get_top_tags", description: "Get top StackOverflow tags by question count. Useful for finding trending topics.", inputSchema: { type: "object", properties: { limit: { type: "number", default: 20 } } } },
  { name: "get_user", description: "Get StackOverflow user profile: reputation, badges, top tags, and location.", inputSchema: { type: "object", properties: { user_id: { type: "number" } }, required: ["user_id"] } },
  { name: "search_by_tag", description: "Search questions by tag(s). Returns highest-voted questions for the given tags.", inputSchema: { type: "object", properties: { tags: { type: "string", description: "Semicolon-separated tags (e.g. 'typescript;react')" }, limit: { type: "number", default: 10 } }, required: ["tags"] } },
  { name: "get_trending", description: "Get trending/hot StackOverflow questions from the last 24 hours. Returns questions with most activity.", inputSchema: { type: "object", properties: { limit: { type: "number", default: 10 } } } },
];

async function handleToolCall(name: string, args: any): Promise<any> {
  const limit = Math.min(args.limit || 10, 50);
  const FILTER = "withbody";
  switch (name) {
    case "search_questions": { if (!args.query) throw new Error("Missing: query"); const tag = args.tagged ? `&tagged=${encodeURIComponent(args.tagged)}` : ""; const r = await fetchJSON(`https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=votes&q=${encodeURIComponent(args.query)}${tag}&site=stackoverflow&pagesize=${limit}`); return r.items.map((q: any) => ({ id: q.question_id, title: q.title, score: q.score, answers: q.answer_count, tags: q.tags, link: q.link, is_answered: q.is_answered })); }
    case "get_question": { if (!args.question_id) throw new Error("Missing: question_id"); const q = await fetchJSON(`https://api.stackexchange.com/2.3/questions/${args.question_id}?order=desc&sort=votes&site=stackoverflow&filter=${FILTER}`); const question = q.items?.[0]; if (!question) throw new Error("Question not found"); const a = await fetchJSON(`https://api.stackexchange.com/2.3/questions/${args.question_id}/answers?order=desc&sort=votes&site=stackoverflow&filter=${FILTER}&pagesize=5`); return { title: question.title, body: question.body?.replace(/<[^>]+>/g, "").slice(0, 500), score: question.score, tags: question.tags, answers: (a.items || []).map((ans: any) => ({ score: ans.score, body: ans.body?.replace(/<[^>]+>/g, "").slice(0, 1000), is_accepted: ans.is_accepted, author: ans.owner?.display_name })) }; }
    case "get_top_tags": { const r = await fetchJSON(`https://api.stackexchange.com/2.3/tags?order=desc&sort=popular&site=stackoverflow&pagesize=${limit}`); return r.items.map((t: any) => ({ name: t.name, count: t.count, has_synonyms: t.has_synonyms })); }
    case "get_user": { if (!args.user_id) throw new Error("Missing: user_id"); const r = await fetchJSON(`https://api.stackexchange.com/2.3/users/${args.user_id}?site=stackoverflow`); const u = r.items?.[0]; if (!u) throw new Error("User not found"); return { name: u.display_name, reputation: u.reputation, badges: { gold: u.badge_counts?.gold, silver: u.badge_counts?.silver, bronze: u.badge_counts?.bronze }, location: u.location, website: u.website_url, profile: u.link, age: u.account_id }; }
    case "search_by_tag": { if (!args.tags) throw new Error("Missing: tags"); const r = await fetchJSON(`https://api.stackexchange.com/2.3/questions?order=desc&sort=votes&tagged=${encodeURIComponent(args.tags)}&site=stackoverflow&pagesize=${limit}`); return r.items.map((q: any) => ({ id: q.question_id, title: q.title, score: q.score, answers: q.answer_count, tags: q.tags, link: q.link })); }
    case "get_trending": { const c = getCached("trending"); if (c) return c; const r = await fetchJSON(`https://api.stackexchange.com/2.3/questions?order=desc&sort=hot&site=stackoverflow&pagesize=${limit}`); const d = r.items.map((q: any) => ({ id: q.question_id, title: q.title, score: q.score, answers: q.answer_count, tags: q.tags, link: q.link })); setCached("trending", d); return d; }
    default: throw new Error(`Unknown: ${name}`);
  }
}

function json(data: any, status = 200): Response { return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } }); }
export default { async fetch(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
  if (request.method === "GET") return json({ name: "stackoverflow-mcp", version: "1.0.0", tools: tools.map(t => t.name), commercial: true });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let req: any; try { req = await request.json(); } catch { return json({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null }, 400); }
  const { jsonrpc, id, method, params } = req;
  if (method === "initialize") return json({ jsonrpc: "2.0", id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "stackoverflow-mcp", version: "1.0.0", description: "StackOverflow MCP — 6 tools: search, get question with answers, top tags, user profiles, search by tag, trending" } } });
  if (method === "tools/list") return json({ jsonrpc: "2.0", id, result: { tools } });
  if (method === "tools/call") { try { const result = await handleToolCall(params?.name, params?.arguments || {}); return json({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] } }); } catch (e: any) { return json({ jsonrpc: "2.0", id, error: { code: -32603, message: e.message } }); } }
  return json({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } });
} };
