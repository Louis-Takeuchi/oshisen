import assert from "node:assert/strict";
import { test } from "node:test";
import { candidates } from "../lib/data.ts";
import {
  getTeamAnswer,
  teamMembers,
  teamQuestions,
  type TeamMember,
} from "../lib/team.ts";

test("the two supplied portraits belong to the correct named operators and roles", () => {
  assert.deepEqual(
    teamMembers.map(
      ({ id, name, fullName, role, photo, responsibilities }) => ({
        id,
        name,
        fullName,
        role,
        src: photo.src,
        responsibilities: responsibilities.map(({ label }) => label),
      }),
    ),
    [
      {
        id: "oya",
        name: "Ryo",
        fullName: "大屋涼",
        role: "代表",
        src: "/team/oya.jpg",
        responsibilities: ["企画", "取材", "営業"],
      },
      {
        id: "takeuchi",
        name: "Louis",
        fullName: "竹内琉瑛",
        role: "共同代表",
        src: "/team/takeuchi.jpg",
        responsibilities: ["開発", "デザイン", "研究"],
      },
    ],
  );
});

test("personality, days off and interests reproduce the provided answers without inference", () => {
  assert.deepEqual(
    teamMembers.map(({ answers }) => answers),
    [
      {
        personality: "クレイジーネゴシエーター",
        "day-off": "政策提言立案",
        favorite: "サッカー観戦、ランニング",
      },
      {
        personality: "見習い科学哲学者",
        "day-off": "本と論文を読む",
        favorite: "認知科学、AI開発、日本古代史探究",
      },
    ],
  );
  assert.equal(new Set(teamQuestions.map(({ id }) => id)).size, 7);
  for (const member of teamMembers) {
    for (const question of teamQuestions.slice(3)) {
      assert.equal(getTeamAnswer(member, question.id), null, question.id);
    }
  }
});

test("blank answers stay unpublished, and provided answers retain their wording", () => {
  const draft: TeamMember = {
    ...teamMembers[0],
    answers: { personality: "  ", "day-off": "\n本人からの回答\n" },
  };
  assert.equal(getTeamAnswer(draft, "personality"), null);
  assert.equal(getTeamAnswer(draft, "day-off"), "本人からの回答");
  assert.equal(getTeamAnswer(draft, "decision"), null);
});

test("operators are separate from electoral candidate and policy-matching data", () => {
  const candidateIds = new Set<string>(candidates.map(({ id }) => id));
  for (const member of teamMembers) {
    assert.equal(candidateIds.has(member.id), false);
    assert.equal(
      candidates.some(
        ({ name }) => name === member.fullName || name === member.name,
      ),
      false,
    );
  }
  assert.equal(
    candidates.length,
    0,
    "candidate publication awaits real verified records",
  );
});
