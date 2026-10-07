#!/usr/bin/env npx tsx
import { request } from "http";
const MCP_URL = "http://localhost:3102";
async function mcpCall(method: string, params?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ jsonrpc: "2.0", id: 1, method, params });
    const req = request(MCP_URL, { method: "POST", headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) } }, (res: any) => {
      let body = ""; res.on("data", (c: any) => (body += c)); res.on("end", () => { try { resolve(JSON.parse(body)); } catch (e) { reject(e); } });
    }); req.on("error", reject); req.write(data); req.end();
  });
}
let passed = 0, failed = 0;
async function test(name: string, fn: () => Promise<boolean>) {
  try { if (await fn()) { console.log(`  ✓ ${name}`); passed++; } else { console.log(`  ✗ ${name}`); failed++; } }
  catch (e: any) { console.log(`  ✗ ${name} — ${e.message}`); failed++; }
}
async function run() {
  console.log("=== GitHub Public MCP Test Suite ===\n");
  await test("initialize", async () => { const r = await mcpCall("initialize"); return r.result?.serverInfo?.name === "github-mcp"; });
  await test("tools/list — 6 tools", async () => { const r = await mcpCall("tools/list"); return (r.result?.tools || []).length === 6; });
  await test("search_repos — search 'mcp server'", async () => { const r = await mcpCall("tools/call", { name: "search_repos", arguments: { query: "mcp server", limit: 3 } }); const t = r.result?.content?.[0]?.text; return t && JSON.parse(t).length > 0; });
  await test("get_repo — vercel/next.js", async () => { const r = await mcpCall("tools/call", { name: "get_repo", arguments: { owner: "vercel", repo: "next.js" } }); const t = r.result?.content?.[0]?.text; if (!t) return false; const d = JSON.parse(t); return d.stars > 100000; });
  await test("get_issues — vercel/next.js open issues", async () => { const r = await mcpCall("tools/call", { name: "get_issues", arguments: { owner: "vercel", repo: "next.js", limit: 3 } }); const t = r.result?.content?.[0]?.text; return t && JSON.parse(t).length > 0; });
  await test("get_user — torvalds", async () => { const r = await mcpCall("tools/call", { name: "get_user", arguments: { username: "torvalds" } }); const t = r.result?.content?.[0]?.text; if (!t) return false; const u = JSON.parse(t); return u.followers > 100000; });
  await test("get_readme — vercel/next.js", async () => { const r = await mcpCall("tools/call", { name: "get_readme", arguments: { owner: "vercel", repo: "next.js" } }); const t = r.result?.content?.[0]?.text; if (!t) return false; const d = JSON.parse(t); return d.readme?.length > 100; });
  await test("error — missing params", async () => { const r = await mcpCall("tools/call", { name: "get_repo", arguments: {} }); return r.error?.code === -32603; });
  await test("error — unknown tool", async () => { const r = await mcpCall("tools/call", { name: "fake_tool", arguments: {} }); return r.error?.code === -32603; });
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}
run();
