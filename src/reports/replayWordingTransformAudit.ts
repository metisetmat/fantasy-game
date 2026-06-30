import type { ReplayWordingTransform, ReplayWordingTransformAudit } from "./matchStorylineImmersionTypes";

function countType(transforms: readonly ReplayWordingTransform[], type: ReplayWordingTransform["transformType"]): number {
  return transforms.filter((transform) => transform.transformType === type).length;
}

export function auditReplayWordingTransforms(transforms: readonly ReplayWordingTransform[]): ReplayWordingTransformAudit {
  const unsafeTransformCount = transforms.filter((transform) => !transform.safeForCoachCopy).length;
  const unmappedTechnicalTermCount = transforms.filter((transform) => transform.coachValue.trim().length === 0 || transform.coachValue === transform.rawValue).length;
  const passed = unsafeTransformCount === 0 &&
    unmappedTechnicalTermCount === 0 &&
    countType(transforms, "player") >= 3 &&
    countType(transforms, "role") >= 3 &&
    countType(transforms, "event") >= 3 &&
    countType(transforms, "effect") >= 3;

  return {
    status: passed ? "PASS" : "FAIL",
    playerTransformCount: countType(transforms, "player"),
    roleTransformCount: countType(transforms, "role"),
    zoneTransformCount: countType(transforms, "zone"),
    eventTransformCount: countType(transforms, "event"),
    effectTransformCount: countType(transforms, "effect"),
    unsafeTransformCount,
    unmappedTechnicalTermCount,
    recommendation: passed ? "KEEP_WORDING_TRANSFORMS" : "ADD_MISSING_REPLAY_WORDING_TRANSFORMS",
  };
}
