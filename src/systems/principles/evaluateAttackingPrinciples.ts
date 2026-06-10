import { LateralCorridor } from "../../core/zones";
import { TacticalStyle } from "../../models/tactics";
import { getDirectionalDistance, type BallContext } from "../spatial/intention";
import { PitchSide, type SpatialTeamContext, type WeakSideEvaluation } from "../spatial";
import { getPitchSideForZone, type SideContextEvaluation } from "../spatial/sides";
import { getZoneParts } from "../spatial/utils";
import { BallSpeedState, PrincipleQuality, type AttackingPrinciples } from "./types";

function quality(value: number): PrincipleQuality {
  if (value >= 67) {
    return PrincipleQuality.Good;
  }

  if (value <= 34) {
    return PrincipleQuality.Poor;
  }

  return PrincipleQuality.Medium;
}

function countOccupiedCorridors(team: SpatialTeamContext): number {
  return new Set(team.players.map((player) => getZoneParts(player.currentZone).lateralCorridor)).size;
}

function supportBehindBall(input: {
  readonly team: SpatialTeamContext;
  readonly ballContext: BallContext;
}): number {
  const ballZone = getZoneParts(input.ballContext.ballLocation).longitudinalZone;

  return input.team.players.filter((player) => {
    const playerZone = getZoneParts(player.currentZone).longitudinalZone;
    return getDirectionalDistance(playerZone, ballZone, input.ballContext.attackingDirection) >= 0;
  }).length;
}

function getShortSide(ballContext: BallContext): PitchSide {
  const lane = getZoneParts(ballContext.ballLocation).lateralCorridor;

  if (lane === LateralCorridor.LeftCorridor || lane === LateralCorridor.LeftHalfSpace) {
    return PitchSide.Left;
  }

  if (lane === LateralCorridor.RightCorridor || lane === LateralCorridor.RightHalfSpace) {
    return PitchSide.Right;
  }

  return PitchSide.Center;
}

export function evaluateAttackingPrinciples(input: {
  readonly team: SpatialTeamContext;
  readonly ballContext: BallContext;
  readonly sideContext: SideContextEvaluation;
  readonly weakSide: WeakSideEvaluation;
  readonly territorialPressure: number;
  readonly chaosLevel: number;
}): AttackingPrinciples {
  const occupiedCorridors = countOccupiedCorridors(input.team);
  const supportBehind = supportBehindBall({
    team: input.team,
    ballContext: input.ballContext,
  });
  const collectiveness = input.team.tacticalInstructions.offensive.collectiveness;
  const verticality = input.team.tacticalInstructions.offensive.verticality;
  const widthOccupation = Math.min(100, occupiedCorridors * 18 + collectiveness * 0.15 + input.territorialPressure * 0.08);
  const shortSide = getShortSide(input.ballContext);
  const openSide = input.sideContext.openSide;
  const blitzDepth = input.team.tacticalStyle === TacticalStyle.Blitz ? verticality * 0.22 : 0;
  const gainLineScore = input.territorialPressure * 0.35 + verticality * 0.25 + input.weakSide.exposure * 0.2 + blitzDepth;
  const frontFootBall =
    gainLineScore >= 64
      ? BallSpeedState.FrontFoot
      : input.chaosLevel >= 70 && supportBehind <= 1
        ? BallSpeedState.BackFoot
        : BallSpeedState.Neutral;

  return {
    widthOccupation,
    fiveCorridorStretch: occupiedCorridors >= 5 ? PrincipleQuality.Good : occupiedCorridors >= 4 ? PrincipleQuality.Medium : PrincipleQuality.Poor,
    supportBehindBall: supportBehind,
    thirdManAvailability: quality(collectiveness * 0.55 + supportBehind * 10),
    staggeredSupport: quality(input.team.collectiveProperties.collectiveMobility * 0.5 + collectiveness * 0.35),
    overloadCreation: quality(input.weakSide.exposure * 0.45 + input.territorialPressure * 0.25 + occupiedCorridors * 7),
    underloadThreat: quality(verticality * 0.42 + input.weakSide.exposure * 0.25),
    shortSideThreat: quality(shortSide === openSide ? 35 : 48 + input.weakSide.exposure * 0.2),
    openSideThreat: quality(input.weakSide.exposure * 0.45 + (openSide === getPitchSideForZone(input.ballContext.ballLocation) ? 0 : 25)),
    restAttackBalance: supportBehind >= 3 ? PrincipleQuality.Good : supportBehind >= 2 ? PrincipleQuality.Medium : PrincipleQuality.Poor,
    gainLineThreat: quality(gainLineScore),
    frontFootBall,
    occupiedCorridors,
    shortSide,
    openSide,
  };
}
