import type { ZoneId } from "../../core/zones";
import type { DropGoalLegality } from "./dropGoalLegalityTypes";

export function resolveDropGoalLegality(input: {
  readonly ballZone: ZoneId | string;
  readonly openPlay: boolean;
  readonly controlledPossession: boolean;
  readonly validDropSetup: boolean;
  readonly afterTryConversion: boolean;
}): DropGoalLegality {
  const notInInGoal = !input.ballZone.startsWith("Z0") && !input.ballZone.startsWith("Z8");
  const zoneAllowed = notInInGoal && /Z[2-7]-(C|CL|CR|HSL|HSR)/.test(input.ballZone);
  const notAfterTryConversion = !input.afterTryConversion;
  const legal = zoneAllowed && input.openPlay && input.controlledPossession && input.validDropSetup && notInInGoal && notAfterTryConversion;
  const failedReasons = [
    ...(zoneAllowed ? [] : [`zone ${input.ballZone} is not a legal open-play drop goal zone`]),
    ...(input.openPlay ? [] : ["not open play"]),
    ...(input.controlledPossession ? [] : ["controlled possession missing"]),
    ...(input.validDropSetup ? [] : ["valid drop setup missing"]),
    ...(notInInGoal ? [] : ["Z0/Z8 in-goal zones cannot generate drop goals"]),
    ...(notAfterTryConversion ? [] : ["conversion / post-try state cannot generate drop goal"]),
  ];

  return {
    legal,
    reason: legal ? "legal open-play drop goal context outside Z0/Z8 with controlled possession and valid drop setup" : failedReasons.join("; "),
    zoneAllowed,
    openPlay: input.openPlay,
    controlledPossession: input.controlledPossession,
    validDropSetup: input.validDropSetup,
    notInInGoal,
    notAfterTryConversion,
  };
}
