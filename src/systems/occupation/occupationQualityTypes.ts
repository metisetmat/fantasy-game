import type { PlayerId, TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import type { PlayerMatchState } from "../players";
import type { FunctionalOccupationResolution } from "./functionalOccupationResolution";
import type { MicroPosition, OccupationFunction, OccupationSpatialTarget } from "./occupationTypes";

export type OccupationQualityGrade = "EXCELLENT" | "GOOD" | "ACCEPTABLE" | "WEAK" | "BROKEN";

export interface OccupationQualityEvaluation {
  readonly playerId: PlayerId;
  readonly teamId: TeamId;
  readonly roleInitials: string;
  readonly primaryFunction: OccupationFunction;
  readonly secondaryFunction: OccupationFunction;
  readonly selectedZone: ZoneId;
  readonly microPosition: MicroPosition;
  readonly qualityScore: number;
  readonly grade: OccupationQualityGrade;
  readonly strengths: readonly string[];
  readonly weaknesses: readonly string[];
  readonly penalties: readonly string[];
  readonly bonuses: readonly string[];
  readonly suggestedAdjustment: string | null;
  readonly explanation: string;
}

export interface TeamOccupationQuality {
  readonly teamId: TeamId;
  readonly style: "CONTROL" | "BLITZ";
  readonly overallScore: number;
  readonly structureScore: number;
  readonly supportScore: number;
  readonly widthScore: number;
  readonly restDefenseScore: number;
  readonly progressionPreparationScore: number;
  readonly pressureScore: number;
  readonly weakSideScore: number;
  readonly styleExpressionScore: number;
  readonly riskControlScore: number;
  readonly warnings: readonly string[];
}

export interface OccupationQualityAlternative {
  readonly playerId: PlayerId;
  readonly label: string;
  readonly currentScore: number;
  readonly alternativeZone: ZoneId;
  readonly alternativeScore: number;
  readonly tradeoff: string;
}

export interface OccupationQualityReport {
  readonly playerEvaluations: readonly OccupationQualityEvaluation[];
  readonly teamEvaluations: readonly TeamOccupationQuality[];
  readonly alternatives: readonly OccupationQualityAlternative[];
  readonly chainRegressionWarnings: readonly string[];
  readonly validationChecks: readonly {
    readonly label: string;
    readonly status: "PASS" | "FAIL";
    readonly detail: string;
  }[];
}

export interface OccupationQualityInput {
  readonly players: readonly PlayerMatchState[];
  readonly resolution: FunctionalOccupationResolution;
  readonly ballZone: ZoneId;
  readonly ballCarrierId: PlayerId;
  readonly attackingDirection: "LEFT_TO_RIGHT" | "RIGHT_TO_LEFT";
  readonly phaseState: string;
  readonly teamStyles: Readonly<Record<TeamId, "CONTROL" | "BLITZ">>;
  readonly receptionChainPaths: readonly string[];
}

export interface OccupationQualityScoringInput {
  readonly player: PlayerMatchState;
  readonly target: OccupationSpatialTarget;
  readonly input: OccupationQualityInput;
}
