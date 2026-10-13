export interface NewsItem {
  readonly id: string;
  readonly date: string;
  readonly category: string;
  readonly title: string;
  readonly body: string;
  readonly link?: {
    readonly href: string;
    readonly label: string;
  };
}

// 公開するお知らせを日付の新しい順に追加します。
export const newsItems: readonly NewsItem[] = [
  {
    id: "neutrality-policy-published",
    date: "2026-10-10",
    category: "お知らせ",
    title: "中立性ポリシーを公開しました！",
    body: "オシセンの情報掲載や取材・編集の方針をまとめた「中立性ポリシー」を公開しました。さまざまな立場を共通の基準で紹介し、皆さんが自分で考え、判断できる情報を届けることを大切にしています。私たちの運営方針を、ぜひご覧ください。",
    link: {
      href: "/neutrality",
      label: "中立性ポリシーを読む",
    },
  },
  {
    id: "site-open",
    date: "2026-09-14",
    category: "お知らせ",
    title: "オシセンのサイトを開設しました！",
    body: "政治や選挙をもっと身近に感じてもらえるよう、オシセンのウェブサイトを開設しました。政策への考え方や本人の経験から、政治家を知るきっかけをつくっていきます。候補者情報やインタビューの掲載に向けて、現在準備を進めています。これからの活動も、News欄でお知らせします！",
    link: {
      href: "/about",
      label: "オシセンについて",
    },
  },
];

export function formatNewsDate(date: string): string {
  return date.replaceAll("-", ".");
}
