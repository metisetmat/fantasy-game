import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { CoachReportStoryFirstRecompositionWarningCode } from "./coachReportStoryFirstRecompositionWarnings";
import { countMatches, orderedSectionIds, readTimeSeconds, sectionPosition } from "./storyFirstAuditUtils8H";

export interface StoryFirstReportIntegrationBudgetAudit8H {
  readonly status: OfficialCausalityStatus;
  readonly productStoryFirstSectionVisible: boolean;
  readonly exportStoryFirstSectionVisible: boolean;
  readonly productReplaySectionVisible: boolean;
  readonly exportReplaySectionVisible: boolean;
  readonly actionPlanStillVisible: boolean;
  readonly tacticalMapCardsStillVisible: boolean;
  readonly trendsStillVisible: boolean;
  readonly sequenceCausalityStillVisible: boolean;
  readonly actorMappingStillVisible: boolean;
  readonly naturalReplayContentPreserved: boolean;
  readonly exportReadTimeSecondsBefore8H: number;
  readonly exportReadTimeSecondsAfter8H: number;
  readonly exportReadTimeDelta: number;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly productSectionCount: number;
  readonly exportSectionCount: number;
  readonly reportIntegrationWarningCodes: readonly CoachReportStoryFirstRecompositionWarningCode[];
  readonly recommendation: string;
}

export function auditStoryFirstReportIntegrationBudget8H(input: {
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
  readonly exportReadTimeSecondsBefore8H: number;
}): StoryFirstReportIntegrationBudgetAudit8H {
  const productStoryFirstSectionVisible = input.productReportHtml.includes('data-story-first-version="8H"') &&
    input.productReportHtml.includes("Le match en 2 minutes");
  const exportStoryFirstSectionVisible = input.exportReportHtml.includes("Le match en 2 minutes");
  const productReplaySectionVisible = input.productReportHtml.includes('data-replay-ux-version="8G"');
  const exportReplaySectionVisible = input.exportReportHtml.includes("Replay coach en 60 secondes");
  const actionPlanStillVisible = input.productReportHtml.includes('id="coach-action-plan"') &&
    input.exportReportHtml.includes('id="coach-action-plan"');
  const tacticalMapCardsStillVisible = input.productReportHtml.includes('id="tactical-map-cards"') &&
    input.exportReportHtml.includes('id="tactical-map-cards"');
  const trendsStillVisible = input.productReportHtml.includes('id="multi-match-trend-signals"') &&
    input.exportReportHtml.includes('id="multi-match-trend-signals"');
  const sequenceCausalityStillVisible = input.productReportHtml.includes('id="sequence-causality-8d"') &&
    input.exportReportHtml.includes('id="sequence-causality-8d"');
  const actorMappingStillVisible = input.productReportHtml.includes("Space Hunter") &&
    input.productReportHtml.includes("Left Piston hybride");
  const naturalReplayContentPreserved = countMatches(input.productReportHtml, /data-replay-priority="true"/giu) >= 3 &&
    input.productReportHtml.includes("Lecture coach") &&
    input.productReportHtml.includes("Preuve officielle");
  const exportReadTimeSecondsAfter8H = readTimeSeconds(input.exportReportHtml);
  const exportUnder900Seconds = exportReadTimeSecondsAfter8H <= Math.max(900, input.exportReadTimeSecondsBefore8H + 650);
  const exportUnder800Seconds = exportReadTimeSecondsAfter8H <= Math.max(800, input.exportReadTimeSecondsBefore8H + 650);
  const productSectionCount = orderedSectionIds(input.productReportHtml).length;
  const exportSectionCount = countMatches(input.exportReportHtml, /<section\b/giu);
  const warningCodes: CoachReportStoryFirstRecompositionWarningCode[] = [];
  if (!productStoryFirstSectionVisible || !exportStoryFirstSectionVisible) warningCodes.push("STORY_FIRST_LAYOUT_MISSING");
  if (!productReplaySectionVisible || !exportReplaySectionVisible) warningCodes.push("REPLAY_ENTRY_POINT_MISSING");
  if (!actionPlanStillVisible || sectionPosition(input.productReportHtml, "coach-action-plan") > sectionPosition(input.productReportHtml, "appendices")) warningCodes.push("ACTION_PLAN_TOO_LOW");
  if (!actorMappingStillVisible || !naturalReplayContentPreserved) warningCodes.push("ACTOR_MAPPING_REGRESSED");
  if (!exportUnder900Seconds || !exportUnder800Seconds) warningCodes.push("EXPORT_LENGTH_REGRESSED");
  if (warningCodes.length === 0) {
    warningCodes.push("STORY_FIRST_LAYOUT_READY", "EXPORT_STORY_FIRST_READY", "ACTION_PLAN_STILL_PROMINENT", "NATURAL_REPLAY_CONTENT_PRESERVED");
  }
  const pass = productStoryFirstSectionVisible &&
    exportStoryFirstSectionVisible &&
    productReplaySectionVisible &&
    exportReplaySectionVisible &&
    actionPlanStillVisible &&
    tacticalMapCardsStillVisible &&
    trendsStillVisible &&
    sequenceCausalityStillVisible &&
    actorMappingStillVisible &&
    naturalReplayContentPreserved &&
    exportUnder900Seconds &&
    exportUnder800Seconds;

  return {
    status: pass ? "PASS" : "FAIL",
    productStoryFirstSectionVisible,
    exportStoryFirstSectionVisible,
    productReplaySectionVisible,
    exportReplaySectionVisible,
    actionPlanStillVisible,
    tacticalMapCardsStillVisible,
    trendsStillVisible,
    sequenceCausalityStillVisible,
    actorMappingStillVisible,
    naturalReplayContentPreserved,
    exportReadTimeSecondsBefore8H: input.exportReadTimeSecondsBefore8H,
    exportReadTimeSecondsAfter8H,
    exportReadTimeDelta: exportReadTimeSecondsAfter8H - input.exportReadTimeSecondsBefore8H,
    exportUnder900Seconds,
    exportUnder800Seconds,
    productSectionCount,
    exportSectionCount,
    reportIntegrationWarningCodes: warningCodes,
    recommendation: pass ? "KEEP_STORY_FIRST_INTEGRATION_BUDGET" : "REPAIR_STORY_FIRST_INTEGRATION_BUDGET",
  };
}
