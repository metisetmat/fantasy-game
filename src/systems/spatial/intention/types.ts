import type { TeamId } from "../../../core/ids";
import type { PlayerId } from "../../../core/ids";
import type { Rating } from "../../../core/ratings";
import type { ZoneId } from "../../../core/zones";
import type { PressureLevel } from "../../../models/match";
import type { PlayerRole } from "../../../models/player";
import type { TacticalStyle } from "../../../models/tactics";
import type { SideContextEvaluation, SideType } from "../sides";
import type { CompactnessEvaluation, WeakSideEvaluation, SpatialTeamContext } from "../types";
import type { LocalAdvantageEvaluation } from "../localAdvantage";
import type { TacticalPrincipleEvaluation } from "../../principles";

export enum AttackingDirection {
  Z1ToZ7 = "Z1_TO_Z7",
  Z7ToZ1 = "Z7_TO_Z1",
}

export enum SpatialMoveType {
  Progression = "PROGRESSION",
  DirectVerticalAttack = "DIRECT_VERTICAL_ATTACK",
  LateralCirculation = "LATERAL_CIRCULATION",
  BackwardRecycle = "BACKWARD_RECYCLE",
  WeakSideSwitch = "WEAK_SIDE_SWITCH",
  SafetyClearance = "SAFETY_CLEARANCE",
  Finishing = "FINISHING",
}

export enum WeakSideSpatialRole {
  DangerousWeakSide = "DANGEROUS_WEAK_SIDE",
  SafeRecycleOption = "SAFE_RECYCLE_OPTION",
  ResetOption = "RESET_OPTION",
}

export enum OffensiveOptionType {
  RecycleSafety = "RECYCLE_SAFETY",
  LateralCirculation = "LATERAL_CIRCULATION",
  Progression = "PROGRESSION",
  DirectAttack = "DIRECT_ATTACK",
  Finishing = "FINISHING",
}

export enum ThreatLevel {
  Low = "LOW",
  Medium = "MEDIUM",
  High = "HIGH",
}

export enum OffensiveUrgencyLevel {
  Low = "LOW",
  Medium = "MEDIUM",
  High = "HIGH",
  Critical = "CRITICAL",
}

export interface BallContext {
  readonly ballLocation: ZoneId;
  readonly ballCarrierRole: PlayerRole;
  readonly possessionTeamId: TeamId;
  readonly attackingDirection: AttackingDirection;
}

export interface SpatialIntentionContext {
  readonly team: SpatialTeamContext;
  readonly opponentTeam?: SpatialTeamContext;
  readonly ballContext: BallContext;
  readonly currentPressure: PressureLevel;
  readonly chaosLevel: Rating;
  readonly territorialPressure: Rating;
  readonly weakSide: WeakSideEvaluation;
  readonly defensiveCompactness: CompactnessEvaluation;
  readonly interactionIntent?: string;
  readonly sideContext?: SideContextEvaluation;
  readonly memoryBiases?: readonly TargetSelectionBias[];
  readonly tacticalDanger?: ThreatLevel;
  readonly scoringThreat?: ThreatLevel;
  readonly finishingOptionLabel?: string;
  readonly offensiveUrgency?: OffensiveUrgencyEvaluation;
  readonly principles?: TacticalPrincipleEvaluation;
}

export interface OffensiveUrgencyEvaluation {
  readonly score: Rating;
  readonly level: OffensiveUrgencyLevel;
  readonly reasons: readonly string[];
}

export interface TargetSelectionBias {
  readonly moveType?: SpatialMoveType;
  readonly sideType?: SideType;
  readonly zoneBand?: string;
  readonly value: number;
  readonly reason: string;
}

export interface ZoneAttractivenessModifier {
  readonly label: string;
  readonly value: number;
}

export interface ZoneAttractivenessEvaluation {
  readonly zone: ZoneId;
  readonly score: Rating;
  readonly moveType: SpatialMoveType;
  readonly reasons: readonly string[];
  readonly modifiers: readonly ZoneAttractivenessModifier[];
  readonly localAdvantage?: LocalAdvantageEvaluation;
}

export interface OffensiveOptionEvaluation {
  readonly optionType: OffensiveOptionType;
  readonly label: string;
  readonly score: Rating;
  readonly reasons: readonly string[];
}

export interface TargetZoneSelection {
  readonly fromZone: ZoneId;
  readonly selectedZone: ZoneId;
  readonly selectedLabel?: string;
  readonly moveType: SpatialMoveType;
  readonly receiverId: PlayerId | null;
  readonly receiverRole: PlayerRole | null;
  readonly receiverInitials: string | null;
  readonly receiverZone: ZoneId | null;
  readonly reason: string;
  readonly evaluations: readonly ZoneAttractivenessEvaluation[];
  readonly optionEvaluations: readonly OffensiveOptionEvaluation[];
}

export interface TeamDirectionAssignment {
  readonly teamId: TeamId;
  readonly attackingDirection: AttackingDirection;
}

export interface SpatialMoveClassificationInput {
  readonly from: ZoneId;
  readonly to: ZoneId;
  readonly attackingDirection: AttackingDirection;
  readonly weakSideZones: readonly ZoneId[];
  readonly teamStyle: TacticalStyle;
}

export interface WeakSideClassification {
  readonly zone: ZoneId;
  readonly role: WeakSideSpatialRole;
  readonly description: string;
}
