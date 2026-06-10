import type { TeamId } from "../../../core/ids";
import { LateralCorridor } from "../../../core/zones";
import { PlayerRole } from "../../../models/player";
import { IntentType } from "../../../systems/intent";
import { evaluateStructuralPrincipleLaws } from "../../../systems/principles";
import {
  RecoveryStatus,
  TacticalStatus,
  createPlayerMatchStates,
  type PlayerMatchStateAssignment,
} from "../../../systems/players";
import { applyStructuralDistortion, evaluateStructuralDistortion } from "../../../systems/structure/distortion";
import { applyAttackingShapeRules } from "./applyAttackingShapeRules";
import { applyCollectiveRepositioning } from "./applyCollectiveRepositioning";
import { applyDefensiveShapeRules } from "./applyDefensiveShapeRules";
import { applyStructuralPrinciplePositioning } from "./applyStructuralPrinciplePositioning";
import { directionShift, getLane, getNearbyLane, shiftZone } from "./applyRolePlacementRules";
import type { TeamSpatialLayout, TeamSpatialLayoutInput } from "./types";
import { applyGoalkeeperGuardrailsToAssignments } from "../../../systems/positioning";

function colorForTeam(teamName: string): "blue" | "red" {
  return teamName === "CONTROL" ? "blue" : "red";
}

function toAssignmentState(state: string): Pick<PlayerMatchStateAssignment, "tacticalStatus" | "recoveryStatus"> {
  switch (state) {
    case "recovering":
      return {
        tacticalStatus: TacticalStatus.Recovering,
        recoveryStatus: RecoveryStatus.Recovering,
      };
    case "delayed":
      return {
        tacticalStatus: TacticalStatus.Delayed,
        recoveryStatus: RecoveryStatus.Delayed,
      };
    case "eliminated":
      return {
        tacticalStatus: TacticalStatus.Eliminated,
        recoveryStatus: RecoveryStatus.Eliminated,
      };
    case "covering":
      return {
        tacticalStatus: TacticalStatus.Covering,
        recoveryStatus: RecoveryStatus.LastLine,
      };
    case "target":
      return {
        tacticalStatus: TacticalStatus.Receiving,
      };
    default:
      return {};
  }
}

function markerStateFromPlayer(player: { readonly recoveryStatus: RecoveryStatus; readonly tacticalStatus: TacticalStatus }): "normal" | "recovering" | "delayed" | "eliminated" | "target" | "covering" {
  if (player.recoveryStatus === RecoveryStatus.Recovering) {
    return "recovering";
  }

  if (player.recoveryStatus === RecoveryStatus.Delayed) {
    return "delayed";
  }

  if (player.recoveryStatus === RecoveryStatus.Eliminated) {
    return "eliminated";
  }

  if (player.tacticalStatus === TacticalStatus.Covering) {
    return "covering";
  }

  if (player.tacticalStatus === TacticalStatus.Receiving || player.tacticalStatus === TacticalStatus.Carrying) {
    return "target";
  }

  return "normal";
}

function applyIntentNudges(
  assignments: readonly ReturnType<typeof applyCollectiveRepositioning>[number][],
  input: TeamSpatialLayoutInput,
): readonly ReturnType<typeof applyCollectiveRepositioning>[number][] {
  return assignments.map((assignment) => {
    const player = input.team.players.find((candidate) => candidate.role === assignment.role);
    const intent = player?.primaryIntent?.type;

    if (intent === IntentType.AttackDepth) {
      return {
        ...assignment,
        zone: shiftZone(assignment.zone, directionShift(input.attackingDirection, 1), getLane(assignment.zone)),
      };
    }

    if (intent === IntentType.OccupyWidth || intent === IntentType.AttackWeakSide) {
      return {
        ...assignment,
        zone: shiftZone(
          assignment.zone,
          0,
          assignment.role === PlayerRole.LeftPiston
            ? LateralCorridor.LeftCorridor
            : assignment.role === PlayerRole.RightPiston
              ? LateralCorridor.RightHalfSpace
              : getNearbyLane(getLane(assignment.zone), 1),
        ),
      };
    }

    if (intent === IntentType.SupportBall || intent === IntentType.PressBall) {
      return {
        ...assignment,
        zone: shiftZone(input.ballZone, 0, getNearbyLane(getLane(input.ballZone), assignment.role === PlayerRole.HookLink ? -1 : 0)),
      };
    }

    if (intent === IntentType.ProtectRestDefense || intent === IntentType.ProtectGoalSide || intent === IntentType.ProtectFrame) {
      return {
        ...assignment,
        zone: shiftZone(input.ballZone, directionShift(input.attackingDirection, -1), LateralCorridor.CentralAxis),
      };
    }

    return assignment;
  });
}

export function buildTeamSpatialLayout(input: TeamSpatialLayoutInput): TeamSpatialLayout {
  const distortion = evaluateStructuralDistortion({
    tacticalStyle: input.team.tacticalStyle,
    isPossessionTeam: input.isPossessionTeam,
    interaction: input.interaction,
    context: input.context,
    after: input.after,
    defensiveTransition: input.team.collectiveProperties.defensiveTransition,
    tacticalDiscipline: input.team.collectiveProperties.tacticalDiscipline,
    momentum: input.team.offensiveMomentum.score,
  });
  const structuralLaws = evaluateStructuralPrincipleLaws({
    team: input.team,
    isPossessionTeam: input.isPossessionTeam,
    interaction: input.interaction,
    context: input.context,
  });
  const baseAssignments = input.isPossessionTeam ? applyAttackingShapeRules(input) : applyDefensiveShapeRules(input);
  const principleAssignments = applyStructuralPrinciplePositioning({
    assignments: baseAssignments,
    layoutInput: input,
    laws: structuralLaws,
  });
  const nudgedAssignments = applyIntentNudges(applyCollectiveRepositioning(
    applyStructuralDistortion({
      assignments: principleAssignments,
      layoutInput: input,
      distortion,
    }),
  ), input);
  const assignments = applyGoalkeeperGuardrailsToAssignments({
    teamId: input.team.teamId,
    assignments: nudgedAssignments,
  });
  const playerStateInput = {
    players: input.team.players,
    isPossessionTeam: input.isPossessionTeam,
    ballContext: {
      ballLocation: input.ballZone,
      ballCarrierRole: input.ballCarrierRole,
      possessionTeamId: input.isPossessionTeam ? input.team.teamId : "defending-team",
      attackingDirection: input.attackingDirection,
    },
    attackingDirection: input.attackingDirection,
    assignments: assignments.map((assignment) => ({
      role: assignment.role,
      zone: assignment.zone,
      ...toAssignmentState(assignment.state),
    })),
    ...(input.selectedTargetZone === null ? {} : { targetZone: input.selectedTargetZone }),
    tick: input.tick,
  };
  const playerStates = createPlayerMatchStates(playerStateInput);

  return {
    distortion,
    structuralLaws,
    playerStates,
    markers: playerStates.map((player) => ({
      playerId: player.playerId,
      teamId: input.team.teamId as TeamId,
      teamName: input.team.teamName,
      role: player.role,
      roleInitials: player.roleInitials,
      zone: player.zone,
      color: colorForTeam(input.team.teamName),
      state: player.hasBall ? "target" : markerStateFromPlayer(player),
      tacticalStatus: player.tacticalStatus,
      supportStatus: player.supportStatus,
      recoveryStatus: player.recoveryStatus,
      hasBall: player.hasBall,
      primaryIntent: player.primaryIntent?.type ?? null,
      intentAgeTicks: player.intentAgeTicks,
      intentPriority: player.primaryIntent?.priority ?? 0,
      intentTargetZone: player.intentTargetZone,
      intentUrgency: player.intentUrgency,
      intentEvolutionDirection: player.intentEvolutionDirection,
      currentPosition: player.currentPosition,
      targetPosition: player.targetPosition,
      velocity: player.velocity,
      movementState: player.movementState,
      activeTrajectoryId: player.activeTrajectory?.trajectoryId ?? null,
      movementType: player.activeTrajectory?.movementType ?? null,
      trajectoryOriginZone: player.activeTrajectory?.originZone ?? null,
      trajectoryTargetZone: player.activeTrajectory?.targetZone ?? null,
      estimatedArrivalTick: player.estimatedArrivalTick,
      sprinting: player.sprinting,
      facingDirection: player.facingDirection,
      orientationAngle: player.playerOrientation?.facingAngle ?? null,
      awarenessRadius: player.awarenessRadius,
      perceptionConfidence: player.perceptionConfidence,
      weakSideAwareness: player.weakSideAwareness,
      pressureRecognition: player.pressureRecognition,
      blindSideExposure: player.blindSideExposure,
      reactionDelayTicks: player.reactionDelayTicks,
      scanningState: player.perception?.orientation.scanningState ?? null,
      scanFreshnessTicks: player.scanFreshnessTicks,
      blindSideZones: player.blindSideZones,
    })),
  };
}

export function findMarkerRoleWithBall(markers: readonly { readonly role: PlayerRole; readonly hasBall: boolean }[]): PlayerRole | null {
  return markers.find((marker) => marker.hasBall)?.role ?? null;
}
