# @alicelabs/hn-mcp — Hacker News MCP Server

> Hacker News MCP server with 6 tools. Free APIs, no auth, no external dependencies.

## Utility Analysis

| Metric | Value |
|--------|-------|
| **Who needs this** | Developers using Claude/Cursor/Cline who want HN data in their AI workflow |
| **APIs used** | HN Firebase API (free, no auth) + HN Algolia Search API (free, no auth) |
| **External deps** | Zero — Node.js built-in `http` module only |
| **Rate limits** | HN Firebase: none (be respectful). Algolia: 1 req/sec |
| **Cache** | 60-second in-memory cache for repeated requests |
| **MarketNow listing value** | $200-500 for verified listing on marketnow.site |
| **Build time** | ~2 hours (including tests + docs + 3 reviews) |

## Installation

```bash
# Option 1: Run directly
npx tsx index.ts

# Option 2: Install as package (when published to npm)
npm install @alicelabs/hn-mcp

# Option 3: Clone and run
git clone https://github.com/alicelabs-llc/mcp-servers
cd mcp-servers/hn-mcp
npx tsx index.ts
```

## Configuration

| Env var | Default | Description |
|---------|---------|-------------|
| `PORT` | `3101` | HTTP port for the MCP server |

No API keys needed. No authentication required.

## Tools (6)

| # | Tool | Description | Required params |
|---|------|-------------|-----------------|
| 1 | `get_top_stories` | Fetch top 10 HN stories (title, URL, points, author, comments) | `limit` (optional, default 10, max 30) |
| 2 | `get_best_stories` | Fetch best 10 HN stories (all-time best) | `limit` (optional) |
| 3 | `get_story` | Fetch single story by ID + first 5 comments | `id` (required, e.g. 49977979) |
| 4 | `search_stories` | Search HN by keyword via Algolia | `query` (required), `hits` (optional, default 10, max 50) |
| 5 | `get_user` | Fetch user profile (karma, about, submission count) | `username` (required, e.g. "pg") |
| 6 | `get_new_stories` | Fetch 10 newest stories | `limit` (optional) |

## Usage Examples

### With Claude (Anthropic)

```json
// Add to Claude's MCP config:
{
  "mcpServers": {
    "hackernews": {
      "url": "http://localhost:3101"
    }
  }
}
```

Then ask Claude:
- "What are the top stories on Hacker News right now?"
- "Search HN for 'Rust programming language'"
- "What's Paul Graham's karma on HN?"
- "Show me the comments on story 49977979"

### With Cursor IDE

```json
// Add to Cursor's MCP settings:
{
  "hn": {
    "url": "http://localhost:3101",
    "transport": "http"
  }
}
```

### Direct API call (curl)

```bash
# List available tools
curl -X POST http://localhost:3101 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# Get top stories
curl -X POST http://localhost:3101 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_top_stories","arguments":{"limit":5}}}'

# Search stories
curl -X POST http://localhost:3101 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"search_stories","arguments":{"query":"AI agents","hits":5}}}'
```

## API Reference

| API | URL | Auth | Rate limit |
|-----|-----|------|------------|
| HN Firebase (items) | `https://hacker-news.firebaseio.com/v0/item/{id}.json` | None | Be respectful |
| HN Firebase (stories) | `https://hacker-news.firebaseio.com/v0/topstories.json` | None | Be respectful |
| HN Firebase (users) | `https://hacker-news.firebaseio.com/v0/user/{username}.json` | None | Be respectful |
| HN Algolia (search) | `https://hn.algolia.com/api/v1/search?query={query}` | None | 1 req/sec |

## Test Results

```
=== Hacker News MCP Test Suite ===

  ✓ initialize — returns protocolVersion + serverInfo
  ✓ tools/list — returns 6 tools
  ✓ get_top_stories — returns array of stories with titles
  ✓ get_best_stories — returns array of best stories
  ✓ search_stories — search for 'AI agents' returns results
  ✓ get_user — fetch 'pg' (Paul Graham) profile
  ✓ get_new_stories — returns newest stories
  ✓ error handling — search without query returns error
  ✓ error handling — unknown tool name returns error
  ✓ get_story — fetch item ID 1 (Y Combinator)

=== Results: 10 passed, 0 failed ===
```

## Review Log

### Review 1: Functionality
- All 6 tools tested and working with real API calls
- Error handling covers: missing params, unknown tools, API failures
- Cache works (60s TTL, max 100 entries, LRU eviction)
- JSON-RPC 2.0 protocol correct (initialize, tools/list, tools/call)
- Content-Type headers set correctly
- CORS headers set for browser access
- Status: PASS

### Review 2: Security
- No user input used in URL construction without encoding (encodeURIComponent used for search queries)
- No SQL injection risk (no SQL used)
- No SSRF risk (URLs are hardcoded to hacker-news.firebaseio.com and hn.algolia.com)
- No sensitive data logged (only URLs and tool names)
- Input validation: required params checked, limits capped (max 30 stories, max 50 search results)
- No external dependencies (zero npm deps = zero supply chain risk)
- Status: PASS

### Review 3: Quality
- TypeScript types used throughout (IncomingMessage, ServerResponse)
- Code is clean and readable (switch statement for tool dispatch)
- README is comprehensive (utility analysis, installation, tools table, examples, API reference)
- Package.json has correct metadata (name, version, scripts, keywords, license)
- Cache implementation is simple and correct (Map with TTL + LRU)
- Error messages are descriptive
- Status: PASS

## License

AL-1.0 (AliceLabs Source-Available License). Commercial use requires a license from AliceLabs LLC.

## MarketNow Listing

To list this MCP server on [MarketNow](https://marketnow.site):
1. Ensure the server is publicly accessible (deploy to Cloudflare Workers or Vercel)
2. Submit to MarketNow via the `marketnow_submit_skill` MCP tool
3. MarketNow will verify the server and issue a Trust Card

## Built by

AliceLabs LLC — Sheridan, Wyoming, USA
hello@alicelabs.site
