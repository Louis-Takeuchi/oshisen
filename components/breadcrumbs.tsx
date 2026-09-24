import Link from "next/link";
import { publicSiteOrigin, serializeJsonLd } from "../lib/seo";
import styles from "./breadcrumbs.module.css";

export interface BreadcrumbItem {
  readonly label: string;
  readonly href: string;
}

export function Breadcrumbs({
  items,
}: {
  readonly items: readonly BreadcrumbItem[];
}) {
  const origin = publicSiteOrigin();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: new URL(item.href, origin).href,
    })),
  };

  return (
    <>
      <nav className={styles.breadcrumbs} aria-label="パンくずリスト">
        <ol>
          {items.map((item, index) => (
            <li key={item.href}>
              {index > 0 && <span aria-hidden="true">/</span>}
              {index === items.length - 1 ? (
                <span aria-current="page">{item.label}</span>
              ) : (
                <Link href={item.href}>{item.label}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(structuredData),
        }}
      />
    </>
  );
}
