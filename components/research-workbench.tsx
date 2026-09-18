"use client";

import { useRef, useState } from "react";
import {
  createInterviewTemplate,
  getPublishableInterviewBlocks,
  interviewContentKey,
  interviewPublicationIssues,
  validateInterviewDocument,
  type InterviewDocument,
  type RecordedInterviewBlock,
} from "../lib/interviews";
import {
  buildInterviewPresentation,
  createLocalStudySession,
  recordStudyEvent,
  revokeStudyConsent,
  samePresentationMaterial,
  studyConditionLabels,
  summarizeSourceAccess,
  type StudyAction,
  type StudyCondition,
} from "../lib/research-study";
import { SourceBlock } from "./interview-source-block";
import styles from "./research-workbench.module.css";

function downloadJson(value: unknown, filename: string) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
export function ResearchWorkbench() {
  const [document, setDocument] = useState<InterviewDocument>({
    schemaVersion: "1.0",
    blocks: [],
  });
  const [message, setMessage] =
    useState("まだ取材データを読み込んでいません。");
  const [errors, setErrors] = useState<string[]>([]);
  const [condition, setCondition] = useState<StudyCondition>("B");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [session, setSession] = useState(() =>
    createLocalStudySession("not-started", "B"),
  );
  const startedAt = useRef(0);
  const importSequence = useRef(0);
  const publishable = getPublishableInterviewBlocks(document);
  const subjects = [
    ...new Map(
      publishable.map((block) => [block.subjectId, block.subjectLabel]),
    ).entries(),
  ];
  const groups = buildInterviewPresentation(
    publishable,
    condition,
    selectedSubjects,
  );
  const materialEqual = samePresentationMaterial(
    buildInterviewPresentation(publishable, "B", selectedSubjects),
    buildInterviewPresentation(publishable, "C", selectedSubjects),
  );
  const access = summarizeSourceAccess(session.events, session.phase);
  function clearSession() {
    setSession(createLocalStudySession("not-started", condition));
    startedAt.current = 0;
  }
  async function importFile(file: File | undefined) {
    if (!file) return;
    const sequence = ++importSequence.current;
    if (file.size > 1_000_000) {
      setErrors(["1MB以下のJSONファイルを選んでください。"]);
      return;
    }
    try {
      const value: unknown = JSON.parse(await file.text());
      if (sequence !== importSequence.current) return;
      const result = validateInterviewDocument(value);
      if (!result.valid || !result.document) {
        setErrors(result.errors);
        setMessage("読み込めませんでした。前の表示は変更していません。");
        return;
      }
      const visible = getPublishableInterviewBlocks(result.document);
      setDocument(result.document);
      setErrors([]);
      clearSession();
      setSelectedSubjects(
        [...new Set(visible.map((block) => block.subjectId))].slice(0, 2),
      );
      setMessage(
        `${result.document.blocks.length}ブロックを検証しました。表示できる承認済みブロックは${visible.length}件です。`,
      );
    } catch {
      if (sequence === importSequence.current) {
        setErrors(["JSONとして読み込めませんでした。"]);
        setMessage("前の表示は変更していません。");
      }
    }
  }
  function changeCondition(next: StudyCondition) {
    setCondition(next);
    setSession(createLocalStudySession("not-started", next));
    startedAt.current = 0;
  }
  function record(action: StudyAction, id: string) {
    setSession((current) =>
      recordStudyEvent(
        current,
        action,
        id,
        Math.max(0, performance.now() - startedAt.current),
      ),
    );
  }
  function toggleSubject(id: string) {
    setSelectedSubjects((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length < 2
          ? [...current, id]
          : current,
    );
    clearSession();
  }
  return (
    <div className={styles.workbench} data-private="true">
      <section className={styles.panel} aria-labelledby="preparation-files">
        <p className={styles.kicker}>01 / FILE CHECK</p>
        <h2 id="preparation-files">収録後に入れる情報を、先に揃える。</h2>
        <p>
          空の6項目をダウンロードできます。読み込んだファイルは、このタブのメモリだけで扱います。サーバーへの送信・保存・公開は行いません。
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.button}
            onClick={() =>
              downloadJson(
                createInterviewTemplate(),
                "oshisen-interview-template.json",
              )
            }
          >
            空の取材テンプレートを保存 ↓
          </button>
          <label className={styles.upload}>
            JSONを検証する
            <input
              type="file"
              accept="application/json,.json"
              onChange={(event) => {
                void importFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => {
              importSequence.current += 1;
              setDocument({ schemaVersion: "1.0", blocks: [] });
              setErrors([]);
              setSelectedSubjects([]);
              clearSession();
              setMessage("読み込んだデータと操作記録を消しました。");
            }}
          >
            このタブのデータを消す
          </button>
        </div>
        <p role="status">{message}</p>
        {errors.length > 0 && (
          <ul className={styles.errors} role="alert">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )}
        {document.blocks.length > 0 && (
          <details>
            <summary>ブロックごとの確認状況</summary>
            <ul>
              {document.blocks.map((block) => (
                <li key={block.id}>
                  <strong>
                    {block.id} / {block.questionId}
                  </strong>
                  ：
                  {interviewPublicationIssues(block).join(" ") ||
                    "承認記録の条件を満たしています。"}
                </li>
              ))}
            </ul>
            <button
              className={styles.secondary}
              type="button"
              onClick={() =>
                downloadJson(
                  document.blocks
                    .filter(
                      (block): block is RecordedInterviewBlock =>
                        block.availability !== "not_recorded",
                    )
                    .map((block) => ({
                      id: block.id,
                      contentKey: interviewContentKey(block),
                      requiredReviews: [
                        "audio",
                        "context",
                        "speaker",
                        "publication",
                      ],
                    })),
                  "oshisen-review-content-keys.json",
                )
              }
            >
              確認対象の内容キーを保存 ↓
            </button>
          </details>
        )}
        <p className={styles.note}>
          内容キーは、確認後に文章や出典が変わっていないかを調べるためのものです。承認者の本人認証ではありません。公開する際は運営側の確認が別途必要です。
        </p>
      </section>

      <section className={styles.panel} aria-labelledby="view-comparison">
        <p className={styles.kicker}>02 / SAME MATERIAL</p>
        <h2 id="view-comparison">同じ発言を、二つの並べ方で。</h2>
        <p>
          本文・引用・原音・文字起こしは共通です。Bは取材順、CはH01〜H06ごとに並べます。最大2人を選べます。ここでの切り替えは表示確認用で、本番研究の割り付けではありません。表示条件を切り替えると、同意と操作記録をリセットします。
        </p>
        <div className={styles.toggle} aria-label="表示方法">
          {(["B", "C"] as const).map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={condition === value}
              onClick={() => changeCondition(value)}
            >
              {studyConditionLabels[value]}
            </button>
          ))}
        </div>
        {subjects.length > 0 && (
          <fieldset className={styles.subjects}>
            <legend>同じ情報を見比べる相手を選ぶ（最大2人）</legend>
            {subjects.map(([id, name]) => (
              <label key={id}>
                <input
                  type="checkbox"
                  checked={selectedSubjects.includes(id)}
                  disabled={
                    !selectedSubjects.includes(id) &&
                    selectedSubjects.length === 2
                  }
                  onChange={() => toggleSubject(id)}
                />
                {name}
              </label>
            ))}
          </fieldset>
        )}
        <p className={styles.meta}>
          B/Cの本文・引用・出典・分量：
          {materialEqual ? "同一" : "不一致があります"}
          。未承認の本文は表示しません。
        </p>
        {publishable.length === 0 || selectedSubjects.length === 0 ? (
          <div className={styles.empty}>
            <strong>
              {publishable.length === 0
                ? "取材・掲載の準備中です。"
                : "比較する相手を選んでください。"}
            </strong>
            <p>
              実在の候補者情報や仮の発言は登録していません。収録と確認が終わった情報を読み込むと、この場所で表示を確かめられます。
            </p>
          </div>
        ) : (
          <div className={styles.presentation}>
            {groups.map((group) => (
              <section key={`${condition}-${group.id}`}>
                <h3>{group.label}</h3>
                {group.blocks.length > 0 ? (
                  <div
                    className={
                      condition === "C" ? styles.comparison : styles.interview
                    }
                  >
                    {group.blocks.map((block) => (
                      <SourceBlock
                        key={block.id}
                        block={block}
                        record={record}
                      />
                    ))}
                  </div>
                ) : (
                  <p className={styles.note}>
                    この項目の承認済み情報はまだありません。
                  </p>
                )}
              </section>
            ))}
          </div>
        )}
      </section>

      <section className={styles.panel} aria-labelledby="local-measurement">
        <p className={styles.kicker}>03 / LOCAL CHECK ONLY</p>
        <h2 id="local-measurement">記録も、通常の利用と分ける。</h2>
        <p>
          この画面の確認操作だけを、同意した後からタブ内に記録できます。参加者の募集や研究データの収集は、まだ始めていません。氏名や政治的な回答は記録しません。
        </p>
        <label className={styles.consent}>
          <input
            type="checkbox"
            checked={session.consented}
            onChange={(event) => {
              if (event.target.checked) {
                startedAt.current = performance.now();
                setSession({
                  ...createLocalStudySession(crypto.randomUUID(), condition),
                  consented: true,
                });
              } else setSession((current) => revokeStudyConsent(current));
            }}
          />
          このタブ内の確認操作を記録することに同意する
        </label>
        <fieldset className={styles.phase}>
          <legend>記録する場面</legend>
          <label>
            <input
              type="radio"
              name="study-phase"
              checked={session.phase === "free_browse"}
              onChange={() =>
                setSession((current) => ({ ...current, phase: "free_browse" }))
              }
            />
            自由に見る
          </label>
          <label>
            <input
              type="radio"
              name="study-phase"
              checked={session.phase === "comprehension_task"}
              onChange={() =>
                setSession((current) => ({
                  ...current,
                  phase: "comprehension_task",
                }))
              }
            />
            理解課題のために見る
          </label>
        </fieldset>
        <p>
          現在の場面：原資料へのクリック {access.clicks}回 ／ 開いた情報{" "}
          {access.uniqueInformationCount}件 ／ 同じ操作の再クリック{" "}
          {access.repeatClicks}回
        </p>
        <p className={styles.note}>
          クリックは読了・視聴・理解を意味しません。自由閲覧中のアクセスと、課題で指示されたアクセスを混ぜません。同意を外すと記録を削除します。保存済みのファイルは端末側で削除してください。
        </p>
        <button
          type="button"
          className={styles.secondary}
          disabled={!session.consented || session.events.length === 0}
          onClick={() =>
            downloadJson(session, "oshisen-local-preparation-events.json")
          }
        >
          このタブの確認記録を保存 ↓
        </button>
      </section>
    </div>
  );
}
