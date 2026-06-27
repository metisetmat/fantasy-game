import { countOccurrences, extractSection, sectionIndex } from "./coachReportHtmlAuditUtils";
import type { CoachReportPhaseVisualsTacticalMapCardsWarningCode } from "./coachReportPhaseVisualsTacticalMapCardsWarnings";

export interface CoachReportVisualDensityAudit {
  readonly visualDensityScoreBefore: number;
  readonly visualDensityScoreAfter: number;
  readonly visualDensityDelta: number;
  readonly visualCardCount: number;
  readonly newVisualSectionCount: number;
  readonly replacedTextBlockCount: number;
  readonly duplicatedVisualContentCount: number;
  readonly excessiveVisualDensity: boolean;
  readonly expressReadStillVisible: boolean;
  readonly actionPlanStillAboveFold: boolean;
  readonly technicalAppendicesStillCollapsed: boolean;
  readonly visualDensityWarningCodes: readonly CoachReportPhaseVisualsTacticalMapCardsWarningCode[];
  readonly recommendation: "KEEP_VISUAL_DENSITY" | "REDUCE_VISUAL_DENSITY" | "RESTORE_ACTION_PLAN_PRIORITY";
}

export function auditCoachReportVisualDensity(input: {
  readonly productReportHtml: string;
  readonly visualDensityScoreBefore: number;
}): CoachReportVisualDensityAudit {
  const visualCardCount = countOccurrences(input.productReportHtml, "class=\"tactical-map-card\"");
  const newVisualSectionCount = countOccurrences(input.productReportHtml, "id=\"tactical-map-cards\"");
  const replacedTextBlockCount = input.productReportHtml.includes("Cartes sobres issues des signaux officiels disponibles") ? 1 : 0;
  const duplicatedVisualContentCount = Math.max(0, newVisualSectionCount - 1);
  const visualDensityScoreAfter = input.visualDensityScoreBefore + Math.min(5, visualCardCount + newVisualSectionCount - replacedTextBlockCount);
  const visualDensityDelta = visualDensityScoreAfter - input.visualDensityScoreBefore;
  const absoluteDensityLimit = Math.max(100, input.visualDensityScoreBefore + 5);
  const excessiveVisualDensity = visualDensityDelta > 5 || visualDensityScoreAfter > absoluteDensityLimit || visualCardCount > 3 || duplicatedVisualContentCount > 0;
  const expressReadStillVisible = sectionIndex(input.productReportHtml, "express-read") >= 0;
  const actionPlanStillAboveFold = sectionIndex(input.productReportHtml, "coach-action-plan") >= 0 &&
    sectionIndex(input.productReportHtml, "coach-action-plan") < sectionIndex(input.productReportHtml, "tactical-map-cards");
  const technicalAppendicesStillCollapsed = extractSection(input.productReportHtml, "appendices").includes("<details");
  const ready = !excessiveVisualDensity &&
    expressReadStillVisible &&
    actionPlanStillAboveFold &&
    technicalAppendicesStillCollapsed;
  const visualDensityWarningCodes: CoachReportPhaseVisualsTacticalMapCardsWarningCode[] = [
    ...(ready ? ["VISUAL_DENSITY_CONTROLLED" as const] : []),
    ...(expressReadStillVisible ? ["EXPRESS_READ_PRESERVED" as const] : ["EXPRESS_READ_REGRESSED" as const]),
    ...(actionPlanStillAboveFold ? ["ACTION_PLAN_STILL_PROMINENT" as const] : ["ACTION_PLAN_NOT_PROMINENT" as const]),
    ...(technicalAppendicesStillCollapsed ? ["TECHNICAL_APPENDICES_COLLAPSED" as const] : ["TECHNICAL_DETAILS_NOT_COLLAPSED" as const]),
    ...(visualCardCount > 3 ? ["TOO_MANY_VISUAL_CARDS" as const] : []),
    ...(visualDensityDelta > 5 ? ["VISUAL_DENSITY_INCREASED_TOO_MUCH" as const] : []),
    ...(visualDensityScoreAfter > absoluteDensityLimit ? ["VISUAL_CARDS_TOO_DENSE" as const] : []),
    ...(duplicatedVisualContentCount > 0 ? ["DUPLICATED_VISUAL_SECTIONS_DETECTED" as const] : []),
  ];

  return {
    visualDensityScoreBefore: input.visualDensityScoreBefore,
    visualDensityScoreAfter,
    visualDensityDelta,
    visualCardCount,
    newVisualSectionCount,
    replacedTextBlockCount,
    duplicatedVisualContentCount,
    excessiveVisualDensity,
    expressReadStillVisible,
    actionPlanStillAboveFold,
    technicalAppendicesStillCollapsed,
    visualDensityWarningCodes,
    recommendation: ready
      ? "KEEP_VISUAL_DENSITY"
      : !actionPlanStillAboveFold
        ? "RESTORE_ACTION_PLAN_PRIORITY"
        : "REDUCE_VISUAL_DENSITY",
  };
}
