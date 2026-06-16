import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../contracts/matchReportEvidence";

export type CoachReportExportSnapshotStatus =
  | "not_available"
  | "available"
  | "partial"
  | "failed";

export type CoachReportExportFormat =
  | "print_ready_html"
  | "pdf"
  | "both";

export interface CoachReportExportSnapshotModel {
  readonly status: CoachReportExportSnapshotStatus;
  readonly origin: "coach_product_report";
  readonly exportFormat: CoachReportExportFormat;
  readonly productHtmlGenerated: boolean;
  readonly exportHtmlGenerated: boolean;
  readonly pdfGenerated: boolean;
  readonly productHtmlPath: "reports/coach-report.product.html";
  readonly exportHtmlPath?: "reports/coach-report.export.html";
  readonly pdfPath?: "reports/coach-report.product.pdf";
  readonly contentSourceSingleTruth: true;
  readonly usesProductReportModelOnly: true;
  readonly duplicatesReportLogic: false;
  readonly sectionCountMatchesProduct: boolean;
  readonly scoreMatchesProduct: boolean;
  readonly keySignalsMatchProduct: boolean;
  readonly profileCardsMatchProduct: boolean;
  readonly candidateComparisonMatchesProduct: boolean;
  readonly interpretationGuardMatchesProduct: boolean;
  readonly printCssPresent: boolean;
  readonly pageBreakCssPresent: boolean;
  readonly cardBreakInsideAvoided: boolean;
  readonly appendixBreakInsideAvoided: boolean;
  readonly headerPrintReadable: boolean;
  readonly scorePrintReadable: boolean;
  readonly technicalAppendicesControlled: boolean;
  readonly technicalDetailsCollapsedOrMoved: boolean;
  readonly mainReportReadableWithoutAppendix: boolean;
  readonly visibleRecommendationWordingCount: 0;
  readonly visibleSelectionWordingCount: 0;
  readonly internalStatusLeakCount: 0;
  readonly mojibakeMarkerCount: 0;
  readonly noAutomaticSelection: true;
  readonly playerSelectedCount: 0;
  readonly automaticSelectionCount: 0;
  readonly lineupMutationCount: 0;
  readonly startersMutationCount: 0;
  readonly benchMutationCount: 0;
  readonly confidenceUpgradeCount: 0;
  readonly officiallyConfirmedCount: 0;
  readonly canChangeLineup: false;
  readonly canChangeStarters: false;
  readonly canChangeBench: false;
  readonly canDriveCoachInstruction: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canMutateTimeline: false;
  readonly canMutateScore: false;
  readonly canMutatePossession: false;
  readonly canCreateScoringEvent: false;
  readonly canClaimGlobalEconomy: false;
  readonly scoringConstantsUnchanged: true;
  readonly matchBonusEventUnchanged: true;
  readonly fullMatchBatchEconomyRemainsOnlyGlobalProof: true;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
}

const RECOMMENDATION_TERMS = [
  "meilleur choix",
  "joueur recommande",
  "titulaire conseille",
  "remplacement conseille",
  "composition recommandee",
] as const;

const SELECTION_TERMS = [
  "a selectionner",
  "selection automatique",
  "le coach doit selectionner",
] as const;

const INTERNAL_STATUS_TERMS = [
  "officially_confirmed",
  "trace_supported",
  "sandbox_only",
] as const;

const MOJIBAKE_TERMS = [
  "Ã©",
  "Ã ",
  "â€™",
  "â€”",
  "Ã¨",
  "Ã¢",
  "Ãª",
  "Ã´",
  "Ã§",
  "Ã»",
  "�",
] as const;

function normalizeText(value: string): string {
  return value
    .replaceAll("&eacute;", "e")
    .replaceAll("&Eacute;", "e")
    .replaceAll("&agrave;", "a")
    .replaceAll("&Agrave;", "a")
    .replaceAll("&ecirc;", "e")
    .replaceAll("&Ecirc;", "e")
    .replaceAll("&ocirc;", "o")
    .replaceAll("&Ocirc;", "o")
    .replaceAll("&ugrave;", "u")
    .replaceAll("&Ugrave;", "u")
    .replaceAll("&ccedil;", "c")
    .replaceAll("&Ccedil;", "c")
    .replaceAll("&rsquo;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&mdash;", "-")
    .replaceAll("&ndash;", "-")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "and")
    .replaceAll("&quot;", "\"")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("fr-FR");
}

function stripDetailsBlocks(html: string): string {
  let output = "";
  let cursor = 0;

  while (cursor < html.length) {
    const start = html.indexOf("<details", cursor);
    if (start === -1) {
      output += html.slice(cursor);
      break;
    }

    output += html.slice(cursor, start);
    const end = html.indexOf("</details>", start);
    if (end === -1) {
      break;
    }

    cursor = end + "</details>".length;
  }

  return output;
}

function htmlToVisibleText(html: string, stripDetails: boolean): string {
  const source = stripDetails ? stripDetailsBlocks(html) : html;

  return source
    .replace(/<style[\s\S]*?<\/style>/gu, " ")
    .replace(/<script[\s\S]*?<\/script>/gu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

export function exportCoachReportMainVisibleText(html: string): string {
  return htmlToVisibleText(html, true);
}

function countTerms(text: string, terms: readonly string[]): number {
  const normalized = normalizeText(text);

  return terms.reduce((count, term) => count + (normalized.includes(normalizeText(term)) ? 1 : 0), 0);
}

function sectionIds(html: string): readonly string[] {
  return [...html.matchAll(/<section\s+id="([^"]+)"/gu)].map((match) => match[1] ?? "");
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

function boolTag(prefix: string, value: boolean): string {
  return `${prefix}_${value ? "true" : "false"}`;
}

export function buildCoachReportExportSnapshotTags(
  model: Omit<CoachReportExportSnapshotModel, "tags">,
): readonly string[] {
  return [
    "coach_report_export_snapshot",
    `coach_report_export_snapshot_status_${model.status}`,
    `coach_report_export_format_${model.exportFormat}`,
    boolTag("coach_report_export_html_generated", model.exportHtmlGenerated),
    boolTag("coach_report_pdf_generated", model.pdfGenerated),
    "coach_report_export_single_source_of_truth_true",
    "coach_report_export_duplicate_logic_false",
    boolTag("coach_report_export_section_count_matches_product", model.sectionCountMatchesProduct),
    boolTag("coach_report_export_score_matches_product", model.scoreMatchesProduct),
    boolTag("coach_report_export_candidate_comparison_matches_product", model.candidateComparisonMatchesProduct),
    boolTag("coach_report_export_print_css_present", model.printCssPresent),
    boolTag("coach_report_export_page_break_css_present", model.pageBreakCssPresent),
    "coach_report_export_visible_recommendation_wording_count_0",
    "coach_report_export_visible_selection_wording_count_0",
    "coach_report_export_internal_status_leak_count_0",
    "coach_report_export_no_automatic_selection_true",
    "coach_report_export_player_selected_count_0",
    "coach_report_export_lineup_mutation_count_0",
    "coach_report_export_starters_mutation_count_0",
    "coach_report_export_bench_mutation_count_0",
    "coach_report_export_live_selection_driver_count_0",
    "coach_report_export_production_route_resolution_driver_count_0",
    "coach_report_export_score_mutation_count_0",
    "coach_report_export_possession_mutation_count_0",
    "coach_report_export_production_scoring_event_creation_count_0",
    "coach_report_export_global_economy_claim_forbidden",
    "coach_report_export_scoring_constants_unchanged",
  ];
}

export function coachReportExportSnapshotCannotMutateOfficialState(
  model: CoachReportExportSnapshotModel,
): boolean {
  return !model.canMutateTimeline &&
    !model.canMutateScore &&
    !model.canMutatePossession &&
    !model.canCreateScoringEvent;
}

export function coachReportExportSnapshotCannotDriveSelection(
  model: CoachReportExportSnapshotModel,
): boolean {
  return !model.canChangeLineup &&
    !model.canChangeStarters &&
    !model.canChangeBench &&
    !model.canDriveCoachInstruction &&
    !model.canDriveLiveSelection &&
    !model.canDriveProductionRouteResolution &&
    model.playerSelectedCount === 0 &&
    model.automaticSelectionCount === 0;
}

export function coachReportExportSnapshotEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: CoachReportExportSnapshotModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status === "not_available") {
    return null;
  }

  return {
    factId: `${input.report.matchId}-coach-report-export-snapshot`,
    matchId: input.report.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_COACH_REPORT_EXPORT_SNAPSHOT",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: input.report.timeline.slice(0, 3).map((event) => event.eventId),
    affectedZones: [],
    summary:
      `Coach Report Export Snapshot ${input.model.status}: format=${input.model.exportFormat}, ` +
      `productHtml=${String(input.model.productHtmlGenerated)}, exportHtml=${String(input.model.exportHtmlGenerated)}, ` +
      `pdf=${String(input.model.pdfGenerated)}, singleSourceOfTruth=true, duplicateReportLogic=false, ` +
      `sectionMatch=${String(input.model.sectionCountMatchesProduct)}, scoreMatch=${String(input.model.scoreMatchesProduct)}, ` +
      `candidateComparisonMatch=${String(input.model.candidateComparisonMatchesProduct)}, printCss=${String(input.model.printCssPresent)}, ` +
      `pageBreakCss=${String(input.model.pageBreakCssPresent)}, recommendationCount=0, selectionCount=0, internalStatusLeakCount=0, ` +
      "playerSelectedCount=0, lineupMutationCount=0, startersMutationCount=0, benchMutationCount=0, liveSelectionDriverCount=0, productionRouteResolutionDriverCount=0, scoreMutationCount=0, possessionMutationCount=0, productionScoringEventCreationCount=0, globalEconomyClaimCount=0, scoringConstantsUnchanged=true.",
    confidence: "medium",
    strength: 60,
    coachVisible: false,
    internalTags: input.model.tags,
  };
}
