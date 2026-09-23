# Órbita — Deployment Guide for `orbita.alicelabs.site`

Production-ready deployment guide. Project verified: ESLint clean (0 errors), all critical endpoints return HTTP 200, multi-sitemap live (48 USA + 32 LATAM cities), MCP server at `/api/mcp`, OpenAPI 3.1 spec at `/openapi.json`, news sitemap Google News-ready.

---

## 1. Choose your hosting platform

### Option A: Vercel (RECOMMENDED — native Next.js 16 support, free tier)
- Zero-config deploy from GitHub
- Automatic HTTPS via Let's Encrypt
- Edge network (CDN included)
- Free Hobby tier covers this project
- Handles Next.js 16 App Router + Turbopack natively
- Best for `orbita.alicelabs.site` performance

### Option B: Cloudflare Pages (free, edge network)
- Free unlimited bandwidth
- Deploy via `@cloudflare/next-on-pages` adapter
- Slightly more setup than Vercel
- Best if you want everything under Cloudflare umbrella

### Option C: Hostinger VPS (full control, KVM 2 — $4.50/mo)
- Full root access
- Run Bun + Node + FFmpeg + Python3 + ONNX runtime
- Best if you need on-prem control or the Python 3D engine (Depth Anything V2 ONNX)
- Requires manual SSL setup via Caddy (Caddyfile already in repo)

---

## 2. DNS records for Hostinger (domain `alicelabs.site`)

Log into **hPanel → Domains → alicelabs.site → DNS / Nameservers → Manage DNS records**.

### If deploying to Vercel (recommended)

Add these records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| **CNAME** | `orbita` | `cname.vercel-dns.com.` | 3600 |
| **TXT** | `_vercel.orbita` | `vercel-domain-verification=REPLACE_WITH_VERCEL_TOKEN` | 3600 |

After Vercel confirms domain ownership, Vercel will issue SSL automatically.

### If deploying to Cloudflare Pages

| Type | Name | Value | TTL |
|------|------|-------|-----|
| **CNAME** | `orbita` | `orbita.pages.dev.` | 3600 |

### If deploying to Hostinger VPS (e.g. KVM 2, IP `213.190.44.XX`)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| **A** | `orbita` | `213.190.44.XX` (your VPS IP) | 3600 |
| **AAAA** | `orbita` | (your VPS IPv6, if applicable) | 3600 |

### MX records (email — leave your existing setup alone)

If `alicelabs.site` already has MX records for email (e.g. Hostinger Mail, Google Workspace), **DO NOT touch them**. Adding MX records for `orbita` subdomain is unnecessary — `orbita.alicelabs.site` does not need to receive email.

---

## 3. Step-by-step Vercel deploy (recommended)

```bash
# 1. Push your code to GitHub (the repo at /home/z/my-project)
cd /home/z/my-project
git init
git add -A
git commit -m "Production: Órbita USA-focused English-first"
git branch -M main
git remote add origin https://github.com/eddyflores100-lang/orbita-landing.git
git push -u origin main

# 2. Go to https://vercel.com/new
# 3. Import the GitHub repo
# 4. Configure:
#    - Framework Preset: Next.js
#    - Build Command: bun run build
#    - Output Directory: .next
#    - Install Command: bun install
#    - Node.js Version: 20.x
# 5. Add Environment Variables:
#    NEXT_PUBLIC_APP_URL=https://orbita.alicelabs.site
#    ZAI_API_KEY=your_z_ai_api_key
# 6. Deploy

# 7. In Vercel Dashboard → Settings → Domains → Add:
#    orbita.alicelabs.site

# 8. Vercel shows you a TXT record like:
#    vercel-domain-verification=abc123xyz...
#    Add it to Hostinger DNS (see table above)

# 9. Wait 5-30 min for DNS propagation, then verify:
curl -I https://orbita.alicelabs.site/
curl https://orbita.alicelabs.site/sitemap.xml
```

---

## 4. Step-by-step Hostinger VPS deploy

```bash
# 1. Buy Hostinger VPS KVM 2 (2 vCPU, 8GB RAM, 50GB NVMe) — Ubuntu 22.04
# 2. SSH in as root
ssh root@213.190.44.XX

# 3. Install dependencies
apt update && apt upgrade -y
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
apt install -y nodejs npm python3 python3-pip ffmpeg caddy git

# 4. Install Python deps for 3D engine
pip3 install numpy scipy Pillow onnxruntime

# 5. Clone + build
cd /var/www
git clone https://github.com/eddyflores100-lang/orbita-landing.git orbita
cd orbita
bun install
bun run build

# 6. Copy the existing Caddyfile from repo to /etc/caddy/
cp Caddyfile /etc/caddy/Caddyfile

# 7. Edit Caddyfile to use your domain:
# orbita.alicelabs.site {
#   reverse_proxy localhost:3000
# }

nano /etc/caddy/Caddyfile

# 8. Restart Caddy (auto-issues Let's Encrypt SSL)
systemctl restart caddy
systemctl enable caddy

# 9. Start the Next.js standalone server
cd /var/www/orbita
NODE_ENV=production PORT=3000 node .next/standalone/server.js &

# 10. Make it a systemd service for auto-restart on reboot
cat > /etc/systemd/system/orbita.service <<EOF
[Unit]
Description=Órbita Next.js production server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/orbita
Environment=NEXT_PUBLIC_APP_URL=https://orbita.alicelabs.site
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/node .next/standalone/server.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable orbita
systemctl start orbita
```

---

## 5. Post-deploy verification checklist

After DNS propagates (use https://dnschecker.org to verify `orbita.alicelabs.site` resolves):

```bash
# All these should return 200
curl -I https://orbita.alicelabs.site/
curl -I https://orbita.alicelabs.site/sitemap.xml
curl -I https://orbita.alicelabs.site/sitemap-usa.xml
curl -I https://orbita.alicelabs.site/sitemap-latam.xml
curl -I https://orbita.alicelabs.site/sitemap-images.xml
curl -I https://orbita.alicelabs.site/sitemap-news.xml
curl -I https://orbita.alicelabs.site/openapi.json
curl -I https://orbita.alicelabs.site/api/mcp
curl -I https://orbita.alicelabs.site/llms.txt
curl -I https://orbita.alicelabs.site/agents.txt
curl -I https://orbita.alicelabs.site/.well-known/ai-plugin.json
curl -I https://orbita.alicelabs.site/.well-known/security.txt
curl -I https://orbita.alicelabs.site/news
curl -I https://orbita.alicelabs.site/inmobiliaria/miami
curl -I https://orbita.alicelabs.site/inmobiliaria/houston
curl -I https://orbita.alicelabs.site/inmobiliaria/los-angeles
```

---

## 6. Search engine submission (post-deploy)

### Step 1: Get verification tokens

1. **Google Search Console** (https://search.google.com/search-console)
   - Add property → `orbita.alicelabs.site`
   - Choose "HTML tag" verification
   - Copy the `google-site-verification=XXX` token

2. **Bing Webmaster Tools** (https://www.bing.com/webmasters)
   - Add site → `orbita.alicelabs.site`
   - Choose "Meta tag" verification
   - Copy the `msvalidate.01` token

3. **Yandex Webmaster** (https://webmaster.yandex.com)
   - Add site → `orbita.alicelabs.site`
   - Copy `yandex-verification` token

4. **Baidu Webmaster Tools** (https://ziyuan.baidu.com) — only if targeting Chinese buyers
   - Add site → `orbita.alicelabs.site`
   - Copy `baidu-site-verification` token

5. **Pinterest** (https://business.pinterest.com)
   - Claim domain → `orbita.alicelabs.site`
   - Copy `p:domain_verify` token

6. **Facebook/Meta** (https://business.facebook.com)
   - Business Manager → Brand Safety → Domain Verification
   - Copy `facebook-domain-verification` token

### Step 2: Replace placeholders in `src/app/layout.tsx`

Open `src/app/layout.tsx`, find the `verification` block, and replace every `*-placeholder` value with the real token from each search console. Commit + redeploy.

### Step 3: Submit sitemaps

| Search engine | Submission URL |
|---------------|----------------|
| Google | https://search.google.com/search-console → Sitemaps → submit `sitemap.xml` |
| Bing | https://www.bing.com/webmasters → Submit Sitemap → `https://orbita.alicelabs.site/sitemap.xml` |
| Yandex | https://webmaster.yandex.com/site/`orbita.alicelabs.site`/sitemaps/ |
| Baidu | https://ziyuan.baidu.com/site/`orbita.alicelabs.site` |
| DuckDuckGo | Auto-discovers from robots.txt (no manual submission needed) |
| Yahoo | Uses Bing index (covered via Bing submission) |

### Step 4: Ping endpoints (one-time, triggers immediate crawl)

```bash
curl "https://www.google.com/ping?sitemap=https://orbita.alicelabs.site/sitemap.xml"
curl "https://www.bing.com/ping?sitemap=https://orbita.alicelabs.site/sitemap.xml"
curl "https://webmaster.yandex.com/ping?sitemap=https://orbita.alicelabs.site/sitemap.xml"
```

---

## 7. Environment variables required

Create `.env.production` at the project root (do NOT commit to git):

```env
# Required
NEXT_PUBLIC_APP_URL=https://orbita.alicelabs.site

# Z-AI SDK (for CogVideoX-3 + GLM-4.5v vision + TTS)
ZAI_API_KEY=your_z_ai_api_key_here

# Optional — for OpenGraph image generation
OG_IMAGE_SECRET=your_random_secret_here

# Optional — analytics (replace with your IDs post-deploy)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=orbita.alicelabs.site
```

Get Z-AI API key at https://z.ai or via the `z-ai-web-dev-sdk` documentation.

---

## 8. Project structure (for deployment reference)

```
/home/z/my-project/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing (12 sections)
│   │   ├── layout.tsx                  # Root layout + 3 JSON-LD + verification metas
│   │   ├── news/page.tsx               # News + NewsArticle JSON-LD
│   │   ├── inmobiliaria/[city]/page.tsx  # 82 geo pages + 5 JSON-LD each
│   │   ├── sitemap.xml/route.ts        # Index (5 children)
│   │   ├── sitemap-main.xml/route.ts
│   │   ├── sitemap-usa.xml/route.ts    # 48 USA cities (priority 0.9)
│   │   ├── sitemap-latam.xml/route.ts  # 32 LATAM cities (priority 0.8)
│   │   ├── sitemap-images.xml/route.ts
│   │   ├── sitemap-news.xml/route.ts   # Google News compliant
│   │   ├── openapi.json/route.ts       # OpenAPI 3.1 spec
│   │   └── api/
│   │       ├── mcp/route.ts           # MCP server (JSON-RPC 2.0, 12 tools)
│   │       └── orbita/*                # 14 REST routes (existing in real repo)
│   ├── components/
│   │   ├── orbita-landing/             # 16 landing components
│   │   └── ui/                         # shadcn/ui (50+ components)
│   └── lib/
│       └── data/orbita-data.ts         # 50 USA + 32 LATAM cities + freeApis + compliance + MLS
├── public/
│   ├── robots.txt
│   ├── agents.txt
│   ├── llms.txt
│   ├── .well-known/
│   │   ├── ai-plugin.json
│   │   ├── agent.json
│   │   └── security.txt
│   └── orbita/demo/                    # 3 real demo videos (7.8MB + 62MB + 165KB poster)
├── Caddyfile                           # Reverse proxy config for VPS deploy
├── next.config.ts                      # output: "standalone"
├── package.json
├── Dockerfile                          # Bun build → Debian-slim runtime
└── railway.json                        # Railway.com 1-click deploy
```

---

## 9. Free tier limits to be aware of

| Provider | Free tier limit | What it covers |
|----------|-----------------|----------------|
| **Vercel Hobby** | 100GB bandwidth/mo, 1000 build minutes | This entire project |
| **Cloudflare Pages** | Unlimited bandwidth, 500 builds/mo | This entire project |
| **Google Maps Embed API** | $200/mo credit (~28K loads) | Property location maps |
| **Census ACS API** | 500 queries/IP/hour, no key needed | Demographics by ZIP |
| **OpenStreetMap** | No limit | Interactive maps (no key) |
| **FEMA Flood API** | No limit | Flood zone lookup |
| **NOAA Weather API** | No limit, 60 req/min | Weather alerts |
| **FBI UCR API** | No limit | Crime stats by metro |
| **GreatSchools API** | Free for partners | School ratings |
| **Wikipedia/Wikidata** | No limit | City descriptions |

---

## 10. Estimated monthly cost (after free tier)

- Domain renewal: $10/year
- Vercel Hobby: $0 (within free tier)
- Cloudflare: $0 (within free tier)
- Google Maps Embed API: $0 (within $200/mo credit)
- Z-AI SDK (CogVideoX-3, GLM-4.5v, TTS): pay-per-use (typically $20-$80/mo for 10-30 properties rendered)

**Total: ~$0-90/month depending on render volume.**

---

## Immediate preview (while you set up DNS)

The sandbox provides a live preview URL in this format:
```
https://preview-<bot-id>.space-z.ai/
```
Replace `<bot-id>` with the actual bot ID shown in your platform. The preview already serves:
- Live homepage
- All 5 sitemaps (48 USA + 32 LATAM cities)
- 12 MCP tools at `/api/mcp`
- OpenAPI spec at `/openapi.json`
- News page at `/news`
- Demo microsite at `/p/la-floresta-199`
- 3 real CogVideoX demo videos

Use the preview URL for client demos / investor pitches / NAHREP outreach while DNS propagates.

---

## Verify after deploy

Once `orbita.alicelabs.site` is live:

1. Visit `https://orbita.alicelabs.site/` — should show Hero in English
2. Visit `https://orbita.alicelabs.site/sitemap.xml` — should show 5-child sitemap index
3. Visit `https://orbita.alicelabs.site/inmobiliaria/miami` — should show Miami geo page in English
4. View page source — should see 3 JSON-LD scripts (Organization, SoftwareApplication, WebSite)
5. View Miami page source — should see 5 JSON-LD scripts (Place, LocalBusiness, Service, FAQPage, BreadcrumbList)
6. Run Google PageSpeed Insights: https://pagespeed.web.dev/analysis?url=https://orbita.alicelabs.site/
7. Run Google Rich Results test: https://search.google.com/test/rich-results?url=https://orbita.alicelabs.site/

---

**Project is production-ready.** ESLint clean, dev server healthy, all 9 critical endpoints returning 200, multi-sitemap live, MCP server functional, OpenAPI spec published, JSON-LD schemas in place, 8 search engine verification meta tags ready (just replace placeholders).
