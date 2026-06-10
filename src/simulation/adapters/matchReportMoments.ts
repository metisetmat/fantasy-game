import type {
  CoachInsight,
  KeyMoment,
  MatchEvent,
  MatchInput,
} from "../../contracts/engineToCoach";
import { normalizeCoachFacingCopy } from "../../reports/coachCopyQuality";
import { coachFacingKeyMomentSummary } from "../../reports/coachFacingSummary";
import type { MatchEvidenceFact } from "./matchReportEvidence";

const MAX_KEY_MOMENTS = 5;
const HIGH_NARRATIVE_WEIGHT = 60;

interface KeyMomentCandidate {
  readonly event: MatchEvent;
  readonly priority: number;
  readonly evidenceFact?: MatchEvidenceFact;
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
  return facts.find((fact) => fact.coachVisible && fact.eventIds.includes(event.eventId));
}

function factZone(fact: MatchEvidenceFact): string {
  return fact.affectedZones[0] ?? "Z3-C";
}

function titleForEvent(event: MatchEvent, fact: MatchEvidenceFact | undefined): string {
  if (event.eventType === "kickoff") {
    return "DÃ©but du match";
  }

  if (event.eventType === "scoring") {
    return "Action dÃ©cisive";
  }

  if (fact?.category === "PRESSURE_WITHOUT_CONVERSION") {
    return `${event.teamId.toUpperCase()} sous pression sans conversion`;
  }

  if (hasTag(event, "score_state_lopsided") || hasTag(event, "momentum_negative") || fact?.category === "MOMENTUM_SHIFT") {
    return "Signal d'Ã©lan Ã  surveiller";
  }

  if (fact?.category === "TERRITORIAL_PRESSURE") {
    return `Pression concentrÃ©e en ${factZone(fact)}`;
  }

  if (hasTag(event, "danger_high") || fact?.category === "DANGER_CREATION") {
    return "SÃ©quence dangereuse";
  }

  if (fact?.category === "HARNESS_PLAUSIBILITY_WARNING") {
    return "Signal de harnais Ã  surveiller";
  }

  if (hasTag(event, "stability_low") && (hasTag(event, "pressure_high") || hasTag(event, "pressure_medium"))) {
    return "Possession sous pression";
  }

  if (hasTag(event, "territorial_pressure_high")) {
    return "SÃ©quence de pression territoriale";
  }

  return "SÃ©quence tactique";
}

function summaryForEvent(event: MatchEvent, fact: MatchEvidenceFact | undefined): string {
  const category = fact?.category ?? (event.eventType === "scoring" ? "SCORING_CONVERSION" : undefined);

  return coachFacingKeyMomentSummary({
    title: titleForEvent(event, fact),
    teamId: event.teamId,
    zone: fact?.affectedZones[0] ?? event.zone,
    ...(fact === undefined ? {} : { evidenceSummary: fact.summary }),
    ...(event.tacticalContext.reason === undefined ? {} : { eventContext: event.tacticalContext.reason }),
    ...(category === undefined ? {} : { category }),
  });
}

function candidatePriority(event: MatchEvent, fact: MatchEvidenceFact | undefined, insightEventIds: ReadonlySet<string>): number {
  if (event.eventType === "scoring") {
    return 100;
  }

  if (fact?.category === "PRESSURE_WITHOUT_CONVERSION") {
    return 88;
  }

  if (fact?.category === "HARNESS_PLAUSIBILITY_WARNING") {
    return 82;
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

function candidateTitle(candidate: KeyMomentCandidate): string {
  return titleForEvent(candidate.event, candidate.evidenceFact);
}

function candidateFromEvent(input: {
  readonly event: MatchEvent;
  readonly facts: readonly MatchEvidenceFact[];
  readonly insightEventIds: ReadonlySet<string>;
}): KeyMomentCandidate | null {
  const fact = factForEvent(input.event, input.facts);
  const priority = candidatePriority(input.event, fact, input.insightEventIds);

  if (priority <= 0) {
    return null;
  }

  return {
    event: input.event,
    priority,
    ...(fact === undefined ? {} : { evidenceFact: fact }),
  };
}

function compareCandidates(a: KeyMomentCandidate, b: KeyMomentCandidate): number {
  if (a.priority !== b.priority) {
    return b.priority - a.priority;
  }

  return a.event.timestamp.tick - b.event.timestamp.tick;
}

function selectDiverseCandidates(candidates: readonly KeyMomentCandidate[]): readonly KeyMomentCandidate[] {
  const sortedCandidates = [...candidates].sort(compareCandidates);
  const nonScoringCandidates = sortedCandidates.filter((candidate) => candidate.event.eventType !== "scoring");
  const scoringLimit = nonScoringCandidates.length > 0 ? 2 : MAX_KEY_MOMENTS;
  const availableTitleCount = new Set(sortedCandidates.map(candidateTitle)).size;
  const shouldLimitRepeatedTitles = availableTitleCount > 1;
  const selected: KeyMomentCandidate[] = [];
  const titleCounts = new Map<string, number>();
  let scoringCount = 0;

  for (const candidate of sortedCandidates) {
    if (selected.length >= MAX_KEY_MOMENTS) {
      break;
    }

    const title = candidateTitle(candidate);
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
      const title = candidateTitle(candidate);
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

  return [...selectDiverseCandidates([...candidatesByEventId.values()])]
    .sort((a, b) => a.event.timestamp.tick - b.event.timestamp.tick)
    .map((candidate) => ({
      eventId: candidate.event.eventId,
      ...(candidate.evidenceFact === undefined ? {} : {
        evidenceFactId: candidate.evidenceFact.factId,
        category: candidate.evidenceFact.category,
      }),
      title: normalizeCoachFacingCopy(titleForEvent(candidate.event, candidate.evidenceFact)),
      summary: summaryForEvent(candidate.event, candidate.evidenceFact),
      minute: candidate.event.timestamp.minute,
    }));
}

