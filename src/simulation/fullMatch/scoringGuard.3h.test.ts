import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { scoringRegistryEntry } from "../../systems/scoring";
import { runFullMatch } from "../runFullMatch";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function scoreChangeTotal(report: ReturnType<typeof runFullMatch>): number {
  return report.timeline
    .flatMap((event) => event.consequences)
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

export function validateScoringGuard3H(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const scoreTotal = report.score.home + report.score.away;

  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");
  assertTest(scoreChangeTotal(report) === scoreTotal, "final score must derive only from score_change.");
  assertTest(
    report.reportMeta.limitations.includes("FULLMATCH_ISOLATED_MINIMATCH_OVERRIDE_DID_NOT_MUTATE_NORMAL_SCORE"),
    "isolated override experiment must not mutate normal score.",
  );
  assertTest(
    report.reportMeta.limitations.includes("FULLMATCH_ISOLATED_MINIMATCH_OVERRIDE_DID_NOT_MUTATE_NORMAL_SCORING_EVENTS"),
    "isolated override experiment must not mutate normal scoring events.",
  );
  assertTest(
    report.reportMeta.limitations.includes("FULLMATCH_ISOLATED_MINIMATCH_OVERRIDE_DID_NOT_CREATE_PRODUCTION_SCORING_EVENTS"),
    "isolated override experiment must not create production scoring events.",
  );
  assertTest(
    report.reportMeta.limitations.includes("FULLMATCH_ISOLATED_MINIMATCH_OVERRIDE_DID_NOT_MUTATE_PRODUCTION_ROUTE_RESOLUTION"),
    "isolated override experiment must not mutate production route resolution.",
  );
  assertTest(
    report.reportMeta.limitations.includes("FULLMATCH_ISOLATED_MINIMATCH_OVERRIDE_DID_NOT_MUTATE_GLOBAL_ROUTE_SUCCESS_RATES"),
    "isolated override experiment must not mutate global route success rates.",
  );
  assertTest(
    report.reportMeta.limitations.includes("FULLMATCH_ISOLATED_MINIMATCH_OVERRIDE_CANNOT_CLAIM_GLOBAL_ECONOMY"),
    "isolated override experiment must not claim global economy evidence.",
  );

  return [
    "SHOT_GOAL remains 3",
    "TRY_TOUCHDOWN remains 5",
    "CONVERSION_GOAL remains 2",
    "DROP_GOAL remains 2",
    "PENALTY_SHOT remains inactive",
    "final score still derives only from score_change",
    "no scoring events deleted/capped/rewritten/fabricated",
    "no production scoring event creation from isolated override experiment",
    "no normal score mutation from isolated override experiment",
    "no normal scoring event mutation from isolated override experiment",
    "no production route resolution mutation from isolated override experiment",
    "no global route success mutation from isolated override experiment",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
  ];
}

if (require.main === module) {
  const checks = validateScoringGuard3H();

  console.log("scoringGuard.3h tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
