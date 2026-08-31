import { NextRequest, NextResponse } from "next/server";
import { getIdToken, getBackendUrl } from "@/lib/server/auth";

/**
 * Catch-all proxy: /api/proxy/[...path]
 *
 * Forwards requests to the backend API with OIDC authentication.
 * Browser → Next.js /api/proxy/documents → Backend /api/v1/documents (with SA token)
 */

async function proxyRequest(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const backendBase = getBackendUrl();
  // Build target URL: /api/proxy/documents/123 → BACKEND/documents/123
  const targetPath = path.join("/");
  const queryString = req.nextUrl.search;
  const targetUrl = `${backendBase}/${targetPath}${queryString}`;

  // Get OIDC token for the backend audience
  // Audience = the root URL of the Cloud Run service (without path)
  const audience = backendBase.replace(/\/api\/v1$/, "");
  const idToken = await getIdToken(audience);

  // Build headers
  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }
  if (idToken) {
    headers.set("Authorization", `Bearer ${idToken}`);
  }

  // Forward the request body
  let body: BodyInit | null = null;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.arrayBuffer();
  }

  try {
    const backendRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    // Stream the response back
    const responseHeaders = new Headers();
    backendRes.headers.forEach((value, key) => {
      if (!["transfer-encoding", "connection"].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    const responseBody = await backendRes.arrayBuffer();
    return new NextResponse(responseBody, {
      status: backendRes.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error(`[AEGIS Proxy] Error forwarding to ${targetUrl}:`, error);
    return NextResponse.json(
      { error: "Backend API unreachable", detail: String(error) },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
