# Órbita — Property Content Engine

> **AI video + 3D tours + bilingual microsites for US Hispanic real estate agents.**
> Live at **[orbita.pages.dev](https://orbita.pages.dev)**

[![Deploy to Cloudflare Pages](https://github.com/eddyflores100-lang/orbita-landing/actions/workflows/deploy-cloudflare.yml/badge.svg)](https://github.com/eddyflores100-lang/orbita-landing/actions/workflows/deploy-cloudflare.yml)
[![License: AL-1.0](https://img.shields.io/badge/license-AL--1.0-blue.svg)](https://alicelabs.site/licenses/al-1.0)

---

## What is Órbita?

Órbita turns property photos into cinematic AI video, interactive 3D tours, public microsites with QR codes, and per-property analytics — in 15 minutes, no production crew required.

Built for **US Hispanic real estate agents** serving the 62M Latino market with $2.4T in buying power.

## Quick start

```bash
# 1. Install dependencies
bun install

# 2. Copy env file and add your API keys
cp .env.example .env
# Edit .env with your Z-AI API key and (optionally) search console verification tokens

# 3. Run dev server
bun run dev
# Visit http://localhost:3000
```

## Deploy to orbita.pages.dev (one command)

```bash
# 1. Export your GitHub token (Settings → Developer settings → Personal access tokens → repo + workflow scopes)
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxx

# 2. Run the deploy script
bash scripts/deploy-github-cloudflare.sh
```

The script:
1. Squashes git history into one clean commit
2. Pushes to `github.com/eddyflores100-lang/orbita-landing`
3. The GitHub Action (`.github/workflows/deploy-cloudflare.yml`) auto-builds and deploys to Cloudflare Pages

Then connect the GitHub repo to Cloudflare Pages (Workers & Pages → Create → Connect to Git) with:
- **Project name**: `orbita`
- **Framework preset**: Next.js
- **Build command**: `bun run pages:build`
- **Build output directory**: `.vercel/output/static`

Live URL: `https://orbita.pages.dev`

## What's in this repo

### Landing page (12 sections)
1. **Hero** — Video demo (CogVideoX-3 La Floresta, 16:9), stats strip (50+ cities, 18 MLS)
2. **USA Focus** — Market stats (62M Hispanics, $2.4T), Tier 1 cities grid (8 markets), Tier 2 chips (16 cities), state-by-state tax regime + MLS table
3. **Compliance** — Fair Housing Act, RESPA, TRID, NAR, MLS rules; Foreign National programs (ITIN, Non-QM, DSCR, §1031, FIRPTA)
4. **MLS Integration** — MLS Grid (RESO Web API) + 18 MLS systems + NAHREP Top-250 brokerages
5. **Free APIs** — 16 free third-party APIs (Census, Google Maps, GreatSchools, FBI Crime, NOAA, FEMA, Wikipedia)
6. **Pipeline** — 10 phases (ingest → GLM-4.5v vision → AI Director → CogVideoX-3 → montage → music → voiceover → 3D tour → microsite → analytics)
7. **Agents** — 5 US-specific agent types (Realtor bilingual, Foreign National, Investor, Luxury, Cross-border)
8. **Demo** — Real demo videos (16:9 + 9:16), 3 format outputs, microsite link
9. **Integrations** — MCP server, OpenAPI, WhatsApp Business, n8n/Zapier, Instagram Reels
10. **Cities** — 50 USA + 32 LATAM = 82 geo pages
11. **Pricing** — 4 tiers (Starter $19, Pro $49, Agency $199, Enterprise)
12. **FAQ** — 10 honest Q&A + final CTA

### Agent-facing infrastructure
- `/openapi.json` — OpenAPI 3.1 spec (10 paths, 3 schemas)
- `/api/mcp` — MCP server (JSON-RPC 2.0, 12 tools for Claude/Cursor/Cline)
- `/.well-known/ai-plugin.json` — ChatGPT plugin manifest
- `/.well-known/agent.json` — W3C Agent Card
- `/.well-known/security.txt` — Security policy
- `/llms.txt` — LLM summary
- `/agents.txt` — AI crawler policy

### Multi-sitemap (6 files)
- `/sitemap.xml` — index listing 5 children
- `/sitemap-main.xml` — static pages
- `/sitemap-usa.xml` — 48 USA city pages (priority 0.9)
- `/sitemap-latam.xml` — LATAM city pages (priority 0.8)
- `/sitemap-images.xml` — image sitemap
- `/sitemap-news.xml` — Google News compliant (5 press releases at `/news`)

### SEO verification meta tags (8 providers)
- `google-site-verification`, `msvalidate.01` (Bing), `yandex-verification`, `baidu-site-verification`, `p:domain_verify` (Pinterest), `facebook-domain-verification`, `apple-developer-app-identifier`, `norton-safeweb-site-verification`

### JSON-LD schema.org (9 entity types)
- `Organization` — AliceLabs LLC
- `SoftwareApplication` — Órbita
- `WebSite` + `SearchAction` — Google sitelinks search box
- `Place`, `LocalBusiness`, `Service`, `FAQPage` — on every geo page
- `BreadcrumbList` — on every geo page
- `NewsArticle` — on every news item

## Tech stack

- **Framework**: Next.js 16 App Router + React 19 + TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui (New York style)
- **Animations**: Framer Motion
- **AI**: z-ai-web-dev-sdk (CogVideoX-3, GLM-4.5v, TTS, LLM)
- **3D**: Three.js + Depth Anything V2 (ONNX)
- **Image**: sharp
- **Video**: FFmpeg + ffprobe
- **QR**: qrcode@1.5.4
- **Deploy**: Cloudflare Pages via `@cloudflare/next-on-pages`

## 82 geo pages

### 50 USA cities (Tier 1 + 2 + 3)
**Tier 1 (8)**: Miami, Houston, Los Angeles, Dallas-Fort Worth, San Antonio, San Diego, Phoenix, Las Vegas
**Tier 2 (16)**: Riverside, Austin, Chicago, NYC, Orlando, Tampa, Denver, Atlanta, Charlotte, El Paso, Albuquerque, Boston, Washington DC, Seattle, Fort Lauderdale, Naples
**Tier 3 (26)**: Tucson, Sacramento, Fresno, Long Beach, Bakersfield, Anaheim, Santa Ana, Reno, Boise, Salt Lake City, Santa Fe, Jacksonville, Sarasota, Oklahoma City, Tulsa, Memphis, Nashville, Columbus, Cleveland, Philadelphia, Baltimore, Brownsville, McAllen, Laredo, ...

### 32 LATAM cities
Ecuador (7), Perú (6), Colombia (6), México (6), Argentina (4), Chile (3), España (5)

## Documentation

- [Deployment guide](download/DEPLOYMENT-GUIDE.md) — Vercel, Cloudflare Pages, Hostinger VPS
- [License (AL-1.0)](https://alicelabs.site/licenses/al-1.0) — source-available, commercial use requires license

## Built by

**AliceLabs LLC** — Sheridan, Wyoming, USA
- Email: hello@alicelabs.site
- GitHub: [@eddyflores100-lang](https://github.com/eddyflores100-lang)
- Canonical org: [github.com/alicelabs-llc](https://github.com/alicelabs-llc)

## License

AL-1.0 (source-available, commercial use requires license). See [AliceLabs Licensing](https://alicelabs.site/licenses/al-1.0).
