"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useConsideration } from "./use-consideration";
import { ConsiderationBar } from "./consideration-bar";
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
      <header className={`site-header ${compact ? "compact-header" : ""}`}>
        <div className="container header-inner">
          <Link
            href="/"
            className="logo"
            onClick={closeMenu}
            aria-label="オシセン ホーム"
          >
            <Image
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
                  href="/candidates"
                  aria-current={
                    pathname.startsWith("/candidates") ? "page" : undefined
                  }
                >
                  候補者を見る
                </Link>
                <Link
                  href="/issues"
                  aria-current={pathname === "/issues" ? "page" : undefined}
                >
                  争点から見る
                </Link>
                <Link
                  href="/compare"
                  aria-current={pathname === "/compare" ? "page" : undefined}
                >
                  比較
                </Link>
                <Link
                  href="/saved"
                  aria-current={pathname === "/saved" ? "page" : undefined}
                >
                  気になる候補{" "}
                  <span className="saved-count">{savedIds.length}</span>
                </Link>
                <Link
                  href="/method"
                  aria-current={pathname === "/method" ? "page" : undefined}
                >
                  仕組み
                </Link>
                <Link href="/diagnosis" className="button primary small">
                  診断する →
                </Link>
              </nav>
              <div className="mobile-navigation">
                <Link
                  className="button primary small"
                  href="/diagnosis"
                  onClick={closeMenu}
                >
                  診断する →
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
            <Link onClick={closeMenu} href="/candidates">
              候補者を見る →
            </Link>
            <Link onClick={closeMenu} href="/issues">
              争点から見る →
            </Link>
            <Link onClick={closeMenu} href="/compare">
              2人の政策を比較する →
            </Link>
            <Link onClick={closeMenu} href="/saved">
              気になる候補 {savedIds.length}人 →
            </Link>
            <Link onClick={closeMenu} href="/method">
              仕組み →
            </Link>
            <Link onClick={closeMenu} href="/about">
              オシセンについて →
            </Link>
            <Link onClick={closeMenu} href="/about#team">
              運営メンバー →
            </Link>
            <Link onClick={closeMenu} href="/sources">
              情報源・公平性 →
            </Link>
          </nav>
        )}
      </header>
      {children}
      {!compact && (
        <footer className="site-footer">
          <div className="container">
            <div className="footer-top">
              <div>
                <Link className="logo" href="/" aria-label="オシセン ホーム">
                  <Image
                    src="/brand-logo.png"
                    alt="オシセン！"
                    width={540}
                    height={180}
                    className="brand-logo"
                    unoptimized
                  />
                </Link>
                <p>政治家との出会い方を、変える。</p>
              </div>
              <nav aria-label="フッターナビゲーション">
                <Link href="/issues">争点から見る</Link>
                <Link href="/compare">候補者を比較する</Link>
                <Link href="/saved">気になる候補</Link>
                <Link href="/about">オシセンについて</Link>
                <Link href="/about#team">運営メンバー</Link>
                <Link href="/method">マッチングの仕組み</Link>
                <Link href="/sources">情報源・公平性</Link>
                <Link href="/privacy">プライバシー</Link>
              </nav>
            </div>
            <div className="footer-bottom">
              <p>2026 茨城県議会議員選挙 / Phase 0 プロトタイプ</p>
              <p>特定の候補者への投票を推奨・依頼するものではありません。</p>
            </div>
          </div>
        </footer>
      )}
      {!compact && pathname !== "/compare" && <ConsiderationBar />}
    </>
  );
}
