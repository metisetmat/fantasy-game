import type { Rating } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";
import type { PressureLevel } from "../../models/match";
import type { PlayerRole } from "../../models/player";
import type {
  CollectiveProperties,
  OffensiveInstructions,
  OffensiveProgressionPhilosophy,
  TacticalStyle,
} from "../../models/tactics";
import type { SpatialMoveType, ThreatLevel } from "../spatial/intention";

export enum ProgressionMechanism {
  StructuredProgression = "STRUCTURED_PROGRESSION",
  LineBreakingLongPlay = "LINE_BREAKING_LONG_PLAY",
  IndividualRupture = "INDIVIDUAL_RUPTURE",
  TerritorialSurvival = "TERRITORIAL_SURVIVAL",
}

export enum RuptureOutcome {
  StructureBroken = "STRUCTURE_BROKEN",
  PartialBreak = "PARTIAL_BREAK",
  LostBall = "LOST_BALL",
  ChaoticAdvantage = "CHAOTIC_ADVANTAGE",
  IsolatedCarrier = "ISOLATED_CARRIER",
  DrawnDefenders = "DRAWN_DEFENDERS",
}

export interface OffensivePhilosophyEvaluationInput {
  readonly tacticalStyle: TacticalStyle;
  readonly offensivePhilosophy: OffensiveProgressionPhilosophy;
  readonly offensiveInstructions: OffensiveInstructions;
  readonly collectiveProperties: CollectiveProperties;
  readonly moveType: SpatialMoveType;
  readonly forwardDistance: number;
  readonly lateralDistance: number;
  readonly pressure: PressureLevel;
  readonly chaosLevel: Rating;
  readonly supportScore: Rating;
  readonly territorialPressure: Rating;
  readonly tacticalDanger: ThreatLevel | undefined;
  readonly scoringThreat: ThreatLevel | undefined;
  readonly ballCarrierRole: PlayerRole;
  readonly targetZone: ZoneId;
}

export interface OffensivePhilosophyEvaluation {
  readonly philosophy: OffensiveProgressionPhilosophy;
  readonly mechanism: ProgressionMechanism;
  readonly modifier: number;
  readonly reasons: readonly string[];
}
