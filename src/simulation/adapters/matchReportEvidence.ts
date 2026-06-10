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
  | "visible_pressure_zone"
  | "dominated_team_no_payoff";

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
    summary: `${input.perspective.teamName} a crÃ©Ã© ${highDangerEvents.length} sÃ©quence${highDangerEvents.length === 1 ? "" : "s"} dangereuse${highDangerEvents.length === 1 ? "" : "s"} visible${highDangerEvents.length === 1 ? "" : "s"} par l'adapter en ${zones.join(", ")}.`,
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
    summary: `${input.perspective.teamName} a connu ${unstableEvents.length} sÃ©quence${unstableEvents.length === 1 ? "" : "s"} de possession instable sous pression visible en ${zones.join(", ")}.`,
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
    summary: `${input.perspective.teamName} a converti ${scoringEvents.length} action${scoringEvents.length === 1 ? "" : "s"} dÃ©cisive${scoringEvents.length === 1 ? "" : "s"} identifiÃ©e${scoringEvents.length === 1 ? "" : "s"} dans les sÃ©quences de score.`,
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
    summary: `La pression la plus visible par l'adapter pour ${input.perspective.teamName} s'est concentrÃ©e en ${zone}.`,
    strength: clampRating(35 + zoneEventIds.length * 15),
    confidence: "low",
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
    zone: representativeZone(signalEvents, firstSignalEvent.zone),
    category: "dominated_team_no_payoff",
    summary: `${input.perspective.teamName} produit des signaux de pression, progression ou instabilitÃ© en ${zones.join(", ")}, mais aucune de ces sÃ©quences ne devient un Ã©vÃ©nement de score dans ce run de harnais.`,
    strength: clampRating(45 + signalEvents.length * 8),
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
    case "high_danger_sequences":
    case "converted_scoring":
      return "tactical_success";
    case "unstable_under_pressure":
      return "weakness";
    case "visible_pressure_zone":
      return "training_recommendation";
    case "dominated_team_no_payoff":
      return "tactical_failure";
  }
}

function titleForFact(fact: MatchEvidenceFact): string {
  switch (fact.category) {
    case "high_danger_sequences":
      return "Des sequences dangereuses ont emerge";
    case "unstable_under_pressure":
      return "La possession s'est fragilisee sous pression";
    case "converted_scoring":
      return "Les actions decisives sont bien identifiees";
    case "visible_pressure_zone":
      return "La pression s'est concentree dans une zone";
    case "dominated_team_no_payoff":
      return `${fact.teamId} produit du volume sans conversion`;
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
    case "high_danger_sequences":
      return {
        actionId: `${fact.factId}-repeat-pattern`,
        label: `Continuer Ã  rÃ©pÃ©ter les entrÃ©es en ${fact.zone}`,
        tradeoff: "Engager du soutien dans le couloir productif peut affaiblir la rest-defense si l'attaque Ã©choue.",
      };
    case "unstable_under_pressure":
      return {
        actionId: `${fact.factId}-stabilize-possession`,
        label: `Ajouter des soutiens plus sÃ»rs autour de ${fact.zone}`,
        tradeoff: "Des soutiens plus prudents peuvent rÃ©duire la menace verticale immÃ©diate et ralentir le tempo de transition.",
      };
    case "converted_scoring":
      return {
        actionId: `${fact.factId}-protect-finishing-platform`,
        label: "ProtÃ©ger le schÃ©ma qui a menÃ© Ã  l'action dÃ©cisive",
        tradeoff: "Trop insister sur une seule route de conversion peut rendre l'attaque plus prÃ©visible.",
      };
    case "visible_pressure_zone":
      return {
        actionId: `${fact.factId}-pressure-release`,
        label: `PrÃ©parer une sortie de pression depuis ${fact.zone}`,
        tradeoff: "Une sortie trop prÃ©coce peut concÃ©der du terrain si la structure de rÃ©ception n'est pas sÃ©curisÃ©e.",
      };
    case "dominated_team_no_payoff":
      return {
        actionId: `${fact.factId}-route-selection-after-pressure`,
        label: `Revoir la route choisie apres pression en ${fact.zone}`,
        tradeoff: "Reduire le risque peut stabiliser la plateforme de conversion, mais aussi retirer une partie de la menace immediate.",
      };
  }
}

function selectPrimaryFact(facts: readonly MatchEvidenceFact[]): MatchEvidenceFact | null {
  const priority: readonly MatchEvidenceCategory[] = [
    "dominated_team_no_payoff",
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
        title: "Les preuves de l'adapter restent limitÃ©es",
        summary:
          "L'adapter mini-match a produit un fil officiel, mais aucun fait de preuve ciblÃ© n'a franchi les seuils lÃ©gers de Sprint 2C.",
        evidence: [
          {
            eventIds: [],
            summary: "Aucun fait de preuve n'a Ã©tÃ© gÃ©nÃ©rÃ© depuis le fil actuellement visible par l'adapter.",
            confidenceNote: "Analyse Ã  faible confiance tant que les plans tactiques ne sont pas entiÃ¨rement branchÃ©s.",
          },
        ],
        affectedPlayers: [],
        affectedZones: [],
        confidence: "low",
        recommendedActions: [
          {
            actionId: "expand-evidence-thresholds",
            label: "Revoir les seuils de taxonomie aprÃ¨s la prochaine passe adapter",
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
      summary: fact.summary,
      evidence: [
        {
          eventIds: fact.eventIds,
          summary: `Fait de preuve ${fact.factId} : ${fact.summary}`,
          confidenceNote: `Confiance ${confidenceText(fact.confidence)}; intensitÃ© ${fact.strength}/100. DonnÃ©es encore limitÃ©es par l'adapter de simulation actuel.`,
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
        title: "Diagnostic adapter Ã  faible confiance",
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
      teamId: fact.teamId,
      title: titleForFact(fact),
      summary: `${fact.summary} Analyse Ã  faible confiance tant que les plans tactiques ne sont pas entiÃ¨rement branchÃ©s.`,
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
