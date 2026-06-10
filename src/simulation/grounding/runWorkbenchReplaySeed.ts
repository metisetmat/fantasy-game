import type { MatchInput, PlayerSnapshot, TacticalPlan, TeamSnapshot } from "../../contracts/engineToCoach";
import type { PlayerId } from "../../core/ids";
import { PlayerRole } from "../../models/player";
import { PROTOTYPE_TEAMS, PrototypeTeamId } from "../../data/prototypeTeams";
import { runMiniMatch } from "../miniMatch";
import type { TacticalWorkbenchFrame, TacticalWorkbenchPlayerPosition } from "./tacticalWorkbenchTypes";
import { workbenchToSpatialMatchContext } from "../spatialContext";

export type WorkbenchReplaySeedResult = {
  readonly fixtureId: string;
  readonly status: "PASS" | "PARTIAL" | "FAIL";
  readonly spatialContextBuilt: boolean;
  readonly selectedActionRepresented: boolean;
  readonly actorPreserved: boolean;
  readonly receiverPreserved: boolean;
  readonly newCarrierPreserved: boolean;
  readonly ballZonePreserved: boolean;
  readonly missingTruths: readonly string[];
  readonly lossyMappings: readonly string[];
  readonly recommendations: readonly string[];
};

function roleFromWorkbench(role: string): PlayerRole {
  switch (role) {
    case PlayerRole.TempoHalf:
      return PlayerRole.TempoHalf;
    case PlayerRole.HookLink:
      return PlayerRole.HookLink;
    case PlayerRole.ForwardLeader:
      return PlayerRole.ForwardLeader;
    case PlayerRole.GoalkeeperFreeSafety:
      return PlayerRole.GoalkeeperFreeSafety;
    case PlayerRole.MobileLock:
      return PlayerRole.MobileLock;
    case PlayerRole.SpaceHunter:
      return PlayerRole.SpaceHunter;
    case PlayerRole.Playmaker:
      return PlayerRole.Playmaker;
    case PlayerRole.Pivot:
      return PlayerRole.Pivot;
    case PlayerRole.LeftPiston:
      return PlayerRole.LeftPiston;
    case PlayerRole.RightPiston:
      return PlayerRole.RightPiston;
    default:
      return PlayerRole.Playmaker;
  }
}

function displayNameFromPosition(position: TacticalWorkbenchPlayerPosition): string {
  return `${position.teamId.toUpperCase()} ${position.initials}`;
}

function playerFromPosition(position: TacticalWorkbenchPlayerPosition): PlayerSnapshot {
  const isGoalkeeper = position.role === PlayerRole.GoalkeeperFreeSafety;
  const base = isGoalkeeper ? 82 : 76;

  return {
    playerId: position.playerId as PlayerId,
    name: displayNameFromPosition(position),
    role: roleFromWorkbench(position.role),
    attributes: {
      speed: base,
      agility: base,
      endurance: base,
      power: base,
      handPlay: isGoalkeeper ? 88 : base,
      footPlayDribble: base,
      footPlayPassingShooting: base,
      intelligence: base,
      mental: base,
    },
    traits: ["workbench_replay_seed"],
    currentCondition: 92,
    mentalFreshness: 90,
  };
}

function uniquePositionsByPlayer(
  positions: readonly TacticalWorkbenchPlayerPosition[],
  teamId: string,
): readonly TacticalWorkbenchPlayerPosition[] {
  const seen = new Set<string>();
  const result: TacticalWorkbenchPlayerPosition[] = [];

  for (const position of positions.filter((candidate) => candidate.teamId === teamId)) {
    if (seen.has(position.playerId)) {
      continue;
    }

    seen.add(position.playerId);
    result.push(position);
  }

  return result;
}

function teamFromWorkbench(input: {
  readonly workbench: TacticalWorkbenchFrame;
  readonly teamId: string;
  readonly name: string;
}): TeamSnapshot {
  const positions = uniquePositionsByPlayer(input.workbench.playerPositions, input.teamId);
  const roster = positions.map(playerFromPosition);
  const goalkeeper = roster.find((player) => player.role === PlayerRole.GoalkeeperFreeSafety);

  return {
    teamId: input.teamId,
    name: input.name,
    roster,
    starters: roster.map((player) => player.playerId),
    bench: [],
    goalkeeperId: goalkeeper?.playerId ?? roster[0]?.playerId ?? `${input.teamId}-missing-goalkeeper`,
  };
}

const replayPlan: TacticalPlan = {
  attackingIntent: "structured_possession",
  defensiveIntent: "compact_block",
  transitionIntent: "secure_rest_defense",
  tempo: "balanced",
  riskLevel: "medium",
  targetZones: ["Z3-C"],
  scoringBias: "balanced",
  pressingIntensity: 55,
  defensiveLineHeight: 50,
  widthUsage: 55,
  restDefensePriority: 70,
};

export function createWorkbenchReplayMatchInput(workbench: TacticalWorkbenchFrame): MatchInput {
  return {
    matchId: `${workbench.frameId}-replay-seed`,
    seed: "workbench-replay-seed",
    homeTeam: teamFromWorkbench({ workbench, teamId: "control", name: "CONTROL" }),
    awayTeam: teamFromWorkbench({ workbench, teamId: "blitz", name: "BLITZ" }),
    homePlan: replayPlan,
    awayPlan: {
      ...replayPlan,
      attackingIntent: "direct_pressure",
      defensiveIntent: "high_press",
      transitionIntent: "counterpress",
      tempo: "fast",
      riskLevel: "high",
      pressingIntensity: 86,
      defensiveLineHeight: 78,
      widthUsage: 62,
      restDefensePriority: 52,
    },
    matchContext: {
      competitionType: "friendly",
      matchImportance: 40,
    },
    ruleset: {
      rulesetId: "v0.1-workbench-replay",
      scoringVersion: "V2_DROP_FOUNDATION",
    },
  };
}

function prototypeForTeam(id: string) {
  const prototypeId = id === "control" ? PrototypeTeamId.Control : PrototypeTeamId.Blitz;
  const prototype = PROTOTYPE_TEAMS.find((team) => team.id === prototypeId);

  if (prototype === undefined) {
    throw new Error(`Missing prototype team ${prototypeId}.`);
  }

  return prototype;
}

export function runWorkbenchReplaySeed(input: {
  readonly matchInput: MatchInput;
  readonly workbench: TacticalWorkbenchFrame;
}): WorkbenchReplaySeedResult {
  const beforeContext = workbenchToSpatialMatchContext({
    matchInput: input.matchInput,
    workbench: input.workbench,
    frame: "before",
  });
  const afterContext = workbenchToSpatialMatchContext({
    matchInput: input.matchInput,
    workbench: input.workbench,
    frame: "after",
  });
  const selectedAction = input.workbench.selectedAction;
  const homePlayers = beforeContext.home.players;
  const awayPlayers = beforeContext.away.players;
  const allBeforePlayers = [...homePlayers, ...awayPlayers];
  const allAfterPlayers = [...afterContext.home.players, ...afterContext.away.players];
  const actorPreserved = allBeforePlayers.some((player) => player.playerId === selectedAction.actorId);
  const receiverPreserved = selectedAction.receiverId === undefined
    ? true
    : allBeforePlayers.some((player) => player.playerId === selectedAction.receiverId);
  const newCarrierPreserved = selectedAction.newCarrierId === undefined
    ? true
    : allAfterPlayers.some((player) => player.playerId === selectedAction.newCarrierId && player.isBallCarrier);
  const ballZonePreserved =
    beforeContext.ballZone === input.workbench.ballZone &&
    afterContext.ballZone === input.workbench.afterState?.ballZone;
  const selectedActionRepresented =
    selectedAction.actionType === "SUPPORT_CLUSTER_RECYCLE" &&
    selectedAction.actorId === beforeContext.ballCarrierId &&
    selectedAction.newCarrierId === afterContext.ballCarrierId;
  const miniMatch = runMiniMatch({
    teamA: prototypeForTeam(input.matchInput.homeTeam.teamId),
    teamB: prototypeForTeam(input.matchInput.awayTeam.teamId),
    numberOfSequences: 1,
    seed: 202,
    spatialContext: beforeContext,
  });
  const lossyMappings = [
    "Mini-match receives spatial context metadata but still resolves actions through prototype team behavior.",
    "Route ranking is not yet fully driven by PlayerSnapshot attributes.",
    `Replay mini-match produced ${miniMatch.state.records.length} sequence record(s), but not a forced workbench action chain.`,
  ];
  const missingTruths = [
    ...beforeContext.home.knownLimitations,
    ...beforeContext.away.knownLimitations,
    ...afterContext.home.knownLimitations,
    ...afterContext.away.knownLimitations,
  ];
  const status: WorkbenchReplaySeedResult["status"] =
    actorPreserved && receiverPreserved && newCarrierPreserved && ballZonePreserved && selectedActionRepresented
      ? "PARTIAL"
      : "FAIL";

  return {
    fixtureId: input.workbench.frameId,
    status,
    spatialContextBuilt: true,
    selectedActionRepresented,
    actorPreserved,
    receiverPreserved,
    newCarrierPreserved,
    ballZonePreserved,
    missingTruths,
    lossyMappings,
    recommendations: [
      "CONFIRM_WORKBENCH_REPLAY_SEED",
      "CONFIRM_MINIMATCH_SPATIAL_CONTEXT_PARTIAL",
      "CONFIRM_ROUTE_RANKING_ATTRIBUTE_GAP",
      "PREPARE_ATTRIBUTE_DRIVEN_ROUTE_RANKING",
    ],
  };
}
