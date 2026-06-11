import type { FatigueReport, MatchEvent, MatchInput } from "../../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../../contracts/matchReportEvidence";
import type { ZoneId } from "../../core/zones";
import type { TacticalPlanInfluence } from "./tacticalPlanInfluence";
import { createMatchEvidenceFacts } from "./matchReportEvidence";

function firstEvidenceEvent(events: readonly MatchEvent[]): MatchEvent | undefined {
  return events.find((event) => event.eventType !== "kickoff") ?? events[0];
}

function topZones(events: readonly MatchEvent[], limit: number): readonly string[] {
  const counts = new Map<string, number>();

  for (const event of events) {
    counts.set(event.zone, (counts.get(event.zone) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([zone]) => zone);
}

function tacticalPlanFact(input: {
  readonly matchInput: MatchInput;
  readonly timeline: readonly MatchEvent[];
  readonly influence: TacticalPlanInfluence;
}): MatchReportEvidenceFact | null {
  const event = firstEvidenceEvent(input.timeline);

  if (event === undefined) {
    return null;
  }

  const affectedZones = input.influence.targetZoneBias.length > 0
    ? input.influence.targetZoneBias
    : ([event.zone] as readonly ZoneId[]);

  return {
    factId: `${input.matchInput.matchId}-tactical-plan-signal`,
    matchId: input.matchInput.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "TACTICAL_PLAN_SIGNAL",
    scope: "MATCH_REPORT",
    eventIds: [event.eventId],
    affectedZones,
    summary: `${input.influence.homeSummary} ${input.influence.awaySummary} ${input.influence.matchEffectSummary}`,
    confidence: "low",
    strength: 50,
    coachVisible: true,
    internalTags: ["tactical_plan_influence"],
  };
}

function fatigueLoadFact(input: {
  readonly matchInput: MatchInput;
  readonly timeline: readonly MatchEvent[];
  readonly fatigueReport: FatigueReport;
}): MatchReportEvidenceFact | null {
  const heaviestTeam = [...input.fatigueReport.teamSummaries].sort(
    (a, b) => b.highIntensityLoad - a.highIntensityLoad,
  )[0];

  if (heaviestTeam === undefined) {
    return null;
  }

  const teamEvents = input.timeline.filter((event) => event.teamId === heaviestTeam.teamId && event.eventType !== "kickoff");
  const event = firstEvidenceEvent(teamEvents);

  if (event === undefined) {
    return null;
  }

  return {
    factId: `${input.matchInput.matchId}-${heaviestTeam.teamId}-fatigue-load`,
    matchId: input.matchInput.matchId,
    teamId: heaviestTeam.teamId,
    opponentTeamId: heaviestTeam.teamId === input.matchInput.homeTeam.teamId
      ? input.matchInput.awayTeam.teamId
      : input.matchInput.homeTeam.teamId,
    category: "FATIGUE_LOAD",
    scope: "MATCH_REPORT",
    eventIds: [event.eventId],
    affectedZones: topZones(teamEvents, 3),
    summary: `${heaviestTeam.teamId.toUpperCase()} porte la charge physique la plus visible avec une intensité ${heaviestTeam.highIntensityLoad}/100 et une condition finale moyenne ${heaviestTeam.averageConditionEnd}/100.`,
    confidence: "medium",
    strength: heaviestTeam.highIntensityLoad,
    coachVisible: true,
    internalTags: ["fatigue_load", "full_match_fatigue_propagation"],
  };
}

function momentumShiftFact(input: {
  readonly matchInput: MatchInput;
  readonly timeline: readonly MatchEvent[];
}): MatchReportEvidenceFact | null {
  const momentumEvents = input.timeline.filter((event) =>
    event.tags.includes("momentum_positive") || event.tags.includes("momentum_negative") || event.tags.includes("score_state_lopsided"),
  );

  const event = firstEvidenceEvent(momentumEvents);

  if (event === undefined) {
    return null;
  }

  return {
    factId: `${input.matchInput.matchId}-momentum-shift`,
    matchId: input.matchInput.matchId,
    teamId: event.teamId,
    opponentTeamId: event.opponentTeamId,
    category: "MOMENTUM_SHIFT",
    scope: "MATCH_REPORT",
    eventIds: momentumEvents.slice(0, 6).map((candidate) => candidate.eventId),
    affectedZones: topZones(momentumEvents, 3),
    summary: `L'élan du match devient lisible autour de ${topZones(momentumEvents, 3).join(", ")} avec des signaux de score, pression ou momentum répétés.`,
    confidence: "low",
    strength: Math.min(100, 40 + momentumEvents.length * 8),
    coachVisible: true,
    internalTags: ["momentum_shift"],
  };
}

function segmentStateInfluenceFact(input: {
  readonly matchInput: MatchInput;
  readonly timeline: readonly MatchEvent[];
}): MatchReportEvidenceFact | null {
  const influenceEvents = input.timeline.filter((event) => event.tags.includes("segment_influence_active"));
  const event = firstEvidenceEvent(influenceEvents);

  if (event === undefined) {
    return null;
  }

  return {
    factId: `${input.matchInput.matchId}-segment-state-influence`,
    matchId: input.matchInput.matchId,
    teamId: event.teamId,
    opponentTeamId: event.opponentTeamId,
    category: "MOMENTUM_SHIFT",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: influenceEvents.slice(0, 6).map((candidate) => candidate.eventId),
    affectedZones: topZones(influenceEvents, 3),
    summary:
      "L'etat accumule du match commence a peser sur la stabilite, la pression et la fraicheur mentale des sequences suivantes, sans forcer directement le score.",
    confidence: "low",
    strength: Math.min(100, 35 + influenceEvents.length * 4),
    coachVisible: true,
    internalTags: [
      "segment_state_influence",
      "segment_influence_active",
      "bounded_full_match_segment_context",
    ],
  };
}

function tacticalGroundingGapFacts(input: {
  readonly matchInput: MatchInput;
  readonly timeline: readonly MatchEvent[];
}): readonly MatchReportEvidenceFact[] {
  const fullMatchEvents = input.timeline.filter((event) => event.eventId.includes("-segment-") && event.eventType !== "kickoff");
  const event = firstEvidenceEvent(fullMatchEvents);

  if (event === undefined) {
    return [];
  }

  const eventIds = fullMatchEvents.slice(0, 6).map((candidate) => candidate.eventId);
  const affectedZones = topZones(fullMatchEvents, 3);
  const summary =
    "Le mini-match dispose maintenant d'un chemin controle ou les candidats issus du SpatialContext peuvent etre classes par score ajuste d'attributs, avec fallback prototype si les garde-fous bloquent la selection.";

  return [
    {
      factId: `${input.matchInput.matchId}-workbench-truth-available`,
      matchId: input.matchInput.matchId,
      teamId: event.teamId,
      opponentTeamId: event.opponentTeamId,
      category: "TACTICAL_PLAN_SIGNAL",
      scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
      eventIds,
      affectedZones,
      summary,
      confidence: "low",
      strength: 58,
      coachVisible: true,
      internalTags: [
        "tactical_grounding_gap",
        "workbench_truth_fixture_available",
        "workbench_replay_seed",
        "route_attribute_influence",
        "candidate_modifier_mode",
        "attribute_selection_guard",
        "spatial_route_selection",
        "prototype_fallback",
        "controlled_minimatch_only",
      ],
    },
    {
      factId: `${input.matchInput.matchId}-spatial-context-adapter-available`,
      matchId: input.matchInput.matchId,
      teamId: event.teamId,
      opponentTeamId: event.opponentTeamId,
      category: "TACTICAL_PLAN_SIGNAL",
      scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
      eventIds,
      affectedZones,
      summary: "Sprint 2S adds a typed roster/workbench to SpatialMatchContext adapter that can preserve player identity, starter status, ball carrier, and workbench zones.",
      confidence: "low",
      strength: 60,
      coachVisible: false,
      internalTags: [
        "tactical_grounding_gap",
        "spatial_context_adapter_available",
        "spatial_context_active",
        "roster_to_spatial_context_adapter",
      ],
    },
    {
      factId: `${input.matchInput.matchId}-workbench-replay-seed-partial`,
      matchId: input.matchInput.matchId,
      teamId: event.teamId,
      opponentTeamId: event.opponentTeamId,
      category: "TACTICAL_PLAN_SIGNAL",
      scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
      eventIds,
      affectedZones,
      summary: "The sequence-1-action-1 replay seed can preserve TH, ML, the new carrier, and the before/after ball zones while evaluating metadata_only and candidate_modifier attribute selection. The guard preserves TH -> ML for this fixture.",
      confidence: "low",
      strength: 58,
      coachVisible: false,
      internalTags: [
        "tactical_grounding_gap",
        "workbench_replay_seed_partial",
        "attribute_adjusted_candidate_scores_available",
        "attribute_adjusted_score",
        "attribute_adjusted_selection",
        "replay_seed_attribute_selection_partial",
        "controlled_minimatch_spatial_selection_available",
      ],
    },
    {
      factId: `${input.matchInput.matchId}-route-attribute-influence-available`,
      matchId: input.matchInput.matchId,
      teamId: event.teamId,
      opponentTeamId: event.opponentTeamId,
      category: "TACTICAL_PLAN_SIGNAL",
      scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
      eventIds,
      affectedZones,
      summary: "Route attribute influence is available for pass security, reception quality, support timing, rupture threat, contact platform, fatigue drag, turnover risk, and final-action composure.",
      confidence: "low",
      strength: 65,
      coachVisible: false,
      internalTags: [
        "tactical_grounding_gap",
        "route_attribute_influence_available",
        "route_attribute_influence",
        "selected_route_attribute_explanation_available",
        "attribute_candidate_modifier_available",
        "attribute_guarded_candidate_modifier_available",
      ],
    },
    {
      factId: `${input.matchInput.matchId}-spatial-route-selection-path-available`,
      matchId: input.matchInput.matchId,
      teamId: event.teamId,
      opponentTeamId: event.opponentTeamId,
      category: "TACTICAL_PLAN_SIGNAL",
      scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
      eventIds,
      affectedZones,
      summary:
        "A controlled mini-match path can map SpatialContext route candidates, apply attribute-adjusted ranking, preserve legality, and fall back to prototype selection when guardrails block the spatial choice.",
      confidence: "low",
      strength: 63,
      coachVisible: false,
      internalTags: [
        "tactical_grounding_gap",
        "spatial_route_selection_path_available",
        "spatial_route_selection",
        "prototype_fallback_still_enabled",
        "prototype_fallback",
        "attribute_guard",
        "controlled_minimatch_only",
        "fullmatch_not_default_spatial_selection",
      ],
    },
    {
      factId: `${input.matchInput.matchId}-attribute-selection-guard-available`,
      matchId: input.matchInput.matchId,
      teamId: event.teamId,
      opponentTeamId: event.opponentTeamId,
      category: "TACTICAL_PLAN_SIGNAL",
      scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
      eventIds,
      affectedZones,
      summary: "The attribute selection guard can allow a legal adjusted candidate flip while blocking CLOSED lanes and NOT_AVAILABLE_NOW routes; normal full-match selection is still only partially attribute-driven.",
      confidence: "low",
      strength: 61,
      coachVisible: false,
      internalTags: [
        "tactical_grounding_gap",
        "attribute_selection_guard_available",
        "attribute_selection_flip_possible_when_legal",
        "closed_lane_not_overridden_by_attributes",
        "closed_lane_not_overridden",
        "prototype_selection_still_partial",
        "normal_fullmatch_selection_still_partial",
      ],
    },
    {
      factId: `${input.matchInput.matchId}-full-match-partial-workbench-grounding`,
      matchId: input.matchInput.matchId,
      teamId: event.teamId,
      opponentTeamId: event.opponentTeamId,
      category: "TACTICAL_PLAN_SIGNAL",
      scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
      eventIds,
      affectedZones,
      summary: "Full-match is partially workbench-grounded, but it is not yet replaying the workbench sequence chain as the source of every tactical decision.",
      confidence: "low",
      strength: 62,
      coachVisible: false,
      internalTags: [
        "tactical_grounding_gap",
        "full_match_partially_workbench_grounded",
        "fullmatch_not_yet_replaying_workbench_sequence_chain",
      ],
    },
  ];
}

export function buildCanonicalMatchReportEvidenceFacts(input: {
  readonly matchInput: MatchInput;
  readonly timeline: readonly MatchEvent[];
  readonly fatigueReport: FatigueReport;
  readonly influence: TacticalPlanInfluence;
}): readonly MatchReportEvidenceFact[] {
  const baseFacts = createMatchEvidenceFacts({
    matchInput: input.matchInput,
    timeline: input.timeline,
  });
  const supplementalFacts = [
    tacticalPlanFact(input),
    fatigueLoadFact(input),
    momentumShiftFact(input),
    segmentStateInfluenceFact(input),
  ].filter((fact): fact is MatchReportEvidenceFact => fact !== null);

  return [...baseFacts, ...supplementalFacts, ...tacticalGroundingGapFacts(input)];
}
