import { sandboxStepToTimelineEvent } from "./sandboxStepToTimelineEvent";
import type { SandboxSequenceStepType } from "./sandboxSequenceReplay";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const EXPECTED: Readonly<Record<SandboxSequenceStepType, string>> = {
  SANDBOX_SEQUENCE_START: "sandbox_sequence_start",
  BASELINE_ROUTE_REFERENCE: "sandbox_baseline_route_reference",
  CONTROLLED_ROUTE_RESOLVED: "sandbox_route_resolved",
  NO_SCORING_OPPORTUNITY: "sandbox_no_scoring_opportunity",
  SCORING_OPPORTUNITY_CLASSIFIED: "sandbox_opportunity_classified",
  NO_SCORING_EVENT_CANDIDATE: "sandbox_no_scoring_event_candidate",
  SCORING_EVENT_CANDIDATE_CREATED: "sandbox_scoring_candidate_created",
  NO_SCORE_ATTEMPT: "sandbox_no_score_attempt",
  SHOT_RESOLVED: "sandbox_shot_resolved",
  NO_GOALKEEPER_RESPONSE: "sandbox_no_goalkeeper_response",
  GOALKEEPER_RESPONSE_RESOLVED: "sandbox_goalkeeper_response",
  NO_REBOUND: "sandbox_no_rebound",
  REBOUND_STATE_RESOLVED: "sandbox_rebound_state",
  NO_CONTINUATION: "sandbox_no_continuation",
  CONTINUATION_ACTION_RESOLVED: "sandbox_continuation_action",
  SANDBOX_SEQUENCE_END: "sandbox_sequence_end",
};

export function validateSandboxStepToTimelineEvent(): readonly string[] {
  for (const [stepType, eventType] of Object.entries(EXPECTED)) {
    assertTest(
      sandboxStepToTimelineEvent(stepType as SandboxSequenceStepType) === eventType,
      `${stepType} should map to ${eventType}.`,
    );
  }

  return [
    "all sandbox sequence step types map to controlled segment sandbox timeline event types",
    "baseline no-op steps map to explicit no-* timeline events",
    "override scoring/rebound/continuation steps map to positive sandbox timeline events",
  ];
}

if (require.main === module) {
  const checks = validateSandboxStepToTimelineEvent();

  console.log("sandboxStepToTimelineEvent tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
