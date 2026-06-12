import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { controlledSegmentSandboxTimelineSignature } from "./controlledSegmentSandboxTimelineSignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const BASELINE_TYPES =
  "sandbox_sequence_start__sandbox_baseline_route_reference__sandbox_no_scoring_opportunity__sandbox_no_scoring_event_candidate__sandbox_no_score_attempt__sandbox_no_goalkeeper_response__sandbox_no_rebound__sandbox_no_continuation__sandbox_sequence_end";

const OVERRIDE_TYPES =
  "sandbox_sequence_start__sandbox_route_resolved__sandbox_opportunity_classified__sandbox_scoring_candidate_created__sandbox_shot_resolved__sandbox_goalkeeper_response__sandbox_rebound_state__sandbox_continuation_action__sandbox_sequence_end";

export function validateRunFullMatchExperimentalControlledSegmentSandboxTimeline(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const defaultSignature = controlledSegmentSandboxTimelineSignature(defaultReport);
  const experimentalSignature = controlledSegmentSandboxTimelineSignature(experimentalReport);
  const timelineFact = experimentalReport.evidenceFacts.find((fact) =>
    fact.category === "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_SANDBOX_TIMELINE"
  );
  const visibleText = [
    ...experimentalReport.tacticalReport.diagnoses.map((item) => item.summary),
    ...experimentalReport.warnings.map((item) => item.coachSummary),
  ].join("\n");

  assertTest(defaultSignature.tagCount === 0, "default runFullMatch must not expose controlled segment sandbox timeline tags.");
  assertTest(experimentalSignature.tagCount > 0, "experimental runFullMatch must expose controlled segment sandbox timeline tags.");
  assertTest(experimentalSignature.officialSandboxTimelineEventCount === 0, "sandbox timeline events must not be official MatchEvents.");
  assertTest(experimentalSignature.status === "available", "controlled segment sandbox timeline status must be available.");
  assertTest(experimentalSignature.origin === "sandbox_sequence_replay", "controlled segment sandbox timeline origin mismatch.");
  assertTest(experimentalSignature.baselineEventCount === "9", "baseline sandbox timeline event count must be 9.");
  assertTest(experimentalSignature.overrideEventCount === "9", "override sandbox timeline event count must be 9.");
  assertTest(experimentalSignature.baselineEventTypes === BASELINE_TYPES, "baseline sandbox timeline event types mismatch.");
  assertTest(experimentalSignature.overrideEventTypes === OVERRIDE_TYPES, "override sandbox timeline event types mismatch.");
  assertTest(experimentalSignature.baselineFinalOutcome === "none", "baseline final outcome must remain none.");
  assertTest(experimentalSignature.overrideFinalOutcome === "secured_by_goalkeeper_team", "override final outcome mismatch.");
  assertTest(experimentalSignature.overrideFinalTeamCandidate === "goalkeeper_team", "override final team mismatch.");
  assertTest(experimentalSignature.overrideFinalActorCandidate === "blitz-goalkeeper-free-safety", "override final actor mismatch.");
  assertTest(experimentalSignature.overrideFinalZoneCandidate === "Z3-HSR", "override final zone mismatch.");
  assertTest(experimentalSignature.sandboxTimelineCreated === "true", "sandbox timeline must be marked as created.");
  assertTest(experimentalSignature.sandboxTimelineSeparateFromOfficialTimeline === "true", "sandbox timeline must be separate from official timeline.");
  assertTest(experimentalSignature.sandboxTimelineEventCountDivergenceObserved === "false", "equal 9-event paths must not diverge by count.");
  assertTest(experimentalSignature.sandboxTimelineOutcomeDivergenceObserved === "true", "sandbox timeline outcome divergence must be observed.");
  assertTest(experimentalSignature.sandboxTimelineFinalTeamDivergenceObserved === "true", "sandbox timeline final team divergence must be observed.");
  assertTest(experimentalSignature.sandboxTimelineFinalZoneDivergenceObserved === "true", "sandbox timeline final zone divergence must be observed.");
  assertTest(experimentalSignature.modelAppliedOnlyInSandbox === "true", "timeline model must apply only in sandbox.");
  assertTest(experimentalSignature.modelAppliedToNormalLiveSelection === "false", "timeline model must not apply to normal live selection.");
  assertTest(timelineFact !== undefined, "experimental report must include controlled segment sandbox timeline evidence.");
  assertTest(timelineFact?.internalTags.includes("controlled_segment_sandbox_timeline_official_timeline_injection_forbidden") ?? false, "evidence must forbid official timeline injection.");
  assertTest(visibleText.includes("timeline sandbox separee"), "coach diagnosis must mention a separate sandbox timeline.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CONTROLLED_SEGMENT_SANDBOX_TIMELINE_RESULTS_ISOLATED_ONLY"), "limitations must say timeline result is isolated-only.");

  return [
    "default runFullMatch has no controlled segment sandbox timeline tags",
    "experimental runFullMatch has controlled segment sandbox timeline tags",
    "baseline and override paths expose the expected 9 timeline events",
    "override timeline ends with goalkeeper-team secure recovery",
    "sandbox timeline remains separate from official MatchReport timeline",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchExperimentalControlledSegmentSandboxTimeline();

  console.log("runFullMatchExperimentalControlledSegmentSandboxTimeline tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
