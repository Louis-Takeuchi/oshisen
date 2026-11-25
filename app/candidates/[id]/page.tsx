import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCandidate2026 } from "../../../lib/candidates2026";
import { districtLabels } from "../../../lib/election2026";
import { CandidateDetail } from "../../../components/candidate-detail";
import { pageMetadata } from "../../../lib/seo";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const candidate = getCandidate2026(id);
  if (!candidate) notFound();
  return pageMetadata(`/candidates/${candidate.id}`, {
    title: `${candidate.name}｜${districtLabels[candidate.district]}・2026年茨城県議選`,
    description: `2026年茨城県議会議員選挙・${districtLabels[candidate.district]}の候補者、${candidate.name}さんの政策の回答とインタビューを、本人の回答のまま掲載しています。`,
    index: true,
    image: `/share/candidate-${candidate.id}.png?v=1`,
  });
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const candidate = getCandidate2026(id);
  if (!candidate) notFound();
  return <CandidateDetail candidate={candidate} />;
}
