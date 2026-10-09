import Image from "next/image";
import type { ReactNode } from "react";
import styles from "./kikumaru.module.css";

/** Decorative companion; the adjacent copy carries the message. */
export function Kikumaru({ size = 112 }: { size?: number }) {
  return (
    <Image
      src="/mascot/kikumaru.webp"
      alt=""
      width={size}
      height={Math.round(size * 0.625)}
      className={styles.mascot}
      unoptimized
    />
  );
}

export function KikumaruNote({
  children,
  panel = false,
}: {
  children: ReactNode;
  panel?: boolean;
}) {
  return (
    <div className={`${styles.note} ${panel ? styles.panel : ""}`}>
      <Kikumaru />
      <div className={styles.message}>{children}</div>
    </div>
  );
}

export function KikumaruLoading({
  message = "ページを読み込んでいます。",
}: {
  message?: string;
}) {
  return (
    <div className={styles.loading} role="status">
      <Kikumaru size={144} />
      <p className={styles.loadingTitle}>{message}</p>
      <p className={styles.loadingHint}>もう少しだけ、お待ちください。</p>
    </div>
  );
}
