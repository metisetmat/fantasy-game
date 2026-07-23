import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { ReplayActorMappingNaturalNarrativeFix8FModel } from "./replayActorMappingNaturalMatchNarrativeFix8F";
import type { CoachReplayUXIterationWarningCode } from "./coachReplayUXIterationWarnings";

export interface CoachReplaySourceOfTruthRegressionAudit8G {
  readonly status: OfficialCausalityStatus;
  readonly replayUsesOfficialTimelineOnly: boolean;
  readonly replayUsesOfficialScoreOnly: boolean;
  readonly replayScoreMatchesOfficialScore: boolean;
  readonly allReplayScoreClaimsBackedByScoreChange: boolean;
  readonly scoreChangeEventsCoveredByReplayCount: number;
  readonly scoreChangeEventCount: number;
  readonly sandboxExcludedFromOfficialReplay: boolean;
  readonly batchExcludedFromOfficialReplay: boolean;
  readonly diagnosticSeparatedFromOfficialReplay: boolean;
  readonly sandboxReplayMomentInOfficialTimelineCount: number;
  readonly inventedReplayMomentCount: number;
  readonly unsupportedTruthClaimCount: number;
  readonly noPostHocRewrite: boolean;
  readonly noScoreMutation: boolean;
  readonly noEventDeletion: boolean;
  readonly noForcedNarrativeOutcome: boolean;
  readonly sourceOfTruthWarningCodes: readonly CoachReplayUXIterationWarningCode[];
  readonly recommendation: string;
}

export function auditCoachReplaySourceOfTruthRegression8G(
  baseline8F: ReplayActorMappingNaturalNarrativeFix8FModel,
): CoachReplaySourceOfTruthRegressionAudit8G {
  const source = baseline8F.replayScoreSourceOfTruthRegressionAudit;
  const warningCodes: CoachReplayUXIterationWarningCode[] = [];
  if (!source.allReplayScoreClaimsBackedByScoreChange) warningCodes.push("SCORE_CLAIM_WITHOUT_SCORE_CHANGE");
  if (!source.sandboxExcludedFromOfficialReplay) warningCodes.push("SANDBOX_REPLAY_PROMOTED");
  if (!source.batchExcludedFromOfficialReplay) warningCodes.push("BATCH_REPLAY_PROMOTED");
  if (!source.diagnosticSeparatedFromOfficialReplay) warningCodes.push("DIAGNOSTIC_REPLAY_PROMOTED");
  if (!source.noScoreMutation) warningCodes.push("SCORE_MANIPULATION_DETECTED");
  if (warningCodes.length === 0) warningCodes.push("SOURCE_OF_TRUTH_PRESERVED", "REPLAY_NO_NEW_TRUTH_LAYER");
  const status: OfficialCausalityStatus = warningCodes.includes("SOURCE_OF_TRUTH_PRESERVED") ? "PASS" : "FAIL";

  return {
    status,
    replayUsesOfficialTimelineOnly: source.replayUsesOfficialTimelineOnly,
    replayUsesOfficialScoreOnly: source.replayUsesOfficialScoreOnly,
    replayScoreMatchesOfficialScore: source.replayScoreMatchesOfficialScore,
    allReplayScoreClaimsBackedByScoreChange: source.allReplayScoreClaimsBackedByScoreChange,
    scoreChangeEventsCoveredByReplayCount: source.scoreChangeEventsCoveredByReplayCount,
    scoreChangeEventCount: source.scoreChangeEventCount,
    sandboxExcludedFromOfficialReplay: source.sandboxExcludedFromOfficialReplay,
    batchExcludedFromOfficialReplay: source.batchExcludedFromOfficialReplay,
    diagnosticSeparatedFromOfficialReplay: source.diagnosticSeparatedFromOfficialReplay,
    sandboxReplayMomentInOfficialTimelineCount: source.sandboxReplayMomentInOfficialTimelineCount,
    inventedReplayMomentCount: source.inventedReplayMomentCount,
    unsupportedTruthClaimCount: source.unsupportedTruthClaimCount,
    noPostHocRewrite: source.noPostHocRewrite,
    noScoreMutation: source.noScoreMutation,
    noEventDeletion: source.noEventDeletion,
    noForcedNarrativeOutcome: source.noForcedNarrativeOutcome,
    sourceOfTruthWarningCodes: warningCodes,
    recommendation: status === "PASS" ? "KEEP_REPLAY_SOURCE_OF_TRUTH_8G" : "REVIEW_REPLAY_SOURCE_OF_TRUTH_8G",
  };
}
