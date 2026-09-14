import type { Metadata } from "next";
import { Results } from "../../components/results";
export const metadata: Metadata = { title: "診断結果" };
export default function Page() {
  return <Results />;
}
