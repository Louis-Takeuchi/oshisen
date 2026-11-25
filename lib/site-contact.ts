/** Official project channels supplied by the operators, not candidate links. */
export const contactEmail = "info@oshisen.com";
export const contactMailto = `mailto:${contactEmail}`;

export const officialSocialLinks = [
  {
    id: "instagram",
    label: "Instagram",
    handle: "@oshisen.official",
    href: "https://www.instagram.com/oshisen.official/",
  },
  {
    id: "x",
    label: "X",
    handle: "@OshisenOfficial",
    href: "https://x.com/OshisenOfficial",
  },
  {
    id: "youtube",
    label: "YouTube",
    handle: "@オシセン公式チャンネル",
    href: "https://www.youtube.com/@%E3%82%AA%E3%82%B7%E3%82%BB%E3%83%B3%E5%85%AC%E5%BC%8F%E3%83%81%E3%83%A3%E3%83%B3%E3%83%8D%E3%83%AB",
  },
] as const;

/** Called only on an explicit click; never reads or attaches diagnosis data. */
export async function copyContactEmail(): Promise<boolean> {
  try {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      return false;
    }
    await navigator.clipboard.writeText(contactEmail);
    return true;
  } catch {
    return false;
  }
}
