import { TacticalStyle } from "../../../models/tactics";
import { ReceptionFollowUpRole, ReceptionQualityLevel } from "../../spatial";
import type { BallRelation, ReceptionQualityEvaluation } from "../../spatial";
import { ReceptionChainActionType, type BodyShapePreparation, type ChainTimingWindow, type ReceptionChainAction } from "./receptionChainTypes";

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function qualityValue(quality: ReceptionQualityLevel): number {
  switch (quality) {
    case ReceptionQualityLevel.Excellent:
      return 92;
    case ReceptionQualityLevel.Positive:
      return 78;
    case ReceptionQualityLevel.Neutral:
      return 56;
    case ReceptionQualityLevel.Negative:
      return 26;
  }
}

export function inferChainActionType(followUpRole: ReceptionFollowUpRole): ReceptionChainActionType {
  switch (followUpRole) {
    case ReceptionFollowUpRole.SecureRecycle:
      return ReceptionChainActionType.SecureRecycle;
    case ReceptionFollowUpRole.WallPass:
      return ReceptionChainActionType.WallPass;
    case ReceptionFollowUpRole.ThirdManSet:
      return ReceptionChainActionType.ThirdManSet;
    case ReceptionFollowUpRole.ContactPlatform:
      return ReceptionChainActionType.ContactPlatform;
    case ReceptionFollowUpRole.FastRelease:
      return ReceptionChainActionType.FastRelease;
    case ReceptionFollowUpRole.TurnAndProgress:
      return ReceptionChainActionType.DirectReception;
    case ReceptionFollowUpRole.HoldAndWait:
    case ReceptionFollowUpRole.Trapped:
    case ReceptionFollowUpRole.LikelyLoss:
      return ReceptionChainActionType.DirectReception;
  }
}

export function inferBodyShape(reception: ReceptionQualityEvaluation): BodyShapePreparation {
  return {
    bodyOpenToGoal: reception.ballRelation === "AHEAD" && reception.pressure <= 50,
    bodyOpenToSupport: reception.followUpRole !== ReceptionFollowUpRole.Trapped && reception.pressure <= 68,
    backToPressure: reception.ballRelation === "AHEAD" && reception.pressure >= 42,
    halfTurned: reception.ballRelation === "SAME_LINE" || reception.pressure <= 46,
    insideShoulderOpen:
      reception.followUpRole === ReceptionFollowUpRole.WallPass ||
      reception.followUpRole === ReceptionFollowUpRole.ThirdManSet ||
      reception.followUpRole === ReceptionFollowUpRole.FastRelease,
  };
}

export function estimateTimingWindow(reception: ReceptionQualityEvaluation, stepIndex: number): ChainTimingWindow {
  const pressureWindow = reception.pressure <= 38 ? 4 : reception.pressure <= 58 ? 3 : reception.pressure <= 72 ? 2 : 1;
  const followUpBonus =
    reception.followUpRole === ReceptionFollowUpRole.WallPass ||
    reception.followUpRole === ReceptionFollowUpRole.ThirdManSet ||
    reception.followUpRole === ReceptionFollowUpRole.ContactPlatform
      ? 1
      : 0;
  const closingTick = Math.max(stepIndex + 1, stepIndex + pressureWindow + followUpBonus);
  const defensiveRecoveryRisk = clamp(reception.pressure * 0.72 + stepIndex * 8);

  return {
    openingTick: stepIndex,
    closingTick,
    viability: clamp((closingTick - stepIndex) * 24 + qualityValue(reception.quality) * 0.28 - defensiveRecoveryRisk * 0.18),
    defensiveRecoveryRisk,
  };
}

export function laneStateForReception(reception: ReceptionQualityEvaluation): "OPEN" | "CONTESTED" | "CLOSED" | "TEMPORARY_WINDOW" {
  if (reception.pressure >= 76) {
    return "CLOSED";
  }

  if (reception.followUpRole === ReceptionFollowUpRole.ThirdManSet && reception.pressure <= 64) {
    return "TEMPORARY_WINDOW";
  }

  if (reception.pressure <= 34 && reception.quality !== ReceptionQualityLevel.Negative) {
    return "OPEN";
  }

  return "CONTESTED";
}

export function relationProgressionValue(relation: BallRelation): number {
  if (relation === "AHEAD") {
    return 70;
  }

  if (relation === "SAME_LINE") {
    return 46;
  }

  return 22;
}

export function estimateActionRisk(reception: ReceptionQualityEvaluation, stepIndex: number): number {
  const qualityRisk =
    reception.quality === ReceptionQualityLevel.Excellent
      ? -12
      : reception.quality === ReceptionQualityLevel.Positive
        ? -5
        : reception.quality === ReceptionQualityLevel.Neutral
          ? 9
          : 28;

  return clamp(reception.turnoverRisk * 0.72 + reception.pressure * 0.18 + qualityRisk + stepIndex * 7);
}

export function effectiveChainQuality(input: {
  readonly reception: ReceptionQualityEvaluation;
  readonly finalReceiver: ReceptionQualityEvaluation | null;
  readonly teamStyle: TacticalStyle;
}): ReceptionQualityLevel {
  if (input.reception.quality !== ReceptionQualityLevel.Neutral) {
    return input.reception.quality;
  }

  const protectedLayoff =
    input.reception.followUpRole === ReceptionFollowUpRole.WallPass ||
    input.reception.followUpRole === ReceptionFollowUpRole.ContactPlatform ||
    input.reception.followUpRole === ReceptionFollowUpRole.ThirdManSet;
  const finalContinuation =
    input.finalReceiver !== null &&
    input.finalReceiver.quality !== ReceptionQualityLevel.Negative &&
    (input.finalReceiver.ballRelation === "AHEAD" ||
      input.finalReceiver.followUpRole === ReceptionFollowUpRole.FastRelease ||
      input.finalReceiver.followUpRole === ReceptionFollowUpRole.ThirdManSet);

  if (protectedLayoff && finalContinuation && input.reception.pressure <= 66) {
    return ReceptionQualityLevel.Positive;
  }

  if (input.teamStyle === TacticalStyle.Control && protectedLayoff && input.reception.pressure <= 58) {
    return ReceptionQualityLevel.Positive;
  }

  return ReceptionQualityLevel.Neutral;
}

export function buildChainAction(input: {
  readonly fromPlayerId: string;
  readonly fromInitials: string;
  readonly fromZone: string;
  readonly reception: ReceptionQualityEvaluation;
  readonly finalReceiver: ReceptionQualityEvaluation | null;
  readonly stepIndex: number;
  readonly teamStyle: TacticalStyle;
}): ReceptionChainAction {
  const effectiveQuality = effectiveChainQuality({
    reception: input.reception,
    finalReceiver: input.finalReceiver,
    teamStyle: input.teamStyle,
  });
  const timing = estimateTimingWindow(input.reception, input.stepIndex);
  const risk = estimateActionRisk(input.reception, input.stepIndex);

  return {
    fromPlayerId: input.fromPlayerId,
    fromInitials: input.fromInitials,
    fromZone: input.fromZone,
    toPlayerId: input.reception.playerId,
    toInitials: input.reception.roleInitials,
    toZone: input.reception.zone,
    actionType: inferChainActionType(input.reception.followUpRole),
    receptionQuality: input.reception.quality,
    effectiveChainQuality: effectiveQuality,
    followUpRole: input.reception.followUpRole,
    nextActionWindow: timing,
    laneState: laneStateForReception(input.reception),
    pressure: input.reception.pressure,
    progressionGain: relationProgressionValue(input.reception.ballRelation),
    retentionGain: qualityValue(effectiveQuality),
    risk,
    bodyShape: inferBodyShape(input.reception),
  };
}

export function calculateChainTiming(actions: readonly ReceptionChainAction[]): ChainTimingWindow {
  const closingTick = actions.reduce((minimum, action) => Math.min(minimum, action.nextActionWindow.closingTick), 99);
  const defensiveRecoveryRisk = clamp(
    actions.reduce((sum, action) => sum + action.nextActionWindow.defensiveRecoveryRisk, 0) / Math.max(1, actions.length),
  );

  return {
    openingTick: 0,
    closingTick: closingTick === 99 ? 0 : closingTick,
    viability: clamp(actions.reduce((sum, action) => sum + action.nextActionWindow.viability, 0) / Math.max(1, actions.length)),
    defensiveRecoveryRisk,
  };
}
