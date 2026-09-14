import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { candidates } from "../../../lib/data";
import { CandidateDetail } from "../../../components/candidate-detail";
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const candidate = candidates.find((c) => c.id === id);
  if (!candidate) return { title: "候補者が見つかりません" };
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") || "localhost:3000";
  const protocol =
    host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https";
  const origin = `${protocol}://${host}`;
  const title = `${candidate.name}（仮名）｜オシセン`;
  const description = `${candidate.name}の候補者詳細サンプル。政策比較、人となり、経歴、インタビュー、一次情報への導線を確認できます。実在候補者の情報ではありません。`;
  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      url: `${origin}/candidates/${candidate.id}`,
      type: "website",
      locale: "ja_JP",
      images: [
        {
          url: `${origin}/og.png`,
          width: 1731,
          height: 909,
          alt: "オシセン プロトタイプ（候補者写真は未掲載）",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${origin}/og.png`],
    },
  };
}
export default async function Page({ params }: Props) {
  const { id } = await params;
  const candidate = candidates.find((c) => c.id === id);
  if (!candidate) notFound();
  return <CandidateDetail candidate={candidate} />;
}
