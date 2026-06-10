import type { Rating } from "../../../core/ratings";
import type { OffensiveProgressionPhilosophy, TacticalStyle } from "../../../models/tactics";
import type { PlayerRole } from "../../../models/player";
import type { VisiblePlayerAttributes } from "../visibleAttributes";

export type DerivedAttributeKey =
  | "supportTiming"
  | "tacticalDiscipline"
  | "spacingQuality"
  | "pressReading"
  | "restDefenseReliability"
  | "contactSurvival"
  | "longPlayQuality"
  | "chaosCreation"
  | "finishingComposure"
  | "goalkeeperResponse"
  | "recoveryRange"
  | "ballSecurity"
  | "scrambleAbility";

export interface DerivedPlayerAttributes {
  readonly supportTiming: Rating;
  readonly tacticalDiscipline: Rating;
  readonly spacingQuality: Rating;
  readonly pressReading: Rating;
  readonly restDefenseReliability: Rating;
  readonly contactSurvival: Rating;
  readonly longPlayQuality: Rating;
  readonly chaosCreation: Rating;
  readonly finishingComposure: Rating;
  readonly goalkeeperResponse: Rating;
  readonly recoveryRange: Rating;
  readonly ballSecurity: Rating;
  readonly scrambleAbility: Rating;
}

export interface RoleDerivedAttributeModifiers extends Readonly<Record<DerivedAttributeKey, number>> {}

export interface PlayerAttributeDerivationContext {
  readonly tacticalStyle: TacticalStyle;
  readonly offensiveProgressionPhilosophy: OffensiveProgressionPhilosophy;
}

export type FormulaInputKey = keyof VisiblePlayerAttributes | "inverseCreativity";

export interface DerivedFormulaTerm {
  readonly input: FormulaInputKey;
  readonly weight: number;
}

export interface DerivedAttributeFormula {
  readonly key: DerivedAttributeKey;
  readonly terms: readonly DerivedFormulaTerm[];
}

export interface DerivedFormulaDebugTerm {
  readonly label: string;
  readonly value: Rating;
  readonly weight: number;
  readonly contribution: number;
}

export interface DerivedAttributeDebugEntry {
  readonly key: DerivedAttributeKey;
  readonly terms: readonly DerivedFormulaDebugTerm[];
  readonly weightedTotal: number;
  readonly roleModifier: number;
  readonly philosophyModifier: number;
  readonly normalizedResult: Rating;
}

export interface DerivePlayerAttributesInput {
  readonly visible: VisiblePlayerAttributes;
  readonly role: PlayerRole;
  readonly context: PlayerAttributeDerivationContext;
  readonly isGoalkeeper: boolean;
}

export interface DerivedPlayerAttributesResult {
  readonly attributes: DerivedPlayerAttributes;
  readonly debug: readonly DerivedAttributeDebugEntry[];
}
