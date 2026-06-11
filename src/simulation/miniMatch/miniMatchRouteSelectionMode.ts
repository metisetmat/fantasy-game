export type MiniMatchRouteSelectionSource =
  | "prototype"
  | "spatial_candidate_modifier"
  | "spatial_selection_driving";

export type MiniMatchRouteSelectionMode = {
  readonly source: MiniMatchRouteSelectionSource;
  readonly preservePrototypeFallback: boolean;
  readonly preserveLegality: true;
  readonly allowSelectionChange: boolean;
};

export const DEFAULT_MINI_MATCH_ROUTE_SELECTION_MODE: MiniMatchRouteSelectionMode = {
  source: "prototype",
  preservePrototypeFallback: true,
  preserveLegality: true,
  allowSelectionChange: false,
};

export function createMiniMatchRouteSelectionMode(
  source: MiniMatchRouteSelectionSource | undefined,
): MiniMatchRouteSelectionMode {
  if (source === "spatial_candidate_modifier" || source === "spatial_selection_driving") {
    return {
      source,
      preservePrototypeFallback: true,
      preserveLegality: true,
      allowSelectionChange: true,
    };
  }

  return DEFAULT_MINI_MATCH_ROUTE_SELECTION_MODE;
}
