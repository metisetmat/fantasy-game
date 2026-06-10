import type { ZoneId } from "../../core/zones";
import { BallTargetType, type BallZoneContract } from "../ball";
import { TacticalActionType } from "./actionSemanticTypes";

export interface TacticalActionClassification {
  readonly selectedActionType: TacticalActionType;
  readonly selectedActionSubtype?: string | undefined;
  readonly reason: string;
}

function zoneColumn(zone: ZoneId | undefined): number {
  if (zone === undefined) {
    return 0;
  }

  return Number.parseInt(zone.slice(1, 2), 10);
}

function progressionDelta(input: {
  readonly possessionTeamId: string;
  readonly fromZone?: ZoneId | undefined;
  readonly toZone?: ZoneId | undefined;
}): number {
  const rawDelta = zoneColumn(input.toZone) - zoneColumn(input.fromZone);

  return input.possessionTeamId === "blitz" ? -rawDelta : rawDelta;
}

export function classifyTacticalAction(input: {
  readonly moveType: string;
  readonly eventType: string;
  readonly possessionTeamId: string;
  readonly fromZone?: ZoneId | undefined;
  readonly ballZoneContract?: BallZoneContract | undefined;
}): TacticalActionClassification {
  const actualBallZoneAfter = input.ballZoneContract?.actualBallZone;
  const delta = progressionDelta({
    possessionTeamId: input.possessionTeamId,
    fromZone: input.fromZone,
    toZone: actualBallZoneAfter,
  });

  if (input.moveType === "FINISHING" || input.eventType === "finishing") {
    return {
      selectedActionType: TacticalActionType.Shot,
      selectedActionSubtype: "SHOT_CREATION",
      reason: "finishing event resolves as a shot action",
    };
  }

  if (
    input.ballZoneContract?.targetType === BallTargetType.SupportCluster ||
    input.ballZoneContract?.targetType === BallTargetType.PressureEscapeCluster
  ) {
    if (input.eventType === "build_up_under_pressure") {
      return {
        selectedActionType: TacticalActionType.SupportClusterRecycle,
        selectedActionSubtype: "BALL_SIDE_PRESSURE_ESCAPE",
        reason: "support-cluster target during build-up pressure is a pressure-escape recycle",
      };
    }

    if (input.eventType === "offensive_construction" && delta > 0) {
      return {
        selectedActionType: TacticalActionType.ForwardProgress,
        selectedActionSubtype: "STRUCTURE_ADVANCEMENT",
        reason: "construction pass advances the ball into the next attacking structure",
      };
    }

    if (input.eventType === "offensive_construction") {
      return {
        selectedActionType: TacticalActionType.CentralRecycle,
        selectedActionSubtype: "CENTRAL_REBUILD",
        reason: "construction pass rebuilds possession through a central support cluster",
      };
    }

    return {
      selectedActionType: TacticalActionType.SafeRecycle,
      selectedActionSubtype: "REST_DEFENSE_RESET",
      reason: "support-cluster target is a safe recycle outside the build-up pressure pattern",
    };
  }

  if (input.ballZoneContract?.targetType === BallTargetType.PressureEscapeZone) {
    return {
      selectedActionType: TacticalActionType.PressureEscape,
      selectedActionSubtype: "BALL_SIDE_PRESSURE_ESCAPE",
      reason: "target type is explicitly a pressure escape zone",
    };
  }

  if (
    input.ballZoneContract?.targetType === BallTargetType.StructureAdvancementTarget ||
    input.ballZoneContract?.targetType === BallTargetType.ForwardProgressTarget
  ) {
    return {
      selectedActionType: TacticalActionType.ForwardProgress,
      selectedActionSubtype: "STRUCTURE_ADVANCEMENT",
      reason: "target type is explicitly a structure-advancement lane",
    };
  }

  if (input.ballZoneContract?.targetType === BallTargetType.CentralRebuildTarget) {
    return {
      selectedActionType: TacticalActionType.CentralRecycle,
      selectedActionSubtype: "CENTRAL_REBUILD",
      reason: "target type is explicitly a central rebuild target",
    };
  }

  if (input.ballZoneContract?.targetType === BallTargetType.RestDefenseResetTarget) {
    return {
      selectedActionType: TacticalActionType.SafeRecycle,
      selectedActionSubtype: "REST_DEFENSE_RESET",
      reason: "target type is explicitly a rest-defense reset",
    };
  }

  if (
    input.ballZoneContract?.targetType === BallTargetType.WeakSidePreparationTarget ||
    input.ballZoneContract?.targetType === BallTargetType.WeakSideExploitTarget
  ) {
    return {
      selectedActionType: TacticalActionType.WeakSideSupport,
      selectedActionSubtype: "WEAK_SIDE_PREPARATION",
      reason: "target type is explicitly a weak-side target",
    };
  }

  if (delta > 0) {
    return {
      selectedActionType: TacticalActionType.ForwardProgress,
      selectedActionSubtype: "STRUCTURE_ADVANCEMENT",
      reason: "ball moves forward relative to the attacking direction",
    };
  }

  if (delta < 0) {
    return {
      selectedActionType: TacticalActionType.SafeRecycle,
      selectedActionSubtype: "CENTRAL_REBUILD",
      reason: "ball moves back to rebuild possession",
    };
  }

  return {
    selectedActionType: TacticalActionType.CarryOrHold,
    selectedActionSubtype: "COUNTERPRESS_STABILIZATION",
    reason: "ball remains level while possession stabilizes",
  };
}
