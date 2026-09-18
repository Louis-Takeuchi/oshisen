import {
  interviewContentKey,
  interviewGuide,
  type RecordedInterviewBlock,
} from "./interviews.ts";

export type StudyCondition = "B" | "C";
export type StudyPhase = "free_browse" | "comprehension_task";
export const studyConditionLabels: Record<StudyCondition, string> = {
  B: "B：取材順",
  C: "C：共通項目・比較",
};
export interface InterviewPresentationGroup {
  id: string;
  label: string;
  blocks: RecordedInterviewBlock[];
}
/** Both modes consume exactly the same selected blocks. Only grouping/order changes. */
export function buildInterviewPresentation(
  blocks: readonly RecordedInterviewBlock[],
  condition: StudyCondition,
  subjectOrder: readonly string[],
): InterviewPresentationGroup[] {
  const subjects = [...new Set(subjectOrder)].slice(0, 2);
  const selected = blocks.filter((block) => subjects.includes(block.subjectId));
  if (condition === "B")
    return subjects.map((subjectId) => ({
      id: subjectId,
      label:
        selected.find((block) => block.subjectId === subjectId)?.subjectLabel ??
        subjectId,
      blocks: selected
        .filter((block) => block.subjectId === subjectId)
        .sort(
          (a, b) =>
            a.interviewOrder - b.interviewOrder || a.id.localeCompare(b.id),
        ),
    }));
  return interviewGuide.map((question) => ({
    id: question.id,
    label: `${question.id} ${question.title}`,
    blocks: selected
      .filter((block) => block.questionId === question.id)
      .sort(
        (a, b) =>
          subjects.indexOf(a.subjectId) - subjects.indexOf(b.subjectId) ||
          a.interviewOrder - b.interviewOrder ||
          a.id.localeCompare(b.id),
      ),
  }));
}
/** Verifies full content/source/volume equality, rather than comparing just ids. */
export function samePresentationMaterial(
  left: readonly InterviewPresentationGroup[],
  right: readonly InterviewPresentationGroup[],
): boolean {
  const keys = (groups: readonly InterviewPresentationGroup[]) =>
    groups.flatMap((group) => group.blocks.map(interviewContentKey)).sort();
  return JSON.stringify(keys(left)) === JSON.stringify(keys(right));
}
/** Rotate a fixed list between participants; unchanged within a participant. Not a ranking. */
export function balancedSubjectOrder(
  subjectIds: readonly string[],
  allocationIndex: number,
): string[] {
  if (!Number.isSafeInteger(allocationIndex) || allocationIndex < 0)
    throw new Error("割り付け番号は0以上の整数です。");
  const ids = [...new Set(subjectIds)];
  if (!ids.length) return [];
  const offset = allocationIndex % ids.length;
  return [...ids.slice(offset), ...ids.slice(0, offset)];
}
export type StudyAction =
  | "summary_open"
  | "context_open"
  | "source_open"
  | "full_source_open"
  | "policy_open";
export interface StudyEvent {
  sequence: number;
  sessionId: string;
  participantId: string;
  condition: StudyCondition;
  phase: StudyPhase;
  action: StudyAction;
  informationId: string;
  elapsedMs: number;
  repeat: boolean;
  repeatWithinPhase: boolean;
}
export interface LocalStudySession {
  kind: "local_preparation";
  consented: boolean;
  sessionId: string;
  participantId: string;
  condition: StudyCondition;
  phase: StudyPhase;
  events: StudyEvent[];
}
export function createLocalStudySession(
  sessionId: string,
  condition: StudyCondition,
): LocalStudySession {
  return {
    kind: "local_preparation",
    consented: false,
    sessionId,
    participantId: "local-check",
    condition,
    phase: "free_browse",
    events: [],
  };
}
export function recordStudyEvent(
  session: LocalStudySession,
  action: StudyAction,
  informationId: string,
  elapsedMs: number,
): LocalStudySession {
  if (
    !session.consented ||
    !informationId.trim() ||
    !Number.isFinite(elapsedMs) ||
    elapsedMs < 0
  )
    return session;
  const previous = session.events.filter(
    (event) => event.informationId === informationId && event.action === action,
  );
  const event: StudyEvent = {
    sequence: session.events.length + 1,
    sessionId: session.sessionId,
    participantId: session.participantId,
    condition: session.condition,
    phase: session.phase,
    action,
    informationId,
    elapsedMs,
    repeat: previous.length > 0,
    repeatWithinPhase: previous.some((event) => event.phase === session.phase),
  };
  return { ...session, events: [...session.events, event] };
}
/** Withdrawal also erases the local record. It cannot retract a manually downloaded file. */
export function revokeStudyConsent(
  session: LocalStudySession,
): LocalStudySession {
  return { ...session, consented: false, events: [] };
}
export function summarizeSourceAccess(
  events: readonly StudyEvent[],
  phase: StudyPhase,
) {
  const sourceEvents = events.filter(
    (event) =>
      event.phase === phase &&
      (event.action === "source_open" || event.action === "full_source_open"),
  );
  return {
    clicks: sourceEvents.length,
    uniqueInformationCount: new Set(
      sourceEvents.map((event) => event.informationId),
    ).size,
    repeatClicks: sourceEvents.filter((event) => event.repeatWithinPhase)
      .length,
  };
}
export interface ComprehensionTask {
  id: string;
  correctAnswerId: string;
  acceptableEvidenceSets: readonly (readonly string[])[];
}
export interface ComprehensionResponse {
  participantId: string;
  taskId: string;
  answerId: string;
  evidenceSegmentIds: readonly string[];
}
export interface ComprehensionScore {
  participantId: string;
  totalTasks: number;
  answeredTasks: number;
  correctContentAndEvidence: number;
  ratio: number | null;
  missingTaskIds: string[];
}
/** Denominator includes unanswered assigned tasks. Content AND source must be correct. */
export function scoreParticipantUnderstanding(
  participantId: string,
  tasks: readonly ComprehensionTask[],
  responses: readonly ComprehensionResponse[],
): ComprehensionScore {
  if (
    !participantId.trim() ||
    new Set(tasks.map((task) => task.id)).size !== tasks.length
  )
    throw new Error("参加者IDと重複のない課題IDが必要です。");
  const byTask = new Map<string, ComprehensionResponse>();
  for (const response of responses.filter(
    (response) =>
      response.participantId === participantId &&
      tasks.some((task) => task.id === response.taskId),
  )) {
    if (byTask.has(response.taskId))
      throw new Error(
        `課題 ${response.taskId} に複数の回答があります。採用する回答を先に確定してください。`,
      );
    byTask.set(response.taskId, response);
  }
  const normalized = (values: readonly string[]) =>
    JSON.stringify([...new Set(values)].sort());
  let correctContentAndEvidence = 0;
  for (const task of tasks) {
    const response = byTask.get(task.id);
    if (
      response &&
      response.answerId === task.correctAnswerId &&
      task.acceptableEvidenceSets.some(
        (evidence) =>
          normalized(evidence) === normalized(response.evidenceSegmentIds),
      )
    )
      correctContentAndEvidence += 1;
  }
  return {
    participantId,
    totalTasks: tasks.length,
    answeredTasks: byTask.size,
    correctContentAndEvidence,
    ratio: tasks.length ? correctContentAndEvidence / tasks.length : null,
    missingTaskIds: tasks
      .filter((task) => !byTask.has(task.id))
      .map((task) => task.id),
  };
}
