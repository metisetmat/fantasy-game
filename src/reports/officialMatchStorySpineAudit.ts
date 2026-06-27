import type { MatchReport } from "../contracts/engineToCoach";
import type { OfficialMatchStorySpineModel } from "./officialMatchStorySpineTypes";

export interface OfficialMatchStorySpineAudit {
  readonly storySpineExists: boolean;
  readonly storySegmentCount: number;
  readonly storyBeatCount: number;
  readonly turningPointCount: number;
  readonly causalityLinkCount: number;
  readonly scoreChangeEventCount: number;
  readonly scoreChangeEventsCoveredByStoryCount: number;
  readonly keyMomentsCoveredByStoryCount: number;
  readonly dangerEventsCoveredByStoryCount: number;
  readonly fatigueSignalsCoveredByStoryCount: number;
  readonly playerImpactSignalsCoveredByStoryCount: number;
  readonly teamStyleSignalsCoveredByStoryCount: number;
  readonly unsupportedNarrativeClaimCount: number;
  readonly unsupportedCausalityClaimCount: number;
  readonly sandboxClaimInOfficialStoryCount: number;
  readonly diagnosticClaimInOfficialStoryCount: number;
  readonly officialEventReferenceCoverage: number;
  readonly scoringNarrativeCoverage: boolean;
  readonly coachReadableNarrativeAvailable: boolean;
  readonly storySpineWarningCodes: readonly string[];
  readonly recommendation: string;
}

function countScoreChanges(report: MatchReport): number {
  return report.timeline.filter((event) => event.consequences.some((consequence) => consequence.type === "score_change")).length;
}

function containsForbiddenClaim(text: string, pattern: RegExp): number {
  return pattern.test(text) ? 1 : 0;
}

export function auditOfficialMatchStorySpine(model: OfficialMatchStorySpineModel, report: MatchReport): OfficialMatchStorySpineAudit {
  const scoreChangeEventIds = report.timeline
    .filter((event) => event.consequences.some((consequence) => consequence.type === "score_change"))
    .map((event) => event.eventId);
  const coveredEventIds = new Set(model.beats.map((beat) => beat.linkedOfficialEventId));
  const coveredScoreChangeIds = new Set(model.beats.filter((beat) => beat.beatType === "score").map((beat) => beat.linkedOfficialEventId));
  const keyMomentIds = report.keyMoments.map((moment) => moment.eventId);
  const dangerEventIds = report.timeline
    .filter((event) => event.eventType === "scoring" || event.tags.some((tag) => /danger|opportunity|shot|try|drop/iu.test(tag)))
    .map((event) => event.eventId);
  const fatigueEventIds = report.timeline
    .filter((event) => event.eventType === "fatigue_error" || event.fatigueContext.teamCondition < 72)
    .map((event) => event.eventId);
  const linkedOfficialEventIds = new Set([
    ...model.beats.map((beat) => beat.linkedOfficialEventId),
    ...model.segments.flatMap((segment) => segment.linkedOfficialEventIds),
    ...model.turningPoints.flatMap((turningPoint) => turningPoint.linkedOfficialEventIds),
    ...model.causalityLinks.flatMap((link) => link.linkedOfficialEventIds),
  ]);
  const totalReferenceCount = Math.max(1, linkedOfficialEventIds.size);
  const officialReferenceCount = [...linkedOfficialEventIds].filter((eventId) => report.timeline.some((event) => event.eventId === eventId)).length;
  const narrativeText = [
    model.narrative.shortNarrative,
    model.narrative.detailedNarrative,
    model.narrative.coachFacingNarrative,
    model.narrative.scoringNarrative,
  ].join(" ");
  const unsupportedNarrativeClaimCount =
    containsForbiddenClaim(narrativeText, /preuve definitive|verite globale|toujours|garanti|score ajuste|score equilibre manuellement/iu);
  const sandboxClaimInOfficialStoryCount = containsForbiddenClaim(narrativeText, /sandbox applique|sandbox comme verite/iu);
  const diagnosticClaimInOfficialStoryCount = containsForbiddenClaim(narrativeText, /diagnostic comme verite officielle|diagnostic score officiel/iu);
  const unsupportedCausalityClaimCount = model.causalityLinks.filter((link) => link.linkedOfficialEventIds.length === 0 || !link.officialOnly || link.sandboxOnly || link.diagnosticOnly).length;
  const scoreChangeEventsCoveredByStoryCount = scoreChangeEventIds.filter((eventId) => coveredScoreChangeIds.has(eventId)).length;
  const storySpineWarningCodes = [
    ...(model.segments.length >= 4 && model.segments.length <= 8 ? ["STORY_SEGMENTS_READY"] : ["STORY_SEGMENT_COUNT_INVALID"]),
    ...(model.beats.length >= 8 ? ["STORY_BEATS_READY"] : ["STORY_BEAT_COUNT_TOO_LOW"]),
    ...(model.turningPoints.length >= 2 && model.turningPoints.length <= 4 ? ["TURNING_POINTS_READY"] : ["TURNING_POINT_COUNT_INVALID"]),
    ...(scoreChangeEventsCoveredByStoryCount === scoreChangeEventIds.length ? ["SCORING_STORY_COVERAGE_READY"] : ["SCORE_CHANGE_EVENT_NOT_COVERED"]),
  ];

  return {
    storySpineExists: model.segments.length > 0 && model.beats.length > 0,
    storySegmentCount: model.segments.length,
    storyBeatCount: model.beats.length,
    turningPointCount: model.turningPoints.length,
    causalityLinkCount: model.causalityLinks.length,
    scoreChangeEventCount: countScoreChanges(report),
    scoreChangeEventsCoveredByStoryCount,
    keyMomentsCoveredByStoryCount: keyMomentIds.filter((eventId) => coveredEventIds.has(eventId)).length,
    dangerEventsCoveredByStoryCount: dangerEventIds.filter((eventId) => coveredEventIds.has(eventId)).length,
    fatigueSignalsCoveredByStoryCount: fatigueEventIds.filter((eventId) => coveredEventIds.has(eventId)).length,
    playerImpactSignalsCoveredByStoryCount: model.beats.filter((beat) => beat.primaryPlayerId !== undefined).length,
    teamStyleSignalsCoveredByStoryCount: model.beats.filter((beat) => beat.beatType === "style_signal" || beat.beatType === "pressure_signal" || beat.beatType === "danger_created").length,
    unsupportedNarrativeClaimCount,
    unsupportedCausalityClaimCount,
    sandboxClaimInOfficialStoryCount,
    diagnosticClaimInOfficialStoryCount,
    officialEventReferenceCoverage: Math.round((officialReferenceCount / totalReferenceCount) * 100),
    scoringNarrativeCoverage: scoreChangeEventsCoveredByStoryCount === scoreChangeEventIds.length && model.narrative.scoringNarrative.length > 0,
    coachReadableNarrativeAvailable: model.narrative.coachFacingNarrative.length > 0,
    storySpineWarningCodes,
    recommendation: unsupportedNarrativeClaimCount === 0 && unsupportedCausalityClaimCount === 0
      ? "KEEP_OFFICIAL_STORY_SPINE"
      : "FIX_OFFICIAL_STORY_SUPPORT",
  };
}
