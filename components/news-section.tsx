import Link from "next/link";
import { formatNewsDate, newsItems } from "../lib/news";
import styles from "./news.module.css";

export function NewsSection() {
  return (
    <section id="news" className={styles.section} aria-labelledby="news-title">
      <div className={styles.heading}>
        <div>
          <h2 id="news-title">News</h2>
          <p>オシセンからのお知らせ</p>
        </div>
        <Link href="/news" className={styles.moreLink}>
          お知らせ一覧 <span aria-hidden="true">→</span>
        </Link>
      </div>
      {newsItems.length ? (
        <ul className={styles.list}>
          {newsItems.slice(0, 3).map((item) => (
            <li key={item.id}>
              <Link href={`/news#${item.id}`} className={styles.row}>
                <div className={styles.meta}>
                  <time dateTime={item.date}>{formatNewsDate(item.date)}</time>
                  <span className={styles.category}>{item.category}</span>
                </div>
                <h3>{item.title}</h3>
                <span className={styles.arrow} aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>お知らせは準備中です。</p>
      )}
    </section>
  );
}
