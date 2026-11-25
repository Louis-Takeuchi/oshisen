export interface NewsItem {
  readonly id: string;
  readonly date: string;
  readonly category: string;
  readonly title: string;
  readonly body: string;
  readonly author?: string;
  readonly image?: {
    readonly src: string;
    readonly alt: string;
    readonly width: number;
    readonly height: number;
    readonly caption: string;
  };
  readonly link?: {
    readonly href: string;
    readonly label: string;
  };
}

// 公開するお知らせを日付の新しい順に追加します。
export const newsItems: readonly NewsItem[] = [
  {
    id: "oshisen-talk-recording",
    // 公開日は大屋さんの確定待ち（要件定義P0-5）。確定したらこの日付だけ差し替える。
    date: "2026-11-25",
    category: "お知らせ",
    title: "候補者インタビュー「オシセン！トーク」の収録を始めました",
    body: "2026年茨城県議会議員選挙（つくば市選挙区・土浦市選挙区）に向けて、候補者の皆さんへのインタビュー「オシセン！トーク」の収録を進めています。インタビュー動画と政策の質問への回答は、12月4日（告示日）以降、立候補届出順に公開します。公開のお知らせは、Instagram・X・YouTubeでもお届けします。",
    link: {
      href: "https://www.youtube.com/@%E3%82%AA%E3%82%B7%E3%82%BB%E3%83%B3%E5%85%AC%E5%BC%8F%E3%83%81%E3%83%A3%E3%83%B3%E3%83%8D%E3%83%AB",
      label: "YouTubeチャンネルを見る",
    },
  },
  {
    id: "bench-mark-pitch-2026",
    date: "2026-10-14",
    category: "イベント",
    title: "代表の大屋が「BENCH MARK PITCH」に登壇しました！",
    author: "共同代表 竹内琉瑛",
    body: "2026年10月14日（水）、つくば市のベーカリー＆カフェ「BENCH」で開催された、つくばスタートアップパーク主催の「BENCH MARK PITCH」に、オシセン代表の大屋諒が登壇しました。\n\nプレゼンテーションでは、「政治家との出会い方を、変える。」という思いとともに、オシセンの取り組みを紹介しました。ご参加いただいた皆さま、主催・運営の皆さま、ありがとうございました！",
    image: {
      src: "/news/bench-mark-pitch-2026-10-14.webp",
      alt: "BENCH MARK PITCHで、オシセンのロゴを映したスクリーンの横でプレゼンテーションをする代表の大屋諒",
      width: 1800,
      height: 1086,
      caption: "2026年10月14日、BENCHでのプレゼンテーションの様子",
    },
    link: {
      href: "https://tsukuba-stapa.jp/event/4210/",
      label: "イベント詳細（つくばスタートアップパーク）",
    },
  },
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
