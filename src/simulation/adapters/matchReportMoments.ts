import type {
  CoachInsight,
  KeyMoment,
  MatchEvent,
  MatchInput,
} from "../../contracts/engineToCoach";
import type { MatchEvidenceFact } from "./matchReportEvidence";

const MAX_KEY_MOMENTS = 5;
const HIGH_NARRATIVE_WEIGHT = 60;

interface KeyMomentCandidate {
  readonly event: MatchEvent;
  readonly priority: number;
  readonly evidenceSummary?: string;
}

function hasTag(event: MatchEvent, tag: string): boolean {
  return event.tags.includes(tag);
}

function primaryInsightEvidenceEventIds(coachInsights: readonly CoachInsight[]): readonly string[] {
  const primaryInsight = coachInsights.find((insight) =>
    insight.evidence.some((evidence) => evidence.eventIds.length > 0),
  );

  return primaryInsight?.evidence.flatMap((evidence) => evidence.eventIds) ?? [];
}

function factForEvent(event: MatchEvent, facts: readonly MatchEvidenceFact[]): MatchEvidenceFact | undefined {
  return facts.find((fact) => fact.eventIds.includes(event.eventId));
}

function titleForEvent(event: MatchEvent, fact: MatchEvidenceFact | undefined): string {
  if (event.eventType === "kickoff") {
    return "Début du match";
  }

  if (event.eventType === "scoring") {
    return "Action décisive";
  }

  if (fact?.category === "dominated_team_no_payoff") {
    return `${event.teamId.toUpperCase()} sous pression sans conversion`;
  }

  if (hasTag(event, "score_state_lopsided") || hasTag(event, "momentum_negative")) {
    return "Signal d'élan à surveiller";
  }

  if (fact?.category === "visible_pressure_zone") {
    return `Pression concentrée en ${fact.zone}`;
  }

  if (hasTag(event, "danger_high") || fact?.category === "high_danger_sequences") {
    return "Séquence dangereuse";
  }

  if (hasTag(event, "stability_low") && (hasTag(event, "pressure_high") || hasTag(event, "pressure_medium"))) {
    return "Possession sous pression";
  }

  if (hasTag(event, "territorial_pressure_high")) {
    return "Séquence de pression territoriale";
  }

  return "Séquence tactique";
}

function summaryForEvent(event: MatchEvent, fact: MatchEvidenceFact | undefined): string {
  if (fact !== undefined) {
    return `${fact.summary} Contexte : ${event.tacticalContext.reason ?? "séquence tactique visible dans le rapport."}`;
  }

  return event.tacticalContext.reason ?? "Séquence tactique visible dans le rapport.";
}

function candidatePriority(event: MatchEvent, insightEventIds: ReadonlySet<string>): number {
  if (event.eventType === "scoring") {
    return 100;
  }

  if (insightEventIds.has(event.eventId)) {
    return 90;
  }

  if (hasTag(event, "score_state_lopsided") || hasTag(event, "momentum_negative")) {
    return 75;
  }

  if (hasTag(event, "stability_low") && (hasTag(event, "pressure_high") || hasTag(event, "pressure_medium"))) {
    return 74;
  }

  if (hasTag(event, "territorial_pressure_high")) {
    return 72;
  }

  if (event.narrativeWeight >= HIGH_NARRATIVE_WEIGHT) {
    return 70;
  }

  if (event.eventType === "kickoff") {
    return 5;
  }

  return 0;
}

function candidateTitle(candidate: KeyMomentCandidate, facts: readonly MatchEvidenceFact[]): string {
  return titleForEvent(candidate.event, factForEvent(candidate.event, facts));
}

function candidateFromEvent(input: {
  readonly event: MatchEvent;
  readonly facts: readonly MatchEvidenceFact[];
  readonly insightEventIds: ReadonlySet<string>;
}): KeyMomentCandidate | null {
  const priority = candidatePriority(input.event, input.insightEventIds);

  if (priority <= 0) {
    return null;
  }

  const fact = factForEvent(input.event, input.facts);
  const adjustedPriority = fact?.category === "dominated_team_no_payoff"
    ? Math.max(priority, 88)
    : priority;
  const candidate: KeyMomentCandidate = {
    event: input.event,
    priority: adjustedPriority,
  };

  return fact === undefined ? candidate : { ...candidate, evidenceSummary: fact.summary };
}

function compareCandidates(a: KeyMomentCandidate, b: KeyMomentCandidate): number {
  if (a.priority !== b.priority) {
    return b.priority - a.priority;
  }

  return a.event.timestamp.tick - b.event.timestamp.tick;
}

function selectDiverseCandidates(
  candidates: readonly KeyMomentCandidate[],
  facts: readonly MatchEvidenceFact[],
): readonly KeyMomentCandidate[] {
  const sortedCandidates = [...candidates].sort(compareCandidates);
  const nonScoringCandidates = sortedCandidates.filter((candidate) => candidate.event.eventType !== "scoring");
  const scoringLimit = nonScoringCandidates.length > 0 ? 2 : MAX_KEY_MOMENTS;
  const availableTitleCount = new Set(sortedCandidates.map((candidate) => candidateTitle(candidate, facts))).size;
  const shouldLimitRepeatedTitles = availableTitleCount > 1;
  const selected: KeyMomentCandidate[] = [];
  const titleCounts = new Map<string, number>();
  let scoringCount = 0;

  for (const candidate of sortedCandidates) {
    if (selected.length >= MAX_KEY_MOMENTS) {
      break;
    }

    const title = candidateTitle(candidate, facts);
    if (shouldLimitRepeatedTitles && (titleCounts.get(title) ?? 0) >= 2) {
      continue;
    }

    if (candidate.event.eventType === "scoring") {
      if (scoringCount >= scoringLimit) {
        continue;
      }
      scoringCount += 1;
    }

    selected.push(candidate);
    titleCounts.set(title, (titleCounts.get(title) ?? 0) + 1);
  }

  if (selected.length >= MAX_KEY_MOMENTS) {
    return selected;
  }

  for (const candidate of nonScoringCandidates) {
    if (selected.length >= MAX_KEY_MOMENTS) {
      break;
    }

    if (!selected.some((item) => item.event.eventId === candidate.event.eventId)) {
      const title = candidateTitle(candidate, facts);
      if (shouldLimitRepeatedTitles && (titleCounts.get(title) ?? 0) >= 2) {
        continue;
      }
      selected.push(candidate);
      titleCounts.set(title, (titleCounts.get(title) ?? 0) + 1);
    }
  }

  return selected;
}

export function selectKeyMoments(input: {
  readonly matchInput: MatchInput;
  readonly timeline: readonly MatchEvent[];
  readonly facts: readonly MatchEvidenceFact[];
  readonly coachInsights: readonly CoachInsight[];
}): readonly KeyMoment[] {
  const insightEventIds = new Set(primaryInsightEvidenceEventIds(input.coachInsights));
  const candidatesByEventId = new Map<string, KeyMomentCandidate>();
  let kickoffIncluded = false;

  for (const event of input.timeline) {
    if (event.eventType === "kickoff") {
      if (kickoffIncluded) {
        continue;
      }
      kickoffIncluded = true;
    }

    const candidate = candidateFromEvent({
      event,
      facts: input.facts,
      insightEventIds,
    });

    if (candidate === null) {
      continue;
    }

    const existingCandidate = candidatesByEventId.get(event.eventId);
    if (existingCandidate === undefined || candidate.priority > existingCandidate.priority) {
      candidatesByEventId.set(event.eventId, candidate);
    }
  }

  return [...selectDiverseCandidates([...candidatesByEventId.values()], input.facts)]
    .sort((a, b) => a.event.timestamp.tick - b.event.timestamp.tick)
    .map((candidate) => {
      const fact = factForEvent(candidate.event, input.facts);

      return {
        eventId: candidate.event.eventId,
        title: titleForEvent(candidate.event, fact),
        summary: candidate.evidenceSummary ?? summaryForEvent(candidate.event, fact),
        minute: candidate.event.timestamp.minute,
      };
    });
}
