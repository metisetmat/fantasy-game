import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateFullMatchFatiguePropagation(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const report = runFullMatch(input);
  const home = report.fatigueReport.teamSummaries.find((summary) => summary.teamId === input.homeTeam.teamId);
  const away = report.fatigueReport.teamSummaries.find((summary) => summary.teamId === input.awayTeam.teamId);
  const conditionMoved = report.fatigueReport.playerSummaries.some((summary) => summary.conditionEnd < summary.conditionStart);
  const scoreFromConsequences = report.timeline.reduce(
    (score, event) => {
      const points = event.consequences
        .filter((consequence) => consequence.type === "score_change")
        .reduce((total, consequence) => total + (consequence.value ?? 0), 0);

      return {
        home: score.home + (event.teamId === input.homeTeam.teamId ? points : 0),
        away: score.away + (event.teamId === input.awayTeam.teamId ? points : 0),
      };
    },
    { home: 0, away: 0 },
  );

  assertTest(home !== undefined && away !== undefined, "fatigue propagation must include both teams.");
  assertTest(conditionMoved, "condition must decrease over a full-match-shaped report.");
  if (home !== undefined && away !== undefined) {
    assertTest(
      away.highIntensityLoad >= home.highIntensityLoad,
      "high pressing creates greater or equal fatigue load than balanced pressing.",
    );
  }
  assertTest(
    scoreFromConsequences.home === report.score.home && scoreFromConsequences.away === report.score.away,
    "final score must still equal score_change consequences.",
  );

  return [
    "high pressing creates greater fatigue load than balanced pressing",
    "condition decreases over full-match run",
    "final score equals score_change consequences",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchFatiguePropagation();

  console.log("fullMatchFatiguePropagation tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
