"use client";
import Link from "next/link";
import { useState } from "react";
import { questionPath, sentQuestions } from "../lib/election2026.ts";
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
    description: "学生時代から、これまで歩んできた道を知る。",
  },
  {
    id: "motivation",
    label: "政治に関わったきっかけ",
    href: "/stories#H03",
    description: "なぜ政治の世界に関わろうと思ったのかを知る。",
  },
  {
    id: "regret",
    label: "後悔した経験",
    href: "/stories#H04",
    description: "後悔した経験から何を考えたのかを聞く。",
  },
  {
    id: "values",
    label: "未来観と大切にしているもの",
    href: "/stories#H05",
    description: "2100年の未来の想像と、譲れない価値観を知る。",
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
      <h1>関心に応じた情報検索</h1>
      <p className="lead">答えなくても大丈夫。気になる話への道しるべです。</p>
      <PriorityThemePicker />
      <section className="information-types">
        <h2>情報の種類</h2>
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
        <h2>関連する情報</h2>
        {priorityIds.length > 0 && (
          <div className="exploration-links">
            {sentQuestions
              .filter((question) => priorityIds.includes(question.id))
              .map((question) => (
                <Link href={questionPath(question)} key={question.id}>
                  {question.themeLabel} →
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
        選んだテーマや知りたい情報を手がかりに、関連するページをご案内しています。
      </p>
    </main>
  );
}
