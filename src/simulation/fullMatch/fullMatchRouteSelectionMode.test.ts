import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { scoringRegistryEntry } from "../../systems/scoring";
import { runFullMatch } from "../runFullMatch";
import {
  DEFAULT_FULL_MATCH_ROUTE_SELECTION_MODE,
  fullMatchRouteSelectionModeDiagnostics,
  resolveFullMatchRouteSelectionMode,
} from "./fullMatchRouteSelectionMode";
import { assertCanMakeGlobalScoringEconomyClaim } from "../diagnostics/sourceOfTruthGuards";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function scoreSignature(report: ReturnType<typeof runFullMatch>): string {
  const scoringEvents = report.timeline.filter((event) => event.eventType === "scoring").length;

  return `${report.score.home}-${report.score.away}:${scoringEvents}`;
}

function scoreFromConsequences(report: ReturnType<typeof runFullMatch>): number {
  return report.timeline
    .flatMap((event) => event.consequences)
    .filter((consequence) => consequence.type === "score_change")
    .reduce((total, consequence) => total + (consequence.value ?? 0), 0);
}

export function validateFullMatchRouteSelectionMode(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });

  assertTest(DEFAULT_FULL_MATCH_ROUTE_SELECTION_MODE === "segment_harness", "default route selection mode must be segment_harness.");
  assertTest(resolveFullMatchRouteSelectionMode(undefined) === "segment_harness", "missing full-match options must resolve to segment_harness.");
  assertTest(
    resolveFullMatchRouteSelectionMode({ routeSelectionMode: "workbench_chain_replay_experimental" }) === "workbench_chain_replay_experimental",
    "experimental full-match route selection flag must be available.",
  );
  assertTest(
    fullMatchRouteSelectionModeDiagnostics("segment_harness").includes("FULLMATCH_CHAIN_REPLAY_FLAG_DISABLED_BY_DEFAULT"),
    "default diagnostics must say the chain replay flag is disabled by default.",
  );
  assertTest(
    experimentalReport.reportMeta.limitations.includes("Full-match route selection mode: workbench_chain_replay_experimental."),
    "experimental report must expose flag mode in limitations.",
  );
  assertTest(
    defaultReport.reportMeta.limitations.includes("Full-match route selection mode: segment_harness."),
    "default report must expose segment harness mode.",
  );
  assertTest(
    scoreSignature(defaultReport) === scoreSignature(experimentalReport),
    "experimental flag skeleton must not mutate score or scoring event count.",
  );
  assertTest(scoreFromConsequences(defaultReport) === defaultReport.score.home + defaultReport.score.away, "default score must derive from score_change consequences.");
  assertTest(scoreFromConsequences(experimentalReport) === experimentalReport.score.home + experimentalReport.score.away, "experimental score must derive from score_change consequences.");
  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");

  try {
    assertCanMakeGlobalScoringEconomyClaim("FULL_MATCH_HARNESS_SINGLE_RUN");
    throw new Error("FULL_MATCH_HARNESS_SINGLE_RUN must not be global economy proof.");
  } catch (error) {
    assertTest(String(error).includes("50-match economy"), "50-match economy must remain the global reference.");
  }

  return [
    "default runFullMatch mode remains segment_harness",
    "experimental full-match chain replay flag exists",
    "experimental mode is not default",
    "experimental flag does not mutate score or scoring events",
    "score remains derived from score_change consequences",
    "scoring constants remain unchanged",
    "50-match economy remains the global reference",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchRouteSelectionMode();

  console.log("fullMatchRouteSelectionMode tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
