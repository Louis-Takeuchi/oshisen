"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./service-introduction.module.css";

const steps = [
  {
    title: "政策の比較",
    description:
      "政策の質問に答え、候補者の回答と一問ずつ比較します。賛否だけでなく、理由や条件も確認できます。",
    note: "8問の草案を体験できます。候補者の本人回答は掲載準備中です。",
    href: "/diagnosis",
    link: "政策の質問へ",
  },
  {
    title: "本人の話",
    description:
      "共通のインタビューで、本人の経験や判断の理由を紹介します。政策を考える背景を知ることができます。",
    note: "共通インタビュー6問を公開中です。Podcast取材はこれからです。",
    href: "/stories",
    link: "インタビュー項目へ",
  },
  {
    title: "出典の確認",
    description:
      "要約から文字起こしやPodcastの原音へ進み、発言の前後を確認できます。",
    note: "原音・原文と発言趣旨を確認し、出典とともに掲載する予定です。",
    href: "/sources",
    link: "掲載方針へ",
  },
] as const;

function PolicyDiagram() {
  return (
    <div className={styles.policyDiagram}>
      <div className={`${styles.topicRow} ${styles.node}`}>
        <span>交通</span>
        <span>教育</span>
        <span>医療</span>
        <span>ほか5テーマ</span>
      </div>
      <div className={`${styles.question} ${styles.node}`}>
        <span className={styles.nodeLabel}>政策について</span>
        <strong>同じ質問</strong>
      </div>
      <div className={styles.branch} aria-hidden="true" />
      <div className={styles.answerPair}>
        <div className={`${styles.answer} ${styles.node}`}>
          <span className={styles.personIcon} aria-hidden="true" />
          <strong>あなたの回答</strong>
          <span>賛否・判断保留</span>
        </div>
        <div className={`${styles.answer} ${styles.node}`}>
          <span className={styles.personIcon} aria-hidden="true" />
          <strong>候補者の回答</strong>
          <span>理由・条件も掲載予定</span>
        </div>
      </div>
      <div className={`${styles.result} ${styles.node}`}>一問ずつ比較</div>
    </div>
  );
}

function InterviewDiagram() {
  return (
    <div className={styles.interviewDiagram}>
      <div className={`${styles.recording} ${styles.node}`}>
        <span className={styles.nodeLabel}>共通インタビュー</span>
        <strong>本人のことば</strong>
        <div className={styles.waveform} aria-hidden="true">
          {[20, 36, 22, 54, 38, 68, 42, 26, 60, 78, 36, 56, 28, 48, 20].map(
            (height, index) => (
              <i
                key={index}
                style={{
                  height: `${height}%`,
                  animationDelay: `${index * 45}ms`,
                }}
              />
            ),
          )}
        </div>
        <span className={styles.recordingNote}>Podcast取材・掲載準備中</span>
      </div>
      <div className={styles.interviewTopics}>
        <div className={styles.node}>
          <span>01</span>
          <strong>経験</strong>
        </div>
        <div className={styles.node}>
          <span>02</span>
          <strong>選択</strong>
        </div>
        <div className={styles.node}>
          <span>03</span>
          <strong>理由・条件</strong>
        </div>
      </div>
      <p className={`${styles.diagramCaption} ${styles.node}`}>
        共通の項目で、話の内容を整理
      </p>
    </div>
  );
}

function SourceDiagram() {
  return (
    <div className={styles.sourceDiagram}>
      <div className={`${styles.sourceDocument} ${styles.node}`}>
        <span className={styles.documentNumber}>01</span>
        <div>
          <strong>発言の要約</strong>
          <span>内容の概要</span>
        </div>
        <span className={styles.documentIcon} aria-hidden="true">
          ≡
        </span>
      </div>
      <span className={styles.sourceArrow} aria-hidden="true">
        ↓
      </span>
      <div className={`${styles.sourceDocument} ${styles.node}`}>
        <span className={styles.documentNumber}>02</span>
        <div>
          <strong>文字起こし</strong>
          <span>前後の発言・文脈</span>
        </div>
        <span className={styles.documentIcon} aria-hidden="true">
          ≡
        </span>
      </div>
      <span className={styles.sourceArrow} aria-hidden="true">
        ↓
      </span>
      <div className={`${styles.sourceDocument} ${styles.node}`}>
        <span className={styles.documentNumber}>03</span>
        <div>
          <strong>Podcastの原音</strong>
          <span>本人の声・全編</span>
        </div>
        <span className={styles.audioIcon} aria-hidden="true">
          ▂▆▃▇▂
        </span>
      </div>
      <p className={`${styles.diagramCaption} ${styles.node}`}>
        掲載する情報には、出典を明記
      </p>
    </div>
  );
}

export function ServiceIntroduction() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [inView, setInView] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const current = steps[step];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.25 },
    );
    if (stage.current) observer.observe(stage.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || !inView) return;
    const timer = window.setTimeout(() => {
      if (step === steps.length - 1) setPlaying(false);
      else setStep((previous) => previous + 1);
    }, 6000);
    return () => window.clearTimeout(timer);
  }, [playing, inView, step]);

  function selectStep(next: number) {
    setPlaying(false);
    setStep(next);
  }

  return (
    <section
      id="discover"
      className={styles.introduction}
      aria-labelledby="introduction-title"
    >
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>サービス紹介</p>
          <h2 id="introduction-title">オシセンについて</h2>
        </div>
        <p>
          政策への考え方と、本人が語る経験。
          <br />
          2つの情報から、政治家を知るサービスです。
        </p>
      </div>
      <div className={styles.stage} ref={stage} data-in-view={inView}>
        <div className={styles.stepMenu} role="group" aria-label="紹介する機能">
          {steps.map((item, index) => (
            <button
              key={item.title}
              id={`intro-step-${index}`}
              type="button"
              aria-pressed={step === index}
              aria-controls="introduction-panel"
              onClick={() => selectStep(index)}
            >
              <span>0{index + 1}</span>
              {item.title}
              <span className={styles.stepMark} aria-hidden="true">
                ↗
              </span>
            </button>
          ))}
        </div>
        <div
          id="introduction-panel"
          role="region"
          aria-labelledby={`intro-step-${step}`}
          className={styles.panel}
        >
          <div
            className={styles.visual}
            data-scene={step}
            key={`visual-${step}`}
          >
            <span className={styles.visualLabel}>サービスの仕組み</span>
            {step === 0 ? (
              <PolicyDiagram />
            ) : step === 1 ? (
              <InterviewDiagram />
            ) : (
              <SourceDiagram />
            )}
          </div>
          <div className={styles.explanation} key={`explanation-${step}`}>
            <span className={styles.chapterNumber}>
              0{step + 1}
              <span> / 03</span>
            </span>
            <h3>{current.title}</h3>
            <p>{current.description}</p>
            <div className={styles.preparation}>
              <span>現在の公開状況</span>
              <p>{current.note}</p>
            </div>
            <Link className={styles.detailLink} href={current.href}>
              {current.link}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.playButton}
            aria-pressed={playing}
            onClick={() => {
              if (!playing && step === steps.length - 1) setStep(0);
              setPlaying((previous) => !previous);
            }}
          >
            <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>
            {playing ? "自動再生を停止" : "紹介を自動再生"}
          </button>
          <div className={styles.paging}>
            <button
              type="button"
              aria-label="前の紹介"
              disabled={step === 0}
              onClick={() => selectStep(step - 1)}
            >
              ←
            </button>
            <span>0{step + 1} / 03</span>
            <button
              type="button"
              aria-label="次の紹介"
              disabled={step === steps.length - 1}
              onClick={() => selectStep(step + 1)}
            >
              →
            </button>
          </div>
        </div>
      </div>
      <div className={styles.footnote}>
        <Image
          src="/mascot/kikumaru.webp"
          alt="きくまる"
          width={88}
          height={55}
          unoptimized
        />
        <p>
          候補者の総合点や、人柄の点数はつけません。
          <br className={styles.mobileBreak} />
          情報をもとに、利用者自身が判断できます。
        </p>
      </div>
    </section>
  );
}
