import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { scoringRegistryEntry } from "../../systems/scoring";
import { assertCanMakeGlobalScoringEconomyClaim } from "../diagnostics/sourceOfTruthGuards";
import { runFullMatch } from "../runFullMatch";
import {
  DEFAULT_FULL_MATCH_ROUTE_SELECTION_MODE,
  resolveFullMatchRouteSelectionMode,
} from "./fullMatchRouteSelectionMode";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function scoringEvents(report: ReturnType<typeof runFullMatch>): number {
  return report.timeline.filter((event) => event.eventType === "scoring").length;
}

function scoreSignature(report: ReturnType<typeof runFullMatch>): string {
  return `${report.score.home}-${report.score.away}:${scoringEvents(report)}`;
}

function scoreFromConsequences(report: ReturnType<typeof runFullMatch>): number {
  return report.timeline
    .flatMap((event) => event.consequences)
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

export function validateFullMatchRouteSelectionModeGuard(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const explicitDefaultReport = runFullMatch(input, { routeSelectionMode: "segment_harness" });
  const experimentalReport = runFullMatch(input, { routeSelectionMode: "workbench_chain_replay_experimental" });

  assertTest(DEFAULT_FULL_MATCH_ROUTE_SELECTION_MODE === "segment_harness", "default runFullMatch mode must be segment_harness.");
  assertTest(resolveFullMatchRouteSelectionMode({}) === "segment_harness", "empty options must resolve to segment_harness.");
  assertTest(
    resolveFullMatchRouteSelectionMode({ routeSelectionMode: "workbench_chain_replay_experimental" }) === "workbench_chain_replay_experimental",
    "experimental mode must be opt-in only.",
  );
  assertTest(scoreSignature(defaultReport) === scoreSignature(explicitDefaultReport), "explicit default must equal previous default behavior.");
  assertTest(scoreSignature(defaultReport) === scoreSignature(experimentalReport), "experimental mode must not mutate score.");
  assertTest(scoringEvents(defaultReport) === scoringEvents(experimentalReport), "experimental mode must not mutate scoring event count.");
  assertTest(scoreFromConsequences(defaultReport) === scoreFromConsequences(experimentalReport), "final score must still derive only from score_change.");
  assertTest(
    experimentalReport.reportMeta.limitations.includes("NORMAL_FULLMATCH_STILL_SEGMENT_HARNESS_BY_DEFAULT"),
    "report limitations must not claim normal full-match is chain-driven.",
  );
  try {
    assertCanMakeGlobalScoringEconomyClaim("FULL_MATCH_HARNESS_SINGLE_RUN");
    throw new Error("FULL_MATCH_HARNESS_SINGLE_RUN must not be global economy proof.");
  } catch (error) {
    assertTest(String(error).includes("50-match economy"), "single full-match must remain warning-only evidence.");
  }
  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");

  return [
    "default runFullMatch mode is segment_harness",
    "experimental mode is opt-in only",
    "default score equals previous default behavior",
    "experimental mode does not mutate score",
    "experimental mode does not mutate scoring event count",
    "report limitations do not claim normal full-match is chain-driven",
    "single full-match remains warning-only evidence",
    "scoring constants remain unchanged",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchRouteSelectionModeGuard();

  console.log("fullMatchRouteSelectionMode.guard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
