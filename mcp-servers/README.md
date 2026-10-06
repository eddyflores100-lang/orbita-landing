# MCP Servers

Three production-ready Model Context Protocol (MCP) servers, each built with
TypeScript and zero npm runtime dependencies (Node.js built-in modules only),
each fully tested end-to-end and reviewed three times.

| Server | Package | Tools | Live data source | Tests |
| ------ | ------- | ----- | ----------------- | ----- |
| Hacker News | `@alicelabs/hn-mcp`     | 6 | hacker-news.firebaseio.com + hn.algolia.com | 65 passing |
| GitHub     | `@alicelabs/github-mcp`| 6 | api.github.com (anonymous or token)         | 60 passing |
| Finance    | `@alicelabs/finance-mcp`| 6 | open.er-api.com + frankfurter.dev + coingecko | 73 passing |

Total: **18 tools, 178 passing assertions, 0 failing.**

---

## What is here

```
mcp-servers/
  LICENSE                          AL-1.0 (AliceLabs Source-Available)
  README.md                         this overview
  hn-mcp/
    index.ts                        MCP server (JSON-RPC 2.0 over stdio + TCP)
    test.ts                         end-to-end test suite
    package.json                    @alicelabs/hn-mcp
    README.md                        full docs + review log
    LICENSE
  github-mcp/
    index.ts
    test.ts
    package.json                    @alicelabs/github-mcp
    README.md
    LICENSE
  finance-mcp/
    index.ts
    test.ts
    package.json                    @alicelabs/finance-mcp
    README.md
    LICENSE
```

Each server is a self-contained package that can be published to npm and run
with `npx tsx index.ts` (stdio, the standard MCP transport) or `npx tsx
index.ts <port>` (TCP, for testing and local integrations). No build step is
required.

---

## Shared design

All three servers share the same lightweight architecture so they are easy to
read and audit:

- **Transport**: JSON-RPC 2.0 with newline-delimited framing. The first CLI
  argument selects stdio (default, `stdio`, `--stdio`) or TCP (`<port>`). TCP
  mode prints `LISTENING <port>` to stdout once the socket is bound.
- **Methods**: `initialize` (returns `protocolVersion: 2024-11-05`, server
  info and `tools` capability), `tools/list` (returns the six tool schemas),
  `tools/call` (dispatches to a handler), `notifications/initialized`
  (acknowledged silently), and a catch-all `-32601` for unknown methods.
- **Tool results**: success returns `{ content: [{ type: "text", text:
  "<json>" }] }`; failure returns `{ content: [{ type: "text", text: "Error:
  ..." }], isError: true }` so callers see errors in-band rather than as
  transport exceptions.
- **Helpers** (duplicated per package so each is dependency-free): an HTTP
  `GET` helper that follows up to 5 redirects and validates status codes; an
  in-memory TTL `Cache`; a serializing `RateLimiter` enforcing a per-provider
  minimum interval; strict input validators per tool.
- **No secrets by default**: HN and Finance need no keys at all. GitHub
  works anonymously and optionally accepts `GITHUB_TOKEN`/`GH_TOKEN` to raise
  the rate limit from 60/hour to 5000/hour.

---

## Quick start

Run any server in stdio mode (for Claude Desktop / Cursor):

```bash
npx tsx hn-mcp/index.ts
npx tsx github-mcp/index.ts
npx tsx finance-mcp/index.ts
```

Run any server in TCP mode (for testing):

```bash
npx tsx hn-mcp/index.ts 3456        # then talk JSON-RPC over 127.0.0.1:3456
```

Run the test suite for any server:

```bash
cd hn-mcp      && bun test.ts       # 65 passed
cd github-mcp  && bun test.ts       # 60 passed (retries through GitHub rate-limit windows)
cd finance-mcp && bun test.ts       # 73 passed
```

---

## Tool summary

### Hacker News (`@alicelabs/hn-mcp`)

| Tool              | Parameters                       |
| ----------------- | -------------------------------- |
| `get_top_stories` | none                             |
| `get_best_stories`| none                             |
| `get_new_stories` | none                             |
| `get_story`       | `id: integer`                    |
| `search_stories`  | `query: string`, `tags?: string` |
| `get_user`        | `username: string`              |

### GitHub (`@alicelabs/github-mcp`)

| Tool          | Parameters                                                              |
| ------------- | ----------------------------------------------------------------------- |
| `search_repos`| `query: string`, `perPage?: integer`                                   |
| `get_repo`    | `owner: string`, `repo: string`                                         |
| `get_issues`  | `owner: string`, `repo: string`, `limit?: integer`                       |
| `get_issue`   | `owner: string`, `repo: string`, `number: integer`                       |
| `get_readme`  | `owner: string`, `repo: string`                                         |
| `get_user`    | `username: string`                                                      |

### Finance (`@alicelabs/finance-mcp`)

| Tool                  | Parameters                                                              |
| --------------------- | ----------------------------------------------------------------------- |
| `get_exchange_rate`   | `base: string`, `target: string`                                        |
| `list_currencies`     | none                                                                    |
| `get_crypto_price`    | `id: string`, `vs?: string`                                             |
| `get_crypto_list`     | `vs?: string`                                                           |
| `convert_currency`    | `amount: number`, `from: string`, `to: string`                          |
| `get_historical_rate` | `date: string`, `base: string`, `target: string`                        |

LATAM currency coverage (USD, EUR, MXN, COP, PEN, CLP, ARS, BRL, CUP) is fully
supported by the live-rate tools; historical rates are limited to the ECB
reference set (~30 currencies, includes USD, EUR, MXN, BRL).

---

## Security posture

Across all three servers:

- Outbound hosts are hardcoded constants; user input only influences path
  segments or query parameters, which are validated and percent-encoded. There
  is no SSRF surface because no tool accepts a host or URL parameter.
- Input validators reject malformed values early (`-32602` for missing
  required params, `isError` results for invalid values such as a non-3-letter
  currency code, a non-numeric GitHub issue number, or a future historical
  date).
- The only optional secret (`GITHUB_TOKEN`) is read from the environment once
  at startup, sent only as a `Bearer` header, and is never logged or returned.
- The HTTP helper follows up to 5 redirects (needed for `frankfurter.app` ->
  `frankfurter.dev`) but only from the trusted hardcoded hosts.
- No code uses `eval`, `Function`, dynamic `require`, or child process
  spawning outside the test harness (which spawns only the local server
  process).

Each server's README contains a per-server three-pass review log (functionality,
security, quality).

---

## Rate-limit summary

| Server  | Min interval | Cache TTLs                                          |
| ------- | ------------ | --------------------------------------------------- |
| HN      | 500 ms       | items, lists, search, users: 60 s                  |
| GitHub  | 1000 ms      | repo + README + user: 5 min; issues + search: 1 min|
| Finance | 600 ms       | FX rates + currency list: 10 min; crypto: 2 min; historical: 1 min |

GitHub's anonymous tier (60/hour) is shared across all callers on a public IP
and can be exhausted by neighbours; the GitHub test suite retries through the
hourly reset window. Setting `GITHUB_TOKEN` removes that constraint.

---

## Claude Desktop / Cursor example

```json
{
  "mcpServers": {
    "hn":      { "command": "npx", "args": ["-y", "tsx", "/abs/path/mcp-servers/hn-mcp/index.ts"] },
    "github":  { "command": "npx", "args": ["-y", "tsx", "/abs/path/mcp-servers/github-mcp/index.ts"],
                  "env": { "GITHUB_TOKEN": "ghp_..." } },
    "finance": { "command": "npx", "args": ["-y", "tsx", "/abs/path/mcp-servers/finance-mcp/index.ts"] }
  }
}
```

---

## License

All three packages are released under the **AL-1.0 (AliceLabs Source-Available)**
license. See `LICENSE` at this directory root and a copy inside each package.

---

## MarketNow listing

All three packages are intended for the MarketNow registry at
https://marketnow.site. See each package's README for per-package submission
steps (npm publish + submit at https://marketnow.site/submit with the
appropriate category and tags).
