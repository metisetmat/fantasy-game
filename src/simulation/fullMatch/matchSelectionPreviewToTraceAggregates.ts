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
    if (dangerZones.length > 0) reasons.push("danger_zone_support");
    if (recoveryZones.length > 0) reasons.push("recovery_zone_support");
    if (pressureZones.length > 0 || official.highPressureTraceCount > 0) reasons.push("pressure_signal_support");
    if (causeTags.some((tag) => tag === "pressure_forced_error" || tag === "lack_of_support" || tag === "fatigue_drop" || tag === "defensive_recovery")) reasons.push("cause_tag_support");
  }

  if (input.preview.previewId === "second_ball_presence") {
    if (recoveryZones.length > 0) reasons.push("recovery_zone_support");
    if (impactTags.some((tag) => tag === "possession_secured" || tag === "second_chance_allowed" || tag === "shot_prevented")) reasons.push("impact_tag_support");
    if (secondChanceZones.length > 0 || causeTags.includes("second_ball_presence")) reasons.push("second_ball_signal_support");
    if (pressureZones.length > 0 || official.highPressureTraceCount > 0) reasons.push("pressure_signal_support");
  }

  if (input.preview.previewId === "strong_goalkeeper_response") {
    if (goalkeeperZones.length > 0 || causeTags.includes("goalkeeper_quality")) reasons.push("goalkeeper_signal_support");
    if (impactTags.some((tag) => tag === "shot_prevented" || tag === "possession_secured")) reasons.push("impact_tag_support");
    if (secondChanceZones.length > 0 || causeTags.includes("second_ball_presence")) reasons.push("second_ball_signal_support");
    if (dangerZones.length > 0) reasons.push("danger_zone_support");
  }

  if (official.fatigueImpactTotal > 0 && input.preview.previewId !== "strong_goalkeeper_response") {
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

  return {
    previewId: input.preview.previewId,
    linkedCoachTestId: input.preview.linkedCoachTestId,
    previousBackingStatus: "sandbox_only",
    newBackingStatus: traceSupported ? "trace_supported" : "sandbox_only",
    supportStrength: traceSupported ? strengthFor(reasons) : "none",
    supportReasons: traceSupported ? reasons : [],
    officialAggregateTraceCount: official.traceCount,
    matchedDangerZones: traceSupported ? keys(official.dangerByZone).slice(0, 3) : [],
    matchedRecoveryZones: traceSupported ? keys(official.recoveryByZone).slice(0, 3) : [],
    matchedCauseLabels: traceSupported ? typedKeys(official.causeTagCounts).slice(0, 4) : [],
    matchedImpactLabels: traceSupported ? typedKeys(official.impactTagCounts).slice(0, 4) : [],
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
    return buildSelectionPreviewTraceBackingModel({
      preview: input.preview,
      supports: input.preview.previews.map((preview) => supportForPreview({ preview, aggregate: input.aggregate })),
      warnings: ["OFFICIAL_TRACE_AGGREGATES_NOT_AVAILABLE"],
    });
  }

  return buildSelectionPreviewTraceBackingModel({
    preview: input.preview,
    supports: input.preview.previews.map((preview) => supportForPreview({ preview, aggregate: input.aggregate })),
  });
}
