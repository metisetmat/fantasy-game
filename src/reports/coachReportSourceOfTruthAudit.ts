import type { CoachProductReportViewModel } from "./coachProductReportView";
import type { ProductBaselineCoachReportReadinessWarningCode } from "./productBaselineCoachReportReadinessWarnings";

export type CoachReportSourceOfTruthRecommendation =
  | "KEEP_SOURCE_OF_TRUTH_BOUNDARY"
  | "CLARIFY_OFFICIAL_SCORE_SOURCE"
  | "REPAIR_SOURCE_OF_TRUTH_BOUNDARY";

export interface CoachReportSourceOfTruthAudit {
  readonly officialScoreVisible: boolean;
  readonly officialScoreSourceExplained: boolean;
  readonly scoreChangeSourceVisible: boolean;
  readonly batchDiagnosticsSeparated: boolean;
  readonly liveScoringSampleSeparated: boolean;
  readonly sandboxSeparated: boolean;
  readonly sandboxCannotDriveLiveSelection: boolean;
  readonly sandboxCannotMutateOfficialState: boolean;
  readonly selectionPreviewNonApplied: boolean;
  readonly diagnosticsDoNotReplaceOfficialTruth: boolean;
  readonly noUnsupportedGlobalEconomyClaim: boolean;
  readonly noSingleRunOverclaim: boolean;
  readonly sourceBadgeCoverageRate: number;
  readonly evidenceLinkCoverageRate: number;
  readonly lowConfidenceSignalLabeledCount: number;
  readonly missingConfidenceLabelCount: number;
  readonly officialTruthClaimsCount: number;
  readonly diagnosticTruthClaimsCount: number;
  readonly sandboxTruthClaimsCount: number;
  readonly unsupportedTruthClaimCount: number;
  readonly officialCardsCount: number;
  readonly diagnosticCardsCount: number;
  readonly sandboxCardsCount: number;
  readonly sourceOfTruthWarningCodes: readonly ProductBaselineCoachReportReadinessWarningCode[];
  readonly recommendation: CoachReportSourceOfTruthRecommendation;
}

function includesAny(text: string, values: readonly string[]): boolean {
  const normalized = text.toLocaleLowerCase("fr-FR");
  return values.some((value) => normalized.includes(value.toLocaleLowerCase("fr-FR")));
}

function countOccurrences(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

export function auditCoachReportSourceOfTruth(input: {
  readonly productReport: CoachProductReportViewModel;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachReportSourceOfTruthAudit {
  const combined = `${input.productReportHtml}\n${input.exportReportHtml}`;
  const officialScoreVisible = input.productReport.scoreLabel.length > 0 && combined.includes(input.productReport.scoreLabel);
  const officialScoreSourceExplained = includesAny(combined, [
    "source officielle du score",
    "score issu des evenements officiels",
    "score issu des &eacute;v&eacute;nements officiels",
    "score_change",
  ]);
  const scoreChangeSourceVisible = combined.includes("score_change");
  const batchDiagnosticsSeparated = includesAny(combined, ["diagnostics batch", "batch diagnostics"]);
  const liveScoringSampleSeparated = includesAny(combined, ["echantillons live", "&eacute;chantillons live", "live scoring sample"]);
  const sandboxSeparated = includesAny(combined, ["sandbox non applique", "sandbox non appliqu", "hypothese experimentale", "hypoth&egrave;se exp&eacute;rimentale"]);
  const selectionPreviewNonApplied = input.productReport.profilesToObserve.length > 0 &&
    input.productReport.profileAppliedCount === 0 &&
    input.productReport.officiallyConfirmedCount === 0 &&
    input.productReport.confidenceUpgradeCount === 0;
  const unsupportedTruthClaimCount = countOccurrences(combined, /v[eé]rit[eé] globale depuis ce run|diagnostic comme v[eé]rit[eé] officielle|batch score comme score officiel/giu);
  const officialCardsCount = input.productReport.keyCoachSignals.filter((signal) => signal.sourceLabel === "Officiel").length;
  const diagnosticCardsCount = countOccurrences(combined, /diagnostic s[eé]par[eé]|diagnostics batch/giu);
  const sandboxCardsCount = countOccurrences(combined, /sandbox non appliqu|hypoth[eè]se exp[eé]rimentale/giu);
  const sourceBadgeCoverageRate = input.productReport.keyCoachSignals.length === 0
    ? 0
    : Math.round((officialCardsCount / input.productReport.keyCoachSignals.length) * 1000) / 10;
  const evidenceLinkCoverageRate = input.productReport.keyCoachSignals.length === 0
    ? 0
    : Math.round((input.productReport.keyCoachSignals.filter((signal) => signal.evidenceSummary.length > 0).length / input.productReport.keyCoachSignals.length) * 1000) / 10;
  const lowConfidenceSignalLabeledCount = input.productReport.keyCoachSignals.filter((signal) => signal.confidenceLabel === "faible").length;
  const missingConfidenceLabelCount = input.productReport.keyCoachSignals.filter((signal) => signal.confidenceLabel.length === 0).length;
  const sourceOfTruthWarningCodes: ProductBaselineCoachReportReadinessWarningCode[] = [];

  if (!officialScoreVisible || !officialScoreSourceExplained || !scoreChangeSourceVisible) {
    sourceOfTruthWarningCodes.push("SOURCE_OF_TRUTH_AMBIGUOUS");
  }
  if (!sandboxSeparated || !input.productReport.sandboxAggregatesKeptSeparate) {
    sourceOfTruthWarningCodes.push("SANDBOX_TRUTH_LEAKAGE");
  }
  if (!input.productReport.diagnosticAggregatesKeptSeparate) {
    sourceOfTruthWarningCodes.push("DIAGNOSTIC_SCORE_LEAKAGE");
  }
  if (!input.productReport.fullMatchBatchEconomyRemainsOnlyGlobalProof || unsupportedTruthClaimCount > 0) {
    sourceOfTruthWarningCodes.push("BATCH_SCORE_LEAKAGE");
  }
  if (!selectionPreviewNonApplied || !input.productReport.canDriveLiveSelection) {
    if (input.productReport.canDriveLiveSelection || input.productReport.profileAppliedCount > 0) {
      sourceOfTruthWarningCodes.push("FORCED_SELECTION_FROM_PREVIEW");
    }
  }
  if (missingConfidenceLabelCount > 0) {
    sourceOfTruthWarningCodes.push("LOW_CONFIDENCE_LABEL_MISSING");
  }

  const pass = sourceOfTruthWarningCodes.length === 0 &&
    batchDiagnosticsSeparated &&
    liveScoringSampleSeparated &&
    sandboxSeparated &&
    selectionPreviewNonApplied;

  return {
    officialScoreVisible,
    officialScoreSourceExplained,
    scoreChangeSourceVisible,
    batchDiagnosticsSeparated,
    liveScoringSampleSeparated,
    sandboxSeparated,
    sandboxCannotDriveLiveSelection: !input.productReport.canDriveLiveSelection,
    sandboxCannotMutateOfficialState: !input.productReport.canMutateTimeline && !input.productReport.canMutateScore && !input.productReport.canMutatePossession && !input.productReport.canCreateScoringEvent,
    selectionPreviewNonApplied,
    diagnosticsDoNotReplaceOfficialTruth: input.productReport.diagnosticAggregatesKeptSeparate,
    noUnsupportedGlobalEconomyClaim: unsupportedTruthClaimCount === 0,
    noSingleRunOverclaim: !includesAny(combined, ["preuve definitive", "preuve d&eacute;finitive", "verite globale depuis ce run", "v&eacute;rit&eacute; globale depuis ce run"]),
    sourceBadgeCoverageRate,
    evidenceLinkCoverageRate,
    lowConfidenceSignalLabeledCount,
    missingConfidenceLabelCount,
    officialTruthClaimsCount: officialScoreSourceExplained ? 1 : 0,
    diagnosticTruthClaimsCount: diagnosticCardsCount,
    sandboxTruthClaimsCount: sandboxCardsCount,
    unsupportedTruthClaimCount,
    officialCardsCount,
    diagnosticCardsCount,
    sandboxCardsCount,
    sourceOfTruthWarningCodes: pass ? ["OFFICIAL_DIAGNOSTIC_SANDBOX_SEPARATION_CLEAR", "OFFICIAL_SCORE_SOURCE_CLEAR"] : sourceOfTruthWarningCodes,
    recommendation: pass ? "KEEP_SOURCE_OF_TRUTH_BOUNDARY" : "REPAIR_SOURCE_OF_TRUTH_BOUNDARY",
  };
}
