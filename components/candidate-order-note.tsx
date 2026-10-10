import Link from "next/link";
import { candidateOrderGroups } from "../lib/candidate-order";

export function CandidateOrderNote({ ids }: { ids?: readonly string[] }) {
  const groups = candidateOrderGroups.filter(
    (group) =>
      !ids || group.candidates.some((candidate) => ids.includes(candidate.id)),
  );
  return (
    <div className="caption" aria-label="候補者の表示順">
      {groups.length ? (
        groups.map((group) => (
          <p key={group.district ?? "unknown"}>
            {group.district ?? "選挙区未確認"}：
            {group.official ? (
              <>
                立候補届出順（届出順）。
                <a
                  href={group.official.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  公式候補者一覧
                </a>
                （確認日：
                <time dateTime={group.official.verifiedAt}>
                  {group.official.verifiedAt}
                </time>
                ）
              </>
            ) : (
              "届出順の公表・確認前のため、氏名の読みの五十音順で仮表示しています。"
            )}
          </p>
        ))
      ) : (
        <p>
          {candidateOrderGroups.length
            ? "候補者を選ぶと、選挙区ごとの表示順と確認状況をここに表示します。"
            : "候補者の表示順は、選挙区ごとの立候補届出順に合わせる方針です。現在、候補者情報は掲載準備中です。"}
        </p>
      )}
      <Link href="/method#display-order" className="text-link">
        表示順の確認方法 →
      </Link>
    </div>
  );
}
