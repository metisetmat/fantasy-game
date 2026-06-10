import type { Rating, TacticalTick } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";
import type { PressureLevel } from "../../models/match";
import type { ShapeState } from "../../models/tactics";
import type { IsolatedInteractionResult, TacticalLogLine } from "../interactions/shared";
import type { BallContext } from "../spatial/intention";
import type { BallZoneContract } from "../ball";
import type { TacticalMemoryState } from "../tacticalMemory";
import type { TacticalPhaseState } from "../tacticalState";
import type { ConstructionInteractionResult } from "../interactions/construction";
import type { FinishingInteractionResult } from "../interactions/finishing";
import type { SecondChanceInteractionResult } from "../interactions/secondChance";
import type { TransitionInteractionResult } from "../interactions/transition";
import type {
  CompactnessEvaluation,
  DensityEvaluation,
  OffensiveSpreadEvaluation,
  SpatialTeamContext,
  WeakSideEvaluation,
} from "../spatial";

export enum SequenceInteractionKind {
  BuildUpUnderPressure = "build_up_under_pressure",
  OffensiveTransition = "offensive_transition",
  OffensiveConstruction = "offensive_construction",
  Finishing = "finishing",
  OffensiveConstructionPending = "offensive_construction_pending",
  SequenceSettled = "sequence_settled",
}

export enum SequencePhase {
  BuildUpPressure = "build_up_pressure",
  TransitionOpportunity = "transition_opportunity",
  EmergencyRecovery = "emergency_recovery",
  StabilizedPossession = "stabilized_possession",
  ControlledConstruction = "controlled_construction",
  FinishingPhase = "finishing_phase",
}

export enum SequenceLevel {
  Low = "LOW",
  Medium = "MEDIUM",
  High = "HIGH",
}

export interface SequenceTacticalContext {
  readonly chaosLevel: Rating;
  readonly possessionStability: SequenceLevel;
  readonly territorialPressure: Rating;
  readonly currentDanger: SequenceLevel;
  readonly activeZone: ZoneId;
  readonly sequenceMomentum: Rating;
  readonly weakSideExposure: SequenceLevel;
  readonly currentInteraction: SequenceInteractionKind;
  readonly pressureLevel: PressureLevel;
  readonly tacticalPhaseState: TacticalPhaseState;
}

export interface SequenceSpatialSnapshot {
  readonly offensiveShape: ShapeState;
  readonly defensiveShape: ShapeState;
  readonly density: DensityEvaluation;
  readonly offensiveSpread: OffensiveSpreadEvaluation;
  readonly defensiveCompactness: CompactnessEvaluation;
  readonly weakSide: WeakSideEvaluation;
}

export interface SequenceTeamContext {
  readonly possessionTeam: SpatialTeamContext;
  readonly pressingTeam: SpatialTeamContext;
}

export interface ResolveSequenceInput {
  readonly startTick: TacticalTick;
  readonly teams: SequenceTeamContext;
  readonly ballContext: BallContext;
  readonly initialContext: SequenceTacticalContext;
  readonly initialSpatial: SequenceSpatialSnapshot;
  readonly transitionSpatial: SequenceSpatialSnapshot;
  readonly constructionSpatial: SequenceSpatialSnapshot;
  readonly finishingSpatial: SequenceSpatialSnapshot;
  readonly tacticalMemory: TacticalMemoryState;
}

export interface SequenceStep {
  readonly tick: TacticalTick;
  readonly interaction: SequenceInteractionKind;
  readonly contextBefore: SequenceTacticalContext;
  readonly contextAfter: SequenceTacticalContext;
  readonly ballContextBefore: BallContext;
  readonly ballContextAfter: BallContext;
  readonly ballZoneContract?: BallZoneContract | undefined;
  readonly logs: readonly TacticalLogLine[];
}

export interface SequenceResult {
  readonly finalContext: SequenceTacticalContext;
  readonly steps: readonly SequenceStep[];
  readonly buildUpResult: IsolatedInteractionResult | null;
  readonly transitionResult: TransitionInteractionResult | null;
  readonly constructionResult: ConstructionInteractionResult | null;
  readonly finishingResult: FinishingInteractionResult | null;
  readonly secondChanceResult: SecondChanceInteractionResult | null;
  readonly logs: readonly TacticalLogLine[];
}
