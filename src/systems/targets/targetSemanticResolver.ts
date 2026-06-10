import type { PlayerId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import {
  BallTargetType,
  BallZoneAfterSemantics,
  BallZoneConsistencyStatus,
  SelectedTargetZoneSemantics,
  type BallZoneContract,
} from "../ball";
import { classifyTacticalAction, TacticalActionType } from "../actions";
import { describeTargetSemantics } from "./targetSemanticReason";
import type { TargetSemanticResolution } from "./targetSemanticTypes";

export function targetTypeForActionType(actionType: TacticalActionType | string): BallTargetType {
  switch (actionType) {
    case TacticalActionType.SupportClusterRecycle:
      return BallTargetType.SupportCluster;
    case TacticalActionType.PressureEscape:
      return BallTargetType.PressureEscapeCluster;
    case TacticalActionType.ForwardProgress:
    case TacticalActionType.OffensiveConstructionPass:
      return BallTargetType.StructureAdvancementTarget;
    case TacticalActionType.CentralRecycle:
      return BallTargetType.CentralRebuildTarget;
    case TacticalActionType.SafeRecycle:
      return BallTargetType.RestDefenseResetTarget;
    case TacticalActionType.WeakSideSupport:
    case TacticalActionType.WeakSideSwitch:
      return BallTargetType.WeakSidePreparationTarget;
    case TacticalActionType.WeakSideRupture:
      return BallTargetType.WeakSideExploitTarget;
    case TacticalActionType.Shot:
      return BallTargetType.ShotTarget;
    case TacticalActionType.CarryOrHold:
      return BallTargetType.CarryTarget;
    default:
      return BallTargetType.PlayerTarget;
  }
}

export function resolveTargetSemantics(input: {
  readonly selectedActionType: TacticalActionType | string;
  readonly tacticalTargetCluster?: ZoneId | undefined;
  readonly receiverLabel?: string | undefined;
  readonly receiverResolvedZone?: ZoneId | undefined;
  readonly actualReceptionZone?: ZoneId | undefined;
}): TargetSemanticResolution {
  const targetType = targetTypeForActionType(input.selectedActionType);
  const description = describeTargetSemantics({
    targetType,
    tacticalTargetCluster: input.tacticalTargetCluster,
    receiverLabel: input.receiverLabel,
    receiverResolvedZone: input.receiverResolvedZone,
    actualReceptionZone: input.actualReceptionZone,
  });

  return {
    targetType,
    tacticalTargetCluster: input.tacticalTargetCluster,
    receiverResolvedZone: input.receiverResolvedZone,
    actualReceptionZone: input.actualReceptionZone,
    reason: description.reason,
    whyTargetDiffersFromReceiverZone: description.whyTargetDiffersFromReceiverZone,
  };
}

export function resolveTargetSemanticsForContext(input: {
  readonly eventType: string;
  readonly moveType: string;
  readonly possessionTeamId: string;
  readonly fromZone?: ZoneId | undefined;
  readonly tacticalTargetCluster?: ZoneId | undefined;
  readonly selectedReceiverId?: PlayerId | undefined;
  readonly receiverLabel?: string | undefined;
  readonly receiverResolvedZone?: ZoneId | undefined;
  readonly actualReceptionZone?: ZoneId | undefined;
  readonly actualBallZone: ZoneId;
  readonly carrierResolvedZone: ZoneId;
  readonly worldStateBallZone: ZoneId;
  readonly ballCarrierId: PlayerId;
}): TargetSemanticResolution {
  const provisionalTargetType =
    input.actualBallZone === input.tacticalTargetCluster ? BallTargetType.PlayerTarget : BallTargetType.SupportCluster;
  const provisionalContract: BallZoneContract = {
    tacticalTargetCluster: input.tacticalTargetCluster,
    selectedTargetZone: input.tacticalTargetCluster,
    selectedTargetZoneSemantics: SelectedTargetZoneSemantics.TacticalTargetCluster,
    targetType: provisionalTargetType,
    selectedReceiverId: input.selectedReceiverId,
    receiverResolvedZone: input.receiverResolvedZone,
    actualReceptionZone: input.actualReceptionZone,
    actualBallZone: input.actualBallZone,
    carrierResolvedZone: input.carrierResolvedZone,
    worldStateBallZone: input.worldStateBallZone,
    ballCarrierId: input.ballCarrierId,
    ballZoneAfterSemantics: BallZoneAfterSemantics.ActualBallZone,
    reason: "",
    consistencyStatus: BallZoneConsistencyStatus.Pass,
  };
  const classification = classifyTacticalAction({
    moveType: input.moveType,
    eventType: input.eventType,
    possessionTeamId: input.possessionTeamId,
    fromZone: input.fromZone,
    ballZoneContract: provisionalContract,
  });

  return resolveTargetSemantics({
    selectedActionType: classification.selectedActionType,
    tacticalTargetCluster: input.tacticalTargetCluster,
    receiverLabel: input.receiverLabel,
    receiverResolvedZone: input.receiverResolvedZone,
    actualReceptionZone: input.actualReceptionZone,
  });
}
