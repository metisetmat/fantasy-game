import { PrototypeTeamId, PROTOTYPE_TEAMS, type PrototypeTeamDefinition } from "../../data/prototypeTeams";
import type { MatchInput, TeamSnapshot } from "../../contracts/engineToCoach";
import type { TeamId } from "../../core/ids";
import type { MiniMatchInput } from "../miniMatch";

export interface MiniMatchTeamIdMap {
  readonly homeTeamId: TeamId;
  readonly awayTeamId: TeamId;
  readonly homePrototypeId: PrototypeTeamId;
  readonly awayPrototypeId: PrototypeTeamId;
}

export interface MiniMatchInputAdapterResult {
  readonly miniMatchInput: MiniMatchInput;
  readonly homePrototype: PrototypeTeamDefinition;
  readonly awayPrototype: PrototypeTeamDefinition;
  readonly teamIdMap: MiniMatchTeamIdMap;
  readonly limitations: readonly string[];
}

const SUPPORTED_TEAM_IDS: Readonly<Record<string, PrototypeTeamId>> = {
  control: PrototypeTeamId.Control,
  blitz: PrototypeTeamId.Blitz,
};

function seedToNumber(seed: string): number {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function prototypeById(id: PrototypeTeamId): PrototypeTeamDefinition {
  const prototype = PROTOTYPE_TEAMS.find((team) => team.id === id);

  if (prototype === undefined) {
    throw new Error(`runMatch adapter limitation: missing prototype team ${id}.`);
  }

  return prototype;
}

function prototypeIdForSnapshot(team: TeamSnapshot): PrototypeTeamId {
  const prototypeId = SUPPORTED_TEAM_IDS[team.teamId];

  if (prototypeId === undefined) {
    throw new Error(
      `runMatch adapter limitation: unsupported teamId "${team.teamId}". Sprint 2B only maps explicit team IDs "control" and "blitz" to current mini-match prototypes.`,
    );
  }

  return prototypeId;
}

export function officialTeamIdForPrototype(input: {
  readonly miniMatchTeamId: TeamId;
  readonly teamIdMap: MiniMatchTeamIdMap;
}): TeamId {
  if (input.miniMatchTeamId === input.teamIdMap.homePrototypeId) {
    return input.teamIdMap.homeTeamId;
  }

  if (input.miniMatchTeamId === input.teamIdMap.awayPrototypeId) {
    return input.teamIdMap.awayTeamId;
  }

  return input.miniMatchTeamId;
}

export function adaptMatchInputToMiniMatch(input: MatchInput): MiniMatchInputAdapterResult {
  const homePrototypeId = prototypeIdForSnapshot(input.homeTeam);
  const awayPrototypeId = prototypeIdForSnapshot(input.awayTeam);

  if (homePrototypeId === awayPrototypeId) {
    throw new Error(
      `runMatch adapter limitation: home and away teams must map to distinct CONTROL/BLITZ prototypes. Received ${input.homeTeam.teamId} and ${input.awayTeam.teamId}.`,
    );
  }

  const homePrototype = prototypeById(homePrototypeId);
  const awayPrototype = prototypeById(awayPrototypeId);

  return {
    miniMatchInput: {
      teamA: homePrototype,
      teamB: awayPrototype,
      numberOfSequences: 6,
      seed: seedToNumber(input.seed),
    },
    homePrototype,
    awayPrototype,
    teamIdMap: {
      homeTeamId: input.homeTeam.teamId,
      awayTeamId: input.awayTeam.teamId,
      homePrototypeId,
      awayPrototypeId,
    },
    limitations: [
      "Sprint 2B adapter only supports explicit teamId values 'control' and 'blitz'.",
      "Official TeamSnapshot rosters and TacticalPlan settings are not yet converted into mini-match SpatialTeamContext.",
      "Mini-match prototype teams remain the source of tactical simulation behavior for this adapter.",
    ],
  };
}
