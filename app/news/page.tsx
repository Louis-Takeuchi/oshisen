import Link from "next/link";
import { Breadcrumbs } from "../../components/breadcrumbs";
import { formatNewsDate, newsItems } from "../../lib/news";
import { pageMetadata } from "../../lib/seo";
import styles from "../../components/news.module.css";

export const metadata = pageMetadata("/news", {
  title: "News・お知らせ",
  description:
    "オシセンからのお知らせと、サイトの更新情報を日付順にご紹介します。",
  index: true,
});

export default function NewsPage() {
  return (
    <main id="main" className="container document-page">
      <Breadcrumbs
        items={[
          { label: "ホーム", href: "/" },
          { label: "News", href: "/news" },
        ]}
      />
      <p className="eyebrow">オシセンからのお知らせ</p>
      <h1>News</h1>
      <p className="lead">
        オシセンのお知らせや、サイトの更新情報をお届けします。
      </p>
      {newsItems.length ? (
        <ul className={styles.list}>
          {newsItems.map((item) => (
            <li key={item.id}>
              <article
                id={item.id}
                className={styles.article}
                aria-labelledby={`${item.id}-title`}
              >
                <div className={styles.meta}>
                  <time dateTime={item.date}>{formatNewsDate(item.date)}</time>
                  <span className={styles.category}>{item.category}</span>
                </div>
                <h2 id={`${item.id}-title`}>{item.title}</h2>
                <p>{item.body}</p>
                {item.link && (
                  <Link href={item.link.href} className={styles.moreLink}>
                    {item.link.label} <span aria-hidden="true">→</span>
                  </Link>
                )}
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>お知らせは準備中です。</p>
      )}
      <Link href="/#news" className={styles.moreLink}>
        トップページへ <span aria-hidden="true">→</span>
      </Link>
    </main>
  );
}
