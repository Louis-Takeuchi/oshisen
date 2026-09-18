"use client";
import Link from "next/link";
import { useState } from "react";
import { questions } from "../lib/data";
import { PriorityThemePicker } from "./priority-themes";
import { useConsideration } from "./use-consideration";
const types = [
  {
    id: "policy",
    label: "政策への答え",
    href: "/issues",
    description: "同じ問いへの答えと、理由・条件を見る。",
  },
  {
    id: "experience",
    label: "これまでの経験",
    href: "/stories#H01",
    description: "その人が歩んできた道を知る。",
  },
  {
    id: "reason",
    label: "判断した理由",
    href: "/stories#H02",
    description: "何を比べ、どう決めたのかを知る。",
  },
  {
    id: "disagreement",
    label: "意見が違う人との向き合い方",
    href: "/stories#H03",
    description: "意見が分かれたときの話を聞く。",
  },
  {
    id: "change",
    label: "考えの変化・継続",
    href: "/stories#H05",
    description: "変わったこと、変わらなかったことを知る。",
  },
  {
    id: "source",
    label: "発言の原文・音声",
    href: "/stories",
    description: "元の話の流れまで確かめる。音声は取材後に掲載します。",
  },
] as const;
export function InformationNeeds() {
  const { priorityIds } = useConsideration();
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <main id="main" className="container page-main">
      <p className="eyebrow">N / INFORMATION NEEDS</p>
      <h1>いま、何を知りたい？</h1>
      <p className="lead">答えなくても大丈夫。気になる話への道しるべです。</p>
      <PriorityThemePicker />
      <section className="information-types">
        <h2>どんな情報を見たい？</h2>
        <p>いくつでも選べます。この選択は今の画面内だけで使います。</p>
        <fieldset>
          <legend className="sr-only">情報の種類</legend>
          {types.map((type) => (
            <label key={type.id}>
              <input
                type="checkbox"
                checked={selected.includes(type.id)}
                onChange={() =>
                  setSelected((current) =>
                    current.includes(type.id)
                      ? current.filter((id) => id !== type.id)
                      : [...current, type.id],
                  )
                }
              />
              {type.label}
            </label>
          ))}
        </fieldset>
      </section>
      <section className="needs-links">
        <h2>気になるところから、どうぞ。</h2>
        {priorityIds.length > 0 && (
          <div className="exploration-links">
            {questions
              .filter((q) => priorityIds.includes(q.id))
              .map((q) => (
                <Link href={`/issues?theme=${q.id}`} key={q.id}>
                  {q.theme} →
                </Link>
              ))}
          </div>
        )}
        {types
          .filter((type) => !selected.length || selected.includes(type.id))
          .map((type) => (
            <article key={type.id}>
              <h3>
                <Link href={type.href}>{type.label} →</Link>
              </h3>
              <p>{type.description}</p>
            </article>
          ))}
      </section>
      <p className="caption">
        政策への賛否とは別の情報です。候補者の採点や、おすすめ順位には使いません。
      </p>
    </main>
  );
}
