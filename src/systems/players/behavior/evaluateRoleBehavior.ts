import { PressureLevel } from "../../../models/match";
import { SpatialMoveType } from "../../spatial/intention/types";
import { getPressureConservatism, getRoleBehaviorProfile } from "./roleBehaviorProfiles";
import type { RoleBehaviorContext, RoleBehaviorEvaluation } from "./types";

function isConservativeMove(moveType: SpatialMoveType): boolean {
  return (
    moveType === SpatialMoveType.LateralCirculation ||
    moveType === SpatialMoveType.BackwardRecycle ||
    moveType === SpatialMoveType.SafetyClearance
  );
}

function isAggressiveMove(moveType: SpatialMoveType): boolean {
  return (
    moveType === SpatialMoveType.Progression ||
    moveType === SpatialMoveType.DirectVerticalAttack ||
    moveType === SpatialMoveType.WeakSideSwitch ||
    moveType === SpatialMoveType.Finishing
  );
}

export function evaluateRoleBehavior(input: RoleBehaviorContext): RoleBehaviorEvaluation {
  const profile = getRoleBehaviorProfile(input.role, input.tacticalStyle);
  const baseBias = profile.moveBiases[input.moveType] ?? 0;
  const chaosModifier = Math.round((input.chaosLevel - 50) * profile.chaosRiskResponse);
  const fatigueModifier =
    input.fatigue <= 35 || !isAggressiveMove(input.moveType)
      ? 0
      : -Math.round((input.fatigue - 35) * profile.fatigueConservatism);
  const pressureConservatism = getPressureConservatism(profile, input.pressure);
  const pressureModifier =
    pressureConservatism === 0
      ? 0
      : isConservativeMove(input.moveType)
        ? pressureConservatism
        : -pressureConservatism;
  const momentumModifier =
    input.momentum >= 65 && isAggressiveMove(input.moveType)
      ? Math.round((input.momentum - 60) * 0.12)
      : 0;
  const modifier = baseBias + chaosModifier + fatigueModifier + pressureModifier + momentumModifier;

  return {
    role: input.role,
    source: profile.source,
    modifier,
    riskTolerance: profile.riskTolerance,
    reasons: [
      `role behavior source: ${profile.source}`,
      `${profile.normalBehavior}`,
      ...(baseBias !== 0 ? [`move bias ${baseBias >= 0 ? "+" : ""}${baseBias}`] : []),
      ...(chaosModifier !== 0 ? [`chaos modulation ${chaosModifier >= 0 ? "+" : ""}${chaosModifier}`] : []),
      ...(fatigueModifier !== 0 ? [`fatigue modulation ${fatigueModifier}`] : []),
      ...(pressureModifier !== 0
        ? [`${input.pressure === PressureLevel.High ? "high" : "medium"} pressure behavior ${pressureModifier >= 0 ? "+" : ""}${pressureModifier}`]
        : []),
      ...(momentumModifier !== 0 ? [`momentum behavior +${momentumModifier}`] : []),
    ],
  };
}
