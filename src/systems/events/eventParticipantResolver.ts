import { PlayerRole, type PlayerState } from "../../models/player";
import { EventContinuation } from "../matchLoop";
import type { SpatialTeamContext } from "../spatial";
import { SpatialMoveType, type BallContext, type TargetZoneSelection } from "../spatial/intention";
import type { CanonicalEventActorModel } from "./eventActors";
import { selectRecycleReceiver } from "../actions";
import { BallTargetType, resolveBallStateZoneContract } from "../ball";
import type { BallZoneContract } from "../ball";
import { resolveActionSemanticContract } from "../actions";
import { resolveTargetSemanticsForContext } from "../targets";

function findPlayerByRole(players: readonly PlayerState[], role: PlayerRole): PlayerState | null {
  return players.find((player) => player.role === role) ?? null;
}

function findPlayerById(players: readonly PlayerState[], playerId: string | null): PlayerState | null {
  if (playerId === null) {
    return null;
  }

  return players.find((player) => player.id === playerId) ?? null;
}

function selectReceiver(input: {
  readonly offensiveTeam: SpatialTeamContext;
  readonly targetSelection: TargetZoneSelection;
  readonly eventType?: string | undefined;
  readonly actor: PlayerState;
}): PlayerState | null {
  const recycleReceiver = selectRecycleReceiver({
    players: input.offensiveTeam.players,
    teamId: input.offensiveTeam.teamId,
    targetZone: input.targetSelection.selectedZone,
    currentCarrierRole: input.actor.role,
    tacticalStyle: input.offensiveTeam.tacticalStyle,
  });
  const selectedRecycleReceiver = findPlayerById(input.offensiveTeam.players, recycleReceiver.receiverId);
  if (selectedRecycleReceiver !== null && selectedRecycleReceiver.id !== input.actor.id) {
    return selectedRecycleReceiver;
  }

  const explicitReceiver = findPlayerById(input.offensiveTeam.players, input.targetSelection.receiverId);
  if (explicitReceiver !== null && explicitReceiver.id !== input.actor.id) {
    return explicitReceiver;
  }

  const receiverByRole =
    input.targetSelection.receiverRole === null
      ? null
      : findPlayerByRole(input.offensiveTeam.players, input.targetSelection.receiverRole);
  if (receiverByRole !== null && receiverByRole.id !== input.actor.id) {
    return receiverByRole;
  }

  return input.offensiveTeam.players.find((player) => player.currentZone === input.targetSelection.selectedZone && player.id !== input.actor.id) ?? null;
}

function selectGoalkeeper(team: SpatialTeamContext): PlayerState | null {
  return (
    team.players.find((player) => player.role === PlayerRole.GoalkeeperFreeSafety) ??
    team.players.find((player) => player.isGoalkeeper === true) ??
    null
  );
}

export function resolveCanonicalEventActors(input: {
  readonly eventId: string;
  readonly tick: number;
  readonly offensiveTeam: SpatialTeamContext;
  readonly defensiveTeam: SpatialTeamContext;
  readonly ballContext: BallContext;
  readonly targetSelection: TargetZoneSelection;
  readonly eventType?: string | undefined;
  readonly continuation?: EventContinuation | string;
  readonly ballZoneContract?: BallZoneContract | undefined;
}): CanonicalEventActorModel {
  const actor =
    findPlayerByRole(input.offensiveTeam.players, input.ballContext.ballCarrierRole) ??
    input.offensiveTeam.players[0];

  if (actor === undefined) {
    throw new Error(`No primary actor available for ${input.eventId}.`);
  }

  const receiver = input.targetSelection.moveType === SpatialMoveType.Finishing
    ? null
    : selectReceiver({
        offensiveTeam: input.offensiveTeam,
        targetSelection: input.targetSelection,
        actor,
      });
  const goalkeeper = selectGoalkeeper(input.defensiveTeam);
  const ballCarrierAfterId =
    input.targetSelection.moveType === SpatialMoveType.Finishing
      ? actor.id
      : receiver?.id ?? actor.id;
  const receiverResolvedZone = receiver?.currentZone;
  const actualReceptionZone = input.targetSelection.moveType === SpatialMoveType.Finishing ? undefined : receiverResolvedZone;
  const actualBallZone = actualReceptionZone ?? receiverResolvedZone ?? input.targetSelection.selectedZone;
  const targetType =
    receiverResolvedZone !== undefined && input.targetSelection.selectedZone !== receiverResolvedZone
      ? BallTargetType.SupportCluster
      : BallTargetType.PlayerTarget;
  const targetSemantics = resolveTargetSemanticsForContext({
    eventType: input.eventType ?? "build_up_under_pressure",
    moveType: input.targetSelection.moveType,
    possessionTeamId: input.offensiveTeam.teamId,
    fromZone: input.ballContext.ballLocation,
    tacticalTargetCluster: input.targetSelection.selectedZone,
    selectedReceiverId: receiver?.id,
    receiverLabel: receiver?.roleInitials ?? receiver?.role,
    receiverResolvedZone,
    actualReceptionZone,
    actualBallZone,
    carrierResolvedZone: actualBallZone,
    worldStateBallZone: actualBallZone,
    ballCarrierId: ballCarrierAfterId,
  });
  const ballZoneContract =
    input.ballZoneContract ??
    resolveBallStateZoneContract({
      tacticalTargetCluster: input.targetSelection.selectedZone,
      selectedTargetZone: input.targetSelection.selectedZone,
      targetType: targetType === BallTargetType.PlayerTarget ? targetType : targetSemantics.targetType,
      selectedReceiverId: receiver?.id,
      receiverResolvedZone,
      actualReceptionZone,
      actualBallZone,
      carrierResolvedZone: actualBallZone,
      worldStateBallZone: actualBallZone,
      ballCarrierId: ballCarrierAfterId,
      reason: targetType === BallTargetType.PlayerTarget ? "tactical target and actual ball zone match." : targetSemantics.reason,
    });
  const actionSemanticContract = resolveActionSemanticContract({
    eventId: input.eventId,
    eventType: input.eventType ?? "build_up_under_pressure",
    moveType: input.targetSelection.moveType,
    possessionTeamId: input.offensiveTeam.teamId,
    defendingTeamId: input.defensiveTeam.teamId,
    decisionActor: actor,
    selectedReceiver: receiver ?? undefined,
    newCarrierId: ballCarrierAfterId,
    newCarrierRole: receiver?.role ?? actor.role,
    fromZone: input.ballContext.ballLocation,
    ballZoneContract,
  });

  return {
    eventId: input.eventId,
    tick: input.tick,
    possessionTeamId: input.offensiveTeam.teamId,
    defendingTeamId: input.defensiveTeam.teamId,
    ballCarrierBeforeId: actor.id,
    ballCarrierAfterId,
    decisionActorId: actionSemanticContract.decisionActorId,
    decisionActorRole: actor.role,
    selectedReceiverId: actionSemanticContract.selectedReceiverId,
    selectedReceiverRole: receiver?.role,
    newCarrierId: actionSemanticContract.newCarrierId,
    newCarrierRole: actionSemanticContract.newCarrierRole,
    postActionPrimaryActorId: actionSemanticContract.postActionPrimaryActorId,
    primaryActorId: actor.id,
    primaryActorRole: actor.role,
    primaryActorInitials: actor.roleInitials ?? actor.role,
    passerId: input.targetSelection.moveType === SpatialMoveType.Finishing ? null : actor.id,
    passerRole: input.targetSelection.moveType === SpatialMoveType.Finishing ? null : actor.role,
    receiverId: receiver?.id ?? null,
    receiverRole: receiver?.role ?? null,
    receiverInitials: receiver?.roleInitials ?? null,
    defenderIds: input.defensiveTeam.players
      .filter((player) => player.currentZone === input.targetSelection.selectedZone)
      .map((player) => player.id),
    goalkeeperId: goalkeeper?.id ?? null,
    selectedTargetZone: input.targetSelection.selectedZone,
    selectedTargetZoneSemantics: ballZoneContract.selectedTargetZoneSemantics,
    tacticalTargetCluster: ballZoneContract.tacticalTargetCluster,
    receiverResolvedZone: ballZoneContract.receiverResolvedZone,
    actualReceptionZone: ballZoneContract.actualReceptionZone,
    actualBallZoneAfter: ballZoneContract.actualBallZone,
    ballZoneAfterSemantics: ballZoneContract.ballZoneAfterSemantics,
    selectedActionType: actionSemanticContract.selectedActionType,
    selectedActionSubtype: actionSemanticContract.selectedActionSubtype,
    actionSemanticStatus: actionSemanticContract.semanticStatus,
    actionSemanticReason: actionSemanticContract.reason,
    ballZoneBefore: input.ballContext.ballLocation,
    ballZoneAfter: ballZoneContract.actualBallZone,
    possessionChange: null,
    continuation: input.continuation ?? EventContinuation.Continue,
    ballZoneContract,
    actionSemanticContract,
  };
}
