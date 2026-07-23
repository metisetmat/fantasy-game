import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { CoachReplayUXIterationView8G } from "./coachReplayUXIterationTypes8G";
import type { CoachReplayUXIterationWarningCode } from "./coachReplayUXIterationWarnings";

export interface CoachReplayPriorityAudit8G {
  readonly status: OfficialCausalityStatus;
  readonly priorityMomentCount: number;
  readonly firstScorePriorityPresent: boolean;
  readonly opponentResponsePriorityPresent: boolean;
  readonly finalLockPriorityPresent: boolean;
  readonly fatigueContextDemotedToContext: boolean;
  readonly priorityMomentScoreChangeBackedCount: number;
  readonly priorityMomentWithActorRoleCount: number;
  readonly priorityMomentWithZoneCount: number;
  readonly priorityMomentWithCoachReadCount: number;
  readonly priorityMomentWithLimitationCount: number;
  readonly priorityWarningCodes: readonly CoachReplayUXIterationWarningCode[];
  readonly recommendation: string;
}

export function auditCoachReplayPriority8G(view: CoachReplayUXIterationView8G): CoachReplayPriorityAudit8G {
  const priorityMomentCount = view.priorityMoments.length;
  const firstScorePriorityPresent = view.priorityMoments.some((moment) => moment.priorityReason === "first_score");
  const opponentResponsePriorityPresent = view.priorityMoments.some((moment) => moment.priorityReason === "opponent_response");
  const finalLockPriorityPresent = view.priorityMoments.some((moment) => moment.priorityReason === "final_lock");
  const fatigueContextDemotedToContext = view.momentCards.some((card) =>
    card.visualState === "fatigue_context" && card.priorityLevel === "context"
  );
  const priorityMomentScoreChangeBackedCount = view.priorityMoments.filter((moment) => moment.scoreChangeBacked).length;
  const priorityMomentWithActorRoleCount = view.priorityMoments.filter((moment) => moment.actorLabel.length > 0 && moment.roleLabel.length > 0).length;
  const priorityMomentWithZoneCount = view.priorityMoments.filter((moment) => moment.zoneLabel.length > 0).length;
  const priorityMomentWithCoachReadCount = view.priorityMoments.filter((moment) => moment.oneSentenceCoachRead.length > 0).length;
  const priorityMomentWithLimitationCount = view.priorityMoments.filter((moment) => moment.limitationSummary.length > 0).length;
  const warningCodes: CoachReplayUXIterationWarningCode[] = [];
  if (priorityMomentCount !== 3) warningCodes.push("PRIORITY_MOMENT_COUNT_INVALID");
  if (!fatigueContextDemotedToContext) warningCodes.push("FATIGUE_CONTEXT_OVERPROMOTED");
  if (warningCodes.length === 0) warningCodes.push("REPLAY_PRIORITY_READY");
  const pass = priorityMomentCount === 3 &&
    firstScorePriorityPresent &&
    opponentResponsePriorityPresent &&
    finalLockPriorityPresent &&
    fatigueContextDemotedToContext &&
    priorityMomentScoreChangeBackedCount === 3 &&
    priorityMomentWithActorRoleCount === 3 &&
    priorityMomentWithZoneCount === 3 &&
    priorityMomentWithCoachReadCount === 3;

  return {
    status: pass ? "PASS" : "FAIL",
    priorityMomentCount,
    firstScorePriorityPresent,
    opponentResponsePriorityPresent,
    finalLockPriorityPresent,
    fatigueContextDemotedToContext,
    priorityMomentScoreChangeBackedCount,
    priorityMomentWithActorRoleCount,
    priorityMomentWithZoneCount,
    priorityMomentWithCoachReadCount,
    priorityMomentWithLimitationCount,
    priorityWarningCodes: warningCodes,
    recommendation: pass ? "KEEP_REPLAY_PRIORITY_8G" : "REVIEW_REPLAY_PRIORITY_8G",
  };
}
