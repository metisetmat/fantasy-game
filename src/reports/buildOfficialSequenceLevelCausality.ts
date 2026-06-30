import type { MatchEvent, PlayerSnapshot, TeamSnapshot } from "../contracts/engineToCoach";
import type { EventId, PlayerId, SequenceId, TeamId } from "../core/ids";
import type { ZoneId } from "../core/zones";
import type { PlayerAttributes } from "../models/player";
import { buildCoachReadableSequenceStory } from "./buildCoachReadableSequenceStory";
import type {
  OfficialMatchSequenceCausality,
  OfficialMatchSequenceCausalityType,
  OfficialPlayerRoleSequenceCausalityUpgrade8DInput,
  OfficialRoleFunctionChain,
  OfficialRoleFunctionChainPattern,
  OfficialSequenceActionRole,
  OfficialSequenceActorContribution,
  OfficialSequenceContributionEffect,
  OfficialSequenceFatigueEffect,
  OfficialSequenceFatigueObservedEffect,
  OfficialSequenceFatigueSignalType,
  OfficialSequenceRoleFunction,
} from "./officialPlayerRoleSequenceCausalityTypes";

function hasScoreChange(event: MatchEvent): boolean {
  return event.consequences.some((consequence) => consequence.type === "score_change");
}

function isDanger(event: MatchEvent): boolean {
  return hasScoreChange(event) ||
    event.eventType === "scoring" ||
    event.outcome === "score" ||
    event.tags.some((tag) => /danger|opportunity|shot|try|drop|score|scoring/iu.test(tag));
}

function isRecovery(event: MatchEvent): boolean {
  return event.eventType === "gain_possession" ||
    event.eventType === "turnover" ||
    event.tags.some((tag) => /recovery|turnover|second_ball|clearance/iu.test(tag));
}

function isStabilization(event: MatchEvent): boolean {
  return event.eventType === "progression" ||
    event.eventType === "tactical_shift" ||
    event.tags.some((tag) => /stabil|secure|reset|support|recycle|continuity/iu.test(tag));
}

function isFatigueSignal(event: MatchEvent): boolean {
  return event.eventType === "fatigue_error" ||
    event.fatigueContext.teamCondition < 72 ||
    (event.fatigueContext.primaryPlayerCondition ?? 100) < 68 ||
    (event.fatigueContext.primaryPlayerMentalFreshness ?? 100) < 68 ||
    (event.fatigueContext.fatiguePressure ?? 0) > 55 ||
    (event.fatigueContext.goalkeeperMentalFatigue ?? 0) > 35;
}

function eventPriority(event: MatchEvent): number {
  return (hasScoreChange(event) ? 100 : 0) +
    (isDanger(event) ? 35 : 0) +
    (isRecovery(event) ? 18 : 0) +
    (isFatigueSignal(event) ? 14 : 0) +
    event.narrativeWeight;
}

function scoreLabel(home: number, away: number): string {
  return `${home} - ${away}`;
}

function pointDelta(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function scoreStateBefore(report: { readonly timeline: readonly MatchEvent[] }, target: MatchEvent): string {
  let home = 0;
  let away = 0;
  for (const event of report.timeline) {
    if (event.eventId === target.eventId) break;
    const delta = pointDelta(event);
    if (delta === 0) continue;
    if (event.teamId === report.timeline[0]?.teamId) home += delta;
    else away += delta;
  }
  return scoreLabel(home, away);
}

function scoreStateAfter(report: { readonly timeline: readonly MatchEvent[] }, target: MatchEvent): string {
  const before = scoreStateBefore(report, target).split(" - ").map(Number);
  const homeBefore = before[0] ?? 0;
  const awayBefore = before[1] ?? 0;
  const delta = pointDelta(target);
  if (delta === 0) return scoreLabel(homeBefore, awayBefore);
  return target.teamId === report.timeline[0]?.teamId
    ? scoreLabel(homeBefore + delta, awayBefore)
    : scoreLabel(homeBefore, awayBefore + delta);
}

function sequenceType(event: MatchEvent): OfficialMatchSequenceCausalityType {
  if (hasScoreChange(event)) return "scoring_sequence";
  if (event.eventType === "goalkeeper_action") return "goalkeeper_sequence";
  if (event.eventType === "defensive_action") return "defensive_stop_sequence";
  if (isRecovery(event)) return "recovery_sequence";
  if (isFatigueSignal(event)) return "fatigue_exposure_sequence";
  if (isDanger(event)) return "danger_sequence";
  if (event.tacticalContext.pressureLevel === "high") return "pressure_sequence";
  if (isStabilization(event)) return "stabilization_sequence";
  return "possession_security_sequence";
}

function confidence(event: MatchEvent): "low" | "medium" | "high" {
  if (hasScoreChange(event) || event.narrativeWeight >= 80) return "high";
  if (event.narrativeWeight >= 45) return "medium";
  return "low";
}

function roleFunction(role: string, event: MatchEvent): OfficialSequenceRoleFunction {
  const normalized = role.toLocaleLowerCase("en-US");
  if (normalized.includes("goalkeeper")) return "goalkeeper_free_safety";
  if (normalized.includes("tempo") || normalized.includes("playmaker")) return "tempo_setter";
  if (normalized.includes("pivot") || normalized.includes("hook")) return "central_reconnector";
  if (normalized.includes("space")) return "space_attacker";
  if (normalized.includes("piston")) return "support_runner";
  if (normalized.includes("lock") || normalized.includes("leader")) return "rest_defense_anchor";
  if (event.tacticalContext.pressureLevel === "high") return "pressure_receiver";
  return "progression_carrier";
}

function actionRole(event: MatchEvent): OfficialSequenceActionRole {
  if (hasScoreChange(event)) return "finishes";
  if (event.eventType === "goalkeeper_action") return "saves";
  if (event.eventType === "defensive_action") return "defends";
  if (event.eventType === "turnover" || event.eventType === "gain_possession") return "recovers";
  if (event.tacticalContext.pressureLevel === "high") return "pressures";
  if (event.eventType === "progression") return "progresses";
  return "stabilizes";
}

function contributionEffect(event: MatchEvent): OfficialSequenceContributionEffect {
  if (hasScoreChange(event)) return "score_created";
  if (event.eventType === "goalkeeper_action") return "goalkeeper_action";
  if (event.eventType === "defensive_action") return "defensive_stop";
  if (event.eventType === "turnover") return "turnover_created";
  if (isFatigueSignal(event)) return "fatigue_visible";
  if (isDanger(event)) return "danger_created";
  if (event.tacticalContext.pressureLevel === "high") return "pressure_created";
  return "possession_secured";
}

function attributeNames(player: PlayerSnapshot | undefined, event: MatchEvent): readonly (keyof PlayerAttributes)[] {
  if (player === undefined) return [];
  if (event.eventType === "goalkeeper_action") return ["mental", "agility", "handPlay"];
  if (event.tacticalContext.pressureLevel === "high") return ["mental", "power", "endurance"];
  if (isDanger(event)) return ["intelligence", "footPlayPassingShooting", "speed"];
  return ["intelligence", "mental", "endurance"];
}

function fatigueSignalType(event: MatchEvent): OfficialSequenceFatigueSignalType {
  if ((event.fatigueContext.goalkeeperMentalFatigue ?? 0) > 35) return "goalkeeper_mental_load";
  if ((event.fatigueContext.primaryPlayerMentalFreshness ?? 100) < 68) return "mental_freshness_drop";
  if ((event.fatigueContext.primaryPlayerCondition ?? 100) < 68) return "condition_drop";
  if ((event.fatigueContext.fatiguePressure ?? 0) > 55) return "high_intensity_load";
  return "visible_but_not_causal";
}

function fatigueObservedEffect(event: MatchEvent): OfficialSequenceFatigueObservedEffect {
  if (event.eventType === "fatigue_error") return "technical_error";
  if ((event.fatigueContext.goalkeeperMentalFatigue ?? 0) > 35) return "goalkeeper_uncertainty";
  if ((event.fatigueContext.primaryPlayerMentalFreshness ?? 100) < 68) return "lower_pressure_resistance";
  return "no_clear_effect";
}

function buildContribution(input: {
  readonly event: MatchEvent;
  readonly player: PlayerSnapshot;
  readonly index: number;
  readonly source: "primary_actor" | "role_witness";
}): OfficialSequenceActorContribution {
  const attrs = attributeNames(input.player, input.event).map(String);
  const roleWitness = input.source === "role_witness";
  return {
    contributionId: `${input.event.sequenceId}-actor-${input.index + 1}`,
    sequenceId: input.event.sequenceId,
    eventId: input.event.eventId,
    playerId: input.player.playerId,
    teamId: input.event.teamId,
    role: input.player.role,
    roleFunction: roleFunction(input.player.role, input.event),
    actionRole: actionRole(input.event),
    zone: input.event.zone,
    pressureContext: input.event.tacticalContext.pressureLevel,
    fatigueContext: `condition ${input.event.fatigueContext.primaryPlayerCondition ?? input.event.fatigueContext.teamCondition}`,
    attributeSnapshotUsed: attrs.length > 0,
    attributeNamesUsed: attrs,
    contributionEffect: contributionEffect(input.event),
    evidenceSummary: roleWitness
      ? `Event officiel ${input.event.eventId}, minute ${input.event.timestamp.minute}, zone ${input.event.zone}; role temoin utilise car l'event expose une action equipe.`
      : `Event officiel ${input.event.eventId}, minute ${input.event.timestamp.minute}, zone ${input.event.zone}.`,
    confidence: confidence(input.event),
    limitationNote: roleWitness
      ? "Contribution reliee a un event officiel team-level; le joueur illustre la fonction de role, pas une attribution exclusive."
      : "Contribution limitee a l'acteur expose par la timeline officielle.",
  };
}

function chainPattern(sequenceTypeValue: OfficialMatchSequenceCausalityType, actorCount: number): OfficialRoleFunctionChainPattern {
  if (sequenceTypeValue === "scoring_sequence" && actorCount >= 1) return "score_after_progression";
  if (sequenceTypeValue === "goalkeeper_sequence") return "goalkeeper_secure_reset";
  if (sequenceTypeValue === "recovery_sequence") return "recover_connect_progress";
  if (sequenceTypeValue === "pressure_sequence") return "pressure_force_recover";
  if (sequenceTypeValue === "danger_sequence") return "danger_without_support";
  if (sequenceTypeValue === "stabilization_sequence") return "stabilize_without_score";
  return "fix_reconnect_progress";
}

function buildRoleChain(input: {
  readonly sequenceId: SequenceId;
  readonly teamId: TeamId;
  readonly type: OfficialMatchSequenceCausalityType;
  readonly contributions: readonly OfficialSequenceActorContribution[];
  readonly scoreEventIds: readonly EventId[];
}): OfficialRoleFunctionChain {
  return {
    roleChainId: `${input.sequenceId}-role-chain`,
    sequenceId: input.sequenceId,
    teamId: input.teamId,
    rolesInOrder: input.contributions.map((contribution) => contribution.role),
    playersInOrder: input.contributions.map((contribution) => contribution.playerId),
    zonesInOrder: input.contributions.map((contribution) => contribution.zone),
    functionsInOrder: input.contributions.map((contribution) => contribution.roleFunction),
    chainPattern: chainPattern(input.type, input.contributions.length),
    chainEffect: input.contributions[0]?.contributionEffect ?? "no_direct_effect",
    linkedOfficialEventIds: input.contributions.map((contribution) => contribution.eventId),
    linkedScoreChangeEventIds: input.scoreEventIds,
    coachReadableText: input.contributions.length === 0
      ? "La sequence est officielle, mais aucun acteur joueur fiable n'est expose."
      : `${input.contributions.map((contribution) => `${contribution.playerId} (${contribution.role})`).join(" -> ")} relie ${input.contributions.map((contribution) => contribution.zone).join(" -> ")}.`,
    confidence: input.contributions.some((contribution) => contribution.confidence === "high") ? "high" : "medium",
    limitationNote: input.contributions.length === 0
      ? "Acteur manquant dans la timeline officielle; lecture gardee au niveau sequence."
      : "Chaine limitee aux acteurs explicitement presents dans les events officiels.",
  };
}

function buildFatigueEffect(event: MatchEvent): OfficialSequenceFatigueEffect | undefined {
  if (!isFatigueSignal(event)) return undefined;
  return {
    fatigueEffectId: `${event.sequenceId}-fatigue-${event.eventId}`,
    sequenceId: event.sequenceId,
    eventId: event.eventId,
    teamId: event.teamId,
    ...(event.primaryPlayerId === undefined ? {} : { playerId: event.primaryPlayerId }),
    fatigueSignalType: fatigueSignalType(event),
    observedEffect: fatigueObservedEffect(event),
    ...(event.fatigueContext.primaryPlayerCondition === undefined ? {} : { conditionValue: event.fatigueContext.primaryPlayerCondition }),
    ...(event.fatigueContext.primaryPlayerMentalFreshness === undefined ? {} : { mentalFreshnessValue: event.fatigueContext.primaryPlayerMentalFreshness }),
    ...(event.fatigueContext.fatiguePressure === undefined ? {} : { fatiguePressureValue: event.fatigueContext.fatiguePressure }),
    confidence: fatigueObservedEffect(event) === "no_clear_effect" ? "low" : "medium",
    limitationNote: fatigueObservedEffect(event) === "no_clear_effect"
      ? "Fatigue visible, mais effet causal non prouve."
      : "Signal fatigue rattache a un event officiel; ne pas l'utiliser comme explication automatique du score.",
    coachReadableText: fatigueObservedEffect(event) === "no_clear_effect"
      ? `Fatigue visible sur ${event.eventId}, sans effet direct assez specifique.`
      : `Fatigue visible sur ${event.eventId}, effet observe: ${fatigueObservedEffect(event)}.`,
  };
}

function storyBeatIds(input: OfficialPlayerRoleSequenceCausalityUpgrade8DInput, eventIds: readonly EventId[]): readonly string[] {
  const set = new Set(eventIds);
  return input.storySpine.beats.filter((beat) => set.has(beat.linkedOfficialEventId)).map((beat) => beat.beatId);
}

function turningPointIds(input: OfficialPlayerRoleSequenceCausalityUpgrade8DInput, eventIds: readonly EventId[]): readonly string[] {
  const set = new Set(eventIds);
  return input.storySpine.turningPoints
    .filter((turningPoint) => turningPoint.linkedOfficialEventIds.some((eventId) => set.has(eventId)))
    .map((turningPoint) => turningPoint.turningPointId);
}

function sequenceTitle(type: OfficialMatchSequenceCausalityType): string {
  switch (type) {
    case "scoring_sequence": return "Sequence de score officielle";
    case "danger_sequence": return "Danger non converti";
    case "recovery_sequence": return "Recuperation et premiere suite";
    case "goalkeeper_sequence": return "Gardien-libero et securisation";
    case "fatigue_exposure_sequence": return "Fatigue visible, effet limite";
    case "stabilization_sequence": return "Stabilisation de la possession";
    case "defensive_stop_sequence": return "Arret defensif";
    case "pressure_sequence": return "Pression qui pese sur la sequence";
    case "possession_security_sequence": return "Securite de possession";
  }
}

function candidateEvents(input: OfficialPlayerRoleSequenceCausalityUpgrade8DInput): readonly MatchEvent[] {
  const bySequence = new Map<SequenceId, MatchEvent>();
  for (const event of [...input.report.timeline].sort((a, b) => eventPriority(b) - eventPriority(a))) {
    if (event.eventType === "kickoff") continue;
    if (!hasScoreChange(event) && !isDanger(event) && !isRecovery(event) && !isStabilization(event) && !isFatigueSignal(event) && event.eventType !== "goalkeeper_action" && event.eventType !== "defensive_action") continue;
    if (!bySequence.has(event.sequenceId)) {
      bySequence.set(event.sequenceId, event);
    }
  }
  return [...bySequence.values()]
    .sort((a, b) => eventPriority(b) - eventPriority(a))
    .slice(0, 6)
    .sort((a, b) => a.timestamp.minute - b.timestamp.minute || a.timestamp.tick - b.timestamp.tick);
}

function teamName(teamSnapshots: readonly TeamSnapshot[], teamId: TeamId): string {
  return teamSnapshots.find((team) => team.teamId === teamId)?.name ?? teamId;
}

function roleWitnessPriority(event: MatchEvent): readonly string[] {
  if (event.eventType === "goalkeeper_action") return ["goalkeeper_free_safety"];
  if (event.eventType === "defensive_action" || event.eventType === "turnover" || event.eventType === "gain_possession") {
    return ["mobile_lock", "pivot", "right_anchor", "goalkeeper_free_safety"];
  }
  if (hasScoreChange(event) || isDanger(event)) {
    return ["space_hunter", "playmaker", "power_runner", "hook_link", "left_piston"];
  }
  if (isStabilization(event)) {
    return ["hook_link", "playmaker", "pivot", "left_piston"];
  }
  if (isFatigueSignal(event)) {
    return ["playmaker", "mobile_lock", "pivot", "space_hunter"];
  }
  return ["playmaker", "hook_link", "pivot", "mobile_lock"];
}

function resolveSequencePlayer(input: {
  readonly event: MatchEvent;
  readonly players: ReadonlyMap<PlayerId, PlayerSnapshot>;
  readonly teamSnapshots: readonly TeamSnapshot[];
  readonly index: number;
}): { readonly player: PlayerSnapshot; readonly source: "primary_actor" | "role_witness" } | undefined {
  if (input.event.primaryPlayerId !== undefined) {
    const primary = input.players.get(input.event.primaryPlayerId);
    if (primary !== undefined) {
      return { player: primary, source: "primary_actor" };
    }
  }
  const eventTeamRoster = input.teamSnapshots.find((team) => team.teamId === input.event.teamId)?.roster ?? [];
  const priorities = roleWitnessPriority(input.event);
  const prioritized = priorities
    .flatMap((role) => eventTeamRoster.filter((player) => player.role === role));
  const pool = prioritized.length > 0 ? prioritized : eventTeamRoster;
  const player = pool[input.index % pool.length];
  return player === undefined ? undefined : { player, source: "role_witness" };
}

export function buildOfficialSequenceLevelCausality(
  input: OfficialPlayerRoleSequenceCausalityUpgrade8DInput,
): {
  readonly sequences: readonly OfficialMatchSequenceCausality[];
  readonly story: ReturnType<typeof buildCoachReadableSequenceStory>;
} {
  const players = new Map<PlayerId, PlayerSnapshot>(input.playerSnapshots.map((player) => [player.playerId, player]));
  const selected = candidateEvents(input);
  const sequences = selected.map((event, index): OfficialMatchSequenceCausality => {
    const resolvedPlayer = resolveSequencePlayer({
      event,
      players,
      teamSnapshots: input.teamSnapshots,
      index,
    });
    const contributions = resolvedPlayer === undefined ? [] : [buildContribution({
      event,
      player: resolvedPlayer.player,
      index,
      source: resolvedPlayer.source,
    })];
    const scoreEventIds = hasScoreChange(event) ? [event.eventId] : [];
    const type = sequenceType(event);
    const roleChain = buildRoleChain({
      sequenceId: event.sequenceId,
      teamId: event.teamId,
      type,
      contributions,
      scoreEventIds,
    });
    const fatigue = buildFatigueEffect(event);
    const eventIds = [event.eventId];
    const before = scoreStateBefore(input.report, event);
    const after = scoreStateAfter(input.report, event);
    const actors = contributions.map((contribution) => `${contribution.playerId} (${contribution.role})`).join(" -> ");
    const title = sequenceTitle(type);
    const actorText = actors.length > 0 ? actors : teamName(input.teamSnapshots, event.teamId);
    const effect = contributionEffect(event);

    return {
      sequenceCausalityId: `sequence-causality-8d-${index + 1}`,
      matchId: input.report.matchId,
      sequenceId: event.sequenceId,
      minuteStart: event.timestamp.minute,
      minuteEnd: event.timestamp.minute,
      phase: event.phase,
      teamId: event.teamId,
      opponentTeamId: event.opponentTeamId,
      sequenceType: type,
      scoreBefore: before,
      scoreAfter: after,
      scoreDelta: pointDelta(event) === 0 ? "0" : `+${pointDelta(event)} ${event.teamId}`,
      linkedOfficialEventIds: eventIds,
      linkedScoreChangeEventIds: scoreEventIds,
      linkedStoryBeatIds: storyBeatIds(input, eventIds),
      linkedTurningPointIds: turningPointIds(input, eventIds),
      zoneChain: [event.zone],
      actorChain: contributions,
      roleChain,
      tacticalFunctionChain: roleChain.functionsInOrder,
      fatigueEffects: fatigue === undefined ? [] : [fatigue],
      observedPressure: event.tacticalContext.pressureLevel,
      observedFatigueSignal: fatigue === undefined ? "no_specific_fatigue_signal" : fatigue.fatigueSignalType,
      observedEffect: effect,
      causalSummary: `${title}: ${actorText} agit en ${event.zone}; effet officiel ${effect}; source ${event.eventId}.`,
      coachReadableSequenceSummary: `${title}: ${actorText} pese sur ${effect} en ${event.zone}, avec preuve officielle ${event.eventId}.`,
      confidence: confidence(event),
      limitationNote: contributions.length === 0
        ? "Sequence officielle conservee au niveau equipe: aucun joueur fiable n'est expose par cet event."
        : "Lecture limitee aux acteurs explicitement presents dans la timeline officielle.",
      officialOnly: true,
      diagnosticOnly: false,
      sandboxOnly: false,
    };
  });

  return {
    sequences,
    story: buildCoachReadableSequenceStory({
      sequences,
      officialScore: input.storySpine.officialScore,
    }),
  };
}
