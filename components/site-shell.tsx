"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const compact = pathname === "/questions";
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
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
            オシセン
            <span className="logo-period" aria-hidden="true">
              .
            </span>
          </Link>
          {!compact && (
            <>
              <nav className="desktop-nav" aria-label="メインナビゲーション">
                <Link href="/candidates">候補者を見る</Link>
                <Link href="/method">仕組み</Link>
                <Link href="/about">オシセンについて</Link>
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
                  className="menu-button"
                  aria-expanded={menuOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMenuOpen(!menuOpen)}
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
            <Link onClick={closeMenu} href="/method">
              仕組み →
            </Link>
            <Link onClick={closeMenu} href="/about">
              オシセンについて →
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
                <Link className="logo" href="/">
                  オシセン<span className="logo-period">.</span>
                </Link>
                <p>政治家との出会い方を、変える。</p>
              </div>
              <nav aria-label="フッターナビゲーション">
                <Link href="/about">オシセンについて</Link>
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
    </>
  );
}
