import {
  countOccurrences,
  extractSection,
  visibleText,
} from "./coachReportHtmlAuditUtils";
import type { CoachReportExportLengthTrendCountCleanupWarningCode } from "./coachReportExportLengthTrendCountCleanupWarnings";

export interface CoachReportExportContentPrioritizationAudit {
  readonly coverVisible: boolean;
  readonly expressReadVisible: boolean;
  readonly actionPlanVisible: boolean;
  readonly tacticalMapCardsVisible: boolean;
  readonly trendSignalsVisible: boolean;
  readonly nextMatchChecksVisible: boolean;
  readonly compactGuardrailsVisible: boolean;
  readonly profilesSummaryVisible: boolean;
  readonly fullProfilesMovedToAppendix: boolean;
  readonly experimentalHypothesesMovedToAppendix: boolean;
  readonly technicalTraceabilityMovedToAppendix: boolean;
  readonly repeatedSandboxWarningsCount: number;
  readonly repeatedTechnicalCopyCount: number;
  readonly exportContentPrioritizationWarningCodes: readonly CoachReportExportLengthTrendCountCleanupWarningCode[];
  readonly recommendation: "KEEP_EXPORT_PRIORITIZATION" | "CONDENSE_EXPORT_MAIN_BODY" | "RESTORE_EXPORT_PRIORITY";
}

function mainBody(html: string): string {
  return html.replace(/<details[\s\S]*?<\/details>/giu, "");
}

export function auditCoachReportExportContentPrioritization(exportHtml: string): CoachReportExportContentPrioritizationAudit {
  const body = mainBody(exportHtml);
  const text = visibleText(body).toLocaleLowerCase("fr-FR");
  const coverVisible = body.includes('id="cover"');
  const expressReadVisible = body.includes('id="express-read"');
  const actionPlanVisible = body.includes('id="coach-action-plan"');
  const tacticalMapCardsVisible = body.includes('id="tactical-map-cards"');
  const trendSignalsVisible = body.includes('id="multi-match-trend-signals"');
  const nextMatchChecksVisible = body.includes('id="next-match"') || body.includes('id="next-match-plan"');
  const compactGuardrailsVisible = body.includes('id="interpretation-guard"') && /garde-fous|ne cr.e pas une seconde source/iu.test(text);
  const profilesSection = extractSection(body, "profiles-and-players");
  const profilesSummaryVisible = profilesSection.includes("compact-profile-summary");
  const fullProfilesMovedToAppendix = profilesSummaryVisible && !profilesSection.includes("report-player-study-grid");
  const experimentalHypothesesMovedToAppendix = !/plan de test sandbox|hypoth.se sandbox|sandbox appliqu/iu.test(text);
  const technicalTraceabilityMovedToAppendix = !/trace_supported|sandbox_only|database|sqlite|migration|adapter spike/iu.test(text);
  const repeatedSandboxWarningsCount = Math.max(0, countOccurrences(text, "sandbox") - 1);
  const repeatedTechnicalCopyCount = Math.max(0, countOccurrences(text, "ne modifie") - 2);
  const ready = coverVisible &&
    expressReadVisible &&
    actionPlanVisible &&
    tacticalMapCardsVisible &&
    trendSignalsVisible &&
    nextMatchChecksVisible &&
    compactGuardrailsVisible &&
    profilesSummaryVisible &&
    fullProfilesMovedToAppendix &&
    experimentalHypothesesMovedToAppendix &&
    technicalTraceabilityMovedToAppendix &&
    repeatedTechnicalCopyCount === 0;

  return {
    coverVisible,
    expressReadVisible,
    actionPlanVisible,
    tacticalMapCardsVisible,
    trendSignalsVisible,
    nextMatchChecksVisible,
    compactGuardrailsVisible,
    profilesSummaryVisible,
    fullProfilesMovedToAppendix,
    experimentalHypothesesMovedToAppendix,
    technicalTraceabilityMovedToAppendix,
    repeatedSandboxWarningsCount,
    repeatedTechnicalCopyCount,
    exportContentPrioritizationWarningCodes: [
      ...(ready ? ["COACH_EXPORT_READY" as const] : ["COACH_REPORT_EXPORT_LENGTH_CLEANUP_PARTIAL" as const]),
      ...(expressReadVisible ? ["EXPRESS_READ_PRESERVED" as const] : ["EXPRESS_READ_REGRESSED" as const]),
      ...(actionPlanVisible ? ["ACTION_PLAN_STILL_PROMINENT" as const] : ["ACTION_PLAN_NOT_PROMINENT" as const]),
      ...(tacticalMapCardsVisible ? ["TACTICAL_MAP_CARDS_PRESERVED" as const] : ["TACTICAL_MAP_CARDS_REGRESSED" as const]),
      ...(trendSignalsVisible ? ["TREND_SIGNALS_PRESERVED" as const] : ["TREND_SIGNALS_REGRESSED" as const]),
      ...(technicalTraceabilityMovedToAppendix ? [] : ["SOURCE_OF_TRUTH_AMBIGUOUS" as const]),
    ],
    recommendation: ready
      ? "KEEP_EXPORT_PRIORITIZATION"
      : !expressReadVisible || !actionPlanVisible
        ? "RESTORE_EXPORT_PRIORITY"
        : "CONDENSE_EXPORT_MAIN_BODY",
  };
}
