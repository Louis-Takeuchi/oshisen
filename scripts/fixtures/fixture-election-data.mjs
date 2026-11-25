/**
 * 架空データ（候補者A〜D・2選挙区）。12/3までの画面確認専用。
 * サイトに公開しないこと（要件定義P2-7）。`npm run data:fixtures` で一時的に
 * lib/generated/sheet-data.ts に流し込み、確認後は必ず `npm run data:import` で戻す。
 * generatedDataSource が "fixtures" のままだと `npm test` が失敗して公開を止める。
 */
const reason = (stance) =>
  `（架空データ）${stance}の立場からの理由です。画面の確認用に、改行を含む400字程度の本文を想定しています。\n実際の候補者の回答は、本人の提出した原文をそのまま掲載します。この文章は候補者A〜Dの表示確認のためのダミーで、実在の人物・主張とは関係ありません。長文の折り返し、全文表示の開閉、冒頭80字での切り出しを確かめるために、十分な長さを持たせています。`;

export const fixtureQuestionsNote = "questions は常にCSV（候補者送付版）を使う";

export const fixtureCandidates = [
  {
    candidateId: "tsukuba-01",
    district: "tsukuba",
    filingOrder: 1,
    name: "候補者A",
    nameKana: "こうほしゃえー",
    partyLabel: "架空党",
    incumbency: "新",
    photoFilename: "",
    profile: "（架空データ）画面確認用の候補者です。",
    urlOfficial: "https://example.com/",
    urlX: "",
    urlInstagram: "",
    urlYoutube: "",
    urlFacebook: "",
    participationStatus: "公開済み",
    age: 45,
    updatedAt: "2026-12-04 18:00",
  },
  {
    candidateId: "tsukuba-02",
    district: "tsukuba",
    filingOrder: 2,
    name: "候補者B",
    nameKana: "こうほしゃびー",
    partyLabel: "無所属",
    incumbency: "現",
    photoFilename: "",
    profile: "",
    urlOfficial: "",
    urlX: "https://example.com/b",
    urlInstagram: "",
    urlYoutube: "",
    urlFacebook: "",
    participationStatus: "一部回答",
    age: 58,
    updatedAt: "2026-12-04 18:00",
  },
  {
    candidateId: "tsuchiura-01",
    district: "tsuchiura",
    filingOrder: 1,
    name: "候補者C",
    nameKana: "こうほしゃしー",
    partyLabel: "架空党",
    incumbency: "元",
    photoFilename: "",
    profile: "",
    urlOfficial: "",
    urlX: "",
    urlInstagram: "",
    urlYoutube: "",
    urlFacebook: "",
    participationStatus: "確認中",
    age: null,
    updatedAt: "2026-12-04 18:00",
  },
  {
    candidateId: "tsuchiura-02",
    district: "tsuchiura",
    filingOrder: 2,
    name: "候補者D",
    nameKana: "こうほしゃでぃー",
    partyLabel: "無所属",
    incumbency: "新",
    photoFilename: "",
    profile: "",
    urlOfficial: "",
    urlX: "",
    urlInstagram: "",
    urlYoutube: "",
    urlFacebook: "",
    participationStatus: "未回答",
    age: 39,
    updatedAt: "2026-12-04 18:00",
  },
];

const answers = [];
const questionIds = ["P01", "P02", "P03", "P04", "P05", "P06"];
const values = { "tsukuba-01": [6, 2, 4, 7, 5, 3], "tsukuba-02": [3, 5, 6, 2, 4, 6], "tsuchiura-01": [7, 4, 2, 5, 6, 1] };
for (const [candidateId, list] of Object.entries(values)) {
  list.forEach((value, index) => {
    answers.push({
      candidateId,
      questionId: questionIds[index],
      value,
      nonAnswer: "",
      reason: reason(value >= 5 ? "賛成寄り" : value <= 3 ? "反対寄り" : "中間"),
      answeredOn: "2026-11-20",
    });
  });
}
answers.push(
  { candidateId: "tsukuba-01", questionId: "T01", value: 6, nonAnswer: "", reason: reason("賛成寄り"), answeredOn: "2026-11-20" },
  { candidateId: "tsukuba-01", questionId: "T02", value: null, nonAnswer: "判断材料が足りない", reason: "（架空データ）現時点では判断材料が足りないため、7段階では回答しません。", answeredOn: "2026-11-20" },
  { candidateId: "tsukuba-02", questionId: "T01", value: null, nonAnswer: "設問の前提に異議がある", reason: "（架空データ）設問の前提に異議があるため、7段階では回答しません。", answeredOn: "2026-11-20" },
  { candidateId: "tsuchiura-01", questionId: "U01", value: 5, nonAnswer: "", reason: reason("賛成寄り"), answeredOn: "2026-11-20" },
  { candidateId: "tsuchiura-01", questionId: "U02", value: null, nonAnswer: "回答しない", reason: "", answeredOn: "2026-11-20" },
  // 候補者D（未回答）は行自体を入れない＝「未回答」の表示確認用。
);
export const fixturePolicyAnswers = answers;

export const fixtureBackgroundAnswers = [
  { candidateId: "tsukuba-01", itemId: "H01", answerType: "書面回答", text: "（架空データ）経験と判断の背景の記入例です。表示確認のための文章で、実在の人物とは関係ありません。" },
  { candidateId: "tsukuba-01", itemId: "F01", answerType: "書面回答", text: "（架空データ）最優先にすることの記入例です。" },
  { candidateId: "tsukuba-02", itemId: "H01", answerType: "口頭回答", text: "" },
];

export const fixtureCorrections = [
  {
    candidateId: "tsukuba-01",
    target: "P02",
    date: "2026-12-06",
    type: "本人追記",
    text: "（架空データ）訂正・本人追記の表示例です。元の回答は消さずに残します。",
  },
];

export const fixtureVideos = [
  {
    candidateId: "tsukuba-01",
    videoType: "本編",
    youtubeUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    title: "（架空）候補者A 本編",
    duration: "35:00",
    chapters: "0:00 学生時代\n12:34 政治へのきっかけ\n25:00 県政と今後の展望",
    publishAt: "2026-12-04 18:00",
  },
  {
    candidateId: "tsukuba-01",
    videoType: "1分間フラッシュ",
    youtubeUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    title: "（架空）候補者A 1分間フラッシュ",
    duration: "1:00",
    chapters: "",
    publishAt: "2026-12-04 18:00",
  },
];
