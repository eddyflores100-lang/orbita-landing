import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  return NextResponse.json({
    name: "Órbita API",
    version: "1.0.0",
    description: "Property Content Engine for US Hispanic real estate",
    endpoints: {
      mcp: "/api/mcp",
      openapi: "/openapi.json",
      well_known: {
        ai_plugin: "/.well-known/ai-plugin.json",
        agent_card: "/.well-known/agent.json",
        security: "/.well-known/security.txt",
      },
      sitemaps: [
        "/sitemap.xml",
        "/sitemap-main.xml",
        "/sitemap-usa.xml",
        "/sitemap-latam.xml",
        "/sitemap-images.xml",
        "/sitemap-news.xml",
      ],
      docs: "/llms.txt",
      ai_policy: "/agents.txt",
    },
    live: "https://orbita-9wl.pages.dev",
    github: "https://github.com/eddyflores100-lang/orbita-landing",
    built_by: "AliceLabs LLC (Sheridan, Wyoming, USA)",
    contact: "hello@alicelabs.site",
  });
}
