import type { FullMatchChainConsumptionResult } from "./fullMatchChainConsumption";

export type FullMatchChainSegmentContextStatus =
  | "not_available"
  | "available"
  | "partial"
  | "failed";

export type FullMatchChainSegmentContext = {
  readonly status: FullMatchChainSegmentContextStatus;
  readonly source: "none" | "workbench_chain_consumption";
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly consumedStepCount: number;
  readonly visualWorkbenchStepCount: number;
  readonly spatialSelectionStepCount: number;
  readonly finalCarrierId?: string;
  readonly finalZone?: string;
  readonly possessionTeamId?: string;
  readonly defendingTeamId?: string;
  readonly confidence: "none" | "low" | "medium";
  readonly diagnosticOnly: boolean;
  readonly canMutateScore: false;
  readonly canMutateScoringEvents: false;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

function contextStatus(consumption: FullMatchChainConsumptionResult): FullMatchChainSegmentContextStatus {
  switch (consumption.status) {
    case "not_requested":
      return "not_available";
    case "consumed":
      return "available";
    case "partial":
      return "partial";
    case "failed":
      return "failed";
  }
}

function contextConfidence(status: FullMatchChainSegmentContextStatus): FullMatchChainSegmentContext["confidence"] {
  switch (status) {
    case "not_available":
      return "none";
    case "available":
      return "medium";
    case "partial":
    case "failed":
      return "low";
  }
}

function contextTags(input: {
  readonly status: FullMatchChainSegmentContextStatus;
  readonly chainId?: string;
  readonly finalCarrierId?: string;
  readonly finalZone?: string;
  readonly consumedStepCount: number;
  readonly spatialSelectionStepCount: number;
}): readonly string[] {
  if (input.status === "not_available") {
    return [];
  }

  return [
    "workbench_chain_segment_context",
    "chain_consumption_diagnostic_only",
    `chain_context_status_${input.status}`,
    ...(input.chainId === undefined ? [] : [`chain_id_${input.chainId}`]),
    ...(input.finalCarrierId === undefined ? [] : [`chain_final_carrier_${input.finalCarrierId}`]),
    ...(input.finalZone === undefined ? [] : [`chain_final_zone_${input.finalZone}`]),
    `chain_consumed_steps_${input.consumedStepCount}`,
    `chain_spatial_steps_${input.spatialSelectionStepCount}`,
  ];
}

export function chainConsumptionToSegmentContext(
  consumption: FullMatchChainConsumptionResult,
): FullMatchChainSegmentContext {
  const status = contextStatus(consumption);
  const finalCarrierId = consumption.finalPropagatedCarrierId;
  const finalZone = consumption.finalPropagatedZone;

  return {
    status,
    source: status === "not_available" ? "none" : "workbench_chain_consumption",
    ...(consumption.segmentLabel === undefined ? {} : { segmentLabel: consumption.segmentLabel }),
    ...(consumption.chainId === undefined ? {} : { chainId: consumption.chainId }),
    consumedStepCount: consumption.consumedStepCount,
    visualWorkbenchStepCount: consumption.visualWorkbenchStepCount,
    spatialSelectionStepCount: consumption.spatialSelectionStepCount,
    ...(finalCarrierId === undefined ? {} : { finalCarrierId }),
    ...(finalZone === undefined ? {} : { finalZone }),
    confidence: contextConfidence(status),
    diagnosticOnly: true,
    canMutateScore: false,
    canMutateScoringEvents: false,
    tags: contextTags({
      status,
      consumedStepCount: consumption.consumedStepCount,
      spatialSelectionStepCount: consumption.spatialSelectionStepCount,
      ...(consumption.chainId === undefined ? {} : { chainId: consumption.chainId }),
      ...(finalCarrierId === undefined ? {} : { finalCarrierId }),
      ...(finalZone === undefined ? {} : { finalZone }),
    }),
    warnings: consumption.warnings,
  };
}
