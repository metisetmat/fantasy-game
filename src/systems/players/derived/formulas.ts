import { OffensiveProgressionPhilosophy, TacticalStyle } from "../../../models/tactics";
import { DERIVED_ROLE_MODIFIERS } from "./roleModifiers";
import { getFormulaInputValue, normalizeDerivedValue } from "./normalization";
import type {
  DerivedAttributeDebugEntry,
  DerivedAttributeFormula,
  DerivedAttributeKey,
  DerivedPlayerAttributes,
  DerivedPlayerAttributesResult,
  DerivePlayerAttributesInput,
} from "./types";

export const DERIVED_ATTRIBUTE_KEYS: readonly DerivedAttributeKey[] = [
  "supportTiming",
  "tacticalDiscipline",
  "spacingQuality",
  "pressReading",
  "restDefenseReliability",
  "contactSurvival",
  "longPlayQuality",
  "chaosCreation",
  "finishingComposure",
  "goalkeeperResponse",
  "recoveryRange",
  "ballSecurity",
  "scrambleAbility",
];

export const DERIVED_ATTRIBUTE_FORMULAS: Readonly<Record<DerivedAttributeKey, DerivedAttributeFormula>> = {
  supportTiming: {
    key: "supportTiming",
    terms: [
      { input: "vision", weight: 0.45 },
      { input: "composure", weight: 0.35 },
      { input: "handPlay", weight: 0.12 },
      { input: "endurance", weight: 0.08 },
    ],
  },
  tacticalDiscipline: {
    key: "tacticalDiscipline",
    terms: [
      { input: "composure", weight: 0.4 },
      { input: "vision", weight: 0.25 },
      { input: "inverseCreativity", weight: 0.35 },
    ],
  },
  spacingQuality: {
    key: "spacingQuality",
    terms: [
      { input: "vision", weight: 0.5 },
      { input: "composure", weight: 0.3 },
      { input: "speed", weight: 0.1 },
      { input: "endurance", weight: 0.1 },
    ],
  },
  pressReading: {
    key: "pressReading",
    terms: [
      { input: "vision", weight: 0.4 },
      { input: "speed", weight: 0.22 },
      { input: "endurance", weight: 0.18 },
      { input: "composure", weight: 0.15 },
      { input: "power", weight: 0.05 },
    ],
  },
  restDefenseReliability: {
    key: "restDefenseReliability",
    terms: [
      { input: "vision", weight: 0.35 },
      { input: "composure", weight: 0.3 },
      { input: "endurance", weight: 0.2 },
      { input: "speed", weight: 0.15 },
    ],
  },
  contactSurvival: {
    key: "contactSurvival",
    terms: [
      { input: "power", weight: 0.45 },
      { input: "composure", weight: 0.2 },
      { input: "ballCarrying", weight: 0.2 },
      { input: "endurance", weight: 0.15 },
    ],
  },
  longPlayQuality: {
    key: "longPlayQuality",
    terms: [
      { input: "footPlay", weight: 0.45 },
      { input: "vision", weight: 0.3 },
      { input: "composure", weight: 0.15 },
      { input: "creativity", weight: 0.1 },
    ],
  },
  chaosCreation: {
    key: "chaosCreation",
    terms: [
      { input: "creativity", weight: 0.45 },
      { input: "ballCarrying", weight: 0.25 },
      { input: "speed", weight: 0.2 },
      { input: "composure", weight: 0.1 },
    ],
  },
  finishingComposure: {
    key: "finishingComposure",
    terms: [
      { input: "composure", weight: 0.42 },
      { input: "footPlay", weight: 0.22 },
      { input: "handPlay", weight: 0.16 },
      { input: "vision", weight: 0.12 },
      { input: "power", weight: 0.08 },
    ],
  },
  goalkeeperResponse: {
    key: "goalkeeperResponse",
    terms: [
      { input: "handPlay", weight: 0.35 },
      { input: "vision", weight: 0.25 },
      { input: "composure", weight: 0.25 },
      { input: "speed", weight: 0.15 },
    ],
  },
  recoveryRange: {
    key: "recoveryRange",
    terms: [
      { input: "speed", weight: 0.45 },
      { input: "endurance", weight: 0.25 },
      { input: "vision", weight: 0.15 },
      { input: "composure", weight: 0.1 },
      { input: "power", weight: 0.05 },
    ],
  },
  ballSecurity: {
    key: "ballSecurity",
    terms: [
      { input: "handPlay", weight: 0.45 },
      { input: "composure", weight: 0.35 },
      { input: "power", weight: 0.1 },
      { input: "vision", weight: 0.05 },
      { input: "ballCarrying", weight: 0.05 },
    ],
  },
  scrambleAbility: {
    key: "scrambleAbility",
    terms: [
      { input: "speed", weight: 0.25 },
      { input: "power", weight: 0.22 },
      { input: "handPlay", weight: 0.2 },
      { input: "composure", weight: 0.18 },
      { input: "creativity", weight: 0.1 },
      { input: "ballCarrying", weight: 0.05 },
    ],
  },
};

function getPhilosophyModifier(key: DerivedAttributeKey, input: DerivePlayerAttributesInput): number {
  let modifier = 0;

  if (input.context.tacticalStyle === TacticalStyle.Control) {
    modifier += key === "supportTiming" || key === "spacingQuality" || key === "tacticalDiscipline" ? 2 : 0;
    modifier += key === "chaosCreation" ? -2 : 0;
  }

  if (input.context.tacticalStyle === TacticalStyle.Blitz) {
    modifier += key === "longPlayQuality" || key === "chaosCreation" || key === "recoveryRange" ? 2 : 0;
    modifier += key === "restDefenseReliability" ? -1 : 0;
  }

  switch (input.context.offensiveProgressionPhilosophy) {
    case OffensiveProgressionPhilosophy.CollectiveStructuredProgression:
      return modifier + (key === "supportTiming" || key === "spacingQuality" ? 2 : 0);
    case OffensiveProgressionPhilosophy.LongPlayLineBreaking:
      return modifier + (key === "longPlayQuality" || key === "recoveryRange" ? 3 : 0);
    case OffensiveProgressionPhilosophy.IndividualRupture:
      return modifier + (key === "chaosCreation" || key === "scrambleAbility" ? 3 : 0) + (key === "tacticalDiscipline" ? -2 : 0);
    case OffensiveProgressionPhilosophy.TerritorialSurvival:
      return modifier + (key === "restDefenseReliability" || key === "ballSecurity" ? 3 : 0) + (key === "chaosCreation" ? -3 : 0);
  }
}

export function derivePlayerAttributesWithDebug(input: DerivePlayerAttributesInput): DerivedPlayerAttributesResult {
  const roleModifiers = DERIVED_ROLE_MODIFIERS[input.role];
  const entries = DERIVED_ATTRIBUTE_KEYS.map((key) => {
    const formula = DERIVED_ATTRIBUTE_FORMULAS[key];
    const roleModifier = roleModifiers[key] + (input.isGoalkeeper && key === "restDefenseReliability" ? 4 : 0);
    const philosophyModifier = getPhilosophyModifier(key, input);
    const terms = formula.terms.map((term) => {
      const value = getFormulaInputValue(input.visible, term.input);
      return {
        label: term.input,
        value,
        weight: term.weight,
        contribution: value * term.weight,
      };
    });
    const weightedTotal = terms.reduce((total, term) => total + term.contribution, 0);
    const normalizedResult = normalizeDerivedValue({
      visible: input.visible,
      terms: formula.terms,
      roleModifier,
      philosophyModifier,
    });

    return {
      key,
      terms,
      weightedTotal,
      roleModifier,
      philosophyModifier,
      normalizedResult,
    };
  });
  const valueFor = (key: DerivedAttributeKey) => entries.find((entry) => entry.key === key)?.normalizedResult ?? 0;

  return {
    attributes: {
      supportTiming: valueFor("supportTiming"),
      tacticalDiscipline: valueFor("tacticalDiscipline"),
      spacingQuality: valueFor("spacingQuality"),
      pressReading: valueFor("pressReading"),
      restDefenseReliability: valueFor("restDefenseReliability"),
      contactSurvival: valueFor("contactSurvival"),
      longPlayQuality: valueFor("longPlayQuality"),
      chaosCreation: valueFor("chaosCreation"),
      finishingComposure: valueFor("finishingComposure"),
      goalkeeperResponse: valueFor("goalkeeperResponse"),
      recoveryRange: valueFor("recoveryRange"),
      ballSecurity: valueFor("ballSecurity"),
      scrambleAbility: valueFor("scrambleAbility"),
    },
    debug: entries,
  };
}
