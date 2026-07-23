import type { EventId, SequenceId, TeamId } from "../core/ids";
import { buildCoachReplayUXViewFromTimeline } from "./buildCoachReplayUXIteration8G";
import type { OfficialCoachReplayMoment, OfficialMatchReplayTimeline } from "./matchStorylineImmersionTypes";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function eventId(value: string): EventId {
  return value as EventId;
}

function sequenceId(value: string): SequenceId {
  return value as SequenceId;
}

function teamId(value: string): TeamId {
  return value as TeamId;
}

function moment(input: {
  readonly momentId: string;
  readonly momentType: OfficialCoachReplayMoment["momentType"];
  readonly scoreBefore: string;
  readonly scoreAfter: string;
  readonly teamId: TeamId;
  readonly teamLabel: string;
  readonly title: string;
  readonly evidenceEventIds: readonly EventId[];
}): OfficialCoachReplayMoment {
  return {
    momentId: input.momentId,
    momentType: input.momentType,
    sequenceId: sequenceId(`seq-${input.momentId}`),
    minuteLabel: "42'",
    title: input.title,
    scoreBefore: input.scoreBefore,
    scoreAfter: input.scoreAfter,
    teamId: input.teamId,
    teamLabel: input.teamLabel,
    actorLabel: "Ari",
    roleLabel: "Playmaker",
    zoneLabel: "Z3-C",
    coachReplayText: `${input.teamLabel} moment lisible depuis la timeline officielle.`,
    whyItMatters: "Moment officiel utile pour le coach.",
    scoreSourceNote: "Score officiel.",
    evidenceEventIds: input.evidenceEventIds,
    evidenceSequenceIds: [sequenceId(`seq-${input.momentId}`)],
    sourceBadge: "official",
    confidence: "high",
    limitationNote: "Aucune limite.",
  };
}

const replay: OfficialMatchReplayTimeline = {
  matchId: "review-fix-non-fixture",
  officialScore: "ALPHA 9 - 7 OMEGA",
  scope: "MATCH_STORYLINE_IMMERSION_COACH_REPLAY_VIEW",
  version: "MATCH_STORYLINE_IMMERSION_COACH_REPLAY_VIEW_8E",
  baselineVersion: "PLAYER_ROLE_CAUSALITY_SEQUENCE_LEVEL_STORY_UPGRADE_8D",
  replayMoments: [
    moment({
      momentId: "first",
      momentType: "first_score",
      scoreBefore: "ALPHA 0 - 0 OMEGA",
      scoreAfter: "ALPHA 3 - 0 OMEGA",
      teamId: teamId("alpha"),
      teamLabel: "ALPHA",
      title: "ALPHA ouvre",
      evidenceEventIds: [eventId("score-alpha-1")],
    }),
    moment({
      momentId: "context",
      momentType: "fatigue_visible",
      scoreBefore: "ALPHA 3 - 0 OMEGA",
      scoreAfter: "ALPHA 3 - 0 OMEGA",
      teamId: teamId("omega"),
      teamLabel: "OMEGA",
      title: "Contexte OMEGA",
      evidenceEventIds: [eventId("context-1")],
    }),
    moment({
      momentId: "response",
      momentType: "score_response",
      scoreBefore: "ALPHA 3 - 0 OMEGA",
      scoreAfter: "ALPHA 3 - 7 OMEGA",
      teamId: teamId("omega"),
      teamLabel: "OMEGA",
      title: "OMEGA repond dans le match",
      evidenceEventIds: [eventId("score-omega-1")],
    }),
    moment({
      momentId: "lock",
      momentType: "final_score_lock",
      scoreBefore: "ALPHA 3 - 7 OMEGA",
      scoreAfter: "ALPHA 9 - 7 OMEGA",
      teamId: teamId("alpha"),
      teamLabel: "ALPHA",
      title: "ALPHA finit",
      evidenceEventIds: [eventId("score-alpha-2")],
    }),
  ],
  storylineChapters: [],
  scoreSourceNote: "Score officiel.",
  replayLimitations: [],
  officialEventIdsCovered: [eventId("score-alpha-1"), eventId("context-1"), eventId("score-omega-1"), eventId("score-alpha-2")],
  officialSequenceIdsCovered: [sequenceId("seq-first"), sequenceId("seq-context"), sequenceId("seq-response"), sequenceId("seq-lock")],
  rawEventIdsHiddenFromCoachCopy: true,
  canMutateTimeline: false,
  canMutateScore: false,
  canCreateScoringEvent: false,
};

const view = buildCoachReplayUXViewFromTimeline({
  replay,
  officialScoreChangeEventIds: [eventId("score-alpha-1"), eventId("score-omega-1"), eventId("score-alpha-2")],
});

const priorityReasons = view.priorityMoments.map((priorityMoment) => priorityMoment.priorityReason);
const contextCard = view.momentCards.find((card) => card.replayMomentId === "context");

assertTest(priorityReasons.includes("opponent_response"), "non-fixture score response must be selected as opponent response.");
assertTest(view.priorityMoments.some((priorityMoment) => priorityMoment.title === "OMEGA repond"), "response title must derive from the supplied moment team.");
assertTest(view.priorityMoments.some((priorityMoment) => priorityMoment.title === "ALPHA verrouille le ALPHA 9 - 7 OMEGA"), "final-lock title must derive from the supplied score.");
assertTest(contextCard?.sourceBadge === "official_context", "unchanged-score replay moments must remain official context.");
assertTest(!view.timelineRail.timelineNarrative.includes("CONTROL") && !view.timelineRail.timelineNarrative.includes("BLITZ"), "timeline narrative must not hard-code fixture teams.");

console.log("Coach replay UX iteration review fix validation passed.");
