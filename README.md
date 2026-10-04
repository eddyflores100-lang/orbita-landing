# Órbita — assisted property-content pilot

A commercial landing for a scoped property video/microsite service. Includes an existing prerecorded sample, a real sample page, and an inquiry brief that the visitor sends manually through email.

## Build and preview

```sh
npm ci
npm run build
npm run typecheck
python3 -m http.server 3000 --directory out
```

Next.js exports the site into `out/`. Publish that directory at the root of the configured hostname. `NEXT_PUBLIC_APP_URL` controls the canonical origin at build time. No Next server, database or AI provider key is required by the current landing.

## What's available

- `/`: service scope, prerecorded sample, delivery process and inquiry.
- `/p/la-floresta-199/`: a playable sample, explicitly not a property listing or interactive 3D tour.
- `/legal/*`: site behavior and pilot proposal conditions.
- `/api/`, `/api/mcp/`, `/openapi.json`: static capability notices. No production automation tools are exposed.
- Existing city/news paths remain navigable as neutral notices; generic city/old announcement pages are noindex and not promoted through sitemaps.

The inquiry form does not store or transmit a lead. The user reviews a summary, then sends an email or copies it manually. No synthetic success message or automatic photo upload is shown.

## Integration change

The former MCP route advertised tools that called absent `/api/orbita/*` routes. These are now explicitly unavailable, not silently simulated. Automated rendering, property storage, analytics, MLS integrations and 3D reconstruction require a separately validated backend and are not sold by this landing. Old UI components remain source references but are not routed into the website.

## CI and deployment

Every PR and main/fix push builds, typechecks and uploads `orbita-static`. Production publication is an explicit workflow dispatch on main, with `deploy=true`, using the production environment. Configure `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets; set `ORBITA_PUBLIC_URL` to the confirmed hostname. The existing Pages project name is `orbita` and must match the account configuration.

Historical failed run 36092926297 built successfully but deployment failed because `CLOUDFLARE_API_TOKEN` was empty. This change does not create missing credentials or claim a successful live deployment. The publishing script no longer rewrites git history or force-pushes main.

See `docs/PILOT-OPERATIONS.md` for acceptance, quoting and launch steps.
