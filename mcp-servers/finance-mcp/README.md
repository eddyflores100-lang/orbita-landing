# @alicelabs/finance-mcp

A Model Context Protocol (MCP) server that exposes foreign-exchange and cryptocurrency data through six tools. It speaks JSON-RPC 2.0, runs on Node.js built-in modules only (zero npm dependencies), and works with any MCP-compatible client such as Claude Desktop, Cursor, Continue or the reference MCP CLI.

It gives an AI assistant live FX rates and crypto prices: spot rates between any two of 166 currencies, full currency listings, single-coin prices, the top-100 crypto table, arbitrary-amount conversion and historical ECB reference rates.

---

## Utility analysis

Foreign-exchange and crypto data is scattered across providers, each with different request formats, rate limits and currency coverage. An LLM without tooling cannot reliably answer questions such as "how many pesos is 100 dollars", "what did Bitcoin cost today", or "what was the USD/EUR rate on 2024-01-15". This server consolidates three free providers behind six validated, cached, rate-limited tools so a model can:

- Quote a live rate between any two currencies, including all major LATAM currencies (MXN, COP, PEN, CLP, ARS, BRL, CUP).
- Enumerate the full supported currency table with names and USD rates.
- Price a single cryptocurrency or scan the top 100 by market cap.
- Convert an arbitrary amount in one call.
- Retrieve a historical exchange rate for a past date (ECB reference set).

Target users: fintech builders, analysts, travellers, cross-border commerce teams and developers building finance-aware assistants. The server is especially tuned for LATAM use because it validates and documents coverage for USD, EUR, MXN, COP, PEN, CLP, ARS, BRL and CUP.

---

## Installation

### Requirements

- Node.js 18+ (uses the built-in `http`, `https`, `net` and `url` modules).
- An MCP-capable host (Claude Desktop, Cursor, Continue, `mcp` CLI, etc.).
- A TypeScript runtime if you run from source: [Bun](https://bun.sh) (`bun index.ts`) or [tsx](https://www.npmjs.com/package/tsx) (`npx tsx index.ts`).

### Run from source (no build step)

```bash
git clone <this-repo>
cd mcp-servers/finance-mcp
npx tsx index.ts            # stdio transport (default)
npx tsx index.ts --stdio    # explicit stdio
npx tsx index.ts 3456       # TCP transport on port 3456
```

### Publish / install

```bash
npm publish --access public     # publishes @alicelabs/finance-mcp
# then in any project:
npx @alicelabs/finance-mcp
```

---

## Configuration

No environment variables are required.

| Variable           | Default | Description                                                |
| ------------------ | ------- | ---------------------------------------------------------- |
| `MCP_TEST_RUNNER`  | `bun`   | Test only. Runtime used by the test suite to spawn the server. |

All external endpoints are hardcoded to `https://open.er-api.com/v6`, `https://api.frankfurter.dev/v1` and `https://api.coingecko.com/api/v3`.

### Claude Desktop / Cursor configuration

```json
{
  "mcpServers": {
    "finance": {
      "command": "npx",
      "args": ["-y", "tsx", "/absolute/path/to/mcp-servers/finance-mcp/index.ts"]
    }
  }
}
```

---

## Tools

| # | Tool                  | Description                                                                 | Parameters                                                              |
| - | --------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 1 | `get_exchange_rate`   | Live rate from one currency to another (1 base = rate target).             | `base: string` (required, ISO 4217), `target: string` (required)        |
| 2 | `list_currencies`     | All 166 supported currencies with name and USD rate.                        | none                                                                    |
| 3 | `get_crypto_price`   | Current price of a cryptocurrency with market cap and 24h change.          | `id: string` (required, CoinGecko id), `vs?: string` (default `usd`)    |
| 4 | `get_crypto_list`     | Top 100 cryptocurrencies by market cap with price, change, cap, volume.    | `vs?: string` (default `usd`)                                           |
| 5 | `convert_currency`    | Convert an amount from one currency to another at the live rate.            | `amount: number` (required), `from: string` (required), `to: string` (required) |
| 6 | `get_historical_rate` | Historical FX rate for a past date (ECB reference set, ~30 currencies).     | `date: string` (required, YYYY-MM-DD), `base: string` (required), `target: string` (required) |

Each tool returns JSON serialized into an MCP `text` content block. Errors (invalid currency, unsupported historical pair, future date, rate limit) are returned as `isError: true` results with a human-readable message.

### LATAM currency coverage

`get_exchange_rate`, `list_currencies` and `convert_currency` cover all of USD, EUR, MXN, COP, PEN, CLP, ARS, BRL and CUP through the live provider. `get_historical_rate` is limited to the ECB reference set (USD, EUR, MXN, BRL and ~26 others); historical queries for COP, ARS, PEN, CLP and CUP return a clear error rather than a wrong value, with the supported list included so callers can fall back to the latest rate.

---

## Usage examples

### 1. "How many euros is 100 dollars?" (Claude)

> User: Convert 100 USD to EUR.
> Claude: calls `convert_currency` with `{ "amount": 100, "from": "USD", "to": "EUR" }` and reports the converted amount and the rate used.

### 2. "What is the Bitcoin price right now?" (Cursor)

> User: What does one Bitcoin cost today?
> Claude: calls `get_crypto_price` with `{ "id": "bitcoin", "vs": "usd" }` and reports the spot price plus the 24h change.

### 3. "Show me the top 10 cryptocurrencies" (any MCP host)

> User: What are the top 10 cryptocurrencies by market cap?
> Claude: calls `get_crypto_list` with `{}` and returns a ranked table with price, market cap and 24h change.

### 4. "How many Mexican pesos is 250 dollars?" (Claude, LATAM)

> User: I have 250 USD. How many MXN is that?
> Claude: calls `convert_currency` with `{ "amount": 250, "from": "USD", "to": "MXN" }` and reports the peso amount.

### 5. "What was the USD/EUR rate on 15 Jan 2024?" (Claude)

> User: What was the dollar-to-euro exchange rate on 2024-01-15?
> Claude: calls `get_historical_rate` with `{ "date": "2024-01-15", "base": "USD", "target": "EUR" }` and reports the historical rate.

### Manual JSON-RPC call (TCP transport)

```bash
npx tsx index.ts 3456 &
printf '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_exchange_rate","arguments":{"base":"USD","target":"EUR"}}}\n' | nc 127.0.0.1 3456
```

---

## API reference

The server talks to three free, no-auth public APIs:

| Purpose                  | Endpoint                                                                 | Docs |
| ------------------------ | ------------------------------------------------------------------------ | ---- |
| Latest exchange rates    | `GET https://open.er-api.com/v6/latest/{base}`                            | https://www.exchangerate-api.com/docs/free-api |
| Currency coverage        | derived from the `rates` object of the latest-USD response (166 currencies) | as above |
| Historical rates         | `GET https://api.frankfurter.dev/v1/{date}?from={base}&to={target}`       | https://www.frankfurter.app/docs |
| Single crypto price      | `GET https://api.coingecko.com/api/v3/simple/price?ids=...&vs_currencies=...` | https://docs.coingecko.com/reference/simple-price |
| Top-100 crypto list       | `GET https://api.coingecko.com/api/v3/coins/markets?vs_currency=...`     | https://docs.coingecko.com/reference/coins-markets |

> Implementation note: the original spec named `api.exchangerate.host`, which has since introduced a mandatory access key. The server therefore uses `open.er-api.com` (the same vendor's free, key-less endpoint, 166 currencies including every LATAM currency we target) and `frankfurter.dev` (free ECB-backed historical rates). The behaviour and tool surface are unchanged.

---

## Rate limits

| Provider        | Free limit            | When used |
| --------------- | --------------------- | --------- |
| open.er-api.com | ~1,000 requests/month (free tier) | Live rates and currency listing. The 10-minute cache means a single user makes a handful of calls per day. |
| frankfurter.dev | No published hard limit (fair use) | Historical rates only. Cached for 1 minute. |
| CoinGecko       | ~10-30 calls/min (demo tier, no key) | Single-coin price and top-100 list. Returns HTTP 429 when exceeded. |

Mitigations built into the server:

- **Minimum 600 ms** between any two outbound requests (serialized internal queue).
- **Cache TTLs**: exchange rates and the currency list are cached for 10 minutes; crypto prices and the top-100 list for 2 minutes; historical rates for 1 minute.
- CoinGecko 429 responses are surfaced inside the MCP `isError` result (the message includes "rate limit" / "429"), so callers can retry.

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
cd mcp-servers/finance-mcp
bun test.ts          # or: npx tsx test.ts
```

The suite spawns the server on an ephemeral TCP port and exercises `initialize`, `tools/list`, every tool with real API calls (USD->EUR rate > 0, 166 currencies incl. all nine LATAM codes, bitcoin price, top-100 list, USD->MXN conversion, 2024-01-15 historical rate) and five error paths. CoinGecko calls retry on 429 with backoff. Latest observed run: **73 passed, 0 failed** (1 USD = 0.892111 EUR; 100 USD = 1810.61 MXN).

---

## License

Released under the **AL-1.0 (AliceLabs Source-Available)** license. See the `LICENSE` file in the repository root.

---

## MarketNow listing

This package is intended for the MarketNow registry at https://marketnow.site. To list it:

1. Ensure `package.json` has `name: "@alicelabs/finance-mcp"` and a stable `version`.
2. Ensure `README.md` (this file) and `LICENSE` are present at the package root.
3. Tag the release: `git tag v1.0.0 && git push origin v1.0.0`.
4. Publish to npm: `npm publish --access public`.
5. Submit the npm package URL (`https://www.npmjs.com/package/@alicelabs/finance-mcp`) and this README to the MarketNow submission form at https://marketnow.site/submit. Choose category "MCP Server" and add tags `mcp`, `finance`, `exchange-rate`, `crypto`, `latam`, `claude`, `cursor`.
6. Highlight the LATAM currency coverage (USD, EUR, MXN, COP, PEN, CLP, ARS, BRL, CUP) in the listing blurb to help the right users discover it.

---

## Review Log

Three review passes were performed on the server source before release.

### Review 1 -- Functionality
- Verified every tool end-to-end against live APIs (`get_exchange_rate` USD->EUR returned 0.892111; `list_currencies` returned 166 currencies including all nine LATAM codes; `get_crypto_price` bitcoin returned a positive USD price; `get_crypto_list` returned 100 coins; `convert_currency` 100 USD->MXN returned 1810.61; `get_historical_rate` 2024-01-15 USD->EUR returned 0.91366). All return well-formed JSON.
- Confirmed the historical-rate path: validates date format, rejects future dates, rejects dates before 1999-01-04 (ECB data start), and rejects currency pairs outside the ECB set with a helpful list of supported codes.
- Confirmed CoinGecko 429 handling: the error is wrapped as an MCP `isError` result whose text contains "rate limit" / "429"; the test suite retries on this signal.
- Confirmed all error paths: missing required parameter returns `-32602`; unknown tool returns `-32601`; unknown method returns `-32601`; malformed JSON returns `-32700`; tool execution failures (invalid currency code, invalid amount, future date, unsupported historical currency, rate limit) are wrapped as `isError` results.
- Outcome: no functional defects. Status: PASS.

### Review 2 -- Security
- Input validation: currency codes must match `^[A-Z]{3}$` (ISO 4217) and are upper-cased; CoinGecko ids must match `^[a-z0-9][a-z0-9-]{0,49}$`; `vs` must match `^[a-z]{3}$`; `amount` must be a finite non-negative number; `date` must match `^\d{4}-\d{2}-\d{2}$` and pass range checks (no future, not before 1999-01-04).
- URL construction: the base currency is placed in the path after `encodeURIComponent` (post-validation); historical dates use `URL` + `searchParams.set()`; CoinGecko queries use `URL` + `searchParams.set()`. No raw string concatenation into URLs.
- SSRF: outbound hosts are hardcoded constants (`ER_API_BASE`, `FRANKFURTER_BASE`, `COINGECKO_BASE`). User input can only influence path segments or query parameters of those hosts, so a caller cannot redirect requests to an arbitrary server.
- No secrets are handled (all three providers are key-less); no token is logged or returned.
- Outcome: no injection, SSRF, or secret-leak vectors found. Status: PASS.

### Review 3 -- Quality
- Strong typing throughout: `JsonRpcRequest`, `JsonRpcResponse`, `ToolEntry` interfaces; `any` is confined to parsing untyped external JSON and narrowed immediately.
- Code is organized into clearly delimited sections (Types, HTTP helper, Cache, Rate limiter, Constants, Tools, JSON-RPC handler, Transport).
- Removed duplicate keys in the static `CURRENCY_NAMES` map (BRL and CZK were listed twice) during review.
- The currency-name lookup degrades gracefully (codes not in the static map are shown with the code itself as the name), so adding currencies upstream requires no code change.
- Documentation (this README and inline header comments) matches implemented behaviour, including the documented switch from `api.exchangerate.host` to `open.er-api.com` / `frankfurter.dev` and the ECB historical-coverage limitation.
- Outcome: clean, typed, documented. Status: PASS.
