import type { MetadataRoute } from "next";
import { publicSiteOrigin } from "../lib/seo";

export const dynamic = "force-dynamic";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", publicSiteOrigin()).href,
  };
}
