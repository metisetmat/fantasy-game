import type {
  CoachInsight,
  MatchEvent,
  MatchEventType,
  MatchInput,
  TacticalDiagnosis,
} from "../../contracts/engineToCoach";
import type { TeamId } from "../../core/ids";
import type { Rating } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";

export type MatchEvidenceCategory =
  | "high_danger_sequences"
  | "unstable_under_pressure"
  | "converted_scoring"
  | "visible_pressure_zone";

export interface MatchEvidenceFact {
  readonly factId: string;
  readonly matchId: string;
  readonly teamId: TeamId;
  readonly opponentTeamId: TeamId;
  readonly eventIds: readonly string[];
  readonly zone: ZoneId;
  readonly category: MatchEvidenceCategory;
  readonly summary: string;
  readonly strength: Rating;
  readonly confidence: "low" | "medium" | "high";
}

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
    zone: representativeZone(highDangerEvents, firstHighDangerEvent.zone),
    category: "high_danger_sequences",
    summary: `${input.perspective.teamName} a créé ${highDangerEvents.length} séquence${highDangerEvents.length === 1 ? "" : "s"} dangereuse${highDangerEvents.length === 1 ? "" : "s"} visible${highDangerEvents.length === 1 ? "" : "s"} par l'adapter en ${zones.join(", ")}.`,
    strength: clampRating(45 + highDangerEvents.length * 15),
    confidence: "medium",
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
    zone: representativeZone(unstableEvents, firstUnstableEvent.zone),
    category: "unstable_under_pressure",
    summary: `${input.perspective.teamName} a connu ${unstableEvents.length} séquence${unstableEvents.length === 1 ? "" : "s"} de possession instable sous pression visible en ${zones.join(", ")}.`,
    strength: clampRating(40 + unstableEvents.length * 12),
    confidence: "medium",
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
    zone: representativeZone(scoringEvents, firstScoringEvent.zone),
    category: "converted_scoring",
    summary: `${input.perspective.teamName} a converti ${scoringEvents.length} action${scoringEvents.length === 1 ? "" : "s"} décisive${scoringEvents.length === 1 ? "" : "s"} identifiée${scoringEvents.length === 1 ? "" : "s"} dans les séquences de score.`,
    strength: clampRating(55 + scoringEvents.length * 15),
    confidence: "medium",
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
    zone,
    category: "visible_pressure_zone",
    summary: `La pression la plus visible par l'adapter pour ${input.perspective.teamName} s'est concentrée en ${zone}.`,
    strength: clampRating(35 + zoneEventIds.length * 15),
    confidence: "low",
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
    case "high_danger_sequences":
    case "converted_scoring":
      return "tactical_success";
    case "unstable_under_pressure":
      return "weakness";
    case "visible_pressure_zone":
      return "training_recommendation";
  }
}

function titleForFact(fact: MatchEvidenceFact): string {
  switch (fact.category) {
    case "high_danger_sequences":
      return "Des séquences dangereuses ont émergé";
    case "unstable_under_pressure":
      return "La possession s'est fragilisée sous pression";
    case "converted_scoring":
      return "Les actions décisives sont bien identifiées";
    case "visible_pressure_zone":
      return "La pression s'est concentrée dans une zone";
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
    case "high_danger_sequences":
      return {
        actionId: `${fact.factId}-repeat-pattern`,
        label: `Continuer à répéter les entrées en ${fact.zone}`,
        tradeoff: "Engager du soutien dans le couloir productif peut affaiblir la rest-defense si l'attaque échoue.",
      };
    case "unstable_under_pressure":
      return {
        actionId: `${fact.factId}-stabilize-possession`,
        label: `Ajouter des soutiens plus sûrs autour de ${fact.zone}`,
        tradeoff: "Des soutiens plus prudents peuvent réduire la menace verticale immédiate et ralentir le tempo de transition.",
      };
    case "converted_scoring":
      return {
        actionId: `${fact.factId}-protect-finishing-platform`,
        label: "Protéger le schéma qui a mené à l'action décisive",
        tradeoff: "Trop insister sur une seule route de conversion peut rendre l'attaque plus prévisible.",
      };
    case "visible_pressure_zone":
      return {
        actionId: `${fact.factId}-pressure-release`,
        label: `Préparer une sortie de pression depuis ${fact.zone}`,
        tradeoff: "Une sortie trop précoce peut concéder du terrain si la structure de réception n'est pas sécurisée.",
      };
  }
}

function selectPrimaryFact(facts: readonly MatchEvidenceFact[]): MatchEvidenceFact | null {
  const priority: readonly MatchEvidenceCategory[] = [
    "high_danger_sequences",
    "unstable_under_pressure",
    "visible_pressure_zone",
    "converted_scoring",
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
        title: "Les preuves de l'adapter restent limitées",
        summary:
          "L'adapter mini-match a produit un fil officiel, mais aucun fait de preuve ciblé n'a franchi les seuils légers de Sprint 2C.",
        evidence: [
          {
            eventIds: [],
            summary: "Aucun fait de preuve n'a été généré depuis le fil actuellement visible par l'adapter.",
            confidenceNote: "Analyse à faible confiance tant que les plans tactiques ne sont pas entièrement branchés.",
          },
        ],
        affectedPlayers: [],
        affectedZones: [],
        confidence: "low",
        recommendedActions: [
          {
            actionId: "expand-evidence-thresholds",
            label: "Revoir les seuils de taxonomie après la prochaine passe adapter",
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
          confidenceNote: `Confiance ${confidenceText(fact.confidence)}; intensité ${fact.strength}/100. Données encore limitées par l'adapter de simulation actuel.`,
        },
      ],
      affectedPlayers: [],
      affectedZones: [fact.zone],
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
        title: "Diagnostic adapter à faible confiance",
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
      teamId: fact.teamId,
      title: titleForFact(fact),
      summary: `${fact.summary} Analyse à faible confiance tant que les plans tactiques ne sont pas entièrement branchés.`,
      evidenceEventIds: fact.eventIds,
      affectedZones: [fact.zone],
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
