import type { OfficialMatchSequenceCausality } from "./officialPlayerRoleSequenceCausalityTypes";

export interface PlayerRoleActorChainAudit {
  readonly actorContributionCount: number;
  readonly actorContributionWithPlayerCount: number;
  readonly actorContributionWithRoleCount: number;
  readonly actorContributionWithEventCount: number;
  readonly actorContributionWithActionRoleCount: number;
  readonly actorContributionWithZoneCount: number;
  readonly playerNoneCausalityCount: number;
  readonly roleNoneCausalityCount: number;
  readonly unknownOfficialActorCount: number;
  readonly unsupportedPlayerClaimCount: number;
  readonly unsupportedRoleClaimCount: number;
  readonly playerRoleChainWarningCodes: readonly string[];
  readonly recommendation: string;
}

export function auditPlayerRoleActorChain(sequences: readonly OfficialMatchSequenceCausality[]): PlayerRoleActorChainAudit {
  const contributions = sequences.flatMap((sequence) => sequence.actorChain);
  const actorContributionCount = contributions.length;
  const playerNoneCausalityCount = contributions.filter((contribution) => contribution.playerId.toLocaleLowerCase("en-US") === "none").length;
  const roleNoneCausalityCount = contributions.filter((contribution) => contribution.role.toLocaleLowerCase("en-US") === "none").length;
  const unknownOfficialActorCount = contributions.filter((contribution) => contribution.roleFunction === "unknown_official_actor").length;
  const unsupportedPlayerClaimCount = contributions.filter((contribution) => /invent|unsupported/iu.test(contribution.limitationNote)).length;
  const unsupportedRoleClaimCount = contributions.filter((contribution) => /invent|unsupported/iu.test(contribution.evidenceSummary)).length;
  const pass = actorContributionCount >= 3 &&
    contributions.every((contribution) => contribution.eventId.length > 0) &&
    playerNoneCausalityCount === 0 &&
    roleNoneCausalityCount === 0 &&
    unsupportedPlayerClaimCount === 0 &&
    unsupportedRoleClaimCount === 0;

  return {
    actorContributionCount,
    actorContributionWithPlayerCount: contributions.filter((contribution) => contribution.playerId.length > 0).length,
    actorContributionWithRoleCount: contributions.filter((contribution) => contribution.role.length > 0).length,
    actorContributionWithEventCount: contributions.filter((contribution) => contribution.eventId.length > 0).length,
    actorContributionWithActionRoleCount: contributions.filter((contribution) => contribution.actionRole.length > 0).length,
    actorContributionWithZoneCount: contributions.filter((contribution) => contribution.zone.length > 0).length,
    playerNoneCausalityCount,
    roleNoneCausalityCount,
    unknownOfficialActorCount,
    unsupportedPlayerClaimCount,
    unsupportedRoleClaimCount,
    playerRoleChainWarningCodes: pass ? ["PLAYER_ROLE_CAUSALITY_READY", "ACTOR_CHAIN_READY"] : ["ACTOR_CHAIN_MISSING"],
    recommendation: pass ? "KEEP_PLAYER_ROLE_CAUSALITY" : "PLAYER_ROLE_CAUSALITY_FOLLOW_UP",
  };
}
