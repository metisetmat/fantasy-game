import type { MatchReport } from "../../contracts/engineToCoach";

export type FullMatchGroundingWarning =
  | "FULL_MATCH_NOT_WORKBENCH_GROUNDED"
  | "ROSTER_NOT_CONVERTED_TO_SPATIAL_CONTEXT"
  | "TACTICAL_PLAN_NOT_FULLY_DRIVING_RESOLUTION"
  | "PLAYER_IDENTITY_LOSS_IN_MINIMATCH"
  | "WORKBENCH_TRUTH_NOT_REPLAYED_IN_FULLMATCH"
  | "FULLMATCH_SCORE_NOT_TACTICALLY_EXPLAINED";

export type FullMatchGroundingDiagnostics = {
  readonly scope: "FULL_MATCH_HARNESS_SINGLE_RUN";
  readonly warnings: readonly FullMatchGroundingWarning[];
  readonly mayInvalidateGlobalScoringEconomy: false;
  readonly scoreUnchanged: true;
  readonly scoringEventsMutated: false;
  readonly summary: string;
  readonly recommendation: readonly string[];
};

export function analyzeFullMatchGroundingDiagnostics(report: MatchReport): FullMatchGroundingDiagnostics {
  const scoringEventCount = report.timeline.filter((event) => event.eventType === "scoring").length;
  const oneTeamScoringOnly = new Set(report.timeline.filter((event) => event.eventType === "scoring").map((event) => event.teamId)).size === 1 &&
    scoringEventCount > 0;
  const warnings: FullMatchGroundingWarning[] = [
    "FULL_MATCH_NOT_WORKBENCH_GROUNDED",
    "ROSTER_NOT_CONVERTED_TO_SPATIAL_CONTEXT",
    "TACTICAL_PLAN_NOT_FULLY_DRIVING_RESOLUTION",
    "PLAYER_IDENTITY_LOSS_IN_MINIMATCH",
    "WORKBENCH_TRUTH_NOT_REPLAYED_IN_FULLMATCH",
  ];

  if (oneTeamScoringOnly || Math.abs(report.score.home - report.score.away) >= 21) {
    warnings.push("FULLMATCH_SCORE_NOT_TACTICALLY_EXPLAINED");
  }

  return {
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    warnings,
    mayInvalidateGlobalScoringEconomy: false,
    scoreUnchanged: true,
    scoringEventsMutated: false,
    summary:
      "Full-match remains a deterministic harness: it has not yet replayed the typed workbench truth, official roster positions, or action-by-action visual decisions.",
    recommendation: [
      "CONFIRM_FULLMATCH_NOT_YET_WORKBENCH_GROUNDED",
      "KEEP_50_MATCH_ECONOMY_REFERENCE",
      "PREPARE_ROSTER_TO_SPATIAL_CONTEXT_ADAPTER",
      "PREPARE_WORKBENCH_REPLAY_ENGINE",
    ],
  };
}
