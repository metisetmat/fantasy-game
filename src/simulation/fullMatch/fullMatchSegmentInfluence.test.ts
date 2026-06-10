import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import {
  allSegmentInfluenceModifiers,
  createFullMatchSegmentInfluence,
} from "./fullMatchSegmentInfluence";
import { createInitialFullMatchSegmentState } from "./fullMatchSegmentState";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateFullMatchSegmentInfluence(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const initialState = createInitialFullMatchSegmentState(input);
  const stressedState = {
    ...initialState,
    segmentIndex: 4,
    score: {
      home: 9,
      away: 3,
    },
    repeatedPatternCount: 3,
    home: {
      ...initialState.home,
      condition: 78,
      mentalFreshness: 74,
      momentum: 63,
      pressureLoad: 70,
      defensiveStress: 66,
      scoringConfidence: 58,
    },
    away: {
      ...initialState.away,
      condition: 82,
      mentalFreshness: 80,
      momentum: 41,
      pressureLoad: 76,
      defensiveStress: 72,
      scoringConfidence: 42,
    },
  };
  const influence = createFullMatchSegmentInfluence(stressedState);
  const repeatedInfluence = createFullMatchSegmentInfluence(stressedState);
  const modifiers = allSegmentInfluenceModifiers(influence);

  assertTest(JSON.stringify(influence) === JSON.stringify(repeatedInfluence), "segment influence must be deterministic.");
  assertTest(influence.segmentIndex === 4, "segment influence must preserve segment index.");
  assertTest(influence.scoreState === "close", `expected close score state, received ${influence.scoreState}.`);
  assertTest(
    modifiers.every((modifier) => modifier >= -5 && modifier <= 5),
    `segment influence modifiers must remain bounded: ${modifiers.join(", ")}.`,
  );
  assertTest(
    influence.home.supportStabilityModifier < influence.home.momentumModifier,
    "fatigue and stress must temper support stability even when momentum is positive.",
  );
  assertTest(
    influence.global.repeatedPatternPressure > 0,
    "repeated pattern pressure must expose accumulated segment repetition.",
  );

  return [
    "segment influence is deterministic",
    "segment influence modifiers are bounded",
    "score state is derived from previous segment score",
    "fatigue and stress temper support stability",
    "repeated pattern pressure is exposed",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchSegmentInfluence();

  console.log("fullMatchSegmentInfluence tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
