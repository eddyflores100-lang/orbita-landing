#!/usr/bin/env node
/**
 * GitHub Public MCP Server
 *
 * A Model Context Protocol (MCP) server that exposes GitHub public data
 * through six tools. Implements JSON-RPC 2.0 over a newline-delimited TCP
 * transport (and stdio) using only Node.js built-in modules -- no external
 * dependencies.
 *
 * External API (free for public data, no auth):
 *   - https://api.github.com            (GitHub REST API v3, anonymous tier)
 *
 * The anonymous GitHub tier allows 60 requests/hour. This server enforces a
 * minimum 1-second interval between requests and caches repo data for 5
 * minutes and issues for 1 minute to make the most of the quota.
 *
 * License: AL-1.0 (AliceLabs Source-Available)
 */

import * as http from 'http';
import * as https from 'https';
import * as net from 'net';
import { URL } from 'url';

/* =========================================================================
 * Types
 * ========================================================================= */

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number | string | null;
  method: string;
  params?: Record<string, unknown> | unknown[];
}

interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number | string | null;
  result?: unknown;
  error?: JsonRpcError;
}

interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

interface ToolEntry {
  tool: ToolDefinition;
  handler: ToolHandler;
}

/* =========================================================================
 * HTTP helper (redirects, JSON parsing, status validation)
 * ========================================================================= */

interface FetchOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
}

function httpGetJson(url: string, opts: FetchOptions = {}, maxRedirects = 5): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let redirects = 0;
    const headers = opts.headers || {};
    const timeoutMs = opts.timeoutMs ?? 15000;

    const doGet = (currentUrl: string): void => {
      let parsed: URL;
      try {
        parsed = new URL(currentUrl);
      } catch {
        reject(new Error(`Invalid URL: ${currentUrl}`));
        return;
      }
      const lib = parsed.protocol === 'https:' ? https : http;

      const req = lib.get(currentUrl, { headers, timeout: timeoutMs }, (res) => {
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          res.resume();
          if (redirects >= maxRedirects) {
            reject(new Error(`Too many redirects (max ${maxRedirects})`));
            return;
          }
          redirects++;
          const nextUrl = new URL(res.headers.location, currentUrl).href;
          doGet(nextUrl);
          return;
        }
        if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
          let body = '';
          res.setEncoding('utf8');
          res.on('data', (c: string) => (body += c));
          res.on('end', () => {
            let message = `HTTP ${res.statusCode} for ${currentUrl}`;
            // Surface the GitHub error message when available (rate limits etc.)
            try {
              const parsed = body ? JSON.parse(body) : null;
              if (parsed?.message) message += ` -- ${parsed.message}`;
            } catch {
              if (body) message += ` -- ${body.substring(0, 200)}`;
            }
            reject(new Error(message));
          });
          return;
        }
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk: string) => (data += chunk));
        res.on('end', () => {
          if (data.length === 0) {
            resolve(null);
            return;
          }
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(
              new Error(`Failed to parse JSON from ${currentUrl}: ${data.substring(0, 200)}`),
            );
          }
        });
      });

      req.on('timeout', () => {
        req.destroy(new Error(`Request timeout after ${timeoutMs}ms for ${currentUrl}`));
      });
      req.on('error', (err: Error) => {
        reject(new Error(`Request error for ${currentUrl}: ${err.message}`));
      });
    };

    doGet(url);
  });
}

/* =========================================================================
 * In-memory cache (TTL based)
 * ========================================================================= */

class Cache {
  private store = new Map<string, { value: unknown; expires: number }>();

  set(key: string, value: unknown, ttlMs: number): void {
    this.store.set(key, { value, expires: Date.now() + ttlMs });
  }

  get<T = unknown>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }
}

/* =========================================================================
 * Rate limiter (serializes requests with a minimum interval)
 * ========================================================================= */

class RateLimiter {
  private last = 0;
  private busy = false;
  private queue: Array<() => void> = [];

  constructor(private intervalMs: number) {}

  acquire(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.queue.push(resolve);
      this.drain();
    });
  }

  private drain(): void {
    if (this.busy || this.queue.length === 0) return;
    this.busy = true;
    const elapsed = Date.now() - this.last;
    const wait = Math.max(0, this.intervalMs - elapsed);
    setTimeout(() => {
      this.last = Date.now();
      this.busy = false;
      const next = this.queue.shift();
      if (next) next();
      this.drain();
    }, wait);
  }
}

/* =========================================================================
 * Constants & helpers
 * ========================================================================= */

const API_BASE = 'https://api.github.com';
const CACHE = new Cache();
const LIMITER = new RateLimiter(1000); // max 1 request per second

const FIVE_MINUTES = 5 * 60_000;
const ONE_MINUTE = 60_000;

const DEFAULT_HEADERS: Record<string, string> = {
  'User-Agent': 'AliceLabs-MCP/1.0',
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
};

// Optional: an authenticated GitHub token raises the rate limit from 60/hour
// (anonymous) to 5000/hour. Read once at startup; never logged or returned.
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
if (GITHUB_TOKEN) {
  DEFAULT_HEADERS.Authorization = `Bearer ${GITHUB_TOKEN}`;
}

async function ghGet(pathAndQuery: string, cacheKey?: string, ttlMs?: number): Promise<unknown> {
  if (cacheKey && ttlMs) {
    const cached = CACHE.get(cacheKey);
    if (cached !== undefined) return cached;
  }
  const url = pathAndQuery.startsWith('http') ? pathAndQuery : `${API_BASE}${pathAndQuery}`;
  await LIMITER.acquire();
  const data = await httpGetJson(url, { headers: DEFAULT_HEADERS });
  if (cacheKey && ttlMs) {
    CACHE.set(cacheKey, data, ttlMs);
  }
  return data;
}

// Decode a base64 string into UTF-8 text. Accepts standard and URL-safe
// base64 with or without padding.
function decodeBase64(input: string): string {
  let s = input.replace(/-/g, '+').replace(/_/g, '+').replace(/\s/g, '');
  while (s.length % 4 !== 0) s += '=';
  return Buffer.from(s, 'base64').toString('utf8');
}

function sanitizeOwner(value: unknown): string {
  const s = String(value ?? '').trim();
  if (!s) throw new Error('Parameter "owner" must be a non-empty string.');
  // GitHub owner/repo names only allow [A-Za-z0-9._-]
  if (!/^[A-Za-z0-9._-]+$/.test(s)) {
    throw new Error('Parameter "owner" contains invalid characters.');
  }
  return s;
}

function sanitizeRepo(value: unknown): string {
  const s = String(value ?? '').trim();
  if (!s) throw new Error('Parameter "repo" must be a non-empty string.');
  if (!/^[A-Za-z0-9._-]+$/.test(s)) {
    throw new Error('Parameter "repo" contains invalid characters.');
  }
  return s;
}

function sanitizeUsername(value: unknown): string {
  const s = String(value ?? '').trim();
  if (!s) throw new Error('Parameter "username" must be a non-empty string.');
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/.test(s)) {
    throw new Error('Parameter "username" is not a valid GitHub username.');
  }
  return s;
}

function sanitizeQuery(value: unknown): string {
  const s = String(value ?? '').trim();
  if (!s) throw new Error('Parameter "query" must be a non-empty string.');
  // GitHub search queries support advanced syntax; we only forbid control
  // chars and newlines which would break the URL.
  if (/[\r\n\t]/.test(s)) {
    throw new Error('Parameter "query" must not contain newlines or tabs.');
  }
  return s;
}

function coercePositiveInt(value: unknown, max: number): number | undefined {
  if (value === undefined || value === null) return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) throw new Error('Parameter must be a positive integer.');
  return Math.min(Math.floor(n), max);
}

interface RepoSummary {
  id: number;
  fullName: string;
  description: string;
  url: string;
  homepage: string;
  stars: number;
  forks: number;
  openIssues: number;
  watchers: number;
  defaultBranch: string;
  language: string;
  topics: string[];
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  archived: boolean;
  disabled: boolean;
}

function toRepoSummary(r: any): RepoSummary {
  return {
    id: r.id,
    fullName: r.full_name,
    description: r.description || '',
    url: r.html_url || '',
    homepage: r.homepage || '',
    stars: r.stargazers_count ?? 0,
    forks: r.forks_count ?? 0,
    openIssues: r.open_issues_count ?? 0,
    watchers: r.watchers_count ?? r.subscribers_count ?? 0,
    defaultBranch: r.default_branch || '',
    language: r.language || '',
    topics: Array.isArray(r.topics) ? r.topics : [],
    createdAt: r.created_at || '',
    updatedAt: r.updated_at || '',
    pushedAt: r.pushed_at || '',
    archived: !!r.archived,
    disabled: !!r.disabled,
  };
}

interface IssueSummary {
  number: number;
  title: string;
  state: string;
  author: string;
  body: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  comments: number;
  labels: string[];
}

function toIssueSummary(i: any): IssueSummary {
  return {
    number: i.number,
    title: i.title || '',
    state: i.state || 'open',
    author: i.user?.login || '',
    body: i.body || '',
    url: i.html_url || '',
    createdAt: i.created_at || '',
    updatedAt: i.updated_at || '',
    comments: i.comments ?? 0,
    labels: Array.isArray(i.labels) ? i.labels.map((l: any) => (typeof l === 'string' ? l : l.name)).filter(Boolean) : [],
  };
}

interface UserSummary {
  login: string;
  name: string;
  type: string;
  avatarUrl: string;
  url: string;
  bio: string;
  company: string;
  blog: string;
  location: string;
  publicRepos: number;
  publicGists: number;
  followers: number;
  following: number;
  createdAt: string;
}

function toUserSummary(u: any): UserSummary {
  return {
    login: u.login,
    name: u.name || '',
    type: u.type || 'User',
    avatarUrl: u.avatar_url || '',
    url: u.html_url || '',
    bio: u.bio || '',
    company: u.company || '',
    blog: u.blog || '',
    location: u.location || '',
    publicRepos: u.public_repos ?? 0,
    publicGists: u.public_gists ?? 0,
    followers: u.followers ?? 0,
    following: u.following ?? 0,
    createdAt: u.created_at || '',
  };
}

/* =========================================================================
 * Tools
 * ========================================================================= */

const tools: ToolEntry[] = [
  {
    tool: {
      name: 'search_repos',
      description:
        'Search public GitHub repositories by keyword. Returns up to 10 matching repositories with name, description, stars, forks and language. Useful for discovering projects by topic.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query (e.g. "next.js framework", "language:typescript stars:>1000").',
          },
          perPage: {
            type: 'integer',
            description: 'Number of results to return (1-30, default 10).',
          },
        },
        required: ['query'],
      },
    },
    handler: async (args) => {
      const query = sanitizeQuery(args.query);
      const perPage = coercePositiveInt(args.perPage, 30) ?? 10;
      const cacheKey = `search:${query}:${perPage}`;
      const cached = CACHE.get<any>(cacheKey);
      if (cached !== undefined) return cached;
      const url = new URL(`${API_BASE}/search/repositories`);
      url.searchParams.set('q', query);
      url.searchParams.set('sort', 'stars');
      url.searchParams.set('order', 'desc');
      url.searchParams.set('per_page', String(perPage));
      const data = (await ghGet(url.pathname + url.search)) as any;
      const items = Array.isArray(data?.items) ? data.items.map(toRepoSummary) : [];
      const result = {
        totalCount: data?.total_count ?? items.length,
        incompleteResults: !!data?.incomplete_results,
        items,
      };
      CACHE.set(cacheKey, result, ONE_MINUTE);
      return result;
    },
  },
  {
    tool: {
      name: 'get_repo',
      description:
        'Get detailed information about a single public GitHub repository by owner and name. Returns stars, forks, description, default branch, topics and timestamps.',
      inputSchema: {
        type: 'object',
        properties: {
          owner: { type: 'string', description: 'Repository owner (user or organization login).' },
          repo: { type: 'string', description: 'Repository name.' },
        },
        required: ['owner', 'repo'],
      },
    },
    handler: async (args) => {
      const owner = sanitizeOwner(args.owner);
      const repo = sanitizeRepo(args.repo);
      const cacheKey = `repo:${owner}/${repo}`.toLowerCase();
      const cached = CACHE.get<RepoSummary>(cacheKey);
      if (cached !== undefined) return cached;
      const data = (await ghGet(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
        cacheKey,
        FIVE_MINUTES,
      )) as any;
      if (!data || !data.full_name) {
        throw new Error(`Repository "${owner}/${repo}" not found.`);
      }
      return toRepoSummary(data);
    },
  },
  {
    tool: {
      name: 'get_issues',
      description:
        'List open issues for a public GitHub repository. Returns up to 10 most recent open issues (excluding pull requests) with number, title, author, labels and comment count.',
      inputSchema: {
        type: 'object',
        properties: {
          owner: { type: 'string', description: 'Repository owner.' },
          repo: { type: 'string', description: 'Repository name.' },
          limit: { type: 'integer', description: 'Maximum issues to return (1-30, default 10).' },
        },
        required: ['owner', 'repo'],
      },
    },
    handler: async (args) => {
      const owner = sanitizeOwner(args.owner);
      const repo = sanitizeRepo(args.repo);
      const limit = coercePositiveInt(args.limit, 30) ?? 10;
      const cacheKey = `issues:${owner}/${repo}:${limit}`.toLowerCase();
      const cached = CACHE.get<IssueSummary[]>(cacheKey);
      if (cached !== undefined) return cached;
      const url = new URL(`${API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues`);
      url.searchParams.set('state', 'open');
      url.searchParams.set('sort', 'created');
      url.searchParams.set('direction', 'desc');
      url.searchParams.set('per_page', String(limit));
      const data = (await ghGet(url.pathname + url.search, cacheKey, ONE_MINUTE)) as any[];
      const issues = Array.isArray(data)
        ? data.filter((i: any) => !i.pull_request).map(toIssueSummary)
        : [];
      return issues;
    },
  },
  {
    tool: {
      name: 'get_issue',
      description:
        'Get a single issue (by number) from a public GitHub repository, including its full body, author, labels and comment count. Excludes pull requests.',
      inputSchema: {
        type: 'object',
        properties: {
          owner: { type: 'string', description: 'Repository owner.' },
          repo: { type: 'string', description: 'Repository name.' },
          number: { type: 'integer', description: 'The issue number.' },
        },
        required: ['owner', 'repo', 'number'],
      },
    },
    handler: async (args) => {
      const owner = sanitizeOwner(args.owner);
      const repo = sanitizeRepo(args.repo);
      const numberRaw = args.number;
      if (numberRaw === undefined || numberRaw === null) {
        throw new Error('Parameter "number" is required.');
      }
      const number = Number(numberRaw);
      if (!Number.isFinite(number) || number < 1 || !Number.isInteger(number)) {
        throw new Error('Parameter "number" must be a positive integer.');
      }
      const cacheKey = `issue:${owner}/${repo}:${number}`.toLowerCase();
      const cached = CACHE.get<IssueSummary>(cacheKey);
      if (cached !== undefined) return cached;
      const data = (await ghGet(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/${number}`,
        cacheKey,
        ONE_MINUTE,
      )) as any;
      if (!data || data.message) {
        throw new Error(`Issue #${number} in "${owner}/${repo}" not found.`);
      }
      if (data.pull_request) {
        throw new Error(`#${number} in "${owner}/${repo}" is a pull request, not an issue.`);
      }
      return toIssueSummary(data);
    },
  },
  {
    tool: {
      name: 'get_readme',
      description:
        'Fetch and decode the README of a public GitHub repository. Returns the repository name, readme encoding and the decoded plain-text README content.',
      inputSchema: {
        type: 'object',
        properties: {
          owner: { type: 'string', description: 'Repository owner.' },
          repo: { type: 'string', description: 'Repository name.' },
        },
        required: ['owner', 'repo'],
      },
    },
    handler: async (args) => {
      const owner = sanitizeOwner(args.owner);
      const repo = sanitizeRepo(args.repo);
      const cacheKey = `readme:${owner}/${repo}`.toLowerCase();
      const cached = CACHE.get<any>(cacheKey);
      if (cached !== undefined) return cached;
      const data = (await ghGet(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/readme`,
        cacheKey,
        FIVE_MINUTES,
      )) as any;
      if (!data || !data.name) {
        throw new Error(`README for "${owner}/${repo}" not found.`);
      }
      const encoding = (data.encoding || 'base64').toLowerCase();
      let content = '';
      if (encoding === 'base64' && typeof data.content === 'string') {
        content = decodeBase64(data.content);
      } else if (typeof data.content === 'string') {
        content = data.content;
      }
      return {
        repo: `${owner}/${repo}`,
        name: data.name,
        path: data.path,
        size: data.size,
        encoding,
        content,
      };
    },
  },
  {
    tool: {
      name: 'get_user',
      description:
        'Get the public profile of a GitHub user (or organization) by username. Returns name, bio, company, public repos, followers and account creation date.',
      inputSchema: {
        type: 'object',
        properties: {
          username: { type: 'string', description: 'GitHub username (login).' },
        },
        required: ['username'],
      },
    },
    handler: async (args) => {
      const username = sanitizeUsername(args.username);
      const cacheKey = `user:${username.toLowerCase()}`;
      const cached = CACHE.get<UserSummary>(cacheKey);
      if (cached !== undefined) return cached;
      const data = (await ghGet(
        `/users/${encodeURIComponent(username)}`,
        cacheKey,
        FIVE_MINUTES,
      )) as any;
      if (!data || data.message) {
        throw new Error(`GitHub user "${username}" not found.`);
      }
      return toUserSummary(data);
    },
  },
];

const TOOL_REGISTRY: Record<string, ToolEntry> = Object.fromEntries(
  tools.map((t) => [t.tool.name, t]),
);

/* =========================================================================
 * JSON-RPC handler
 * ========================================================================= */

async function handleJsonRpc(request: JsonRpcRequest): Promise<JsonRpcResponse> {
  const { id, method, params } = request;
  const base: Pick<JsonRpcResponse, 'jsonrpc' | 'id'> = { jsonrpc: '2.0', id };

  if (method === 'notifications/initialized') {
    return { ...base, result: {} };
  }

  if (method === 'initialize') {
    return {
      ...base,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'github-mcp', version: '1.0.0' },
      },
    };
  }

  if (method === 'tools/list') {
    return { ...base, result: { tools: tools.map((t) => t.tool) } };
  }

  if (method === 'tools/call') {
    const p = (params || {}) as { name?: string; arguments?: Record<string, unknown> };
    const toolName = p.name;
    const args = p.arguments || {};
    const entry = toolName ? TOOL_REGISTRY[toolName] : undefined;
    if (!entry) {
      return { ...base, error: { code: -32601, message: `Tool not found: ${toolName}` } };
    }
    const required = entry.tool.inputSchema.required || [];
    for (const r of required) {
      if (args[r] === undefined || args[r] === null) {
        return { ...base, error: { code: -32602, message: `Missing required parameter: ${r}` } };
      }
    }
    try {
      const result = await entry.handler(args);
      return {
        ...base,
        result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] },
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return {
        ...base,
        result: { content: [{ type: 'text', text: `Error: ${message}` }], isError: true },
      };
    }
  }

  return { ...base, error: { code: -32601, message: `Method not found: ${method}` } };
}

/* =========================================================================
 * Transport: TCP (newline-delimited JSON-RPC) and stdio
 * ========================================================================= */

function processLine(line: string, respond: (msg: JsonRpcResponse) => void): void {
  const trimmed = line.trim();
  if (!trimmed) return;
  let request: JsonRpcRequest;
  try {
    request = JSON.parse(trimmed) as JsonRpcRequest;
  } catch {
    respond({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32700, message: 'Parse error: invalid JSON' },
    });
    return;
  }
  if (request.id === null || request.id === undefined) {
    return;
  }
  handleJsonRpc(request)
    .then(respond)
    .catch((err) => {
      respond({
        jsonrpc: '2.0',
        id: request.id,
        error: { code: -32603, message: err instanceof Error ? err.message : String(err) },
      });
    });
}

function runTcp(port: number): void {
  const server = net.createServer((socket) => {
    let buffer = '';
    socket.setEncoding('utf8');
    socket.on('data', (chunk: string) => {
      buffer += chunk;
      let idx: number;
      while ((idx = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        processLine(line, (msg) => {
          socket.write(JSON.stringify(msg) + '\n');
        });
      }
    });
    socket.on('error', () => {
      /* ignore teardown errors */
    });
  });
  server.on('error', (err) => {
    process.stderr.write(`Server error: ${err.message}\n`);
    process.exit(1);
  });
  server.listen(port, '127.0.0.1', () => {
    const addr = server.address();
    const actualPort = typeof addr === 'object' && addr ? addr.port : port;
    process.stdout.write(`LISTENING ${actualPort}\n`);
  });
}

function runStdio(): void {
  let buffer = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk: string) => {
    buffer += chunk;
    let idx: number;
    while ((idx = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      processLine(line, (msg) => {
        process.stdout.write(JSON.stringify(msg) + '\n');
      });
    }
  });
  process.stdin.on('end', () => process.exit(0));
  process.stdin.on('error', () => process.exit(0));
}

const transportArg = process.argv[2];
if (transportArg && transportArg !== 'stdio' && transportArg !== '--stdio') {
  runTcp(parseInt(transportArg, 10));
} else {
  runStdio();
}
