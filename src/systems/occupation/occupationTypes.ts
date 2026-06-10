import type { Rating } from "../../core/ratings";
import type { PlayerId, TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";

export enum OccupationFunction {
  SupportBehindBall = "SUPPORT_BEHIND_BALL",
  DirectSupport = "DIRECT_SUPPORT",
  ThirdManConnector = "THIRD_MAN_CONNECTOR",
  WeakSideConnector = "WEAK_SIDE_CONNECTOR",
  WidthFixer = "WIDTH_FIXER",
  DepthThreat = "DEPTH_THREAT",
  RestDefenseAnchor = "REST_DEFENSE_ANCHOR",
  HalfSpaceRecycle = "HALF_SPACE_RECYCLE",
  PressingTrap = "PRESSING_TRAP",
  TransitionHunter = "TRANSITION_HUNTER",
  SwitchReceiver = "SWITCH_RECEIVER",
  ContactPlatform = "CONTACT_PLATFORM",
  ChaosAttacker = "CHAOS_ATTACKER",
  OverloadSupport = "OVERLOAD_SUPPORT",
  ScreenSupport = "SCREEN_SUPPORT",
  PressureAbsorber = "PRESSURE_ABSORBER",
  PressTrigger = "PRESS_TRIGGER",
  CoverShadowBlocker = "COVER_SHADOW_BLOCKER",
  CounterpressBalancer = "COUNTERPRESS_BALANCER",
  SafeRecycle = "SAFE_RECYCLE",
  TempoAccelerator = "TEMPO_ACCELERATOR",
  TempoController = "TEMPO_CONTROLLER",
}

export interface OccupationFunctionScore {
  readonly function: OccupationFunction;
  readonly score: Rating;
  readonly reasons: readonly string[];
}

export interface StructureFreedomBalance {
  readonly structure: Rating;
  readonly freedom: Rating;
  readonly label: "STRUCTURED" | "BALANCED" | "FREE";
  readonly category:
    | "STRICT_STRUCTURE"
    | "DISCIPLINED_INTERPRETER"
    | "BALANCED_INTERPRETER"
    | "CREATIVE_INTERPRETER"
    | "FREE_ROAMER";
  readonly reason: string;
}

export enum MicroPosition {
  Center = "CENTER",
  LeftSupportAngle = "LEFT_SUPPORT_ANGLE",
  RightSupportAngle = "RIGHT_SUPPORT_ANGLE",
  HighPin = "HIGH_PIN",
  LowSupport = "LOW_SUPPORT",
  InsideShoulder = "INSIDE_SHOULDER",
  OutsideShoulder = "OUTSIDE_SHOULDER",
  CoverLane = "COVER_LANE",
  PressureAngle = "PRESSURE_ANGLE",
  RestDefenseBase = "REST_DEFENSE_BASE",
  WeakSideSlot = "WEAK_SIDE_SLOT",
}

export interface OccupationSpatialTarget {
  readonly playerId: PlayerId;
  readonly roleInitials: string;
  readonly primaryFunction: OccupationFunction;
  readonly secondaryFunction: OccupationFunction;
  readonly candidateZones: readonly ZoneId[];
  readonly selectedZone: ZoneId;
  readonly selectedCorridor: string;
  readonly microPosition: MicroPosition;
  readonly targetScore: Rating;
  readonly styleFit: Rating;
  readonly structureCost: Rating;
  readonly riskCost: Rating;
  readonly teammateConflictCost: Rating;
  readonly explanation: string;
  readonly conflictResolved: string | null;
  readonly functionZoneMismatch: boolean;
}

export interface PlayerFunctionalOccupation {
  readonly playerId: PlayerId;
  readonly teamId: TeamId;
  readonly roleInitials: string;
  readonly zone: ZoneId;
  readonly primaryFunction: OccupationFunction;
  readonly secondaryFunction: OccupationFunction;
  readonly functionScores: readonly OccupationFunctionScore[];
  readonly structureFreedomBalance: StructureFreedomBalance;
  readonly occupationInterpretation: string;
  readonly preferredFunctions: readonly OccupationFunction[];
  readonly secondaryFunctions: readonly OccupationFunction[];
  readonly forbiddenFunctions: readonly OccupationFunction[];
}

export interface FunctionalOccupationValidation {
  readonly status: "PASS" | "FAIL";
  readonly checks: readonly {
    readonly label: string;
    readonly status: "PASS" | "FAIL";
    readonly detail: string;
  }[];
}

export interface TeamFunctionalOccupation {
  readonly teamId: TeamId;
  readonly style: "CONTROL" | "BLITZ";
  readonly players: readonly PlayerFunctionalOccupation[];
  readonly validation: FunctionalOccupationValidation;
}

export interface FunctionalOccupationEvaluation {
  readonly teams: readonly TeamFunctionalOccupation[];
}
