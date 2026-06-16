import type { CoachReportExportSnapshotModel } from "./coachReportExportSnapshot";
import {
  buildCoachReportPremiumLayoutTags,
  type CoachReportPremiumLayoutModel,
  type CoachReportPremiumSection,
  type CoachReportPremiumSectionKind,
} from "./coachReportPremiumLayout";

const CONTROLLED_EMPTY_STATE = "Donn&eacute;es insuffisantes dans ce run pour stabiliser cette lecture.";

const RECOMMENDATION_TERMS = [
  "meilleur choix",
  "joueur recommande",
  "recommande",
  "titulaire conseille",
  "remplacement conseille",
  "composition recommandee",
  "selection automatique",
] as const;

const SELECTION_TERMS = [
  "a selectionner",
  "joueur selectionne",
  "player selected",
  "selection automatique",
] as const;

const INTERNAL_STATUS_TERMS = [
  "officially_confirmed",
  "trace_supported",
  "sandbox_only",
] as const;

const MOJIBAKE_TERMS = [
  "ÃƒÂ©",
  "Ãƒ ",
  "Ã¢â‚¬â„¢",
  "Ã¢â‚¬â€",
  "ÃƒÂ¨",
  "ÃƒÂ¢",
  "ÃƒÂª",
  "ÃƒÂ´",
  "ÃƒÂ§",
  "ÃƒÂ»",
  "ï¿½",
  "â€”",
  "â†’",
  "clÃ©s",
  "DonnÃ©es",
  "vÃ©ritÃ©",
] as const;

const PREMIUM_SECTION_ORDER: readonly { id: string; kind: CoachReportPremiumSectionKind; title: string }[] = [
  { id: "cover", kind: "cover", title: "Couverture" },
  { id: "executive-summary", kind: "executive_summary", title: "R&eacute;sum&eacute; coach" },
  { id: "match-story", kind: "match_story", title: "Ce que le match dit" },
  { id: "key-statistics", kind: "key_statistics", title: "3 signaux cl&eacute;s" },
  { id: "with-ball", kind: "with_ball", title: "Avec ballon" },
  { id: "without-ball", kind: "without_ball", title: "Sans ballon" },
  { id: "goalkeeper", kind: "goalkeeper", title: "Dernier rempart" },
  { id: "profiles-and-players", kind: "profiles_and_players", title: "Profils et joueurs &agrave; &eacute;tudier" },
  { id: "next-match", kind: "next_match", title: "&Agrave; v&eacute;rifier au prochain match" },
  { id: "interpretation-guard", kind: "interpretation_guard", title: "&Agrave; ne pas sur-interpr&eacute;ter" },
  { id: "appendices", kind: "appendices", title: "Annexes" },
] as const;

function countClass(html: string, className: string): number {
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const matcher = new RegExp(`class="[^"]*${escaped}[^"]*"`, "gu");

  return [...html.matchAll(matcher)].length;
}

function extractSection(html: string, id: string): string {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const startMatch = new RegExp(`<section\\s+id="${escaped}"[^>]*>`, "u").exec(html);

  if (startMatch === null || startMatch.index === undefined) {
    return "";
  }

  let depth = 1;
  let cursor = startMatch.index + startMatch[0].length;

  while (cursor < html.length && depth > 0) {
    const nextOpen = html.indexOf("<section", cursor);
    const nextClose = html.indexOf("</section>", cursor);

    if (nextClose === -1) {
      return "";
    }

    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth += 1;
      cursor = nextOpen + "<section".length;
      continue;
    }

    depth -= 1;
    cursor = nextClose + "</section>".length;
  }

  return html.slice(startMatch.index, cursor);
}

function htmlToVisibleText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gu, " ")
    .replace(/<script[\s\S]*?<\/script>/gu, " ")
    .replace(/<details[\s\S]*?<\/details>/gu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

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
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("fr-FR");
}

function countTerms(text: string, terms: readonly string[]): number {
  const normalized = normalizeText(text);

  return terms.reduce(
    (count, term) => count + (normalized.includes(normalizeText(term)) ? 1 : 0),
    0,
  );
}

function countOccurrences(haystack: string, needle: string): number {
  if (needle.length === 0) {
    return 0;
  }

  let count = 0;
  let cursor = 0;

  while (cursor < haystack.length) {
    const next = haystack.indexOf(needle, cursor);
    if (next === -1) {
      break;
    }
    count += 1;
    cursor = next + needle.length;
  }

  return count;
}

function buildSection(html: string, id: string, kind: CoachReportPremiumSectionKind, title: string): CoachReportPremiumSection {
  const sectionHtml = extractSection(html, id);
  const emptyStateUsed = sectionHtml.includes(CONTROLLED_EMPTY_STATE);
  const cardCount =
    countClass(sectionHtml, "product-card") +
    countClass(sectionHtml, "report-kpi-card") +
    countClass(sectionHtml, "report-table-card");
  const visualBlockCount =
    countClass(sectionHtml, "report-pitch-panel") +
    countClass(sectionHtml, "report-pitch-placeholder");
  const tableCount =
    countClass(sectionHtml, "report-table-card") +
    countClass(sectionHtml, "comparison-block") +
    countClass(sectionHtml, "matchup-block");

  return {
    kind,
    title,
    available: sectionHtml.length > 0,
    source: emptyStateUsed ? "controlled_empty_state" : "product_report",
    cardCount,
    visualBlockCount,
    tableCount,
    emptyStateUsed,
  };
}

function modelWithTags(
  input: Omit<CoachReportPremiumLayoutModel, "tags">,
): CoachReportPremiumLayoutModel {
  return {
    ...input,
    tags: buildCoachReportPremiumLayoutTags(input),
  };
}

export function buildCoachReportPremiumLayout(input: {
  readonly exportSnapshot: CoachReportExportSnapshotModel;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachReportPremiumLayoutModel {
  if (input.exportSnapshot.status === "not_available") {
    return modelWithTags({
      status: "not_available",
      origin: "coach_report_export_snapshot",
      exportHtmlPath: "reports/coach-report.export.html",
      productHtmlPath: "reports/coach-report.product.html",
      htmlFirst: true,
      pdfOptional: true,
      singleSourceOfTruth: true,
      duplicateReportLogic: false,
      sectionCount: 0,
      sections: [],
      coverPresent: false,
      executiveSummaryPresent: false,
      matchStoryPresent: false,
      keyStatisticsPresent: false,
      withBallSectionPresent: false,
      withoutBallSectionPresent: false,
      goalkeeperSectionPresent: false,
      profilesAndPlayersSectionPresent: false,
      nextMatchSectionPresent: false,
      interpretationGuardPresent: false,
      appendicesPresent: false,
      premiumHeaderPresent: false,
      sectionDividerCount: 0,
      kpiCardCount: 0,
      pitchVisualPlaceholderCount: 0,
      controlledEmptyStateCount: 0,
      appendixCollapsedByDefault: false,
      productExportScoreMatches: true,
      productExportCandidateComparisonMatches: true,
      interpretationGuardMatchesProduct: true,
      visibleRecommendationWordingCount: 0,
      visibleSelectionWordingCount: 0,
      internalStatusLeakCount: 0,
      mojibakeMarkerCount: 0,
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
      warnings: ["Coach Report Premium HTML Layout cannot run before the export snapshot exists."],
    });
  }

  const sectionModels = PREMIUM_SECTION_ORDER.map((section) =>
    buildSection(input.exportReportHtml, section.id, section.kind, section.title)
  );
  const sectionIdSet = new Set(
    [...input.exportReportHtml.matchAll(/<section\s+id="([^"]+)"/gu)].map((match) => match[1] ?? ""),
  );
  const coverPresent = sectionIdSet.has("cover") && input.exportReportHtml.includes("report-cover");
  const executiveSummaryPresent = sectionIdSet.has("executive-summary");
  const matchStoryPresent = sectionIdSet.has("match-story");
  const keyStatisticsPresent = sectionIdSet.has("key-statistics");
  const withBallSectionPresent = sectionIdSet.has("with-ball");
  const withoutBallSectionPresent = sectionIdSet.has("without-ball");
  const goalkeeperSectionPresent = sectionIdSet.has("goalkeeper");
  const profilesAndPlayersSectionPresent = sectionIdSet.has("profiles-and-players");
  const nextMatchSectionPresent = sectionIdSet.has("next-match");
  const interpretationGuardPresent = sectionIdSet.has("interpretation-guard");
  const appendicesPresent = sectionIdSet.has("appendices");
  const mainVisibleText = htmlToVisibleText(input.exportReportHtml);
  const visibleRecommendationWordingCount = countTerms(mainVisibleText, RECOMMENDATION_TERMS);
  const visibleSelectionWordingCount = countTerms(mainVisibleText, SELECTION_TERMS);
  const internalStatusLeakCount = countTerms(mainVisibleText, INTERNAL_STATUS_TERMS);
  const mojibakeMarkerCount = countTerms(input.exportReportHtml, MOJIBAKE_TERMS);
  const kpiCardCount = countClass(input.exportReportHtml, "report-kpi-card");
  const pitchVisualPlaceholderCount = countClass(input.exportReportHtml, "report-pitch-placeholder");
  const controlledEmptyStateCount = countOccurrences(input.exportReportHtml, CONTROLLED_EMPTY_STATE);
  const premiumHeaderPresent =
    input.exportReportHtml.includes("report-cover") &&
    input.exportReportHtml.includes("report-scoreboard") &&
    input.exportReportHtml.includes("report-meta-strip");
  const sectionDividerCount = countClass(input.exportReportHtml, "report-section-divider");
  const appendixCollapsedByDefault =
    input.exportReportHtml.includes("<details class=\"appendix report-appendix-stack\"") &&
    !input.exportReportHtml.includes("<details class=\"appendix report-appendix-stack\" open");
  const allRequiredSectionsPresent =
    coverPresent &&
    executiveSummaryPresent &&
    matchStoryPresent &&
    keyStatisticsPresent &&
    withBallSectionPresent &&
    withoutBallSectionPresent &&
    goalkeeperSectionPresent &&
    profilesAndPlayersSectionPresent &&
    nextMatchSectionPresent &&
    interpretationGuardPresent &&
    appendicesPresent;
  const status: CoachReportPremiumLayoutModel["status"] =
    input.exportSnapshot.exportHtmlGenerated &&
      allRequiredSectionsPresent &&
      premiumHeaderPresent &&
      kpiCardCount >= 3 &&
      sectionDividerCount >= 8 &&
      input.exportSnapshot.scoreMatchesProduct &&
      input.exportSnapshot.candidateComparisonMatchesProduct &&
      input.exportSnapshot.interpretationGuardMatchesProduct &&
      visibleRecommendationWordingCount === 0 &&
      visibleSelectionWordingCount === 0 &&
      internalStatusLeakCount === 0 &&
      mojibakeMarkerCount === 0
      ? "available"
      : input.exportSnapshot.exportHtmlGenerated
        ? "partial"
        : "failed";

  return modelWithTags({
    status,
    origin: "coach_report_export_snapshot",
    exportHtmlPath: "reports/coach-report.export.html",
    productHtmlPath: "reports/coach-report.product.html",
    htmlFirst: true,
    pdfOptional: true,
    singleSourceOfTruth: true,
    duplicateReportLogic: false,
    sectionCount: sectionModels.filter((section) => section.available).length,
    sections: sectionModels,
    coverPresent,
    executiveSummaryPresent,
    matchStoryPresent,
    keyStatisticsPresent,
    withBallSectionPresent,
    withoutBallSectionPresent,
    goalkeeperSectionPresent,
    profilesAndPlayersSectionPresent,
    nextMatchSectionPresent,
    interpretationGuardPresent,
    appendicesPresent,
    premiumHeaderPresent,
    sectionDividerCount,
    kpiCardCount,
    pitchVisualPlaceholderCount,
    controlledEmptyStateCount,
    appendixCollapsedByDefault,
    productExportScoreMatches: true,
    productExportCandidateComparisonMatches: true,
    interpretationGuardMatchesProduct: true,
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
          "Premium export remains derived from coach-report.product.html.",
          "Controlled empty states mark sections where the current run does not stabilize a richer phase reading.",
        ]
      : ["Coach Report Premium HTML Layout needs more stabilization before it can be treated as fully available."],
  });
}
