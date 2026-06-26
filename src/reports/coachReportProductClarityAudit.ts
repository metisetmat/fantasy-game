import type { CoachProductReportViewModel } from "./coachProductReportView";
import type { ProductBaselineCoachReportReadinessWarningCode } from "./productBaselineCoachReportReadinessWarnings";

export type CoachReportProductClarityRecommendation =
  | "KEEP_PRODUCT_REPORT_HIERARCHY"
  | "REDUCE_TECHNICAL_NOISE"
  | "REPAIR_PRODUCT_CLARITY";

export interface CoachReportProductClarityAudit {
  readonly executiveSummaryVisible: boolean;
  readonly officialMatchReadingVisible: boolean;
  readonly keySignalsVisible: boolean;
  readonly trainingFocusVisible: boolean;
  readonly profilesToObserveVisible: boolean;
  readonly experimentalHypothesesCollapsed: boolean;
  readonly technicalTraceabilityCollapsed: boolean;
  readonly guardrailSummaryVisible: boolean;
  readonly reportTooTechnicalScore: number;
  readonly jargonCount: number;
  readonly forbiddenWordingCount: number;
  readonly duplicateGuardrailCopyCount: number;
  readonly repeatedTechnicalCopyCount: number;
  readonly mobileReadabilityPass: boolean;
  readonly exportReadabilityPass: boolean;
  readonly printReadinessPass: boolean;
  readonly productSectionCount: number;
  readonly appendixSectionCount: number;
  readonly reportReadingTimeEstimate: number;
  readonly mobileReadabilityStatus: "PASS" | "PARTIAL" | "FAIL";
  readonly exportReadabilityStatus: "PASS" | "PARTIAL" | "FAIL";
  readonly printReadinessStatus: "PASS" | "PARTIAL" | "FAIL";
  readonly coachReportProductStatus: "PASS" | "PARTIAL" | "FAIL";
  readonly coachReportExportStatus: "PASS" | "PARTIAL" | "FAIL";
  readonly productClarityWarningCodes: readonly ProductBaselineCoachReportReadinessWarningCode[];
  readonly recommendation: CoachReportProductClarityRecommendation;
}

const forbiddenWording = /score [ée]quilibr[ée] manuellement|score ajust[ée]|but de compensation|essai de compensation|comeback garanti|[ée]quilibre garanti|preuve d[ée]finitive|v[ée]rit[ée] globale depuis ce run|composition recommand[ée]e automatiquement|s[ée]lection impos[ée]e|sandbox appliqu[ée]|diagnostic comme v[ée]rit[ée] officielle|batch score comme score officiel/giu;

function count(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

function words(text: string): number {
  return text.replace(/<[^>]+>/gu, " ").split(/\s+/u).filter(Boolean).length;
}

function sectionBeforeAppendices(html: string): string {
  const index = html.indexOf("<section id=\"appendices\"");
  return index === -1 ? html : html.slice(0, index);
}

export function auditCoachReportProductClarity(input: {
  readonly productReport: CoachProductReportViewModel;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachReportProductClarityAudit {
  const product = input.productReportHtml;
  const mainBody = sectionBeforeAppendices(product);
  const combined = `${input.productReportHtml}\n${input.exportReportHtml}`;
  const executiveSummaryVisible = product.includes("id=\"executive-summary\"");
  const officialMatchReadingVisible = product.includes("id=\"official-match-reading\"");
  const keySignalsVisible = product.includes("id=\"key-coach-signals\"");
  const trainingFocusVisible = product.includes("Point de vigilance") || product.includes("A travailler") || product.includes("&Agrave; travailler");
  const profilesToObserveVisible = product.includes("id=\"profiles-to-observe\"");
  const experimentalHypothesesCollapsed = product.includes("<details") && product.includes("Hypoth");
  const technicalTraceabilityCollapsed = product.includes("<details") && product.includes("trace");
  const guardrailSummaryVisible = combined.includes("sans score forc") && combined.includes("score_change");
  const jargonCount = input.productReport.productVisibleJargonCount + count(mainBody, /internalTags|canDriveLiveSelection|production route|sandbox_only|trace_supported/giu);
  const forbiddenWordingCount = count(combined, forbiddenWording);
  const duplicateGuardrailCopyCount = Math.max(0, count(combined, /sans score forc/giu) - 8);
  const repeatedTechnicalCopyCount = Math.max(0, count(mainBody, /score_change|guardrail|batch|sandbox/giu) - 80);
  const productSectionCount = count(product, /<section id=/gu);
  const appendixSectionCount = count(product, /<details class="appendix"/gu);
  const reportReadingTimeEstimate = Math.max(1, Math.ceil(words(mainBody) / 220));
  const mobileReadabilityPass = product.includes("viewport") && product.includes("@media (max-width");
  const exportReadabilityPass = input.exportReportHtml.includes("rapport export") || input.exportReportHtml.includes("Export partageable");
  const printReadinessPass = input.exportReportHtml.includes("@media print") || product.includes("@media print");
  const reportTooTechnicalScore = jargonCount + repeatedTechnicalCopyCount + (reportReadingTimeEstimate > 26 ? 1 : 0);
  const productClarityWarningCodes: ProductBaselineCoachReportReadinessWarningCode[] = [];

  if (reportTooTechnicalScore > 0) {
    productClarityWarningCodes.push("REPORT_TOO_TECHNICAL");
  }
  if (forbiddenWordingCount > 0) {
    productClarityWarningCodes.push("FORBIDDEN_WORDING_DETECTED");
  }
  if (!technicalTraceabilityCollapsed || !experimentalHypothesesCollapsed) {
    productClarityWarningCodes.push("TECHNICAL_DETAILS_NOT_COLLAPSED");
  }
  const hardFail = forbiddenWordingCount > 0;
  const pass = !hardFail &&
    executiveSummaryVisible &&
    officialMatchReadingVisible &&
    keySignalsVisible &&
    profilesToObserveVisible &&
    guardrailSummaryVisible &&
    mobileReadabilityPass &&
    exportReadabilityPass &&
    printReadinessPass &&
    productClarityWarningCodes.length === 0;

  return {
    executiveSummaryVisible,
    officialMatchReadingVisible,
    keySignalsVisible,
    trainingFocusVisible,
    profilesToObserveVisible,
    experimentalHypothesesCollapsed,
    technicalTraceabilityCollapsed,
    guardrailSummaryVisible,
    reportTooTechnicalScore,
    jargonCount,
    forbiddenWordingCount,
    duplicateGuardrailCopyCount,
    repeatedTechnicalCopyCount,
    mobileReadabilityPass,
    exportReadabilityPass,
    printReadinessPass,
    productSectionCount,
    appendixSectionCount,
    reportReadingTimeEstimate,
    mobileReadabilityStatus: mobileReadabilityPass ? "PASS" : "PARTIAL",
    exportReadabilityStatus: exportReadabilityPass && !hardFail ? "PASS" : "PARTIAL",
    printReadinessStatus: printReadinessPass ? "PASS" : "PARTIAL",
    coachReportProductStatus: pass ? "PASS" : (hardFail ? "FAIL" : "PARTIAL"),
    coachReportExportStatus: exportReadabilityPass && !hardFail ? "PASS" : (hardFail ? "FAIL" : "PARTIAL"),
    productClarityWarningCodes: pass ? ["PRODUCT_REPORT_READY", "COACH_EXPORT_READY", "GUARDRAILS_SUMMARY_VISIBLE"] : productClarityWarningCodes,
    recommendation: pass ? "KEEP_PRODUCT_REPORT_HIERARCHY" : (hardFail ? "REPAIR_PRODUCT_CLARITY" : "REDUCE_TECHNICAL_NOISE"),
  };
}
