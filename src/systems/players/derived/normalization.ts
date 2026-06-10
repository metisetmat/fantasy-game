import type { Rating } from "../../../core/ratings";
import type { DerivedFormulaTerm, FormulaInputKey } from "./types";
import type { VisiblePlayerAttributes } from "../visibleAttributes";

export const DERIVED_ATTRIBUTE_MIN = 0;
export const DERIVED_ATTRIBUTE_MAX = 100;

export function clampDerivedValue(value: number): Rating {
  return Math.max(DERIVED_ATTRIBUTE_MIN, Math.min(DERIVED_ATTRIBUTE_MAX, Math.round(value)));
}

function applyPositiveModifierCompression(base: number, modifier: number): number {
  if (modifier <= 0) {
    return modifier;
  }

  const headroom = DERIVED_ATTRIBUTE_MAX - base;
  const compression = Math.max(0.25, Math.min(1, headroom / 25));

  return modifier * compression;
}

export function normalizeDerivedValue(input: {
  readonly visible: VisiblePlayerAttributes;
  readonly terms: readonly DerivedFormulaTerm[];
  readonly roleModifier: number;
  readonly philosophyModifier: number;
}): Rating {
  const weightTotal = input.terms.reduce((total, term) => total + term.weight, 0);
  const weightedTotal = input.terms.reduce((total, term) => total + getFormulaInputValue(input.visible, term.input) * term.weight, 0);
  const normalizedBase = weightTotal === 0 ? 0 : weightedTotal / weightTotal;
  const modifierImpact = applyPositiveModifierCompression(normalizedBase, input.roleModifier + input.philosophyModifier);

  return clampDerivedValue(normalizedBase + modifierImpact);
}

export function getFormulaInputValue(visible: VisiblePlayerAttributes, key: FormulaInputKey): Rating {
  if (key === "inverseCreativity") {
    return clampDerivedValue(100 - visible.creativity);
  }

  return visible[key];
}
