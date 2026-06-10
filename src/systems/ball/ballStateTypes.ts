import type { PlayerId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";

export enum BallTargetType {
  PlayerTarget = "PLAYER_TARGET",
  SpaceTarget = "SPACE_TARGET",
  SupportCluster = "SUPPORT_CLUSTER",
  PressureEscapeCluster = "PRESSURE_ESCAPE_CLUSTER",
  PressureEscapeZone = "PRESSURE_ESCAPE_ZONE",
  StructureAdvancementTarget = "STRUCTURE_ADVANCEMENT_TARGET",
  ForwardProgressTarget = "FORWARD_PROGRESS_TARGET",
  WeakSidePreparationTarget = "WEAK_SIDE_PREPARATION_TARGET",
  WeakSideExploitTarget = "WEAK_SIDE_EXPLOIT_TARGET",
  CentralRebuildTarget = "CENTRAL_REBUILD_TARGET",
  RestDefenseResetTarget = "REST_DEFENSE_RESET_TARGET",
  ShotTarget = "SHOT_TARGET",
  CarryTarget = "CARRY_TARGET",
}

export enum BallZoneConsistencyStatus {
  Pass = "PASS",
  Warning = "WARNING",
  Fail = "FAIL",
}

export enum SelectedTargetZoneSemantics {
  TacticalTargetCluster = "TACTICAL_TARGET_CLUSTER",
  ActualBallZone = "ACTUAL_BALL_ZONE",
}

export enum BallZoneAfterSemantics {
  ActualBallZone = "ACTUAL_BALL_ZONE",
}

export interface BallZoneContract {
  readonly tacticalTargetCluster?: ZoneId | undefined;
  readonly selectedTargetZone?: ZoneId | undefined;
  readonly selectedTargetZoneSemantics: SelectedTargetZoneSemantics;
  readonly targetType: BallTargetType;
  readonly selectedReceiverId?: PlayerId | undefined;
  readonly receiverResolvedZone?: ZoneId | undefined;
  readonly actualReceptionZone?: ZoneId | undefined;
  readonly actualBallZone: ZoneId;
  readonly carrierResolvedZone: ZoneId;
  readonly worldStateBallZone: ZoneId;
  readonly ballCarrierId: PlayerId;
  readonly ballZoneAfterSemantics: BallZoneAfterSemantics;
  readonly reason: string;
  readonly consistencyStatus: BallZoneConsistencyStatus;
}
