import type { Metadata } from "next";
import { DiagnosisStart } from "../../components/diagnosis-start";
export const metadata: Metadata = { title: "診断をはじめる" };
export default function Page() {
  return <DiagnosisStart />;
}
