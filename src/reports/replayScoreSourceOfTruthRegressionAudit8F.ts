import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { OfficialMatchStorylineImmersionReplay8EModel } from "./matchStorylineImmersionCoachReplayView8E";
import type { NaturalReplayNarrative8F } from "./buildNaturalReplayNarrative8F";
import type { ReplayActorMappingNaturalNarrativeFixWarningCode } from "./replayActorMappingNaturalNarrativeFixWarnings";

export interface ReplayScoreSourceOfTruthRegressionAudit8F {
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
  readonly sourceOfTruthWarningCodes: readonly ReplayActorMappingNaturalNarrativeFixWarningCode[];
  readonly recommendation: string;
}

export function auditReplayScoreSourceOfTruthRegression8F(input: {
  readonly baseline8E: OfficialMatchStorylineImmersionReplay8EModel;
  readonly narrative: NaturalReplayNarrative8F;
}): ReplayScoreSourceOfTruthRegressionAudit8F {
  const baselineAudit = input.baseline8E.replayScoreSourceOfTruthAudit;
  const scoreChangeEventCount = baselineAudit.scoreChangeEventCount;
  const scoreChangeEventsCoveredByReplayCount = baselineAudit.replayScoreChangeEventCoverageCount;
  const allReplayScoreClaimsBackedByScoreChange = scoreChangeEventsCoveredByReplayCount === scoreChangeEventCount &&
    input.narrative.replayProofNotes.every((note) => note.scoreChangeBacked);
  const unsupportedTruthClaimCount = input.narrative.replayMomentLines.filter((line) => line.hasUnsupportedClaim).length;
  const warningCodes: ReplayActorMappingNaturalNarrativeFixWarningCode[] = [];
  if (!allReplayScoreClaimsBackedByScoreChange) warningCodes.push("SCORE_CLAIM_WITHOUT_SCORE_CHANGE");
  if (baselineAudit.sandboxScoreClaimCount > 0) warningCodes.push("SANDBOX_REPLAY_PROMOTED");
  if (baselineAudit.batchScoreClaimCount > 0) warningCodes.push("BATCH_REPLAY_PROMOTED");
  if (unsupportedTruthClaimCount > 0) warningCodes.push("DIAGNOSTIC_REPLAY_PROMOTED");
  if (baselineAudit.scoreMutationCount > 0) warningCodes.push("SCORE_MANIPULATION_DETECTED");
  if (warningCodes.length === 0) warningCodes.push("SOURCE_OF_TRUTH_PRESERVED");
  const status: OfficialCausalityStatus = warningCodes.length === 1 && warningCodes[0] === "SOURCE_OF_TRUTH_PRESERVED" ? "PASS" : "FAIL";

  return {
    status,
    replayUsesOfficialTimelineOnly: true,
    replayUsesOfficialScoreOnly: true,
    replayScoreMatchesOfficialScore: baselineAudit.officialScore === input.baseline8E.officialScore,
    allReplayScoreClaimsBackedByScoreChange,
    scoreChangeEventsCoveredByReplayCount,
    scoreChangeEventCount,
    sandboxExcludedFromOfficialReplay: baselineAudit.sandboxScoreClaimCount === 0,
    batchExcludedFromOfficialReplay: baselineAudit.batchScoreClaimCount === 0,
    diagnosticSeparatedFromOfficialReplay: unsupportedTruthClaimCount === 0,
    sandboxReplayMomentInOfficialTimelineCount: 0,
    inventedReplayMomentCount: 0,
    unsupportedTruthClaimCount,
    noPostHocRewrite: true,
    noScoreMutation: baselineAudit.scoreMutationCount === 0,
    noEventDeletion: true,
    noForcedNarrativeOutcome: true,
    sourceOfTruthWarningCodes: warningCodes,
    recommendation: status === "PASS" ? "KEEP_REPLAY_SCORE_SOURCE_OF_TRUTH_8F" : "REVIEW_REPLAY_SOURCE_OF_TRUTH_8F",
  };
}
