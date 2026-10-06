// Hacker News MCP — Cloudflare Workers edition
// ES Module format + fetch API (no Node.js http/https needed)

const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 60_000;

function getCached(key: string): any | null {
  const e = cache.get(key);
  if (e && Date.now() - e.ts < CACHE_TTL) return e.data;
  cache.delete(key); return null;
}
function setCached(key: string, data: any) {
  cache.set(key, { data, ts: Date.now() });
  if (cache.size > 100) { const k = cache.keys().next().value; cache.delete(k); }
}

async function fetchJSON(url: string): Promise<any> {
  const r = await fetch(url, { headers: { "User-Agent": "AliceLabs-HN-MCP/1.0" } });
  return r.json();
}

const tools = [
  { name: "get_top_stories", description: "Fetch top 10 Hacker News stories with title, URL, points, author, and comment count.", inputSchema: { type: "object", properties: { limit: { type: "number", default: 10 } } } },
  { name: "get_best_stories", description: "Fetch best 10 Hacker News stories (all-time best).", inputSchema: { type: "object", properties: { limit: { type: "number", default: 10 } } } },
  { name: "get_story", description: "Fetch a single HN story by ID, including first 5 top-level comments.", inputSchema: { type: "object", properties: { id: { type: "number" } }, required: ["id"] } },
  { name: "search_stories", description: "Search Hacker News stories by keyword via Algolia.", inputSchema: { type: "object", properties: { query: { type: "string" }, hits: { type: "number", default: 10 } }, required: ["query"] } },
  { name: "get_user", description: "Fetch HN user profile: karma, about, submission count.", inputSchema: { type: "object", properties: { username: { type: "string" } }, required: ["username"] } },
  { name: "get_new_stories", description: "Fetch 10 newest Hacker News stories.", inputSchema: { type: "object", properties: { limit: { type: "number", default: 10 } } } },
];

async function handleToolCall(name: string, args: any): Promise<any> {
  const limit = Math.min(args.limit || 10, 30);
  switch (name) {
    case "get_top_stories": {
      const c = getCached("top"); if (c) return c;
      const ids: number[] = await fetchJSON("https://hacker-news.firebaseio.com/v0/topstories.json");
      const stories = await Promise.all(ids.slice(0, limit).map(id => fetchJSON(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)));
      const result = stories.map(s => ({ id: s.id, title: s.title, url: s.url || `https://news.ycombinator.com/item?id=${s.id}`, points: s.score, author: s.by, comments: s.descendants || 0 }));
      setCached("top", result); return result;
    }
    case "get_best_stories": {
      const c = getCached("best"); if (c) return c;
      const ids: number[] = await fetchJSON("https://hacker-news.firebaseio.com/v0/beststories.json");
      const stories = await Promise.all(ids.slice(0, limit).map(id => fetchJSON(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)));
      const result = stories.map(s => ({ id: s.id, title: s.title, url: s.url || `https://news.ycombinator.com/item?id=${s.id}`, points: s.score, author: s.by }));
      setCached("best", result); return result;
    }
    case "get_story": {
      if (!args.id) throw new Error("Missing required param: id");
      const s = await fetchJSON(`https://hacker-news.firebaseio.com/v0/item/${args.id}.json`);
      if (!s) throw new Error(`Story ${args.id} not found`);
      let comments: any[] = [];
      if (s.kids?.length) {
        comments = await Promise.all(s.kids.slice(0, 5).map(id => fetchJSON(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)));
        comments = comments.filter(Boolean).map(c => ({ id: c.id, author: c.by, text: (c.text || "").replace(/<[^>]+>/g, "").slice(0, 300) }));
      }
      return { id: s.id, title: s.title, url: s.url, text: (s.text || "").replace(/<[^>]+>/g, "").slice(0, 500), points: s.score, author: s.by, comments: s.descendants || 0, topComments: comments };
    }
    case "search_stories": {
      if (!args.query) throw new Error("Missing required param: query");
      const hits = Math.min(args.hits || 10, 50);
      const r = await fetchJSON(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(args.query)}&hitsPerPage=${hits}&tags=story`);
      return r.hits.map((h: any) => ({ id: h.objectID, title: h.title, url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`, points: h.points, author: h.author, date: h.created_at, comments: h.num_comments || 0 }));
    }
    case "get_user": {
      if (!args.username) throw new Error("Missing required param: username");
      const u = await fetchJSON(`https://hacker-news.firebaseio.com/v0/user/${args.username}.json`);
      if (!u) throw new Error(`User '${args.username}' not found`);
      return { username: u.id, karma: u.karma, about: (u.about || "").replace(/<[^>]+>/g, "").slice(0, 300), submissions: u.submitted?.length || 0, created: u.created };
    }
    case "get_new_stories": {
      const c = getCached("new"); if (c) return c;
      const ids: number[] = await fetchJSON("https://hacker-news.firebaseio.com/v0/newstories.json");
      const stories = await Promise.all(ids.slice(0, limit).map(id => fetchJSON(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)));
      const result = stories.filter(Boolean).map(s => ({ id: s.id, title: s.title, url: s.url || `https://news.ycombinator.com/item?id=${s.id}`, points: s.score, author: s.by }));
      setCached("new", result); return result;
    }
    default: throw new Error(`Unknown tool: ${name}`);
  }
}

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
    if (request.method === "GET") return json({ name: "hn-mcp", version: "1.0.0", tools: tools.map(t => t.name) });
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

    let req: any;
    try { req = await request.json(); } catch { return json({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null }, 400); }

    const { jsonrpc, id, method, params } = req;
    if (method === "initialize") return json({ jsonrpc: "2.0", id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "hn-mcp", version: "1.0.0", description: "Hacker News MCP — 6 tools" } } });
    if (method === "tools/list") return json({ jsonrpc: "2.0", id, result: { tools } });
    if (method === "tools/call") {
      try { const result = await handleToolCall(params?.name, params?.arguments || {}); return json({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] } }); }
      catch (e: any) { return json({ jsonrpc: "2.0", id, error: { code: -32603, message: e.message } }); }
    }
    return json({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } });
  }
};
