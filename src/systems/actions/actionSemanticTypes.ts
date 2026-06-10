import type { PlayerId, TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";

export enum TacticalActionType {
  SafeRecycle = "SAFE_RECYCLE",
  PressureEscape = "PRESSURE_ESCAPE",
  SupportClusterRecycle = "SUPPORT_CLUSTER_RECYCLE",
  ForwardProgress = "FORWARD_PROGRESS",
  OffensiveConstructionPass = "OFFENSIVE_CONSTRUCTION_PASS",
  ContactPlatformPass = "CONTACT_PLATFORM_PASS",
  WeakSideSupport = "WEAK_SIDE_SUPPORT",
  WeakSideSwitch = "WEAK_SIDE_SWITCH",
  WeakSideRupture = "WEAK_SIDE_RUPTURE",
  CentralRecycle = "CENTRAL_RECYCLE",
  SmallSideReset = "SMALL_SIDE_RESET",
  ShortInteriorSupport = "SHORT_INTERIOR_SUPPORT",
  CarryOrHold = "CARRY_OR_HOLD",
  KickPass = "KICK_PASS",
  Shot = "SHOT",
  DefensiveClearance = "DEFENSIVE_CLEARANCE",
  TurnoverRecovery = "TURNOVER_RECOVERY",
}

export enum ActionPhase {
  BeforeAction = "BEFORE_ACTION",
  ActionExecution = "ACTION_EXECUTION",
  AfterAction = "AFTER_ACTION",
}

export enum IntentRole {
  DecisionActorIntent = "DECISION_ACTOR_INTENT",
  ReceiverIntent = "RECEIVER_INTENT",
  PostActionCarrierIntent = "POST_ACTION_CARRIER_INTENT",
  SupportingIntent = "SUPPORTING_INTENT",
  DefensiveIntent = "DEFENSIVE_INTENT",
}

export enum ActionSemanticStatus {
  Pass = "PASS",
  Warning = "WARNING",
  Fail = "FAIL",
}

export interface ActionSemanticContract {
  readonly eventId: string;
  readonly eventType: string;
  readonly selectedActionType: TacticalActionType;
  readonly selectedActionSubtype?: string | undefined;
  readonly decisionActorId: PlayerId;
  readonly decisionActorRole: string;
  readonly decisionActorIntent?: string | undefined;
  readonly selectedReceiverId?: PlayerId | undefined;
  readonly selectedReceiverRole?: string | undefined;
  readonly selectedReceiverIntent?: string | undefined;
  readonly newCarrierId: PlayerId;
  readonly newCarrierRole: string;
  readonly postActionPrimaryActorId: PlayerId;
  readonly passerId?: PlayerId | undefined;
  readonly receiverId?: PlayerId | undefined;
  readonly actionPhase: ActionPhase.ActionExecution;
  readonly possessionTeamId: TeamId;
  readonly defendingTeamId: TeamId;
  readonly tacticalTargetCluster?: ZoneId | undefined;
  readonly actualBallZoneAfter: ZoneId;
  readonly semanticStatus: ActionSemanticStatus;
  readonly reason: string;
}
