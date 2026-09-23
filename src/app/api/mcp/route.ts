import { NextResponse } from "next/server"

export const runtime = "edge"
export const dynamic = "force-dynamic"

const tools = [
  {
    name: "list_properties",
    description: "List all properties with photos, plans, and render jobs. Auto-seeds La Floresta demo if database is empty.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_property",
    description: "Get full property detail by ID (photos + latest plan + 6 most recent render jobs).",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
  },
  {
    name: "create_property",
    description: "Create a new property. Required: name (min 2 chars). Optional: address, tone (luxury|casual|boutique|airbnb-friendly|modern|colonial|beach|urban).",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", minLength: 2 },
        address: { type: "string" },
        tone: { type: "string", enum: ["luxury", "casual", "boutique", "airbnb-friendly", "modern", "colonial", "beach", "urban"] },
      },
      required: ["name"],
    },
  },
  {
    name: "delete_property",
    description: "Delete a property and remove its storage directory.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
  },
  {
    name: "ingest_photos",
    description: "Ingest photos via files|zip|url mode. Dedupes by sha-256, normalizes EXIF, generates thumbnails. Max 40 per request. URL mode: extracts og:image + JSON-LD + <img src> with noise filter.",
    inputSchema: {
      type: "object",
      properties: {
        propertyId: { type: "string" },
        mode: { type: "string", enum: ["files", "zip", "url"] },
        url: { type: "string", description: "Required when mode=url" },
      },
      required: ["propertyId", "mode"],
    },
  },
  {
    name: "analyze_property",
    description: "Run AI vision analysis (GLM-4.5v) on property photos. Returns: room (15 categories), confidence, objects[], light, description, style. Falls back to filename heuristics if AI fails.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
  },
  {
    name: "direct_property",
    description: "Run AI Director (LLM) to generate a shot plan. Plan JSON: shots[] with photoId, move (11 types), durationMs (1400-6000), caption, depth; musicStyle, bpm, logline. Falls back to deterministic rule-director.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
  },
  {
    name: "start_render",
    description: "Enqueue render job. 5-phase pipeline: PROCESSING → RENDERING (CogVideoX-3 i2v per shot, cached by SHA-1) → ENCODING (ffmpeg xfade montage, concat fallback) → SOUNDTRACK (procedural PCM) → MASTER (+faststart + watermark).",
    inputSchema: {
      type: "object",
      properties: {
        propertyId: { type: "string" },
        resolution: { type: "string", enum: ["720", "1080"] },
        quality: { type: "string", enum: ["speed", "quality"] },
        format: { type: "string", enum: ["16:9", "9:16", "1:1"] },
        voiceover: { type: "boolean" },
        voice: { type: "string", enum: ["tongtong", "xiaochen", "luodo", "kazi"] },
        watermark: { type: "boolean" },
      },
      required: ["propertyId"],
    },
  },
  {
    name: "get_job",
    description: "Get render job status. States: queued|processing|rendering|encoding|complete|failed. Returns progress + error if failed.",
    inputSchema: {
      type: "object",
      properties: {
        propertyId: { type: "string" },
        jobId: { type: "string" },
      },
      required: ["propertyId", "jobId"],
    },
  },
  {
    name: "get_qr",
    description: "Get dynamic QR PNG (encodes /p/[slug]?ref=qr). Returns base64 PNG.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
  },
  {
    name: "get_analytics",
    description: "Get 14-day analytics: daily views + byRef (qr/instagram/whatsapp) + counts per event (VIEW, VIDEO_PLAY, CTA, WHATSAPP, SCAN, CONTACT) + total.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
  },
  {
    name: "publish_microsite",
    description: "Publish or unpublish the public microsite at /p/[slug].",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        published: { type: "boolean" },
      },
      required: ["id", "published"],
    },
  },
]

const handleToolCall = async (name: string, args: Record<string, unknown>) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  switch (name) {
    case "list_properties": {
      const res = await fetch(`${baseUrl}/api/orbita/properties`)
      return await res.json()
    }
    case "get_property": {
      const res = await fetch(`${baseUrl}/api/orbita/properties/${args.id}`)
      return await res.json()
    }
    case "create_property": {
      const res = await fetch(`${baseUrl}/api/orbita/properties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
      })
      return await res.json()
    }
    case "delete_property": {
      const res = await fetch(`${baseUrl}/api/orbita/properties/${args.id}`, { method: "DELETE" })
      return await res.json()
    }
    case "ingest_photos": {
      if (args.mode === "url" && args.url) {
        const form = new FormData()
        form.append("mode", "url")
        form.append("url", String(args.url))
        const res = await fetch(`${baseUrl}/api/orbita/properties/${args.propertyId}/photos`, {
          method: "POST",
          body: form,
        })
        return await res.json()
      }
      return { error: "MCP server only supports URL ingestion mode. For files/zip use direct API upload." }
    }
    case "analyze_property": {
      const res = await fetch(`${baseUrl}/api/orbita/properties/${args.id}/analyze`, { method: "POST" })
      return await res.json()
    }
    case "direct_property": {
      const res = await fetch(`${baseUrl}/api/orbita/properties/${args.id}/direct`, { method: "POST" })
      return await res.json()
    }
    case "start_render": {
      const res = await fetch(`${baseUrl}/api/orbita/properties/${args.propertyId}/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
      })
      return await res.json()
    }
    case "get_job": {
      const res = await fetch(`${baseUrl}/api/orbita/properties/${args.propertyId}/render`)
      return await res.json()
    }
    case "get_qr": {
      const res = await fetch(`${baseUrl}/api/orbita/properties/${args.id}/qr`)
      const buf = await res.arrayBuffer()
      const base64 = Buffer.from(buf).toString("base64")
      return { qrPngBase64: base64, format: "image/png" }
    }
    case "get_analytics": {
      const res = await fetch(`${baseUrl}/api/orbita/properties/${args.id}/analytics`)
      return await res.json()
    }
    case "publish_microsite": {
      const res = await fetch(`${baseUrl}/api/orbita/properties/${args.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: args.published }),
      })
      return await res.json()
    }
    default:
      return { error: `Unknown tool: ${name}` }
  }
}

export async function POST(req: Request) {
  let body: {
    jsonrpc?: string
    id?: string | number
    method?: string
    params?: Record<string, unknown>
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null },
      { status: 400 }
    )
  }

  const { jsonrpc = "2.0", id, method, params = {} } = body

  if (method === "initialize") {
    return NextResponse.json({
      jsonrpc,
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: { listChanged: false }, resources: { listChanged: false } },
        serverInfo: {
          name: "orbita-mcp",
          version: "1.0.0",
          description: "ÓRBITA — Property Content Engine MCP server. 11 tools for real-estate agents.",
        },
      },
    })
  }

  if (method === "tools/list") {
    return NextResponse.json({
      jsonrpc,
      id,
      result: { tools },
    })
  }

  if (method === "tools/call") {
    const toolName = params.name as string
    const toolArgs = (params.arguments as Record<string, unknown>) || {}
    try {
      const result = await handleToolCall(toolName, toolArgs)
      return NextResponse.json({
        jsonrpc,
        id,
        result: {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        },
      })
    } catch (err) {
      return NextResponse.json({
        jsonrpc,
        id,
        error: {
          code: -32603,
          message: `Tool execution failed: ${err instanceof Error ? err.message : String(err)}`,
        },
      })
    }
  }

  return NextResponse.json({
    jsonrpc,
    id,
    error: { code: -32601, message: `Method not found: ${method}` },
  })
}

export async function GET() {
  return NextResponse.json({
    name: "orbita-mcp",
    version: "1.0.0",
    description: "ÓRBITA — Property Content Engine MCP server",
    protocol: "jsonrpc-2.0",
    transport: "http",
    tools: tools.map((t) => t.name),
    documentation: "https://orbita.alicelabs.site/llms.txt",
    openapi: "https://orbita.alicelabs.site/openapi.json",
  })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
