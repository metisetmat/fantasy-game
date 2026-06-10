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
    "Le moteur sait maintenant convertir une verite workbench en contexte spatial type, mais la resolution mini-match n'utilise encore que partiellement ces informations pour choisir ses actions.";

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
      internalTags: ["tactical_grounding_gap", "workbench_truth_fixture_available", "workbench_replay_seed"],
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
      summary: "The sequence-1-action-1 replay seed can preserve TH, ML, the new carrier, and the before/after ball zones, but normal route ranking still resolves through the prototype path.",
      confidence: "low",
      strength: 58,
      coachVisible: false,
      internalTags: ["tactical_grounding_gap", "workbench_replay_seed_partial"],
    },
    {
      factId: `${input.matchInput.matchId}-route-ranking-attribute-gap`,
      matchId: input.matchInput.matchId,
      teamId: event.teamId,
      opponentTeamId: event.opponentTeamId,
      category: "TACTICAL_PLAN_SIGNAL",
      scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
      eventIds,
      affectedZones,
      summary: "PlayerSnapshot roles and attributes are carried into the adapter layer, but they do not yet fully drive mini-match route ranking.",
      confidence: "low",
      strength: 65,
      coachVisible: false,
      internalTags: ["tactical_grounding_gap", "route_ranking_not_yet_attribute_driven", "route_ranking_attribute_gap"],
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
