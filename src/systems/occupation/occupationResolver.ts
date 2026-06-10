import type { PlayerMatchState } from "../players";
import { OccupationFunction, type OccupationFunctionScore, type StructureFreedomBalance } from "./occupationTypes";
import { getOccupationFunctionProfile } from "./occupationWeights";
import { describeOccupationBehavior } from "./occupationBehaviors";
import { isAheadOfBall, isBehindBall, zoneColumn, type FunctionalOccupationContext } from "./occupationContext";

const ALL_FUNCTIONS = Object.values(OccupationFunction);

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function isWideLane(zone: string): boolean {
  return zone.endsWith("-CL") || zone.endsWith("-CR") || zone.endsWith("-HSL") || zone.endsWith("-HSR");
}

function attribute(player: PlayerMatchState, key: "creativity" | "vision" | "composure" | "speed" | "endurance" | "power"): number {
  return player.visibleAttributes?.[key] ?? 60;
}

function derived(player: PlayerMatchState, key: "tacticalDiscipline" | "supportTiming" | "restDefenseReliability" | "chaosCreation"): number {
  return player.derivedAttributes?.[key] ?? 60;
}

export function calculateStructureFreedomBalance(input: {
  readonly player: PlayerMatchState;
  readonly style: "CONTROL" | "BLITZ";
  readonly contextPressure: number;
}): StructureFreedomBalance {
  const discipline = derived(input.player, "tacticalDiscipline");
  const creativity = attribute(input.player, "creativity");
  const composure = attribute(input.player, "composure");
  const styleStructure = input.style === "CONTROL" ? 72 : 46;
  const styleFreedom = input.style === "CONTROL" ? 30 : 58;
  const structure = clamp(styleStructure + discipline * 0.25 + composure * 0.12 - creativity * 0.14 - input.contextPressure * 0.06);
  const freedom = clamp(styleFreedom + creativity * 0.22 + (100 - discipline) * 0.18 + input.contextPressure * 0.08);
  const label = structure >= freedom + 18 ? "STRUCTURED" : freedom >= structure + 14 ? "FREE" : "BALANCED";
  const category =
    structure >= 92 && freedom <= 45
      ? "STRICT_STRUCTURE"
      : structure >= freedom + 16
        ? "DISCIPLINED_INTERPRETER"
        : freedom >= 84 && structure <= 58
          ? "FREE_ROAMER"
          : freedom >= structure + 8
            ? "CREATIVE_INTERPRETER"
            : "BALANCED_INTERPRETER";

  return {
    structure,
    freedom,
    label,
    category,
    reason:
      category === "STRICT_STRUCTURE"
        ? "high discipline and low risk keep the player close to the team structure"
        : category === "DISCIPLINED_INTERPRETER"
          ? "the player can interpret space, but structure remains the first reference"
          : category === "CREATIVE_INTERPRETER"
            ? "creativity and tactical intelligence allow controlled occupation drift"
            : category === "FREE_ROAMER"
              ? "risk appetite and style allow aggressive spatial freedom"
              : "structure and creative interpretation are both active",
  };
}

function roleBaseScore(input: {
  readonly player: PlayerMatchState;
  readonly style: "CONTROL" | "BLITZ";
  readonly functionType: OccupationFunction;
}): { readonly score: number; readonly reasons: readonly string[] } {
  const profile = getOccupationFunctionProfile(input.player.role, input.style);

  if (profile.forbidden.includes(input.functionType)) {
    return { score: -80, reasons: ["role forbids this function in current style"] };
  }

  if (profile.preferred.includes(input.functionType)) {
    return { score: 70, reasons: ["role preferred function"] };
  }

  if (profile.secondary.includes(input.functionType)) {
    return { score: 54, reasons: ["role secondary function"] };
  }

  return { score: 28, reasons: ["available but not role-priority"] };
}

function styleModifier(style: "CONTROL" | "BLITZ", functionType: OccupationFunction): { readonly value: number; readonly reason: string } {
  const controlBoosts = [
    OccupationFunction.SafeRecycle,
    OccupationFunction.SupportBehindBall,
    OccupationFunction.DirectSupport,
    OccupationFunction.ThirdManConnector,
    OccupationFunction.TempoController,
    OccupationFunction.RestDefenseAnchor,
    OccupationFunction.HalfSpaceRecycle,
  ];
  const blitzBoosts = [
    OccupationFunction.PressingTrap,
    OccupationFunction.PressTrigger,
    OccupationFunction.TransitionHunter,
    OccupationFunction.DepthThreat,
    OccupationFunction.ChaosAttacker,
    OccupationFunction.TempoAccelerator,
  ];

  if (style === "CONTROL" && controlBoosts.includes(functionType)) {
    return { value: 10, reason: "CONTROL style values connected occupation" };
  }

  if (style === "BLITZ" && blitzBoosts.includes(functionType)) {
    return { value: 12, reason: "BLITZ style values compression and transition" };
  }

  if (style === "CONTROL" && functionType === OccupationFunction.ChaosAttacker) {
    return { value: -12, reason: "CONTROL reduces unstable chaos occupation" };
  }

  if (style === "BLITZ" && functionType === OccupationFunction.SafeRecycle) {
    return { value: -8, reason: "BLITZ reduces slow recycle priority" };
  }

  return { value: 0, reason: "style neutral" };
}

function contextModifier(input: {
  readonly player: PlayerMatchState;
  readonly context: FunctionalOccupationContext;
  readonly functionType: OccupationFunction;
}): { readonly value: number; readonly reasons: readonly string[] } {
  const isPossessionTeam = input.player.teamId === input.context.possessionTeamId;
  const ahead = isAheadOfBall({
    playerZone: input.player.zone,
    ballZone: input.context.ballZone,
    attackingDirection: input.context.attackingDirection,
  });
  const behind = isBehindBall({
    playerZone: input.player.zone,
    ballZone: input.context.ballZone,
    attackingDirection: input.context.attackingDirection,
  });
  const sameColumnDistance = Math.abs(zoneColumn(input.player.zone) - zoneColumn(input.context.ballZone));
  const reasons: string[] = [];
  let value = 0;

  if (input.player.playerId === input.context.ballCarrierId && [OccupationFunction.TempoController, OccupationFunction.PressureAbsorber].includes(input.functionType)) {
    value += 18;
    reasons.push("ball carrier must organize or absorb pressure before supporting itself");
  }

  if (input.player.playerId === input.context.ballCarrierId && input.functionType === OccupationFunction.DirectSupport) {
    value -= 8;
    reasons.push("ball carrier cannot primarily be its own direct support");
  }

  if (isPossessionTeam && sameColumnDistance <= 1 && [OccupationFunction.DirectSupport, OccupationFunction.ThirdManConnector, OccupationFunction.HalfSpaceRecycle].includes(input.functionType)) {
    value += 10;
    reasons.push("near-ball support angle");
  }

  if (isPossessionTeam && behind && [OccupationFunction.SafeRecycle, OccupationFunction.SupportBehindBall, OccupationFunction.RestDefenseAnchor].includes(input.functionType)) {
    value += 12;
    reasons.push("behind-ball security value");
  }

  if (isPossessionTeam && ahead && [OccupationFunction.DepthThreat, OccupationFunction.ContactPlatform, OccupationFunction.WidthFixer].includes(input.functionType)) {
    value += 10;
    reasons.push("ahead-of-ball continuation value");
  }

  if (isPossessionTeam && isWideLane(input.player.zone) && [OccupationFunction.WidthFixer, OccupationFunction.WeakSideConnector, OccupationFunction.SwitchReceiver].includes(input.functionType)) {
    value += 9;
    reasons.push("wide corridor occupation");
  }

  if (!isPossessionTeam && sameColumnDistance <= 1 && [OccupationFunction.PressingTrap, OccupationFunction.PressTrigger, OccupationFunction.CoverShadowBlocker].includes(input.functionType)) {
    value += 12;
    reasons.push("ball-side defensive compression");
  }

  if (!isPossessionTeam && sameColumnDistance > 1 && [OccupationFunction.CounterpressBalancer, OccupationFunction.RestDefenseAnchor, OccupationFunction.CoverShadowBlocker].includes(input.functionType)) {
    value += 8;
    reasons.push("non-ball-side transition protection");
  }

  return { value, reasons };
}

function attributeModifier(input: {
  readonly player: PlayerMatchState;
  readonly functionType: OccupationFunction;
}): { readonly value: number; readonly reasons: readonly string[] } {
  const creativity = attribute(input.player, "creativity");
  const vision = attribute(input.player, "vision");
  const composure = attribute(input.player, "composure");
  const support = derived(input.player, "supportTiming");
  const discipline = derived(input.player, "tacticalDiscipline");
  const restDefense = derived(input.player, "restDefenseReliability");
  const chaos = derived(input.player, "chaosCreation");
  const reasons: string[] = [];
  let value = 0;

  if ([OccupationFunction.ThirdManConnector, OccupationFunction.WeakSideConnector, OccupationFunction.SwitchReceiver].includes(input.functionType)) {
    value += (vision - 60) * 0.12 + (creativity - 55) * 0.1;
    reasons.push("vision/creativity interpretation");
  }

  if ([OccupationFunction.SafeRecycle, OccupationFunction.DirectSupport, OccupationFunction.SupportBehindBall].includes(input.functionType)) {
    value += (support - 60) * 0.14 + (composure - 60) * 0.08;
    reasons.push("support play and composure");
  }

  if ([OccupationFunction.RestDefenseAnchor, OccupationFunction.CounterpressBalancer, OccupationFunction.CoverShadowBlocker].includes(input.functionType)) {
    value += (discipline - 58) * 0.14 + (restDefense - 58) * 0.16;
    reasons.push("discipline/rest-defense reliability");
  }

  if ([OccupationFunction.DepthThreat, OccupationFunction.TransitionHunter, OccupationFunction.ChaosAttacker, OccupationFunction.TempoAccelerator].includes(input.functionType)) {
    value += (creativity - 60) * 0.1 + (chaos - 55) * 0.13 + (attribute(input.player, "speed") - 60) * 0.08;
    reasons.push("risk appetite and acceleration");
  }

  return { value, reasons };
}

export function resolvePlayerFunctionalOccupation(input: {
  readonly player: PlayerMatchState;
  readonly context: FunctionalOccupationContext;
}): {
  readonly scores: readonly OccupationFunctionScore[];
  readonly balance: StructureFreedomBalance;
  readonly interpretation: string;
} {
  const style = input.context.teamStyles[input.player.teamId] ?? "CONTROL";
  const balance = calculateStructureFreedomBalance({
    player: input.player,
    style,
    contextPressure: input.player.pressure,
  });
  const scores = ALL_FUNCTIONS.map((functionType) => {
    const base = roleBaseScore({ player: input.player, style, functionType });
    const styleScore = styleModifier(style, functionType);
    const context = contextModifier({ player: input.player, context: input.context, functionType });
    const attributes = attributeModifier({ player: input.player, functionType });
    const score = clamp(base.score + styleScore.value + context.value + attributes.value);
    const reasons = [
      ...base.reasons,
      ...(styleScore.value === 0 ? [] : [styleScore.reason]),
      ...context.reasons,
      ...attributes.reasons,
    ];

    return {
      function: functionType,
      score,
      reasons,
    };
  }).sort((left, right) => right.score - left.score || left.function.localeCompare(right.function));
  const primary = scores[0]?.function ?? OccupationFunction.DirectSupport;

  return {
    scores,
    balance,
    interpretation: `${input.player.roleInitials} ${describeOccupationBehavior(primary)}; ${balance.category} because ${balance.reason}`,
  };
}
