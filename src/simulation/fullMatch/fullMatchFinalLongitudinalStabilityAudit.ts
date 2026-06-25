import type { MatchEconomyFinalStabilizationWarningCode } from "./matchEconomyFinalStabilizationWarnings";

export interface FullMatchFinalLongitudinalWindow {
  readonly windowId: string;
  readonly matches: number;
  readonly averageTotalPoints: number;
  readonly scoringEventsPerMatch: number;
  readonly scoringOpportunitiesPerMatch: number;
  readonly averageScoreDifference: number;
  readonly closeGameRate: number;
  readonly competitiveGameRate: number;
  readonly blowoutRate: number;
  readonly severeBlowoutRate: number;
  readonly trailingTeamResponseRate: number;
  readonly trailingThreatQualityRate: number;
  readonly trailingTeamScoringShare: number;
  readonly lateGameAutomaticThreatRate: number;
  readonly forcedComebackSuspicionUnexplainedCount: number;
  readonly trailingScoringPathCompleteRate: number;
  readonly routeFamilyDiversityPreserved: boolean;
  readonly dominantTeamOpportunityChainMax: number;
  readonly calibrationCoverageStatus: "COMPLETE" | "PARTIAL";
  readonly guardrailsStatus: "PASS" | "WARNING";
}

export interface FullMatchFinalLongitudinalStabilityAudit {
  readonly windowCount: number;
  readonly minimumWindowCountMet: boolean;
  readonly matchCountLimitExplicit: boolean;
  readonly windows: readonly FullMatchFinalLongitudinalWindow[];
  readonly allWindowsGuardrailsPass: boolean;
  readonly allWindowsCalibrationCoverageComplete: boolean;
  readonly scoringVolumeStableAcrossWindows: boolean;
  readonly closeGameStableAcrossWindows: boolean;
  readonly competitiveGameStableAcrossWindows: boolean;
  readonly blowoutStableAcrossWindows: boolean;
  readonly trailingResponseStableAcrossWindows: boolean;
  readonly lateGameAutomaticityStableAcrossWindows: boolean;
  readonly longitudinalStabilityReady: boolean;
  readonly longitudinalWarningCodes: readonly MatchEconomyFinalStabilizationWarningCode[];
  readonly recommendation:
    | "KEEP_FINAL_LONGITUDINAL_BASELINE"
    | "MONITOR_FINAL_LONGITUDINAL_BASELINE"
    | "REPAIR_FINAL_LONGITUDINAL_BASELINE";
}

export function auditFullMatchFinalLongitudinalStability(windows: readonly FullMatchFinalLongitudinalWindow[]): FullMatchFinalLongitudinalStabilityAudit {
  const minimumWindowCountMet = windows.length >= 3;
  const allWindowsGuardrailsPass = windows.every((window) => window.guardrailsStatus === "PASS");
  const allWindowsCalibrationCoverageComplete = windows.every((window) => window.calibrationCoverageStatus === "COMPLETE");
  const scoringVolumeStableAcrossWindows = windows.every((window) =>
    window.averageTotalPoints >= 19 &&
    window.averageTotalPoints <= 26 &&
    window.scoringEventsPerMatch >= 5.5 &&
    window.scoringEventsPerMatch <= 9
  );
  const closeGameStableAcrossWindows = windows.every((window) => window.closeGameRate >= 40 && window.closeGameRate <= 70);
  const competitiveGameStableAcrossWindows = windows.every((window) => window.competitiveGameRate >= 50 && window.competitiveGameRate <= 95);
  const blowoutStableAcrossWindows = windows.every((window) => window.blowoutRate <= 30 && window.severeBlowoutRate <= 5);
  const trailingResponseStableAcrossWindows = windows.every((window) => window.trailingTeamResponseRate >= 35 && window.trailingTeamResponseRate <= 70);
  const lateGameAutomaticityStableAcrossWindows = windows.every((window) =>
    window.lateGameAutomaticThreatRate <= 10 &&
    window.forcedComebackSuspicionUnexplainedCount === 0
  );
  const longitudinalStabilityReady = minimumWindowCountMet &&
    allWindowsGuardrailsPass &&
    allWindowsCalibrationCoverageComplete &&
    scoringVolumeStableAcrossWindows &&
    closeGameStableAcrossWindows &&
    competitiveGameStableAcrossWindows &&
    blowoutStableAcrossWindows &&
    trailingResponseStableAcrossWindows &&
    lateGameAutomaticityStableAcrossWindows;
  const warnings: MatchEconomyFinalStabilizationWarningCode[] = [
    "FINAL_LONGITUDINAL_STABILITY_AUDIT_COMPLETE",
    ...(longitudinalStabilityReady ? [] : ["FULL_MATCH_BATCH_ECONOMY_PARTIAL" as const]),
  ];

  return {
    windowCount: windows.length,
    minimumWindowCountMet,
    matchCountLimitExplicit: true,
    windows,
    allWindowsGuardrailsPass,
    allWindowsCalibrationCoverageComplete,
    scoringVolumeStableAcrossWindows,
    closeGameStableAcrossWindows,
    competitiveGameStableAcrossWindows,
    blowoutStableAcrossWindows,
    trailingResponseStableAcrossWindows,
    lateGameAutomaticityStableAcrossWindows,
    longitudinalStabilityReady,
    longitudinalWarningCodes: warnings,
    recommendation: longitudinalStabilityReady
      ? "KEEP_FINAL_LONGITUDINAL_BASELINE"
      : allWindowsGuardrailsPass
        ? "MONITOR_FINAL_LONGITUDINAL_BASELINE"
        : "REPAIR_FINAL_LONGITUDINAL_BASELINE",
  };
}
