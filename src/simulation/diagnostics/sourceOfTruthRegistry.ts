export type MatchEvidenceScope =
  | "MINI_MATCH_LOCAL"
  | "FULL_MATCH_HARNESS_SINGLE_RUN"
  | "FULL_MATCH_BATCH_ECONOMY"
  | "BATCH_DIAGNOSTIC_PROJECTION"
  | "LIVE_SCORING_STREAM"
  | "REPORT_RENDERING_ONLY"
  | "WORKBENCH_CHAIN_CONSUMPTION"
  | "WORKBENCH_CHAIN_SEGMENT_CONTEXT"
  | "WORKBENCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE"
  | "WORKBENCH_CHAIN_SHADOW_ROUTE_SELECTION"
  | "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_SELECTION"
  | "WORKBENCH_CHAIN_SEGMENT_ROUTE_INPUT"
  | "WORKBENCH_CHAIN_CONTROLLED_MINIMATCH_ROUTE_SOURCE"
  | "WORKBENCH_CHAIN_LIVE_SELECTION_OVERRIDE_GUARD"
  | "WORKBENCH_CHAIN_ISOLATED_MINIMATCH_OVERRIDE_EXPERIMENT"
  | "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_REPLAY_COMPARISON"
  | "WORKBENCH_CHAIN_REAL_ISOLATED_SEGMENT_REPLAY"
  | "WORKBENCH_CHAIN_CONTROLLED_ROUTE_RESOLUTION_SANDBOX"
  | "WORKBENCH_CHAIN_SANDBOX_SCORING_OPPORTUNITY_MODEL"
  | "WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_CANDIDATE"
  | "WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_RESOLUTION"
  | "WORKBENCH_CHAIN_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION_SANDBOX"
  | "WORKBENCH_CHAIN_GOALKEEPER_RESPONSE_MODEL_SANDBOX"
  | "WORKBENCH_CHAIN_REBOUND_SECOND_CHANCE_SANDBOX"
  | "WORKBENCH_CHAIN_MULTI_ACTION_CONTINUATION_SANDBOX";

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
  WORKBENCH_CHAIN_SHADOW_ROUTE_SELECTION: {
    scope: "WORKBENCH_CHAIN_SHADOW_ROUTE_SELECTION",
    canProve: [
      "experimental chain context produced a diagnostic shadow route selection",
      "shadow selection rejected closed and unavailable candidates",
      "shadow selection comparison remained production-forbidden",
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
  WORKBENCH_CHAIN_CONTROLLED_SEGMENT_SELECTION: {
    scope: "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_SELECTION",
    canProve: [
      "experimental shadow route selection was exposed as controlled segment metadata",
      "controlled selection rejected closed and unavailable candidates",
      "controlled selection remained diagnostic-only",
    ],
    cannotProve: [
      "global scoring balance",
      "production route selection quality",
      "full-match economy coherence",
      "production chain-driven full-match behavior",
    ],
    cannotOverride: [
      "live score",
      "production route selection",
      "full-match batch economy",
      "scoring constants",
    ],
    globalScoringEconomyVerdictAllowed: false,
  },
  WORKBENCH_CHAIN_SEGMENT_ROUTE_INPUT: {
    scope: "WORKBENCH_CHAIN_SEGMENT_ROUTE_INPUT",
    canProve: [
      "experimental controlled segment selection was converted into typed segment route input metadata",
      "segment route input rejected closed and unavailable candidates",
      "segment route input remained diagnostic-only",
    ],
    cannotProve: [
      "global scoring balance",
      "production route resolution quality",
      "production route selection quality",
      "full-match economy coherence",
      "production chain-driven full-match behavior",
    ],
    cannotOverride: [
      "live score",
      "production route resolution",
      "production route selection",
      "full-match batch economy",
      "scoring constants",
    ],
    globalScoringEconomyVerdictAllowed: false,
  },
  WORKBENCH_CHAIN_CONTROLLED_MINIMATCH_ROUTE_SOURCE: {
    scope: "WORKBENCH_CHAIN_CONTROLLED_MINIMATCH_ROUTE_SOURCE",
    canProve: [
      "experimental segment route input was exposed as a controlled mini-match route source",
      "controlled mini-match route source rejected closed and unavailable candidates",
      "controlled mini-match route source remained diagnostic-only",
    ],
    cannotProve: [
      "global scoring balance",
      "production route resolution quality",
      "live mini-match route resolution quality",
      "production route selection quality",
      "full-match economy coherence",
      "production chain-driven full-match behavior",
    ],
    cannotOverride: [
      "live score",
      "live mini-match route resolution",
      "production route resolution",
      "production route selection",
      "full-match batch economy",
      "scoring constants",
    ],
    globalScoringEconomyVerdictAllowed: false,
  },
  WORKBENCH_CHAIN_LIVE_SELECTION_OVERRIDE_GUARD: {
    scope: "WORKBENCH_CHAIN_LIVE_SELECTION_OVERRIDE_GUARD",
    canProve: [
      "experimental controlled mini-match route source prepared a guarded live selection override candidate",
      "live selection override guard rejected closed and unavailable candidates",
      "live selection override guard remained diagnostic-only and unapplied",
    ],
    cannotProve: [
      "global scoring balance",
      "production route resolution quality",
      "normal live mini-match route resolution quality",
      "production route selection quality",
      "full-match economy coherence",
      "production chain-driven full-match behavior",
    ],
    cannotOverride: [
      "live score",
      "normal live mini-match route resolution",
      "production route resolution",
      "production route selection",
      "full-match batch economy",
      "scoring constants",
    ],
    globalScoringEconomyVerdictAllowed: false,
  },
  WORKBENCH_CHAIN_ISOLATED_MINIMATCH_OVERRIDE_EXPERIMENT: {
    scope: "WORKBENCH_CHAIN_ISOLATED_MINIMATCH_OVERRIDE_EXPERIMENT",
    canProve: [
      "experimental live selection override was applied inside an isolated mini-match comparison",
      "isolated override experiment compared baseline and override selections",
      "isolated override experiment rejected closed and unavailable candidates",
      "isolated override experiment remained separated from normal live selection and official scoring",
    ],
    cannotProve: [
      "global scoring balance",
      "production route resolution quality",
      "normal live mini-match route resolution quality",
      "production route selection quality",
      "full-match economy coherence",
      "production chain-driven full-match behavior",
    ],
    cannotOverride: [
      "live score",
      "normal live mini-match route resolution",
      "official scoring events",
      "production route resolution",
      "production route selection",
      "full-match batch economy",
      "scoring constants",
    ],
    globalScoringEconomyVerdictAllowed: false,
  },
  WORKBENCH_CHAIN_CONTROLLED_SEGMENT_REPLAY_COMPARISON: {
    scope: "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_REPLAY_COMPARISON",
    canProve: [
      "experimental baseline and override segment replay paths were compared in isolation",
      "controlled replay comparison observed selection, progression, and danger divergence",
      "controlled replay comparison rejected closed and unavailable candidates",
      "controlled replay comparison remained separated from normal live selection and official scoring",
    ],
    cannotProve: [
      "global scoring balance",
      "production route resolution quality",
      "normal live mini-match route resolution quality",
      "production route selection quality",
      "full-match economy coherence",
      "production chain-driven full-match behavior",
    ],
    cannotOverride: [
      "live score",
      "normal live mini-match route resolution",
      "official scoring events",
      "production route resolution",
      "production route selection",
      "full-match batch economy",
      "scoring constants",
    ],
    globalScoringEconomyVerdictAllowed: false,
  },
  WORKBENCH_CHAIN_REAL_ISOLATED_SEGMENT_REPLAY: {
    scope: "WORKBENCH_CHAIN_REAL_ISOLATED_SEGMENT_REPLAY",
    canProve: [
      "experimental baseline and override segment replay paths generated isolated replay events",
      "isolated replay events are experimental-only and not official MatchEvents",
      "real isolated replay observed selection, carrier, progression, and danger divergence",
      "real isolated replay rejected closed and unavailable candidates",
      "real isolated replay remained separated from official timeline, normal live selection, and official scoring",
    ],
    cannotProve: [
      "global scoring balance",
      "production route resolution quality",
      "normal live mini-match route resolution quality",
      "production route selection quality",
      "full-match economy coherence",
      "production chain-driven full-match behavior",
    ],
    cannotOverride: [
      "live score",
      "official timeline",
      "normal live mini-match route resolution",
      "official scoring events",
      "production route resolution",
      "production route selection",
      "full-match batch economy",
      "scoring constants",
    ],
    globalScoringEconomyVerdictAllowed: false,
  },
  WORKBENCH_CHAIN_CONTROLLED_ROUTE_RESOLUTION_SANDBOX: {
    scope: "WORKBENCH_CHAIN_CONTROLLED_ROUTE_RESOLUTION_SANDBOX",
    canProve: [
      "experimental baseline and override routes were resolved inside an isolated sandbox",
      "sandbox route outcomes exposed pressure, reception, risk, danger, and scoring-opportunity probabilities",
      "sandbox resolution rejected closed and unavailable candidates",
      "sandbox resolution remained separated from official timeline, normal live selection, official scoring, production route resolution, and global route success rates",
    ],
    cannotProve: [
      "global scoring balance",
      "production route resolution quality",
      "normal live mini-match route resolution quality",
      "production route selection quality",
      "full-match economy coherence",
      "production chain-driven full-match behavior",
    ],
    cannotOverride: [
      "live score",
      "official timeline",
      "normal live mini-match route resolution",
      "official scoring events",
      "production route resolution",
      "production route selection",
      "full-match batch economy",
      "scoring constants",
    ],
    globalScoringEconomyVerdictAllowed: false,
  },
  WORKBENCH_CHAIN_SANDBOX_SCORING_OPPORTUNITY_MODEL: {
    scope: "WORKBENCH_CHAIN_SANDBOX_SCORING_OPPORTUNITY_MODEL",
    canProve: [
      "experimental sandbox route metrics were classified into typed scoring-opportunity signals",
      "baseline and override opportunity type, family, probability, and creation divergence were exposed",
      "sandbox opportunity classification rejected closed and unavailable candidates through the route-resolution sandbox",
      "sandbox opportunity classification remained separated from official timeline, normal live selection, official scoring, production route resolution, and global route success rates",
    ],
    cannotProve: [
      "global scoring balance",
      "production scoring opportunity quality",
      "production route resolution quality",
      "normal live mini-match route resolution quality",
      "full-match economy coherence",
      "production chain-driven full-match behavior",
    ],
    cannotOverride: [
      "live score",
      "official timeline",
      "normal live mini-match route resolution",
      "official scoring events",
      "production route resolution",
      "production route selection",
      "full-match batch economy",
      "scoring constants",
    ],
    globalScoringEconomyVerdictAllowed: false,
  },
  WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_CANDIDATE: {
    scope: "WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_CANDIDATE",
    canProve: [
      "experimental sandbox scoring opportunities were converted into typed scoring-event candidates",
      "baseline and override candidate type, family, probability, conversion probability, and creation divergence were exposed",
      "sandbox scoring-event candidates rejected closed and unavailable candidates through upstream sandbox guards",
      "sandbox scoring-event candidates remained separated from official timeline, normal live selection, official scoring, production route resolution, and global route success rates",
    ],
    cannotProve: [
      "global scoring balance",
      "production scoring-event quality",
      "production route resolution quality",
      "normal live mini-match route resolution quality",
      "full-match economy coherence",
      "production chain-driven full-match behavior",
    ],
    cannotOverride: [
      "live score",
      "official timeline",
      "normal live mini-match route resolution",
      "official scoring events",
      "production route resolution",
      "production route selection",
      "full-match batch economy",
      "scoring constants",
    ],
    globalScoringEconomyVerdictAllowed: false,
  },
  WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_RESOLUTION: {
    scope: "WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_RESOLUTION",
    canProve: [
      "experimental sandbox scoring-event candidates were resolved into sandbox-only tactical scoring outcomes",
      "baseline and override resolution type, shot attempt creation, shot quality, goalkeeper response, and divergence were exposed",
      "sandbox scoring-event resolution rejected closed and unavailable candidates through upstream sandbox guards",
      "sandbox scoring-event resolution remained separated from official timeline, normal live selection, official scoring, production route resolution, and global route success rates",
    ],
    cannotProve: [
      "global scoring balance",
      "production scoring-event resolution quality",
      "production route resolution quality",
      "normal live mini-match route resolution quality",
      "full-match economy coherence",
      "production chain-driven full-match behavior",
    ],
    cannotOverride: [
      "live score",
      "official timeline",
      "normal live mini-match route resolution",
      "official scoring events",
      "production route resolution",
      "production route selection",
      "full-match batch economy",
      "scoring constants",
    ],
    globalScoringEconomyVerdictAllowed: false,
  },
  WORKBENCH_CHAIN_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION_SANDBOX: {
    scope: "WORKBENCH_CHAIN_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION_SANDBOX",
    canProve: [
      "experimental sandbox shot resolution used shooter, reception, pressure, target-zone, fatigue, mental freshness, and goalkeeper attributes",
      "baseline and override attribute-driven shot outcome, shot quality, goalkeeper response quality, and divergence were exposed",
      "attribute-driven sandbox shot resolution rejected closed and unavailable candidates through upstream sandbox guards",
      "attribute-driven sandbox shot resolution remained separated from official timeline, normal live selection, official scoring, production route resolution, and global route success rates",
    ],
    cannotProve: [
      "global scoring balance",
      "production scoring-event resolution quality",
      "production goalkeeper model quality",
      "production route resolution quality",
      "normal live mini-match route resolution quality",
      "full-match economy coherence",
      "production chain-driven full-match behavior",
    ],
    cannotOverride: [
      "live score",
      "official timeline",
      "normal live mini-match route resolution",
      "official scoring events",
      "production route resolution",
      "production route selection",
      "full-match batch economy",
      "scoring constants",
    ],
    globalScoringEconomyVerdictAllowed: false,
  },
  WORKBENCH_CHAIN_GOALKEEPER_RESPONSE_MODEL_SANDBOX: {
    scope: "WORKBENCH_CHAIN_GOALKEEPER_RESPONSE_MODEL_SANDBOX",
    canProve: [
      "experimental goalkeeper response model used positioning, trajectory reading, reaction, handling, rebound control, concentration, mental fatigue, shot quality, and pressure context",
      "baseline and override goalkeeper response type, rebound state, save margin, and divergence were exposed",
      "goalkeeper response model consumed the attribute-driven shot resolution sandbox output",
      "goalkeeper response model remained separated from official timeline, normal live selection, official scoring, production route resolution, and global route success rates",
    ],
    cannotProve: [
      "global scoring balance",
      "production goalkeeper model quality",
      "production shot outcome quality",
      "production route resolution quality",
      "normal live mini-match route resolution quality",
      "full-match economy coherence",
      "production chain-driven full-match behavior",
    ],
    cannotOverride: [
      "live score",
      "official timeline",
      "normal live mini-match route resolution",
      "official scoring events",
      "production route resolution",
      "production route selection",
      "full-match batch economy",
      "scoring constants",
    ],
    globalScoringEconomyVerdictAllowed: false,
  },
  WORKBENCH_CHAIN_REBOUND_SECOND_CHANCE_SANDBOX: {
    scope: "WORKBENCH_CHAIN_REBOUND_SECOND_CHANCE_SANDBOX",
    canProve: [
      "experimental rebound and second-chance sandbox consumed the goalkeeper response model output",
      "baseline and override rebound outcome, loose-ball state, recovery candidate, second-chance probability, and divergence were exposed",
      "current sandbox rebound result remained separated from official timeline, official possession, official scoring, production route resolution, and global route success rates",
    ],
    cannotProve: [
      "global scoring balance",
      "production rebound model quality",
      "production second-chance conversion quality",
      "production route resolution quality",
      "normal live mini-match route resolution quality",
      "full-match economy coherence",
      "production chain-driven full-match behavior",
    ],
    cannotOverride: [
      "live score",
      "official timeline",
      "official possession",
      "normal live mini-match route resolution",
      "official scoring events",
      "production route resolution",
      "production route selection",
      "full-match batch economy",
      "scoring constants",
    ],
    globalScoringEconomyVerdictAllowed: false,
  },
  WORKBENCH_CHAIN_MULTI_ACTION_CONTINUATION_SANDBOX: {
    scope: "WORKBENCH_CHAIN_MULTI_ACTION_CONTINUATION_SANDBOX",
    canProve: [
      "experimental multi-action continuation sandbox consumed the rebound second chance sandbox output",
      "baseline and override continuation action, outcome, team, actor, target zone, possession security, pressure, transition risk, confidence, and divergence were exposed",
      "current continuation result remained separated from official timeline, official possession, official scoring, production route resolution, and global route success rates",
    ],
    cannotProve: [
      "global scoring balance",
      "production continuation model quality",
      "production second-action selection quality",
      "production route resolution quality",
      "normal live mini-match route resolution quality",
      "full-match economy coherence",
      "production chain-driven full-match behavior",
    ],
    cannotOverride: [
      "live score",
      "official timeline",
      "official possession",
      "normal live mini-match route resolution",
      "official scoring events",
      "production route resolution",
      "production route selection",
      "full-match batch economy",
      "scoring constants",
    ],
    globalScoringEconomyVerdictAllowed: false,
  },
} as const;
