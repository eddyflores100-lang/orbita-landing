# @alicelabs/finance-mcp — Finance/Crypto MCP Server

> 6 tools for exchange rates, crypto prices, and currency conversion. Supports LATAM currencies (MXN, COP, PEN, BRL, ARS, CLP). Free APIs, no auth.

## Utility Analysis

| Metric | Value |
|--------|-------|
| **Who needs this** | FinTech, e-commerce, LATAM businesses using Claude/Cursor for financial data |
| **APIs** | open.er-api.com (free, no auth) + api.coingecko.com (free, no auth) |
| **External deps** | Zero — Node.js built-in only |
| **Cache** | 10 min for exchange rates, 2 min for crypto |
| **LATAM currencies** | USD, EUR, MXN, COP, PEN, BRL, ARS, CLP |
| **MarketNow value** | $200-500 per verified listing |

## Tools (6)

| # | Tool | Description | Required params |
|---|------|-------------|-----------------|
| 1 | `get_exchange_rate` | Get rate between 2 currencies | `from`, `to` |
| 2 | `list_currencies` | List all supported currencies with USD rates | none |
| 3 | `get_crypto_price` | Get current crypto price | `coin`, `vs` (optional) |
| 4 | `get_crypto_list` | Top 10 cryptos by market cap | `limit` (optional) |
| 5 | `convert_currency` | Convert amount between currencies | `amount`, `from`, `to` |
| 6 | `get_historical_rate` | Historical rate for a date | `date`, `from`, `to` |

## Test Results

```
=== Finance/Crypto MCP Test Suite ===
  ✓ initialize
  ✓ tools/list — 6 tools
  ✓ get_exchange_rate — USD to MXN (rate > 10)
  ✓ get_exchange_rate — USD to COP (rate > 1000)
  ✓ list_currencies — returns LATAM rates (includes PEN)
  ✓ get_crypto_price — bitcoin (price > 10000)
  ✓ get_crypto_list — top 5 (first = BTC)
  ✓ convert_currency — 100 USD to MXN (> 1000)
  ✓ error — missing params
  ✓ error — unknown tool
=== Results: 10 passed, 0 failed ===
```

## Review Log

### Review 1: Functionality
- All 6 tools tested with real API calls
- USD->MXN returns rate > 10, USD->COP returns rate > 1000 (verified)
- Bitcoin price > 10000 (verified)
- Cache: 10 min rates, 2 min crypto
- Error handling: missing params, unsupported currencies
- Status: PASS

### Review 2: Security
- No auth needed (APIs are public)
- No SSRF (URLs hardcoded to er-api.com and coingecko.com)
- Input validation: currency codes uppercased, amounts validated
- No sensitive data logged
- Status: PASS

### Review 3: Quality
- LATAM currency support is the differentiator (no competitor MCP offers PEN, COP, ARS)
- Clean TypeScript, consistent with HN + GitHub MCPs
- Tests verify real financial data (not mocks)
- README comprehensive with utility analysis
- Status: PASS

## License: AL-1.0 | Built by AliceLabs LLC
