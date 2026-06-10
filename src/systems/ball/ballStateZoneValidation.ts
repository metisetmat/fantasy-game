import {
  BallTargetType,
  BallZoneConsistencyStatus,
  type BallZoneContract,
} from "./ballStateTypes";

export interface BallStateZoneValidation {
  readonly valid: boolean;
  readonly checks: readonly string[];
}

export function validateBallZoneContractFields(contract: BallZoneContract): BallStateZoneValidation {
  const checks = [
    contract.tacticalTargetCluster === undefined || contract.tacticalTargetCluster !== contract.actualBallZone
      ? "tactical target cluster separated from actual ball zone"
      : "tactical target cluster equals actual ball zone by design",
    contract.actualReceptionZone === undefined || contract.actualReceptionZone === contract.actualBallZone
      ? "actualBallZone equals actualReceptionZone for completed pass/recycle"
      : "actualBallZone does not equal actualReceptionZone",
    contract.worldStateBallZone === contract.actualBallZone
      ? "worldStateBallZone equals actualBallZone"
      : "worldStateBallZone mismatch",
    contract.carrierResolvedZone === contract.actualBallZone
      ? "carrierResolvedZone equals actualBallZone after transfer"
      : "carrierResolvedZone mismatch",
    contract.selectedTargetZone === contract.actualBallZone || contract.targetType !== BallTargetType.PlayerTarget
      ? "selectedTargetZone is not used as actual ball zone unless semantics allow it"
      : "selectedTargetZone illegally used as actual ball zone",
  ];

  return {
    valid: contract.consistencyStatus !== BallZoneConsistencyStatus.Fail,
    checks,
  };
}
