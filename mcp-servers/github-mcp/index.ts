#!/usr/bin/env npx tsx
// GitHub Public MCP Server — 6 tools, JSON-RPC 2.0
// API: api.github.com (free for public data, 60 req/hour anonymous)
// No external deps, Node.js built-in http only

import { createServer, IncomingMessage, ServerResponse } from "http";

const PORT = parseInt(process.env.PORT || "3102", 10);
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL_5MIN = 300_000;
const CACHE_TTL_1MIN = 60_000;

function getCached(key: string): any | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL_5MIN) return entry.data;
  cache.delete(key);
  return null;
}

function setCached(key: string, data: any, ttl = CACHE_TTL_5MIN) {
  cache.set(key, { data, ts: Date.now() });
  if (cache.size > 100) { const firstKey = cache.keys().next().value; cache.delete(firstKey); }
}

async function fetchJSON(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const mod = require("https");
    mod.get(url, {
      headers: {
        "User-Agent": "AliceLabs-GitHub-MCP/1.0",
        "Accept": "application/vnd.github+json",
        ...(process.env.GITHUB_TOKEN ? { "Authorization": `token ${process.env.GITHUB_TOKEN}` } : {}),
      },
    }, (res: IncomingMessage) => {
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

const tools = [
  {
    name: "search_repos",
    description: "Search public GitHub repositories by keyword. Returns name, description, stars, language, and URL for each result.",
    inputSchema: { type: "object", properties: { query: { type: "string", description: "Search query (e.g. 'next.js', 'mcp server')" }, limit: { type: "number", default: 10, description: "Max results (max 30)" } }, required: ["query"] },
  },
  {
    name: "get_repo",
    description: "Get detailed info for a GitHub repository: stars, forks, open issues, description, language, license, homepage.",
    inputSchema: { type: "object", properties: { owner: { type: "string", description: "Repo owner (e.g. 'vercel')" }, repo: { type: "string", description: "Repo name (e.g. 'next.js')" } }, required: ["owner", "repo"] },
  },
  {
    name: "get_issues",
    description: "List open issues for a GitHub repository. Returns title, number, author, labels, and created date.",
    inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, limit: { type: "number", default: 10, description: "Max issues (max 30)" } }, required: ["owner", "repo"] },
  },
  {
    name: "get_issue",
    description: "Get a single GitHub issue with body, comments count, labels, assignees, and state.",
    inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, number: { type: "number", description: "Issue number" } }, required: ["owner", "repo", "number"] },
  },
  {
    name: "get_readme",
    description: "Get the README content of a GitHub repository as plain text (HTML tags stripped).",
    inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" } }, required: ["owner", "repo"] },
  },
  {
    name: "get_user",
    description: "Get a GitHub user's public profile: name, bio, followers, following, public repos, and company.",
    inputSchema: { type: "object", properties: { username: { type: "string", description: "GitHub username (e.g. 'torvalds')" } }, required: ["username"] },
  },
];

async function handleToolCall(name: string, args: any): Promise<any> {
  const limit = Math.min(args.limit || 10, 30);

  switch (name) {
    case "search_repos": {
      if (!args.query) throw new Error("Missing required param: query");
      const result = await fetchJSON(`https://api.github.com/search/repositories?q=${encodeURIComponent(args.query)}&per_page=${limit}&sort=stars&order=desc`);
      return (result.items || []).map((r: any) => ({ name: r.full_name, description: r.description, stars: r.stargazers_count, language: r.language, url: r.html_url, forks: r.forks_count }));
    }

    case "get_repo": {
      if (!args.owner || !args.repo) throw new Error("Missing required params: owner, repo");
      const cacheKey = `repo:${args.owner}/${args.repo}`;
      const cached = getCached(cacheKey);
      if (cached) return cached;
      const r = await fetchJSON(`https://api.github.com/repos/${args.owner}/${args.repo}`);
      const result = { name: r.full_name, description: r.description, stars: r.stargazers_count, forks: r.forks_count, open_issues: r.open_issues_count, language: r.language, license: r.license?.spdx_id, homepage: r.homepage, created: r.created_at, updated: r.updated_at, topics: r.topics };
      setCached(cacheKey, result);
      return result;
    }

    case "get_issues": {
      if (!args.owner || !args.repo) throw new Error("Missing required params: owner, repo");
      const result = await fetchJSON(`https://api.github.com/repos/${args.owner}/${args.repo}/issues?state=open&per_page=${limit}`);
      return result.map((i: any) => ({ number: i.number, title: i.title, author: i.user?.login, labels: i.labels?.map((l: any) => l.name), created: i.created_at, comments: i.comments }));
    }

    case "get_issue": {
      if (!args.owner || !args.repo || !args.number) throw new Error("Missing required params: owner, repo, number");
      const i = await fetchJSON(`https://api.github.com/repos/${args.owner}/${args.repo}/issues/${args.number}`);
      if (i.message) throw new Error(i.message);
      return { number: i.number, title: i.title, state: i.state, body: (i.body || "").slice(0, 1000), author: i.user?.login, labels: i.labels?.map((l: any) => l.name), assignees: i.assignees?.map((a: any) => a.login), comments: i.comments, created: i.created_at, closed: i.closed_at };
    }

    case "get_readme": {
      if (!args.owner || !args.repo) throw new Error("Missing required params: owner, repo");
      const r = await fetchJSON(`https://api.github.com/repos/${args.owner}/${args.repo}/readme`);
      if (r.message) throw new Error(r.message);
      const content = Buffer.from(r.content || "", "base64").toString("utf-8").replace(/<[^>]+>/g, "").slice(0, 2000);
      return { repo: `${args.owner}/${args.repo}`, readme: content };
    }

    case "get_user": {
      if (!args.username) throw new Error("Missing required param: username");
      const u = await fetchJSON(`https://api.github.com/users/${args.username}`);
      if (u.message) throw new Error(u.message);
      return { username: u.login, name: u.name, bio: u.bio, followers: u.followers, following: u.following, public_repos: u.public_repos, company: u.company, location: u.location, blog: u.blog, created: u.created_at };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// JSON-RPC 2.0 server (same pattern as HN MCP)
const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }
  if (req.method === "GET") { res.writeHead(200); res.end(JSON.stringify({ name: "github-mcp", version: "1.0.0", tools: tools.map(t => t.name), protocol: "jsonrpc-2.0" })); return; }
  if (req.method !== "POST") { res.writeHead(405); res.end(JSON.stringify({ error: "Method not allowed" })); return; }

  let body = "";
  for await (const chunk of req) body += chunk;

  let request: any;
  try { request = JSON.parse(body); }
  catch { res.writeHead(400); res.end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null })); return; }

  const { jsonrpc, id, method, params } = request;

  if (method === "initialize") {
    res.writeHead(200);
    res.end(JSON.stringify({ jsonrpc: "2.0", id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "github-mcp", version: "1.0.0", description: "GitHub Public MCP — 6 tools: search repos, get repo, get issues, get issue, get readme, get user" } } }));
    return;
  }

  if (method === "tools/list") {
    res.writeHead(200);
    res.end(JSON.stringify({ jsonrpc: "2.0", id, result: { tools } }));
    return;
  }

  if (method === "tools/call") {
    try {
      const result = await handleToolCall(params?.name, params?.arguments || {});
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
  console.log(`[github-mcp] GitHub Public MCP server running on http://localhost:${PORT}`);
  console.log(`[github-mcp] 6 tools: search_repos, get_repo, get_issues, get_issue, get_readme, get_user`);
  console.log(`[github-mcp] API: api.github.com (free, 60 req/hr anonymous, 5000/hr with GITHUB_TOKEN)`);
});
