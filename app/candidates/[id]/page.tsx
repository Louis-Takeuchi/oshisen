import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { candidates } from "../../../lib/data";
import { CandidateDetail } from "../../../components/candidate-detail";
import { pageMetadata } from "../../../lib/seo";
import {
  candidateSeo,
  isCandidateIndexable,
} from "../../../lib/publication-seo";
import { getPublicInterviewBlocks } from "../../../lib/interviews";
import { publishedInterviewDocument } from "../../../lib/published-interviews";
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const candidate = candidates.find((c) => c.id === id);
  if (!candidate) notFound();
  return pageMetadata(`/candidates/${candidate.id}`, {
    ...candidateSeo(candidate),
    index: isCandidateIndexable(candidate),
  });
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
