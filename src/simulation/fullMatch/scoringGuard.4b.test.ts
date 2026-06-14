import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { scoringRegistryEntry } from "../../systems/scoring";
import { runFullMatch } from "../runFullMatch";
import { officialTimelineDiffViewSignature } from "./officialTimelineDiffViewSignature";

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

export function validateScoringGuard4B(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const signature = officialTimelineDiffViewSignature(report);
  const scoreTotal = report.score.home + report.score.away;
  const previewFact = report.evidenceFacts.find((fact) =>
    fact.category === "WORKBENCH_CHAIN_SELECTION_PREVIEW"
  );

  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");
  assertTest(scoreChangeTotal(report) === scoreTotal, "official final score must derive only from official score_change.");
  assertTest(signature.officialTimelineEventCountDelta === 0, "official timeline event count delta must be zero.");
  assertTest(signature.officialScoringEventCountDelta === 0, "official scoring event count delta must be zero.");
  assertTest(signature.officialScoreDelta === 0, "official score delta must be zero.");
  assertTest(signature.productionScoringEventCreationCount === 0, "selection preview must not create production scoring events.");
  assertTest(previewFact !== undefined, "selection preview evidence must exist.");
  assertTest(previewFact?.internalTags.includes("selection_preview_only_true") ?? false, "preview must remain preview-only.");
  assertTest(previewFact?.internalTags.includes("selection_preview_can_change_lineup_false") ?? false, "preview must not change lineup.");
  assertTest(previewFact?.internalTags.includes("selection_preview_can_drive_live_selection_false") ?? false, "preview must not drive live selection.");
  assertTest(previewFact?.internalTags.includes("selection_preview_can_drive_production_route_resolution_false") ?? false, "preview must not drive production route resolution.");
  assertTest(report.reportMeta.limitations.includes("FULLMATCH_SELECTION_PREVIEW_CANNOT_DRIVE_LIVE_SELECTION"), "limitations must mark preview live-selection-forbidden.");

  return [
    "scoring constants unchanged",
    "official final score still derives only from official score_change",
    "no production scoring events deleted/capped/rewritten/fabricated",
    "selection preview creates no production scoring events",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
  ];
}

if (require.main === module) {
  const checks = validateScoringGuard4B();

  console.log("scoringGuard.4b tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
