import type { TeamId } from "../../core/ids";
import type { ScoringType } from "../../models/scoring";
import type { OffensiveProgressionPhilosophy, TacticalStyle } from "../../models/tactics";
import type { FinishingOutcome } from "../../systems/interactions/finishing";
import type { BuildUpPressingOutcome } from "../../systems/interactions/shared";
import type { TransitionOutcome } from "../../systems/interactions/transition";
import type { SpatialMoveType } from "../../systems/spatial/intention";
import type { TacticalMemoryInteraction } from "../../systems/tacticalMemory";
import type { TacticalPhaseState } from "../../systems/tacticalState";

export interface MovePatternCount {
  readonly moveType: SpatialMoveType;
  readonly count: number;
}

export interface MemoryPatternObservation {
  readonly interaction: TacticalMemoryInteraction;
  readonly moveType: SpatialMoveType;
  readonly sideType: string;
  readonly successes: number;
  readonly failures: number;
}

export interface TeamPatternAnalysis {
  readonly teamId: TeamId;
  readonly teamName: string;
  readonly tacticalStyle: TacticalStyle;
  readonly offensiveProgressionPhilosophy: OffensiveProgressionPhilosophy;
  readonly possessionSequences: number;
  readonly pressingSequences: number;
  readonly movePatterns: readonly MovePatternCount[];
  readonly memoryPatterns: readonly MemoryPatternObservation[];
  readonly finishingOpportunities: number;
  readonly scoringEvents: number;
  readonly finishingOutcomes: readonly FinishingOutcome[];
  readonly finishingStyles: readonly string[];
  readonly finishingContexts: readonly string[];
  readonly scoringTypes: readonly ScoringType[];
  readonly turnoversWon: number;
  readonly buildUpFailures: number;
  readonly buildUpSuccesses: number;
  readonly transitionSuccesses: number;
  readonly transitionFailures: number;
  readonly highDangerLowScoringThreat: number;
  readonly redZoneLateralDelays: number;
  readonly legalFinishingOptionsIgnored: number;
  readonly highTransitionDangerStabilized: number;
  readonly poorDecisions: number;
  readonly rushedClearances: number;
  readonly forcedTurnovers: number;
  readonly averageSupportQuality: number | null;
  readonly averageBuildUpResistance: number | null;
  readonly averagePressingCapability: number | null;
  readonly averageTerritorialPressure: number | null;
  readonly averageTacticalDangerScore: number | null;
  readonly averageConversionQuality: number | null;
  readonly reboundOrScrambleOutcomes: number;
  readonly secondChancePhases: number;
  readonly finalOffensiveMomentumLevel: string;
  readonly finalOffensiveMomentumScore: number;
  readonly finalRecoverySaturationLevel: string;
  readonly finalRecoverySaturationScore: number;
  readonly buildUpOutcomes: readonly BuildUpPressingOutcome[];
  readonly transitionOutcomes: readonly TransitionOutcome[];
  readonly tacticalPhaseStates: readonly TacticalPhaseState[];
  readonly chaoticAdvantagesCreated: number;
  readonly dangerPhasesResolved: number;
}

export interface CoachingCause {
  readonly text: string;
}

export interface CoachingTeamFeedback {
  readonly teamId: TeamId;
  readonly teamName: string;
  readonly observedIdentity: readonly string[];
  readonly worked: readonly string[];
  readonly failed: readonly string[];
  readonly why: readonly string[];
  readonly levers: readonly string[];
}

export interface CoachingFeedbackReport {
  readonly teams: readonly CoachingTeamFeedback[];
}
