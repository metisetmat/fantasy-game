import type { TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import type { AttackingDirection } from "../spatial/intention";

export interface DangerNonShotAffordanceContext {
  readonly matchId: string;
  readonly possessionId: string;
  readonly dangerPhaseId: string;
  readonly teamId: TeamId;
  readonly ballCarrierId: string;
  readonly ballZone: ZoneId | "UNKNOWN";
  readonly ballLane: string;
  readonly attackingDirection: AttackingDirection | "UNKNOWN";
  readonly phase: string;
  readonly dangerScore: number;
  readonly pressureLevel: string;
  readonly attackingMomentum: number;
  readonly restDefenseState: string;
  readonly defensiveCompactness: number;
  readonly wideAccessQuality: number;
  readonly lateralAccessQuality: number;
  readonly supportArrivalQuality: number;
  readonly ballControlScore: number;
  readonly bodyControlScore: number;
  readonly carrierMomentum: number;
  readonly fatiguePenalty: number;
  readonly contactPressure: number;
  readonly tacklePressure: number;
  readonly defenderGoalLinePressure: number;
  readonly shotQuality: number;
  readonly shotWindowQuality: number;
  readonly dropWindowQuality: number;
  readonly tryAccessQuality: number;
  readonly recycleValue: number;
  readonly carryOrHoldValue: number;
}

export type DangerNonShotAffordanceType =
  | "TRY_LATERAL_ACCESS_AFFORDANCE"
  | "TRY_WEAK_SIDE_ACCESS_AFFORDANCE"
  | "TRY_OUTER_HALF_SPACE_AFFORDANCE"
  | "TRY_CONTACT_AND_GROUNDING_AFFORDANCE"
  | "DROP_SET_DEFENSE_AFFORDANCE"
  | "DROP_PHASE_END_AFFORDANCE"
  | "DROP_BROKEN_PLAY_AFFORDANCE"
  | "DROP_LOW_SHOT_QUALITY_AFFORDANCE"
  | "DROP_PRESSURE_RELEASE_AFFORDANCE"
  | "RECYCLE_TO_NON_SHOT_SETUP_AFFORDANCE"
  | "CARRY_TO_NON_SHOT_SETUP_AFFORDANCE";

export type DangerNonShotRouteOutput =
  | "TRY_TOUCHDOWN_AFFORDANCE"
  | "DROP_GOAL_AFFORDANCE"
  | "NON_SHOT_SETUP_AFFORDANCE";

export type DangerNonShotRecommendation =
  | "KEEP_NON_SHOT_AFFORDANCE_MODEL"
  | "INCREASE_TRY_AFFORDANCES"
  | "INCREASE_DROP_AFFORDANCES"
  | "INCREASE_NON_SHOT_SETUP_AFFORDANCES"
  | "REDUCE_OVERBROAD_NON_SHOT_AFFORDANCES"
  | "DIAGNOSE_CANDIDATE_SELECTION"
  | "NEEDS_MORE_SAMPLE";

export interface DangerNonShotAffordanceTableRow {
  readonly route: "TRY_TOUCHDOWN" | "DROP_GOAL" | "NON_SHOT_SETUP" | "SHOT_GOAL";
  readonly previousAffordances: number;
  readonly newAffordances: number;
  readonly delta: number;
  readonly selected: number;
  readonly attempts: number;
  readonly scores: number;
  readonly interpretation: string;
}

export interface DangerNonShotAffordanceSummary {
  readonly detectorActive: true;
  readonly previousTryTouchdownAffordances: number;
  readonly newTryTouchdownAffordances: number;
  readonly previousDropGoalAffordances: number;
  readonly newDropGoalAffordances: number;
  readonly previousNonShotAffordanceShare: number;
  readonly newNonShotAffordanceShare: number;
  readonly nonShotSetupAffordances: number;
  readonly shotAffordances: number;
  readonly shotOnlyDangerPhasesBeforeSprint: number;
  readonly dangerPhasesGainingTryAffordance: number;
  readonly dangerPhasesGainingDropAffordance: number;
  readonly dangerPhasesGainingSetupAffordance: number;
  readonly dangerPhasesStillShotOnly: number;
  readonly dangerPhasesWithoutNonShotAffordance: number;
  readonly illegalTryAffordanceCount: number;
  readonly offBallInGoalOccupancyCount: number;
  readonly illegalDropAffordanceCount: number;
  readonly setupScoringEventCount: number;
  readonly noLegalLateralAccessCount: number;
  readonly noBodyControlCount: number;
  readonly pressureTooHighCount: number;
  readonly shotClearlySuperiorCount: number;
  readonly dropSetupUnavailableCount: number;
  readonly recycleCarryValueTooLowCount: number;
  readonly missingDataCount: number;
  readonly recommendation: DangerNonShotRecommendation;
  readonly tableRows: readonly DangerNonShotAffordanceTableRow[];
}
