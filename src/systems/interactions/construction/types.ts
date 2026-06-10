import type { TeamId } from "../../../core/ids";
import type { Rating, TacticalTick } from "../../../core/ratings";
import type { ZoneId } from "../../../core/zones";
import type { PlayerRole } from "../../../models/player";
import type { SpatialMoveType } from "../../spatial/intention";
import type { FinishingTriggerEvaluation } from "../finishing";
import type { InteractionScoreBreakdown, TacticalLogLine } from "../shared";
import type { InteractionType } from "../types";

export enum ConstructionOutcome {
  BlockStretched = "block_stretched",
  TerritorialProgression = "territorial_progression",
  WeakSideCreated = "weak_side_created",
  PossessionRecycled = "possession_recycled",
  ConstructionStalled = "construction_stalled",
  ForcedBackwardCirculation = "forced_backward_circulation",
  DangerousInterception = "dangerous_interception",
}

export enum ConstructionContextUpdateType {
  BlockManipulated = "block_manipulated",
  TerritoryGained = "territory_gained",
  WeakSideOpened = "weak_side_opened",
  RhythmControlled = "rhythm_controlled",
  ConstructionSlowed = "construction_slowed",
  InterceptionThreat = "interception_threat",
  FinishingOpportunityPending = "finishing_opportunity_pending",
}

export enum ConstructionDangerLevel {
  Low = "LOW",
  Medium = "MEDIUM",
  High = "HIGH",
}

export interface BlockManipulationEvaluation {
  readonly manipulationQuality: Rating;
  readonly widthUsage: Rating;
  readonly rhythmControl: Rating;
  readonly keyOrganizerRole: PlayerRole;
  readonly breakdown: readonly InteractionScoreBreakdown[];
}

export interface TerritorialProgressionEvaluation {
  readonly progressionQuality: Rating;
  readonly territorialPressure: Rating;
  readonly weakSideOpportunity: Rating;
  readonly targetZone: ZoneId;
  readonly breakdown: readonly InteractionScoreBreakdown[];
}

export interface DefensiveBlockStabilityEvaluation {
  readonly blockStability: Rating;
  readonly centralResistance: Rating;
  readonly slideMobility: Rating;
  readonly keyDefenderRole: PlayerRole;
  readonly breakdown: readonly InteractionScoreBreakdown[];
}

export interface ConstructionSupportEvaluation {
  readonly supportQuality: Rating;
  readonly circulationQuality: Rating;
  readonly supportRole: PlayerRole;
  readonly breakdown: readonly InteractionScoreBreakdown[];
}

export interface ConstructionRiskEvaluation {
  readonly riskScore: Rating;
  readonly interceptionThreat: Rating;
  readonly sterileCirculationRisk: Rating;
  readonly breakdown: readonly InteractionScoreBreakdown[];
}

export interface ConstructionInteractionEvent {
  readonly tick: TacticalTick;
  readonly type: InteractionType;
  readonly offensiveTeamId: TeamId;
  readonly defensiveTeamId: TeamId;
  readonly activeZone: ZoneId;
  readonly involvedRoles: readonly PlayerRole[];
  readonly outcome: ConstructionOutcome;
  readonly dangerLevel: ConstructionDangerLevel;
  readonly tacticalConsequences: readonly ConstructionContextUpdateType[];
  readonly summary: string;
}

export interface UpdatedConstructionContext {
  readonly activeZone: ZoneId;
  readonly targetZone: ZoneId;
  readonly moveType: SpatialMoveType;
  readonly outcome: ConstructionOutcome;
  readonly dangerLevel: ConstructionDangerLevel;
  readonly territorialPressure: Rating;
  readonly weakSideTarget: ZoneId;
  readonly finishingTrigger: FinishingTriggerEvaluation;
  readonly updates: readonly ConstructionContextUpdateType[];
}

export interface ConstructionInteractionResult {
  readonly outcome: ConstructionOutcome;
  readonly dangerLevel: ConstructionDangerLevel;
  readonly constructionScore: Rating;
  readonly blockStability: Rating;
  readonly territorialPressure: Rating;
  readonly scoringDanger: Rating;
  readonly finishingTrigger: FinishingTriggerEvaluation;
  readonly manipulation: BlockManipulationEvaluation;
  readonly progression: TerritorialProgressionEvaluation;
  readonly defensiveStability: DefensiveBlockStabilityEvaluation;
  readonly support: ConstructionSupportEvaluation;
  readonly risk: ConstructionRiskEvaluation;
  readonly updatedContext: UpdatedConstructionContext;
  readonly event: ConstructionInteractionEvent;
  readonly logs: readonly TacticalLogLine[];
}
