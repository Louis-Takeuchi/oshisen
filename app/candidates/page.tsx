import type { Metadata } from "next";
import { CandidateList } from "../../components/candidate-list";
export const metadata: Metadata = { title: "候補者を見る" };
export default function Page() {
  return <CandidateList />;
}
