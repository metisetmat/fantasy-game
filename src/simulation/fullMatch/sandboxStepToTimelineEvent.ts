import type { SandboxSequenceStepType } from "./sandboxSequenceReplay";
import type { ControlledSegmentSandboxTimelineEventType } from "./controlledSegmentSandboxTimeline";

export function sandboxStepToTimelineEvent(stepType: SandboxSequenceStepType): ControlledSegmentSandboxTimelineEventType {
  switch (stepType) {
    case "SANDBOX_SEQUENCE_START":
      return "sandbox_sequence_start";
    case "BASELINE_ROUTE_REFERENCE":
      return "sandbox_baseline_route_reference";
    case "CONTROLLED_ROUTE_RESOLVED":
      return "sandbox_route_resolved";
    case "NO_SCORING_OPPORTUNITY":
      return "sandbox_no_scoring_opportunity";
    case "SCORING_OPPORTUNITY_CLASSIFIED":
      return "sandbox_opportunity_classified";
    case "NO_SCORING_EVENT_CANDIDATE":
      return "sandbox_no_scoring_event_candidate";
    case "SCORING_EVENT_CANDIDATE_CREATED":
      return "sandbox_scoring_candidate_created";
    case "NO_SCORE_ATTEMPT":
      return "sandbox_no_score_attempt";
    case "SHOT_RESOLVED":
      return "sandbox_shot_resolved";
    case "NO_GOALKEEPER_RESPONSE":
      return "sandbox_no_goalkeeper_response";
    case "GOALKEEPER_RESPONSE_RESOLVED":
      return "sandbox_goalkeeper_response";
    case "NO_REBOUND":
      return "sandbox_no_rebound";
    case "REBOUND_STATE_RESOLVED":
      return "sandbox_rebound_state";
    case "NO_CONTINUATION":
      return "sandbox_no_continuation";
    case "CONTINUATION_ACTION_RESOLVED":
      return "sandbox_continuation_action";
    case "SANDBOX_SEQUENCE_END":
      return "sandbox_sequence_end";
  }
}
