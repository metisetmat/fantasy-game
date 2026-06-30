import { auditCoachReplayReportIntegrationBudget } from "./coachReplayReportIntegrationBudgetAudit";
import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { ReplayActorMappingNaturalNarrativeFixWarningCode } from "./replayActorMappingNaturalNarrativeFixWarnings";

export interface ReplayReportIntegrationBudgetAudit8F {
  readonly status: OfficialCausalityStatus;
  readonly productReplaySectionVisible: boolean;
  readonly exportReplaySectionVisible: boolean;
  readonly productStoryStillVisible: boolean;
  readonly exportStoryStillVisible: boolean;
  readonly actionPlanStillVisible: boolean;
  readonly tacticalMapCardsStillVisible: boolean;
  readonly trendsStillVisible: boolean;
  readonly sequenceCausalityStillVisible: boolean;
  readonly exportReadTimeSecondsBefore8F: number;
  readonly exportReadTimeSecondsAfter8F: number;
  readonly exportReadTimeDelta: number;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly productReplayMomentCardCount: number;
  readonly exportReplayMomentCardCount: number;
  readonly reportIntegrationWarningCodes: readonly ReplayActorMappingNaturalNarrativeFixWarningCode[];
  readonly recommendation: string;
}

function visible(html: string, id: string): boolean {
  return html.includes(`id="${id}"`);
}

export function auditReplayReportIntegrationBudget8F(input: {
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
  readonly exportReadTimeSecondsBefore8F: number;
}): ReplayReportIntegrationBudgetAudit8F {
  const base = auditCoachReplayReportIntegrationBudget({
    productReportHtml: input.productReportHtml,
    exportReportHtml: input.exportReportHtml,
    exportReadTimeSecondsBefore8E: input.exportReadTimeSecondsBefore8F,
  });
  const productStoryStillVisible = visible(input.productReportHtml, "official-match-reading");
  const exportStoryStillVisible = visible(input.exportReportHtml, "match-story");
  const actionPlanStillVisible = visible(input.productReportHtml, "coach-action-plan") || input.productReportHtml.includes("Plan d'action");
  const tacticalMapCardsStillVisible = visible(input.productReportHtml, "tactical-map-cards") || input.productReportHtml.includes("tactical-map-card");
  const trendsStillVisible = visible(input.productReportHtml, "multi-match-trend-signals") || input.productReportHtml.includes("trend-card");
  const sequenceCausalityStillVisible = visible(input.productReportHtml, "sequence-causality-8d");
  const exportUnder800Seconds = base.exportReadTimeSecondsAfter8E <= 800;
  const passed = base.status === "PASS" &&
    productStoryStillVisible &&
    exportStoryStillVisible &&
    actionPlanStillVisible &&
    tacticalMapCardsStillVisible &&
    trendsStillVisible &&
    sequenceCausalityStillVisible;
  const warningCodes: ReplayActorMappingNaturalNarrativeFixWarningCode[] = [];
  if (!base.exportUnder900Seconds) warningCodes.push("EXPORT_LENGTH_REGRESSED");
  if (!passed) warningCodes.push("REPORT_INTEGRATION_REGRESSED");
  if (warningCodes.length === 0) {
    warningCodes.push("PRODUCT_REPLAY_SECTION_UPDATED", "EXPORT_REPLAY_SECTION_UPDATED", "EXPORT_LENGTH_PRESERVED");
  }

  return {
    status: passed ? "PASS" : "FAIL",
    productReplaySectionVisible: base.productReplaySectionVisible,
    exportReplaySectionVisible: base.exportReplaySectionVisible,
    productStoryStillVisible,
    exportStoryStillVisible,
    actionPlanStillVisible,
    tacticalMapCardsStillVisible,
    trendsStillVisible,
    sequenceCausalityStillVisible,
    exportReadTimeSecondsBefore8F: input.exportReadTimeSecondsBefore8F,
    exportReadTimeSecondsAfter8F: base.exportReadTimeSecondsAfter8E,
    exportReadTimeDelta: base.exportReadTimeSecondsAfter8E - input.exportReadTimeSecondsBefore8F,
    exportUnder900Seconds: base.exportUnder900Seconds,
    exportUnder800Seconds,
    productReplayMomentCardCount: base.productReplayMomentCount,
    exportReplayMomentCardCount: base.exportReplayMomentCount,
    reportIntegrationWarningCodes: warningCodes,
    recommendation: passed ? "KEEP_REPLAY_REPORT_INTEGRATION_8F" : "REVIEW_REPLAY_REPORT_INTEGRATION_8F",
  };
}
