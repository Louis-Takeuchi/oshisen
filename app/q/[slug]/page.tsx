import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  getSentQuestion,
  questionPath,
  questionShareImagePath,
  scopeLabels,
  sentQuestions,
} from "../../../lib/election2026";
import { pageMetadata } from "../../../lib/seo";
import { QuestionPage } from "../../../components/question-page";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ level?: string | string[] }>;
};

export function generateStaticParams() {
  return sentQuestions.map((question) => ({ slug: question.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const question = getSentQuestion(slug);
  if (!question) notFound();
  return pageMetadata(questionPath(question), {
    title: `${question.themeLabel}の質問｜${scopeLabels[question.scope]}・2026年茨城県議選`,
    description: `${question.textNormal} あなたならどう答える？ 候補者にも同じ質問をしています（7段階）。回答は12月4日（告示日）以降、立候補届出順に並びます。`,
    index: true,
    image: questionShareImagePath(question),
  });
}

export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  const { level } = await searchParams;
  const question = getSentQuestion(slug);
  if (!question) notFound();
  if (slug !== question.slug) redirect(questionPath(question));
  return (
    <QuestionPage
      questionId={question.id}
      urlLevel={typeof level === "string" ? level : null}
    />
  );
}
