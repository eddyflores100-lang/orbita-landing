// GitHub Public MCP — Cloudflare Workers edition
const cache = new Map<string, { data: any; ts: number }>();
const TTL = 300_000;
function getCached(k: string): any | null { const e = cache.get(k); if (e && Date.now() - e.ts < TTL) return e.data; cache.delete(k); return null; }
function setCached(k: string, d: any) { cache.set(k, { data: d, ts: Date.now() }); if (cache.size > 100) { const f = cache.keys().next().value; cache.delete(f); } }

async function fetchJSON(url: string): Promise<any> {
  const headers: any = { "User-Agent": "AliceLabs-GitHub-MCP/1.0", "Accept": "application/vnd.github+json" };
  if (typeof GITHUB_TOKEN !== "undefined" && GITHUB_TOKEN) headers["Authorization"] = `token ${GITHUB_TOKEN}`;
  const r = await fetch(url, { headers });
  return r.json();
}

const tools = [
  { name: "search_repos", description: "Search public GitHub repositories by keyword.", inputSchema: { type: "object", properties: { query: { type: "string" }, limit: { type: "number", default: 10 } }, required: ["query"] } },
  { name: "get_repo", description: "Get detailed info for a GitHub repository.", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" } }, required: ["owner", "repo"] } },
  { name: "get_issues", description: "List open issues for a GitHub repository.", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, limit: { type: "number", default: 10 } }, required: ["owner", "repo"] } },
  { name: "get_issue", description: "Get a single GitHub issue with body and labels.", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, number: { type: "number" } }, required: ["owner", "repo", "number"] } },
  { name: "get_readme", description: "Get the README content of a GitHub repository.", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" } }, required: ["owner", "repo"] } },
  { name: "get_user", description: "Get a GitHub user's public profile.", inputSchema: { type: "object", properties: { username: { type: "string" } }, required: ["username"] } },
];

async function handleToolCall(name: string, args: any): Promise<any> {
  const limit = Math.min(args.limit || 10, 30);
  switch (name) {
    case "search_repos": { if (!args.query) throw new Error("Missing: query"); const r = await fetchJSON(`https://api.github.com/search/repositories?q=${encodeURIComponent(args.query)}&per_page=${limit}&sort=stars&order=desc`); return (r.items || []).map((x: any) => ({ name: x.full_name, description: x.description, stars: x.stargazers_count, language: x.language, url: x.html_url })); }
    case "get_repo": { if (!args.owner || !args.repo) throw new Error("Missing: owner, repo"); const c = getCached(`r:${args.owner}/${args.repo}`); if (c) return c; const r = await fetchJSON(`https://api.github.com/repos/${args.owner}/${args.repo}`); const d = { name: r.full_name, description: r.description, stars: r.stargazers_count, forks: r.forks_count, open_issues: r.open_issues_count, language: r.language, license: r.license?.spdx_id, homepage: r.homepage, topics: r.topics }; setCached(`r:${args.owner}/${args.repo}`, d); return d; }
    case "get_issues": { if (!args.owner || !args.repo) throw new Error("Missing: owner, repo"); const r = await fetchJSON(`https://api.github.com/repos/${args.owner}/${args.repo}/issues?state=open&per_page=${limit}`); return r.map((i: any) => ({ number: i.number, title: i.title, author: i.user?.login, labels: i.labels?.map((l: any) => l.name), comments: i.comments })); }
    case "get_issue": { if (!args.owner || !args.repo || !args.number) throw new Error("Missing: owner, repo, number"); const i = await fetchJSON(`https://api.github.com/repos/${args.owner}/${args.repo}/issues/${args.number}`); if (i.message) throw new Error(i.message); return { number: i.number, title: i.title, state: i.state, body: (i.body || "").slice(0, 1000), author: i.user?.login, labels: i.labels?.map((l: any) => l.name), comments: i.comments }; }
    case "get_readme": { if (!args.owner || !args.repo) throw new Error("Missing: owner, repo"); const r = await fetchJSON(`https://api.github.com/repos/${args.owner}/${args.repo}/readme`); if (r.message) throw new Error(r.message); const content = atob(r.content || "").replace(/<[^>]+>/g, "").slice(0, 2000); return { repo: `${args.owner}/${args.repo}`, readme: content }; }
    case "get_user": { if (!args.username) throw new Error("Missing: username"); const u = await fetchJSON(`https://api.github.com/users/${args.username}`); if (u.message) throw new Error(u.message); return { username: u.login, name: u.name, bio: u.bio, followers: u.followers, following: u.following, public_repos: u.public_repos, company: u.company, location: u.location }; }
    default: throw new Error(`Unknown: ${name}`);
  }
}

function json(data: any, status = 200): Response { return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } }); }

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
    if (request.method === "GET") return json({ name: "github-mcp", version: "1.0.0", tools: tools.map(t => t.name) });
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
    let req: any; try { req = await request.json(); } catch { return json({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null }, 400); }
    const { jsonrpc, id, method, params } = req;
    if (method === "initialize") return json({ jsonrpc: "2.0", id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "github-mcp", version: "1.0.0", description: "GitHub Public MCP — 6 tools" } } });
    if (method === "tools/list") return json({ jsonrpc: "2.0", id, result: { tools } });
    if (method === "tools/call") { try { const result = await handleToolCall(params?.name, params?.arguments || {}); return json({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] } }); } catch (e: any) { return json({ jsonrpc: "2.0", id, error: { code: -32603, message: e.message } }); } }
    return json({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } });
  }
};
