# AI Product Descriptions

> Shopify app that generates multilingual (ES/EN/PT) product descriptions using AI.
> Built by **AliceLabs LLC** (Sheridan, Wyoming, USA).

## Live URLs

- **Worker**: https://shopify-app.eddyflores100.workers.dev
- **Install**: `/install?shop=YOUR-STORE.myshopify.com`
- **App**: `/app` (embedded in Shopify admin after install)
- **Debug**: `/debug`

## Stack

- **Cloudflare Workers** (runtime + edge compute)
- **Cloudflare KV** (binding `TOKENS` — shop access tokens)
- **Z.AI internal API** (AI generation via `internal-api.z.ai/v1/chat/completions`)
- **Template fallback** (works without AI API key)

## Architecture

```
Shopify OAuth install flow
  → /install?shop=YOUR-STORE
    → 302 redirect to /admin/oauth/authorize
  → /auth/callback?code=...&shop=...&state=...
    → Verify state CSRF
    → Exchange code for access_token
    → Save to KV (keyed by shop)
    → Register webhooks: products/create, products/update, app/uninstalled
    → Register GDPR webhooks
    → Show success page

Embedded app (/app in Shopify admin iframe)
  → Detect shop from URL ?shop=... or cookie
  → Show landing + product title input + language picker
  → POST /api/generate → AI generates description (with template fallback)

Webhook flow (products/create or products/update)
  → HMAC verification
  → Get shop access_token from KV
  → AI generate description
  → PUT /admin/api/2024-10/products/{id}.json with body_html
```

## Pricing

- **Free during beta** for dev stores
- Production pricing (TBD when published to App Store):
  - Starter: $9/mo — 100 descriptions/mo, 1 language
  - Pro: $29/mo — 1,000 descriptions/mo, 3 languages
  - Unlimited: $49/mo — unlimited, all languages

## Security

- ✅ HMAC signature verification on all Shopify webhooks
- ✅ HTML escape on all user-provided content (XSS protection)
- ✅ State CSRF protection on OAuth flow
- ✅ Shop domain regex validation (prevents injection)
- ✅ Rate limiting on /install and /api/generate (20 req/min/IP)
- ✅ HttpOnly + Secure + SameSite cookies
- ✅ GDPR webhooks (customers/redact, shop/redact, customers/data_request)
- ✅ App uninstall webhook (cleans up all shop data)

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/` `/app` | App landing (embedded in Shopify admin) |
| GET | `/install` | Install form (or 302 redirect with shop param) |
| GET | `/auth/callback` | OAuth callback |
| POST | `/webhooks/products` | Product create/update + app/uninstalled webhooks |
| POST | `/webhooks/gdpr/customers-redact` | GDPR customer data deletion |
| POST | `/webhooks/gdpr/shop-redact` | GDPR shop data deletion |
| POST | `/webhooks/gdpr/data-request` | GDPR data export request |
| POST | `/api/generate` | Generate product description |
| GET | `/privacy-policy` | Privacy policy |
| GET | `/terms` | Terms of service |
| GET | `/debug` | Debug endpoint |

## Required Cloudflare secrets

```bash
wrangler secret put SHOPIFY_CLIENT_ID --name shopify-app
wrangler secret put SHOPIFY_CLIENT_SECRET --name shopify-app
wrangler secret put ZAI_TOKEN --name shopify-app
wrangler secret put ZAI_CHAT_ID --name shopify-app
wrangler secret put ZAI_USER_ID --name shopify-app
```

## Local development

```bash
cd shopify-apps/ai-product-descriptions
npx wrangler dev
```

## Deploy

```bash
npx wrangler deploy --name shopify-app --compatibility-date 2026-09-01
```

## Audit history

- **2026-10-07**: v2.0.0 — Full security audit + fixes
  - Added HMAC verification on all webhooks
  - Added GDPR webhooks (mandatory for App Store approval)
  - Added app/uninstalled handler (KV cleanup on uninstall)
  - Added rate limiting (20 req/min/IP)
  - Added HTML escaping (XSS prevention)
  - Added shop domain regex validation
  - Added /privacy-policy, /terms endpoints

## License

MIT — AliceLabs LLC

## Contact

- **Email**: hello@alicelabs.site
- **GitHub**: github.com/eddyflores100-lang/orbita-landing
- **GitLab**: gitlab.com/alicelabs/ai-product-descriptions (mirror)
