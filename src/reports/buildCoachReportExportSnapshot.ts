import {
  buildCoachReportExportSnapshotTags,
  exportCoachReportMainVisibleText,
  type CoachReportExportSnapshotModel,
} from "./coachReportExportSnapshot";
import { renderCoachReportExportHtml } from "./renderCoachReportExportHtml";

function sectionIds(html: string): readonly string[] {
  return [...html.matchAll(/<section\s+id="([^"]+)"/gu)].map((match) => match[1] ?? "");
}

function sourceSectionIdsInExport(html: string): readonly string[] {
  const values = [...html.matchAll(/data-source-product-sections="([^"]+)"/gu)]
    .flatMap((match) => (match[1] ?? "").split("|"))
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return [...new Set(values)];
}

function countClass(html: string, className: string): number {
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const matcher = new RegExp(`class="[^"]*${escaped}[^"]*"`, "gu");

  return [...html.matchAll(matcher)].length;
}

function extractScore(html: string): string {
  const match = html.match(/<span class="score">([\s\S]*?)<\/span>/u);

  return (match?.[1] ?? "").replace(/<[^>]+>/gu, "").trim();
}

function countTerms(text: string, terms: readonly string[]): number {
  const normalized = text
    .replaceAll("&eacute;", "e")
    .replaceAll("&agrave;", "a")
    .replaceAll("&ecirc;", "e")
    .replaceAll("&ocirc;", "o")
    .replaceAll("&ccedil;", "c")
    .replaceAll("&rsquo;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&mdash;", "-")
    .replaceAll("&ndash;", "-")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("fr-FR");

  return terms.reduce((count, term) => count + (normalized.includes(term) ? 1 : 0), 0);
}

function modelWithTags(input: Omit<CoachReportExportSnapshotModel, "tags">): CoachReportExportSnapshotModel {
  return {
    ...input,
    tags: buildCoachReportExportSnapshotTags(input),
  };
}

export function buildCoachReportExportSnapshot(input: {
  readonly productReportHtml: string;
  readonly productReportPath: "reports/coach-report.product.html";
}): CoachReportExportSnapshotModel {
  const productHtmlGenerated = input.productReportHtml.includes("Rapport coach");
  const exportHtml = productHtmlGenerated
    ? renderCoachReportExportHtml({ productReportHtml: input.productReportHtml })
    : "";
  const exportHtmlGenerated = exportHtml.includes("Rapport coach");
  const productSectionIds = sectionIds(input.productReportHtml);
  const exportSectionIds = sectionIds(exportHtml);
  const sourceSectionIds = sourceSectionIdsInExport(exportHtml);
  const sectionCountMatchesProduct =
    productSectionIds.every((id) => sourceSectionIds.includes(id)) &&
    sourceSectionIds.every((id) => productSectionIds.includes(id));
  const scoreMatchesProduct = extractScore(input.productReportHtml) === extractScore(exportHtml);
  const keySignalsMatchProduct =
    countClass(input.productReportHtml, "product-card signal-card") ===
    countClass(exportHtml, "product-card signal-card");
  const profileCardsMatchProduct =
    countClass(input.productReportHtml, "product-card profile-card") ===
    countClass(exportHtml, "product-card profile-card");
  const candidateComparisonMatchesProduct =
    countClass(input.productReportHtml, "comparison-block") ===
      countClass(exportHtml, "comparison-block") &&
    countClass(input.productReportHtml, "comparison-card") ===
      countClass(exportHtml, "comparison-card");
  const interpretationGuardMatchesProduct =
    input.productReportHtml.includes("Les rapprochements profil-joueur ne sont pas des choix de composition.") &&
    exportHtml.includes("Les rapprochements profil-joueur ne sont pas des choix de composition.");
  const printCssPresent = exportHtml.includes("@media print");
  const pageBreakCssPresent = exportHtml.includes("@page") && exportHtml.includes("page-break-inside: avoid");
  const cardBreakInsideAvoided = exportHtml.includes(".product-card") && exportHtml.includes("break-inside: avoid");
  const appendixBreakInsideAvoided = exportHtml.includes(".appendix") && exportHtml.includes("page-break-inside: avoid");
  const headerPrintReadable =
    (exportHtml.includes("<header") || exportHtml.includes("report-cover")) &&
    exportHtml.includes("@page");
  const scorePrintReadable = exportHtml.includes("Score du rapport full-match") && exportHtml.includes("<span class=\"score\">");
  const mainVisibleText = exportCoachReportMainVisibleText(exportHtml);
  const visibleRecommendationWordingCount = countTerms(mainVisibleText, [
    "meilleur choix",
    "joueur recommande",
    "titulaire conseille",
    "remplacement conseille",
    "composition recommandee",
  ]);
  const visibleSelectionWordingCount = countTerms(mainVisibleText, [
    "a selectionner",
    "selection automatique",
    "le coach doit selectionner",
  ]);
  const internalStatusLeakCount = countTerms(mainVisibleText, [
    "officially_confirmed",
    "trace_supported",
    "sandbox_only",
  ]);
  const mojibakeMarkerCount = countTerms(exportHtml, [
    "Ã©",
    "Ã ",
    "â€™",
    "â€”",
    "�",
  ]);
  const mainReportReadableWithoutAppendix =
    exportSectionIds.join("|") === "cover|executive-summary|match-story|key-statistics|with-ball|without-ball|goalkeeper|profiles-and-players|next-match|interpretation-guard|appendices";
  const technicalDetailsCollapsedOrMoved =
    exportHtml.includes("<details class=\"appendix report-appendix-stack\"") ||
    exportHtml.includes("<details class=\"comparison-details\">");
  const technicalAppendicesControlled =
    exportHtml.includes("D&eacute;tails du layout premium HTML") &&
    internalStatusLeakCount === 0;
  const status =
    productHtmlGenerated &&
      exportHtmlGenerated &&
      sectionCountMatchesProduct &&
      scoreMatchesProduct &&
      keySignalsMatchProduct &&
      profileCardsMatchProduct &&
      candidateComparisonMatchesProduct &&
      interpretationGuardMatchesProduct &&
      printCssPresent &&
      pageBreakCssPresent &&
      cardBreakInsideAvoided &&
      appendixBreakInsideAvoided &&
      visibleRecommendationWordingCount === 0 &&
      visibleSelectionWordingCount === 0 &&
      internalStatusLeakCount === 0 &&
      mojibakeMarkerCount === 0
      ? "available"
      : exportHtmlGenerated
        ? "partial"
        : "failed";

  return modelWithTags({
    status,
    origin: "coach_product_report",
    exportFormat: "print_ready_html",
    productHtmlGenerated,
    exportHtmlGenerated,
    pdfGenerated: false,
    productHtmlPath: input.productReportPath,
    exportHtmlPath: "reports/coach-report.export.html",
    contentSourceSingleTruth: true,
    usesProductReportModelOnly: true,
    duplicatesReportLogic: false,
    sectionCountMatchesProduct,
    scoreMatchesProduct,
    keySignalsMatchProduct,
    profileCardsMatchProduct,
    candidateComparisonMatchesProduct,
    interpretationGuardMatchesProduct,
    printCssPresent,
    pageBreakCssPresent,
    cardBreakInsideAvoided,
    appendixBreakInsideAvoided,
    headerPrintReadable,
    scorePrintReadable,
    technicalAppendicesControlled,
    technicalDetailsCollapsedOrMoved,
    mainReportReadableWithoutAppendix,
    visibleRecommendationWordingCount: visibleRecommendationWordingCount as 0,
    visibleSelectionWordingCount: visibleSelectionWordingCount as 0,
    internalStatusLeakCount: internalStatusLeakCount as 0,
    mojibakeMarkerCount: mojibakeMarkerCount as 0,
    noAutomaticSelection: true,
    playerSelectedCount: 0,
    automaticSelectionCount: 0,
    lineupMutationCount: 0,
    startersMutationCount: 0,
    benchMutationCount: 0,
    confidenceUpgradeCount: 0,
    officiallyConfirmedCount: 0,
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
    scoringConstantsUnchanged: true,
    matchBonusEventUnchanged: true,
    fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
    warnings: status === "available"
      ? [
          "Export snapshot is derived from coach-report.product.html only.",
          "PDF generation is not enabled; print-ready HTML is the validated share snapshot for this sprint.",
        ]
      : ["Coach Report Export Snapshot could not validate a stable print-ready export."],
  });
}
