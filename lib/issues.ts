import { questions, type QuestionId } from "./data.ts";

export function getIssueQuestion(value: unknown) {
  return typeof value === "string"
    ? questions.find((question) => question.id === value)
    : undefined;
}

export function resolveIssueTheme(value: unknown): QuestionId {
  return getIssueQuestion(value)?.id ?? "transport";
}
