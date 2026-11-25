"use client";
import Link from "next/link";
import { BrandLogo } from "./brand-logo";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useConsideration } from "./use-consideration";
import { OfficialContacts } from "./official-contacts";
import { ArchiveBanner } from "./archive-banner";
import { DemoDataBanner } from "./demo-data-banner";
import { projectLabel } from "../lib/project";
import publicationRules from "../lib/publication-rules.json";
import titleStyles from "./home-title.module.css";
export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const compact = pathname === "/questions";
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const closeMenu = () => setMenuPath(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const { savedIds } = useConsideration();
  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuPath(null);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);
  return (
    <>
      <a className="skip-link" href="#main">
        本文へ移動
      </a>
      <header
        className={`site-header ${compact ? "compact-header" : ""} ${pathname === "/" ? titleStyles.homeHeader : ""}`}
      >
        <div className="container header-inner">
          <Link
            href="/"
            className="logo"
            onClick={closeMenu}
            aria-label="オシセン ホーム"
          >
            <BrandLogo
              src="/brand-logo.png"
              alt="オシセン！"
              width={540}
              height={180}
              className="brand-logo"
              unoptimized
              priority
            />
          </Link>
          {!compact && (
            <>
              <nav className="desktop-nav" aria-label="メインナビゲーション">
                <Link
                  href="/news"
                  aria-current={pathname === "/news" ? "page" : undefined}
                >
                  News
                </Link>
                <Link
                  href="/candidates"
                  aria-current={
                    pathname.startsWith("/candidates") ? "page" : undefined
                  }
                >
                  候補者
                </Link>
                <Link
                  href="/talk"
                  aria-current={pathname === "/talk" ? "page" : undefined}
                >
                  インタビュー動画
                </Link>
                <Link
                  href="/saved"
                  aria-current={pathname === "/saved" ? "page" : undefined}
                >
                  気になる候補{" "}
                  <span className="saved-count">{savedIds.length}</span>
                </Link>
                <Link
                  href="/about"
                  aria-current={pathname === "/about" ? "page" : undefined}
                >
                  オシセンについて
                </Link>
                <Link href="/diagnosis" className="button primary small">
                  質問に答える →
                </Link>
              </nav>
              <div className="mobile-navigation">
                <Link
                  className="button primary small"
                  href="/diagnosis"
                  onClick={closeMenu}
                >
                  質問に答える →
                </Link>
                <button
                  ref={menuButton}
                  type="button"
                  className="menu-button"
                  aria-expanded={menuOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMenuPath(menuOpen ? null : pathname)}
                >
                  {menuOpen ? "閉じる" : "メニュー"}
                </button>
              </div>
            </>
          )}
          {compact && (
            <Link className="quiet-link" href="/diagnosis">
              一時中断する
            </Link>
          )}
        </div>
        {menuOpen && !compact && (
          <nav
            id="mobile-menu"
            className="mobile-menu"
            aria-label="モバイルナビゲーション"
          >
            <div className="mobile-menu-primary">
              <Link onClick={closeMenu} href="/diagnosis">
                質問に答える →
              </Link>
              <Link onClick={closeMenu} href="/candidates">
                候補者 →
              </Link>
              <Link onClick={closeMenu} href="/talk">
                インタビュー動画 →
              </Link>
              <Link onClick={closeMenu} href="/about">
                オシセンについて →
              </Link>
            </div>
            <div className="mobile-menu-secondary">
              <Link onClick={closeMenu} href="/news">
                News・お知らせ →
              </Link>
              <Link onClick={closeMenu} href="/issues">
                政策の質問一覧 →
              </Link>
              <Link onClick={closeMenu} href="/results">
                自分の回答を見返す →
              </Link>
              <Link onClick={closeMenu} href="/compare">
                2人の回答を比べる →
              </Link>
              <Link onClick={closeMenu} href="/saved">
                気になる候補 {savedIds.length}人 →
              </Link>
              <Link onClick={closeMenu} href="/guides/high-school-election">
                高校生のための選挙ガイド →
              </Link>
              <Link onClick={closeMenu} href="/tsukuba/elections">
                つくば市の選挙情報 →
              </Link>
              <Link onClick={closeMenu} href="/tsuchiura/elections">
                土浦市の選挙情報 →
              </Link>
              <Link onClick={closeMenu} href="/ibaraki-2026/tsukuba">
                県議選・つくば市選挙区 →
              </Link>
              <Link onClick={closeMenu} href="/ibaraki-2026/tsuchiura">
                県議選・土浦市選挙区 →
              </Link>
              <Link onClick={closeMenu} href="/stories">
                インタビューの質問項目 →
              </Link>
              <Link onClick={closeMenu} href="/method">
                回答と情報の見方 →
              </Link>
              <Link onClick={closeMenu} href="/research">
                研究の準備 →
              </Link>
              <Link onClick={closeMenu} href="/about#team">
                運営メンバー →
              </Link>
              <Link onClick={closeMenu} href="/about#contact">
                公式SNS・お問い合わせ →
              </Link>
              <Link onClick={closeMenu} href="/sources">
                情報源・掲載状況 →
              </Link>
              <Link onClick={closeMenu} href="/neutrality">
                中立性ポリシー →
              </Link>
            </div>
          </nav>
        )}
      </header>
      <DemoDataBanner />
      <ArchiveBanner />
      {children}
      {!compact && (
        <footer className="site-footer">
          <div className="container">
            <div className="footer-top">
              <div>
                <Link className="logo" href="/" aria-label="オシセン ホーム">
                  <BrandLogo
                    src="/brand-logo.png"
                    alt="オシセン！"
                    width={540}
                    height={180}
                    className="brand-logo"
                    unoptimized
                  />
                </Link>
                <p>
                  つくば市・土浦市で、政策と本人の話を紹介する、政治家の情報サービス。
                </p>
              </div>
              <nav aria-label="フッターナビゲーション">
                <Link href="/news">News・お知らせ</Link>
                <Link href="/diagnosis">質問に答える</Link>
                <Link href="/issues">政策の質問一覧</Link>
                <Link href="/candidates">候補者</Link>
                <Link href="/talk">インタビュー動画</Link>
                <Link href="/compare">2人の回答を比べる</Link>
                <Link href="/saved">気になる候補</Link>
                <Link href="/guides/high-school-election">
                  高校生のための選挙ガイド
                </Link>
                <Link href="/tsukuba/elections">つくば市の選挙情報</Link>
                <Link href="/tsuchiura/elections">土浦市の選挙情報</Link>
                <Link href="/ibaraki-2026/tsukuba">
                  2026年茨城県議選・つくば市選挙区
                </Link>
                <Link href="/ibaraki-2026/tsuchiura">
                  2026年茨城県議選・土浦市選挙区
                </Link>
                <Link href="/about#project">つくば市・土浦市での取り組み</Link>
                <Link href="/stories">インタビューの質問項目</Link>
                <Link href="/about">オシセンについて</Link>
                <Link href="/about#team">運営メンバー</Link>
                <Link href="/about#contact">お問い合わせ</Link>
                <Link href="/method">回答と情報の見方</Link>
                <Link href="/policy-register">質問台帳</Link>
                <Link href="/research">研究の準備</Link>
                <Link href="/sources">情報源・掲載状況</Link>
                <Link href="/neutrality">中立性ポリシー</Link>
                <a href={publicationRules.href} type="application/pdf">
                  候補者向け掲載規約（PDF）
                </a>
                <Link href="/privacy">プライバシー</Link>
              </nav>
            </div>
            <OfficialContacts compact />
            <div className="footer-bottom">
              <p>{projectLabel} / Phase 0 準備中</p>
              <p>
                利用者が自分で投票について考えるための材料として、政策の問いや情報の見方を紹介しています。
              </p>
            </div>
          </div>
        </footer>
      )}
    </>
  );
}
