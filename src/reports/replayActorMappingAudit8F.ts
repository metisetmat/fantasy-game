import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { ReplayActorMappingFix } from "./fixReplayActorMappingFrom8D";
import type { ReplayActorMappingNaturalNarrativeFixWarningCode } from "./replayActorMappingNaturalNarrativeFixWarnings";

export interface ReplayActorMappingAudit8F {
  readonly status: OfficialCausalityStatus;
  readonly replayMomentCount: number;
  readonly actorMappingFixCount: number;
  readonly actorMappingPreservedFrom8DCount: number;
  readonly suspiciousGoalkeeperFallbackBeforeCount: number;
  readonly suspiciousGoalkeeperFallbackAfterCount: number;
  readonly goalkeeperFallbackAllowedCount: number;
  readonly goalkeeperFallbackBlockedCount: number;
  readonly teamLevelLimitedActorCount: number;
  readonly actorMismatchWith8DCount: number;
  readonly roleMismatchWith8DCount: number;
  readonly actorWithoutEvidenceCount: number;
  readonly roleWithoutEvidenceCount: number;
  readonly inventedActorCount: number;
  readonly inventedRoleCount: number;
  readonly roleDiversityCount: number;
  readonly roleDiversityRestored: boolean;
  readonly actorMappingWarningCodes: readonly ReplayActorMappingNaturalNarrativeFixWarningCode[];
  readonly recommendation: string;
}

export function auditReplayActorMapping8F(mappings: readonly ReplayActorMappingFix[]): ReplayActorMappingAudit8F {
  const suspiciousGoalkeeperFallbackBeforeCount = mappings.filter((mapping) => mapping.fallbackWasUsedBefore).length;
  const suspiciousGoalkeeperFallbackAfterCount = mappings.filter((mapping) =>
    mapping.correctedRole !== "goalkeeper_free_safety" && mapping.correctedPlayerLabel.includes("gardien-libero")
  ).length;
  const actorWithoutEvidenceCount = mappings.filter((mapping) => mapping.officialEventIds.length === 0).length;
  const roleWithoutEvidenceCount = mappings.filter((mapping) => mapping.officialEventIds.length === 0).length;
  const inventedActorCount = mappings.filter((mapping) => mapping.actorSource === "team_level_limited" && mapping.correctedPlayerId !== undefined).length;
  const inventedRoleCount = mappings.filter((mapping) => mapping.correctedRole === undefined && mapping.correctedRoleLabel !== "sequence collective").length;
  const roleDiversityCount = new Set(mappings.map((mapping) => mapping.correctedRoleLabel)).size;
  const roleDiversityRestored = roleDiversityCount >= 4;
  const actorMismatchWith8DCount = mappings.filter((mapping) =>
    mapping.actorSource === "sequence_actor_contribution_8d" && mapping.correctedPlayerLabel !== mapping.previousActorLabel && !mapping.fallbackWasUsedBefore
  ).length;
  const roleMismatchWith8DCount = mappings.filter((mapping) =>
    mapping.actorSource === "sequence_actor_contribution_8d" && mapping.correctedRoleLabel !== mapping.previousRoleLabel && !mapping.fallbackWasUsedBefore
  ).length;
  const warningCodes: ReplayActorMappingNaturalNarrativeFixWarningCode[] = [];
  if (suspiciousGoalkeeperFallbackAfterCount > 0) warningCodes.push("SUSPICIOUS_GOALKEEPER_FALLBACK");
  if (actorMismatchWith8DCount > 0) warningCodes.push("ACTOR_MISMATCH_WITH_8D");
  if (roleMismatchWith8DCount > 0) warningCodes.push("ROLE_MISMATCH_WITH_8D");
  if (actorWithoutEvidenceCount > 0) warningCodes.push("ACTOR_WITHOUT_EVIDENCE");
  if (roleWithoutEvidenceCount > 0) warningCodes.push("ROLE_WITHOUT_EVIDENCE");
  if (inventedActorCount > 0) warningCodes.push("INVENTED_ACTOR");
  if (inventedRoleCount > 0) warningCodes.push("INVENTED_ROLE");
  if (!roleDiversityRestored) warningCodes.push("ROLE_DIVERSITY_NOT_RESTORED");
  if (warningCodes.length === 0) {
    warningCodes.push("ACTOR_MAPPING_FIXED", "ROLE_DIVERSITY_RESTORED", "GOALKEEPER_FALLBACK_CONTROLLED");
  }
  const status: OfficialCausalityStatus = warningCodes.some((warning) =>
    [
      "SUSPICIOUS_GOALKEEPER_FALLBACK",
      "ACTOR_MISMATCH_WITH_8D",
      "ROLE_MISMATCH_WITH_8D",
      "ACTOR_WITHOUT_EVIDENCE",
      "ROLE_WITHOUT_EVIDENCE",
      "INVENTED_ACTOR",
      "INVENTED_ROLE",
    ].includes(warning)
  ) ? "FAIL" : roleDiversityRestored ? "PASS" : "PARTIAL";

  return {
    status,
    replayMomentCount: mappings.length,
    actorMappingFixCount: mappings.filter((mapping) => mapping.fallbackWasUsedBefore).length,
    actorMappingPreservedFrom8DCount: mappings.filter((mapping) => mapping.actorSource === "sequence_actor_contribution_8d").length,
    suspiciousGoalkeeperFallbackBeforeCount,
    suspiciousGoalkeeperFallbackAfterCount,
    goalkeeperFallbackAllowedCount: mappings.filter((mapping) => mapping.fallbackStillAllowed).length,
    goalkeeperFallbackBlockedCount: mappings.filter((mapping) => mapping.fallbackWasUsedBefore && !mapping.fallbackStillAllowed).length,
    teamLevelLimitedActorCount: mappings.filter((mapping) => mapping.actorSource === "team_level_limited").length,
    actorMismatchWith8DCount,
    roleMismatchWith8DCount,
    actorWithoutEvidenceCount,
    roleWithoutEvidenceCount,
    inventedActorCount,
    inventedRoleCount,
    roleDiversityCount,
    roleDiversityRestored,
    actorMappingWarningCodes: warningCodes,
    recommendation: status === "PASS" ? "KEEP_REPLAY_ACTOR_MAPPING_8F" : "REVIEW_REPLAY_ACTOR_MAPPING_8F",
  };
}
