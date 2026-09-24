import { contactEmail, officialSocialLinks } from "../lib/site-contact";
import { publicSiteOrigin, serializeJsonLd, siteDescription } from "../lib/seo";

export function OrganizationData({ website = false }: { website?: boolean }) {
  const origin = publicSiteOrigin();
  const organization = {
    "@type": "Organization",
    "@id": new URL("/#organization", origin).href,
    name: "オシセン",
    alternateName: "オシセン！",
    url: new URL("/", origin).href,
    logo: new URL("/icon-512.png?v=logo-2", origin).href,
    description: siteDescription,
    email: contactEmail,
    sameAs: officialSocialLinks.map((link) => link.href),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd({
          "@context": "https://schema.org",
          "@graph": [
            organization,
            ...(website
              ? [
                  {
                    "@type": "WebSite",
                    "@id": new URL("/#website", origin).href,
                    name: "オシセン",
                    alternateName: "オシセン！",
                    url: new URL("/", origin).href,
                    inLanguage: "ja",
                    publisher: { "@id": organization["@id"] },
                  },
                ]
              : []),
          ],
        }),
      }}
    />
  );
}
