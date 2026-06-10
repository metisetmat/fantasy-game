import type { ScoringEventFamily } from "./scoringEventTypes";

export type RegisteredScoringAction = "SHOT_GOAL" | "TRY_TOUCHDOWN" | "CONVERSION_GOAL" | "DROP_GOAL" | "PENALTY_SHOT";

export interface ScoringActionRegistryEntry {
  readonly action: RegisteredScoringAction;
  readonly active: boolean;
  readonly points?: number;
  readonly family: ScoringEventFamily;
  readonly requiresPreviousScoringAction?: RegisteredScoringAction;
}

export const ACTIVE_SCORING_ACTION_REGISTRY: readonly ScoringActionRegistryEntry[] = [
  { action: "SHOT_GOAL", active: true, points: 3, family: "SHOT" },
  { action: "TRY_TOUCHDOWN", active: true, points: 5, family: "TRY_TOUCHDOWN" },
  { action: "CONVERSION_GOAL", active: true, points: 2, family: "CONVERSION", requiresPreviousScoringAction: "TRY_TOUCHDOWN" },
  { action: "DROP_GOAL", active: true, points: 2, family: "DROP_GOAL" },
  { action: "PENALTY_SHOT", active: false, family: "PENALTY_SHOT" },
];

export function scoringRegistryEntry(action: RegisteredScoringAction): ScoringActionRegistryEntry {
  const entry = ACTIVE_SCORING_ACTION_REGISTRY.find((item) => item.action === action);

  if (entry === undefined) {
    throw new Error(`Unknown scoring action: ${action}`);
  }

  return entry;
}

export function scoringActionLabel(action: RegisteredScoringAction): string {
  const entry = scoringRegistryEntry(action);

  return entry.active ? `${entry.action} = ${entry.points ?? 0} points` : `${entry.action} inactive`;
}
