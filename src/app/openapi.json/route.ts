import { NextResponse } from "next/server"

export const dynamic = "force-static"
export const runtime = "edge"

const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "ÓRBITA — Property Content Engine API",
    description:
      "API for ingesting property photos, running AI vision analysis, AI Director planning, CogVideoX-3 image-to-video rendering, public microsite publishing, dynamic QR generation, and per-property analytics. Built by AliceLabs LLC (Wyoming, USA).",
    version: "1.0.0",
    contact: {
      name: "AliceLabs LLC",
      email: "hello@alicelabs.site",
      url: "https://alicelabs.site",
    },
    license: {
      name: "AL-1.0 (commercial use requires license)",
      url: "https://alicelabs.site/licenses/al-1.0",
    },
  },
  servers: [
    {
      url: "https://orbita.alicelabs.site",
      description: "Production (cloud)",
    },
    {
      url: "http://localhost:3000",
      description: "Local development",
    },
  ],
  tags: [
    { name: "Properties", description: "Property CRUD operations" },
    { name: "Photos", description: "Photo ingestion and management" },
    { name: "AI", description: "AI vision analysis and AI Director planning" },
    { name: "Render", description: "Video render queue and job status" },
    { name: "Microsite", description: "Public microsite publishing" },
    { name: "QR", description: "Dynamic QR code generation" },
    { name: "Analytics", description: "Per-property event analytics" },
    { name: "Tracking", description: "Event tracking for microsites" },
  ],
  paths: {
    "/api/orbita/properties": {
      get: {
        tags: ["Properties"],
        summary: "List all properties",
        description: "Returns all properties. Auto-seeds La Floresta demo if database is empty.",
        operationId: "listProperties",
        responses: {
          "200": {
            description: "List of properties",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/OrbitPropertyDTO" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Properties"],
        summary: "Create a new property",
        operationId: "createProperty",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreatePropertyInput" },
            },
          },
        },
        responses: {
          "201": {
            description: "Property created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OrbitPropertyDTO" },
              },
            },
          },
          "400": { description: "Invalid input" },
        },
      },
    },
    "/api/orbita/properties/{id}": {
      get: {
        tags: ["Properties"],
        summary: "Get property detail",
        description: "Returns property + photos + latest plan + 6 most recent render jobs.",
        operationId: "getProperty",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Property detail" },
          "404": { description: "Property not found" },
        },
      },
      patch: {
        tags: ["Properties"],
        summary: "Update property",
        description: "Update whitelisted string fields, hotspots (max 24KB JSON), booleans, BPM (70-120), musicVolume (0-1.5).",
        operationId: "updateProperty",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Property updated" },
          "404": { description: "Property not found" },
        },
      },
      delete: {
        tags: ["Properties"],
        summary: "Delete property",
        description: "Delete property and remove storage directory.",
        operationId: "deleteProperty",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Property deleted" },
          "404": { description: "Property not found" },
        },
      },
    },
    "/api/orbita/properties/{id}/photos": {
      post: {
        tags: ["Photos"],
        summary: "Ingest photos",
        description:
          "Accepts FormData with mode=files|zip|url. Files: any image format (jpg/png/webp/heic/tiff). ZIP: fflate unzip, skips __MACOSX. URL: direct image or page (extracts og:image + JSON-LD + <img src> with noise filter). Max 40 photos per request. Auto: EXIF rotation, sha-256 dedupe, thumbnail 640px q80, normalize to 2560px jpeg q90.",
        operationId: "ingestPhotos",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          { name: "mode", in: "query", required: true, schema: { type: "string", enum: ["files", "zip", "url"] } },
        ],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: { type: "object" },
            },
          },
        },
        responses: {
          "201": { description: "Photos ingested" },
          "400": { description: "Invalid input" },
        },
      },
      patch: {
        tags: ["Photos"],
        summary: "Reorder photos",
        operationId: "reorderPhotos",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Order updated" } },
      },
    },
    "/api/orbita/properties/{id}/analyze": {
      post: {
        tags: ["AI"],
        summary: "Run AI vision analysis",
        description:
          "Batch vision analysis using GLM-4.5v. Chunks of 3 photos per call. Returns: room (15 categories), confidence, objects[], light, description, style. Falls back to filename-based heuristics if AI fails.",
        operationId: "analyzeProperty",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Analysis complete" },
          "404": { description: "Property not found" },
        },
      },
    },
    "/api/orbita/properties/{id}/direct": {
      post: {
        tags: ["AI"],
        summary: "Run AI Director",
        description:
          "LLM generates JSON plan: shots[] with photoId, move (11 types), durationMs (1400-6000), caption, depth; musicStyle, bpm, logline. Falls back to deterministic rule-director if LLM JSON parse fails.",
        operationId: "directProperty",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Plan generated" } },
      },
    },
    "/api/orbita/properties/{id}/render": {
      get: {
        tags: ["Render"],
        summary: "List render jobs",
        operationId: "listJobs",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "List of render jobs" } },
      },
      post: {
        tags: ["Render"],
        summary: "Enqueue render job",
        description:
          "5-phase pipeline: PROCESSING → RENDERING (CogVideoX-3 i2v per shot, cached by SHA-1) → ENCODING (ffmpeg xfade montage, concat fallback) → SOUNDTRACK (procedural PCM) → MASTER (+faststart + watermark). Resolution 720 or 1080, quality speed or quality. Format 16:9, 9:16, or 1:1.",
        operationId: "startRender",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  resolution: { type: "string", enum: ["720", "1080"] },
                  quality: { type: "string", enum: ["speed", "quality"] },
                  format: { type: "string", enum: ["16:9", "9:16", "1:1"] },
                  voiceover: { type: "boolean" },
                  voice: { type: "string", enum: ["tongtong", "xiaochen", "luodo", "kazi"] },
                  watermark: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: { "201": { description: "Job enqueued" } },
      },
    },
    "/api/orbita/properties/{id}/qr": {
      get: {
        tags: ["QR"],
        summary: "Get dynamic QR code",
        description: "Returns PNG 640px QR with error correction M. Encodes https://{host}/p/{slug}?ref=qr for lead attribution tracking.",
        operationId: "getQr",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "QR PNG image",
            content: { "image/png": { schema: { type: "string", format: "binary" } } },
          },
        },
      },
    },
    "/api/orbita/properties/{id}/analytics": {
      get: {
        tags: ["Analytics"],
        summary: "Get analytics",
        description: "Returns 14-day daily views + byRef (qr/instagram/whatsapp) + counts per event (VIEW, VIDEO_PLAY, CTA, WHATSAPP, SCAN, CONTACT) + total.",
        operationId: "getAnalytics",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Analytics JSON" } },
      },
    },
    "/api/orbita/track": {
      post: {
        tags: ["Tracking"],
        summary: "Track event",
        description: "Track event from microsite. Types: VIEW, VIDEO_PLAY, CTA, WHATSAPP, SCAN, CONTACT.",
        operationId: "trackEvent",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["VIEW", "VIDEO_PLAY", "CTA", "WHATSAPP", "SCAN", "CONTACT"] },
                  propertyId: { type: "string" },
                  ref: { type: "string" },
                },
                required: ["type", "propertyId"],
              },
            },
          },
        },
        responses: { "201": { description: "Event tracked" } },
      },
    },
    "/api/mcp": {
      post: {
        tags: ["MCP"],
        summary: "MCP server endpoint (JSON-RPC 2.0)",
        description:
          "HTTP MCP server with 11 tools for agent integration (Claude, Cursor, Cline). Methods: tools/list, tools/call, initialize. Tools mirror REST API: list_properties, get_property, create_property, delete_property, ingest_photos, analyze_property, direct_property, start_render, get_job, get_qr, get_analytics, publish_microsite.",
        operationId: "mcp",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  jsonrpc: { type: "string", enum: ["2.0"] },
                  id: { type: ["string", "number"] },
                  method: { type: "string" },
                  params: { type: "object" },
                },
                required: ["jsonrpc", "method"],
              },
            },
          },
        },
        responses: { "200": { description: "JSON-RPC response" } },
      },
    },
  },
  components: {
    schemas: {
      OrbitPropertyDTO: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          slug: { type: "string" },
          address: { type: "string" },
          tone: { type: "string", enum: ["luxury", "casual", "boutique", "airbnb-friendly", "modern", "colonial", "beach", "urban"] },
          aspect: { type: "string", enum: ["16:9", "9:16", "1:1"] },
          brandColor: { type: "string" },
          hostName: { type: "string" },
          hostPhone: { type: "string" },
          hostEmail: { type: "string" },
          ctaText: { type: "string" },
          watermarkOn: { type: "boolean" },
          watermarkText: { type: "string" },
          features: { type: "array", items: { type: "string" } },
          logline: { type: "string" },
          musicStyle: { type: "string", enum: ["cinematic", "ambient", "uplifting", "minimal", "warm", "epic"] },
          bpm: { type: "number", minimum: 70, maximum: 120 },
          musicVolume: { type: "number", minimum: 0, maximum: 1.5 },
          voiceover: { type: "boolean" },
          voice: { type: "string", enum: ["tongtong", "xiaochen", "luodo", "kazi"] },
          hotspots: { type: "string", description: "JSON up to 24KB: [{photoId, u, v, label}]" },
          published: { type: "boolean" },
          photos: { type: "array", items: { $ref: "#/components/schemas/OrbitPhotoDTO" } },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      OrbitPhotoDTO: {
        type: "object",
        properties: {
          id: { type: "string" },
          propertyId: { type: "string" },
          filename: { type: "string" },
          origin: { type: "string", enum: ["upload", "zip", "url", "demo"] },
          width: { type: "number" },
          height: { type: "number" },
          size: { type: "number" },
          hash: { type: "string", description: "SHA-256" },
          room: { type: "string", description: "Canonical room (15 categories)" },
          caption: { type: "string" },
          order: { type: "number" },
          quality: { type: "number", description: "0-100 heuristic" },
          url: { type: "string" },
          thumbUrl: { type: "string" },
        },
      },
      CreatePropertyInput: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 2, description: "Required" },
          address: { type: "string" },
          tone: { type: "string", enum: ["luxury", "casual", "boutique", "airbnb-friendly", "modern", "colonial", "beach", "urban"] },
        },
        required: ["name"],
      },
    },
  },
}

export async function GET() {
  return NextResponse.json(openApiSpec, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Cache-Control": "public, max-age=3600",
      "X-Frame-Options": "DENY",
    },
  })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
