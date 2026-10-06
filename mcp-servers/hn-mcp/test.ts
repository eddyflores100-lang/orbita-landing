#!/usr/bin/env npx tsx
// Test suite for Hacker News MCP Server
// Tests: initialize, tools/list, all 6 tools, error handling
// Run: npx tsx test.ts

import { createServer, IncomingMessage, ServerResponse } from "http";

const MCP_URL = "http://localhost:3101";

async function mcpCall(method: string, params?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ jsonrpc: "2.0", id: 1, method, params });
    const req = require("http").request(MCP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) },
    }, (res: IncomingMessage) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error(`JSON parse failed: ${e}`)); }
      });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<boolean>) {
  try {
    const ok = await fn();
    if (ok) { console.log(`  ✓ ${name}`); passed++; }
    else { console.log(`  ✗ ${name}`); failed++; }
  } catch (e: any) {
    console.log(`  ✗ ${name} — ERROR: ${e.message}`);
    failed++;
  }
}

async function run() {
  console.log("=== Hacker News MCP Test Suite ===\n");

  // Test 1: Initialize
  await test("initialize — returns protocolVersion + serverInfo", async () => {
    const r = await mcpCall("initialize");
    return r.result?.protocolVersion === "2024-11-05" && r.result?.serverInfo?.name === "hn-mcp";
  });

  // Test 2: tools/list
  await test("tools/list — returns 6 tools", async () => {
    const r = await mcpCall("tools/list");
    const tools = r.result?.tools || [];
    if (tools.length !== 6) return false;
    const names = tools.map((t: any) => t.name);
    return names.includes("get_top_stories") && names.includes("search_stories") && names.includes("get_user");
  });

  // Test 3: get_top_stories
  await test("get_top_stories — returns array of stories with titles", async () => {
    const r = await mcpCall("tools/call", { name: "get_top_stories", arguments: { limit: 3 } });
    const text = r.result?.content?.[0]?.text;
    if (!text) return false;
    const stories = JSON.parse(text);
    return Array.isArray(stories) && stories.length > 0 && stories[0].title && stories[0].points !== undefined;
  });

  // Test 4: get_best_stories
  await test("get_best_stories — returns array of best stories", async () => {
    const r = await mcpCall("tools/call", { name: "get_best_stories", arguments: { limit: 3 } });
    const text = r.result?.content?.[0]?.text;
    if (!text) return false;
    const stories = JSON.parse(text);
    return Array.isArray(stories) && stories.length > 0 && stories[0].title;
  });

  // Test 5: search_stories
  await test("search_stories — search for 'AI agents' returns results", async () => {
    const r = await mcpCall("tools/call", { name: "search_stories", arguments: { query: "AI agents", hits: 3 } });
    const text = r.result?.content?.[0]?.text;
    if (!text) return false;
    const results = JSON.parse(text);
    return Array.isArray(results) && results.length > 0 && results[0].title;
  });

  // Test 6: get_user
  await test("get_user — fetch 'pg' (Paul Graham) profile", async () => {
    const r = await mcpCall("tools/call", { name: "get_user", arguments: { username: "pg" } });
    const text = r.result?.content?.[0]?.text;
    if (!text) return false;
    const user = JSON.parse(text);
    return user.username === "pg" && user.karma > 0;
  });

  // Test 7: get_new_stories
  await test("get_new_stories — returns newest stories", async () => {
    const r = await mcpCall("tools/call", { name: "get_new_stories", arguments: { limit: 3 } });
    const text = r.result?.content?.[0]?.text;
    if (!text) return false;
    const stories = JSON.parse(text);
    return Array.isArray(stories) && stories.length > 0 && stories[0].title;
  });

  // Test 8: Error handling — missing required param
  await test("error handling — search without query returns error", async () => {
    const r = await mcpCall("tools/call", { name: "search_stories", arguments: {} });
    return r.error?.code === -32603 && r.error?.message?.includes("Missing required");
  });

  // Test 9: Error handling — unknown tool
  await test("error handling — unknown tool name returns error", async () => {
    const r = await mcpCall("tools/call", { name: "nonexistent_tool", arguments: {} });
    return r.error?.code === -32603;
  });

  // Test 10: get_story (using a known ID — item 1 is Y Combinator's first post)
  await test("get_story — fetch item ID 1 (Y Combinator)", async () => {
    const r = await mcpCall("tools/call", { name: "get_story", arguments: { id: 1 } });
    const text = r.result?.content?.[0]?.text;
    if (!text) return false;
    const story = JSON.parse(text);
    return story.title && story.id === 1;
  });

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
