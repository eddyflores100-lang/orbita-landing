# RecoveryMail AI

> Shopify app that generates personalized abandoned cart recovery emails using AI.
> Built by **AliceLabs LLC** (Sheridan, Wyoming, USA).

## Live URLs

- **Worker**: https://recoverymail-ai.eddyflores100.workers.dev
- **Install**: `/install?shop=YOUR-STORE.myshopify.com`
- **Dashboard**: `/app` (embedded in Shopify admin after install)
- **Debug**: `/debug`

## Stack

- **Cloudflare Workers** (runtime + edge compute)
- **Cloudflare KV** (binding `STORE` — tokens, pending carts, generated emails)
- **Cloudflare Cron Triggers** (daily 9am UTC sweep)
- **Z.AI internal API** (AI generation via `internal-api.z.ai/v1/chat/completions`)
- **MailChannels** (free email sending for Cloudflare Workers)

## Architecture

```
Shopify webhook (carts/update, checkouts/*)
  → /webhooks/abandoned-cart
    → HMAC verification (X-Shopify-Hmac-Sha256)
    → Save pending cart to KV (TTL 7 days)

Cron trigger (daily 9am UTC)
  → Sweep pending carts older than 1 hour
  → Fetch product details via Admin API
  → Generate subject + body via Z.AI (with template fallback)
  → Save as email:pending_approval in KV (TTL 30 days)

Dashboard (/app embedded in Shopify admin)
  → List pending_approval + sent emails
  → Approve → POST /send-email
    → Send via MailChannels
    → Mark as sent
    → Increment shop counter
  → Dismiss → POST /dismiss-email
```

## Pricing

- **Free**: 10 emails/month, ES/EN/PT, 1 store
- **Pro**: $29/month — unlimited emails, multi-store, A/B testing (coming soon)
- **Annual**: $290/year — 2 months free + priority support (coming soon)

## Security

- ✅ HMAC signature verification on all Shopify webhooks
- ✅ HTML escape on all user-provided content (XSS protection)
- ✅ State CSRF protection on OAuth flow
- ✅ Shop domain regex validation (prevents injection)
- ✅ Cross-shop access control (cookie + KV key validation)
- ✅ Rate limiting on /install and /api/generate (20 req/min/IP)
- ✅ HttpOnly + Secure + SameSite cookies
- ✅ GDPR webhooks (customers/redact, shop/redact, customers/data_request)
- ✅ App uninstall webhook (cleans up all shop data)

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/` `/app` | Dashboard (embedded in Shopify admin) |
| GET | `/install` | Install form (or 302 redirect with shop param) |
| GET | `/auth/callback` | OAuth callback |
| POST | `/webhooks/abandoned-cart` | Cart/checkout/order webhooks |
| POST | `/webhooks/gdpr/customers-redact` | GDPR customer data deletion |
| POST | `/webhooks/gdpr/shop-redact` | GDPR shop data deletion |
| POST | `/webhooks/gdpr/data-request` | GDPR data export request |
| POST | `/send-email` | Send a generated email via MailChannels |
| POST | `/dismiss-email` | Dismiss a pending email |
| GET | `/upgrade` | Upgrade page (coming soon) |
| GET | `/privacy-policy` | Privacy policy |
| GET | `/terms` | Terms of service |
| GET | `/debug` | Debug endpoint (env info + KV contents) |

## Required Cloudflare secrets

```bash
wrangler secret put SHOPIFY_CLIENT_ID --name recoverymail-ai
wrangler secret put SHOPIFY_CLIENT_SECRET --name recoverymail-ai
wrangler secret put ZAI_TOKEN --name recoverymail-ai
wrangler secret put ZAI_CHAT_ID --name recoverymail-ai
wrangler secret put ZAI_USER_ID --name recoverymail-ai
# Optional (MailChannels is free but API key improves deliverability):
wrangler secret put MAILCHANNELS_API_KEY --name recoverymail-ai
```

## Local development

```bash
cd shopify-apps/recoverymail-ai
npx wrangler dev
```

## Deploy

```bash
npx wrangler deploy --name recoverymail-ai --compatibility-date 2026-09-01
```

## Audit history

- **2026-10-07**: v2.0.0 — Full security audit + fixes
  - Added HMAC verification on all webhooks
  - Fixed critical bug: orders/create was being skipped before cleanup
  - Added GDPR webhooks (mandatory for App Store approval)
  - Added app/uninstalled handler (KV cleanup on uninstall)
  - Added rate limiting (20 req/min/IP)
  - Added HTML escaping (XSS prevention)
  - Added shop domain regex validation
  - Added cross-shop access control
  - Added /privacy-policy, /terms, /upgrade endpoints

## License

MIT — AliceLabs LLC (source-available AL-1.0 for commercial use, see LICENSE file)

## Contact

- **Email**: hello@alicelabs.site
- **GitHub**: github.com/eddyflores100-lang/orbita-landing
- **GitLab**: gitlab.com/alicelabs/recoverymail-ai (mirror)
