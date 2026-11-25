/** Project scope, not an announcement of the election schedule or candidates. */
export const project = {
  electionYear: 2026,
  electionName: "茨城県議会議員選挙",
  districts: ["つくば市選挙区", "土浦市選挙区"],
  phase: "Phase 0",
  status: "インタビュー収録中・12月4日から公開",
} as const;

export const projectDistrictLabel = project.districts.join("・");

export const projectLabel = `${project.electionYear} ${project.electionName} / ${projectDistrictLabel}`;
