export interface DatabaseHistoryAdapterFeatureFlag {
  readonly flagName: "COACH_HISTORY_DATABASE_ADAPTER_EXPERIMENTAL";
  readonly enabled: boolean;
  readonly defaultEnabled: false;
  readonly productActivationAllowed: false;
  readonly reportCanUseAsSourceOfTruth: false;
  readonly canDriveCoachInstruction: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canMutateScore: false;
  readonly canCreateScoringEvent: false;
  readonly canClaimGlobalEconomy: false;
}

export function resolveDatabaseHistoryAdapterFeatureFlag(input: {
  readonly enabled?: boolean;
} = {}): DatabaseHistoryAdapterFeatureFlag {
  return {
    flagName: "COACH_HISTORY_DATABASE_ADAPTER_EXPERIMENTAL",
    enabled: input.enabled ?? false,
    defaultEnabled: false,
    productActivationAllowed: false,
    reportCanUseAsSourceOfTruth: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canMutateScore: false,
    canCreateScoringEvent: false,
    canClaimGlobalEconomy: false,
  };
}
