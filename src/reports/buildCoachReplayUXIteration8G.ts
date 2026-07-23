import type { EventId } from "../core/ids";
import type { OfficialCoachReplayMoment, OfficialMatchReplayTimeline } from "./matchStorylineImmersionTypes";
import type {
  CoachReplayEvidenceDisclosure,
  CoachReplayMomentCardUX,
  CoachReplayPriorityMoment,
  CoachReplayPriorityReason8G,
  CoachReplayTimelineRailMoment,
  CoachReplayUXIterationView8G,
  CoachReplayUXSourceBadge8G,
  CoachReplayVisualState8G,
} from "./coachReplayUXIterationTypes8G";

function scoreChanged(moment: OfficialCoachReplayMoment): boolean {
  return moment.scoreBefore !== moment.scoreAfter;
}

function replayScoreLabel(moment: OfficialCoachReplayMoment): string {
  return `${moment.scoreBefore} -> ${moment.scoreAfter}`;
}

function titleFor(moment: OfficialCoachReplayMoment): string {
  if (moment.momentType === "first_score") return `${moment.teamLabel} frappe le premier`;
  if (moment.momentType === "fatigue_visible") return `Fatigue visible chez ${moment.teamLabel}`;
  if (moment.momentType === "score_response") return `${moment.teamLabel} repond`;
  if (moment.momentType === "final_score_lock") return `${moment.teamLabel} verrouille le ${moment.scoreAfter}`;
  if (scoreChanged(moment) && /\b6\s*-\s*0\b/u.test(moment.scoreAfter)) return `${moment.teamLabel} creuse l'ecart`;
  if (scoreChanged(moment)) return `${moment.teamLabel} change le score`;
  return moment.title;
}

function priorityReason(moment: OfficialCoachReplayMoment): CoachReplayPriorityReason8G {
  if (moment.momentType === "first_score") return "first_score";
  if (moment.momentType === "score_response") return "opponent_response";
  if (moment.momentType === "final_score_lock") return "final_lock";
  if (moment.momentType === "fatigue_visible") return "fatigue_context";
  if (scoreChanged(moment)) return "lead_change";
  return "danger_context";
}

function visualState(moment: OfficialCoachReplayMoment): CoachReplayVisualState8G {
  if (moment.momentType === "fatigue_visible") return "fatigue_context";
  if (moment.momentType === "score_response") return "response";
  if (moment.momentType === "final_score_lock") return "final_lock";
  return scoreChanged(moment) ? "score_change" : "context";
}

function sourceBadge(moment: OfficialCoachReplayMoment, scoreChangeBacked: boolean): CoachReplayUXSourceBadge8G {
  if (scoreChanged(moment) && scoreChangeBacked) return "official_score_change";
  return moment.sourceBadge === "official_with_limitation" ? "official_with_limitation" : "official_context";
}

function scoreChangeBacked(moment: OfficialCoachReplayMoment, scoreChangeEventIds: ReadonlySet<EventId>): boolean {
  return scoreChanged(moment) && moment.evidenceEventIds.some((eventId) => scoreChangeEventIds.has(eventId));
}

function compactProof(moment: OfficialCoachReplayMoment, backed: boolean): string {
  if (!scoreChanged(moment)) {
    return "Preuve officielle: contexte conserve sans causalite forcee.";
  }
  return backed
    ? `Preuve officielle: ${moment.scoreBefore} vers ${moment.scoreAfter}.`
    : "Preuve officielle manquante; a revoir.";
}

function coachRead(moment: OfficialCoachReplayMoment): string {
  return moment.coachReplayText.replace(/\s+/gu, " ").trim();
}

function whyItMatters(moment: OfficialCoachReplayMoment): string {
  if (moment.momentType === "first_score") return "Le match prend sa premiere direction et fixe le premier rapport de force.";
  if (moment.momentType === "score_response") return `La reponse de ${moment.teamLabel} change la pression de fin.`;
  if (moment.momentType === "final_score_lock") return `${moment.teamLabel} ferme le match avec le dernier score officiel.`;
  if (moment.momentType === "fatigue_visible") return "Signal de contexte: utile pour lire la stabilite, sans surinterpretion causale.";
  return "Moment utile pour relire la zone et l'acteur qui structurent la sequence.";
}

function selectPriorityMoments(moments: readonly OfficialCoachReplayMoment[]): readonly OfficialCoachReplayMoment[] {
  const firstScore = moments.find((moment) => moment.momentType === "first_score");
  const response = moments.find((moment) => moment.momentType === "score_response");
  const finalLock = [...moments].reverse().find((moment) => moment.momentType === "final_score_lock" || scoreChanged(moment));
  return [firstScore, response, finalLock]
    .filter((moment, index, selected): moment is OfficialCoachReplayMoment =>
      moment !== undefined && selected.findIndex((candidate) => candidate?.momentId === moment.momentId) === index
    )
    .slice(0, 3);
}

function toTimelineRailMoment(moment: OfficialCoachReplayMoment): CoachReplayTimelineRailMoment {
  return {
    replayMomentId: moment.momentId,
    minuteLabel: moment.minuteLabel,
    scoreLabel: replayScoreLabel(moment),
    title: titleFor(moment),
    teamId: moment.teamId,
    visualState: visualState(moment),
  };
}

export function buildCoachReplayUXViewFromTimeline(input: {
  readonly replay: OfficialMatchReplayTimeline;
  readonly officialScoreChangeEventIds: readonly EventId[];
}): CoachReplayUXIterationView8G {
  const scoreChangeEventIds = new Set(input.officialScoreChangeEventIds);
  const priorityReplayMoments = selectPriorityMoments(input.replay.replayMoments);
  const priorityMomentIds = new Set(priorityReplayMoments.map((moment) => moment.momentId));
  const priorityMoments: readonly CoachReplayPriorityMoment[] = priorityReplayMoments.map((moment, index) => {
    const backed = scoreChangeBacked(moment, scoreChangeEventIds);
    return {
      priorityMomentId: `8g-priority-${index + 1}`,
      replayMomentId: moment.momentId,
      minute: moment.minuteLabel,
      scoreBefore: moment.scoreBefore,
      scoreAfter: moment.scoreAfter,
      title: titleFor(moment),
      priorityLevel: "primary",
      priorityReason: priorityReason(moment),
      teamId: moment.teamId,
      actorLabel: moment.actorLabel,
      roleLabel: moment.roleLabel,
      zoneLabel: moment.zoneLabel,
      oneSentenceCoachRead: coachRead(moment),
      proofSummary: compactProof(moment, backed),
      limitationSummary: moment.limitationNote,
      evidenceEventIds: moment.evidenceEventIds,
      scoreChangeBacked: backed,
      confidence: moment.confidence,
    };
  });
  const momentCards: readonly CoachReplayMomentCardUX[] = input.replay.replayMoments.map((moment, index) => {
    const backed = scoreChangeBacked(moment, scoreChangeEventIds);
    const isPriority = priorityMomentIds.has(moment.momentId);
    const state = visualState(moment);
    return {
      cardId: `8g-card-${index + 1}`,
      replayMomentId: moment.momentId,
      displayIndex: index + 1,
      priorityLevel: isPriority ? "primary" : "context",
      minuteLabel: moment.minuteLabel,
      scoreLabel: replayScoreLabel(moment),
      title: titleFor(moment),
      subtitle: isPriority ? "Moment structurant" : "Contexte replay",
      teamBadge: moment.teamLabel,
      actorRoleLine: `${moment.actorLabel} / ${moment.roleLabel}`,
      zoneLine: moment.zoneLabel,
      coachReadLine: coachRead(moment),
      whyItMattersLine: whyItMatters(moment),
      limitationLine: moment.limitationNote,
      compactProofLine: compactProof(moment, backed),
      detailsProof: `Evenements officiels: ${moment.evidenceEventIds.join(", ")}. Sequence: ${moment.evidenceSequenceIds.join(", ")}.`,
      visualState: state,
      sourceBadge: sourceBadge(moment, backed),
      isCollapsedByDefault: true,
      isVisibleInProduct: true,
      isVisibleInExport: isPriority,
    };
  });
  const evidenceDisclosures: readonly CoachReplayEvidenceDisclosure[] = input.replay.replayMoments.map((moment, index) => {
    const backed = scoreChangeBacked(moment, scoreChangeEventIds);
    return {
      disclosureId: `8g-proof-${index + 1}`,
      replayMomentId: moment.momentId,
      proofSummary: compactProof(moment, backed),
      officialEventIds: moment.evidenceEventIds,
      sequenceId: moment.evidenceSequenceIds[0] ?? moment.sequenceId,
      scoreChangeBacked: backed,
      limitationText: moment.limitationNote,
      detailsCollapsedByDefault: true,
      appearsInMainText: false,
      appearsInExport: priorityMomentIds.has(moment.momentId),
    };
  });
  const timelineMoments = input.replay.replayMoments.map(toTimelineRailMoment);

  return {
    matchId: input.replay.matchId,
    officialScore: input.replay.officialScore,
    priorityMoments,
    timelineRail: {
      timelineRailId: "8g-timeline-rail",
      matchId: input.replay.matchId,
      officialScore: input.replay.officialScore,
      moments: timelineMoments,
      scoreMilestones: timelineMoments.filter((moment) => moment.visualState !== "context" && moment.visualState !== "fatigue_context"),
      contextMoments: timelineMoments.filter((moment) => moment.visualState === "context" || moment.visualState === "fatigue_context"),
      timelineNarrative: priorityMoments.length > 0
        ? `${priorityMoments.map((moment) => moment.title).join(", ")}.`
        : "Replay officiel disponible sans moment prioritaire supplementaire.",
      sourceOfTruthNote: "Replay fonde sur les evenements officiels du match; les preuves detaillees restent repliees.",
    },
    momentCards,
    evidenceDisclosures,
    globalSourceOfTruthNote: "Replay fonde sur les evenements officiels du match; les preuves detaillees restent repliees.",
    exportIntroLine: priorityMoments.length > 0
      ? `Moments structurants: ${priorityMoments.map((moment) => moment.title).join("; ")}.`
      : "Moments structurants issus de la timeline officielle.",
    productIntroLine: "Replay fonde sur les evenements officiels ; preuves detaillees repliees.",
  };
}
