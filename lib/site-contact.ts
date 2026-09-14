/** Official project channels supplied by the operators, not candidate links. */
export const contactEmail = "oshisen0914@gmail.com";
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
