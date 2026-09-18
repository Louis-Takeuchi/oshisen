/** Project scope, not an announcement of the election schedule or candidates. */
export const project = {
  electionYear: 2026,
  electionName: "茨城県議会議員選挙",
  district: "つくば市選挙区",
  phase: "Phase 0",
  status: "取材・掲載準備中",
} as const;

export const projectLabel = `${project.electionYear} ${project.electionName} / ${project.district}`;
