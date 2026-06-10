import type { MatchInput, PlayerSnapshot, TacticalPlan, TeamSnapshot } from "../../contracts/engineToCoach";
import type { PlayerId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import { PlayerRole } from "../../models/player";
import type { TacticalWorkbenchFrame, TacticalWorkbenchPlayerPosition } from "../grounding/tacticalWorkbenchTypes";
import { tacticalFunctionsForRole } from "./roleToTacticalFunctions";
import type { SpatialPlayerContext, SpatialTeamContext } from "./spatialTeamContextTypes";

const DEFAULT_ROLE_ZONES: Readonly<Record<string, ZoneId>> = {
  [PlayerRole.GoalkeeperFreeSafety]: "Z2-C",
  [PlayerRole.FreeSafety]: "Z2-C",
  [PlayerRole.TempoHalf]: "Z4-HSL",
  [PlayerRole.HookLink]: "Z4-CL",
  [PlayerRole.ForwardLeader]: "Z5-HSL",
  [PlayerRole.MobileLock]: "Z3-HSL",
  [PlayerRole.SpaceHunter]: "Z5-HSR",
  [PlayerRole.Playmaker]: "Z4-C",
  [PlayerRole.Pivot]: "Z3-C",
  [PlayerRole.LeftPiston]: "Z3-CL",
  [PlayerRole.RightPiston]: "Z3-HSR",
  [PlayerRole.LeftAnchor]: "Z3-CL",
  [PlayerRole.RightAnchor]: "Z3-HSR",
  [PlayerRole.PowerRunner]: "Z5-C",
};

function positionsForFrame(
  workbench: TacticalWorkbenchFrame | undefined,
  frame: "before" | "after",
): readonly TacticalWorkbenchPlayerPosition[] {
  if (workbench === undefined) {
    return [];
  }

  if (frame === "after" && workbench.afterPlayerPositions !== undefined) {
    return workbench.afterPlayerPositions;
  }

  return workbench.playerPositions;
}

function displayRole(role: PlayerRole | string): string {
  return role
    .split("_")
    .map((part) => part.length === 0 ? part : `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

function summarizePlan(plan: TacticalPlan): string {
  return [
    `attack=${plan.attackingIntent}`,
    `defense=${plan.defensiveIntent}`,
    `transition=${plan.transitionIntent}`,
    `tempo=${plan.tempo}`,
    `risk=${plan.riskLevel}`,
    `scoring=${plan.scoringBias}`,
  ].join("; ");
}

function defaultZoneForRole(role: PlayerRole | string): ZoneId {
  return DEFAULT_ROLE_ZONES[role] ?? "Z3-C";
}

function projectedZone(position: TacticalWorkbenchPlayerPosition | undefined): { readonly projectedZone?: ZoneId } {
  return position?.projectedZone === undefined ? {} : { projectedZone: position.projectedZone as ZoneId };
}

function playerToSpatialContext(input: {
  readonly player: PlayerSnapshot;
  readonly team: TeamSnapshot;
  readonly position?: TacticalWorkbenchPlayerPosition;
  readonly ballCarrierId?: PlayerId;
}): SpatialPlayerContext {
  return {
    playerId: input.player.playerId,
    teamId: input.team.teamId,
    role: input.player.role,
    displayRole: displayRole(input.player.role),
    zone: (input.position?.realZone ?? defaultZoneForRole(input.player.role)) as ZoneId,
    ...projectedZone(input.position),
    isStarter: input.team.starters.includes(input.player.playerId),
    isGoalkeeper: input.team.goalkeeperId === input.player.playerId,
    isBallCarrier: input.ballCarrierId === input.player.playerId || input.position?.isBallCarrier === true,
    currentCondition: input.player.currentCondition,
    mentalFreshness: input.player.mentalFreshness,
    attributes: {
      speed: input.player.attributes.speed,
      power: input.player.attributes.power,
      endurance: input.player.attributes.endurance,
      handPlay: input.player.attributes.handPlay,
      footPlayDribble: input.player.attributes.footPlayDribble,
      footPlayPassingShooting: input.player.attributes.footPlayPassingShooting,
      intelligence: input.player.attributes.intelligence,
      mental: input.player.attributes.mental,
    },
    tacticalFunctions: tacticalFunctionsForRole(input.player.role),
  };
}

export function teamSnapshotToSpatialContext(input: {
  readonly team: TeamSnapshot;
  readonly tacticalPlan: TacticalPlan;
  readonly workbench?: TacticalWorkbenchFrame;
  readonly frame?: "before" | "after";
}): SpatialTeamContext {
  const frame = input.frame ?? "before";
  const positions = positionsForFrame(input.workbench, frame).filter((position) => position.teamId === input.team.teamId);
  const positionByPlayerId = new Map(positions.map((position) => [position.playerId, position]));
  const rosterIds = new Set(input.team.roster.map((player) => player.playerId));
  const missingWorkbenchPlayers = positions
    .filter((position) => !rosterIds.has(position.playerId))
    .map((position) => position.playerId);
  const playersMissingWorkbenchPosition = input.team.roster
    .filter((player) => input.workbench !== undefined && !positionByPlayerId.has(player.playerId))
    .map((player) => player.playerId);
  const ballCarrierId =
    frame === "after"
      ? input.workbench?.afterState?.newCarrierId
      : input.workbench?.ballCarrierId;
  const limitations: string[] = [];

  if (input.workbench === undefined) {
    limitations.push("No workbench truth supplied; conservative role-zone defaults used.");
  }

  if (missingWorkbenchPlayers.length > 0) {
    limitations.push(`Workbench references players absent from TeamSnapshot: ${missingWorkbenchPlayers.join(", ")}.`);
  }

  if (playersMissingWorkbenchPosition.length > 0) {
    limitations.push(`TeamSnapshot players missing workbench positions: ${playersMissingWorkbenchPosition.join(", ")}.`);
  }

  if (!rosterIds.has(input.team.goalkeeperId)) {
    limitations.push(`Goalkeeper ${input.team.goalkeeperId} is not present in TeamSnapshot.roster.`);
  }

  return {
    teamId: input.team.teamId,
    name: input.team.name,
    players: input.team.roster.map((player) => {
      const position = positionByPlayerId.get(player.playerId);

      return playerToSpatialContext({
        player,
        team: input.team,
        ...(position === undefined ? {} : { position }),
        ...(ballCarrierId === undefined ? {} : { ballCarrierId }),
      });
    }),
    goalkeeperId: input.team.goalkeeperId,
    starters: input.team.starters,
    activePlayerIds: input.team.starters.filter((playerId) => rosterIds.has(playerId)),
    shapeSource: input.workbench === undefined ? "team_snapshot_default" : "workbench_truth",
    tacticalPlanSummary: summarizePlan(input.tacticalPlan),
    knownLimitations: limitations,
  };
}

export function buildSpatialContextForMatchTeam(input: {
  readonly matchInput: MatchInput;
  readonly team: "home" | "away";
  readonly workbench?: TacticalWorkbenchFrame;
  readonly frame?: "before" | "after";
}): SpatialTeamContext {
  return input.team === "home"
    ? teamSnapshotToSpatialContext({
        team: input.matchInput.homeTeam,
        tacticalPlan: input.matchInput.homePlan,
        ...(input.workbench === undefined ? {} : { workbench: input.workbench }),
        ...(input.frame === undefined ? {} : { frame: input.frame }),
      })
    : teamSnapshotToSpatialContext({
        team: input.matchInput.awayTeam,
        tacticalPlan: input.matchInput.awayPlan,
        ...(input.workbench === undefined ? {} : { workbench: input.workbench }),
        ...(input.frame === undefined ? {} : { frame: input.frame }),
      });
}
