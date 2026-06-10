import type { LateralCorridor } from "../../core/zones";
import type { ScoringZoneId } from "../../core/scoringZones";
import type { PlayerId, TeamId } from "../../core/ids";
import type { TryOpportunityRecord } from "../actions";
import type { InGoalAccessLaneCategory } from "../rules";
import type { ConversionGeometry, ConversionGeometryStorageSummary } from "./conversionGeometryTypes";

interface ConversionGeometryMetadata {
  readonly sourceMatchId: string;
  readonly sourceActionId: string;
  readonly scoringTeamId: TeamId;
  readonly scoringTeamName: string;
  readonly groundingPlayerId: PlayerId;
  readonly groundingRouteType: InGoalAccessLaneCategory;
  readonly reason: string;
}

function laneFromScoringZone(zone: ScoringZoneId): LateralCorridor {
  return zone.split("-")[1] as LateralCorridor;
}

function angleDifficulty(lane: LateralCorridor): number {
  if (lane === "C") {
    return 8;
  }

  if (lane === "HSL" || lane === "HSR") {
    return 42;
  }

  return 72;
}

function conversionDistanceOptions(lane: LateralCorridor): readonly string[] {
  if (lane === "C") {
    return ["10m", "15m", "22m"];
  }

  if (lane === "HSL" || lane === "HSR") {
    return ["15m", "22m", "30m"];
  }

  return ["22m", "30m", "38m"];
}

export function chooseRecommendedConversionPoint(context: {
  readonly groundingZone: ScoringZoneId;
  readonly groundingLane: LateralCorridor;
  readonly conversionDistanceOptions: readonly string[];
}): string {
  const preferredDistance =
    context.groundingLane === "C"
      ? "15m"
      : context.groundingLane === "HSL" || context.groundingLane === "HSR"
        ? "22m"
        : "30m";
  const selectedDistance = context.conversionDistanceOptions.includes(preferredDistance)
    ? preferredDistance
    : context.conversionDistanceOptions[0] ?? preferredDistance;

  return `${context.groundingZone} conversion point at ${selectedDistance} along the projected line`;
}

function emptyLaneCounts(): Record<LateralCorridor, number> {
  return {
    CL: 0,
    HSL: 0,
    C: 0,
    HSR: 0,
    CR: 0,
  };
}

export function createConversionGeometryForTry(
  groundingZone: ScoringZoneId,
  metadata?: ConversionGeometryMetadata,
): ConversionGeometry {
  const lane = laneFromScoringZone(groundingZone);
  const distances = conversionDistanceOptions(lane);

  return {
    sourceMatchId: metadata?.sourceMatchId ?? "example",
    sourceActionId: metadata?.sourceActionId ?? "example-try",
    scoringTeamId: metadata?.scoringTeamId ?? "CONTROL",
    scoringTeamName: metadata?.scoringTeamName ?? "CONTROL",
    groundingPlayerId: metadata?.groundingPlayerId ?? "CONTROL-try-runner",
    groundingZone,
    groundingLane: lane,
    groundingPoint: `${groundingZone} grounding mark`,
    groundingRouteType: metadata?.groundingRouteType ?? "EXAMPLE",
    conversionLine: `conversion line projected through ${groundingZone}`,
    conversionAttemptEligible: true,
    conversionPointOptions: distances.map((distance) => `${groundingZone} conversion point at ${distance}`),
    recommendedConversionPoint: chooseRecommendedConversionPoint({
      groundingZone,
      groundingLane: lane,
      conversionDistanceOptions: distances,
    }),
    conversionAngleDifficulty: angleDifficulty(lane),
    conversionDistanceOptions: distances,
    defendingTeamBehindGoalLine: true,
    conversionActive: true,
    conversionPointsAwarded: 0,
    conversionProcessDocumented: true,
    reason:
      metadata?.reason ??
      `${groundingZone} stores conversion geometry for active conversion scoring in V2_DROP_FOUNDATION.`,
  };
}

export function createConversionGeometriesFromTryOpportunities(
  opportunities: readonly TryOpportunityRecord[],
): readonly ConversionGeometry[] {
  return opportunities
    .filter((opportunity) => opportunity.outcome === "TRY_SCORED")
    .map((opportunity) =>
      createConversionGeometryForTry(opportunity.groundingZone, {
        sourceMatchId: opportunity.matchId,
        sourceActionId: `${opportunity.matchId}-try`,
        scoringTeamId: opportunity.teamId,
        scoringTeamName: opportunity.teamName,
        groundingPlayerId: `${opportunity.teamId}-try-runner`,
        groundingRouteType: opportunity.accessRouteType,
        reason: `${opportunity.teamName} scored TRY_TOUCHDOWN through ${opportunity.accessRouteType}; conversion geometry is stored for active conversion scoring.`,
      }),
    );
}

export function summarizeConversionGeometryStorage(
  opportunities: readonly TryOpportunityRecord[],
): ConversionGeometryStorageSummary {
  const geometries = createConversionGeometriesFromTryOpportunities(opportunities);
  const counts = emptyLaneCounts();

  for (const geometry of geometries) {
    counts[geometry.groundingLane] += 1;
  }

  const totalAngle = geometries.reduce((sum, geometry) => sum + geometry.conversionAngleDifficulty, 0);
  const tryScoredCount = opportunities.filter((opportunity) => opportunity.outcome === "TRY_SCORED").length;

  return {
    tryScoredCount,
    geometryRowsStored: geometries.length,
    missingGeometryRows: Math.max(0, tryScoredCount - geometries.length),
    conversionActive: true,
    conversionPointsAwarded: 0,
    conversionGeometryByLane: counts,
    averageConversionAngleDifficulty: geometries.length === 0 ? 0 : Math.round(totalAngle / geometries.length),
    recommendation: "KEEP_CONVERSION_MODEL",
    geometries,
  };
}

export function formatConversionGeometryLaneCounts(counts: Readonly<Record<LateralCorridor, number>>): string {
  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([lane, count]) => `${lane} ${count}`)
    .join(", ") || "none";
}

export function createConversionGeometryStorageReport(input: {
  readonly opportunities: readonly TryOpportunityRecord[];
}): string {
  const summary = summarizeConversionGeometryStorage(input.opportunities);

  return [
    "# Conversion Geometry Storage",
    "",
    "## Summary",
    "- scope: batch TRY_TOUCHDOWN events",
    "- scoring version: V2_DROP_FOUNDATION",
    "- conversion geometry storage active: YES",
    "- CONVERSION scoring active: YES",
    "- conversion resolution active: YES",
    "- TRY_TOUCHDOWN point value: 5 points",
    "- SHOT_GOAL point value: 3 points",
    `- batch TRY_TOUCHDOWN scored: ${summary.tryScoredCount}`,
    `- batch conversion geometry rows stored: ${summary.geometryRowsStored}`,
    `- batch missing conversion geometry rows: ${summary.missingGeometryRows}`,
    "- conversion points awarded: see conversion-resolution.md",
    `- conversion geometry by lane: ${formatConversionGeometryLaneCounts(summary.conversionGeometryByLane)}`,
    `- average conversion angle difficulty: ${summary.averageConversionAngleDifficulty}/100`,
    `- recommendation: ${summary.recommendation}`,
    "",
    "## Conversion Geometry Table",
    "",
    "| matchId | source action | team | grounding player | grounding zone | grounding lane | grounding point | access route | conversion line | recommended conversion point | angle difficulty | distance options | defending team behind goal line | conversion active | conversion points awarded | reason |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...(summary.geometries.length === 0
      ? ["| none | none | none | none | none | none | none | none | none | none | 0 | none | YES | NO | 0 | no TRY_SCORED rows in the current batch |"]
      : summary.geometries.map(
          (geometry) =>
            `| ${geometry.sourceMatchId} | ${geometry.sourceActionId} | ${geometry.scoringTeamName} | ${geometry.groundingPlayerId} | ${geometry.groundingZone} | ${geometry.groundingLane} | ${geometry.groundingPoint} | ${geometry.groundingRouteType} | ${geometry.conversionLine} | ${geometry.recommendedConversionPoint} | ${geometry.conversionAngleDifficulty}/100 | ${geometry.conversionDistanceOptions.join(", ")} | YES | YES | ${geometry.conversionPointsAwarded} | ${geometry.reason} |`,
        )),
    "",
    "## Interpretation",
    `- Are all TRY_SCORED events prepared for conversion? ${summary.missingGeometryRows === 0 ? "YES" : "NO"}`,
    "- Are conversion attempts active? YES, resolved in conversion-resolution.md",
    "- Are conversion points awarded here? NO; this report stores geometry only.",
    "- Does this report change the score? NO; conversion-resolution.md resolves scoring.",
    "- This report stores geometry; conversion-resolution.md resolves scoring.",
    "- Does this preserve V2_DROP_FOUNDATION scoring? YES; TRY_TOUCHDOWN remains 5 points, CONVERSION_GOAL is active at 2 points, and DROP_GOAL remains a separate 2-point route.",
    "",
  ].join("\n");
}
