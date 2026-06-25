import type { MatchEconomyFinalStabilizationWarningCode } from "./matchEconomyFinalStabilizationWarnings";

export interface FullMatchFinalGuardrailAuditInput {
  readonly scoreFromScoreChangeAllRuns: boolean;
  readonly officialPathConnectedAllRuns: boolean;
  readonly scoringConstantsChanged: boolean;
  readonly MatchBonusEventChanged: boolean;
  readonly scoreCapApplied: boolean;
  readonly postHocRewriteApplied: boolean;
  readonly scoringEventsDeleted: boolean;
  readonly forcedOpponentScoreApplied: boolean;
  readonly forcedTrailingTeamScoreApplied: boolean;
  readonly rubberBandingApplied: boolean;
  readonly comebackForced: boolean;
  readonly forcedComebackDetected: boolean;
  readonly actualForcedComebackDetectedCount: number;
  readonly leadingTeamScoreSuppressed: boolean;
  readonly trailingTeamOpportunityForced: boolean;
  readonly trailingTeamScoreChangeInjected: boolean;
  readonly trailingTeamScoringEventInjected: boolean;
  readonly unknownScoringFamilyCount: number;
  readonly penaltyShotActiveLeakageCount: number;
  readonly persistenceUsedForScoring: boolean;
  readonly sqliteUsedForScoring: boolean;
  readonly batchLiveSeparationPreserved: boolean;
}

export interface FullMatchFinalGuardrailAudit {
  readonly scoreFromScoreChangeAllRuns: boolean;
  readonly officialPathConnectedAllRuns: boolean;
  readonly scoringConstantsUnchanged: boolean;
  readonly MatchBonusEventUnchanged: boolean;
  readonly noScoreCap: boolean;
  readonly noRewrite: boolean;
  readonly noDeletion: boolean;
  readonly noForcedScore: boolean;
  readonly noForcedTrailingScore: boolean;
  readonly noRubberBanding: boolean;
  readonly noForcedComeback: boolean;
  readonly noActualForcedComeback: boolean;
  readonly noLeadingTeamScoreSuppression: boolean;
  readonly noTrailingOpportunityForcing: boolean;
  readonly noTrailingScoreChangeInjection: boolean;
  readonly noTrailingScoringEventInjection: boolean;
  readonly noUNKNOWN: boolean;
  readonly noPENALTY: boolean;
  readonly noPersistenceScoring: boolean;
  readonly noSQLiteScoring: boolean;
  readonly batchLiveSeparationPreserved: boolean;
  readonly guardrailsClean: boolean;
  readonly finalGuardrailWarningCodes: readonly MatchEconomyFinalStabilizationWarningCode[];
  readonly recommendation:
    | "KEEP_FINAL_SCORING_GUARDRAILS"
    | "REPAIR_FINAL_SCORING_GUARDRAILS";
}

export function auditFullMatchFinalGuardrails(input: FullMatchFinalGuardrailAuditInput): FullMatchFinalGuardrailAudit {
  const scoringConstantsUnchanged = !input.scoringConstantsChanged;
  const MatchBonusEventUnchanged = !input.MatchBonusEventChanged;
  const noScoreCap = !input.scoreCapApplied;
  const noRewrite = !input.postHocRewriteApplied;
  const noDeletion = !input.scoringEventsDeleted;
  const noForcedScore = !input.forcedOpponentScoreApplied;
  const noForcedTrailingScore = !input.forcedTrailingTeamScoreApplied;
  const noRubberBanding = !input.rubberBandingApplied;
  const noForcedComeback = !input.comebackForced && !input.forcedComebackDetected;
  const noActualForcedComeback = input.actualForcedComebackDetectedCount === 0;
  const noLeadingTeamScoreSuppression = !input.leadingTeamScoreSuppressed;
  const noTrailingOpportunityForcing = !input.trailingTeamOpportunityForced;
  const noTrailingScoreChangeInjection = !input.trailingTeamScoreChangeInjected;
  const noTrailingScoringEventInjection = !input.trailingTeamScoringEventInjected;
  const noUNKNOWN = input.unknownScoringFamilyCount === 0;
  const noPENALTY = input.penaltyShotActiveLeakageCount === 0;
  const noPersistenceScoring = !input.persistenceUsedForScoring;
  const noSQLiteScoring = !input.sqliteUsedForScoring;
  const guardrailsClean = input.scoreFromScoreChangeAllRuns &&
    input.officialPathConnectedAllRuns &&
    scoringConstantsUnchanged &&
    MatchBonusEventUnchanged &&
    noScoreCap &&
    noRewrite &&
    noDeletion &&
    noForcedScore &&
    noForcedTrailingScore &&
    noRubberBanding &&
    noForcedComeback &&
    noActualForcedComeback &&
    noLeadingTeamScoreSuppression &&
    noTrailingOpportunityForcing &&
    noTrailingScoreChangeInjection &&
    noTrailingScoringEventInjection &&
    noUNKNOWN &&
    noPENALTY &&
    noPersistenceScoring &&
    noSQLiteScoring &&
    input.batchLiveSeparationPreserved;
  const warnings: MatchEconomyFinalStabilizationWarningCode[] = [
    "FINAL_GUARDRAIL_AUDIT_COMPLETE",
    ...(guardrailsClean ? ["NO_SCORE_MANIPULATION_CONFIRMED" as const] : []),
    ...(noRubberBanding ? ["NO_RUBBER_BANDING_CONFIRMED" as const] : ["RUBBER_BANDING_DETECTED" as const]),
    ...(noForcedComeback ? ["NO_FORCED_COMEBACK_CONFIRMED" as const] : ["FORCED_COMEBACK_DETECTED" as const]),
    ...(noTrailingScoreChangeInjection ? ["NO_TRAILING_SCORE_INJECTION_CONFIRMED" as const] : ["FORCED_TRAILING_TEAM_SCORE_DETECTED" as const]),
    ...(noTrailingOpportunityForcing ? ["NO_TRAILING_OPPORTUNITY_FORCING_CONFIRMED" as const] : []),
    ...(noScoreCap ? [] : ["SCORE_CAP_DETECTED" as const]),
    ...(noRewrite ? [] : ["POST_HOC_REWRITE_DETECTED" as const]),
    ...(noDeletion ? [] : ["POST_HOC_REWRITE_DETECTED" as const]),
    ...(noForcedScore ? [] : ["FORCED_SCORE_DETECTED" as const]),
    ...(noForcedTrailingScore ? [] : ["FORCED_TRAILING_TEAM_SCORE_DETECTED" as const]),
    ...(noLeadingTeamScoreSuppression ? [] : ["LEADING_TEAM_SCORE_SUPPRESSION_DETECTED" as const]),
    ...(noTrailingScoringEventInjection ? [] : ["TRAILING_SCORING_EVENT_INJECTION_DETECTED" as const]),
    ...(noUNKNOWN ? [] : ["UNKNOWN_SCORING_FAMILY_DETECTED" as const]),
    ...(noPENALTY ? [] : ["PENALTY_SHOT_LEAKAGE_DETECTED" as const]),
  ];

  return {
    scoreFromScoreChangeAllRuns: input.scoreFromScoreChangeAllRuns,
    officialPathConnectedAllRuns: input.officialPathConnectedAllRuns,
    scoringConstantsUnchanged,
    MatchBonusEventUnchanged,
    noScoreCap,
    noRewrite,
    noDeletion,
    noForcedScore,
    noForcedTrailingScore,
    noRubberBanding,
    noForcedComeback,
    noActualForcedComeback,
    noLeadingTeamScoreSuppression,
    noTrailingOpportunityForcing,
    noTrailingScoreChangeInjection,
    noTrailingScoringEventInjection,
    noUNKNOWN,
    noPENALTY,
    noPersistenceScoring,
    noSQLiteScoring,
    batchLiveSeparationPreserved: input.batchLiveSeparationPreserved,
    guardrailsClean,
    finalGuardrailWarningCodes: warnings,
    recommendation: guardrailsClean ? "KEEP_FINAL_SCORING_GUARDRAILS" : "REPAIR_FINAL_SCORING_GUARDRAILS",
  };
}
