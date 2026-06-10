import { LateralCorridor, type ZoneId } from "../../core/zones";
import { PlayerRole } from "../../models/player";
import { IntentType, type PlayerIntent } from "../intent";
import { AttackingDirection } from "../spatial/intention";
import { MovementType } from "./playerTrajectory";
import { shiftZoneByDirection } from "./directionality";

export function movementTypeForIntent(intentType: IntentType | string | null): MovementType {
  switch (intentType) {
    case IntentType.AttackDepth:
      return MovementType.DepthRun;
    case IntentType.SupportBall:
      return MovementType.SupportRun;
    case IntentType.PressBall:
      return MovementType.PressStep;
    case IntentType.RecoverStructure:
      return MovementType.RecoveryRun;
    case IntentType.OccupyWidth:
    case IntentType.AttackWeakSide:
      return MovementType.WidthRun;
    case IntentType.SweepDepth:
      return MovementType.Sweep;
    case IntentType.ContestLooseBall:
    case IntentType.AnticipateRebound:
      return MovementType.LooseBallAttack;
    case IntentType.ProtectRestDefense:
    case IntentType.ProtectGoalSide:
    case IntentType.ProtectFrame:
      return MovementType.CoverStep;
    default:
      return MovementType.Reposition;
  }
}

function roleWidthLane(role: PlayerRole): LateralCorridor | null {
  if (role === PlayerRole.LeftPiston) {
    return LateralCorridor.LeftCorridor;
  }

  if (role === PlayerRole.RightPiston) {
    return LateralCorridor.RightCorridor;
  }

  if (role === PlayerRole.SpaceHunter) {
    return LateralCorridor.RightHalfSpace;
  }

  return null;
}

export function resolveIntentTargetZone(input: {
  readonly originZone: ZoneId;
  readonly ballZone: ZoneId;
  readonly attackingDirection: AttackingDirection;
  readonly role: PlayerRole;
  readonly intent: PlayerIntent | null;
  readonly fallbackTargetZone?: ZoneId;
}): ZoneId {
  if (input.intent?.targetZone !== null && input.intent?.targetZone !== undefined) {
    return input.intent.targetZone;
  }

  if (input.fallbackTargetZone !== undefined) {
    return input.fallbackTargetZone;
  }

  const intentType = input.intent?.type ?? null;

  if (intentType === IntentType.AttackDepth) {
    const preferredLane = roleWidthLane(input.role);

    return shiftZoneByDirection({
      zone: input.originZone,
      attackingDirection: input.attackingDirection,
      longitudinalSteps: 2,
      ...(preferredLane === null ? {} : { preferredLane }),
    });
  }

  if (intentType === IntentType.OccupyWidth || intentType === IntentType.AttackWeakSide) {
    return shiftZoneByDirection({
      zone: input.originZone,
      attackingDirection: input.attackingDirection,
      longitudinalSteps: intentType === IntentType.AttackWeakSide ? 1 : 0,
      preferredLane: roleWidthLane(input.role) ?? LateralCorridor.RightHalfSpace,
    });
  }

  if (intentType === IntentType.SupportBall || intentType === IntentType.PressBall || intentType === IntentType.ContestLooseBall) {
    return input.ballZone;
  }

  if (
    intentType === IntentType.ProtectRestDefense ||
    intentType === IntentType.ProtectGoalSide ||
    intentType === IntentType.ProtectFrame ||
    intentType === IntentType.RecoverStructure
  ) {
    return shiftZoneByDirection({
      zone: input.ballZone,
      attackingDirection: input.attackingDirection,
      longitudinalSteps: -1,
      preferredLane: LateralCorridor.CentralAxis,
    });
  }

  return input.originZone;
}
