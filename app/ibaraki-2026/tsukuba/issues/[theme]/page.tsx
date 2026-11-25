import { redirect } from "next/navigation";

/** 旧版（2026-09-18草案）の8テーマページ。候補者送付版の質問一覧へ転送する（P1-5）。 */
export default function LegacyIssuePage() {
  redirect("/issues");
}
