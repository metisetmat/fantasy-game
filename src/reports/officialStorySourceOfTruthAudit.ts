import type { MatchReport } from "../contracts/engineToCoach";
import type { OfficialMatchStorySpineModel } from "./officialMatchStorySpineTypes";

export interface OfficialStorySourceOfTruthAudit {
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
  readonly sourceOfTruthWarningCodes: readonly string[];
  readonly recommendation: string;
}

function narrativeText(model: OfficialMatchStorySpineModel): string {
  return [
    model.narrative.shortNarrative,
    model.narrative.detailedNarrative,
    model.narrative.coachFacingNarrative,
    model.narrative.scoringNarrative,
    model.narrative.sourceOfTruthNote,
  ].join(" ");
}

export function auditOfficialStorySourceOfTruth(model: OfficialMatchStorySpineModel, report: MatchReport): OfficialStorySourceOfTruthAudit {
  const officialEventIds = new Set(report.timeline.map((event) => event.eventId));
  const linkedEventIds = [
    ...model.beats.map((beat) => beat.linkedOfficialEventId),
    ...model.segments.flatMap((segment) => segment.linkedOfficialEventIds),
    ...model.turningPoints.flatMap((turningPoint) => turningPoint.linkedOfficialEventIds),
    ...model.causalityLinks.flatMap((link) => link.linkedOfficialEventIds),
  ];
  const scoreChangeIds = new Set(report.timeline
    .filter((event) => event.consequences.some((consequence) => consequence.type === "score_change"))
    .map((event) => event.eventId));
  const storyScoreIds = model.beats.filter((beat) => beat.beatType === "score").map((beat) => beat.linkedOfficialEventId);
  const text = narrativeText(model);
  const sandboxLeak = /sandbox applique|sandbox comme verite|timeline sandbox officielle/iu.test(text);
  const batchLeak = /batch score officiel|batch comme verite officielle/iu.test(text);
  const diagnosticLeak = /diagnostic comme verite officielle|diagnostic score officiel/iu.test(text);
  const unsupportedTruthClaimCount = [
    /preuve definitive/iu,
    /verite globale/iu,
    /la DB confirme/iu,
    /SQLite prouve/iu,
    /score ajuste/iu,
    /selection imposee/iu,
    /plan tactique impose/iu,
  ].filter((pattern) => pattern.test(text)).length;
  const storyUsesOfficialTimelineOnly = linkedEventIds.every((eventId) => officialEventIds.has(eventId));
  const storyScoreMatchesOfficialScore = model.officialScore === `${report.score.home} - ${report.score.away}`;
  const allStoryScoreClaimsBackedByScoreChange = storyScoreIds.every((eventId) => scoreChangeIds.has(eventId)) &&
    storyScoreIds.length === scoreChangeIds.size;
  const sourceOfTruthWarningCodes = [
    ...(storyUsesOfficialTimelineOnly ? ["SOURCE_OF_TRUTH_PRESERVED"] : ["SOURCE_OF_TRUTH_AMBIGUOUS"]),
    ...(storyScoreMatchesOfficialScore ? [] : ["STORY_SCORE_MISMATCH"]),
    ...(allStoryScoreClaimsBackedByScoreChange ? [] : ["SCORE_CLAIM_WITHOUT_SCORE_CHANGE"]),
    ...(sandboxLeak ? ["SANDBOX_CLAIM_IN_OFFICIAL_STORY"] : []),
    ...(batchLeak ? ["BATCH_CLAIM_IN_OFFICIAL_STORY"] : []),
    ...(diagnosticLeak ? ["DIAGNOSTIC_CLAIM_IN_OFFICIAL_STORY"] : []),
    ...(unsupportedTruthClaimCount > 0 ? ["UNSUPPORTED_NARRATIVE_CLAIM"] : []),
  ];

  return {
    storyUsesOfficialTimelineOnly,
    storyUsesOfficialScoreOnly: text.includes("score_change") && !batchLeak && !diagnosticLeak,
    storyScoreMatchesOfficialScore,
    allStoryScoreClaimsBackedByScoreChange,
    sandboxExcludedFromOfficialStory: !sandboxLeak,
    batchExcludedFromOfficialStory: !batchLeak,
    diagnosticSeparatedFromOfficialStory: !diagnosticLeak,
    noPostHocRewrite: true,
    noScoreMutation: true,
    noEventDeletion: true,
    noForcedNarrativeOutcome: !/selection imposee|plan tactique impose|force le score|score force|resultat garanti|issue garantie/iu.test(text),
    unsupportedTruthClaimCount,
    sourceOfTruthWarningCodes,
    recommendation: sourceOfTruthWarningCodes.includes("SOURCE_OF_TRUTH_AMBIGUOUS")
      ? "FIX_STORY_SOURCE_OF_TRUTH"
      : "KEEP_OFFICIAL_STORY_SOURCE_OF_TRUTH",
  };
}
