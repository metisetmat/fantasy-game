export type RouteRankingAttributeMode =
  | "off"
  | "metadata_only"
  | "candidate_modifier"
  | "selection_driving";

export type RouteRankingModeConfig = {
  readonly attributeMode: RouteRankingAttributeMode;
  readonly preserveLegality: true;
  readonly maxAttributeAdjustment: number;
  readonly allowAttributeSelectionFlip: boolean;
};

export const DEFAULT_ROUTE_RANKING_MODE_CONFIG: RouteRankingModeConfig = {
  attributeMode: "metadata_only",
  preserveLegality: true,
  maxAttributeAdjustment: 12,
  allowAttributeSelectionFlip: false,
};

export function createRouteRankingModeConfig(
  attributeMode: RouteRankingAttributeMode | undefined,
): RouteRankingModeConfig {
  if (attributeMode === "candidate_modifier" || attributeMode === "selection_driving") {
    return {
      attributeMode,
      preserveLegality: true,
      maxAttributeAdjustment: 12,
      allowAttributeSelectionFlip: true,
    };
  }

  return {
    ...DEFAULT_ROUTE_RANKING_MODE_CONFIG,
    attributeMode: attributeMode ?? DEFAULT_ROUTE_RANKING_MODE_CONFIG.attributeMode,
  };
}
