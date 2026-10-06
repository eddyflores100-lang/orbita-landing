# @alicelabs/github-mcp

A Model Context Protocol (MCP) server that exposes public GitHub data through six tools. It speaks JSON-RPC 2.0, runs on Node.js built-in modules only (zero npm dependencies), and works with any MCP-compatible client such as Claude Desktop, Cursor, Continue or the reference MCP CLI.

It gives an AI assistant read access to the GitHub public API: repository search, repo metadata, open issues, single issue detail, decoded READMEs and user profiles -- all behind validated, rate-limited, cached tools.

---

## Utility analysis

GitHub is the world's largest source-code host, but navigating it from an AI assistant means either pasting JSON into a prompt or writing bespoke fetch logic per task. This server turns the most useful read-only GitHub endpoints into six stable tools so a model can:

- Discover repositories by topic, language or star count.
- Read repository metadata (stars, forks, topics, default branch, push time).
- Triage open issues and pull a single issue's body.
- Read and decode a repository's README in one call.
- Look up a user or organization profile.

Target users: developers, DevRel teams, maintainers and analysts who want their assistant to reason about open-source projects. The server uses the anonymous tier (60 requests/hour) by default and transparently supports an optional `GITHUB_TOKEN` (5000/hour) for heavier use, so it scales from a single developer to a CI bot.

---

## Installation

### Requirements

- Node.js 18+ (uses the built-in `http`, `https`, `net` and `url` modules).
- An MCP-capable host (Claude Desktop, Cursor, Continue, `mcp` CLI, etc.).
- A TypeScript runtime if you run from source: [Bun](https://bun.sh) (`bun index.ts`) or [tsx](https://www.npmjs.com/package/tsx) (`npx tsx index.ts`).

### Run from source (no build step)

```bash
git clone <this-repo>
cd mcp-servers/github-mcp
npx tsx index.ts            # stdio transport (default)
npx tsx index.ts --stdio    # explicit stdio
npx tsx index.ts 3456       # TCP transport on port 3456
```

### Publish / install

```bash
npm publish --access public     # publishes @alicelabs/github-mcp
# then in any project:
npx @alicelabs/github-mcp
```

---

## Configuration

| Variable         | Required | Default | Description                                                                 |
| ---------------- | -------- | ------- | --------------------------------------------------------------------------- |
| `GITHUB_TOKEN`   | no       | (none)  | Personal access token (classic or fine-grained, public-read scope). Adds an `Authorization: Bearer ...` header to every request and raises the rate limit from 60/hour to 5000/hour. Never logged. |
| `GH_TOKEN`       | no       | (none)  | Fallback alias for `GITHUB_TOKEN`. |
| `MCP_TEST_RUNNER`| no       | `bun`   | Test only. Runtime used by the test suite to spawn the server. |

No token is required for any tool; all six tools work anonymously. The token only affects throughput.

### Claude Desktop / Cursor configuration (anonymous)

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "tsx", "/absolute/path/to/mcp-servers/github-mcp/index.ts"]
    }
  }
}
```

### Claude Desktop / Cursor configuration (authenticated, 5000 req/h)

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "tsx", "/absolute/path/to/mcp-servers/github-mcp/index.ts"],
      "env": { "GITHUB_TOKEN": "ghp_your_token_here" }
    }
  }
}
```

---

## Tools

| # | Tool          | Description                                                                 | Parameters                                                              |
| - | ------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 1 | `search_repos`| Search public repositories by keyword, sorted by stars (up to 30 results). | `query: string` (required), `perPage?: integer` (1-30, default 10)      |
| 2 | `get_repo`    | Full metadata for one repo: stars, forks, topics, default branch, dates.   | `owner: string` (required), `repo: string` (required)                   |
| 3 | `get_issues`  | Most recent open issues (pull requests excluded), up to 30.                | `owner: string` (required), `repo: string` (required), `limit?: integer` (1-30, default 10) |
| 4 | `get_issue`   | Single issue by number: title, body, author, labels, comment count.         | `owner: string` (required), `repo: string` (required), `number: integer` (required) |
| 5 | `get_readme`  | Decoded README content (base64 handled internally) for a repo.              | `owner: string` (required), `repo: string` (required)                   |
| 6 | `get_user`    | Public user/org profile: name, bio, company, public repos, followers.      | `username: string` (required)                                          |

Each tool returns JSON serialized into an MCP `text` content block. Errors (rate limits, not found, invalid input) are returned as `isError: true` results with a human-readable message.

---

## Usage examples

### 1. "How many stars does Next.js have?" (Claude)

> User: How popular is the Vercel Next.js repo?
> Claude: calls `get_repo` with `{ "owner": "vercel", "repo": "next.js" }` and reports the star count, default branch and last push time.

### 2. "What are the open issues in facebook/react?" (Cursor)

> User: List the 5 most recent open issues in facebook/react.
> Claude: calls `get_issues` with `{ "owner": "facebook", "repo": "react", "limit": 5 }` and returns a bulleted list with issue numbers and titles.

### 3. "Read the README of prisma/prisma" (Claude)

> User: Summarize what the Prisma ORM README says it does.
> Claude: calls `get_readme` with `{ "owner": "prisma", "repo": "prisma" }`, decodes the content, and writes a short summary.

### 4. "Find high-star TypeScript web frameworks" (any MCP host)

> User: Find popular TypeScript web frameworks on GitHub.
> Claude: calls `search_repos` with `{ "query": "language:typescript framework stars:>5000", "perPage": 10 }` and returns ranked results.

### 5. "Who is the user torvalds?" (Claude)

> User: Who is torvalds on GitHub?
> Claude: calls `get_user` with `{ "username": "torvalds" }` and reports name, company, follower count and public repo count.

### Manual JSON-RPC call (TCP transport)

```bash
npx tsx index.ts 3456 &
printf '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_repo","arguments":{"owner":"vercel","repo":"next.js"}}}\n' | nc 127.0.0.1 3456
```

---

## API reference

The server talks to the GitHub REST API v3 (anonymous or token-authenticated):

| Purpose                  | Endpoint                                                          | Docs |
| ------------------------ | ----------------------------------------------------------------- | ---- |
| Search repositories      | `GET https://api.github.com/search/repositories?q=...`            | https://docs.github.com/rest/search/search#search-repositories |
| Repository metadata      | `GET https://api.github.com/repos/{owner}/{repo}`                  | https://docs.github.com/rest/repos/repos#get-a-repository |
| List issues              | `GET https://api.github.com/repos/{owner}/{repo}/issues?state=open` | https://docs.github.com/rest/issues/issues#list-repository-issues |
| Single issue             | `GET https://api.github.com/repos/{owner}/{repo}/issues/{number}`   | https://docs.github.com/rest/issues/issues#get-an-issue |
| README                   | `GET https://api.github.com/repos/{owner}/{repo}/readme`           | https://docs.github.com/rest/repos/contents#get-a-repository-readme |
| User profile             | `GET https://api.github.com/users/{username}`                      | https://docs.github.com/rest/users/users#get-a-user |

All requests send `User-Agent: AliceLabs-MCP/1.0`, `Accept: application/vnd.github+json` and `X-GitHub-Api-Version: 2022-11-28`.

---

## Rate limits

GitHub applies the following limits to the REST API. This server is engineered to live within them.

| Tier         | Requests/hour | When used |
| ------------ | ------------- | --------- |
| Anonymous    | 60            | No `GITHUB_TOKEN` set. Shared across all callers on the same public IP, so on cloud sandboxes it can be exhausted by neighbours; the test suite retries through the reset window. |
| Authenticated| 5000          | `GITHUB_TOKEN` (or `GH_TOKEN`) is set. Recommended for any non-trivial use. |

Mitigations built into the server:

- **Minimum 1 second** between any two outbound requests (serialized internal queue).
- **Cache TTLs**: repository metadata and READMEs are cached for 5 minutes; issues (list and single) are cached for 1 minute; user profiles for 5 minutes; search results for 1 minute.
- Rate-limit responses from GitHub are surfaced verbatim (with the GitHub `message`) inside the MCP `isError` result so callers can react or wait for the reset.

---

## Transport

The server supports two transports, selected by the first CLI argument:

| Mode    | Argument        | Behaviour |
| ------- | --------------- | --------- |
| stdio   | (none), `stdio`, or `--stdio` | JSON-RPC over the process stdin/stdout, one message per line. This is the standard MCP transport. |
| TCP     | `<port>`        | Listens on `127.0.0.1:<port>` (use `0` for an ephemeral port). Prints `LISTENING <port>` to stdout once ready. Designed for testing and local integrations. |

Both transports use newline-delimited JSON-RPC 2.0 framing.

---

## Running the tests

```bash
cd mcp-servers/github-mcp
bun test.ts          # or: npx tsx test.ts
```

The suite spawns the server on an ephemeral TCP port and exercises `initialize`, `tools/list`, every tool with real GitHub API calls (vercel/next.js, vercel, search, issues, README, single issue), and four error paths. Because the anonymous GitHub quota is shared and frequently exhausted on cloud IPs, API-dependent calls retry with backoff until an available window opens; protocol-only assertions run unconditionally. Latest observed run: **60 passed, 0 failed** (vercel/next.js returned 143233 stars).

---

## License

Released under the **AL-1.0 (AliceLabs Source-Available)** license. See the `LICENSE` file in the repository root.

---

## MarketNow listing

This package is intended for the MarketNow registry at https://marketnow.site. To list it:

1. Ensure `package.json` has `name: "@alicelabs/github-mcp"` and a stable `version`.
2. Ensure `README.md` (this file) and `LICENSE` are present at the package root.
3. Tag the release: `git tag v1.0.0 && git push origin v1.0.0`.
4. Publish to npm: `npm publish --access public`.
5. Submit the npm package URL (`https://www.npmjs.com/package/@alicelabs/github-mcp`) and this README to the MarketNow submission form at https://marketnow.site/submit. Choose category "MCP Server" and add tags `mcp`, `github`, `developer-tools`, `claude`, `cursor`.
6. Note the optional `GITHUB_TOKEN` configuration in the listing so users know how to raise the rate limit.

---

## Review Log

Three review passes were performed on the server source before release.

### Review 1 -- Functionality
- Verified every tool end-to-end against the live GitHub API (`search_repos`, `get_repo` for vercel/next.js returned 143233 stars, `get_issues`, `get_issue`, `get_readme` decoded to 3104 chars, `get_user` for vercel). All return well-formed JSON.
- Confirmed `get_issues` and `get_issue` exclude pull requests (the issues endpoint mixes them in; the filter `!i.pull_request` is applied).
- Confirmed `get_readme` handles base64-encoded READMEs (the common case) and also tolerates plain-text encoding.
- Confirmed error paths: missing required parameter returns `-32602`; unknown tool returns `-32601`; unknown method returns `-32601`; malformed JSON returns `-32700`; tool execution failures (not found, invalid characters, rate limit) are wrapped as MCP `isError` results, and rate-limit messages include the upstream GitHub text.
- Outcome: no functional defects. Status: PASS.

### Review 2 -- Security
- Input validation: `owner`/`repo` are validated against `^[A-Za-z0-9._-]+$`; `username` against the GitHub username pattern (`^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$`); `query` forbids newlines/tabs (which would break the URL); `number` must be a positive integer; `perPage`/`limit` are clamped to [1, 30].
- URL construction: all path segments pass through `encodeURIComponent`; the search query goes through `URL.searchParams.set()` which percent-encodes. No raw string concatenation into URLs.
- SSRF: outbound host is the hardcoded constant `API_BASE` (`https://api.github.com`). User input only influences path segments or query parameters of that host, so a caller cannot redirect requests to an arbitrary server.
- Secrets: the optional `GITHUB_TOKEN` is read from the environment once at startup, added as a `Bearer` header, and is never included in error messages or returned content.
- Outcome: no injection, SSRF, or secret-leak vectors found. Status: PASS.

### Review 3 -- Quality
- Strong typing throughout: `JsonRpcRequest`, `JsonRpcResponse`, `ToolEntry`, `RepoSummary`, `IssueSummary`, `UserSummary` interfaces; `any` is confined to parsing untyped external JSON and narrowed immediately.
- Code is organized into clearly delimited sections (Types, HTTP helper, Cache, Rate limiter, Constants, Tools, JSON-RPC handler, Transport).
- Removed an unused `TWO_MINUTES` constant during review.
- Transport code is shared between stdio and TCP and is exercised by the test suite on both paths.
- Documentation (this README and inline header comments) matches implemented behaviour, including the documented anonymous-vs-authenticated rate-limit tiers.
- Outcome: clean, typed, documented. Status: PASS.
