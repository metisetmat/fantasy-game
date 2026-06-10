import type { ZoneId } from "../../core/zones";
import type { TacticalPhaseState } from "../../systems/tacticalState";
import type { TacticalSnapshot } from "./tacticalSnapshotTypes";

export enum SnapshotTruthClaimStatus {
  Pass = "PASS",
  Fail = "FAIL",
  NotRenderable = "NOT_RENDERABLE",
  Partial = "PARTIAL",
}

export enum SnapshotTruthClaimType {
  BallCarrier = "BALL_CARRIER",
  Possession = "POSSESSION",
  PlayerCount = "PLAYER_COUNT",
  SelectedTarget = "SELECTED_TARGET",
  PassingLane = "PASSING_LANE",
  Overload = "OVERLOAD",
  RecoveryVector = "RECOVERY_VECTOR",
  DelayedDefender = "DELAYED_DEFENDER",
  BlindSide = "BLIND_SIDE",
  VisionCone = "VISION_CONE",
  Trajectory = "TRAJECTORY",
  InfluenceField = "INFLUENCE_FIELD",
  GoalFrame = "GOAL_FRAME",
  GoalkeeperResponse = "GOALKEEPER_RESPONSE",
  FinishingAttempt = "FINISHING_ATTEMPT",
}

export interface SnapshotReportClaim {
  readonly claimId: string;
  readonly claimType: SnapshotTruthClaimType;
  readonly source: string;
  readonly text: string;
  readonly expectedVisualEvidence: string;
  readonly status: SnapshotTruthClaimStatus;
  readonly linkedVisualElementIds: readonly string[];
}

export interface SnapshotTruthContract {
  readonly snapshotId: string;
  readonly timelineEventId: string;
  readonly tick: number;
  readonly phaseState: TacticalPhaseState;
  readonly possessionTeamId: string;
  readonly defendingTeamId: string;
  readonly ballZone: ZoneId;
  readonly ballCarrierId: string;
  readonly primaryActorId: string | null;
  readonly receiverId: string | null;
  readonly selectedTargetZone: string | null;
  readonly tacticalTargetCluster?: ZoneId | undefined;
  readonly actualReceptionZone?: ZoneId | undefined;
  readonly actualBallZone?: ZoneId | undefined;
  readonly worldStateBallZone?: ZoneId | undefined;
  readonly selectedActionType: string | null;
  readonly ballState: string;
  readonly eventChain: readonly string[];
  readonly reportClaims: readonly SnapshotReportClaim[];
  readonly truthStatus: SnapshotTruthClaimStatus;
}

function aggregateStatus(claims: readonly SnapshotReportClaim[]): SnapshotTruthClaimStatus {
  if (claims.some((claim) => claim.status === SnapshotTruthClaimStatus.Fail)) {
    return SnapshotTruthClaimStatus.Fail;
  }

  if (claims.some((claim) => claim.status === SnapshotTruthClaimStatus.Partial)) {
    return SnapshotTruthClaimStatus.Partial;
  }

  return SnapshotTruthClaimStatus.Pass;
}

export function createSnapshotTruthContract(input: {
  readonly snapshot: TacticalSnapshot;
  readonly snapshotId: string;
  readonly phaseState: TacticalPhaseState;
  readonly defendingTeamId: string;
  readonly selectedActionType: string | null;
}): SnapshotTruthContract {
  const carrier = input.snapshot.players.find((player) => player.hasBall);
  const primaryActorId = carrier?.playerId ?? null;
  const receiverId = input.snapshot.metadata.passingLaneAnalysis?.toPlayerId ?? null;
  const selectedTargetZone = input.snapshot.selectedTargetZone;
  const hasPassingLane = input.snapshot.metadata.passingLaneAnalysis !== null;
  const hasRecovery = input.snapshot.metadata.recoveryVectors.length > 0;
  const hasOverload = input.snapshot.metadata.overloadWindows.length > 0;
  const hasPerception = input.snapshot.metadata.perceptionClaims.length > 0;
  const claims: readonly SnapshotReportClaim[] = [
    {
      claimId: `${input.snapshotId}:player-count`,
      claimType: SnapshotTruthClaimType.PlayerCount,
      source: "PlayerMatchState",
      text: "snapshot renders all official player states",
      expectedVisualEvidence: "20 unique data-player-id markers and 20 visible initials",
      status:
        input.snapshot.metadata.renderValidation.controlPlayersRendered === 10 &&
        input.snapshot.metadata.renderValidation.blitzPlayersRendered === 10
          ? SnapshotTruthClaimStatus.Pass
          : SnapshotTruthClaimStatus.Fail,
      linkedVisualElementIds: input.snapshot.players.map((player) => `player-${player.playerId}`),
    },
    {
      claimId: `${input.snapshotId}:ball-carrier`,
      claimType: SnapshotTruthClaimType.BallCarrier,
      source: "BallContext",
      text: `ball carrier ${carrier?.playerId ?? "missing"} in ${input.snapshot.ballZone}`,
      expectedVisualEvidence: "ball marker and ball-carrier ring on carrier marker",
      status: carrier === undefined ? SnapshotTruthClaimStatus.Fail : SnapshotTruthClaimStatus.Pass,
      linkedVisualElementIds: carrier === undefined ? [] : [`player-${carrier.playerId}`, "ball-marker"],
    },
    {
      claimId: `${input.snapshotId}:possession`,
      claimType: SnapshotTruthClaimType.Possession,
      source: "BallContext",
      text: `possession team ${input.snapshot.possessionTeamId}`,
      expectedVisualEvidence: "ball carrier marker belongs to possession team",
      status: carrier?.teamId === input.snapshot.possessionTeamId ? SnapshotTruthClaimStatus.Pass : SnapshotTruthClaimStatus.Fail,
      linkedVisualElementIds: carrier === undefined ? [] : [`player-${carrier.playerId}`],
    },
    {
      claimId: `${input.snapshotId}:selected-target`,
      claimType: SnapshotTruthClaimType.SelectedTarget,
      source: "TargetSelection",
      text: selectedTargetZone === null ? "no selected target zone" : `selected target ${selectedTargetZone}`,
      expectedVisualEvidence: "selected target zone highlight",
      status: selectedTargetZone === null ? SnapshotTruthClaimStatus.NotRenderable : SnapshotTruthClaimStatus.Pass,
      linkedVisualElementIds: selectedTargetZone === null ? [] : [`selected-target-${selectedTargetZone}`],
    },
    {
      claimId: `${input.snapshotId}:passing-lane`,
      claimType: SnapshotTruthClaimType.PassingLane,
      source: "DynamicInfluence.PassingLaneResult",
      text: hasPassingLane ? `passing lane ${input.snapshot.metadata.passingLaneAnalysis?.laneId ?? "unknown"}` : "no passing lane",
      expectedVisualEvidence: "lane line with lane state, openness, pressure, interception risk and source defenders",
      status: hasPassingLane ? SnapshotTruthClaimStatus.Pass : SnapshotTruthClaimStatus.NotRenderable,
      linkedVisualElementIds: hasPassingLane ? ["selected-passing-lane"] : [],
    },
    {
      claimId: `${input.snapshotId}:overload`,
      claimType: SnapshotTruthClaimType.Overload,
      source: "DynamicInfluence.OverloadWindow",
      text: hasOverload ? "dynamic overload windows rendered" : "no overload window above threshold",
      expectedVisualEvidence: "overload zone badge with current/projected/effective numbers",
      status: hasOverload ? SnapshotTruthClaimStatus.Pass : SnapshotTruthClaimStatus.NotRenderable,
      linkedVisualElementIds: input.snapshot.metadata.overloadWindows.map((window) => `overload-${window.zone}`),
    },
    {
      claimId: `${input.snapshotId}:recovery`,
      claimType: SnapshotTruthClaimType.RecoveryVector,
      source: "RecoveryVector",
      text: hasRecovery ? "recovery vectors rendered" : "no recovery vectors",
      expectedVisualEvidence: "recovery arrows with ETA and source player",
      status: hasRecovery ? SnapshotTruthClaimStatus.Pass : SnapshotTruthClaimStatus.NotRenderable,
      linkedVisualElementIds: input.snapshot.metadata.recoveryVectors.map((vector) => `recovery-${vector.playerId}`),
    },
    {
      claimId: `${input.snapshotId}:perception`,
      claimType: SnapshotTruthClaimType.VisionCone,
      source: "PerceptionState",
      text: hasPerception ? "orientation and vision cones rendered" : "no perception claims",
      expectedVisualEvidence: "vision cone, awareness ring, blind-side exposure marker",
      status: hasPerception ? SnapshotTruthClaimStatus.Pass : SnapshotTruthClaimStatus.NotRenderable,
      linkedVisualElementIds: input.snapshot.players.map((player) => `perception-${player.playerId}`),
    },
    {
      claimId: `${input.snapshotId}:trajectory`,
      claimType: SnapshotTruthClaimType.Trajectory,
      source: "PlayerTrajectory",
      text: "projected player trajectories rendered",
      expectedVisualEvidence: "trajectory arrows for active trajectories",
      status: input.snapshot.metadata.trajectorySummaries.length > 0 ? SnapshotTruthClaimStatus.Pass : SnapshotTruthClaimStatus.NotRenderable,
      linkedVisualElementIds: input.snapshot.metadata.trajectorySummaries.map((trajectory) => `trajectory-${trajectory.playerId}`),
    },
    {
      claimId: `${input.snapshotId}:influence`,
      claimType: SnapshotTruthClaimType.InfluenceField,
      source: "DynamicInfluenceField",
      text: "dynamic influence overlay rendered",
      expectedVisualEvidence: "influence cells and target-zone influence badge",
      status: SnapshotTruthClaimStatus.Pass,
      linkedVisualElementIds: ["dynamic-influence-layer", "target-influence-badge"],
    },
    {
      claimId: `${input.snapshotId}:goal-frame`,
      claimType: SnapshotTruthClaimType.GoalFrame,
      source: "GoalFrame",
      text: "goal frames rendered on both in-goal lines",
      expectedVisualEvidence: "left and right goal frame groups",
      status: SnapshotTruthClaimStatus.Pass,
      linkedVisualElementIds: ["goal-frame-left", "goal-frame-right"],
    },
  ];

  return {
    snapshotId: input.snapshotId,
    timelineEventId: input.snapshot.metadata.sourceTimelineEventId,
    tick: input.snapshot.metadata.sourceTick,
    phaseState: input.phaseState,
    possessionTeamId: input.snapshot.possessionTeamId,
    defendingTeamId: input.defendingTeamId,
    ballZone: input.snapshot.ballZone,
    ballCarrierId: carrier?.playerId ?? "",
    primaryActorId,
    receiverId,
    selectedTargetZone,
    tacticalTargetCluster: input.snapshot.metadata.ballZoneContract?.tacticalTargetCluster,
    actualReceptionZone: input.snapshot.metadata.ballZoneContract?.actualReceptionZone,
    actualBallZone: input.snapshot.metadata.ballZoneContract?.actualBallZone,
    worldStateBallZone: input.snapshot.metadata.ballZoneContract?.worldStateBallZone,
    selectedActionType: input.selectedActionType,
    ballState: input.snapshot.metadata.ballState,
    eventChain: [
      `ball ${input.snapshot.ballZone}`,
      `carrier ${carrier?.playerId ?? "missing"}`,
      ...(receiverId === null ? [] : [`receiver ${receiverId}`]),
    ],
    reportClaims: claims,
    truthStatus: aggregateStatus(claims),
  };
}
