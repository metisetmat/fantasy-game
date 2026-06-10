import { ReceiverAvailabilityLevel, PassingLaneDifficulty } from "../spatial/localAdvantage";
import { BallSpeedState, PrincipleQuality, type PrincipleModifier, type PrincipleModifierInput } from "./types";

function modifier(label: string, value: number): PrincipleModifier {
  return {
    label,
    value: Math.round(value),
  };
}

export function evaluatePrincipleModifiers(input: PrincipleModifierInput): readonly PrincipleModifier[] {
  const modifiers: PrincipleModifier[] = [];
  const local = input.localAdvantage;
  const attacking = input.principles.attacking;
  const defensive = input.principles.defensive;
  const transition = input.principles.transition;

  if (local.numerical.attackersInTarget > local.numerical.defendersInTarget) {
    const edge = local.numerical.attackersInTarget - local.numerical.defendersInTarget;
    modifiers.push(modifier(edge >= 2 ? "3v2/2v1 local superiority" : "local 1-player edge", edge >= 2 ? 26 : 18));
  }

  if (local.numerical.attackersInTarget < local.numerical.defendersInTarget) {
    modifiers.push(modifier("overloaded defense in target", -14 - (local.numerical.defendersInTarget - local.numerical.attackersInTarget) * 7));
  }

  if (local.receiver.level === ReceiverAvailabilityLevel.Free) {
    modifiers.push(modifier("positive reception target", 26));
  } else if (local.receiver.level === ReceiverAvailabilityLevel.Supported) {
    modifiers.push(modifier("receiver supported", 12));
  } else if (local.receiver.level === ReceiverAvailabilityLevel.Isolated) {
    modifiers.push(modifier("isolated carrier risk", -18));
  } else if (local.receiver.level === ReceiverAvailabilityLevel.Unavailable) {
    modifiers.push(modifier("no receiver in target", -34));
  }

  if (local.passingLane.difficulty === PassingLaneDifficulty.Open) {
    modifiers.push(modifier("uncovered corridor", 18));
  } else if (local.passingLane.difficulty === PassingLaneDifficulty.Closed) {
    modifiers.push(modifier("dead corridor / cover shadow", -26));
  }

  if (local.numerical.attackersInTarget === 0 && local.numerical.defendersInTarget > 0) {
    modifiers.push(modifier("target occupied only by defender", -38));
  }

  if (local.numerical.targetZone.endsWith("-C") && local.numerical.attackersInTarget > local.numerical.defendersInTarget) {
    modifiers.push(modifier("central overload", 18));
  }

  if (local.numerical.nearbySupport <= 1 && (local.numerical.targetZone.endsWith("-CL") || local.numerical.targetZone.endsWith("-CR"))) {
    modifiers.push(modifier("far-side long pass risk", -10));
  }

  if (local.numerical.nearbySupport >= 2 && local.numerical.goalSideDefenders <= 3) {
    modifiers.push(modifier("support triangle", 16));
  }

  if (local.numerical.nearbySupport >= 3 && local.receiver.level !== ReceiverAvailabilityLevel.Unavailable) {
    modifiers.push(modifier("third-man / pod support", 14));
  }

  if (local.numerical.nearbySupport <= 1 && local.receiver.level === ReceiverAvailabilityLevel.Isolated) {
    modifiers.push(modifier("no support around carrier", -22));
  }

  if (local.numerical.goalSideDefenders <= 2 && local.numerical.attackersInTarget >= 1) {
    modifiers.push(modifier("depth runner threatens last line", 16));
  }

  if (attacking.restAttackBalance === PrincipleQuality.Good) {
    modifiers.push(modifier("rest defense secure", 6));
  } else if (attacking.restAttackBalance === PrincipleQuality.Poor) {
    modifiers.push(modifier("poor rest defense", -12));
  }

  if (attacking.frontFootBall === BallSpeedState.FrontFoot) {
    modifiers.push(modifier("front-foot ball", 8));
  } else if (attacking.frontFootBall === BallSpeedState.BackFoot) {
    modifiers.push(modifier("back-foot ball", -8));
  }

  if (attacking.openSideThreat === PrincipleQuality.Good) {
    modifiers.push(modifier("open-side threat", 9));
  }

  if (defensive.axisProtection === PrincipleQuality.Poor) {
    modifiers.push(modifier("axis unprotected", 12));
  } else if (defensive.axisProtection === PrincipleQuality.Good) {
    modifiers.push(modifier("axis protected", -8));
  }

  if (defensive.pressingTrapQuality === PrincipleQuality.Good) {
    modifiers.push(modifier("pressing trap set", -9));
  }

  if (transition.secondWaveSupport === PrincipleQuality.Good) {
    modifiers.push(modifier("second-wave support", 7));
  }

  if (transition.defensiveRestDefense === PrincipleQuality.Poor) {
    modifiers.push(modifier("defensive rest defense broken", 10));
  }

  return modifiers.filter((item) => item.value !== 0);
}
