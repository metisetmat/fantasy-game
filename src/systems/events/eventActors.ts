import type { PlayerId, TeamId } from "../../core/ids";
import type { TacticalTick } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";
import type { PlayerRole } from "../../models/player";
import type { EventContinuation } from "../matchLoop";
import type { SpatialMoveType } from "../spatial/intention";
import type { BallZoneContract } from "../ball";
import type { ActionSemanticContract } from "../actions";

export interface CanonicalEventActorModel {
  readonly eventId: string;
  readonly tick: TacticalTick;
  readonly possessionTeamId: TeamId;
  readonly defendingTeamId: TeamId;
  readonly ballCarrierBeforeId: PlayerId | null;
  readonly ballCarrierAfterId: PlayerId | null;
  readonly decisionActorId?: PlayerId | undefined;
  readonly decisionActorRole?: PlayerRole | undefined;
  readonly selectedReceiverId?: PlayerId | undefined;
  readonly selectedReceiverRole?: PlayerRole | undefined;
  readonly newCarrierId?: PlayerId | undefined;
  readonly newCarrierRole?: PlayerRole | string | undefined;
  readonly postActionPrimaryActorId?: PlayerId | undefined;
  readonly primaryActorId: PlayerId;
  readonly primaryActorRole: PlayerRole;
  readonly primaryActorInitials: string;
  readonly passerId: PlayerId | null;
  readonly passerRole: PlayerRole | null;
  readonly receiverId: PlayerId | null;
  readonly receiverRole: PlayerRole | null;
  readonly receiverInitials: string | null;
  readonly defenderIds: readonly PlayerId[];
  readonly goalkeeperId: PlayerId | null;
  readonly selectedTargetZone: ZoneId;
  readonly selectedTargetZoneSemantics?: string | undefined;
  readonly tacticalTargetCluster?: ZoneId | undefined;
  readonly receiverResolvedZone?: ZoneId | undefined;
  readonly actualReceptionZone?: ZoneId | undefined;
  readonly actualBallZoneAfter?: ZoneId | undefined;
  readonly ballZoneAfterSemantics?: string | undefined;
  readonly selectedActionType: SpatialMoveType | string;
  readonly selectedActionSubtype?: string | undefined;
  readonly actionSemanticStatus?: string | undefined;
  readonly actionSemanticReason?: string | undefined;
  readonly ballZoneBefore: ZoneId;
  readonly ballZoneAfter: ZoneId;
  readonly possessionChange: string | null;
  readonly continuation: EventContinuation | string;
  readonly ballZoneContract?: BallZoneContract | undefined;
  readonly actionSemanticContract?: ActionSemanticContract | undefined;
}

export function createActorMismatchWarning(actorModel: CanonicalEventActorModel): string | null {
  if (
    actorModel.receiverId !== null &&
    actorModel.ballCarrierAfterId !== null &&
    actorModel.selectedActionType !== "FINISHING" &&
    actorModel.ballCarrierAfterId !== actorModel.receiverId
  ) {
    return `receiver ${actorModel.receiverId} did not become ball carrier after successful movement (${actorModel.ballCarrierAfterId})`;
  }

  return null;
}
