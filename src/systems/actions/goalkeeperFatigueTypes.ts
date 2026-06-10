import type { PlayerId, TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import type { CleanWindowType } from "./shotOutcomeTypes";

export type GoalkeeperReadinessState = "SET" | "ALERT" | "COLD" | "UNDER_PRESSURE" | "OVERLOADED";

export type GoalkeeperPressureContext = "LOW" | "MEDIUM" | "HIGH" | "LATE_CLOSE_SCORE" | "SCRAMBLE";

export type GoalkeeperPreviousErrorFlag = "NONE" | "RECENT_SPILL" | "RECENT_FAILED_SAVE" | "HANDLING_ERROR";

export interface GoalkeeperFatigueContext {
  readonly shotActionId: string;
  readonly shotIndex: number;
  readonly sequenceNumber: number;
  readonly actionNumber: number;
  readonly goalkeeperId: PlayerId;
  readonly defendingTeamId: TeamId;
  readonly goalkeeperZone: ZoneId;
  readonly goalkeeperInsideGoalArea: boolean;
  readonly baseAccumulatedFatigue: number;
  readonly composure: number;
  readonly vision: number;
  readonly handling: number;
  readonly speed: number;
  readonly shotOnTarget: boolean;
  readonly defensiveBlockPressure: number;
  readonly finishingPressure: number;
  readonly cleanWindowType: CleanWindowType;
  readonly previousErrorFlag?: GoalkeeperPreviousErrorFlag;
}

export interface GoalkeeperFatigueProfile {
  readonly goalkeeperPhysicalFatigue: number;
  readonly goalkeeperMentalFatigue: number;
  readonly goalkeeperReadinessState: GoalkeeperReadinessState;
  readonly concentrationLoad: number;
  readonly shotsFacedRecently: number;
  readonly timeSinceLastAction: number;
  readonly pressureContext: GoalkeeperPressureContext;
  readonly defensiveOrganizationInFront: number;
  readonly previousErrorFlag: GoalkeeperPreviousErrorFlag;
  readonly reboundControlScore: number;
  readonly secondSaveRecoveryScore: number;
  readonly concentrationModifier: number;
  readonly positioningModifier: number;
  readonly reactionReliabilityModifier: number;
  readonly decisionQualityModifier: number;
  readonly legalHandUseTimingModifier: number;
  readonly catchSecurityModifier: number;
  readonly parryControlModifier: number;
  readonly reboundDirectionModifier: number;
  readonly spillRiskModifier: number;
  readonly communicationModifier: number;
  readonly reason: string;
}
