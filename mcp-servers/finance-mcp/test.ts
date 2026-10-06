#!/usr/bin/env npx tsx
const MCP_URL = "http://localhost:3103";
async function mcpCall(method: string, params?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ jsonrpc: "2.0", id: 1, method, params });
    const req = require("http").request(MCP_URL, { method: "POST", headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) } }, (res: any) => {
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
  console.log("=== Finance/Crypto MCP Test Suite ===\n");
  await test("initialize", async () => { const r = await mcpCall("initialize"); return r.result?.serverInfo?.name === "finance-mcp"; });
  await test("tools/list — 6 tools", async () => { const r = await mcpCall("tools/list"); return (r.result?.tools || []).length === 6; });
  await test("get_exchange_rate — USD to MXN", async () => { const r = await mcpCall("tools/call", { name: "get_exchange_rate", arguments: { from: "USD", to: "MXN" } }); const t = r.result?.content?.[0]?.text; if (!t) return false; const d = JSON.parse(t); return d.rate > 10; });
  await test("get_exchange_rate — USD to COP (Colombia)", async () => { const r = await mcpCall("tools/call", { name: "get_exchange_rate", arguments: { from: "USD", to: "COP" } }); const t = r.result?.content?.[0]?.text; if (!t) return false; const d = JSON.parse(t); return d.rate > 1000; });
  await test("list_currencies — returns LATAM rates", async () => { const r = await mcpCall("tools/call", { name: "list_currencies", arguments: {} }); const t = r.result?.content?.[0]?.text; if (!t) return false; const d = JSON.parse(t); return d.length >= 10 && d.some((c: any) => c.code === "PEN"); });
  await test("get_crypto_price — bitcoin", async () => { const r = await mcpCall("tools/call", { name: "get_crypto_price", arguments: { coin: "bitcoin" } }); const t = r.result?.content?.[0]?.text; if (!t) return false; const d = JSON.parse(t); return d.price > 10000; });
  await test("get_crypto_list — top 5", async () => { const r = await mcpCall("tools/call", { name: "get_crypto_list", arguments: { limit: 5 } }); const t = r.result?.content?.[0]?.text; if (!t) return false; const d = JSON.parse(t); return d.length === 5 && d[0].symbol === "BTC"; });
  await test("convert_currency — 100 USD to MXN", async () => { const r = await mcpCall("tools/call", { name: "convert_currency", arguments: { amount: 100, from: "USD", to: "MXN" } }); const t = r.result?.content?.[0]?.text; if (!t) return false; const d = JSON.parse(t); return d.converted > 1000; });
  await test("error — missing params", async () => { const r = await mcpCall("tools/call", { name: "get_exchange_rate", arguments: {} }); return r.error?.code === -32603; });
  await test("error — unknown tool", async () => { const r = await mcpCall("tools/call", { name: "fake", arguments: {} }); return r.error?.code === -32603; });
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}
run();
