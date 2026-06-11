import type { MatchInput, PlayerSnapshot, TacticalPlan, TeamSnapshot } from "../../contracts/engineToCoach";
import type { PlayerId, TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import { PlayerRole } from "../../models/player";
import { PROTOTYPE_TEAMS, PrototypeTeamId } from "../../data/prototypeTeams";
import { runMiniMatch } from "../miniMatch";
import type { MiniMatchRouteSelectionResult, MiniMatchRouteSelectionSource } from "../miniMatch";
import type { TacticalWorkbenchFrame, TacticalWorkbenchPlayerPosition } from "./tacticalWorkbenchTypes";
import { workbenchToSpatialMatchContext } from "../spatialContext";
import { applySpatialAttributeInfluenceToCandidates, selectAttributeAdjustedCandidate } from "../routeRanking";
import type { AttributeAdjustedSelectionResult, RouteAttributeInfluence, RouteRankingAttributeUsage } from "../routeRanking";
import { sequence1Action1Chain } from "./fixtures/sequence1Action1.chain.fixture";
import { replayWorkbenchChain } from "./workbenchChainReplay";

export type WorkbenchReplaySeedResult = {
  readonly fixtureId: string;
  readonly status: "PASS" | "PARTIAL" | "FAIL";
  readonly spatialContextBuilt: boolean;
  readonly selectedActionRepresented: boolean;
  readonly actorPreserved: boolean;
  readonly receiverPreserved: boolean;
  readonly newCarrierPreserved: boolean;
  readonly ballZonePreserved: boolean;
  readonly attributeInfluenceApplied: boolean;
  readonly selectedCandidateBaseScore?: number;
  readonly selectedCandidateAttributeAdjustedScore?: number;
  readonly selectedCandidateInfluences?: readonly RouteAttributeInfluence[];
  readonly routeRankingUsesRealAttributes: RouteRankingAttributeUsage;
  readonly attributeRankingMode: "metadata_only" | "candidate_modifier";
  readonly metadataOnlySelectionResult?: AttributeAdjustedSelectionResult;
  readonly attributeSelectionResult?: AttributeAdjustedSelectionResult;
  readonly selectedBy?: "base_score" | "attribute_adjusted_score";
  readonly selectionChangedByAttributes: boolean;
  readonly routeSelectionSource: MiniMatchRouteSelectionSource;
  readonly miniMatchRouteSelectionResult?: MiniMatchRouteSelectionResult;
  readonly miniMatchRouteSelectionUsedSpatialResult: boolean;
  readonly workbenchChainReplayAvailable: boolean;
  readonly workbenchChainReplayStatus?: "PASS" | "PARTIAL" | "FAIL";
  readonly workbenchChainId?: string;
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
    seed: "sequence-1-action-1-replay-seed",
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
  const attributeCandidates = applySpatialAttributeInfluenceToCandidates({
    spatialContext: beforeContext,
    pressureLevel: "HIGH",
    candidates: input.workbench.rankedOptions.map((option) => ({
      candidateId: `rank-${option.rank}`,
      actorId: selectedAction.actorId as PlayerId,
      ...(option.receiverId === undefined ? {} : { receiverId: option.receiverId as PlayerId }),
      teamId: input.workbench.possessionTeamId as TeamId,
      fromZone: selectedAction.fromZone as ZoneId,
      targetZone: option.targetZone as ZoneId,
      actionType: option.actionType,
      ...(option.laneState === undefined ? {} : { laneState: option.laneState }),
      baseScore: option.finalSelectionScore ?? option.score ?? 0,
      baseRisk: option.risk === "HIGH" ? 80 : option.risk === "MEDIUM" ? 50 : 20,
    })),
  });
  const selectedCandidate =
    attributeCandidates.find((candidate) => candidate.receiverId === selectedAction.receiverId) ??
    attributeCandidates.find((candidate) => candidate.actionType === selectedAction.actionType);
  const metadataOnlySelectionResult = selectAttributeAdjustedCandidate({
    candidates: attributeCandidates,
    mode: "metadata_only",
    spatialContext: beforeContext,
    workbench: input.workbench,
    ...(selectedCandidate === undefined ? {} : { baseSelectedCandidateId: selectedCandidate.candidateId }),
  });
  const candidateModifierSelectionResult = selectAttributeAdjustedCandidate({
    candidates: attributeCandidates,
    mode: "candidate_modifier",
    spatialContext: beforeContext,
    workbench: input.workbench,
    ...(selectedCandidate === undefined ? {} : { baseSelectedCandidateId: selectedCandidate.candidateId }),
  });
  const miniMatch = runMiniMatch({
    teamA: prototypeForTeam(input.matchInput.homeTeam.teamId),
    teamB: prototypeForTeam(input.matchInput.awayTeam.teamId),
    numberOfSequences: 1,
    seed: 202,
    spatialContext: beforeContext,
    routeRankingAttributeMode: "candidate_modifier",
    routeSelectionSource: "spatial_candidate_modifier",
    routeSelectionWorkbench: input.workbench,
  });
  const miniMatchRouteSelectionResult = miniMatch.state.records[0]?.setup.routeSelectionResult;
  const chainReplay = replayWorkbenchChain({
    matchInput: input.matchInput,
    chain: sequence1Action1Chain,
    mode: "controlled_minimatch",
  });
  const lossyMappings = [
    "Mini-match receives spatial context metadata but still resolves actions through prototype team behavior.",
    "Route ranking can receive bounded attribute-adjusted candidate scores, but final mini-match selection is not yet fully selection-driving.",
    `Replay mini-match produced ${miniMatch.state.records.length} sequence record(s); a controlled workbench chain replay is now available, but normal full-match still does not consume it by default.`,
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
    attributeInfluenceApplied: attributeCandidates.some((candidate) => candidate.attributeInfluences.length > 0),
    ...(selectedCandidate === undefined ? {} : { selectedCandidateBaseScore: selectedCandidate.baseScore }),
    ...(selectedCandidate === undefined ? {} : { selectedCandidateAttributeAdjustedScore: selectedCandidate.attributeAdjustedScore }),
    ...(selectedCandidate === undefined ? {} : { selectedCandidateInfluences: selectedCandidate.attributeInfluences }),
    routeRankingUsesRealAttributes: "PARTIAL",
    attributeRankingMode: "candidate_modifier",
    metadataOnlySelectionResult,
    attributeSelectionResult: candidateModifierSelectionResult,
    selectedBy: candidateModifierSelectionResult.selectedBy,
    selectionChangedByAttributes: candidateModifierSelectionResult.selectionChanged,
    routeSelectionSource: "spatial_candidate_modifier",
    ...(miniMatchRouteSelectionResult === undefined ? {} : { miniMatchRouteSelectionResult }),
    miniMatchRouteSelectionUsedSpatialResult:
      miniMatchRouteSelectionResult?.selectionSource === "spatial_candidate_modifier" &&
      miniMatchRouteSelectionResult.guardValid,
    workbenchChainReplayAvailable: true,
    workbenchChainReplayStatus: chainReplay.status,
    workbenchChainId: chainReplay.chainId,
    missingTruths,
    lossyMappings,
    recommendations: [
      "CONFIRM_WORKBENCH_REPLAY_SEED",
      "CONFIRM_WORKBENCH_CHAIN_REPLAY_V0",
      "CONFIRM_CHAIN_STATE_PROPAGATION",
      "CONFIRM_CONTROLLED_MINIMATCH_CHAIN_REPLAY",
      "CONFIRM_ROUTE_ATTRIBUTE_INFLUENCE_LAYER",
      "CONFIRM_ATTRIBUTE_ADJUSTED_CANDIDATE_SCORES",
      "CONFIRM_SPATIAL_ROUTE_SELECTION_PATH",
      "CONFIRM_PROTOTYPE_FALLBACK_STILL_ENABLED",
      "PREPARE_FULLMATCH_WORKBENCH_CHAIN_REPLAY",
    ],
  };
}
