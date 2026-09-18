import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { candidates } from "../../../lib/data";
import { CandidateDetail } from "../../../components/candidate-detail";
import { resolveSiteOrigin } from "../../../lib/site-origin";
import { getPublicInterviewBlocks } from "../../../lib/interviews";
import { publishedInterviewDocument } from "../../../lib/published-interviews";
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const candidate = candidates.find((c) => c.id === id);
  if (!candidate) return { title: "候補者が見つかりません" };
  const origin = resolveSiteOrigin(
    await headers(),
    process.env.SITE_URL,
  ).origin;
  const title = `${candidate.name}｜オシセン`;
  const description = `${candidate.name}の政策への本人回答、経験や判断の理由、一次情報を確認します。`;
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
          url: `${origin}/og.png?v=logo-2`,
          width: 1733,
          height: 907,
          alt: "オシセン プロトタイプ（候補者写真は未掲載）",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${origin}/og.png?v=logo-2`],
    },
  };
}
export default async function Page({ params }: Props) {
  const { id } = await params;
  const candidate = candidates.find((c) => c.id === id);
  if (!candidate) notFound();
  const interviewBlocks = getPublicInterviewBlocks(
    publishedInterviewDocument,
    candidate.id,
  );
  return (
    <CandidateDetail candidate={candidate} interviewBlocks={interviewBlocks} />
  );
}
