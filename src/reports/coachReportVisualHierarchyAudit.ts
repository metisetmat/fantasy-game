import {
  appearsBefore,
  extractSection,
  readTimeSecondsFromHtml,
  sectionIndex,
} from "./coachReportHtmlAuditUtils";
import type { CoachReportPremiumLayoutVisualHierarchyWarningCode } from "./coachReportPremiumLayoutVisualHierarchyWarnings";

export interface CoachReportVisualHierarchyAudit {
  readonly expressReadAvailable: boolean;
  readonly expressReadTimeSeconds: number;
  readonly coachReadTimeSeconds: number;
  readonly officialScoreProminence: boolean;
  readonly sourceOfTruthProminence: boolean;
  readonly actionPlanAboveFold: boolean;
  readonly primaryActionCardProminence: boolean;
  readonly secondaryCardsVisible: boolean;
  readonly nextMatchPlanVisible: boolean;
  readonly keySignalsVisible: boolean;
  readonly profilesToObserveVisible: boolean;
  readonly appendixCollapsed: boolean;
  readonly technicalDetailsCollapsed: boolean;
  readonly sandboxBelowOfficialSections: boolean;
  readonly diagnosticBelowOfficialSections: boolean;
  readonly guardrailSummaryVisible: boolean;
  readonly visualHierarchyScore: number;
  readonly visualHierarchyWarningCodes: readonly CoachReportPremiumLayoutVisualHierarchyWarningCode[];
  readonly recommendation: "KEEP_VISUAL_HIERARCHY" | "IMPROVE_ACTION_PLAN_PROMINENCE" | "RESTORE_EXPRESS_READ" | "COLLAPSE_TECHNICAL_APPENDICES";
}

export function auditCoachReportVisualHierarchy(productHtml: string): CoachReportVisualHierarchyAudit {
  const expressSection = extractSection(productHtml, "express-read");
  const actionPlanSection = extractSection(productHtml, "coach-action-plan");
  const appendixSection = extractSection(productHtml, "appendices");
  const expressReadAvailable = expressSection.length > 0;
  const expressReadTimeSeconds = readTimeSecondsFromHtml(expressSection);
  const coachReadTimeSeconds = readTimeSecondsFromHtml([
    extractSection(productHtml, "executive-summary"),
    actionPlanSection,
    extractSection(productHtml, "training-focus-package"),
    extractSection(productHtml, "next-match-plan"),
    extractSection(productHtml, "key-coach-signals"),
    extractSection(productHtml, "profiles-to-observe"),
  ].join("\n"));
  const officialScoreProminence = sectionIndex(productHtml, "premium-cover") >= 0 &&
    productHtml.indexOf("Score officiel") >= 0 &&
    productHtml.indexOf("Score officiel") < sectionIndex(productHtml, "coach-action-plan");
  const sourceOfTruthProminence = productHtml.indexOf("Diagnostics separes") >= 0 &&
    productHtml.indexOf("Sandbox non applique") >= 0 &&
    productHtml.indexOf("Diagnostics separes") < sectionIndex(productHtml, "appendices");
  const actionPlanAboveFold = appearsBefore(productHtml, "coach-action-plan", "key-coach-signals") &&
    appearsBefore(productHtml, "coach-action-plan", "appendices");
  const primaryActionCardProminence = actionPlanSection.includes("action-plan-card--primary");
  const secondaryCardsVisible = actionPlanSection.includes("action-plan-card--secondary") ||
    actionPlanSection.includes("action-plan-card--watch");
  const nextMatchPlanVisible = sectionIndex(productHtml, "next-match-plan") >= 0 &&
    appearsBefore(productHtml, "next-match-plan", "appendices");
  const keySignalsVisible = sectionIndex(productHtml, "key-coach-signals") >= 0;
  const profilesToObserveVisible = sectionIndex(productHtml, "profiles-to-observe") >= 0 &&
    appearsBefore(productHtml, "profiles-to-observe", "appendices");
  const appendixCollapsed = appendixSection.includes("<details");
  const technicalDetailsCollapsed = appendixCollapsed;
  const sandboxBelowOfficialSections = sectionIndex(productHtml, "appendices") > sectionIndex(productHtml, "official-match-reading");
  const diagnosticBelowOfficialSections = sectionIndex(productHtml, "appendices") > sectionIndex(productHtml, "key-coach-signals");
  const guardrailSummaryVisible = sectionIndex(productHtml, "guardrail-summary") >= 0;
  const passed = [
    expressReadAvailable,
    expressReadTimeSeconds <= 30,
    coachReadTimeSeconds <= 180,
    officialScoreProminence,
    sourceOfTruthProminence,
    actionPlanAboveFold,
    primaryActionCardProminence,
    secondaryCardsVisible,
    nextMatchPlanVisible,
    keySignalsVisible,
    profilesToObserveVisible,
    appendixCollapsed,
    technicalDetailsCollapsed,
    sandboxBelowOfficialSections,
    diagnosticBelowOfficialSections,
    guardrailSummaryVisible,
  ].filter(Boolean).length;
  const visualHierarchyScore = Math.round((passed / 16) * 100);
  const visualHierarchyWarningCodes: CoachReportPremiumLayoutVisualHierarchyWarningCode[] = [
    ...(expressReadAvailable ? ["EXPRESS_READ_VISIBLE" as const] : ["EXPRESS_READ_MISSING" as const]),
    ...(officialScoreProminence ? ["OFFICIAL_SCORE_ABOVE_FOLD" as const] : []),
    ...(sourceOfTruthProminence ? ["SOURCE_OF_TRUTH_ABOVE_FOLD" as const] : ["SOURCE_OF_TRUTH_NOT_PROMINENT" as const]),
    ...(actionPlanAboveFold ? ["ACTION_PLAN_PROMINENT" as const] : ["ACTION_PLAN_NOT_PROMINENT" as const]),
    ...(primaryActionCardProminence ? ["PRIMARY_ACTION_CARD_PROMINENT" as const] : ["PRIMARY_ACTION_CARD_NOT_PROMINENT" as const]),
    ...(appendixCollapsed && technicalDetailsCollapsed ? ["TECHNICAL_APPENDICES_COLLAPSED" as const] : ["TECHNICAL_DETAILS_NOT_COLLAPSED" as const]),
    ...(sandboxBelowOfficialSections ? ["SANDBOX_BELOW_OFFICIAL_SECTIONS" as const] : ["SANDBOX_TOO_HIGH_IN_REPORT" as const]),
    ...(visualHierarchyScore >= 90 ? ["VISUAL_HIERARCHY_READY" as const] : ["LAYOUT_TOO_DENSE" as const]),
  ];

  return {
    expressReadAvailable,
    expressReadTimeSeconds,
    coachReadTimeSeconds,
    officialScoreProminence,
    sourceOfTruthProminence,
    actionPlanAboveFold,
    primaryActionCardProminence,
    secondaryCardsVisible,
    nextMatchPlanVisible,
    keySignalsVisible,
    profilesToObserveVisible,
    appendixCollapsed,
    technicalDetailsCollapsed,
    sandboxBelowOfficialSections,
    diagnosticBelowOfficialSections,
    guardrailSummaryVisible,
    visualHierarchyScore,
    visualHierarchyWarningCodes,
    recommendation: visualHierarchyScore >= 90
      ? "KEEP_VISUAL_HIERARCHY"
      : !expressReadAvailable
        ? "RESTORE_EXPRESS_READ"
        : !actionPlanAboveFold || !primaryActionCardProminence
          ? "IMPROVE_ACTION_PLAN_PROMINENCE"
          : "COLLAPSE_TECHNICAL_APPENDICES",
  };
}
