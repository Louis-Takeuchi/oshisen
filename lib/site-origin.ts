/** Keep social image URLs correct on Sites, Vercel previews and custom domains. */
export function resolveSiteOrigin(
  requestHeaders: Pick<Headers, "get">,
  siteUrl?: string,
): URL {
  if (siteUrl?.trim()) {
    const configured = new URL(siteUrl.trim());
    if (!["http:", "https:"].includes(configured.protocol)) {
      throw new Error("SITE_URL must be an absolute HTTP(S) URL.");
    }
    if (configured.username || configured.password) {
      throw new Error("SITE_URL must not contain credentials.");
    }
    return new URL(configured.origin);
  }
  const host = requestHeaders.get("host") || "localhost:3000";
  const origin = new URL(`https://${host}`);
  if (["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname)) {
    origin.protocol = "http:";
  }
  return origin;
}
