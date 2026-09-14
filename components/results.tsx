"use client";
import Link from "next/link";
import { candidates, demoAnswerFixtures, questions } from "../lib/data";
import { calculateMatch } from "../lib/matching";
import { useVariant } from "./use-local-settings";
import { useDiagnosis } from "./session";
import { CandidateRow } from "./candidate-row";
import { PriorityThemePicker } from "./priority-themes";
export function Results() {
  const { state, ready } = useDiagnosis();
  const humanity = useVariant() !== "policy";
  if (!ready)
    return (
      <main id="main" className="container page-main" aria-busy="true">
        <p>結果を読み込んでいます。</p>
      </main>
    );
  if (!state.complete)
    return (
      <main id="main" className="container empty-page">
        <p className="eyebrow">診断結果</p>
        <h1>まずは、あなたの考えから。</h1>
        <p>質問に答えると、政策を比較した結果がここに表示されます。</p>
        <Link href="/diagnosis" className="button primary">
          診断へ進む →
        </Link>
      </main>
    );
  const count = questions.filter((q) => state.answers[q.id] != null).length;
  const matches = candidates
    .map((candidate) => ({
      candidate,
      match: calculateMatch(state.answers, demoAnswerFixtures[candidate.id]),
    }))
    .sort((a, b) => (b.match.score ?? -1) - (a.match.score ?? -1));
  const cutoff = matches[2]?.match.score ?? -1;
  const shown = count
    ? matches.filter(
        ({ match }, index) => index < 3 || (match.score ?? -1) === cutoff,
      )
    : matches;
  return (
    <main id="main" className="container results-page">
      <div className="page-topline">
        <p className="eyebrow">あなたの考えから、候補者へ。</p>
        <Link href="/questions" className="quiet-link">
          回答を見直す ↗
        </Link>
      </div>
      <h1>
        あなたと考えが
        <br className="mobile-only" />
        近かった候補者
      </h1>
      <p className="lead">
        同じ考えも、違う考えも。
        <br />
        ここから、一人ひとりを知ってみよう。
      </p>
      <div className="notice">
        <span className="outline-label">デモ結果</span>
        <p>
          以下は仮名と確認用の数値で計算した参考値です。実在候補者との一致度ではありません。本番では、公開されている政策・候補者回答等をもとに算出します。
        </p>
      </div>
      <div className="results-subhead">
        <span>
          {count} / {questions.length}問に回答
        </span>
        <Link className="inline-link" href="/method">
          一致度の計算方法 ↗
        </Link>
      </div>
      <div className="exploration-links" aria-label="候補者を考えるための機能">
        <Link href="/compare">2人の政策を比較する →</Link>
        <Link href="/saved">気になる候補を見る →</Link>
        <Link href="/issues">争点から見る →</Link>
      </div>
      <PriorityThemePicker />
      {count === 0 && (
        <div className="empty-notice">
          <h2>一致度を計算できませんでした。</h2>
          <p>
            すべての質問をスキップしています。回答を見直すか、候補者ページをご覧ください。
          </p>
        </div>
      )}
      <div>
        {shown.map(({ candidate, match }) => (
          <CandidateRow
            key={candidate.id}
            candidate={candidate}
            match={match}
          />
        ))}
      </div>
      <p className="caption display-rule">
        {count
          ? "確認用の政策一致度が高い3名と、表示境界で同じ値の候補者を表示。同じ値の場合は五十音順です。"
          : "仮名の五十音順で表示しています。"}{" "}
        一致度は候補者の優劣を示しません。
      </p>
      <div className="results-links">
        <Link href="/candidates" className="text-link">
          全候補者を見る →
        </Link>
        <Link href="/diagnosis" className="quiet-link">
          診断をやり直す
        </Link>
      </div>
      {humanity && (
        <section className="humanity-invitation">
          <p className="eyebrow">政策の、その先へ。</p>
          <h2>
            ところで、この人たち。
            <br />
            政策以外はどんな人なんだろう。
          </h2>
          <p>
            政策だけでは見えない、考え方や経験、日常。
            <br />
            候補者の言葉を知るために、こんな質問を用意しています。
          </p>
          <div className="question-teasers">
            {shown.map(({ candidate }) => (
              <Link
                href={`/candidates/${candidate.id}#humanity`}
                key={candidate.id}
              >
                <div>
                  <span className="caption">{candidate.name}（仮名）</span>
                  <h3>休みが1日あったら？</h3>
                  <p>判断に迷ったとき、最後に信じるものは？</p>
                  <span className="caption">質問例 / 本人の回答は未掲載</span>
                </div>
                <span aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </section>
      )}
      <div className="closing-note">
        <p>答えが近いことは、その人を知るきっかけのひとつ。</p>
        <Link href="/sources" className="inline-link">
          情報源と公平性について →
        </Link>
      </div>
    </main>
  );
}
