"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "./brand-logo";
import styles from "./home-title.module.css";

function Letters({ text, start = 0 }: { text: string; start?: number }) {
  return Array.from(text).map((letter, index) => (
    <span
      className={styles.letter}
      style={{ "--letter": start + index } as CSSProperties}
      key={`${index}-${letter}`}
    >
      {letter}
    </span>
  ));
}

export function HomeTitle() {
  const [paused, setPaused] = useState(false);

  return (
    <section
      className={`${styles.titleScreen} ${paused ? styles.paused : ""}`}
      aria-labelledby="home-title"
    >
      <div className={styles.scenery} aria-hidden="true">
        <span className={styles.yellowBlob} />
        <span className={styles.blueBlob} />
        <span className={styles.blueCorner} />
        <span className={styles.yellowCorner} />
        <svg className={styles.scribble} viewBox="0 0 120 90" fill="none">
          <path d="M15 66C48 8 65 0 54 36L39 73C36 82 54 72 98 30" />
        </svg>
        <span className={styles.pinkRays} />
        <span className={styles.confetti} />
        <span className={styles.littleSpark}>✳</span>
      </div>

      <div className={styles.center}>
        <div className={styles.logoEntrance}>
          <BrandLogo
            src="/brand-logo.png"
            alt="オシセン！"
            width={1200}
            height={400}
            priority
            className={styles.titleLogo}
          />
        </div>

        <h1 id="home-title" className={styles.headline}>
          <span className="sr-only">政治家の政策と人柄</span>
          <span className={styles.line} aria-hidden="true">
            <Letters text="政治家の" />
          </span>
          <span className={styles.line} aria-hidden="true">
            <span className={styles.highlight}>
              <Letters text="政策と人柄" start={4} />
            </span>
          </span>
        </h1>

        <p className={styles.tagline}>
          政策への考え方と、本人の経験を知るためのサービスです。
        </p>

        <div className={styles.mascotEntrance}>
          <div className={styles.mascotFloat}>
            <span className={styles.mascotHello} aria-hidden="true">
              公式マスコット
            </span>
            <Image
              src="/mascot/kikumaru.webp"
              alt="青と黄色の大きな耳で話をきく、マスコットのきくまる"
              width={1000}
              height={625}
              className={styles.mascot}
              unoptimized
              loading="eager"
            />
            <span className={styles.mascotName} aria-hidden="true">
              きくまる
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <Link href="#discover" className={styles.startButton}>
            サービス紹介
            <span className={styles.buttonArrow} aria-hidden="true">
              ↗
            </span>
          </Link>
          <Link href="/diagnosis" className={styles.discoverLink}>
            政策の質問へ <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      <div className={styles.bottomLine}>
        <button
          type="button"
          className={styles.motionButton}
          onClick={() => setPaused((current) => !current)}
          aria-label={
            paused ? "アニメーションを再開" : "アニメーションを一時停止"
          }
          aria-pressed={paused}
          title={paused ? "アニメーションを再開" : "アニメーションを一時停止"}
        >
          <span aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span>
        </button>
        <Link href="/ibaraki-2026/tsukuba" className={styles.region}>
          2026 茨城県議選・つくば <span>準備中</span>
        </Link>
        <a
          href="#discover"
          className={styles.scroll}
          aria-label="オシセンの紹介へスクロール"
        >
          SCROLL <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  );
}
