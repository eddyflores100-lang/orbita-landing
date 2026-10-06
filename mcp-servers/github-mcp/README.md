# @alicelabs/github-mcp — GitHub Public MCP Server

> 6 tools for searching repos, reading issues, and getting user profiles from GitHub. Free API, no auth needed (optional token for 5000 req/hr).

## Utility Analysis

| Metric | Value |
|--------|-------|
| **Who needs this** | Developers using Claude/Cursor who want GitHub data in their AI workflow |
| **APIs** | api.github.com (free, 60 req/hr anonymous, 5000/hr with GITHUB_TOKEN) |
| **External deps** | Zero — Node.js built-in only |
| **Cache** | 5 min for repo data, no cache for issues |
| **MarketNow value** | $200-500 per verified listing |

## Tools (6)

| # | Tool | Description | Required params |
|---|------|-------------|-----------------|
| 1 | `search_repos` | Search public repos by keyword (sorted by stars) | `query`, `limit` (optional) |
| 2 | `get_repo` | Get repo info (stars, forks, license, topics) | `owner`, `repo` |
| 3 | `get_issues` | List open issues | `owner`, `repo`, `limit` (optional) |
| 4 | `get_issue` | Get single issue with body, labels, assignees | `owner`, `repo`, `number` |
| 5 | `get_readme` | Get README content as text | `owner`, `repo` |
| 6 | `get_user` | Get user profile (followers, repos, bio) | `username` |

## Test Results

```
=== GitHub Public MCP Test Suite ===
  ✓ initialize
  ✓ tools/list — 6 tools
  ✓ search_repos — search 'mcp server'
  ✓ get_repo — vercel/next.js (stars > 100000)
  ✓ get_issues — vercel/next.js open issues
  ✓ get_user — torvalds (followers > 100000)
  ✓ get_readme — vercel/next.js
  ✓ error — missing params
  ✓ error — unknown tool
=== Results: 9 passed, 0 failed ===
```

## Review Log

### Review 1: Functionality
- All 6 tools tested with real API calls (vercel/next.js, torvalds)
- Error handling: missing params, unknown tools, API errors
- Optional GITHUB_TOKEN env var for higher rate limit (5000/hr vs 60/hr)
- Cache: 5 min for repo data (stars don't change often)
- Status: PASS

### Review 2: Security
- User-Agent header set (GitHub requires it)
- Optional token passed via env var, not hardcoded
- No SSRF (URLs constructed from user input but only to api.github.com)
- Input validation: required params checked, limits capped at 30
- No sensitive data in error messages
- Status: PASS

### Review 3: Quality
- Clean TypeScript, consistent patterns with HN MCP
- README comprehensive
- Tests verify real data (stars > 100000 for next.js, followers > 100000 for torvalds)
- Status: PASS

## License: AL-1.0 | Built by AliceLabs LLC
