import type { MatchEvent, MatchReport } from "../contracts/engineToCoach";
import type { EventId, TeamId } from "../core/ids";
import type {
  OfficialMatchStoryBeat,
  OfficialMatchStorySegment,
  OfficialMatchStorySpineModel,
  OfficialMatchTurningPoint,
} from "./officialMatchStorySpineTypes";
import { buildMatchStoryNarrativeQuality } from "./buildMatchStoryNarrativeQuality";
import { MATCH_STORY_CHRONOLOGY_CUMULATIVE_SCORE_NARRATIVE_QUALITY_FIX_WARNINGS } from "./matchStoryChronologyCumulativeScoreNarrativeQualityFixWarnings";

interface ScoreState {
  readonly home: number;
  readonly away: number;
}

interface TeamPair {
  readonly homeTeamId: TeamId;
  readonly awayTeamId: TeamId;
}

function eventMinute(event: MatchEvent): number {
  return event.timestamp.minute;
}

function eventScoreValue(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function eventHasScoreChange(event: MatchEvent): boolean {
  return eventScoreValue(event) > 0;
}

function isDangerEvent(event: MatchEvent): boolean {
  return event.eventType === "scoring" ||
    event.outcome === "score" ||
    event.tags.some((tag) => /danger|opportunity|shot|try|drop|scoring/iu.test(tag));
}

function teamPair(report: MatchReport): TeamPair {
  const homeTeamId = report.teamStats[0]?.teamId ?? report.timeline[0]?.teamId ?? "home";
  const awayTeamId = report.teamStats.find((team) => team.teamId !== homeTeamId)?.teamId ??
    report.timeline.find((event) => event.teamId !== homeTeamId)?.teamId ??
    report.timeline[0]?.opponentTeamId ??
    "away";

  return { homeTeamId, awayTeamId };
}

function scoreLabel(pair: TeamPair, score: ScoreState): string {
  return `${pair.homeTeamId} ${score.home} - ${score.away} ${pair.awayTeamId}`;
}

function scoreBeforeMinute(report: MatchReport, pair: TeamPair, minute: number): ScoreState {
  let home = 0;
  let away = 0;
  for (const event of report.timeline) {
    if (eventMinute(event) >= minute) break;
    const value = eventScoreValue(event);
    if (value <= 0) continue;
    if (event.teamId === pair.homeTeamId) home += value;
    else away += value;
  }

  return { home, away };
}

function scoreThroughMinute(report: MatchReport, pair: TeamPair, minute: number): ScoreState {
  let home = 0;
  let away = 0;
  for (const event of report.timeline) {
    if (eventMinute(event) > minute) break;
    const value = eventScoreValue(event);
    if (value <= 0) continue;
    if (event.teamId === pair.homeTeamId) home += value;
    else away += value;
  }

  return { home, away };
}

function scoreDeltaForRange(report: MatchReport, pair: TeamPair, startMinute: number, endMinute: number): {
  readonly homeDelta: number;
  readonly awayDelta: number;
  readonly scoreEventIds: readonly EventId[];
} {
  let homeDelta = 0;
  let awayDelta = 0;
  const scoreEventIds: EventId[] = [];
  for (const event of report.timeline) {
    if (eventMinute(event) < startMinute || eventMinute(event) > endMinute) continue;
    const value = eventScoreValue(event);
    if (value <= 0) continue;
    scoreEventIds.push(event.eventId);
    if (event.teamId === pair.homeTeamId) homeDelta += value;
    else awayDelta += value;
  }

  return { homeDelta, awayDelta, scoreEventIds };
}

function scoreRegression(previous: ScoreState, next: ScoreState): boolean {
  return next.home < previous.home || next.away < previous.away;
}

function segmentNarrativeFunction(segment: OfficialMatchStorySegment, isScoreless: boolean): string {
  if (!isScoreless) return "cumulative_score_progression";
  if (segment.phaseType === "late_game_phase" || segment.phaseType === "closing") return "late_stabilization";
  if (segment.phaseType === "pressure_phase" || segment.phaseType === "danger_phase") return "pressure_without_score_change";
  return "context_without_score_change";
}

function repairSegments(model: OfficialMatchStorySpineModel, report: MatchReport): readonly OfficialMatchStorySegment[] {
  const pair = teamPair(report);
  let previousAfter: ScoreState = { home: 0, away: 0 };

  return model.segments.map((segment, index): OfficialMatchStorySegment => {
    const before = scoreBeforeMinute(report, pair, segment.startMinute);
    const after = scoreThroughMinute(report, pair, segment.endMinute);
    const delta = scoreDeltaForRange(report, pair, segment.startMinute, segment.endMinute);
    const isScoreless = delta.homeDelta === 0 && delta.awayDelta === 0;
    const hasRegression = scoreRegression(previousAfter, after);
    previousAfter = after;
    const localScore = `${delta.homeDelta}-${delta.awayDelta}`;
    const cumulative = scoreLabel(pair, after);
    const segmentScoreDelta = isScoreless
      ? "aucun changement de score sur ce segment"
      : `${pair.homeTeamId} +${delta.homeDelta}, ${pair.awayTeamId} +${delta.awayDelta}`;
    const segmentScoreLabel = isScoreless
      ? `score du segment : ${localScore} ; score cumule : ${cumulative}`
      : `score cumule : ${cumulative} ; score du segment : ${localScore}`;
    const primaryNarrativeFunction = segmentNarrativeFunction(segment, isScoreless);

    return {
      ...segment,
      scoreBefore: scoreLabel(pair, before),
      scoreAfter: cumulative,
      scoreBeforeCumulative: scoreLabel(pair, before),
      scoreAfterCumulative: cumulative,
      segmentScoreDelta,
      isScorelessSegment: isScoreless,
      segmentScoreLabel,
      scoreLabelType: isScoreless ? "mixed_explained" : "cumulative",
      chronologicalIndex: index + 1,
      hasScoreRegression: hasRegression,
      scoreRegressionWarningCode: hasRegression ? "SEGMENT_SCORE_REGRESSION" : "NONE",
      primaryNarrativeFunction,
      narrativeLead: isScoreless
        ? `Aucun changement de score sur ce segment; le cumul reste ${cumulative}.`
        : `Le segment fait evoluer le cumul officiel vers ${cumulative}.`,
      narrativeClose: isScoreless
        ? "Le score local n'est pas utilise comme score officiel."
        : "Le score officiel reste cumulatif et trace aux score_change.",
      linkedScoreChangeEventIds: delta.scoreEventIds,
      narrativeSummary: isScoreless
        ? `Aucun changement de score sur ce segment; score cumule conserve: ${cumulative}.`
        : `Score cumule actualise par score_change officiel: ${cumulative}.`,
    };
  });
}

function previousCounts(report: MatchReport, minute: number): {
  readonly previousScoreChangeCount: number;
  readonly previousDangerEventCount: number;
} {
  const previousEvents = report.timeline.filter((event) => eventMinute(event) < minute);
  return {
    previousScoreChangeCount: previousEvents.filter(eventHasScoreChange).length,
    previousDangerEventCount: previousEvents.filter(isDangerEvent).length,
  };
}

function priorityForTurningPoint(point: OfficialMatchTurningPoint): number {
  switch (point.turningPointType) {
    case "first_score":
      return 100;
    case "decisive_score":
      return 90;
    case "first_real_danger":
      return 75;
    case "fatigue_exposure":
      return 55;
    case "goalkeeper_intervention":
    case "late_stabilization":
      return 50;
    case "failed_response":
    case "momentum_shift":
      return 60;
  }
}

function turnReason(point: OfficialMatchTurningPoint, previousScoreChangeCount: number): string {
  if (point.turningPointType === "first_score") {
    return `${point.teamBenefited ?? "Une equipe"} ouvre le tableau officiel; ce score devient le premier repere chronologique du recit.`;
  }
  if (point.turningPointType === "first_real_danger" && previousScoreChangeCount > 0) {
    return "Le danger est conserve comme tournant, mais il est qualifie comme danger non converti apres les premiers scores.";
  }
  if (point.turningPointType === "decisive_score") {
    return `${point.teamBenefited ?? "Une equipe"} installe le score final par un score_change officiel, sans reecrire la sequence.`;
  }
  if (point.turningPointType === "late_stabilization") {
    return "La fin de match compte surtout comme stabilisation: elle preserve le cumul plutot qu'elle ne fabrique une nouvelle rupture.";
  }

  return point.whyItTurned.replace("Ce tournant aide a comprendre le match sans imposer de decision.", "Le tournant reste relie a l'evenement officiel correspondant.");
}

function coachMeaningForTurningPoint(point: OfficialMatchTurningPoint): string {
  switch (point.turningPointType) {
    case "first_score":
      return "Point de depart du tableau: a lire comme bascule chronologique, pas comme consigne.";
    case "first_real_danger":
      return "A relire comme signal de pression ou de menace, avec son qualificatif temporel.";
    case "decisive_score":
      return "Repere de score final: il confirme le cumul officiel.";
    case "late_stabilization":
      return "Repere de fermeture: observer la proprete de la stabilisation.";
    case "fatigue_exposure":
      return "Repere de lucidite: observer si la condition pese sur les sorties.";
    case "goalkeeper_intervention":
      return "Repere de dernier rideau: verifier la qualite de controle apres danger.";
    case "failed_response":
    case "momentum_shift":
      return "Repere de rythme: relire la reponse collective autour de cet evenement.";
  }
}

function repairTurningPoints(model: OfficialMatchStorySpineModel, report: MatchReport): readonly OfficialMatchTurningPoint[] {
  return [...model.turningPoints]
    .sort((a, b) => a.minute - b.minute || priorityForTurningPoint(b) - priorityForTurningPoint(a))
    .slice(0, 4)
    .map((point, index): OfficialMatchTurningPoint => {
      const counts = previousCounts(report, point.minute);
      const isFirstDangerCandidate = point.turningPointType === "first_real_danger";
      const invalidFirstDangerLabel = isFirstDangerCandidate &&
        counts.previousScoreChangeCount > 0 &&
        /Premier vrai danger officiel/iu.test(point.title);
      const replacementTitleIfNeeded = invalidFirstDangerLabel
        ? "Premier danger non converti apres les premiers scores"
        : "";
      const title = replacementTitleIfNeeded.length > 0 ? replacementTitleIfNeeded : point.title
        .replace("Score decisif du recit officiel", "Score qui installe le resultat final")
        .replace("Stabilisation defensive", "Stabilisation defensive de fin de match");

      return {
        ...point,
        title,
        chronologicalIndex: index + 1,
        isFirstDangerCandidate,
        firstDangerEligibility: isFirstDangerCandidate
          ? counts.previousScoreChangeCount === 0
            ? "BEFORE_FIRST_SCORE"
            : "QUALIFIED_AFTER_SCORE"
          : "NOT_FIRST_DANGER",
        previousScoreChangeCount: counts.previousScoreChangeCount,
        previousDangerEventCount: counts.previousDangerEventCount,
        narrativeOrderValid: true,
        turningPointOrderWarningCode: invalidFirstDangerLabel ? "FIRST_DANGER_LABEL_REPAIRED" : "NONE",
        replacementTitleIfNeeded,
        narrativePriority: priorityForTurningPoint(point),
        whyItTurned: turnReason(point, counts.previousScoreChangeCount),
        coachMeaning: coachMeaningForTurningPoint(point),
      };
    });
}

function warningCodesFor(model: OfficialMatchStorySpineModel): readonly string[] {
  const warnings = MATCH_STORY_CHRONOLOGY_CUMULATIVE_SCORE_NARRATIVE_QUALITY_FIX_WARNINGS;
  const codes = [
    ...model.warningCodes,
    ...(model.storyChronologyReady ? [warnings.storyChronologyReady] : [warnings.storyChronologyInvalid]),
    ...(model.cumulativeScoreReady ? [warnings.cumulativeScoreReady] : [warnings.segmentScoreRegression]),
    ...(model.turningPointOrderReady ? [warnings.turningPointOrderReady] : [warnings.turningPointsNotChronological]),
    ...(model.shortNarrativeQualityReady ? [warnings.shortNarrativeQualityReady] : []),
    ...(model.detailedNarrativeQualityReady ? [warnings.detailedNarrativeQualityReady] : []),
    ...(model.coachFacingNarrativeQualityReady ? [warnings.coachFacingNarrativeQualityReady] : []),
    ...(model.narrativeQualityReady ? [warnings.narrativeQualityReady] : [warnings.narrativeFlowTooLow]),
    ...(model.mechanicalNarrativeRemoved ? [warnings.mechanicalNarrativeRemoved] : [warnings.mechanicalNarrativeSentence]),
    ...(model.scoreTimelineConsistencyReady ? [warnings.scoreTimelineConsistencyReady] : [warnings.finalScoreMismatch]),
    ...(model.storyRegressionFixed ? [warnings.storyRegressionFixed] : [warnings.partial]),
    ...(model.sourceOfTruthSeparationPreserved ? [warnings.sourceOfTruthPreserved] : [warnings.sourceOfTruthAmbiguous]),
    ...(model.reportIntegrationMinimalReady ? [warnings.reportIntegrationReady] : []),
    ...(model.matchEconomyBaselinePreserved ? [warnings.matchEconomyBaselinePreserved] : [warnings.matchEconomyBaselineRegressed]),
    ...(model.productBaselineReady ? [warnings.productBaselineReady] : []),
    ...(model.status === "PASS" ? [warnings.complete] : model.status === "PARTIAL" ? [warnings.partial] : [warnings.fail]),
  ];

  return [...new Set(codes)];
}

export function repairOfficialMatchStoryChronology(
  model: OfficialMatchStorySpineModel,
  report: MatchReport,
): OfficialMatchStorySpineModel {
  const segments = repairSegments(model, report);
  const beats = [...model.beats].sort((a, b) => a.minute - b.minute);
  const turningPoints = repairTurningPoints(model, report);
  const scoreChangeEventCount = report.timeline.filter(eventHasScoreChange).length;
  const narrative = buildMatchStoryNarrativeQuality({
    officialScore: model.officialScore,
    segments,
    beats,
    turningPoints,
    causalityLinks: model.causalityLinks,
    scoreChangeEventCount,
  });
  const storyChronologyReady = segments.every((segment, index) => index === 0 || segment.startMinute >= (segments[index - 1]?.startMinute ?? 0)) &&
    beats.every((beat, index) => index === 0 || beat.minute >= (beats[index - 1]?.minute ?? 0)) &&
    turningPoints.every((point, index) => index === 0 || point.minute >= (turningPoints[index - 1]?.minute ?? 0));
  const cumulativeScoreReady = segments.every((segment) => segment.scoreAfterCumulative.length > 0 && !segment.hasScoreRegression);
  const turningPointOrderReady = turningPoints.every((point) => point.narrativeOrderValid);
  const shortNarrativeQualityReady = narrative.shortNarrative.length > 0;
  const detailedNarrativeQualityReady = narrative.detailedNarrative.length > 0;
  const coachFacingNarrativeQualityReady = narrative.coachFacingNarrative.length > 0 &&
    !/score_change|sandbox|batch|diagnostic|SQLite|persistence/iu.test(narrative.coachFacingNarrative);
  const mechanicalNarrativeRemoved = narrative.mechanicalSentenceCount === 0 && narrative.repeatedSentenceCount === 0;
  const scoreTimelineConsistencyReady = cumulativeScoreReady && narrative.scoreContradictionCount === 0;
  const narrativeQualityReady = narrative.narrativeQualityScore >= 80 &&
    narrative.narrativeFlowScore >= 80 &&
    narrative.causalClarityScore >= 80 &&
    coachFacingNarrativeQualityReady &&
    mechanicalNarrativeRemoved;
  const storyRegressionFixed = storyChronologyReady && cumulativeScoreReady && turningPointOrderReady &&
    narrative.firstDangerContradictionCount === 0;
  const status = model.status === "PASS" &&
    storyChronologyReady &&
    cumulativeScoreReady &&
    turningPointOrderReady &&
    narrativeQualityReady &&
    storyRegressionFixed
    ? "PASS"
    : model.status === "FAIL"
      ? "FAIL"
      : "PARTIAL";
  const repaired: OfficialMatchStorySpineModel = {
    ...model,
    status,
    storyChronologyReady,
    cumulativeScoreReady,
    turningPointOrderReady,
    narrativeQualityReady,
    shortNarrativeQualityReady,
    detailedNarrativeQualityReady,
    coachFacingNarrativeQualityReady,
    mechanicalNarrativeRemoved,
    scoreTimelineConsistencyReady,
    storyRegressionFixed,
    reportIntegrationMinimalReady: model.reportIntegrationMinimalReady && narrativeQualityReady,
    segments,
    beats,
    turningPoints,
    narrative,
    recommendation: status === "PASS"
      ? "KEEP_OFFICIAL_MATCH_STORY_SPINE"
      : status === "PARTIAL"
        ? "MATCH_NARRATIVE_QUALITY_FOLLOW_UP"
        : "FIX_OFFICIAL_STORY_SOURCE_OF_TRUTH",
    nextSprintRecommendation: status === "PASS"
      ? "8C - Attribute Role Fatigue Causality Deepening"
      : status === "PARTIAL"
        ? "8C - Match Narrative Quality Follow-up"
        : "8C - Official Story Source-of-Truth Regression Fix",
  };

  return {
    ...repaired,
    warningCodes: warningCodesFor(repaired),
  };
}

