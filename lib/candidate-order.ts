import { candidates, type Candidate, type CandidateId } from "./data.ts";
import { project } from "./project.ts";

export interface OfficialCandidateOrder {
  readonly district: string;
  /** Copy the full candidate ID sequence from the official list, including unlisted candidates. */
  readonly candidateIds: readonly CandidateId[];
  readonly sourceUrl: string;
  readonly verifiedAt: string;
}

/** For the election in lib/project.ts only. Register verified official lists after publication. */
export const officialCandidateOrders: readonly OfficialCandidateOrder[] = [];

function validOrder(order: OfficialCandidateOrder): boolean {
  try {
    const source = new URL(order.sourceUrl);
    const date = new Date(`${order.verifiedAt}T00:00:00Z`);
    return (
      source.protocol === "https:" &&
      !source.username &&
      !source.password &&
      /^\d{4}-\d{2}-\d{2}$/.test(order.verifiedAt) &&
      Number.isFinite(date.getTime()) &&
      date.toISOString().slice(0, 10) === order.verifiedAt &&
      order.candidateIds.length > 0 &&
      order.candidateIds.every((id) => id.trim().length > 0) &&
      new Set(order.candidateIds).size === order.candidateIds.length
    );
  } catch {
    return false;
  }
}

/** Resolve against the full registry BEFORE filtering; partial lists never change the ordering basis. */
export function getCandidateOrderGroups(
  records: readonly Candidate[],
  orders: readonly OfficialCandidateOrder[] = officialCandidateOrders,
) {
  const districtOrder: readonly string[] = project.districts;
  const districts = [
    ...new Set(records.map((candidate) => candidate.district)),
  ];
  const rank = (district: string | null) => {
    const index = districtOrder.indexOf(district ?? "");
    return index < 0 ? districtOrder.length : index;
  };
  districts.sort(
    (left, right) =>
      rank(left) - rank(right) ||
      (left ?? "選挙区未確認").localeCompare(right ?? "選挙区未確認", "ja"),
  );
  return districts.map((district) => {
    const group = records.filter(
      (candidate) => candidate.district === district,
    );
    const matching = orders.filter((order) => order.district === district);
    const order = matching.length === 1 ? matching[0] : undefined;
    const official =
      order &&
      validOrder(order) &&
      group.every((candidate) => order.candidateIds.includes(candidate.id))
        ? order
        : undefined;
    group.sort((left, right) =>
      official
        ? official.candidateIds.indexOf(left.id) -
          official.candidateIds.indexOf(right.id)
        : left.kana.localeCompare(right.kana, "ja") ||
          left.id.localeCompare(right.id),
    );
    return { district, candidates: group, official };
  });
}

export const candidateOrderGroups = getCandidateOrderGroups(candidates);
export const orderedCandidates = candidateOrderGroups.flatMap(
  (group) => group.candidates,
);
