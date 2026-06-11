import type { SpatialPlayerContext } from "../spatialContext";
import type { RouteAttributeInfluence } from "./routeAttributeInfluenceTypes";

const MAX_TOTAL_ATTRIBUTE_ADJUSTMENT = 12;
const MIN_TOTAL_ATTRIBUTE_ADJUSTMENT = -12;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function rating(value: number | undefined, fallback: number): number {
  return value ?? fallback;
}

function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 50;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function highAttributeModifier(value: number): number {
  if (value >= 88) {
    return 5;
  }

  if (value >= 78) {
    return 3;
  }

  if (value >= 65) {
    return 1;
  }

  if (value <= 40) {
    return -4;
  }

  if (value <= 52) {
    return -2;
  }

  return 0;
}

function fatigueModifier(player: SpatialPlayerContext): number {
  const freshness = average([player.currentCondition, player.mentalFreshness]);

  if (freshness >= 86) {
    return 2;
  }

  if (freshness <= 42) {
    return -6;
  }

  if (freshness <= 58) {
    return -3;
  }

  return 0;
}

function influence(input: {
  readonly player: SpatialPlayerContext;
  readonly category: RouteAttributeInfluence["category"];
  readonly modifier: number;
  readonly reason: string;
  readonly sourceAttributes: readonly string[];
  readonly confidence?: RouteAttributeInfluence["confidence"];
}): RouteAttributeInfluence {
  return {
    playerId: input.player.playerId,
    teamId: input.player.teamId,
    category: input.category,
    modifier: clamp(input.modifier, -8, 8),
    confidence: input.confidence ?? "medium",
    reason: input.reason,
    sourceAttributes: input.sourceAttributes,
  };
}

function actionFamily(actionType: string): "support" | "progress" | "rupture" | "third_man" | "shot" | "carry" {
  if (actionType.includes("SHOT") || actionType.includes("FINAL")) {
    return "shot";
  }

  if (actionType.includes("WEAK_SIDE") || actionType.includes("RUPTURE")) {
    return "rupture";
  }

  if (actionType.includes("THIRD")) {
    return "third_man";
  }

  if (actionType.includes("CARRY")) {
    return "carry";
  }

  if (actionType.includes("FORWARD") || actionType.includes("CONTACT")) {
    return "progress";
  }

  return "support";
}

export function clampRouteAttributeModifier(value: number): number {
  return clamp(value, MIN_TOTAL_ATTRIBUTE_ADJUSTMENT, MAX_TOTAL_ATTRIBUTE_ADJUSTMENT);
}

export function buildRouteAttributeInfluences(input: {
  readonly actor: SpatialPlayerContext;
  readonly receiver?: SpatialPlayerContext;
  readonly actionType: string;
  readonly laneState?: string;
  readonly pressureLevel?: string;
  readonly baseRisk?: number;
}): readonly RouteAttributeInfluence[] {
  const family = actionFamily(input.actionType);
  const influences: RouteAttributeInfluence[] = [];
  const actor = input.actor;
  const receiver = input.receiver;
  const pressureIsHigh = input.pressureLevel === "HIGH" || input.pressureLevel === "MEDIUM_HIGH";

  if (family === "support") {
    const actorSecurity = average([
      rating(actor.attributes.handPlay, 60),
      rating(actor.attributes.intelligence, 60),
      rating(actor.attributes.mental, 60),
    ]);
    influences.push(influence({
      player: actor,
      category: "PASS_SECURITY",
      modifier: highAttributeModifier(actorSecurity),
      reason: `${actor.playerId} improves recycle security through handPlay, intelligence and mental reliability.`,
      sourceAttributes: ["handPlay", "intelligence", "mental"],
    }));

    if (receiver !== undefined) {
      const receiverQuality = average([
        rating(receiver.attributes.handPlay, 60),
        rating(receiver.attributes.intelligence, 60),
        receiver.currentCondition,
        receiver.mentalFreshness,
      ]);
      influences.push(influence({
        player: receiver,
        category: "RECEPTION_QUALITY",
        modifier: highAttributeModifier(receiverQuality),
        reason: `${receiver.playerId} supports the recycle through reception quality and freshness.`,
        sourceAttributes: ["handPlay", "intelligence", "currentCondition", "mentalFreshness"],
      }));
      influences.push(influence({
        player: receiver,
        category: "SUPPORT_TIMING",
        modifier: receiver.tacticalFunctions.includes("pressure_escape_receiver") ? 2 : 0,
        reason: `${receiver.playerId} tactical functions describe pressure-escape support timing.`,
        sourceAttributes: ["tacticalFunctions"],
        confidence: "low",
      }));
    }
  }

  if (family === "progress") {
    const platform = receiver === undefined
      ? 50
      : average([
          rating(receiver.attributes.power, 60),
          rating(receiver.attributes.handPlay, 60),
          rating(receiver.attributes.endurance, 60),
          rating(receiver.attributes.mental, 60),
        ]);
    influences.push(influence({
      player: receiver ?? actor,
      category: "CONTACT_PLATFORM",
      modifier: highAttributeModifier(platform),
      reason: `${(receiver ?? actor).playerId} changes forward progress value through power, handling, endurance and mental stability.`,
      sourceAttributes: ["power", "handPlay", "endurance", "mental"],
    }));
  }

  if (family === "rupture") {
    const runner = receiver ?? actor;
    const rupture = average([
      rating(runner.attributes.speed, 60),
      rating(runner.attributes.footPlayDribble, 60),
      rating(runner.attributes.intelligence, 60),
    ]);
    influences.push(influence({
      player: runner,
      category: "RUPTURE_THREAT",
      modifier: highAttributeModifier(rupture) + (input.laneState === "CLOSED" ? -3 : 0),
      reason: input.laneState === "CLOSED"
        ? `${runner.playerId} has rupture qualities, but the closed lane keeps the route constrained.`
        : `${runner.playerId} improves rupture threat through speed, dribble quality and timing.`,
      sourceAttributes: ["speed", "footPlayDribble", "intelligence", "laneState"],
    }));
  }

  if (family === "third_man") {
    const link = receiver === undefined
      ? rating(actor.attributes.intelligence, 60)
      : average([
          rating(actor.attributes.intelligence, 60),
          rating(receiver.attributes.intelligence, 60),
          rating(actor.attributes.handPlay, 60),
          rating(receiver.attributes.handPlay, 60),
          rating(actor.attributes.mental, 60),
        ]);
    influences.push(influence({
      player: receiver ?? actor,
      category: "THIRD_MAN_LINK",
      modifier: highAttributeModifier(link),
      reason: "Third-man link reliability is adjusted from intelligence, handPlay and mental attributes.",
      sourceAttributes: ["intelligence", "handPlay", "mental"],
    }));
  }

  if (family === "shot") {
    const shotComposure = average([
      rating(actor.attributes.footPlayPassingShooting, 60),
      rating(actor.attributes.mental, 60),
      rating(actor.attributes.intelligence, 60),
      actor.currentCondition,
      actor.mentalFreshness,
    ]);
    influences.push(influence({
      player: actor,
      category: "FINAL_ACTION_COMPOSURE",
      modifier: highAttributeModifier(shotComposure) + (pressureIsHigh ? -2 : 0),
      reason: `${actor.playerId} final-action quality is adjusted by shooting, mental freshness and pressure.`,
      sourceAttributes: ["footPlayPassingShooting", "mental", "intelligence", "currentCondition", "mentalFreshness", "pressureLevel"],
    }));
  }

  if (family === "carry") {
    const carry = average([
      rating(actor.attributes.speed, 60),
      rating(actor.attributes.power, 60),
      rating(actor.attributes.footPlayDribble, 60),
      actor.currentCondition,
    ]);
    influences.push(influence({
      player: actor,
      category: "BALL_CARRY",
      modifier: highAttributeModifier(carry),
      reason: `${actor.playerId} carry value is adjusted by speed, power, dribble and condition.`,
      sourceAttributes: ["speed", "power", "footPlayDribble", "currentCondition"],
    }));
  }

  const fatigue = fatigueModifier(receiver ?? actor);
  if (fatigue !== 0) {
    influences.push(influence({
      player: receiver ?? actor,
      category: fatigue < 0 ? "FATIGUE_DRAG" : "PRESSURE_ESCAPE",
      modifier: fatigue,
      reason: fatigue < 0
        ? `${(receiver ?? actor).playerId} has fatigue or mental freshness drag that increases route fragility.`
        : `${(receiver ?? actor).playerId} freshness improves route reliability.`,
      sourceAttributes: ["currentCondition", "mentalFreshness"],
    }));
  }

  if ((input.baseRisk ?? 0) >= 70 || (pressureIsHigh && input.laneState === "CLOSED")) {
    influences.push(influence({
      player: receiver ?? actor,
      category: "TURNOVER_RISK",
      modifier: -3,
      reason: "High pressure or closed lane adds bounded turnover risk without changing lane legality.",
      sourceAttributes: ["baseRisk", "pressureLevel", "laneState"],
    }));
  }

  return influences.filter((item) => item.modifier !== 0);
}

export function applyRouteAttributeInfluence(input: {
  readonly baseScore: number;
  readonly influences: readonly RouteAttributeInfluence[];
}): number {
  const total = clampRouteAttributeModifier(
    input.influences.reduce((sum, influenceItem) => sum + influenceItem.modifier, 0),
  );

  return clamp(input.baseScore + total, 0, 100);
}
