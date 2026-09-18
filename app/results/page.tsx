import type { Metadata } from "next";
import { Results } from "../../components/results";
export const metadata: Metadata = { title: "あなたの回答" };
export default function Page() {
  return <Results />;
}
