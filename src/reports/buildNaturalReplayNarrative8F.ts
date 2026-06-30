import type { EventId, SequenceId, TeamId } from "../core/ids";
import type { OfficialMatchReplayTimeline } from "./matchStorylineImmersionTypes";
import type { ReplayActorMappingFix } from "./fixReplayActorMappingFrom8D";

export interface NaturalReplayNarrativeLine {
  readonly lineId: string;
  readonly replayMomentId: string;
  readonly minute: string;
  readonly scoreBefore: string;
  readonly scoreAfter: string;
  readonly teamId: TeamId;
  readonly actorLabel: string;
  readonly roleLabel: string;
  readonly roleFunctionLabel: string;
  readonly zoneLabel: string;
  readonly actionEffectLabel: string;
  readonly naturalText: string;
  readonly proofNote: string;
  readonly limitationNote: string;
  readonly evidenceEventIds: readonly EventId[];
  readonly confidence: "low" | "medium" | "high";
  readonly hasTechnicalIdLeak: boolean;
  readonly hasGuardrailPhraseLeak: boolean;
  readonly hasMechanicalPhrase: boolean;
  readonly hasUnsupportedClaim: boolean;
}

export interface ReplayProofNote {
  readonly proofNoteId: string;
  readonly replayMomentId: string;
  readonly compactProofText: string;
  readonly officialEventIds: readonly EventId[];
  readonly sequenceId: SequenceId;
  readonly scoreChangeBacked: boolean;
  readonly limitationText: string;
  readonly visibleInCoachMainText: boolean;
  readonly visibleInDetails: boolean;
}

export interface NaturalReplayNarrative8F {
  readonly shortNaturalReplayNarrative: string;
  readonly detailedNaturalReplayNarrative: string;
  readonly coachReplaySummary: string;
  readonly replayMomentLines: readonly NaturalReplayNarrativeLine[];
  readonly replayProofNotes: readonly ReplayProofNote[];
}

function actionEffect(scoreBefore: string, scoreAfter: string): string {
  return scoreBefore === scoreAfter ? "stabilise le contexte" : "change le score";
}

function hasTechnicalLeak(text: string): boolean {
  return /\b(?:rc-|event-|full-match-|score_created|fatigue_visible|goalkeeper_free_safety)\b/iu.test(text);
}

function hasGuardrailLeak(text: string): boolean {
  return /deuxieme source de verite|source-of-truth|sans creer|donne une cle de lecture claire/iu.test(text);
}

function hasMechanicalPhrase(text: string): boolean {
  return /il relie une sequence officielle|la sequence .* laisse le score|couvre comme gardien-libero|score_created|fatigue_visible/iu.test(text);
}

export function buildNaturalReplayNarrative8F(input: {
  readonly timeline: OfficialMatchReplayTimeline;
  readonly actorMappings: readonly ReplayActorMappingFix[];
  readonly officialScoreChangeEventIds: readonly EventId[];
}): NaturalReplayNarrative8F {
  const mappingByMoment = new Map(input.actorMappings.map((mapping) => [mapping.replayMomentId, mapping]));
  const scoreChangeEventIds = new Set(input.officialScoreChangeEventIds);
  const replayMomentLines = input.timeline.replayMoments.map((moment, index): NaturalReplayNarrativeLine => {
    const mapping = mappingByMoment.get(moment.momentId);
    const actorLabel = mapping?.correctedPlayerLabel ?? moment.actorLabel;
    const roleLabel = mapping?.correctedRoleLabel ?? moment.roleLabel;
    const roleFunctionLabel = mapping?.correctedRoleFunction ?? "fonction officielle limitee";
    const naturalText = moment.coachReplayText;
    const proofNote = moment.scoreBefore === moment.scoreAfter
      ? "Preuve compacte: moment officiel sans score_change."
      : `Preuve compacte: score_change ${moment.scoreBefore} vers ${moment.scoreAfter}.`;

    return {
      lineId: `8f-line-${index + 1}`,
      replayMomentId: moment.momentId,
      minute: moment.minuteLabel,
      scoreBefore: moment.scoreBefore,
      scoreAfter: moment.scoreAfter,
      teamId: moment.teamId,
      actorLabel,
      roleLabel,
      roleFunctionLabel,
      zoneLabel: moment.zoneLabel,
      actionEffectLabel: actionEffect(moment.scoreBefore, moment.scoreAfter),
      naturalText,
      proofNote,
      limitationNote: moment.limitationNote,
      evidenceEventIds: moment.evidenceEventIds,
      confidence: moment.confidence,
      hasTechnicalIdLeak: hasTechnicalLeak(naturalText),
      hasGuardrailPhraseLeak: hasGuardrailLeak(naturalText),
      hasMechanicalPhrase: hasMechanicalPhrase(naturalText),
      hasUnsupportedClaim: moment.evidenceEventIds.length === 0,
    };
  });
  const replayProofNotes = input.timeline.replayMoments.map((moment, index): ReplayProofNote => ({
    proofNoteId: `8f-proof-${index + 1}`,
    replayMomentId: moment.momentId,
    compactProofText: moment.scoreSourceNote,
    officialEventIds: moment.evidenceEventIds,
    sequenceId: moment.sequenceId,
    scoreChangeBacked: moment.scoreBefore === moment.scoreAfter || moment.evidenceEventIds.some((eventId) => scoreChangeEventIds.has(eventId)),
    limitationText: moment.limitationNote,
    visibleInCoachMainText: false,
    visibleInDetails: true,
  }));
  const scoringLines = replayMomentLines.filter((line) => line.scoreBefore !== line.scoreAfter);
  const shortNaturalReplayNarrative = scoringLines
    .slice(0, 3)
    .map((line) => line.naturalText)
    .join(" ");
  const detailedNaturalReplayNarrative = replayMomentLines.map((line) => line.naturalText).join(" ");

  return {
    shortNaturalReplayNarrative,
    detailedNaturalReplayNarrative,
    coachReplaySummary: `Replay fonde sur ${input.timeline.replayMoments.length} moments officiels; les preuves detaillees restent en annexe.`,
    replayMomentLines,
    replayProofNotes,
  };
}
