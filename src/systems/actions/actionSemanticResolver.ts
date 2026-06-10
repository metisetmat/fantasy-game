import type { PlayerId, TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import type { PlayerRole, PlayerState } from "../../models/player";
import type { SpatialMoveType } from "../spatial/intention";
import type { BallZoneContract } from "../ball";
import {
  ActionPhase,
  ActionSemanticStatus,
  type ActionSemanticContract,
} from "./actionSemanticTypes";
import { classifyTacticalAction } from "./actionSemanticClassifier";
import { generateActionSemanticReason } from "./actionSemanticReason";

export function resolveActionSemanticContract(input: {
  readonly eventId: string;
  readonly eventType: string;
  readonly moveType: SpatialMoveType | string;
  readonly possessionTeamId: TeamId;
  readonly defendingTeamId: TeamId;
  readonly decisionActor: PlayerState;
  readonly selectedReceiver?: PlayerState | undefined;
  readonly newCarrierId: PlayerId;
  readonly newCarrierRole: PlayerRole | string;
  readonly fromZone?: ZoneId | undefined;
  readonly ballZoneContract?: BallZoneContract | undefined;
}): ActionSemanticContract {
  const classification = classifyTacticalAction({
    moveType: String(input.moveType),
    eventType: input.eventType,
    possessionTeamId: input.possessionTeamId,
    fromZone: input.fromZone ?? input.decisionActor.currentZone,
    ballZoneContract: input.ballZoneContract,
  });
  const selectedReceiverId = input.selectedReceiver?.id;
  const receiverMatchesCarrier = selectedReceiverId === undefined || selectedReceiverId === input.newCarrierId;
  const semanticStatus = receiverMatchesCarrier ? ActionSemanticStatus.Pass : ActionSemanticStatus.Warning;
  const decisionActorLabel = input.decisionActor.roleInitials ?? input.decisionActor.role;
  const receiverLabel = input.selectedReceiver?.roleInitials;

  return {
    eventId: input.eventId,
    eventType: input.eventType,
    selectedActionType: classification.selectedActionType,
    selectedActionSubtype: classification.selectedActionSubtype,
    decisionActorId: input.decisionActor.id,
    decisionActorRole: input.decisionActor.role,
    decisionActorIntent: input.decisionActor.primaryIntent?.type,
    selectedReceiverId,
    selectedReceiverRole: input.selectedReceiver?.role,
    selectedReceiverIntent: input.selectedReceiver?.primaryIntent?.type,
    newCarrierId: input.newCarrierId,
    newCarrierRole: input.newCarrierRole,
    postActionPrimaryActorId: input.newCarrierId,
    passerId: input.decisionActor.id,
    receiverId: selectedReceiverId,
    actionPhase: ActionPhase.ActionExecution,
    possessionTeamId: input.possessionTeamId,
    defendingTeamId: input.defendingTeamId,
    tacticalTargetCluster: input.ballZoneContract?.tacticalTargetCluster,
    actualBallZoneAfter: input.ballZoneContract?.actualBallZone ?? input.decisionActor.currentZone,
    semanticStatus,
    reason: generateActionSemanticReason({
      eventType: input.eventType,
      selectedActionType: classification.selectedActionType,
      selectedActionSubtype: classification.selectedActionSubtype,
      decisionActorLabel,
      receiverLabel,
    }),
  };
}
