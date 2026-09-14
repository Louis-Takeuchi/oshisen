"use client";

import { useState } from "react";
import {
  contactEmail,
  contactMailto,
  copyContactEmail,
} from "../lib/site-contact";
import styles from "./official-contacts.module.css";

export function ContactEmail() {
  const [state, setState] = useState<"idle" | "copying" | "copied" | "failed">(
    "idle",
  );

  async function copy() {
    setState("copying");
    setState((await copyContactEmail()) ? "copied" : "failed");
  }

  return (
    <div className={styles.email}>
      <a className={styles.emailLink} href={contactMailto}>
        {contactEmail} <span aria-hidden="true">↗</span>
        <span className="sr-only">（メールアプリで開く）</span>
      </a>
      <button
        type="button"
        className={styles.copyButton}
        onClick={copy}
        disabled={state === "copying"}
      >
        {state === "copying" ? "コピー中…" : "アドレスをコピー"}
      </button>
      <p role="status" className={styles.copyStatus}>
        {state === "copied"
          ? "メールアドレスをコピーしました。"
          : state === "failed"
            ? "コピーできませんでした。表示されているメールアドレスを選択してコピーしてください。"
            : "メールアプリが開かない場合は、アドレスをコピーしてお使いのメールサービスからご連絡ください。"}
      </p>
    </div>
  );
}
