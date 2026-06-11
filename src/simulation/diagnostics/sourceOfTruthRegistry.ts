export type MatchEvidenceScope =
  | "MINI_MATCH_LOCAL"
  | "FULL_MATCH_HARNESS_SINGLE_RUN"
  | "FULL_MATCH_BATCH_ECONOMY"
  | "BATCH_DIAGNOSTIC_PROJECTION"
  | "LIVE_SCORING_STREAM"
  | "REPORT_RENDERING_ONLY"
  | "WORKBENCH_CHAIN_CONSUMPTION"
  | "WORKBENCH_CHAIN_SEGMENT_CONTEXT"
  | "WORKBENCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE";

export interface MatchEvidenceScopeDefinition {
  readonly scope: MatchEvidenceScope;
  readonly canProve: readonly string[];
  readonly canSuggest?: readonly string[];
  readonly cannotProve: readonly string[];
  readonly cannotOverride?: readonly string[];
  readonly cannotInclude?: readonly string[];
  readonly globalScoringEconomyVerdictAllowed: boolean;
}

export const MATCH_EVIDENCE_SCOPE_REGISTRY: Readonly<Record<MatchEvidenceScope, MatchEvidenceScopeDefinition>> = {
  MINI_MATCH_LOCAL: {
    scope: "MINI_MATCH_LOCAL",
    canProve: [
      "local sequence behavior",
      "local scoring trace",
      "event rendering",
      "tactical evidence for a short sample",
    ],
    cannotProve: [
      "full-match scoring economy",
      "0-0 rate",
      "average points",
      "long-match fatigue economy",
    ],
    globalScoringEconomyVerdictAllowed: false,
  },
  FULL_MATCH_HARNESS_SINGLE_RUN: {
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    canProve: [
      "report can handle match-like volume",
      "timeline remains chronological",
      "event IDs remain unique",
      "score consequences match final score",
      "report signals are readable or not",
    ],
    cannotProve: [
      "global scoring balance",
      "full-match economy incoherence",
      "meta-risk",
      "average scoring plausibility",
    ],
    globalScoringEconomyVerdictAllowed: false,
  },
  FULL_MATCH_BATCH_ECONOMY: {
    scope: "FULL_MATCH_BATCH_ECONOMY",
    canProve: [
      "global scoring plausibility",
      "average total points",
      "0-0 rate",
      "scoring event volume",
      "route mix",
      "score diversity",
      "meta-risk status",
    ],
    cannotProve: [],
    globalScoringEconomyVerdictAllowed: true,
  },
  BATCH_DIAGNOSTIC_PROJECTION: {
    scope: "BATCH_DIAGNOSTIC_PROJECTION",
    canProve: [],
    canSuggest: [
      "monitoring risks",
      "local calibration concerns",
      "route imbalance hypotheses",
    ],
    cannotProve: [
      "final live score",
      "canonical scoring constants",
    ],
    cannotOverride: [
      "live score",
      "full-match batch economy",
      "scoring constants",
    ],
    globalScoringEconomyVerdictAllowed: false,
  },
  LIVE_SCORING_STREAM: {
    scope: "LIVE_SCORING_STREAM",
    canProve: [
      "final live score",
      "active scoring events",
      "score consistency",
      "inactive scoring leakage",
    ],
    cannotProve: [
      "global scoring economy",
      "batch scoring plausibility",
    ],
    cannotInclude: [
      "MatchBonusEvent points",
      "batch projection points",
    ],
    globalScoringEconomyVerdictAllowed: false,
  },
  REPORT_RENDERING_ONLY: {
    scope: "REPORT_RENDERING_ONLY",
    canProve: [
      "HTML/Markdown rendering quality",
      "missing sections",
      "repetitive copy",
      "[object Object] bugs",
    ],
    cannotProve: [
      "engine scoring incoherence",
    ],
    globalScoringEconomyVerdictAllowed: false,
  },
  WORKBENCH_CHAIN_CONSUMPTION: {
    scope: "WORKBENCH_CHAIN_CONSUMPTION",
    canProve: [
      "experimental workbench chain was consumed behind an opt-in flag",
      "visual chain steps were replayed for diagnostic grounding",
      "chain consumption remained diagnostic-only",
    ],
    cannotProve: [
      "global scoring balance",
      "full-match economy coherence",
      "production chain-driven full-match behavior",
    ],
    cannotOverride: [
      "live score",
      "full-match batch economy",
      "scoring constants",
      "production route selection",
    ],
    globalScoringEconomyVerdictAllowed: false,
  },
  WORKBENCH_CHAIN_SEGMENT_CONTEXT: {
    scope: "WORKBENCH_CHAIN_SEGMENT_CONTEXT",
    canProve: [
      "experimental workbench chain context was attached to a segment",
      "diagnostic timeline tags were emitted",
      "chain final carrier and zone were exposed as metadata",
    ],
    cannotProve: [
      "global scoring balance",
      "full-match economy coherence",
      "production chain-driven full-match behavior",
    ],
    cannotOverride: [
      "live score",
      "full-match batch economy",
      "scoring constants",
    ],
    globalScoringEconomyVerdictAllowed: false,
  },
  WORKBENCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE: {
    scope: "WORKBENCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE",
    canProve: [
      "experimental chain context influenced diagnostic route candidate scores",
      "closed and unavailable route candidates remained blocked",
      "diagnostic selection changes were shadow-only",
    ],
    cannotProve: [
      "global scoring balance",
      "production route selection quality",
      "full-match economy coherence",
    ],
    cannotOverride: [
      "live score",
      "production route selection",
      "full-match batch economy",
      "scoring constants",
    ],
    globalScoringEconomyVerdictAllowed: false,
  },
} as const;
