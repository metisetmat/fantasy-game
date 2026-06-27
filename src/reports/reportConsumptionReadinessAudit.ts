import type { OfficialMatchStorySpineModel } from "./officialMatchStorySpineTypes";

export interface ReportConsumptionReadinessAudit {
  readonly storySpineSerializable: boolean;
  readonly storySpineCanBeRenderedInProductReport: boolean;
  readonly storySpineCanBeRenderedInExport: boolean;
  readonly storySpineHasStableIds: boolean;
  readonly storySpineHasEventLinks: boolean;
  readonly storySpineHasCausalityLinks: boolean;
  readonly storySpineHasLimitations: boolean;
  readonly storySpineDoesNotRequireSandbox: boolean;
  readonly storySpineDoesNotRequirePersistence: boolean;
  readonly reportConsumptionWarningCodes: readonly string[];
  readonly recommendation: string;
}

export function auditReportConsumptionReadiness(model: OfficialMatchStorySpineModel, input?: {
  readonly productReportHtml?: string;
  readonly exportReportHtml?: string;
}): ReportConsumptionReadinessAudit {
  const storySpineSerializable = JSON.stringify(model).length > 0;
  const ids = [
    ...model.segments.map((segment) => segment.segmentId),
    ...model.beats.map((beat) => beat.beatId),
    ...model.turningPoints.map((turningPoint) => turningPoint.turningPointId),
    ...model.causalityLinks.map((link) => link.causalityId),
  ];
  const storySpineHasStableIds = ids.length > 0 && ids.every((id) => /^official-/u.test(id));
  const storySpineHasEventLinks = model.beats.every((beat) => beat.linkedOfficialEventId.length > 0) &&
    model.segments.every((segment) => segment.linkedOfficialEventIds.length > 0);
  const storySpineDoesNotRequireSandbox = !JSON.stringify(model).includes("sandboxOnly\":true");
  const storySpineDoesNotRequirePersistence = !/sqlite|persistence|database/iu.test(model.narrative.shortNarrative + model.narrative.detailedNarrative);
  const storySpineCanBeRenderedInProductReport = input?.productReportHtml === undefined
    ? model.reportIntegrationMinimalReady
    : input.productReportHtml.includes('id="official-match-story-spine"');
  const storySpineCanBeRenderedInExport = input?.exportReportHtml === undefined
    ? model.reportIntegrationMinimalReady
    : input.exportReportHtml.includes('id="official-match-story-spine"');
  const reportConsumptionWarningCodes = [
    ...(storySpineSerializable ? ["REPORT_CONSUMPTION_READY"] : ["STORY_SPINE_MISSING"]),
    ...(storySpineCanBeRenderedInProductReport ? ["PRODUCT_STORY_SECTION_READY"] : []),
    ...(storySpineCanBeRenderedInExport ? ["EXPORT_STORY_SECTION_READY"] : []),
    ...(storySpineHasEventLinks ? ["OFFICIAL_TIMELINE_COVERAGE_READY"] : ["SOURCE_OF_TRUTH_AMBIGUOUS"]),
    ...(storySpineDoesNotRequireSandbox ? [] : ["SANDBOX_TRUTH_LEAKAGE"]),
  ];

  return {
    storySpineSerializable,
    storySpineCanBeRenderedInProductReport,
    storySpineCanBeRenderedInExport,
    storySpineHasStableIds,
    storySpineHasEventLinks,
    storySpineHasCausalityLinks: model.causalityLinks.length > 0,
    storySpineHasLimitations: model.narrative.limitations.length > 0,
    storySpineDoesNotRequireSandbox,
    storySpineDoesNotRequirePersistence,
    reportConsumptionWarningCodes,
    recommendation: storySpineSerializable && storySpineHasStableIds && storySpineHasEventLinks
      ? "READY_FOR_MINIMAL_REPORT_CONSUMPTION"
      : "FIX_STORY_SPINE_CONSUMPTION_CONTRACT",
  };
}
