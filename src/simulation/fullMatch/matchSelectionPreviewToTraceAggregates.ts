import type { MatchTraceAggregateModel } from "../tracing/matchTraceAggregateTypes";
import type { SelectionPreviewCard, SelectionPreviewModel } from "./selectionPreviewFromCoachTestPlan";
import {
  buildSelectionPreviewTraceBackingModel,
  emptySelectionPreviewTraceBackingModel,
  type SelectionPreviewTraceSupport,
  type SelectionPreviewTraceSupportReason,
  type SelectionPreviewTraceSupportStrength,
  type SelectionPreviewTraceBackingModel,
} from "./selectionPreviewTraceBacking";

function keys(record: Readonly<Record<string, number>>): readonly string[] {
  return Object.entries(record)
    .filter(([, count]) => count > 0)
    .map(([key]) => key);
}

function typedKeys<T extends string>(record: Partial<Record<T, number>>): readonly T[] {
  return Object.entries(record)
    .filter(([, count]) => Number(count) > 0)
    .map(([key]) => key as T);
}

function strengthFor(reasons: readonly SelectionPreviewTraceSupportReason[]): SelectionPreviewTraceSupportStrength {
  if (reasons.length >= 4) {
    return "strong";
  }
  if (reasons.length >= 2) {
    return "medium";
  }
  if (reasons.length === 1) {
    return "weak";
  }
  return "none";
}

function unique<T extends string>(values: readonly T[]): readonly T[] {
  return [...new Set(values)];
}

function zonesInScope(zones: readonly string[], scope: readonly string[]): readonly string[] {
  return zones.filter((zone) => scope.includes(zone));
}

function hasAnyZone(zones: readonly string[]): boolean {
  return zones.length > 0;
}

const SUPPORT_NEAR_Z4_HSR_ZONES = ["Z4-HSR", "Z5-HSR", "Z3-HSR"] as const;
const SECOND_BALL_ZONES = ["Z5-C", "Z5-HSR", "Z4-HSR", "Z3-C"] as const;
const GOALKEEPER_RESPONSE_ZONES = ["Z5-C", "Z5-HSR", "Z5-HSL"] as const;

function zoneScopeForPreview(previewId: SelectionPreviewCard["previewId"]): readonly string[] {
  switch (previewId) {
    case "support_near_z4_hsr":
      return SUPPORT_NEAR_Z4_HSR_ZONES;
    case "second_ball_presence":
      return SECOND_BALL_ZONES;
    case "strong_goalkeeper_response":
      return GOALKEEPER_RESPONSE_ZONES;
  }
}

function causeTagsForPreview(
  previewId: SelectionPreviewCard["previewId"],
  causeTags: readonly ReturnType<typeof typedKeys>[number][],
): readonly string[] {
  switch (previewId) {
    case "support_near_z4_hsr":
      return causeTags.filter((tag) => tag === "pressure_forced_error" || tag === "lack_of_support" || tag === "fatigue_drop" || tag === "defensive_recovery");
    case "second_ball_presence":
      return causeTags.filter((tag) => tag === "second_ball_presence" || tag === "pressure_forced_error" || tag === "defensive_recovery");
    case "strong_goalkeeper_response":
      return causeTags.filter((tag) => tag === "goalkeeper_quality" || tag === "second_ball_presence");
  }
}

function impactTagsForPreview(
  previewId: SelectionPreviewCard["previewId"],
  impactTags: readonly ReturnType<typeof typedKeys>[number][],
): readonly string[] {
  switch (previewId) {
    case "support_near_z4_hsr":
      return impactTags.filter((tag) => tag === "line_broken" || tag === "danger_created" || tag === "possession_secured");
    case "second_ball_presence":
      return impactTags.filter((tag) => tag === "possession_secured" || tag === "second_chance_allowed" || tag === "shot_prevented");
    case "strong_goalkeeper_response":
      return impactTags.filter((tag) => tag === "shot_prevented" || tag === "possession_secured");
  }
}

function supportReasonsForPreview(input: {
  readonly preview: SelectionPreviewCard;
  readonly aggregate: MatchTraceAggregateModel;
}): readonly SelectionPreviewTraceSupportReason[] {
  const official = input.aggregate.official;
  const dangerZones = keys(official.dangerByZone);
  const recoveryZones = keys(official.recoveryByZone);
  const pressureZones = keys(official.pressureLossByZone);
  const secondChanceZones = keys(official.secondChanceByZone);
  const goalkeeperZones = keys(official.goalkeeperActionByZone);
  const causeTags = typedKeys(official.causeTagCounts);
  const impactTags = typedKeys(official.impactTagCounts);
  const reasons: SelectionPreviewTraceSupportReason[] = [];

  if (input.preview.previewId === "support_near_z4_hsr") {
    const scopedDangerZones = zonesInScope(dangerZones, SUPPORT_NEAR_Z4_HSR_ZONES);
    const scopedRecoveryZones = zonesInScope(recoveryZones, SUPPORT_NEAR_Z4_HSR_ZONES);
    const scopedPressureZones = zonesInScope(pressureZones, SUPPORT_NEAR_Z4_HSR_ZONES);
    const hasScopedZone = hasAnyZone(scopedDangerZones) || hasAnyZone(scopedRecoveryZones) || hasAnyZone(scopedPressureZones);

    if (hasAnyZone(scopedDangerZones)) reasons.push("danger_zone_support");
    if (hasAnyZone(scopedRecoveryZones)) reasons.push("recovery_zone_support");
    if (hasAnyZone(scopedPressureZones) || (hasScopedZone && official.highPressureTraceCount > 0)) reasons.push("pressure_signal_support");
    if (hasScopedZone && causeTags.some((tag) => tag === "pressure_forced_error" || tag === "lack_of_support" || tag === "fatigue_drop" || tag === "defensive_recovery")) reasons.push("cause_tag_support");
  }

  if (input.preview.previewId === "second_ball_presence") {
    const scopedRecoveryZones = zonesInScope(recoveryZones, SECOND_BALL_ZONES);
    const scopedSecondChanceZones = zonesInScope(secondChanceZones, SECOND_BALL_ZONES);
    const scopedPressureZones = zonesInScope(pressureZones, SECOND_BALL_ZONES);
    const hasScopedZone = hasAnyZone(scopedRecoveryZones) || hasAnyZone(scopedSecondChanceZones) || hasAnyZone(scopedPressureZones);

    if (hasAnyZone(scopedRecoveryZones)) reasons.push("recovery_zone_support");
    if (hasScopedZone && impactTags.some((tag) => tag === "possession_secured" || tag === "second_chance_allowed" || tag === "shot_prevented")) reasons.push("impact_tag_support");
    if (hasAnyZone(scopedSecondChanceZones) || (hasScopedZone && causeTags.includes("second_ball_presence"))) reasons.push("second_ball_signal_support");
    if (hasAnyZone(scopedPressureZones) || (hasScopedZone && official.highPressureTraceCount > 0)) reasons.push("pressure_signal_support");
  }

  if (input.preview.previewId === "strong_goalkeeper_response") {
    const scopedGoalkeeperZones = zonesInScope(goalkeeperZones, GOALKEEPER_RESPONSE_ZONES);
    const scopedSecondChanceZones = zonesInScope(secondChanceZones, GOALKEEPER_RESPONSE_ZONES);
    const scopedDangerZones = zonesInScope(dangerZones, GOALKEEPER_RESPONSE_ZONES);
    const hasScopedZone = hasAnyZone(scopedGoalkeeperZones) || hasAnyZone(scopedSecondChanceZones) || hasAnyZone(scopedDangerZones);

    if (hasAnyZone(scopedGoalkeeperZones) || (hasScopedZone && causeTags.includes("goalkeeper_quality"))) reasons.push("goalkeeper_signal_support");
    if (hasScopedZone && impactTags.some((tag) => tag === "shot_prevented" || tag === "possession_secured")) reasons.push("impact_tag_support");
    if (hasAnyZone(scopedSecondChanceZones) || (hasScopedZone && causeTags.includes("second_ball_presence"))) reasons.push("second_ball_signal_support");
    if (hasAnyZone(scopedDangerZones)) reasons.push("danger_zone_support");
  }

  if (official.fatigueImpactTotal > 0 && input.preview.previewId !== "strong_goalkeeper_response" && reasons.length > 0) {
    reasons.push("fatigue_signal_support");
  }

  return unique(reasons);
}

function supportForPreview(input: {
  readonly preview: SelectionPreviewCard;
  readonly aggregate: MatchTraceAggregateModel;
}): SelectionPreviewTraceSupport {
  const reasons = supportReasonsForPreview(input);
  const official = input.aggregate.official;
  const traceSupported = reasons.length > 0 && official.traceCount > 0 && official.officialTruthTrueCount > 0;
  const zoneScope = zoneScopeForPreview(input.preview.previewId);
  const causeTags = typedKeys(official.causeTagCounts);
  const impactTags = typedKeys(official.impactTagCounts);

  return {
    previewId: input.preview.previewId,
    linkedCoachTestId: input.preview.linkedCoachTestId,
    previousBackingStatus: "sandbox_only",
    newBackingStatus: traceSupported ? "trace_supported" : "sandbox_only",
    supportStrength: traceSupported ? strengthFor(reasons) : "none",
    supportReasons: traceSupported ? reasons : [],
    officialAggregateTraceCount: official.traceCount,
    matchedDangerZones: traceSupported ? zonesInScope(keys(official.dangerByZone), zoneScope).slice(0, 3) : [],
    matchedRecoveryZones: traceSupported ? zonesInScope(keys(official.recoveryByZone), zoneScope).slice(0, 3) : [],
    matchedCauseLabels: traceSupported ? causeTagsForPreview(input.preview.previewId, causeTags).slice(0, 4) : [],
    matchedImpactLabels: traceSupported ? impactTagsForPreview(input.preview.previewId, impactTags).slice(0, 4) : [],
    matchedPlayerIds: traceSupported ? keys(official.playerInvolvement).slice(0, 4) : [],
    traceSupported,
    officiallyConfirmed: false,
    previewStillNonApplied: true,
    canChangeLineup: false,
    canChangeStarters: false,
    canChangeBench: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canMutateTimeline: false,
    canMutateScore: false,
    canMutatePossession: false,
    canCreateScoringEvent: false,
    canClaimGlobalEconomy: false,
    confidenceUpgradeAllowed: false,
    warnings: traceSupported ? [] : ["NO_OFFICIAL_AGGREGATE_SUPPORT_FOR_PREVIEW"],
  };
}

export function matchSelectionPreviewToTraceAggregates(input: {
  readonly preview: SelectionPreviewModel;
  readonly aggregate: MatchTraceAggregateModel;
}): SelectionPreviewTraceBackingModel {
  if (input.preview.status !== "available") {
    return emptySelectionPreviewTraceBackingModel({
      preview: input.preview,
      warning: "SELECTION_PREVIEW_NOT_AVAILABLE",
    });
  }

  if (input.aggregate.status !== "available" || input.aggregate.official.traceCount === 0) {
    return emptySelectionPreviewTraceBackingModel({
      preview: input.preview,
      warning: "OFFICIAL_TRACE_AGGREGATES_NOT_AVAILABLE",
    });
  }

  return buildSelectionPreviewTraceBackingModel({
    preview: input.preview,
    supports: input.preview.previews.map((preview) => supportForPreview({ preview, aggregate: input.aggregate })),
  });
}
