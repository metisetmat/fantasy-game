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
    summary: `${input.perspective.teamName} a créé ${highDangerEvents.length} séquence${highDangerEvents.length === 1 ? "" : "s"} dangereuse${highDangerEvents.length === 1 ? "" : "s"} visible${highDangerEvents.length === 1 ? "" : "s"} dans les données de simulation actuelles en ${zones.join(", ")}.`,
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
    summary: `${input.perspective.teamName} a connu ${unstableEvents.length} séquence${unstableEvents.length === 1 ? "" : "s"} de possession instable sous pression visible en ${zones.join(", ")}.`,
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
    summary: `${input.perspective.teamName} a converti ${scoringEvents.length} action${scoringEvents.length === 1 ? "" : "s"} décisive${scoringEvents.length === 1 ? "" : "s"} identifiée${scoringEvents.length === 1 ? "" : "s"} dans les séquences de score.`,
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
    summary: `La pression la plus visible pour ${input.perspective.teamName} s'est concentrée en ${zone}.`,
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
    summary: `${input.perspective.teamName} apparaît dans plusieurs séquences de pression, de progression ou d'instabilité, mais aucune ne devient un événement de score dans ce run de harnais. La question utile est de savoir si ${input.perspective.teamName} manque de soutien dans le dernier geste, choisit une route trop risquée après pression, ou si le harnais répète une route non convertissante. Zones visibles : ${zones.join(", ")}.`,
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
        facts.push(fact);
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
      return "training_recommendation";
  }
}

function titleForFact(fact: MatchEvidenceFact): string {
  switch (fact.category) {
    case "DANGER_CREATION":
      return "Des séquences dangereuses ont émergé";
    case "POSSESSION_INSTABILITY":
      return "La possession s'est fragilisée sous pression";
    case "SCORING_CONVERSION":
      return "Les actions décisives sont bien identifiées";
    case "TERRITORIAL_PRESSURE":
      return "La pression s'est concentrée dans une zone";
    case "PRESSURE_WITHOUT_CONVERSION":
      return `${(fact.teamId ?? "equipe").toUpperCase()} produit du volume sans conversion`;
    case "FATIGUE_LOAD":
      return "La charge physique devient un fait de match";
    case "MOMENTUM_SHIFT":
      return "L'élan du match change";
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
    case "HARNESS_PLAUSIBILITY_WARNING":
      return "Avertissement de plausibilité du harnais";
  }
}

function confidenceText(value: MatchEvidenceFact["confidence"]): string {
  switch (value) {
    case "low":
      return "faible";
    case "medium":
      return "moyenne";
    case "high":
      return "élevée";
  }
}

function recommendedActionForFact(fact: MatchEvidenceFact): CoachInsight["recommendedActions"][number] {
  switch (fact.category) {
    case "DANGER_CREATION":
      return {
        actionId: `${fact.factId}-repeat-pattern`,
        label: `Continuer à répéter les entrées en ${primaryFactZone(fact)}`,
        tradeoff: "Engager du soutien dans le couloir productif peut affaiblir la rest-defense si l'attaque échoue.",
      };
    case "POSSESSION_INSTABILITY":
      return {
        actionId: `${fact.factId}-stabilize-possession`,
        label: `Ajouter des soutiens plus sûrs autour de ${primaryFactZone(fact)}`,
        tradeoff: "Des soutiens plus prudents peuvent réduire la menace verticale immédiate et ralentir le tempo de transition.",
      };
    case "SCORING_CONVERSION":
      return {
        actionId: `${fact.factId}-protect-finishing-platform`,
        label: "Conserver le schéma qui a créé l'action décisive",
        tradeoff: "Trop insister sur une seule route de conversion peut rendre l'attaque plus prévisible.",
      };
    case "TERRITORIAL_PRESSURE":
      return {
        actionId: `${fact.factId}-pressure-release`,
        label: `Préparer une sortie de pression depuis ${primaryFactZone(fact)}`,
        tradeoff: "Une sortie trop précoce peut concéder du terrain si la structure de réception n'est pas sécurisée.",
      };
    case "PRESSURE_WITHOUT_CONVERSION":
      return {
        actionId: `${fact.factId}-route-selection-after-pressure`,
        label: `Revoir la route choisie après pression en ${primaryFactZone(fact)}.`,
        tradeoff: "Réduire le risque peut stabiliser la plateforme de conversion, mais aussi retirer une partie de la menace immédiate.",
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
    case "HARNESS_PLAUSIBILITY_WARNING":
      return {
        actionId: `${fact.factId}-review-signal`,
        label: `Relire le signal autour de ${primaryFactZone(fact)}`,
        tradeoff: "Agir trop vite sur un signal partiel peut masquer la cause tactique réelle.",
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
        title: "Les preuves du moteur restent limitées",
        summary:
          "Le moteur a produit un fil officiel, mais aucun fait de preuve ciblé n'a franchi les seuils légers de Sprint 2C.",
        evidence: [
          {
            eventIds: [],
            summary: "Aucun fait de preuve n'a été généré depuis le fil actuellement visible par le moteur.",
            confidenceNote: "Analyse à faible confiance tant que les plans tactiques ne sont pas entièrement branchés.",
          },
        ],
        affectedPlayers: [],
        affectedZones: [],
        confidence: "low",
        recommendedActions: [
          {
            actionId: "expand-evidence-thresholds",
            label: "Revoir les seuils de taxonomie après la prochaine passe d'adaptation",
            tradeoff: "Des seuils plus bas peuvent produire des signaux coach plus bruités.",
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
      summary: fact.summary,
      evidence: [
        {
          eventIds: fact.eventIds,
          summary: `Fait de preuve ${fact.factId} : ${fact.summary}`,
          confidenceNote: `Confiance ${confidenceText(fact.confidence)}; intensité ${fact.strength}/100. Signal encore partiel : cette analyse sera renforcée quand les plans tactiques seront davantage branchés au moteur.`,
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
        title: "Diagnostic moteur à faible confiance",
        summary:
          "Le fil officiel est présent, mais les faits de preuve de Sprint 2C n'ont pas isolé de motif tactique ciblé.",
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
      summary: `${fact.summary} Analyse à faible confiance tant que les plans tactiques ne sont pas entièrement branchés.`,
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
