import type { SnapshotReference } from "../visualization";
import type { PlayerMatchState } from "../../systems/players";
import { buildStoryboardCamera, collectCameraZones } from "./storyboardLayout";
import type { StoryboardKeyActor, StoryboardTacticalFacts } from "./tacticalStoryboard";
import type { TacticalFocus } from "../focus";

function findPlayer(players: readonly PlayerMatchState[], playerId: string | null): PlayerMatchState | null {
  if (playerId === null || playerId === "") {
    return null;
  }

  return players.find((player) => player.playerId === playerId) ?? null;
}

function firstPlayerByIntent(players: readonly PlayerMatchState[], intentType: string): PlayerMatchState | null {
  return (
    players
      .filter((player) => player.primaryIntent?.type === intentType)
      .sort((left, right) => right.intentUrgency - left.intentUrgency)[0] ?? null
  );
}

function formatPressureSummary(snapshot: SnapshotReference): string {
  const lane = snapshot.afterMetadata.passingLaneAnalysis;

  if (lane === null) {
    return "pressure is read from local shape rather than a selected lane";
  }

  if (lane.laneState === "OPEN") {
    return "the lane is open enough to invite the action";
  }

  if (lane.laneState === "CLOSED") {
    return "the lane is tight and the action carries risk";
  }

  if (lane.laneState === "TEMPORARY_WINDOW") {
    return "a short timing window appears before recovery closes";
  }

  return "the lane is contested but still tactically usable";
}

function formatTacticalCause(snapshot: SnapshotReference): string {
  const lane = snapshot.afterMetadata.passingLaneAnalysis;
  const overload = snapshot.afterMetadata.overloadWindows[0];
  const blindSide = snapshot.afterMetadata.blindSideClaims[0];

  if (blindSide !== undefined) {
    return "blind-side awareness creates the main tactical cue";
  }

  if (overload !== undefined) {
    return "local overload shape creates the main tactical cue";
  }

  if (lane !== null) {
    return `the ${lane.laneState.toLowerCase().replace("_", " ")} lane shapes the decision`;
  }

  return "the action follows the current possession structure";
}

export function analyzeStoryboardFacts(input: {
  readonly snapshot: SnapshotReference;
  readonly frame: "before" | "after";
}): StoryboardTacticalFacts {
  const metadata = input.frame === "before" ? input.snapshot.beforeMetadata : input.snapshot.afterMetadata;
  const contract = input.frame === "before" ? input.snapshot.beforeTruthContract : input.snapshot.afterTruthContract;
  const players = metadata.playerStates;
  const ballCarrier = players.find((player) => player.hasBall) ?? null;
  const primaryActor = findPlayer(players, contract.primaryActorId) ?? ballCarrier;
  const receiver = findPlayer(players, contract.receiverId);
  const attackingTeamId = ballCarrier?.teamId ?? input.snapshot.afterMetadata.sourcePossessionTeamId;
  const attackingPlayers = players.filter((player) => player.teamId === attackingTeamId);
  const defendingPlayers = players.filter((player) => player.teamId !== attackingTeamId);
  const keySupport = attackingPlayers
    .filter((player) => player.supportStatus !== "ISOLATED" && !player.hasBall)
    .sort((left, right) => right.intentUrgency - left.intentUrgency)
    .slice(0, 2);
  const keyDefenders = defendingPlayers
    .filter((player) => player.isRelevantToBall || player.tacticalStatus === "PRESSING")
    .sort((left, right) => right.pressure - left.pressure)
    .slice(0, 2);
  const keyRecovering = defendingPlayers
    .filter((player) => player.isDelayed || player.isRecovering)
    .slice(0, 2);
  const keyRunner =
    firstPlayerByIntent(attackingPlayers, "ATTACK_DEPTH") ??
    firstPlayerByIntent(attackingPlayers, "ATTACK_WEAK_SIDE") ??
    firstPlayerByIntent(attackingPlayers, "PREPARE_FINISH");
  const topDanger = metadata.dangerMap
    .filter((zone) => zone.danger >= 55)
    .sort((left, right) => right.danger - left.danger)[0];
  const overloadZone = metadata.overloadWindows[0]?.zone ?? null;

  return {
    ballCarrier,
    receiver,
    primaryActor,
    keySupport,
    keyDefenders,
    keyRecovering,
    keyRunner,
    selectedTargetZone: contract.selectedTargetZone,
    passingLaneState: metadata.passingLaneAnalysis?.laneState ?? null,
    dangerZone: topDanger?.zone ?? null,
    overloadZone,
    pressureSummary: formatPressureSummary(input.snapshot),
    tacticalCause: formatTacticalCause(input.snapshot),
  };
}

export function createStoryboardCamera(input: {
  readonly snapshot: SnapshotReference;
  readonly focus: TacticalFocus;
}): ReturnType<typeof buildStoryboardCamera> {
  const snapshot = input.snapshot;
  const recoveryZones = snapshot.afterMetadata.recoveryVectors.flatMap((vector) => [vector.from, vector.to]);
  const zones = collectCameraZones({
    beforePlayers: snapshot.beforeMetadata.playerStates,
    afterPlayers: snapshot.afterMetadata.playerStates,
    selectedTargetZone: snapshot.afterTruthContract.selectedTargetZone,
    passingLaneFrom: snapshot.afterMetadata.passingLaneAnalysis?.fromZone ?? null,
    passingLaneTo: snapshot.afterMetadata.passingLaneAnalysis?.toZone ?? null,
    overloadZone: input.focus.focusZone,
    recoveryZones,
  });
  const actorZones = [...input.focus.primaryActors, ...input.focus.secondaryActors].map((actor) => actor.zone);

  return buildStoryboardCamera({ zones: [...zones, ...actorZones, input.focus.focusZone] });
}

export function selectStoryboardKeyActors(input: {
  readonly facts: StoryboardTacticalFacts;
  readonly players: readonly PlayerMatchState[];
  readonly focus?: TacticalFocus;
}): readonly StoryboardKeyActor[] {
  if (input.focus !== undefined) {
    return [
      ...input.focus.primaryActors.map((actor) => ({
        playerId: actor.playerId,
        teamId: actor.teamId,
        initials: actor.initials,
        zone: actor.zone,
        reason: actor.reason,
        priority: "PRIMARY" as const,
      })),
      ...input.focus.secondaryActors.map((actor) => ({
        playerId: actor.playerId,
        teamId: actor.teamId,
        initials: actor.initials,
        zone: actor.zone,
        reason: actor.reason,
        priority: "SECONDARY" as const,
      })),
    ];
  }

  const actors = [
    input.facts.ballCarrier === null
      ? null
      : {
          player: input.facts.ballCarrier,
          reason: "ball carrier",
          priority: "PRIMARY" as const,
        },
    input.facts.receiver === null
      ? null
      : {
          player: input.facts.receiver,
          reason: "intended receiver",
          priority: "PRIMARY" as const,
        },
    input.facts.keyRunner === null
      ? null
      : {
          player: input.facts.keyRunner,
          reason: "runner",
          priority: "SECONDARY" as const,
        },
    ...input.facts.keySupport.map((player) => ({
      player,
      reason: "support",
      priority: "SECONDARY" as const,
    })),
    ...input.facts.keyDefenders.map((player) => ({
      player,
      reason: "key defender",
      priority: "SECONDARY" as const,
    })),
    ...input.facts.keyRecovering.map((player) => ({
      player,
      reason: "recovering late",
      priority: "SECONDARY" as const,
    })),
  ];
  const seen = new Set<string>();

  return actors
    .filter((actor): actor is NonNullable<typeof actor> => actor !== null)
    .filter((actor) => {
      if (seen.has(actor.player.playerId)) {
        return false;
      }

      seen.add(actor.player.playerId);
      return true;
    })
    .map((actor) => ({
      playerId: actor.player.playerId,
      teamId: actor.player.teamId,
      initials: actor.player.roleInitials,
      zone: actor.player.zone,
      reason: actor.reason,
      priority: actor.priority,
    }));
}
