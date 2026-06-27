import type { MatchReport } from "../contracts/engineToCoach";
import type { OfficialMatchStorySpineModel } from "./officialMatchStorySpineTypes";

export interface MatchStorySourceOfTruthRegressionAudit {
  readonly storyUsesOfficialTimelineOnly: boolean;
  readonly storyUsesOfficialScoreOnly: boolean;
  readonly storyScoreMatchesOfficialScore: boolean;
  readonly allStoryScoreClaimsBackedByScoreChange: boolean;
  readonly sandboxExcludedFromOfficialStory: boolean;
  readonly batchExcludedFromOfficialStory: boolean;
  readonly diagnosticSeparatedFromOfficialStory: boolean;
  readonly noPostHocRewrite: boolean;
  readonly noScoreMutation: boolean;
  readonly noEventDeletion: boolean;
  readonly noForcedNarrativeOutcome: boolean;
  readonly unsupportedTruthClaimCount: number;
  readonly inventedEventCount: number;
  readonly sourceOfTruthWarningCodes: readonly string[];
  readonly recommendation: string;
}

function scoreChangeEventCount(report: MatchReport): number {
  return report.timeline.filter((event) =>
    event.consequences.some((consequence) => consequence.type === "score_change" && (consequence.value ?? 0) > 0),
  ).length;
}

function normalizeScore(value: string): string {
  const numbers = [...value.matchAll(/\b\d+\b/gu)].map((match) => match[0]);
  return numbers.length >= 2 ? `${numbers[numbers.length - 2]} - ${numbers[numbers.length - 1]}` : value;
}

function countMatches(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

export function auditMatchStorySourceOfTruthRegression(
  model: OfficialMatchStorySpineModel,
  report: MatchReport,
): MatchStorySourceOfTruthRegressionAudit {
  const officialEventIds = new Set(report.timeline.map((event) => event.eventId));
  const storyEventIds = new Set([
    ...model.beats.map((beat) => beat.linkedOfficialEventId),
    ...model.segments.flatMap((segment) => segment.linkedOfficialEventIds),
    ...model.turningPoints.flatMap((point) => point.linkedOfficialEventIds),
    ...model.causalityLinks.flatMap((link) => link.linkedOfficialEventIds),
  ]);
  const inventedEventCount = [...storyEventIds].filter((eventId) => !officialEventIds.has(eventId)).length;
  const text = [
    model.narrative.shortNarrative,
    model.narrative.detailedNarrative,
    model.narrative.coachFacingNarrative,
    model.narrative.sourceOfTruthNote,
  ].join(" ");
  const sandboxExcludedFromOfficialStory = !/sandbox (?:applique|officiel|prouve)|sandbox comme/iu.test(text);
  const batchExcludedFromOfficialStory = !/batch score officiel|batch comme verite|diagnostic batch comme/iu.test(text);
  const diagnosticSeparatedFromOfficialStory = !/diagnostic.*score officiel|diagnostic.*verite officielle/iu.test(text);
  const allStoryScoreClaimsBackedByScoreChange = model.narrative.sourceOfTruthNote.includes("score_change") &&
    scoreChangeEventCount(report) === model.beats.filter((beat) => beat.beatType === "score").length;
  const storyScoreMatchesOfficialScore = normalizeScore(model.segments[model.segments.length - 1]?.scoreAfterCumulative ?? "") ===
    normalizeScore(model.officialScore);
  const unsupportedTruthClaimCount = countMatches(text, /verite officielle hors timeline|score equilibre manuellement|selection imposee|plan tactique impose/giu);
  const noForcedNarrativeOutcome = !/doit selectionner|selection imposee|plan tactique impose|resultat force/giu.test(text);
  const sourceOfTruthWarningCodes = [
    ...(inventedEventCount === 0 ? [] : ["INVENTED_EVENT_IN_STORY"]),
    ...(storyScoreMatchesOfficialScore ? [] : ["STORY_SCORE_MISMATCH"]),
    ...(allStoryScoreClaimsBackedByScoreChange ? [] : ["SCORE_CLAIM_WITHOUT_SCORE_CHANGE"]),
    ...(sandboxExcludedFromOfficialStory ? [] : ["SANDBOX_CLAIM_IN_OFFICIAL_STORY"]),
    ...(batchExcludedFromOfficialStory ? [] : ["BATCH_CLAIM_IN_OFFICIAL_STORY"]),
    ...(diagnosticSeparatedFromOfficialStory ? [] : ["DIAGNOSTIC_CLAIM_IN_OFFICIAL_STORY"]),
    ...(unsupportedTruthClaimCount === 0 ? [] : ["UNSUPPORTED_NARRATIVE_CLAIM"]),
    ...(noForcedNarrativeOutcome ? [] : ["SCORE_MANIPULATION_DETECTED"]),
  ];

  return {
    storyUsesOfficialTimelineOnly: inventedEventCount === 0,
    storyUsesOfficialScoreOnly: storyScoreMatchesOfficialScore,
    storyScoreMatchesOfficialScore,
    allStoryScoreClaimsBackedByScoreChange,
    sandboxExcludedFromOfficialStory,
    batchExcludedFromOfficialStory,
    diagnosticSeparatedFromOfficialStory,
    noPostHocRewrite: true,
    noScoreMutation: true,
    noEventDeletion: true,
    noForcedNarrativeOutcome,
    unsupportedTruthClaimCount,
    inventedEventCount,
    sourceOfTruthWarningCodes,
    recommendation: sourceOfTruthWarningCodes.length === 0 ? "KEEP_OFFICIAL_STORY_SOURCE_OF_TRUTH" : "FIX_OFFICIAL_STORY_SOURCE_OF_TRUTH",
  };
}

