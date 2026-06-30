import type { EventId, PlayerId, SequenceId, TeamId } from "../core/ids";
import type {
  OfficialMatchSequenceCausality,
  OfficialSequenceContributionEffect,
  OfficialSequenceRoleFunction,
} from "./officialPlayerRoleSequenceCausalityTypes";
import type {
  OfficialCoachReplayMoment,
  OfficialCoachReplayMomentType,
  OfficialMatchReplayTimeline,
  OfficialMatchStorylineChapter,
  OfficialMatchStorylineChapterType,
  ReplayWordingTransform,
  ReplayWordingTransformType,
} from "./matchStorylineImmersionTypes";

export interface CoachReplayBuildResult {
  readonly timeline: OfficialMatchReplayTimeline;
  readonly transforms: readonly ReplayWordingTransform[];
}

function teamLabel(teamId: TeamId): string {
  return String(teamId).toUpperCase();
}

function roleLabel(role: string): string {
  const labels: Record<string, string> = {
    goalkeeper_free_safety: "gardien-libero",
    tempo_half: "tempo half",
    hook_link: "hook link",
    forward_leader: "leader axial",
    mobile_lock: "verrou mobile",
    space_hunter: "chasseur d'espace",
    playmaker: "playmaker",
    pivot: "pivot",
    left_piston: "piston gauche",
    right_piston: "piston droit",
  };
  return labels[role] ?? role.replace(/_/gu, " ");
}

function playerLabel(playerId: PlayerId, teamId: TeamId, role: string): string {
  const known: Record<string, string> = {
    "control-gk": "le gardien-libero de CONTROL",
    "blitz-gk": "le gardien-libero de BLITZ",
    "rc-ml": "Mobile Lock",
    "rc-lp": "Left Piston",
    "rc-pm": "Playmaker",
    "rc-sh": "Space Hunter",
  };
  return known[String(playerId)] ?? `${roleLabel(role)} de ${teamLabel(teamId)}`;
}

function zoneLabel(zones: readonly string[]): string {
  const first = zones[0];
  if (first === undefined) return "zone non isolee";
  if (first.includes("-C")) return "axe central";
  if (first.includes("-HSL") || first.includes("-HL")) return "couloir gauche haut";
  if (first.includes("-HSR") || first.includes("-HR")) return "couloir droit haut";
  if (first.includes("-L")) return "cote gauche";
  if (first.includes("-R")) return "cote droit";
  return "zone mediane";
}

function effectLabel(effect: OfficialSequenceContributionEffect | string): string {
  const labels: Record<string, string> = {
    score_created: "cree le score officiel",
    danger_created: "cree la menace",
    possession_secured: "securise la possession",
    turnover_created: "provoque la recuperation",
    pressure_absorbed: "absorbe la pression",
    pressure_created: "installe la pression",
    defensive_stop: "eteint l'action adverse",
    goalkeeper_action: "intervient comme dernier repere",
    fatigue_visible: "montre une fatigue visible",
    support_missing: "laisse un soutien insuffisant",
    no_direct_effect: "reste observe sans effet direct",
  };
  return labels[effect] ?? String(effect).replace(/_/gu, " ");
}

function roleFunctionLabel(roleFunction: OfficialSequenceRoleFunction | string): string {
  const labels: Record<string, string> = {
    tempo_setter: "pose le rythme",
    central_reconnector: "reconnecte l'axe",
    progression_carrier: "fait progresser",
    support_runner: "soutient la course",
    space_attacker: "attaque l'espace",
    defensive_screen: "protege l'axe",
    pressure_creator: "declenche la pression",
    pressure_receiver: "subit la pression",
    goalkeeper_free_safety: "couvre comme gardien-libero",
    second_ball_presence: "se place sur le second ballon",
    rest_defense_anchor: "stabilise la rest-defense",
    unknown_official_actor: "acteur officiel non specialise",
  };
  return labels[roleFunction] ?? String(roleFunction).replace(/_/gu, " ");
}

function momentType(sequence: OfficialMatchSequenceCausality, index: number, total: number): OfficialCoachReplayMomentType {
  if (index === total - 1 && sequence.scoreDelta !== "0") return "final_score_lock";
  if (sequence.sequenceType === "fatigue_exposure_sequence" || sequence.observedEffect.includes("fatigue")) return "fatigue_visible";
  if (sequence.sequenceType === "goalkeeper_sequence") return "goalkeeper_intervention";
  if (sequence.scoreBefore !== sequence.scoreAfter && index === 0) return "first_score";
  if (sequence.scoreBefore !== sequence.scoreAfter) return "score_response";
  return "pressure_escape";
}

function momentTitle(type: OfficialCoachReplayMomentType, sequence: OfficialMatchSequenceCausality): string {
  if (type === "first_score") return `${teamLabel(sequence.teamId)} frappe le premier`;
  if (type === "score_response") return `${teamLabel(sequence.teamId)} change le score`;
  if (type === "fatigue_visible") return `La fatigue devient visible chez ${teamLabel(sequence.teamId)}`;
  if (type === "goalkeeper_intervention") return `Le dernier repere de ${teamLabel(sequence.teamId)} pese`;
  if (type === "final_score_lock") return `${teamLabel(sequence.teamId)} verrouille la fin`;
  return `${teamLabel(sequence.teamId)} sort de la pression`;
}

function whyItMatters(type: OfficialCoachReplayMomentType, sequence: OfficialMatchSequenceCausality): string {
  if (type === "fatigue_visible") {
    return "Ce moment aide le coach a relire la stabilite et le soutien, sans conclure qu'un joueur est responsable seul.";
  }
  if (sequence.scoreBefore !== sequence.scoreAfter) {
    return `Il relie une sequence officielle au score ${sequence.scoreAfter}, sans creer une deuxieme source de verite.`;
  }
  return "Il explique une respiration tactique entre deux scores et garde la causalite limitee aux evenements officiels.";
}

function scoreSourceNote(sequence: OfficialMatchSequenceCausality): string {
  return sequence.scoreBefore === sequence.scoreAfter
    ? "Aucun score ajoute dans ce moment; la lecture reste contextuelle."
    : `Score officiel lu depuis les score_change: ${sequence.scoreBefore} vers ${sequence.scoreAfter}.`;
}

function transform(
  type: ReplayWordingTransformType,
  rawValue: string,
  coachValue: string,
  sequenceId?: SequenceId,
  eventId?: EventId,
): ReplayWordingTransform {
  return {
    transformId: `8e-transform-${type}-${rawValue}`.replace(/[^a-z0-9_-]+/giu, "-").toLowerCase(),
    transformType: type,
    rawValue,
    coachValue,
    ...(sequenceId === undefined ? {} : { sourceSequenceId: sequenceId }),
    ...(eventId === undefined ? {} : { sourceEventId: eventId }),
    safeForCoachCopy: true,
    reason: "raw official evidence is kept as proof while coach copy uses a readable label",
  };
}

function buildMoment(sequence: OfficialMatchSequenceCausality, index: number, total: number): OfficialCoachReplayMoment {
  const actor = sequence.actorChain[0];
  const role = actor?.role ?? sequence.roleChain.rolesInOrder[0] ?? "official_actor";
  const player = actor?.playerId ?? sequence.roleChain.playersInOrder[0] ?? `${sequence.teamId}-actor` as PlayerId;
  const type = momentType(sequence, index, total);
  const effect = actor?.contributionEffect ?? sequence.observedEffect;
  const roleFunction = actor?.roleFunction ?? sequence.tacticalFunctionChain[0] ?? "unknown_official_actor";
  const actorCoachLabel = playerLabel(player, sequence.teamId, role);
  const roleCoachLabel = roleLabel(role);
  const zoneCoachLabel = zoneLabel(sequence.zoneChain);
  const effectCoachLabel = effectLabel(effect);
  const functionCoachLabel = roleFunctionLabel(roleFunction);

  return {
    momentId: `8e-moment-${index + 1}`,
    momentType: type,
    sequenceId: sequence.sequenceId,
    minuteLabel: `${sequence.minuteStart}-${sequence.minuteEnd}'`,
    title: momentTitle(type, sequence),
    scoreBefore: sequence.scoreBefore,
    scoreAfter: sequence.scoreAfter,
    teamId: sequence.teamId,
    teamLabel: teamLabel(sequence.teamId),
    actorLabel: actorCoachLabel,
    roleLabel: roleCoachLabel,
    zoneLabel: zoneCoachLabel,
    coachReplayText: `${actorCoachLabel} ${functionCoachLabel} dans ${zoneCoachLabel}; la sequence ${effectCoachLabel} et laisse le score a ${sequence.scoreAfter}.`,
    whyItMatters: whyItMatters(type, sequence),
    scoreSourceNote: scoreSourceNote(sequence),
    evidenceEventIds: sequence.linkedOfficialEventIds,
    evidenceSequenceIds: [sequence.sequenceId],
    sourceBadge: sequence.limitationNote.length > 0 ? "official_with_limitation" : "official",
    confidence: sequence.confidence,
    limitationNote: sequence.limitationNote,
  };
}

function chapterType(moment: OfficialCoachReplayMoment, index: number, total: number): OfficialMatchStorylineChapterType {
  if (index === 0) return "opening_pressure";
  if (moment.momentType === "first_score") return "first_score";
  if (moment.momentType === "score_response") return "response_window";
  if (moment.momentType === "fatigue_visible") return "fatigue_turn";
  if (index === total - 1) return "closing_sequence";
  return "response_window";
}

function buildChapters(moments: readonly OfficialCoachReplayMoment[]): readonly OfficialMatchStorylineChapter[] {
  return moments.slice(0, 5).map((moment, index) => ({
    chapterId: `8e-chapter-${index + 1}`,
    chapterType: chapterType(moment, index, moments.length),
    title: moment.title,
    minuteRange: moment.minuteLabel,
    scoreRange: `${moment.scoreBefore} -> ${moment.scoreAfter}`,
    chapterNarrative: `${moment.title}: ${moment.actorLabel} donne une cle de lecture claire, avec un score source ${moment.scoreAfter}.`,
    coachMeaning: moment.whyItMatters,
    linkedReplayMomentIds: [moment.momentId],
    linkedOfficialEventIds: moment.evidenceEventIds,
    sourceBadge: moment.sourceBadge,
    limitationNote: moment.limitationNote,
  }));
}

function buildTransforms(sequences: readonly OfficialMatchSequenceCausality[], moments: readonly OfficialCoachReplayMoment[]): readonly ReplayWordingTransform[] {
  const transforms: ReplayWordingTransform[] = [];
  sequences.forEach((sequence, index) => {
    const moment = moments[index];
    const actor = sequence.actorChain[0];
    const eventId = sequence.linkedOfficialEventIds[0];
    if (moment === undefined) return;
    if (actor !== undefined) {
      transforms.push(transform("player", actor.playerId, moment.actorLabel, sequence.sequenceId, eventId));
      transforms.push(transform("role", actor.role, moment.roleLabel, sequence.sequenceId, eventId));
      transforms.push(transform("effect", actor.contributionEffect, effectLabel(actor.contributionEffect), sequence.sequenceId, eventId));
    }
    if (sequence.zoneChain[0] !== undefined) {
      transforms.push(transform("zone", sequence.zoneChain[0], moment.zoneLabel, sequence.sequenceId, eventId));
    }
    transforms.push(transform("event", sequence.sequenceId, moment.title, sequence.sequenceId, eventId));
    transforms.push(transform("limitation", sequence.limitationNote, "lecture bornee aux evenements officiels", sequence.sequenceId, eventId));
  });
  return transforms;
}

export function buildCoachReplayView(input: {
  readonly matchId: string;
  readonly officialScore: string;
  readonly sequences: readonly OfficialMatchSequenceCausality[];
}): CoachReplayBuildResult {
  const selectedSequences = input.sequences.slice(0, 7);
  const replayMoments = selectedSequences.map((sequence, index) => buildMoment(sequence, index, selectedSequences.length));
  const storylineChapters = buildChapters(replayMoments);
  const officialEventIdsCovered = [...new Set(replayMoments.flatMap((moment) => moment.evidenceEventIds))];
  const officialSequenceIdsCovered = [...new Set(replayMoments.flatMap((moment) => moment.evidenceSequenceIds))];
  const timeline: OfficialMatchReplayTimeline = {
    matchId: input.matchId,
    officialScore: input.officialScore,
    scope: "MATCH_STORYLINE_IMMERSION_COACH_REPLAY_VIEW",
    version: "MATCH_STORYLINE_IMMERSION_COACH_REPLAY_VIEW_8E",
    baselineVersion: "PLAYER_ROLE_CAUSALITY_SEQUENCE_LEVEL_STORY_UPGRADE_8D",
    replayMoments,
    storylineChapters,
    scoreSourceNote: "Le replay lit uniquement le score officiel et les evenements officiels; il ne cree aucun score_change.",
    replayLimitations: [
      "Les libelles coach simplifient les identifiants techniques mais les preuves restent conservees dans le rapport de validation.",
      "Une sequence sans changement de score explique le contexte, pas une cause de score inventee.",
    ],
    officialEventIdsCovered,
    officialSequenceIdsCovered,
    rawEventIdsHiddenFromCoachCopy: true,
    canMutateTimeline: false,
    canMutateScore: false,
    canCreateScoringEvent: false,
  };

  return {
    timeline,
    transforms: buildTransforms(selectedSequences, replayMoments),
  };
}
