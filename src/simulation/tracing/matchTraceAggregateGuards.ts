import type { MatchTraceAggregateModel } from "./matchTraceAggregateTypes";

export function matchTraceAggregateCannotMutateOfficialState(model: MatchTraceAggregateModel): boolean {
  return !model.canMutateTimeline &&
    !model.canMutateScore &&
    !model.canMutatePossession &&
    !model.canCreateScoringEvent;
}

export function matchTraceAggregateCannotDriveProduction(model: MatchTraceAggregateModel): boolean {
  return !model.canDriveCoachInstruction &&
    !model.canDriveLiveSelection &&
    !model.canDriveProductionRouteResolution &&
    !model.canClaimGlobalEconomy;
}

