import type {
  CoachInsight,
  MatchEvent,
  MatchEventType,
  MatchInput,
  TacticalDiagnosis,
} from "../../contracts/engineToCoach";
import type { MatchReportEvidenceCategory, MatchReportEvidenceFact } from "../../contracts/matchReportEvidence";
import type { TeamId } from "../../core/ids";
import type { Rating } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";
import { normalizeCoachFacingCopy } from "../../reports/coachCopyQuality";

export type MatchEvidenceCategory = MatchReportEvidenceCategory;
export type MatchEvidenceFact = MatchReportEvidenceFact;

interface TeamPerspective {
  readonly teamId: TeamId;
  readonly opponentTeamId: TeamId;
  readonly teamName: string;
}

function clampRating(value: number): Rating {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function hasTag(event: MatchEvent, tag: string): boolean {
  return event.tags.includes(tag);
}

function uniqueZones(events: readonly MatchEvent[]): readonly ZoneId[] {
  return [...new Set(events.map((event) => event.zone))];
}

function representativeZone(events: readonly MatchEvent[], fallbackZone: ZoneId): ZoneId {
  const zoneCounts = new Map<ZoneId, number>();

  for (const event of events) {
    zoneCounts.set(event.zone, (zoneCounts.get(event.zone) ?? 0) + 1);
  }

  let selectedZone = fallbackZone;
  let selectedCount = 0;

  for (const [zone, count] of zoneCounts) {
    if (count > selectedCount) {
      selectedZone = zone;
      selectedCount = count;
    }
  }

  return selectedZone;
}

function primaryFactZone(fact: MatchEvidenceFact): ZoneId {
  return (fact.affectedZones[0] ?? "Z3-C") as ZoneId;
}

function normalizeFactCopy(fact: MatchEvidenceFact): MatchEvidenceFact {
  return {
    ...fact,
    summary: normalizeCoachFacingCopy(fact.summary),
  };
}

function teamPerspectives(input: MatchInput): readonly TeamPerspective[] {
  return [
    {
      teamId: input.homeTeam.teamId,
      opponentTeamId: input.awayTeam.teamId,
      teamName: input.homeTeam.name,
    },
    {
      teamId: input.awayTeam.teamId,
      opponentTeamId: input.homeTeam.teamId,
      teamName: input.awayTeam.name,
    },
  ];
}

function highDangerFact(input: {
  readonly matchInput: MatchInput;
  readonly perspective: TeamPerspective;
  readonly events: readonly MatchEvent[];
}): MatchEvidenceFact | null {
  const highDangerEvents = input.events.filter(
    (event) =>
      event.teamId === input.perspective.teamId &&
      event.eventType === "progression" &&
      hasTag(event, "danger_high"),
  );

  if (highDangerEvents.length === 0) {
    return null;
  }

  const firstHighDangerEvent = highDangerEvents[0];
  if (firstHighDangerEvent === undefined) {
    return null;
  }

  const zones = uniqueZones(highDangerEvents);

  return {
    factId: `${input.matchInput.matchId}-${input.perspective.teamId}-high-danger`,
    matchId: input.matchInput.matchId,
    teamId: input.perspective.teamId,
    opponentTeamId: input.perspective.opponentTeamId,
    eventIds: highDangerEvents.map((event) => event.eventId),
    affectedZones: [representativeZone(highDangerEvents, firstHighDangerEvent.zone)],
    category: "DANGER_CREATION",
    scope: "MATCH_REPORT",
    summary: `${input.perspective.teamName} a crÃ©Ã© ${highDangerEvents.length} sÃ©quence${highDangerEvents.length === 1 ? "" : "s"} dangereuse${highDangerEvents.length === 1 ? "" : "s"} visible${highDangerEvents.length === 1 ? "" : "s"} dans les donnÃ©es de simulation actuelles en ${zones.join(", ")}.`,
    strength: clampRating(45 + highDangerEvents.length * 15),
    confidence: "medium",
    coachVisible: true,
    internalTags: ["high_danger_sequences"],
  };
}

function unstablePressureFact(input: {
  readonly matchInput: MatchInput;
  readonly perspective: TeamPerspective;
  readonly events: readonly MatchEvent[];
}): MatchEvidenceFact | null {
  const unstableEvents = input.events.filter(
    (event) =>
      event.teamId === input.perspective.teamId &&
      hasTag(event, "stability_low") &&
      (hasTag(event, "pressure_high") || hasTag(event, "pressure_medium")),
  );

  if (unstableEvents.length === 0) {
    return null;
  }

  const firstUnstableEvent = unstableEvents[0];
  if (firstUnstableEvent === undefined) {
    return null;
  }

  const zones = uniqueZones(unstableEvents);

  return {
    factId: `${input.matchInput.matchId}-${input.perspective.teamId}-unstable-pressure`,
    matchId: input.matchInput.matchId,
    teamId: input.perspective.teamId,
    opponentTeamId: input.perspective.opponentTeamId,
    eventIds: unstableEvents.map((event) => event.eventId),
    affectedZones: [representativeZone(unstableEvents, firstUnstableEvent.zone)],
    category: "POSSESSION_INSTABILITY",
    scope: "MATCH_REPORT",
    summary: `${input.perspective.teamName} a connu ${unstableEvents.length} sÃ©quence${unstableEvents.length === 1 ? "" : "s"} de possession instable sous pression visible en ${zones.join(", ")}.`,
    strength: clampRating(40 + unstableEvents.length * 12),
    confidence: "medium",
    coachVisible: true,
    internalTags: ["unstable_under_pressure"],
  };
}

function scoringFact(input: {
  readonly matchInput: MatchInput;
  readonly perspective: TeamPerspective;
  readonly events: readonly MatchEvent[];
}): MatchEvidenceFact | null {
  const scoringEvents = input.events.filter(
    (event) => event.teamId === input.perspective.teamId && event.eventType === "scoring",
  );

  if (scoringEvents.length === 0) {
    return null;
  }

  const firstScoringEvent = scoringEvents[0];
  if (firstScoringEvent === undefined) {
    return null;
  }

  return {
    factId: `${input.matchInput.matchId}-${input.perspective.teamId}-converted-scoring`,
    matchId: input.matchInput.matchId,
    teamId: input.perspective.teamId,
    opponentTeamId: input.perspective.opponentTeamId,
    eventIds: scoringEvents.map((event) => event.eventId),
    affectedZones: [representativeZone(scoringEvents, firstScoringEvent.zone)],
    category: "SCORING_CONVERSION",
    scope: "LIVE_SCORING_STREAM",
    summary: `${input.perspective.teamName} a converti ${scoringEvents.length} action${scoringEvents.length === 1 ? "" : "s"} dÃ©cisive${scoringEvents.length === 1 ? "" : "s"} identifiÃ©e${scoringEvents.length === 1 ? "" : "s"} dans les sÃ©quences de score.`,
    strength: clampRating(55 + scoringEvents.length * 15),
    confidence: "medium",
    coachVisible: true,
    internalTags: ["converted_scoring"],
  };
}

function visiblePressureZoneFact(input: {
  readonly matchInput: MatchInput;
  readonly perspective: TeamPerspective;
  readonly events: readonly MatchEvent[];
}): MatchEvidenceFact | null {
  const pressureEvents = input.events.filter(
    (event) =>
      event.teamId === input.perspective.teamId &&
      event.eventType !== "kickoff" &&
      (hasTag(event, "pressure_high") || hasTag(event, "territorial_pressure_high")),
  );

  if (pressureEvents.length === 0) {
    return null;
  }

  const firstPressureEvent = pressureEvents[0];
  if (firstPressureEvent === undefined) {
    return null;
  }

  const zone = representativeZone(pressureEvents, firstPressureEvent.zone);
  const zoneEventIds = pressureEvents
    .filter((event) => event.zone === zone)
    .map((event) => event.eventId);

  return {
    factId: `${input.matchInput.matchId}-${input.perspective.teamId}-pressure-zone`,
    matchId: input.matchInput.matchId,
    teamId: input.perspective.teamId,
    opponentTeamId: input.perspective.opponentTeamId,
    eventIds: zoneEventIds,
    affectedZones: [zone],
    category: "TERRITORIAL_PRESSURE",
    scope: "MATCH_REPORT",
    summary: `La pression la plus visible pour ${input.perspective.teamName} s'est concentrÃ©e en ${zone}.`,
    strength: clampRating(35 + zoneEventIds.length * 15),
    confidence: "low",
    coachVisible: true,
    internalTags: ["visible_pressure_zone"],
  };
}

function scorePoints(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((total, consequence) => total + (consequence.value ?? 0), 0);
}

function dominatedTeamNoPayoffFact(input: {
  readonly matchInput: MatchInput;
  readonly perspective: TeamPerspective;
  readonly events: readonly MatchEvent[];
}): MatchEvidenceFact | null {
  const ownScoringEvents = input.events.filter((event) => event.teamId === input.perspective.teamId && scorePoints(event) > 0);
  const opponentPoints = input.events
    .filter((event) => event.teamId === input.perspective.opponentTeamId)
    .reduce((total, event) => total + scorePoints(event), 0);
  const signalEvents = input.events.filter(
    (event) =>
      event.teamId === input.perspective.teamId &&
      event.eventType !== "kickoff" &&
      (
        event.eventType === "progression" ||
        hasTag(event, "danger_high") ||
        hasTag(event, "pressure_high") ||
        hasTag(event, "pressure_medium") ||
        hasTag(event, "territorial_pressure_high") ||
        hasTag(event, "stability_low")
      ),
  );

  if (ownScoringEvents.length > 0 || opponentPoints < 21 || signalEvents.length === 0) {
    return null;
  }

  const firstSignalEvent = signalEvents[0];
  if (firstSignalEvent === undefined) {
    return null;
  }

  const zones = uniqueZones(signalEvents);

  return {
    factId: `${input.matchInput.matchId}-${input.perspective.teamId}-dominated-no-payoff`,
    matchId: input.matchInput.matchId,
    teamId: input.perspective.teamId,
    opponentTeamId: input.perspective.opponentTeamId,
    eventIds: signalEvents.map((event) => event.eventId),
    affectedZones: [representativeZone(signalEvents, firstSignalEvent.zone)],
    category: "PRESSURE_WITHOUT_CONVERSION",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    summary: `${input.perspective.teamName} apparaÃ®t dans plusieurs sÃ©quences de pression, de progression ou d'instabilitÃ©, mais aucune ne devient un Ã©vÃ©nement de score dans ce run de harnais. La question utile est de savoir si ${input.perspective.teamName} manque de soutien dans le dernier geste, choisit une route trop risquÃ©e aprÃ¨s pression, ou si le harnais rÃ©pÃ¨te une route non convertissante. Zones visibles : ${zones.join(", ")}.`,
    strength: clampRating(45 + signalEvents.length * 8),
    confidence: "low",
    coachVisible: true,
    internalTags: ["dominated_team_no_payoff"],
  };
}

export function createMatchEvidenceFacts(input: {
  readonly matchInput: MatchInput;
  readonly timeline: readonly MatchEvent[];
}): readonly MatchEvidenceFact[] {
  const facts: MatchEvidenceFact[] = [];

  for (const perspective of teamPerspectives(input.matchInput)) {
    const factInputs = {
      matchInput: input.matchInput,
      perspective,
      events: input.timeline,
    };
    const candidateFacts = [
      highDangerFact(factInputs),
      unstablePressureFact(factInputs),
      scoringFact(factInputs),
      visiblePressureZoneFact(factInputs),
      dominatedTeamNoPayoffFact(factInputs),
    ];

    for (const fact of candidateFacts) {
      if (fact !== null) {
        facts.push(normalizeFactCopy(fact));
      }
    }
  }

  return facts;
}

function insightTypeForFact(fact: MatchEvidenceFact): CoachInsight["type"] {
  switch (fact.category) {
    case "DANGER_CREATION":
    case "SCORING_CONVERSION":
      return "tactical_success";
    case "POSSESSION_INSTABILITY":
      return "weakness";
    case "TERRITORIAL_PRESSURE":
      return "training_recommendation";
    case "PRESSURE_WITHOUT_CONVERSION":
      return "tactical_failure";
    case "FATIGUE_LOAD":
    case "MOMENTUM_SHIFT":
    case "TACTICAL_PLAN_SIGNAL":
    case "HARNESS_PLAUSIBILITY_WARNING":
    case "WORKBENCH_CHAIN_CONSUMPTION":
    case "WORKBENCH_CHAIN_SEGMENT_CONTEXT":
    case "WORKBENCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE":
    case "WORKBENCH_CHAIN_SHADOW_ROUTE_SELECTION":
    case "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_SELECTION":
    case "WORKBENCH_CHAIN_SEGMENT_ROUTE_INPUT":
    case "WORKBENCH_CHAIN_CONTROLLED_MINIMATCH_ROUTE_SOURCE":
    case "WORKBENCH_CHAIN_LIVE_SELECTION_OVERRIDE_GUARD":
    case "WORKBENCH_CHAIN_ISOLATED_MINIMATCH_OVERRIDE_EXPERIMENT":
    case "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_REPLAY_COMPARISON":
    case "WORKBENCH_CHAIN_REAL_ISOLATED_SEGMENT_REPLAY":
    case "WORKBENCH_CHAIN_CONTROLLED_ROUTE_RESOLUTION_SANDBOX":
    case "WORKBENCH_CHAIN_SANDBOX_SCORING_OPPORTUNITY_MODEL":
    case "WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_CANDIDATE":
    case "WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_RESOLUTION":
    case "WORKBENCH_CHAIN_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION_SANDBOX":
    case "WORKBENCH_CHAIN_GOALKEEPER_RESPONSE_MODEL_SANDBOX":
    case "WORKBENCH_CHAIN_REBOUND_SECOND_CHANCE_SANDBOX":
    case "WORKBENCH_CHAIN_MULTI_ACTION_CONTINUATION_SANDBOX":
    case "WORKBENCH_CHAIN_SANDBOX_SEQUENCE_REPLAY":
    case "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_SANDBOX_TIMELINE":
    case "WORKBENCH_CHAIN_OFFICIAL_TIMELINE_DIFF_VIEW":
    case "WORKBENCH_CHAIN_COACH_FACING_TIMELINE_REVIEW":
    case "WORKBENCH_CHAIN_SANDBOX_DECISION_PANEL":
    case "WORKBENCH_CHAIN_SANDBOX_DECISION_EVIDENCE_CALIBRATION":
    case "WORKBENCH_CHAIN_SANDBOX_DECISION_BATCH_CONFIDENCE_CALIBRATION":
    case "WORKBENCH_CHAIN_MULTI_SCENARIO_COACH_TEST_PLAN":
    case "WORKBENCH_CHAIN_SELECTION_PREVIEW":
    case "WORKBENCH_CHAIN_SELECTION_PREVIEW_TRACE_BACKING":
    case "WORKBENCH_CHAIN_SELECTION_PREVIEW_COACH_COPY":
    case "WORKBENCH_CHAIN_SELECTION_PREVIEW_PROFILE_VIEW":
    case "WORKBENCH_CHAIN_PLAYER_MATCHUP_VIEW":
    case "WORKBENCH_CHAIN_PLAYER_MATCHUP_CALIBRATION":
    case "WORKBENCH_CHAIN_COACH_PRODUCT_REPORT_VIEW":
    case "WORKBENCH_CHAIN_COACH_PRODUCT_REPORT_POLISH":
    case "WORKBENCH_CHAIN_MATCH_EVENT_TRACE_SPINE":
    case "WORKBENCH_CHAIN_MATCH_TRACE_AGGREGATOR":
    case "WORKBENCH_CHAIN_COACH_REPORT_FROM_TRACE_AGGREGATES":
    case "WORKBENCH_CHAIN_COACH_REPORT_V1_VISUALIZATION":
    case "WORKBENCH_CHAIN_COACH_REPORT_V1_INFORMATION_HIERARCHY":
    case "WORKBENCH_CHAIN_COACH_REPORT_V1_LEGACY_CLEANUP":
    case "WORKBENCH_CHAIN_FULL_MATCH_TRACE_VALIDATION":
    case "WORKBENCH_CHAIN_PROFILE_SIGNAL_CALIBRATION":
      return "training_recommendation";
  }
}

function titleForFact(fact: MatchEvidenceFact): string {
  switch (fact.category) {
    case "DANGER_CREATION":
      return "Des sÃ©quences dangereuses ont Ã©mergÃ©";
    case "POSSESSION_INSTABILITY":
      return "La possession s'est fragilisÃ©e sous pression";
    case "SCORING_CONVERSION":
      return "Les actions dÃ©cisives sont bien identifiÃ©es";
    case "TERRITORIAL_PRESSURE":
      return "La pression s'est concentrÃ©e dans une zone";
    case "PRESSURE_WITHOUT_CONVERSION":
      return `${(fact.teamId ?? "equipe").toUpperCase()} produit du volume sans conversion`;
    case "FATIGUE_LOAD":
      return "La charge physique devient un fait de match";
    case "MOMENTUM_SHIFT":
      return "L'Ã©lan du match change";
    case "TACTICAL_PLAN_SIGNAL":
      return "Le plan de match laisse un signal lisible";
    case "WORKBENCH_CHAIN_CONSUMPTION":
      return "Consommation workbench experimentale";
    case "WORKBENCH_CHAIN_SEGMENT_CONTEXT":
      return "Contexte segmentaire workbench experimental";
    case "WORKBENCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE":
      return "Influence candidate-route workbench experimentale";
    case "WORKBENCH_CHAIN_SHADOW_ROUTE_SELECTION":
      return "Selection shadow de route workbench experimentale";
    case "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_SELECTION":
      return "Selection controlee de segment workbench experimentale";
    case "WORKBENCH_CHAIN_SEGMENT_ROUTE_INPUT":
      return "Input de route segmentaire workbench experimental";
    case "WORKBENCH_CHAIN_CONTROLLED_MINIMATCH_ROUTE_SOURCE":
      return "Source de route controlee mini-match experimentale";
    case "WORKBENCH_CHAIN_LIVE_SELECTION_OVERRIDE_GUARD":
      return "Garde d'override de selection live experimental";
    case "WORKBENCH_CHAIN_ISOLATED_MINIMATCH_OVERRIDE_EXPERIMENT":
      return "Experience mini-match isolee avec override";
    case "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_REPLAY_COMPARISON":
      return "Comparaison de replay controle du segment";
    case "WORKBENCH_CHAIN_REAL_ISOLATED_SEGMENT_REPLAY":
      return "Replay isole reel du segment";
    case "WORKBENCH_CHAIN_CONTROLLED_ROUTE_RESOLUTION_SANDBOX":
      return "Sandbox de resolution controlee de route";
    case "WORKBENCH_CHAIN_SANDBOX_SCORING_OPPORTUNITY_MODEL":
      return "Modele sandbox d'opportunite de scoring";
    case "WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_CANDIDATE":
      return "Candidat sandbox d'evenement de scoring";
    case "WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_RESOLUTION":
      return "Resolution sandbox d'evenement de scoring";
    case "WORKBENCH_CHAIN_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION_SANDBOX":
      return "Resolution attributaire de tir sandbox";
    case "WORKBENCH_CHAIN_GOALKEEPER_RESPONSE_MODEL_SANDBOX":
      return "Modele de reponse gardien sandbox";
    case "WORKBENCH_CHAIN_REBOUND_SECOND_CHANCE_SANDBOX":
      return "Rebond et seconde chance sandbox";
    case "WORKBENCH_CHAIN_MULTI_ACTION_CONTINUATION_SANDBOX":
      return "Continuation multi-action sandbox";
    case "WORKBENCH_CHAIN_SANDBOX_SEQUENCE_REPLAY":
      return "Replay de mini-sequence sandbox";
    case "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_SANDBOX_TIMELINE":
      return "Timeline sandbox controlee du segment";
    case "WORKBENCH_CHAIN_OFFICIAL_TIMELINE_DIFF_VIEW":
      return "Diff read-only timeline officielle vs sandbox";
    case "WORKBENCH_CHAIN_COACH_FACING_TIMELINE_REVIEW":
      return "Lecture timeline officielle vs sandbox";
    case "WORKBENCH_CHAIN_SANDBOX_DECISION_PANEL":
      return "Panneau de decision sandbox";
    case "WORKBENCH_CHAIN_SANDBOX_DECISION_EVIDENCE_CALIBRATION":
      return "Calibration d'evidence du panneau sandbox";
    case "WORKBENCH_CHAIN_SANDBOX_DECISION_BATCH_CONFIDENCE_CALIBRATION":
      return "Confiance multi-scenarios du sandbox";
    case "WORKBENCH_CHAIN_MULTI_SCENARIO_COACH_TEST_PLAN":
      return "Plan de test coach multi-scenarios";
    case "WORKBENCH_CHAIN_SELECTION_PREVIEW":
      return "PrÃ©visualisation de sÃ©lection";
    case "WORKBENCH_CHAIN_SELECTION_PREVIEW_TRACE_BACKING":
      return "PrÃ©visualisation de sÃ©lection appuyÃ©e par les traces";
    case "WORKBENCH_CHAIN_SELECTION_PREVIEW_COACH_COPY":
      return "Profils Ã  observer";
    case "WORKBENCH_CHAIN_SELECTION_PREVIEW_PROFILE_VIEW":
      return "Profils Ã  observer";
    case "WORKBENCH_CHAIN_PLAYER_MATCHUP_VIEW":
      return "Joueurs Ã  Ã©tudier";
    case "WORKBENCH_CHAIN_PLAYER_MATCHUP_CALIBRATION":
      return "Calibration des joueurs Ã  Ã©tudier";
    case "WORKBENCH_CHAIN_COACH_PRODUCT_REPORT_VIEW":
      return "Rapport coach produit";
    case "WORKBENCH_CHAIN_COACH_PRODUCT_REPORT_POLISH":
      return "Polish du rapport coach produit";
    case "WORKBENCH_CHAIN_MATCH_EVENT_TRACE_SPINE":
      return "Colonne de traces de match";
    case "WORKBENCH_CHAIN_MATCH_TRACE_AGGREGATOR":
      return "AgrÃƒÂ©gats de traces de match";
    case "WORKBENCH_CHAIN_COACH_REPORT_FROM_TRACE_AGGREGATES":
    case "WORKBENCH_CHAIN_COACH_REPORT_V1_VISUALIZATION":
      return "Rapport coach depuis les agrÃƒÂ©gats officiels";
    case "WORKBENCH_CHAIN_COACH_REPORT_V1_INFORMATION_HIERARCHY":
      return "Hierarchie de lecture du rapport coach V1";
    case "WORKBENCH_CHAIN_COACH_REPORT_V1_LEGACY_CLEANUP":
      return "Nettoyage de la lecture legacy du rapport coach V1";
    case "WORKBENCH_CHAIN_FULL_MATCH_TRACE_VALIDATION":
      return "Validation multi-profils des traces full-match";
    case "WORKBENCH_CHAIN_PROFILE_SIGNAL_CALIBRATION":
      return "Calibration des signaux de profils full-match";
    case "HARNESS_PLAUSIBILITY_WARNING":
      return "Avertissement de plausibilitÃ© du harnais";
  }
}

function confidenceText(value: MatchEvidenceFact["confidence"]): string {
  switch (value) {
    case "low":
      return "faible";
    case "medium":
      return "moyenne";
    case "high":
      return "Ã©levÃ©e";
  }
}

function recommendedActionForFact(fact: MatchEvidenceFact): CoachInsight["recommendedActions"][number] {
  switch (fact.category) {
    case "DANGER_CREATION":
      return {
        actionId: `${fact.factId}-repeat-pattern`,
        label: `Continuer Ã  rÃ©pÃ©ter les entrÃ©es en ${primaryFactZone(fact)}`,
        tradeoff: "Engager du soutien dans le couloir productif peut affaiblir la rest-defense si l'attaque Ã©choue.",
      };
    case "POSSESSION_INSTABILITY":
      return {
        actionId: `${fact.factId}-stabilize-possession`,
        label: `Ajouter des soutiens plus sÃ»rs autour de ${primaryFactZone(fact)}`,
        tradeoff: "Des soutiens plus prudents peuvent rÃ©duire la menace verticale immÃ©diate et ralentir le tempo de transition.",
      };
    case "SCORING_CONVERSION":
      return {
        actionId: `${fact.factId}-protect-finishing-platform`,
        label: "Conserver le schÃ©ma qui a crÃ©Ã© l'action dÃ©cisive",
        tradeoff: "Trop insister sur une seule route de conversion peut rendre l'attaque plus prÃ©visible.",
      };
    case "TERRITORIAL_PRESSURE":
      return {
        actionId: `${fact.factId}-pressure-release`,
        label: `PrÃ©parer une sortie de pression depuis ${primaryFactZone(fact)}`,
        tradeoff: "Une sortie trop prÃ©coce peut concÃ©der du terrain si la structure de rÃ©ception n'est pas sÃ©curisÃ©e.",
      };
    case "PRESSURE_WITHOUT_CONVERSION":
      return {
        actionId: `${fact.factId}-route-selection-after-pressure`,
        label: `Revoir la route choisie aprÃ¨s pression en ${primaryFactZone(fact)}.`,
        tradeoff: "RÃ©duire le risque peut stabiliser la plateforme de conversion, mais aussi retirer une partie de la menace immÃ©diate.",
      };
    case "FATIGUE_LOAD":
    case "MOMENTUM_SHIFT":
    case "TACTICAL_PLAN_SIGNAL":
    case "WORKBENCH_CHAIN_CONSUMPTION":
    case "WORKBENCH_CHAIN_SEGMENT_CONTEXT":
    case "WORKBENCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE":
    case "WORKBENCH_CHAIN_SHADOW_ROUTE_SELECTION":
    case "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_SELECTION":
    case "WORKBENCH_CHAIN_SEGMENT_ROUTE_INPUT":
    case "WORKBENCH_CHAIN_CONTROLLED_MINIMATCH_ROUTE_SOURCE":
    case "WORKBENCH_CHAIN_LIVE_SELECTION_OVERRIDE_GUARD":
    case "WORKBENCH_CHAIN_ISOLATED_MINIMATCH_OVERRIDE_EXPERIMENT":
    case "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_REPLAY_COMPARISON":
    case "WORKBENCH_CHAIN_REAL_ISOLATED_SEGMENT_REPLAY":
    case "WORKBENCH_CHAIN_CONTROLLED_ROUTE_RESOLUTION_SANDBOX":
    case "WORKBENCH_CHAIN_SANDBOX_SCORING_OPPORTUNITY_MODEL":
    case "WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_CANDIDATE":
    case "WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_RESOLUTION":
    case "WORKBENCH_CHAIN_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION_SANDBOX":
    case "WORKBENCH_CHAIN_GOALKEEPER_RESPONSE_MODEL_SANDBOX":
    case "WORKBENCH_CHAIN_REBOUND_SECOND_CHANCE_SANDBOX":
    case "WORKBENCH_CHAIN_MULTI_ACTION_CONTINUATION_SANDBOX":
    case "WORKBENCH_CHAIN_SANDBOX_SEQUENCE_REPLAY":
    case "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_SANDBOX_TIMELINE":
    case "WORKBENCH_CHAIN_OFFICIAL_TIMELINE_DIFF_VIEW":
    case "WORKBENCH_CHAIN_COACH_FACING_TIMELINE_REVIEW":
    case "WORKBENCH_CHAIN_SANDBOX_DECISION_PANEL":
    case "WORKBENCH_CHAIN_SANDBOX_DECISION_EVIDENCE_CALIBRATION":
    case "WORKBENCH_CHAIN_SANDBOX_DECISION_BATCH_CONFIDENCE_CALIBRATION":
    case "WORKBENCH_CHAIN_MULTI_SCENARIO_COACH_TEST_PLAN":
    case "WORKBENCH_CHAIN_SELECTION_PREVIEW":
    case "WORKBENCH_CHAIN_SELECTION_PREVIEW_TRACE_BACKING":
    case "WORKBENCH_CHAIN_SELECTION_PREVIEW_COACH_COPY":
    case "WORKBENCH_CHAIN_SELECTION_PREVIEW_PROFILE_VIEW":
    case "WORKBENCH_CHAIN_PLAYER_MATCHUP_VIEW":
    case "WORKBENCH_CHAIN_PLAYER_MATCHUP_CALIBRATION":
    case "WORKBENCH_CHAIN_COACH_PRODUCT_REPORT_VIEW":
    case "WORKBENCH_CHAIN_COACH_PRODUCT_REPORT_POLISH":
    case "WORKBENCH_CHAIN_MATCH_EVENT_TRACE_SPINE":
    case "WORKBENCH_CHAIN_MATCH_TRACE_AGGREGATOR":
    case "WORKBENCH_CHAIN_COACH_REPORT_FROM_TRACE_AGGREGATES":
    case "WORKBENCH_CHAIN_COACH_REPORT_V1_VISUALIZATION":
    case "WORKBENCH_CHAIN_COACH_REPORT_V1_INFORMATION_HIERARCHY":
    case "WORKBENCH_CHAIN_COACH_REPORT_V1_LEGACY_CLEANUP":
    case "WORKBENCH_CHAIN_FULL_MATCH_TRACE_VALIDATION":
    case "WORKBENCH_CHAIN_PROFILE_SIGNAL_CALIBRATION":
    case "HARNESS_PLAUSIBILITY_WARNING":
      return {
        actionId: `${fact.factId}-review-signal`,
        label: `Relire le signal autour de ${primaryFactZone(fact)}`,
        tradeoff: "Agir trop vite sur un signal partiel peut masquer la cause tactique rÃ©elle.",
      };
  }
}

function selectPrimaryFact(facts: readonly MatchEvidenceFact[]): MatchEvidenceFact | null {
  const priority: readonly MatchEvidenceCategory[] = [
    "PRESSURE_WITHOUT_CONVERSION",
    "DANGER_CREATION",
    "POSSESSION_INSTABILITY",
    "TERRITORIAL_PRESSURE",
    "FATIGUE_LOAD",
    "MOMENTUM_SHIFT",
    "TACTICAL_PLAN_SIGNAL",
    "WORKBENCH_CHAIN_CONSUMPTION",
    "WORKBENCH_CHAIN_SEGMENT_CONTEXT",
    "WORKBENCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE",
    "WORKBENCH_CHAIN_SHADOW_ROUTE_SELECTION",
    "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_SELECTION",
    "WORKBENCH_CHAIN_SEGMENT_ROUTE_INPUT",
    "WORKBENCH_CHAIN_CONTROLLED_MINIMATCH_ROUTE_SOURCE",
    "WORKBENCH_CHAIN_LIVE_SELECTION_OVERRIDE_GUARD",
    "WORKBENCH_CHAIN_ISOLATED_MINIMATCH_OVERRIDE_EXPERIMENT",
    "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_REPLAY_COMPARISON",
    "WORKBENCH_CHAIN_REAL_ISOLATED_SEGMENT_REPLAY",
    "WORKBENCH_CHAIN_CONTROLLED_ROUTE_RESOLUTION_SANDBOX",
    "WORKBENCH_CHAIN_SANDBOX_SCORING_OPPORTUNITY_MODEL",
    "WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_CANDIDATE",
    "WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_RESOLUTION",
    "WORKBENCH_CHAIN_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION_SANDBOX",
    "WORKBENCH_CHAIN_GOALKEEPER_RESPONSE_MODEL_SANDBOX",
    "WORKBENCH_CHAIN_REBOUND_SECOND_CHANCE_SANDBOX",
    "WORKBENCH_CHAIN_MULTI_ACTION_CONTINUATION_SANDBOX",
    "WORKBENCH_CHAIN_SANDBOX_SEQUENCE_REPLAY",
    "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_SANDBOX_TIMELINE",
    "WORKBENCH_CHAIN_OFFICIAL_TIMELINE_DIFF_VIEW",
    "WORKBENCH_CHAIN_COACH_FACING_TIMELINE_REVIEW",
    "WORKBENCH_CHAIN_SANDBOX_DECISION_PANEL",
    "WORKBENCH_CHAIN_SANDBOX_DECISION_EVIDENCE_CALIBRATION",
    "WORKBENCH_CHAIN_SANDBOX_DECISION_BATCH_CONFIDENCE_CALIBRATION",
    "WORKBENCH_CHAIN_MULTI_SCENARIO_COACH_TEST_PLAN",
    "WORKBENCH_CHAIN_SELECTION_PREVIEW",
    "WORKBENCH_CHAIN_SELECTION_PREVIEW_TRACE_BACKING",
    "WORKBENCH_CHAIN_SELECTION_PREVIEW_COACH_COPY",
    "WORKBENCH_CHAIN_SELECTION_PREVIEW_PROFILE_VIEW",
    "WORKBENCH_CHAIN_COACH_PRODUCT_REPORT_VIEW",
    "WORKBENCH_CHAIN_COACH_PRODUCT_REPORT_POLISH",
    "WORKBENCH_CHAIN_MATCH_EVENT_TRACE_SPINE",
    "WORKBENCH_CHAIN_MATCH_TRACE_AGGREGATOR",
    "WORKBENCH_CHAIN_COACH_REPORT_FROM_TRACE_AGGREGATES",
    "WORKBENCH_CHAIN_COACH_REPORT_V1_VISUALIZATION",
    "WORKBENCH_CHAIN_COACH_REPORT_V1_INFORMATION_HIERARCHY",
    "WORKBENCH_CHAIN_COACH_REPORT_V1_LEGACY_CLEANUP",
    "WORKBENCH_CHAIN_FULL_MATCH_TRACE_VALIDATION",
    "WORKBENCH_CHAIN_PROFILE_SIGNAL_CALIBRATION",
    "HARNESS_PLAUSIBILITY_WARNING",
    "SCORING_CONVERSION",
  ];

  for (const category of priority) {
    const fact = facts.find((candidate) => candidate.category === category);

    if (fact !== undefined) {
      return fact;
    }
  }

  return facts[0] ?? null;
}

export function createEvidenceDrivenCoachInsights(input: {
  readonly matchInput: MatchInput;
  readonly facts: readonly MatchEvidenceFact[];
}): readonly CoachInsight[] {
  const fact = selectPrimaryFact(input.facts);

  if (fact === null) {
    return [
      {
        insightId: `${input.matchInput.matchId}-adapter-insight`,
        type: "training_recommendation",
        title: "Les preuves du moteur restent limitÃ©es",
        summary:
          "Le moteur a produit un fil officiel, mais aucun fait de preuve ciblÃ© n'a franchi les seuils lÃ©gers de Sprint 2C.",
        evidence: [
          {
            eventIds: [],
            summary: "Aucun fait de preuve n'a Ã©tÃ© gÃ©nÃ©rÃ© depuis le fil actuellement visible par le moteur.",
            confidenceNote: "Analyse Ã  faible confiance tant que les plans tactiques ne sont pas entiÃ¨rement branchÃ©s.",
          },
        ],
        affectedPlayers: [],
        affectedZones: [],
        confidence: "low",
        recommendedActions: [
          {
            actionId: "expand-evidence-thresholds",
            label: "Revoir les seuils de taxonomie aprÃ¨s la prochaine passe d'adaptation",
            tradeoff: "Des seuils plus bas peuvent produire des signaux coach plus bruitÃ©s.",
          },
        ],
      },
    ];
  }

  return [
    {
      insightId: `${fact.factId}-insight`,
      type: insightTypeForFact(fact),
      title: titleForFact(fact),
      summary: normalizeCoachFacingCopy(fact.summary),
      evidence: [
        {
          eventIds: fact.eventIds,
          summary: normalizeCoachFacingCopy(`Fait de preuve ${fact.factId} : ${fact.summary}`),
          confidenceNote: normalizeCoachFacingCopy(
            `Confiance ${confidenceText(fact.confidence)}; intensitÃ© ${fact.strength}/100. Signal encore partiel : cette analyse sera renforcÃ©e quand les plans tactiques seront davantage branchÃ©s au moteur.`,
          ),
        },
      ],
      affectedPlayers: [],
      affectedZones: [primaryFactZone(fact)],
      confidence: fact.confidence,
      recommendedActions: [recommendedActionForFact(fact)],
    },
  ];
}

export function createEvidenceBasedTacticalDiagnoses(input: {
  readonly matchInput: MatchInput;
  readonly facts: readonly MatchEvidenceFact[];
  readonly fallbackEvents: readonly MatchEvent[];
}): readonly TacticalDiagnosis[] {
  const fact = selectPrimaryFact(input.facts);

  if (fact === null) {
    const fallbackEvent = input.fallbackEvents.find((event) => event.eventType !== "kickoff");

    return [
      {
        diagnosisId: `${input.matchInput.matchId}-adapter-diagnosis`,
        teamId: input.matchInput.homeTeam.teamId,
        title: "Diagnostic moteur Ã  faible confiance",
        summary:
          "Le fil officiel est prÃ©sent, mais les faits de preuve de Sprint 2C n'ont pas isolÃ© de motif tactique ciblÃ©.",
        evidenceEventIds: fallbackEvent === undefined ? [] : [fallbackEvent.eventId],
        affectedZones: fallbackEvent === undefined ? [] : [fallbackEvent.zone],
        confidence: "low",
      },
    ];
  }

  return [
    {
      diagnosisId: `${fact.factId}-diagnosis`,
      teamId: fact.teamId ?? input.matchInput.homeTeam.teamId,
      title: titleForFact(fact),
      summary: normalizeCoachFacingCopy(`${fact.summary} Analyse Ã  faible confiance tant que les plans tactiques ne sont pas entiÃ¨rement branchÃ©s.`),
      evidenceEventIds: fact.eventIds,
      affectedZones: [primaryFactZone(fact)],
      confidence: "low",
    },
  ];
}

export function eventTypeFromAdapterTags(tags: readonly string[]): MatchEventType {
  if (tags.includes("scoring_event")) {
    return "scoring";
  }

  if (tags.includes("finishing_opportunity") || tags.includes("danger_high")) {
    return "progression";
  }

  if (tags.includes("stability_low") && tags.includes("pressure_high")) {
    return "turnover";
  }

  if (tags.includes("territorial_pressure_high")) {
    return "progression";
  }

  return "tactical_shift";
}
