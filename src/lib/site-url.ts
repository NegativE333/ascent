import { headers } from "next/headers";

function stripSlash(url: string) {
  return url.replace(/\/$/, "");
}

function isLocalHost(host: string) {
  const h = host.toLowerCase().split(":")[0];
  return h === "localhost" || h === "127.0.0.1" || h === "::1";
}

/** Build origin from host + proto. Local always stays http://localhost. */
function originFromHost(host: string, protoHint?: string | null) {
  const cleanHost = host.split(",")[0].trim();
  if (!cleanHost) return null;

  if (isLocalHost(cleanHost)) {
    // preserve port if present (localhost:3000 / localhost:3001)
    return `http://${cleanHost}`;
  }

  const proto =
    cleanHost.endsWith(".vercel.app") || process.env.VERCEL
      ? "https"
      : (protoHint ?? "https").split(",")[0].trim() || "https";

  return `${proto}://${cleanHost}`;
}

/** Canonical public app URL (no trailing slash). Fallback only. */
export function getSiteUrl() {
  if (process.env.VERCEL_URL) {
    return `https://${stripSlash(process.env.VERCEL_URL)}`;
  }

  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return stripSlash(fromEnv);

  return "http://localhost:3000";
}

/**
 * Origin for the current request.
 * Prefers the real request host so local login → localhost and prod → prod.
 * Never forces production URL onto a localhost request.
 */
export async function getOriginFromHeaders() {
  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "")
    .split(",")[0]
    .trim();
  const proto = h.get("x-forwarded-proto");

  const fromRequest = originFromHost(host, proto);
  if (fromRequest) return fromRequest;

  return getSiteUrl();
}

/** Resolve the public origin for redirects (proxy-aware). */
export function getRequestOrigin(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host =
    (forwardedHost ?? request.headers.get("host") ?? "")
      .split(",")[0]
      .trim() || new URL(request.url).host;
  const proto =
    request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol.replace(":", "");

  const fromRequest = originFromHost(host, proto);
  if (fromRequest) return fromRequest;

  return getSiteUrl();
}
