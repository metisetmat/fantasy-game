export type FullMatchRouteSelectionMode =
  | "segment_harness"
  | "workbench_chain_replay_experimental";

export type FullMatchOptions = {
  readonly routeSelectionMode?: FullMatchRouteSelectionMode;
};

export const DEFAULT_FULL_MATCH_ROUTE_SELECTION_MODE: FullMatchRouteSelectionMode = "segment_harness";

export function resolveFullMatchRouteSelectionMode(
  options: FullMatchOptions | undefined,
): FullMatchRouteSelectionMode {
  return options?.routeSelectionMode ?? DEFAULT_FULL_MATCH_ROUTE_SELECTION_MODE;
}

export function fullMatchRouteSelectionModeDiagnostics(mode: FullMatchRouteSelectionMode): readonly string[] {
  if (mode === "workbench_chain_replay_experimental") {
    return [
      "FULLMATCH_CHAIN_REPLAY_FLAG_AVAILABLE",
      "FULLMATCH_CHAIN_REPLAY_EXPERIMENTAL_NOT_PRODUCTION_READY",
      "NORMAL_FULLMATCH_STILL_SEGMENT_HARNESS_BY_DEFAULT",
    ];
  }

  return [
    "FULLMATCH_CHAIN_REPLAY_FLAG_AVAILABLE",
    "FULLMATCH_CHAIN_REPLAY_FLAG_DISABLED_BY_DEFAULT",
    "NORMAL_FULLMATCH_STILL_SEGMENT_HARNESS_BY_DEFAULT",
  ];
}
