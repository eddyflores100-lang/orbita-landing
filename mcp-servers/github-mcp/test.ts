/**
 * GitHub Public MCP -- end-to-end test suite.
 *
 * Strategy:
 *  1. Spawn the server in TCP mode on an ephemeral port.
 *  2. Connect a raw TCP socket speaking newline-delimited JSON-RPC 2.0.
 *  3. Verify initialize, tools/list, each tool call, and error paths.
 *  4. The GitHub anonymous API is rate-limited (60/hour) and is shared across
 *     sandbox tenants, so API-dependent tool calls retry with backoff when a
 *     "rate limit" error is returned. Protocol tests always run.
 *  5. Tear down the server and report a pass/fail summary.
 *
 * No external test framework -- just plain TypeScript + Node built-ins so the
 * suite runs with zero dependencies via `bun test.ts` or `npx tsx test.ts`.
 */

import * as net from 'net';
import { spawn, type ChildProcess } from 'child_process';
import * as path from 'path';

interface JsonRpcResponse {
  jsonrpc: string;
  id: number | string | null;
  result?: any;
  error?: { code: number; message: string; data?: unknown };
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

class McpTcpClient {
  private socket: net.Socket;
  private buffer = '';
  private pending = new Map<number, { resolve: (v: JsonRpcResponse) => void; reject: (e: Error) => void }>();
  private nextId = 1;

  constructor(port: number) {
    this.socket = net.connect(port, '127.0.0.1');
    this.socket.setEncoding('utf8');
    this.socket.on('data', (chunk: string) => {
      this.buffer += chunk;
      let idx: number;
      while ((idx = this.buffer.indexOf('\n')) >= 0) {
        const line = this.buffer.slice(0, idx);
        this.buffer = this.buffer.slice(idx + 1);
        const trimmed = line.trim();
        if (!trimmed) continue;
        let msg: JsonRpcResponse;
        try {
          msg = JSON.parse(trimmed);
        } catch {
          continue;
        }
        const id = typeof msg.id === 'number' ? msg.id : null;
        if (id === null) continue;
        const entry = this.pending.get(id);
        if (entry) {
          this.pending.delete(id);
          entry.resolve(msg);
        }
      }
    });
  }

  call(method: string, params?: Record<string, unknown>, timeoutMs = 60000): Promise<JsonRpcResponse> {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Timeout waiting for response to ${method} (id=${id})`));
      }, timeoutMs);
      this.pending.set(id, {
        resolve: (v) => {
          clearTimeout(timer);
          resolve(v);
        },
        reject: (e) => {
          clearTimeout(timer);
          reject(e);
        },
      });
      this.socket.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    });
  }

  close(): void {
    this.socket.end();
  }
}

function startServer(port: number): Promise<{ proc: ChildProcess; port: number }> {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(new URL(import.meta.url).pathname);
    const runner = process.env.MCP_TEST_RUNNER || 'bun';
    const args = ['index.ts', String(port)];
    const proc = spawn(runner, args, { cwd: dir, env: process.env });
    let resolved = false;
    proc.stdout.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      const m = text.match(/LISTENING (\d+)/);
      if (m && !resolved) {
        resolved = true;
        resolve({ proc, port: parseInt(m[1], 10) });
      }
    });
    proc.stderr.on('data', (chunk: Buffer) => {
      process.stderr.write(`[server stderr] ${chunk.toString()}`);
    });
    proc.on('error', (err) => {
      if (!resolved) reject(err);
    });
    proc.on('exit', (code) => {
      if (!resolved) reject(new Error(`Server exited early with code ${code}`));
    });
    setTimeout(() => {
      if (!resolved) reject(new Error('Server did not report LISTENING within 15s'));
    }, 15000);
  });
}

/* ------------------------------------------------------------------ *
 * Assertion helpers
 * ------------------------------------------------------------------ */

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assert(condition: boolean, message: string): void {
  if (condition) {
    passed++;
    console.log(`  PASS: ${message}`);
  } else {
    failed++;
    failures.push(message);
    console.error(`  FAIL: ${message}`);
  }
}

function extractText(result: any): string {
  const content = result?.content;
  if (Array.isArray(content) && content.length > 0 && typeof content[0].text === 'string') {
    return content[0].text;
  }
  return '';
}

function parseResultText(result: any): any {
  const text = extractText(result);
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function isRateLimited(result: any): boolean {
  if (result?.isError !== true) return false;
  const text = extractText(result) || '';
  return /rate limit/i.test(text);
}

/**
 * Call a tool, retrying with backoff when GitHub returns a rate-limit error.
 * The GitHub anonymous quota resets every hour; this loop patiently waits for
 * an available window on shared infrastructure.
 */
async function callToolWithRetry(
  client: McpTcpClient,
  name: string,
  args: Record<string, unknown>,
  label: string,
  opts: { maxAttempts?: number; waitMs?: number; timeoutMs?: number } = {},
): Promise<JsonRpcResponse> {
  const maxAttempts = opts.maxAttempts ?? 30;
  const waitMs = opts.waitMs ?? 20000;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await client.call('tools/call', { name, arguments: args }, opts.timeoutMs ?? 60000);
    if (res.error) {
      throw new Error(`Tool ${name} returned JSON-RPC error: ${res.error.message}`);
    }
    if (isRateLimited(res.result)) {
      if (attempt === maxAttempts) {
        return res;
      }
      console.log(`     [${label} attempt ${attempt}/${maxAttempts}] rate-limited, waiting ${waitMs / 1000}s...`);
      await sleep(waitMs);
      continue;
    }
    return res;
  }
  // Unreachable, but keeps TS happy.
  throw new Error('Exhausted retries');
}

/* ------------------------------------------------------------------ *
 * Test sequence
 * ------------------------------------------------------------------ */

async function run(): Promise<number> {
  console.log('\n=== GitHub Public MCP test suite ===\n');

  let serverInfo: { proc: ChildProcess; port: number } | undefined;
  try {
    console.log('1. Starting server on ephemeral port...');
    serverInfo = await startServer(0);
    assert(true, `Server started on port ${serverInfo.port}`);
  } catch (e) {
    console.error('Could not start server:', e);
    return 1;
  }

  const client = new McpTcpClient(serverInfo.port);
  await sleep(200);

  try {
    // 2. initialize
    console.log('\n2. Sending initialize request...');
    {
      const res = await client.call('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'github-mcp-test', version: '1.0.0' },
      });
      assert(!res.error, 'initialize returned no error');
      const info = res.result;
      assert(info?.protocolVersion === '2024-11-05', `protocolVersion is 2024-11-05 (got ${info?.protocolVersion})`);
      assert(info?.serverInfo?.name === 'github-mcp', `serverInfo.name is github-mcp (got ${info?.serverInfo?.name})`);
      assert(typeof info?.serverInfo?.version === 'string', 'serverInfo.version is a string');
      assert(info?.capabilities?.tools !== undefined, 'capabilities.tools present');
    }

    // 3. tools/list
    console.log('\n3. Sending tools/list...');
    const expectedTools = [
      'search_repos',
      'get_repo',
      'get_issues',
      'get_issue',
      'get_readme',
      'get_user',
    ];
    {
      const res = await client.call('tools/list');
      assert(!res.error, 'tools/list returned no error');
      const tools = res.result?.tools;
      assert(Array.isArray(tools), 'tools/list returns an array');
      assert(tools?.length === 6, `tools/list returns exactly 6 tools (got ${tools?.length})`);
      const names = (tools || []).map((t: any) => t.name);
      for (const expected of expectedTools) {
        assert(names.includes(expected), `tool "${expected}" is listed`);
      }
      for (const t of tools || []) {
        assert(typeof t.description === 'string' && t.description.length > 10, `tool "${t.name}" has a description`);
        assert(t.inputSchema?.type === 'object', `tool "${t.name}" has object inputSchema`);
      }
    }

    // 4. get_repo (vercel/next.js) -- required to return stars > 0
    console.log('\n4. Calling get_repo (vercel/next.js)...');
    let repoStars = 0;
    {
      const res = await callToolWithRetry(
        client,
        'get_repo',
        { owner: 'vercel', repo: 'next.js' },
        'get_repo',
        { maxAttempts: 35, waitMs: 20000, timeoutMs: 60000 },
      );
      assert(res.result?.isError !== true, 'get_repo is not an error result');
      const repo = parseResultText(res.result);
      if (res.result?.isError) {
        assert(false, `get_repo succeeded (got error: ${extractText(res.result).substring(0, 120)})`);
      } else {
        assert(repo?.fullName === 'vercel/next.js', `get_repo returns fullName vercel/next.js (got ${repo?.fullName})`);
        assert(typeof repo?.stars === 'number', 'get_repo returns numeric stars');
        repoStars = repo?.stars ?? 0;
        assert(repoStars > 0, `get_repo stars > 0 (got ${repoStars})`);
        assert(typeof repo?.description === 'string', 'get_repo returns description');
        console.log(`     vercel/next.js stars: ${repoStars}`);
      }
    }

    // 5. get_user (vercel)
    console.log('\n5. Calling get_user (vercel)...');
    {
      const res = await callToolWithRetry(
        client,
        'get_user',
        { username: 'vercel' },
        'get_user',
        { maxAttempts: 15, waitMs: 15000 },
      );
      assert(res.result?.isError !== true, 'get_user is not an error result');
      const user = parseResultText(res.result);
      if (!res.result?.isError) {
        assert(user?.login === 'vercel', `get_user returns login vercel (got ${user?.login})`);
        assert(typeof user?.publicRepos === 'number', 'get_user returns numeric publicRepos');
        assert(user?.publicRepos > 0, `get_user publicRepos > 0 (got ${user?.publicRepos})`);
        console.log(`     vercel public repos: ${user?.publicRepos}`);
      }
    }

    // 6. search_repos
    console.log('\n6. Calling search_repos...');
    {
      const res = await callToolWithRetry(
        client,
        'search_repos',
        { query: 'nextjs', perPage: 5 },
        'search_repos',
        { maxAttempts: 15, waitMs: 15000 },
      );
      assert(res.result?.isError !== true, 'search_repos is not an error result');
      const data = parseResultText(res.result);
      if (!res.result?.isError) {
        assert(Array.isArray(data?.items), 'search_repos returns items array');
        assert(data?.items.length > 0, `search_repos returns at least 1 item (got ${data?.items?.length})`);
        if (data?.items.length > 0) {
          const r = data.items[0];
          assert(typeof r.fullName === 'string', 'first repo has fullName');
          assert(typeof r.stars === 'number', 'first repo has stars');
          console.log(`     first result: ${r.fullName} (${r.stars} stars)`);
        }
      }
    }

    // 7. get_issues
    console.log('\n7. Calling get_issues (vercel/next.js)...');
    {
      const res = await callToolWithRetry(
        client,
        'get_issues',
        { owner: 'vercel', repo: 'next.js', limit: 5 },
        'get_issues',
        { maxAttempts: 15, waitMs: 15000 },
      );
      assert(res.result?.isError !== true, 'get_issues is not an error result');
      const issues = parseResultText(res.result);
      if (!res.result?.isError) {
        assert(Array.isArray(issues), 'get_issues returns an array');
        if (issues.length > 0) {
          const i = issues[0];
          assert(typeof i.number === 'number', 'first issue has number');
          assert(typeof i.title === 'string', 'first issue has title');
          console.log(`     first open issue: #${i.number} "${i.title.substring(0, 60)}"`);
        }
      }
    }

    // 8. get_readme
    console.log('\n8. Calling get_readme (vercel/next.js)...');
    {
      const res = await callToolWithRetry(
        client,
        'get_readme',
        { owner: 'vercel', repo: 'next.js' },
        'get_readme',
        { maxAttempts: 15, waitMs: 15000 },
      );
      assert(res.result?.isError !== true, 'get_readme is not an error result');
      const readme = parseResultText(res.result);
      if (!res.result?.isError) {
        assert(typeof readme?.content === 'string', 'get_readme returns content string');
        assert(readme?.content.length > 0, `get_readme content is non-empty (got ${readme?.content?.length} chars)`);
        console.log(`     readme size: ${readme?.content?.length} chars`);
      }
    }

    // 9. get_issue -- pick the first issue from step 7 if available
    console.log('\n9. Calling get_issue...');
    {
      const issuesRes = await client.call('tools/call', { name: 'get_issues', arguments: { owner: 'vercel', repo: 'next.js', limit: 3 } });
      const issues = parseResultText(issuesRes.result);
      const issueNumber = Array.isArray(issues) && issues.length > 0 ? issues[0].number : 1;
      const res = await callToolWithRetry(
        client,
        'get_issue',
        { owner: 'vercel', repo: 'next.js', number: issueNumber },
        'get_issue',
        { maxAttempts: 15, waitMs: 15000 },
      );
      assert(res.result?.isError !== true, 'get_issue is not an error result');
      const issue = parseResultText(res.result);
      if (!res.result?.isError) {
        assert(issue?.number === issueNumber, `get_issue returns number ${issueNumber}`);
        assert(typeof issue?.title === 'string', 'get_issue returns title');
        console.log(`     issue #${issue?.number}: ${issue?.title}`);
      }
    }

    // 10. Error handling: missing required param
    console.log('\n10. Testing error handling (missing required param)...');
    {
      const res = await client.call('tools/call', { name: 'get_repo', arguments: { owner: 'vercel' } });
      assert(!!res.error, 'get_repo without repo returns an error');
      assert(res.error?.code === -32602, `error code is -32602 (got ${res.error?.code})`);
      console.log(`     error: ${res.error?.message}`);
    }

    // 11. Error handling: unknown tool
    console.log('\n11. Testing error handling (unknown tool)...');
    {
      const res = await client.call('tools/call', { name: 'does_not_exist', arguments: {} });
      assert(!!res.error, 'unknown tool returns an error');
      assert(res.error?.code === -32601, `error code is -32601 (got ${res.error?.code})`);
    }

    // 12. Error handling: invalid owner (injection attempt)
    console.log('\n12. Testing error handling (invalid owner characters)...');
    {
      const res = await client.call('tools/call', { name: 'get_repo', arguments: { owner: 'a/b?c', repo: 'x' } });
      assert(res.result?.isError === true, 'invalid owner returns isError result');
      const text = extractText(res.result).toLowerCase();
      assert(text.includes('invalid') || text.includes('error'), 'error mentions invalid characters');
    }

    // 13. Error handling: unknown repo
    console.log('\n13. Testing error handling (unknown repo)...');
    {
      const res = await callToolWithRetry(
        client,
        'get_repo',
        { owner: 'vercel', repo: 'this-repo-does-not-exist-xyzzy-98765' },
        'get_repo(unknown)',
        { maxAttempts: 8, waitMs: 12000 },
      );
      assert(res.result?.isError === true, 'unknown repo returns isError result');
    }

    // 14. Method not found
    console.log('\n14. Testing method not found...');
    {
      const res = await client.call('some/random/method');
      assert(!!res.error, 'unknown method returns error');
      assert(res.error?.code === -32601, `error code is -32601 (got ${res.error?.code})`);
    }
  } finally {
    client.close();
    if (serverInfo?.proc) {
      serverInfo.proc.kill('SIGTERM');
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  if (failures.length > 0) {
    console.log('\nFailures:');
    for (const f of failures) console.log(`  - ${f}`);
  }
  return failed === 0 ? 0 : 1;
}

run()
  .then((code) => {
    process.exit(code);
  })
  .catch((err) => {
    console.error('Test runner crashed:', err);
    process.exit(1);
  });
