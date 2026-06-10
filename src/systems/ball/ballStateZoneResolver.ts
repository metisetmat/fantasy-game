import type { PlayerId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import {
  BallTargetType,
  BallZoneAfterSemantics,
  BallZoneConsistencyStatus,
  SelectedTargetZoneSemantics,
  type BallZoneContract,
} from "./ballStateTypes";

function resolveStatus(input: {
  readonly targetType: BallTargetType;
  readonly tacticalTargetCluster?: ZoneId | undefined;
  readonly selectedTargetZone?: ZoneId | undefined;
  readonly actualReceptionZone?: ZoneId | undefined;
  readonly actualBallZone: ZoneId;
  readonly carrierResolvedZone: ZoneId;
  readonly worldStateBallZone: ZoneId;
}): BallZoneConsistencyStatus {
  if (input.worldStateBallZone !== input.actualBallZone) {
    return BallZoneConsistencyStatus.Fail;
  }

  if (input.carrierResolvedZone !== input.actualBallZone) {
    return BallZoneConsistencyStatus.Fail;
  }

  if (input.actualReceptionZone !== undefined && input.actualReceptionZone !== input.actualBallZone) {
    return BallZoneConsistencyStatus.Fail;
  }

  if (
    input.selectedTargetZone !== undefined &&
    input.selectedTargetZone !== input.actualBallZone &&
    input.targetType === BallTargetType.PlayerTarget
  ) {
    return BallZoneConsistencyStatus.Warning;
  }

  return BallZoneConsistencyStatus.Pass;
}

export function resolveBallStateZoneContract(input: {
  readonly tacticalTargetCluster?: ZoneId | undefined;
  readonly selectedTargetZone?: ZoneId | undefined;
  readonly targetType: BallTargetType;
  readonly selectedReceiverId?: PlayerId | undefined;
  readonly receiverResolvedZone?: ZoneId | undefined;
  readonly actualReceptionZone?: ZoneId | undefined;
  readonly actualBallZone: ZoneId;
  readonly carrierResolvedZone: ZoneId;
  readonly worldStateBallZone?: ZoneId;
  readonly ballCarrierId: PlayerId;
  readonly reason: string;
}): BallZoneContract {
  const worldStateBallZone = input.worldStateBallZone ?? input.actualBallZone;

  return {
    tacticalTargetCluster: input.tacticalTargetCluster,
    selectedTargetZone: input.selectedTargetZone,
    selectedTargetZoneSemantics:
      input.selectedTargetZone === input.actualBallZone
        ? SelectedTargetZoneSemantics.ActualBallZone
        : SelectedTargetZoneSemantics.TacticalTargetCluster,
    targetType: input.targetType,
    selectedReceiverId: input.selectedReceiverId,
    receiverResolvedZone: input.receiverResolvedZone,
    actualReceptionZone: input.actualReceptionZone,
    actualBallZone: input.actualBallZone,
    carrierResolvedZone: input.carrierResolvedZone,
    worldStateBallZone,
    ballCarrierId: input.ballCarrierId,
    ballZoneAfterSemantics: BallZoneAfterSemantics.ActualBallZone,
    reason: input.reason,
    consistencyStatus: resolveStatus({
      targetType: input.targetType,
      tacticalTargetCluster: input.tacticalTargetCluster,
      selectedTargetZone: input.selectedTargetZone,
      actualReceptionZone: input.actualReceptionZone,
      actualBallZone: input.actualBallZone,
      carrierResolvedZone: input.carrierResolvedZone,
      worldStateBallZone,
    }),
  };
}
