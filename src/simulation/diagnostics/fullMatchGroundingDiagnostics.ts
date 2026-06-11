import type { MatchReport } from "../../contracts/engineToCoach";

export type FullMatchGroundingWarning =
  | "FULL_MATCH_PARTIALLY_WORKBENCH_GROUNDED"
  | "SPATIAL_CONTEXT_ADAPTER_AVAILABLE"
  | "WORKBENCH_REPLAY_SEED_AVAILABLE"
  | "TACTICAL_PLAN_NOT_FULLY_DRIVING_RESOLUTION"
  | "ROUTE_ATTRIBUTE_INFLUENCE_AVAILABLE"
  | "ROUTE_ATTRIBUTE_CANDIDATE_MODIFIER_AVAILABLE"
  | "ATTRIBUTE_SELECTION_GUARD_ACTIVE"
  | "ATTRIBUTE_SELECTION_NOT_FULLMATCH_AUTHORITATIVE"
  | "SPATIAL_ROUTE_SELECTION_PATH_AVAILABLE"
  | "CONTROLLED_MINIMATCH_SPATIAL_SELECTION_AVAILABLE"
  | "PROTOTYPE_FALLBACK_STILL_ENABLED"
  | "NORMAL_FULLMATCH_NOT_YET_SPATIAL_SELECTION_DRIVEN"
  | "PROTOTYPE_SELECTION_STILL_PARTIAL"
  | "FULLMATCH_NOT_YET_REPLAYING_WORKBENCH_SEQUENCE_CHAIN"
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
    "FULL_MATCH_PARTIALLY_WORKBENCH_GROUNDED",
    "SPATIAL_CONTEXT_ADAPTER_AVAILABLE",
    "WORKBENCH_REPLAY_SEED_AVAILABLE",
    "TACTICAL_PLAN_NOT_FULLY_DRIVING_RESOLUTION",
    "ROUTE_ATTRIBUTE_INFLUENCE_AVAILABLE",
    "ROUTE_ATTRIBUTE_CANDIDATE_MODIFIER_AVAILABLE",
    "ATTRIBUTE_SELECTION_GUARD_ACTIVE",
    "ATTRIBUTE_SELECTION_NOT_FULLMATCH_AUTHORITATIVE",
    "SPATIAL_ROUTE_SELECTION_PATH_AVAILABLE",
    "CONTROLLED_MINIMATCH_SPATIAL_SELECTION_AVAILABLE",
    "PROTOTYPE_FALLBACK_STILL_ENABLED",
    "NORMAL_FULLMATCH_NOT_YET_SPATIAL_SELECTION_DRIVEN",
    "PROTOTYPE_SELECTION_STILL_PARTIAL",
    "FULLMATCH_NOT_YET_REPLAYING_WORKBENCH_SEQUENCE_CHAIN",
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
      "Full-match is now partially grounded: roster/workbench truth can become typed spatial context and controlled mini-match runs can evaluate guarded spatial route selection, but normal full-match resolution still keeps prototype fallback and does not yet replay the full workbench sequence chain.",
    recommendation: [
      "CONFIRM_ROSTER_TO_SPATIAL_CONTEXT_ADAPTER",
      "CONFIRM_WORKBENCH_REPLAY_SEED",
      "CONFIRM_MINIMATCH_SPATIAL_CONTEXT_PARTIAL",
      "CONFIRM_ROUTE_ATTRIBUTE_INFLUENCE_LAYER",
      "CONFIRM_SELECTION_DRIVING_ATTRIBUTE_RANKING_V0",
      "CONFIRM_ATTRIBUTE_SELECTION_GUARD",
      "CONFIRM_SPATIAL_ROUTE_SELECTION_PATH",
      "CONFIRM_PROTOTYPE_FALLBACK_STILL_ENABLED",
      "CONFIRM_CONTROLLED_MINIMATCH_SPATIAL_SELECTION",
      "KEEP_50_MATCH_ECONOMY_REFERENCE",
      "PREPARE_NORMAL_FULLMATCH_SPATIAL_SELECTION_FLAG",
      "PREPARE_FULLMATCH_WORKBENCH_CHAIN_REPLAY",
    ],
  };
}
