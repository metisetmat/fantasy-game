import type { ZoneId } from "../../core/zones";
import type { PlayerRole } from "../../models/player";
import type { StructuralDistortionEvaluation } from "../../systems/structure/distortion";
import type { StructuralPrincipleLawProfile } from "../../systems/principles";
import type { PlayerMatchState } from "../../systems/players";
import type { MovementPosition, MovementState, MovementType, MovementVector } from "../../systems/movement";
import type { AttackingDirection } from "../../systems/spatial/intention";
import type { DangerMapZone } from "../../systems/spatial/dangerMap";
import type { PassingLaneEvaluation } from "../../systems/spatial/passingLanes";
import type { PressureMapZone } from "../../systems/spatial/pressureMap";
import type { RecoveryVector } from "../../systems/spatial/recoveryVectors";
import type { SupportTriangleEvaluation } from "../../systems/spatial/supportGeometry";
import type { InfluenceField, PassingLaneResult } from "../../systems/spatial/dynamicInfluence";
import type { BallZoneContract } from "../../systems/ball";

export type SnapshotStructuralState = "normal" | "recovering" | "delayed" | "eliminated" | "target" | "covering";

export interface SnapshotPlayerMarker {
  readonly playerId: string;
  readonly teamId: string;
  readonly teamName: string;
  readonly role: PlayerRole;
  readonly roleInitials: string;
  readonly zone: string;
  readonly color: "blue" | "red";
  readonly state: SnapshotStructuralState;
  readonly tacticalStatus: string;
  readonly supportStatus: string;
  readonly recoveryStatus: string;
  readonly hasBall: boolean;
  readonly primaryIntent: string | null;
  readonly intentAgeTicks: number;
  readonly intentPriority: number;
  readonly intentTargetZone: string | null;
  readonly intentUrgency: number;
  readonly intentEvolutionDirection: "ESCALATING" | "DECAYING" | "STABLE";
  readonly currentPosition: MovementPosition;
  readonly targetPosition: MovementPosition;
  readonly velocity: MovementVector;
  readonly movementState: MovementState;
  readonly activeTrajectoryId: string | null;
  readonly movementType: MovementType | null;
  readonly trajectoryOriginZone: string | null;
  readonly trajectoryTargetZone: string | null;
  readonly estimatedArrivalTick: number | null;
  readonly sprinting: boolean;
  readonly facingDirection: string | null;
  readonly orientationAngle: number | null;
  readonly awarenessRadius: number;
  readonly perceptionConfidence: number;
  readonly weakSideAwareness: number;
  readonly pressureRecognition: number;
  readonly blindSideExposure: number;
  readonly reactionDelayTicks: number;
  readonly scanningState: string | null;
  readonly scanFreshnessTicks: number;
  readonly blindSideZones: readonly string[];
}

export interface SnapshotZoneCount {
  readonly zone: string;
  readonly attackers: number;
  readonly defenders: number;
}

export interface SnapshotLocalAdvantage {
  readonly zone: string;
  readonly attackers: number;
  readonly defenders: number;
  readonly label: string;
}

export interface TacticalSnapshotMetadata {
  readonly sourceTick: number;
  readonly sourceTimelineEventId: string;
  readonly worldStateSummary: string;
  readonly worldStateHash: string;
  readonly ballState: string;
  readonly ballZoneContract?: BallZoneContract | undefined;
  readonly sourcePossessionTeamId: string;
  readonly sourceBallCarrierRole: PlayerRole;
  readonly attackersByZone: readonly SnapshotZoneCount[];
  readonly defendersByZone: readonly SnapshotZoneCount[];
  readonly localAdvantages: readonly SnapshotLocalAdvantage[];
  readonly isolatedReceivers: readonly string[];
  readonly uncoveredReceivers: readonly string[];
  readonly centralOverloads: readonly string[];
  readonly shortSideCoverage: string;
  readonly openSideCoverage: string;
  readonly attackingDistortion: StructuralDistortionEvaluation;
  readonly defendingDistortion: StructuralDistortionEvaluation;
  readonly attackingStructuralLaws: StructuralPrincipleLawProfile;
  readonly defendingStructuralLaws: StructuralPrincipleLawProfile;
  readonly structuralHoles: readonly string[];
  readonly principleHighlights: readonly string[];
  readonly playerStates: readonly PlayerMatchState[];
  readonly playerDerivedNumerical: string;
  readonly primaryIntentsByPlayer: readonly {
    readonly playerId: string;
    readonly initials: string;
    readonly intent: string;
    readonly ageTicks: number;
    readonly targetZone: string | null;
    readonly urgency: number;
    readonly direction: "ESCALATING" | "DECAYING" | "STABLE";
  }[];
  readonly trajectorySummaries: readonly {
    readonly playerId: string;
    readonly initials: string;
    readonly movementType: string;
    readonly originZone: string;
    readonly targetZone: string;
    readonly expectedArrivalTick: number;
    readonly urgency: number;
    readonly sprinting: boolean;
    readonly state: string;
  }[];
  readonly arrivalWindows: readonly string[];
  readonly spaceCreationClaims: readonly string[];
  readonly pressureMap: readonly PressureMapZone[];
  readonly dangerMap: readonly DangerMapZone[];
  readonly selectedPassingLane: PassingLaneEvaluation | null;
  readonly supportTriangle: SupportTriangleEvaluation;
  readonly recoveryVectors: readonly RecoveryVector[];
  readonly influenceMapClaims: readonly string[];
  readonly dynamicInfluenceField: InfluenceField;
  readonly dynamicInfluenceClaims: readonly string[];
  readonly perceptionClaims: readonly string[];
  readonly blindSideClaims: readonly string[];
  readonly orientationImpactClaims: readonly string[];
  readonly scanEvents: readonly string[];
  readonly passingLaneAnalysis: PassingLaneResult | null;
  readonly overloadWindows: readonly {
    readonly zone: string;
    readonly currentNumbers: string;
    readonly projectedNumbers: string;
    readonly effectiveAdvantage: number;
    readonly windowTicks: number;
    readonly confidence: number;
  }[];
  readonly consistency: SnapshotConsistency;
  readonly renderValidation: SnapshotRenderValidation;
}

export interface SnapshotConsistency {
  readonly ballCarrier: "OK" | "MISMATCH";
  readonly ballZone: "OK" | "MISMATCH";
  readonly selectedTarget: "OK" | "MISSING";
  readonly warnings: readonly string[];
}

export interface SnapshotRenderValidation {
  readonly controlPlayersRendered: number;
  readonly blitzPlayersRendered: number;
  readonly controlPlayersExpected: number;
  readonly blitzPlayersExpected: number;
  readonly ballCarrierCount: number;
  readonly allPlayerStatesRendered: boolean;
  readonly overlappingPlayersResolved: boolean;
  readonly controlRosterMatched: boolean;
  readonly blitzRosterMatched: boolean;
  readonly controlRoleInitialsMatched: boolean;
  readonly blitzRoleInitialsMatched: boolean;
  readonly markerRolesMatchedPlayerStates: boolean;
  readonly markerInitialsMatchedPlayerStates: boolean;
  readonly warnings: readonly string[];
}

export interface TacticalSnapshot {
  readonly title: string;
  readonly ballZone: ZoneId;
  readonly ballCarrierRole: PlayerRole;
  readonly possessionTeamId: string;
  readonly attackingDirection: AttackingDirection;
  readonly selectedTargetZone: string | null;
  readonly weakSideZones: readonly string[];
  readonly openSideZones: readonly string[];
  readonly shortSideZones: readonly string[];
  readonly players: readonly SnapshotPlayerMarker[];
  readonly metadata: TacticalSnapshotMetadata;
  readonly legend: string;
}
