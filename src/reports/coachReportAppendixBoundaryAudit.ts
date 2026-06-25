import type { CoachProductReportViewModel } from "./coachProductReportView";
import type { ProductBaselineCoachReportReadinessWarningCode } from "./productBaselineCoachReportReadinessWarnings";

export type CoachReportAppendixBoundaryRecommendation =
  | "KEEP_APPENDIX_BOUNDARY"
  | "COLLAPSE_MORE_TECHNICAL_DETAIL"
  | "REPAIR_APPENDIX_BOUNDARY";

export interface CoachReportAppendixBoundaryAudit {
  readonly experimentalHypothesesInAppendix: boolean;
  readonly sandboxDecisionPanelCollapsedOrLabeled: boolean;
  readonly technicalTraceabilityCollapsed: boolean;
  readonly rawInternalTagsHiddenOrCollapsed: boolean;
  readonly validationContentNotInProductBody: boolean;
  readonly debugDetailsNotInMainCoachReading: boolean;
  readonly productReadableWithoutAppendices: boolean;
  readonly coachVisibleCardCount: number;
  readonly technicalCardsCollapsedCount: number;
  readonly uncollapsedTechnicalNoiseCount: number;
  readonly appendixBoundaryWarningCodes: readonly ProductBaselineCoachReportReadinessWarningCode[];
  readonly recommendation: CoachReportAppendixBoundaryRecommendation;
}

function sectionBeforeAppendices(html: string): string {
  const marker = "<section id=\"appendices\"";
  const index = html.indexOf(marker);
  return index === -1 ? html : html.slice(0, index);
}

function count(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

export function auditCoachReportAppendixBoundary(input: {
  readonly productReport: CoachProductReportViewModel;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachReportAppendixBoundaryAudit {
  const mainBody = sectionBeforeAppendices(input.productReportHtml);
  const combined = `${input.productReportHtml}\n${input.exportReportHtml}`;
  const technicalCardsCollapsedCount = input.productReport.appendices.filter((appendix) => appendix.defaultCollapsed).length +
    count(combined, /<details class="appendix/gu);
  const uncollapsedTechnicalNoiseCount = count(mainBody, /internalTags|validation\.|Status: PASS|bundle__|debug-full|canMutate|canDrive|sandbox_only/giu);
  const experimentalHypothesesInAppendix = input.productReport.appendices.some((appendix) => appendix.contentKind === "sandbox");
  const sandboxDecisionPanelCollapsedOrLabeled = combined.includes("sandbox non appliqu") || combined.includes("hypoth&egrave;se exp&eacute;rimentale") || experimentalHypothesesInAppendix;
  const technicalTraceabilityCollapsed = input.productReport.appendices.some((appendix) => appendix.contentKind === "traceability" || appendix.contentKind === "technical");
  const rawInternalTagsHiddenOrCollapsed = uncollapsedTechnicalNoiseCount === 0;
  const validationContentNotInProductBody = !/validation\.|Status: PASS|bundle__/u.test(mainBody);
  const debugDetailsNotInMainCoachReading = !/debug-full|internalTags|raw event/iu.test(mainBody);
  const productReadableWithoutAppendices = input.productReport.executiveSummary.length > 0 &&
    input.productReport.keyCoachSignals.length >= 3 &&
    input.productReport.nextMatchSignals.length > 0;
  const appendixBoundaryWarningCodes: ProductBaselineCoachReportReadinessWarningCode[] = [];

  if (!technicalTraceabilityCollapsed || !experimentalHypothesesInAppendix || !rawInternalTagsHiddenOrCollapsed) {
    appendixBoundaryWarningCodes.push("TECHNICAL_DETAILS_NOT_COLLAPSED");
  }
  if (!sandboxDecisionPanelCollapsedOrLabeled) {
    appendixBoundaryWarningCodes.push("SANDBOX_TRUTH_LEAKAGE");
  }

  const pass = appendixBoundaryWarningCodes.length === 0 &&
    validationContentNotInProductBody &&
    debugDetailsNotInMainCoachReading &&
    productReadableWithoutAppendices;

  return {
    experimentalHypothesesInAppendix,
    sandboxDecisionPanelCollapsedOrLabeled,
    technicalTraceabilityCollapsed,
    rawInternalTagsHiddenOrCollapsed,
    validationContentNotInProductBody,
    debugDetailsNotInMainCoachReading,
    productReadableWithoutAppendices,
    coachVisibleCardCount: input.productReport.keyCoachSignals.length + input.productReport.profilesToObserve.length,
    technicalCardsCollapsedCount,
    uncollapsedTechnicalNoiseCount,
    appendixBoundaryWarningCodes: pass ? ["TECHNICAL_APPENDICES_COLLAPSED"] : appendixBoundaryWarningCodes,
    recommendation: pass ? "KEEP_APPENDIX_BOUNDARY" : "COLLAPSE_MORE_TECHNICAL_DETAIL",
  };
}

