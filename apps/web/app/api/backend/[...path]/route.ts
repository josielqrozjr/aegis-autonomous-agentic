import { NextRequest, NextResponse } from "next/server";
import { getIdToken } from "@/lib/server/auth";

/**
 * Proxy for backend ROOT endpoints: /api/backend/health → Backend /health
 * (Separate from /api/proxy/* which maps to /api/v1/*)
 */

const BACKEND_ROOT = (() => {
  const apiUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
  return apiUrl.replace(/\/api\/v1$/, "");
})();

async function proxyRoot(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const targetPath = path.join("/");
  const targetUrl = `${BACKEND_ROOT}/${targetPath}${req.nextUrl.search}`;

  const idToken = await getIdToken(BACKEND_ROOT);
  const headers = new Headers();
  if (idToken) headers.set("Authorization", `Bearer ${idToken}`);
  const ct = req.headers.get("content-type");
  if (ct) headers.set("content-type", ct);

  try {
    const res = await fetch(targetUrl, { method: req.method, headers });
    const body = await res.arrayBuffer();
    return new NextResponse(body, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}

export const GET = proxyRoot;
export const POST = proxyRoot;
