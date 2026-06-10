import type { PlayerId, TeamId } from "../../core/ids";
import type { TacticalTick } from "../../core/ratings";
import type { LateralCorridor, ZoneId } from "../../core/zones";

export enum IntentStatus {
  Active = "ACTIVE",
  Resolved = "RESOLVED",
  Expired = "EXPIRED",
  Superseded = "SUPERSEDED",
  Blocked = "BLOCKED",
}

export enum IntentOutcome {
  Success = "SUCCESS",
  Failure = "FAILURE",
  PartialSuccess = "PARTIAL_SUCCESS",
  Interrupted = "INTERRUPTED",
  Blocked = "BLOCKED",
  Abandoned = "ABANDONED",
}

export enum IntentTransition {
  Continue = "CONTINUE",
  Evolve = "EVOLVE",
  Resolve = "RESOLVE",
  Split = "SPLIT",
  Merge = "MERGE",
  Cancel = "CANCEL",
}

export enum IntentSource {
  RoleDefault = "role_default",
  TeamPhilosophy = "team_philosophy",
  TacticalTrigger = "tactical_trigger",
  PhaseState = "phase_state",
  UtilityAi = "utility_ai",
  CoachInstruction = "coach_instruction",
}

export enum IntentType {
  OrganizeTempo = "ORGANIZE_TEMPO",
  SupportBall = "SUPPORT_BALL",
  SecureRecycle = "SECURE_RECYCLE",
  AttackDepth = "ATTACK_DEPTH",
  AttackWeakSide = "ATTACK_WEAK_SIDE",
  OccupyWidth = "OCCUPY_WIDTH",
  CreateOverload = "CREATE_OVERLOAD",
  ScreenPressure = "SCREEN_PRESSURE",
  PrepareFinish = "PREPARE_FINISH",
  AnticipateRebound = "ANTICIPATE_REBOUND",
  ContestLooseBall = "CONTEST_LOOSE_BALL",
  PressBall = "PRESS_BALL",
  CutPassingLane = "CUT_PASSING_LANE",
  CoverShadow = "COVER_SHADOW",
  ProtectGoalSide = "PROTECT_GOAL_SIDE",
  ProtectRestDefense = "PROTECT_REST_DEFENSE",
  RecoverStructure = "RECOVER_STRUCTURE",
  MarkRunner = "MARK_RUNNER",
  ProtectFrame = "PROTECT_FRAME",
  SweepDepth = "SWEEP_DEPTH",
  ResetShape = "RESET_SHAPE",
  FollowPlay = "FOLLOW_PLAY",
  HoldPosition = "HOLD_POSITION",
}

export type IntentChangeType = "CREATED" | "REFRESHED" | "RESOLVED" | "EXPIRED" | "SUPERSEDED" | "BLOCKED";

export interface PlayerIntent {
  readonly intentId: string;
  readonly playerId: PlayerId;
  readonly teamId: TeamId;
  readonly type: IntentType;
  readonly trigger: string;
  readonly priority: number;
  readonly confidence: number;
  readonly startedTick: TacticalTick;
  readonly expiresTick: TacticalTick;
  readonly minDurationTicks: number;
  readonly maxDurationTicks: number;
  readonly status: IntentStatus;
  readonly targetZone: ZoneId | null;
  readonly targetPlayerId: PlayerId | null;
  readonly targetLane: LateralCorridor | null;
  readonly tacticalReason: string;
  readonly source: IntentSource;
  readonly parentEventId: string | null;
  readonly resolvedByEventId: string | null;
  readonly chainId: string;
  readonly urgency: number;
  readonly evolutionDirection: "ESCALATING" | "DECAYING" | "STABLE";
  readonly previousTypes: readonly IntentType[];
  readonly tacticalStory: string;
}

export interface IntentChange {
  readonly playerId: PlayerId;
  readonly previousIntent: IntentType | null;
  readonly nextIntent: IntentType | null;
  readonly changeType: IntentChangeType;
  readonly reason: string;
  readonly tick: TacticalTick;
  readonly transition?: IntentTransition;
  readonly outcome?: IntentOutcome;
  readonly chainId?: string;
}

export interface IntentChainTransition {
  readonly from: IntentType;
  readonly to: IntentType | null;
  readonly transition: IntentTransition;
  readonly outcome: IntentOutcome;
  readonly reason: string;
  readonly tick: TacticalTick;
}

export interface IntentChain {
  readonly chainId: string;
  readonly originatingIntent: IntentType;
  readonly currentIntent: IntentType | null;
  readonly previousIntents: readonly IntentType[];
  readonly transitions: readonly IntentChainTransition[];
  readonly tacticalStory: string;
}
