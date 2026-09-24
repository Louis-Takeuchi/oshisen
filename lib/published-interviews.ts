import type { InterviewDocument, InterviewEpisode } from "./interviews.ts";

/** Server-page input only. Never import this registry from a client component. */
export const publishedInterviewDocument: InterviewDocument = {
  schemaVersion: "1.0",
  blocks: [],
};

/** No episode pages or VideoObject data are generated before real recordings are approved. */
export const publishedInterviewEpisodes: readonly InterviewEpisode[] = [];
