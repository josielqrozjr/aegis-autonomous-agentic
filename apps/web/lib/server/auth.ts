/**
 * Server-side OIDC auth helper for Cloud Run service-to-service calls.
 *
 * On Cloud Run: fetches ID token from the metadata server using the attached SA.
 * Locally: uses GOOGLE_API_KEY or skips auth (for dev with public API).
 */

const METADATA_SERVER = "http://metadata.google.internal";
const METADATA_FLAVOR = "Google";

// Cache token until 5 min before expiry
let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getIdToken(audience: string): Promise<string | null> {
  // Check cache
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  // On Cloud Run: fetch from metadata server
  try {
    const url = `${METADATA_SERVER}/computeMetadata/v1/instance/service-accounts/default/identity?audience=${encodeURIComponent(audience)}`;
    const res = await fetch(url, {
      headers: { "Metadata-Flavor": METADATA_FLAVOR },
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const token = await res.text();
      // Cache for 55 minutes (tokens last 60 min)
      cachedToken = { token, expiresAt: Date.now() + 55 * 60 * 1000 };
      return token;
    }
  } catch {
    // Not on Cloud Run — fall through to local dev
  }

  // Local dev: no auth needed (API should be public locally)
  return null;
}

export function getBackendUrl(): string {
  // Server-side env var (not NEXT_PUBLIC_)
  return process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
}
