import type { OfficialMatchStorySpineModel } from "./officialMatchStorySpineTypes";

export interface EngineCausalityProofAudit {
  readonly officialCausalityLinkCount: number;
  readonly playerAttributeCausalityCount: number;
  readonly roleFitCausalityCount: number;
  readonly teamStrategyCausalityCount: number;
  readonly fatigueCausalityCount: number;
  readonly pressureCausalityCount: number;
  readonly zoneAccessCausalityCount: number;
  readonly goalkeeperCausalityCount: number;
  readonly transitionStructureCausalityCount: number;
  readonly supportStructureCausalityCount: number;
  readonly restDefenseCausalityCount: number;
  readonly weakCausalityCount: number;
  readonly mediumCausalityCount: number;
  readonly strongCausalityCount: number;
  readonly unsupportedCausalityClaimCount: number;
  readonly inventedCausalityCount: number;
  readonly diagnosticOnlyCausalityInOfficialStoryCount: number;
  readonly sandboxOnlyCausalityInOfficialStoryCount: number;
  readonly causalityCoverageWarningCodes: readonly string[];
  readonly recommendation: string;
}

export function auditEngineCausalityProof(model: OfficialMatchStorySpineModel): EngineCausalityProofAudit {
  const countCause = (causeType: string): number => model.causalityLinks.filter((link) => link.causeType === causeType).length;
  const unsupportedCausalityClaimCount = model.causalityLinks.filter((link) => link.linkedOfficialEventIds.length === 0 || !link.officialOnly).length;
  const diagnosticOnlyCausalityInOfficialStoryCount = model.causalityLinks.filter((link) => link.diagnosticOnly).length;
  const sandboxOnlyCausalityInOfficialStoryCount = model.causalityLinks.filter((link) => link.sandboxOnly).length;
  const inventedCausalityCount = model.causalityLinks.filter((link) => link.linkedStoryBeatIds.length === 0).length;
  const warningCodes = [
    ...(model.causalityLinks.length >= 3 ? ["ENGINE_CAUSALITY_READY"] : ["CAUSALITY_TOO_WEAK"]),
    ...(unsupportedCausalityClaimCount === 0 ? [] : ["UNSUPPORTED_CAUSALITY_CLAIM"]),
    ...(inventedCausalityCount === 0 ? [] : ["INVENTED_EVENT_IN_STORY"]),
    ...(sandboxOnlyCausalityInOfficialStoryCount === 0 ? [] : ["SANDBOX_CLAIM_IN_OFFICIAL_STORY"]),
    ...(diagnosticOnlyCausalityInOfficialStoryCount === 0 ? [] : ["DIAGNOSTIC_CLAIM_IN_OFFICIAL_STORY"]),
  ];

  return {
    officialCausalityLinkCount: model.causalityLinks.filter((link) => link.officialOnly).length,
    playerAttributeCausalityCount: countCause("player_attribute"),
    roleFitCausalityCount: countCause("role_fit"),
    teamStrategyCausalityCount: countCause("team_strategy"),
    fatigueCausalityCount: countCause("fatigue"),
    pressureCausalityCount: countCause("pressure"),
    zoneAccessCausalityCount: countCause("zone_access"),
    goalkeeperCausalityCount: countCause("goalkeeper_response"),
    transitionStructureCausalityCount: countCause("transition_structure"),
    supportStructureCausalityCount: countCause("support_structure"),
    restDefenseCausalityCount: countCause("rest_defense"),
    weakCausalityCount: model.causalityLinks.filter((link) => link.evidenceStrength === "weak").length,
    mediumCausalityCount: model.causalityLinks.filter((link) => link.evidenceStrength === "medium").length,
    strongCausalityCount: model.causalityLinks.filter((link) => link.evidenceStrength === "strong").length,
    unsupportedCausalityClaimCount,
    inventedCausalityCount,
    diagnosticOnlyCausalityInOfficialStoryCount,
    sandboxOnlyCausalityInOfficialStoryCount,
    causalityCoverageWarningCodes: warningCodes,
    recommendation: warningCodes.includes("ENGINE_CAUSALITY_READY")
      ? "KEEP_CAUSALITY_PROOF"
      : "DEEPEN_ATTRIBUTE_ROLE_FATIGUE_CAUSALITY",
  };
}
