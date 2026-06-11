import type { PlayerId, TeamId } from "../../core/ids";
import type { TacticalTick } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";
import type { ScoringZoneId } from "../../core/scoringZones";
import type { PrototypeTeamDefinition } from "../../data/prototypeTeams";
import type { ScoringType } from "../../models/scoring";
import type { CoachingFeedbackReport } from "../../reports/coaching";
import type { InGoalAccessLaneCategory } from "../../systems/rules";
import type { ConversionGeometry } from "../../systems/scoring";
import type { TryTouchdownOutcome } from "../../systems/scoring/tryTouchdownTypes";
import type { TacticalLogLine } from "../../systems/interactions/shared";
import type { ResolveSequenceInput, SequenceResult } from "../../systems/sequences";
import type { BallContext, TeamDirectionAssignment } from "../../systems/spatial/intention";
import type { SpatialTeamContext } from "../../systems/spatial";
import type { TacticalMemoryState } from "../../systems/tacticalMemory";
import type { RecoverySaturationState } from "../../systems/structure";
import type { OffensiveMomentumState } from "../../systems/offense/momentum";
import type { SpatialMatchContext as AdapterSpatialMatchContext } from "../spatialContext/spatialTeamContextTypes";
import type { AttributeAdjustedSelectionResult, RouteRankingAttributeMode, RouteRankingAttributeUsage } from "../routeRanking";

export interface MiniMatchInput {
  readonly teamA: PrototypeTeamDefinition;
  readonly teamB: PrototypeTeamDefinition;
  readonly numberOfSequences: number;
  readonly startTick?: TacticalTick;
  readonly seed?: number;
  readonly segmentInfluence?: MiniMatchSegmentInfluence;
  readonly spatialContext?: AdapterSpatialMatchContext;
  readonly routeRankingAttributeMode?: RouteRankingAttributeMode;
}

export interface MiniMatchTeamSegmentInfluence {
  readonly teamId: TeamId;
  readonly conditionModifier: number;
  readonly mentalFreshnessModifier: number;
  readonly momentumModifier: number;
  readonly pressureLoadModifier: number;
  readonly defensiveStressModifier: number;
  readonly scoringConfidenceModifier: number;
  readonly routeRiskModifier: number;
  readonly supportStabilityModifier: number;
  readonly finalActionComposureModifier: number;
}

export interface MiniMatchSegmentInfluence {
  readonly segmentIndex: number;
  readonly scoreState: "level" | "close" | "home_leading" | "away_leading" | "lopsided";
  readonly home: MiniMatchTeamSegmentInfluence;
  readonly away: MiniMatchTeamSegmentInfluence;
  readonly global: {
    readonly repeatedPatternPressure: number;
    readonly matchTempoAdjustment: number;
    readonly conversionVolatilityAdjustment: number;
  };
}

export interface MiniMatchScore {
  readonly teamA: number;
  readonly teamB: number;
}

export interface MiniMatchTeamCount {
  readonly teamA: number;
  readonly teamB: number;
}

export interface MiniMatchTeamRecoverySaturation {
  readonly teamA: RecoverySaturationState;
  readonly teamB: RecoverySaturationState;
}

export interface MiniMatchTeamOffensiveMomentum {
  readonly teamA: OffensiveMomentumState;
  readonly teamB: OffensiveMomentumState;
}

export interface MiniMatchScoringEvent {
  readonly sequenceNumber: number;
  readonly teamId: TeamId;
  readonly teamName: string;
  readonly scoringType: ScoringType;
  readonly points: number;
}

export type MiniMatchTryEventType =
  | "TRY_TOUCHDOWN_ATTEMPT"
  | "TRY_TOUCHDOWN_SCORED"
  | "TRY_HELD_UP"
  | "TRY_LOST_FORWARD"
  | "TRY_TACKLED_SHORT"
  | "TRY_INVALID_GROUNDING"
  | "TRY_INVALID_ACCESS_ROUTE"
  | "TRY_OUT_OF_PLAY";

export interface MiniMatchTryEvent {
  readonly sequenceNumber: number;
  readonly actionId: string;
  readonly eventType: MiniMatchTryEventType;
  readonly teamId: TeamId;
  readonly teamName: string;
  readonly carrierId: PlayerId;
  readonly carrierRole: string;
  readonly previousZone: ZoneId;
  readonly currentZone: ScoringZoneId;
  readonly accessRoute: InGoalAccessLaneCategory;
  readonly legalAccess: boolean;
  readonly opportunityType: string;
  readonly candidateScore: number;
  readonly selectedCandidateAction: "TRY_TOUCHDOWN_ATTEMPT";
  readonly normalizedSelectedCandidateActionType: "TRY_TOUCHDOWN_ATTEMPT";
  readonly candidateSelectionReason: string;
  readonly competingCandidates: readonly MiniMatchTryCandidate[];
  readonly targetInGoalZone: readonly ScoringZoneId[];
  readonly groundingLane: string;
  readonly groundingPoint: string;
  readonly ballControlScore: number;
  readonly groundingScore: number;
  readonly bodyControlScore: number;
  readonly carrierMomentumScore: number;
  readonly supportArrivingScore: number;
  readonly contactPressure: number;
  readonly tacklePressure: number;
  readonly defenderGoalLinePressure: number;
  readonly fatiguePenalty: number;
  readonly outcome: Exclude<TryTouchdownOutcome, "PENDING">;
  readonly scoringAction: "TRY_TOUCHDOWN" | "NONE";
  readonly pointValue: number;
  readonly scoringImpact: string;
  readonly scoreBefore: string;
  readonly scoreAfter: string;
  readonly conversionGeometryStored: boolean;
  readonly conversionGeometry?: ConversionGeometry;
  readonly conversionActive: true;
  readonly reason: string;
}

export interface MiniMatchTryCandidate {
  readonly actionType:
    | "TRY_TOUCHDOWN_ATTEMPT"
    | "TRY_TOUCHDOWN_FINISH"
    | "TRY_GROUNDING_ATTEMPT"
    | "SHOT"
    | "FORWARD_PROGRESS"
    | "SAFE_RECYCLE"
    | "CENTRAL_RECYCLE"
    | "SUPPORT_CLUSTER_RECYCLE"
    | "CARRY_OR_HOLD";
  readonly score: number;
  readonly status: "SELECTED" | "REJECTED";
  readonly reason: string;
}

export interface MiniMatchContext {
  readonly teamA: PrototypeTeamDefinition;
  readonly teamB: PrototypeTeamDefinition;
  readonly requestedSequences: number;
  readonly startTick: TacticalTick;
  readonly seed: number;
  readonly attackingDirections: readonly TeamDirectionAssignment[];
  readonly segmentInfluence?: MiniMatchSegmentInfluence;
  readonly spatialContext?: AdapterSpatialMatchContext;
  readonly routeRankingAttributeMode?: RouteRankingAttributeMode;
}

export interface MiniMatchContinuityState {
  readonly lastBallContext: BallContext | null;
  readonly lastPossessionTeamId: TeamId | null;
  readonly lastTerritorialPressure: number;
  readonly lastChaosLevel: number;
  readonly lastDangerLevel: string;
  readonly lastPossessionReason: string;
}

export interface MiniMatchSequenceSetup {
  readonly sequenceNumber: number;
  readonly possessionTeam: SpatialTeamContext;
  readonly pressingTeam: SpatialTeamContext;
  readonly activeZone: ZoneId;
  readonly pressureDescription: string;
  readonly openingLine: string;
  readonly possessionReason: string;
  readonly spatialContextActive: boolean;
  readonly spatialContextSummary?: string;
  readonly attributeInfluenceMode?: RouteRankingAttributeMode;
  readonly routeRankingUsesRealAttributes?: RouteRankingAttributeUsage;
  readonly attributeInfluenceSummary?: string;
  readonly attributeSelectionResult?: AttributeAdjustedSelectionResult;
  readonly resolveInput: ResolveSequenceInput;
}

export interface MiniMatchSequenceRecord {
  readonly sequenceNumber: number;
  readonly setup: MiniMatchSequenceSetup;
  readonly result: SequenceResult;
}

export interface MiniMatchState {
  readonly context: MiniMatchContext;
  readonly score: MiniMatchScore;
  readonly records: readonly MiniMatchSequenceRecord[];
  readonly scoringEvents: readonly MiniMatchScoringEvent[];
  readonly liveTryEvents: readonly MiniMatchTryEvent[];
  readonly finishingOpportunities: MiniMatchTeamCount;
  readonly secondChanceCount: MiniMatchTeamCount;
  readonly turnovers: MiniMatchTeamCount;
  readonly continuity: MiniMatchContinuityState;
  readonly tacticalMemory: TacticalMemoryState;
  readonly recoverySaturation: MiniMatchTeamRecoverySaturation;
  readonly offensiveMomentum: MiniMatchTeamOffensiveMomentum;
}

export interface MiniMatchSummary {
  readonly finalScore: MiniMatchScore;
  readonly sequencesPlayed: number;
  readonly scoringEvents: readonly MiniMatchScoringEvent[];
  readonly liveTryEvents: readonly MiniMatchTryEvent[];
  readonly finishingOpportunities: MiniMatchTeamCount;
  readonly turnovers: MiniMatchTeamCount;
  readonly tacticalAdaptations: readonly string[];
  readonly coachingFeedback: CoachingFeedbackReport;
  readonly recoverySaturation: MiniMatchTeamRecoverySaturation;
  readonly offensiveMomentum: MiniMatchTeamOffensiveMomentum;
  readonly secondChanceCount: MiniMatchTeamCount;
  readonly teamAObservation: string;
  readonly teamBObservation: string;
}

export interface MiniMatchResult {
  readonly state: MiniMatchState;
  readonly summary: MiniMatchSummary;
  readonly logs: readonly TacticalLogLine[];
}
