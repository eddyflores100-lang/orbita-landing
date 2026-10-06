#!/usr/bin/env npx tsx
// Hacker News MCP Server — 6 tools, JSON-RPC 2.0
// APIs: hn.algolia.com (search) + hacker-news.firebaseio.com (items)
// No auth, no external deps, Node.js built-in http only

import { createServer, IncomingMessage, ServerResponse } from "http";

const PORT = parseInt(process.env.PORT || "3101", 10);
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 60_000; // 60 seconds

function getCached(key: string): any | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  cache.delete(key);
  return null;
}

function setCached(key: string, data: any) {
  cache.set(key, { data, ts: Date.now() });
  if (cache.size > 100) { const firstKey = cache.keys().next().value; cache.delete(firstKey); }
}

async function fetchJSON(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? require("https") : require("http");
    mod.get(url, { headers: { "User-Agent": "AliceLabs-HN-MCP/1.0" } }, (res: IncomingMessage) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse failed: ${e.message}`)); }
      });
      res.on("error", reject);
    }).on("error", reject);
  });
}

// === TOOLS ===

const tools = [
  {
    name: "get_top_stories",
    description: "Fetch top 10 Hacker News stories with title, URL, points, author, and comment count. Uses HN Firebase API. No authentication required.",
    inputSchema: { type: "object", properties: { limit: { type: "number", description: "Number of stories (default 10, max 30)", default: 10 } } },
  },
  {
    name: "get_best_stories",
    description: "Fetch best 10 Hacker News stories (all-time best). Uses HN Firebase API.",
    inputSchema: { type: "object", properties: { limit: { type: "number", default: 10 } } },
  },
  {
    name: "get_story",
    description: "Fetch a single HN story by its item ID, including the first 5 top-level comments. Uses HN Firebase API.",
    inputSchema: { type: "object", properties: { id: { type: "number", description: "HN item ID (e.g. 49977979)" } }, required: ["id"] },
  },
  {
    name: "search_stories",
    description: "Search Hacker News stories by keyword using the Algolia search API. Returns title, URL, points, author, and date for each result.",
    inputSchema: { type: "object", properties: { query: { type: "string", description: "Search query (e.g. 'AI agents', 'Rust', 'startup')" }, hits: { type: "number", default: 10, description: "Max results (max 50)" } }, required: ["query"] },
  },
  {
    name: "get_user",
    description: "Fetch a Hacker News user profile including karma score, about text, and submission count. Uses HN Firebase API.",
    inputSchema: { type: "object", properties: { username: { type: "string", description: "HN username (e.g. 'pg', 'dang')" } }, required: ["username"] },
  },
  {
    name: "get_new_stories",
    description: "Fetch the 10 newest Hacker News stories. Uses HN Firebase API.",
    inputSchema: { type: "object", properties: { limit: { type: "number", default: 10 } } },
  },
];

async function handleToolCall(name: string, args: any): Promise<any> {
  const limit = Math.min(args.limit || 10, 30);

  switch (name) {
    case "get_top_stories": {
      const cached = getCached("top");
      if (cached) return cached;
      const ids: number[] = await fetchJSON("https://hacker-news.firebaseio.com/v0/topstories.json");
      const top = ids.slice(0, limit);
      const stories = await Promise.all(top.map(id => fetchJSON(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)));
      const result = stories.map(s => ({ id: s.id, title: s.title, url: s.url || `https://news.ycombinator.com/item?id=${s.id}`, points: s.score, author: s.by, comments: s.descendants || 0, time: s.time }));
      setCached("top", result);
      return result;
    }

    case "get_best_stories": {
      const cached = getCached("best");
      if (cached) return cached;
      const ids: number[] = await fetchJSON("https://hacker-news.firebaseio.com/v0/beststories.json");
      const best = ids.slice(0, limit);
      const stories = await Promise.all(best.map(id => fetchJSON(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)));
      const result = stories.map(s => ({ id: s.id, title: s.title, url: s.url || `https://news.ycombinator.com/item?id=${s.id}`, points: s.score, author: s.by, comments: s.descendants || 0 }));
      setCached("best", result);
      return result;
    }

    case "get_story": {
      if (!args.id) throw new Error("Missing required param: id");
      const story = await fetchJSON(`https://hacker-news.firebaseio.com/v0/item/${args.id}.json`);
      if (!story) throw new Error(`Story ${args.id} not found`);
      let comments: any[] = [];
      if (story.kids && story.kids.length > 0) {
        const commentIds = story.kids.slice(0, 5);
        comments = await Promise.all(commentIds.map(id => fetchJSON(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)));
        comments = comments.filter(Boolean).map(c => ({ id: c.id, author: c.by, text: (c.text || "").replace(/<[^>]+>/g, "").slice(0, 300), points: c.points || 0 }));
      }
      return { id: story.id, title: story.title, url: story.url, text: (story.text || "").replace(/<[^>]+>/g, "").slice(0, 500), points: story.score, author: story.by, comments: story.descendants || 0, time: story.time, topComments: comments };
    }

    case "search_stories": {
      if (!args.query) throw new Error("Missing required param: query");
      const hits = Math.min(args.hits || 10, 50);
      const result = await fetchJSON(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(args.query)}&hitsPerPage=${hits}&tags=story`);
      return result.hits.map((h: any) => ({ id: h.objectID, title: h.title, url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`, points: h.points, author: h.author, date: h.created_at, comments: h.num_comments || 0 }));
    }

    case "get_user": {
      if (!args.username) throw new Error("Missing required param: username");
      const user = await fetchJSON(`https://hacker-news.firebaseio.com/v0/user/${args.username}.json`);
      if (!user) throw new Error(`User '${args.username}' not found`);
      return { username: user.id, karma: user.karma, about: (user.about || "").replace(/<[^>]+>/g, "").slice(0, 300), submissions: user.submitted ? user.submitted.length : 0, created: user.created };
    }

    case "get_new_stories": {
      const cached = getCached("new");
      if (cached) return cached;
      const ids: number[] = await fetchJSON("https://hacker-news.firebaseio.com/v0/newstories.json");
      const newest = ids.slice(0, limit);
      const stories = await Promise.all(newest.map(id => fetchJSON(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)));
      const result = stories.filter(Boolean).map(s => ({ id: s.id, title: s.title, url: s.url || `https://news.ycombinator.com/item?id=${s.id}`, points: s.score, author: s.by }));
      setCached("new", result);
      return result;
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// === JSON-RPC 2.0 SERVER ===

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }
  if (req.method === "GET") {
    res.writeHead(200);
    res.end(JSON.stringify({ name: "hn-mcp", version: "1.0.0", tools: tools.map(t => t.name), protocol: "jsonrpc-2.0" }));
    return;
  }
  if (req.method !== "POST") { res.writeHead(405); res.end(JSON.stringify({ error: "Method not allowed" })); return; }

  let body = "";
  for await (const chunk of req) body += chunk;

  let request: any;
  try { request = JSON.parse(body); }
  catch { res.writeHead(400); res.end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null })); return; }

  const { jsonrpc, id, method, params } = request;

  if (method === "initialize") {
    res.writeHead(200);
    res.end(JSON.stringify({
      jsonrpc: "2.0", id,
      result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "hn-mcp", version: "1.0.0", description: "Hacker News MCP — 6 tools: top stories, best stories, story detail, search, user profiles, new stories" } }
    }));
    return;
  }

  if (method === "tools/list") {
    res.writeHead(200);
    res.end(JSON.stringify({ jsonrpc: "2.0", id, result: { tools } }));
    return;
  }

  if (method === "tools/call") {
    const toolName = params?.name;
    const toolArgs = params?.arguments || {};
    try {
      const result = await handleToolCall(toolName, toolArgs);
      res.writeHead(200);
      res.end(JSON.stringify({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] } }));
    } catch (e: any) {
      res.writeHead(200);
      res.end(JSON.stringify({ jsonrpc: "2.0", id, error: { code: -32603, message: e.message } }));
    }
    return;
  }

  res.writeHead(200);
  res.end(JSON.stringify({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } }));
});

server.listen(PORT, () => {
  console.log(`[hn-mcp] Hacker News MCP server running on http://localhost:${PORT}`);
  console.log(`[hn-mcp] 6 tools: get_top_stories, get_best_stories, get_story, search_stories, get_user, get_new_stories`);
  console.log(`[hn-mcp] APIs: hn.algolia.com + hacker-news.firebaseio.com (free, no auth)`);
});
