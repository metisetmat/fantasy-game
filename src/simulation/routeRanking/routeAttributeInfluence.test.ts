import type { SpatialPlayerContext } from "../spatialContext";
import { applyRouteAttributeInfluence, buildRouteAttributeInfluences, clampRouteAttributeModifier } from "./routeAttributeInfluence";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function player(input: {
  readonly playerId: string;
  readonly speed?: number;
  readonly power?: number;
  readonly handPlay?: number;
  readonly footPlayDribble?: number;
  readonly footPlayPassingShooting?: number;
  readonly intelligence?: number;
  readonly mental?: number;
  readonly condition?: number;
  readonly freshness?: number;
  readonly functions?: readonly string[];
}): SpatialPlayerContext {
  return {
    playerId: input.playerId,
    teamId: "control",
    role: "test_role",
    displayRole: "Test Role",
    zone: "Z3-HSL",
    isStarter: true,
    isGoalkeeper: false,
    isBallCarrier: false,
    currentCondition: input.condition ?? 86,
    mentalFreshness: input.freshness ?? 86,
    attributes: {
      speed: input.speed ?? 70,
      power: input.power ?? 70,
      endurance: 80,
      handPlay: input.handPlay ?? 70,
      footPlayDribble: input.footPlayDribble ?? 70,
      footPlayPassingShooting: input.footPlayPassingShooting ?? 70,
      intelligence: input.intelligence ?? 70,
      mental: input.mental ?? 70,
    },
    tacticalFunctions: input.functions ?? [],
  };
}

export function validateRouteAttributeInfluence(): readonly string[] {
  const strongActor = player({ playerId: "actor", handPlay: 92, intelligence: 90, mental: 88 });
  const strongReceiver = player({
    playerId: "receiver",
    handPlay: 90,
    intelligence: 88,
    condition: 92,
    freshness: 90,
    functions: ["pressure_escape_receiver"],
  });
  const supportInfluences = buildRouteAttributeInfluences({
    actor: strongActor,
    receiver: strongReceiver,
    actionType: "SUPPORT_CLUSTER_RECYCLE",
    laneState: "CLOSED",
    pressureLevel: "HIGH",
    baseRisk: 20,
  });
  const supportAdjusted = applyRouteAttributeInfluence({
    baseScore: 70,
    influences: supportInfluences,
  });
  const tiredShooter = player({
    playerId: "tired-shooter",
    footPlayPassingShooting: 84,
    mental: 35,
    intelligence: 50,
    condition: 38,
    freshness: 34,
  });
  const shotInfluences = buildRouteAttributeInfluences({
    actor: tiredShooter,
    actionType: "SHOT",
    pressureLevel: "HIGH",
    baseRisk: 80,
  });
  const shotAdjusted = applyRouteAttributeInfluence({ baseScore: 60, influences: shotInfluences });
  const fastRunner = player({
    playerId: "fast-runner",
    speed: 95,
    footPlayDribble: 90,
    intelligence: 86,
  });
  const ruptureInfluences = buildRouteAttributeInfluences({
    actor: strongActor,
    receiver: fastRunner,
    actionType: "WEAK_SIDE_SWITCH",
    laneState: "CLOSED",
  });
  const platformInfluences = buildRouteAttributeInfluences({
    actor: strongActor,
    receiver: player({ playerId: "platform", power: 93, handPlay: 88, mental: 84 }),
    actionType: "FORWARD_PROGRESS",
  });

  assertTest(supportAdjusted > 70, "high handPlay and intelligence must improve support/recycle reliability.");
  assertTest(
    supportInfluences.some((item) => item.category === "PASS_SECURITY") &&
      supportInfluences.some((item) => item.category === "RECEPTION_QUALITY"),
    "support/recycle influences must explain pass security and reception quality.",
  );
  assertTest(shotAdjusted < 60, "low condition and mental freshness must increase final-action risk.");
  assertTest(
    shotInfluences.some((item) => item.category === "FATIGUE_DRAG" || item.category === "TURNOVER_RISK"),
    "shot risk must include fatigue or turnover explanation.",
  );
  assertTest(
    ruptureInfluences.some((item) => item.category === "RUPTURE_THREAT" && item.reason.includes("closed lane")),
    "high speed may improve rupture threat but must not override closed lane legality.",
  );
  assertTest(
    platformInfluences.some((item) => item.category === "CONTACT_PLATFORM" && item.modifier > 0),
    "power and handPlay must improve contact platform value.",
  );
  assertTest(clampRouteAttributeModifier(99) === 12, "positive modifiers must be bounded at +12.");
  assertTest(clampRouteAttributeModifier(-99) === -12, "negative modifiers must be bounded at -12.");

  return [
    "support/recycle attributes improve reliability",
    "fatigue and mental freshness increase risk",
    "rupture threat does not override closed lane legality",
    "contact platform value uses power and handPlay",
    "route attribute modifiers are bounded",
  ];
}

if (require.main === module) {
  const checks = validateRouteAttributeInfluence();

  console.log("routeAttributeInfluence tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
