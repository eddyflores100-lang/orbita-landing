/**
 * Finance (Currency & Crypto) MCP -- end-to-end test suite.
 *
 * Strategy:
 *  1. Spawn the server in TCP mode on an ephemeral port.
 *  2. Connect a raw TCP socket speaking newline-delimited JSON-RPC 2.0.
 *  3. Verify initialize, tools/list, each tool call, and error paths.
 *  4. CoinGecko's free tier occasionally returns HTTP 429; crypto tool
 *     calls retry with backoff when a rate-limit error is returned.
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
  return /rate limit|429|too many requests/i.test(text);
}

async function callToolWithRetry(
  client: McpTcpClient,
  name: string,
  args: Record<string, unknown>,
  label: string,
  opts: { maxAttempts?: number; waitMs?: number; timeoutMs?: number } = {},
): Promise<JsonRpcResponse> {
  const maxAttempts = opts.maxAttempts ?? 12;
  const waitMs = opts.waitMs ?? 15000;
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
  throw new Error('Exhausted retries');
}

/* ------------------------------------------------------------------ *
 * Test sequence
 * ------------------------------------------------------------------ */

async function run(): Promise<number> {
  console.log('\n=== Finance (Currency & Crypto) MCP test suite ===\n');

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
        clientInfo: { name: 'finance-mcp-test', version: '1.0.0' },
      });
      assert(!res.error, 'initialize returned no error');
      const info = res.result;
      assert(info?.protocolVersion === '2024-11-05', `protocolVersion is 2024-11-05 (got ${info?.protocolVersion})`);
      assert(info?.serverInfo?.name === 'finance-mcp', `serverInfo.name is finance-mcp (got ${info?.serverInfo?.name})`);
      assert(typeof info?.serverInfo?.version === 'string', 'serverInfo.version is a string');
      assert(info?.capabilities?.tools !== undefined, 'capabilities.tools present');
    }

    // 3. tools/list
    console.log('\n3. Sending tools/list...');
    const expectedTools = [
      'get_exchange_rate',
      'list_currencies',
      'get_crypto_price',
      'get_crypto_list',
      'convert_currency',
      'get_historical_rate',
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

    // 4. get_exchange_rate USD -> EUR (required to be > 0)
    console.log('\n4. Calling get_exchange_rate (USD -> EUR)...');
    {
      const res = await callToolWithRetry(
        client,
        'get_exchange_rate',
        { base: 'USD', target: 'EUR' },
        'get_exchange_rate',
        { maxAttempts: 8, waitMs: 12000 },
      );
      assert(res.result?.isError !== true, 'get_exchange_rate is not an error result');
      const data = parseResultText(res.result);
      assert(data?.base === 'USD', `get_exchange_rate base is USD (got ${data?.base})`);
      assert(data?.target === 'EUR', `get_exchange_rate target is EUR (got ${data?.target})`);
      assert(typeof data?.rate === 'number', 'get_exchange_rate returns numeric rate');
      assert(data?.rate > 0, `get_exchange_rate rate > 0 (got ${data?.rate})`);
      console.log(`     1 USD = ${data?.rate} EUR`);
    }

    // 5. list_currencies (must include LATAM currencies)
    console.log('\n5. Calling list_currencies...');
    {
      const res = await callToolWithRetry(
        client,
        'list_currencies',
        {},
        'list_currencies',
        { maxAttempts: 6, waitMs: 10000 },
      );
      assert(res.result?.isError !== true, 'list_currencies is not an error result');
      const data = parseResultText(res.result);
      assert(typeof data?.count === 'number' && data.count > 50, `list_currencies returns >50 currencies (got ${data?.count})`);
      const codes = (data?.currencies || []).map((c: any) => c.code);
      const latam = ['USD', 'EUR', 'MXN', 'COP', 'PEN', 'CLP', 'ARS', 'BRL', 'CUP'];
      for (const code of latam) {
        assert(codes.includes(code), `LATAM currency ${code} is present in list`);
      }
      console.log(`     ${data?.count} currencies; CUP rate: ${(data?.currencies || []).find((c: any) => c.code === 'CUP')?.ratePerUsd}`);
    }

    // 6. get_crypto_price bitcoin
    console.log('\n6. Calling get_crypto_price (bitcoin)...');
    {
      const res = await callToolWithRetry(
        client,
        'get_crypto_price',
        { id: 'bitcoin', vs: 'usd' },
        'get_crypto_price',
        { maxAttempts: 12, waitMs: 15000 },
      );
      assert(res.result?.isError !== true, 'get_crypto_price is not an error result');
      const data = parseResultText(res.result);
      assert(data?.id === 'bitcoin', `get_crypto_price id is bitcoin (got ${data?.id})`);
      assert(typeof data?.price === 'number', 'get_crypto_price returns numeric price');
      assert(data?.price > 0, `get_crypto_price price > 0 (got ${data?.price})`);
      console.log(`     bitcoin price: $${data?.price}`);
    }

    // 7. get_crypto_list (top 100)
    console.log('\n7. Calling get_crypto_list (top 100)...');
    {
      const res = await callToolWithRetry(
        client,
        'get_crypto_list',
        {},
        'get_crypto_list',
        { maxAttempts: 12, waitMs: 15000 },
      );
      assert(res.result?.isError !== true, 'get_crypto_list is not an error result');
      const data = parseResultText(res.result);
      assert(typeof data?.count === 'number', 'get_crypto_list returns count');
      assert(data?.count >= 50, `get_crypto_list returns >=50 coins (got ${data?.count})`);
      assert(Array.isArray(data?.coins) && data.coins.length > 0, 'get_crypto_list returns coins array');
      if (data?.coins?.length > 0) {
        const c = data.coins[0];
        assert(typeof c.id === 'string', 'first coin has id');
        assert(typeof c.price === 'number', 'first coin has numeric price');
        console.log(`     #1 ${c.name} (${c.symbol}) $${c.price}`);
      }
    }

    // 8. convert_currency 100 USD -> MXN
    console.log('\n8. Calling convert_currency (100 USD -> MXN)...');
    {
      const res = await callToolWithRetry(
        client,
        'convert_currency',
        { amount: 100, from: 'USD', to: 'MXN' },
        'convert_currency',
        { maxAttempts: 6, waitMs: 10000 },
      );
      assert(res.result?.isError !== true, 'convert_currency is not an error result');
      const data = parseResultText(res.result);
      assert(data?.from === 'USD' && data?.to === 'MXN', 'convert_currency echoes currencies');
      assert(typeof data?.converted === 'number', 'convert_currency returns numeric converted');
      assert(data?.converted > 100, `convert_currency 100 USD -> MXN > 100 (got ${data?.converted})`);
      console.log(`     100 USD = ${data?.converted?.toFixed(2)} MXN`);
    }

    // 9. get_historical_rate USD -> EUR for a fixed past date
    console.log('\n9. Calling get_historical_rate (2024-01-15 USD -> EUR)...');
    {
      const res = await callToolWithRetry(
        client,
        'get_historical_rate',
        { date: '2024-01-15', base: 'USD', target: 'EUR' },
        'get_historical_rate',
        { maxAttempts: 6, waitMs: 10000 },
      );
      assert(res.result?.isError !== true, 'get_historical_rate is not an error result');
      const data = parseResultText(res.result);
      assert(data?.date === '2024-01-15', `get_historical_rate echoes date (got ${data?.date})`);
      assert(typeof data?.rate === 'number', 'get_historical_rate returns numeric rate');
      assert(data?.rate > 0, `get_historical_rate rate > 0 (got ${data?.rate})`);
      console.log(`     2024-01-15: 1 USD = ${data?.rate} EUR`);
    }

    // 10. Error handling: missing required param
    console.log('\n10. Testing error handling (missing required param)...');
    {
      const res = await client.call('tools/call', { name: 'get_exchange_rate', arguments: { base: 'USD' } });
      assert(!!res.error, 'get_exchange_rate without target returns an error');
      assert(res.error?.code === -32602, `error code is -32602 (got ${res.error?.code})`);
      console.log(`     error: ${res.error?.message}`);
    }

    // 11. Error handling: invalid currency code
    console.log('\n11. Testing error handling (invalid currency code)...');
    {
      const res = await client.call('tools/call', { name: 'get_exchange_rate', arguments: { base: 'US', target: 'EUR' } });
      assert(res.result?.isError === true, 'invalid currency code returns isError result');
      const text = extractText(res.result).toLowerCase();
      assert(text.includes('3-letter') || text.includes('iso'), 'error mentions ISO/3-letter requirement');
    }

    // 12. Error handling: invalid amount
    console.log('\n12. Testing error handling (invalid amount)...');
    {
      const res = await client.call('tools/call', { name: 'convert_currency', arguments: { amount: 'not-a-number', from: 'USD', to: 'EUR' } });
      assert(res.result?.isError === true, 'invalid amount returns isError result');
    }

    // 13. Error handling: future date
    console.log('\n13. Testing error handling (future date)...');
    {
      const res = await client.call('tools/call', { name: 'get_historical_rate', arguments: { date: '2099-01-01', base: 'USD', target: 'EUR' } });
      assert(res.result?.isError === true, 'future date returns isError result');
      const text = extractText(res.result).toLowerCase();
      assert(text.includes('future'), 'error mentions future');
    }

    // 14. Error handling: unsupported historical currency
    console.log('\n14. Testing error handling (unsupported historical currency)...');
    {
      const res = await client.call('tools/call', { name: 'get_historical_rate', arguments: { date: '2024-01-15', base: 'USD', target: 'COP' } });
      assert(res.result?.isError === true, 'unsupported historical currency returns isError result');
    }

    // 15. Error handling: unknown tool
    console.log('\n15. Testing error handling (unknown tool)...');
    {
      const res = await client.call('tools/call', { name: 'does_not_exist', arguments: {} });
      assert(!!res.error, 'unknown tool returns an error');
      assert(res.error?.code === -32601, `error code is -32601 (got ${res.error?.code})`);
    }

    // 16. Method not found
    console.log('\n16. Testing method not found...');
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
