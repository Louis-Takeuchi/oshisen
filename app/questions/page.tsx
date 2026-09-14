import type { Metadata } from "next";
import { Questionnaire } from "../../components/questionnaire";
export const metadata: Metadata = { title: "質問に答える" };
export default function Page() {
  return <Questionnaire />;
}
