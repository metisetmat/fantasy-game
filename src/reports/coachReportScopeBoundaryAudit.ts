import type { ProductReportScopeDensityWordingCleanupWarningCode } from "./productReportScopeDensityWordingCleanupWarnings";

export type CoachReportSectionLocation = "main_body" | "appendix" | "technical_appendix" | "external_artifact";
export type CoachReportSectionAudience = "coach" | "product_reviewer" | "developer" | "calibration_reviewer";
export type CoachReportSectionSourceType =
  | "official"
  | "diagnostic"
  | "sandbox"
  | "persistence"
  | "database"
  | "calibration"
  | "mixed";

export interface CoachReportSectionScopeClassification {
  readonly sectionId: string;
  readonly title: string;
  readonly currentLocation: CoachReportSectionLocation;
  readonly intendedLocation: CoachReportSectionLocation | "remove";
  readonly sectionAudience: CoachReportSectionAudience;
  readonly sourceType: CoachReportSectionSourceType;
  readonly containsOfficialTruth: boolean;
  readonly containsCoachAction: boolean;
  readonly containsTacticalVisual: boolean;
  readonly containsTechnicalDetails: boolean;
  readonly containsDatabaseDetails: boolean;
  readonly containsPersistenceDetails: boolean;
  readonly containsCalibrationHistory: boolean;
  readonly containsScoringDiagnostics: boolean;
  readonly containsRepeatedWarnings: boolean;
  readonly shouldBeVisibleInProductReport: boolean;
  readonly shouldBeVisibleInExport: boolean;
  readonly shouldBeCollapsed: boolean;
  readonly reason: string;
  readonly warningCodes: readonly ProductReportScopeDensityWordingCleanupWarningCode[];
}

export interface CoachReportScopeBoundaryAudit {
  readonly totalSectionCount: number;
  readonly mainBodySectionCount: number;
  readonly coachMainBodySectionCount: number;
  readonly developerMainBodySectionCount: number;
  readonly persistenceMainBodySectionCount: number;
  readonly databaseMainBodySectionCount: number;
  readonly calibrationMainBodySectionCount: number;
  readonly technicalMainBodySectionCount: number;
  readonly appendixSectionCount: number;
  readonly technicalAppendixSectionCount: number;
  readonly removedOrExternalizedSectionCount: number;
  readonly misplacedSectionCount: number;
  readonly mainBodyCoachOnly: boolean;
  readonly reportScopeClean: boolean;
  readonly exportScopeClean: boolean;
  readonly classifications: readonly CoachReportSectionScopeClassification[];
  readonly scopeBoundaryWarningCodes: readonly ProductReportScopeDensityWordingCleanupWarningCode[];
  readonly recommendation: "KEEP_SCOPE_BOUNDARY" | "MOVE_TECHNICAL_SECTIONS_TO_APPENDIX" | "REMOVE_DEVELOPER_SECTIONS_FROM_COACH_REPORT";
}

const coachSectionIds = new Set([
  "premium-cover",
  "product-cover",
  "cover",
  "express-read",
  "executive-summary",
  "coach-action-plan",
  "tactical-map-cards",
  "multi-match-trend-signals",
  "training-focus-package",
  "next-match-plan",
  "key-coach-signals",
  "profiles-to-observe",
  "players-to-study",
  "next-match-signals",
  "official-match-reading",
  "training-focus",
  "key-statistics",
  "profiles-and-players",
  "next-match-signals",
  "match-story",
  "coach-deep-insights",
  "interpretation-guard",
  "guardrail-summary",
]);

function stripDetails(html: string): string {
  return html.replace(/<details[\s\S]*?<\/details>/giu, "");
}

function mainBody(html: string): string {
  return stripDetails(html)
    .replace(/<section\s+id="appendices"[\s\S]*?(?=<\/main>|$)/giu, "")
    .replace(/<section\s+id="technical-appendices"[\s\S]*?(?=<\/main>|$)/giu, "");
}

function sectionMatches(html: string): readonly RegExpMatchArray[] {
  return [...html.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/giu)]
    .filter((match) => /\bid="/iu.test(match[1] ?? ""));
}

function sectionId(attributes: string): string {
  return attributes.match(/\bid="([^"]+)"/iu)?.[1] ?? "unnamed-section";
}

function sectionTitle(body: string): string {
  return body.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/iu)?.[1]?.replace(/<[^>]+>/gu, "").trim() ?? "Untitled section";
}

function classifySection(match: RegExpMatchArray, inMainBody: boolean): CoachReportSectionScopeClassification {
  const attributes = match[1] ?? "";
  const body = match[2] ?? "";
  const id = sectionId(attributes);
  const title = sectionTitle(body);
  const haystack = `${id} ${title} ${body}`;
  const coachFacing = coachSectionIds.has(id);
  const allowedTrendHistorySection = id === "multi-match-trend-signals";
  const containsDatabaseDetails = /database|sqlite|adapter/iu.test(haystack);
  const containsPersistenceDetails = !allowedTrendHistorySection && /persistent|persistence|history store|match history|historique/iu.test(haystack);
  const containsCalibrationHistory = !coachFacing && /calibration|reconciliation|score economy|scoring family/iu.test(haystack);
  const containsScoringDiagnostics = /scoring|score_change|SHOT_GOAL|TRY_TOUCHDOWN|DROP_GOAL|CONVERSION_GOAL/iu.test(haystack);
  const containsTechnicalDetails = containsDatabaseDetails || containsPersistenceDetails || containsCalibrationHistory || (!coachFacing && /diagnostic|sandbox|validation|guardrail/iu.test(haystack));
  const technical = containsDatabaseDetails || containsPersistenceDetails || containsCalibrationHistory;
  const currentLocation: CoachReportSectionLocation = inMainBody ? "main_body" : containsTechnicalDetails ? "technical_appendix" : "appendix";
  const intendedLocation: CoachReportSectionLocation | "remove" = technical ? "technical_appendix" : coachFacing ? "main_body" : "appendix";
  const warningCodes: ProductReportScopeDensityWordingCleanupWarningCode[] = [
    ...(inMainBody && containsDatabaseDetails ? ["DATABASE_SECTIONS_IN_MAIN_BODY" as const] : []),
    ...(inMainBody && containsPersistenceDetails ? ["PERSISTENCE_SECTIONS_IN_MAIN_BODY" as const] : []),
    ...(inMainBody && containsCalibrationHistory ? ["CALIBRATION_HISTORY_IN_MAIN_BODY" as const] : []),
    ...(inMainBody && technical ? ["DEVELOPER_SECTIONS_IN_MAIN_BODY" as const] : []),
  ];

  return {
    sectionId: id,
    title,
    currentLocation,
    intendedLocation,
    sectionAudience: technical ? "developer" : coachFacing ? "coach" : "product_reviewer",
    sourceType: containsDatabaseDetails ? "database" : containsPersistenceDetails ? "persistence" : containsCalibrationHistory ? "calibration" : containsTechnicalDetails ? "diagnostic" : "official",
    containsOfficialTruth: /score officiel|source officielle|score_change/iu.test(haystack),
    containsCoachAction: /action coach|plan d.action|focus|prochain match/iu.test(haystack),
    containsTacticalVisual: /tactical-map|carte tactique|terrain/iu.test(haystack),
    containsTechnicalDetails,
    containsDatabaseDetails,
    containsPersistenceDetails,
    containsCalibrationHistory,
    containsScoringDiagnostics,
    containsRepeatedWarnings: /(warning|avertissement).{0,80}\1/iu.test(haystack),
    shouldBeVisibleInProductReport: !technical || !inMainBody,
    shouldBeVisibleInExport: !technical || !inMainBody,
    shouldBeCollapsed: containsTechnicalDetails,
    reason: technical ? "Developer/calibration content belongs in collapsed technical appendices." : "Coach-facing section is allowed in the main product report.",
    warningCodes,
  };
}

export function auditCoachReportScopeBoundary(input: {
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachReportScopeBoundaryAudit {
  const productMain = mainBody(input.productReportHtml);
  const exportMain = mainBody(input.exportReportHtml);
  const productMainSections = sectionMatches(productMain).map((match) => classifySection(match, true));
  const exportMainSections = sectionMatches(exportMain).map((match) => classifySection(match, true));
  const appendixSections = [
    ...sectionMatches(input.productReportHtml.replace(productMain, "")).map((match) => classifySection(match, false)),
    ...sectionMatches(input.exportReportHtml.replace(exportMain, "")).map((match) => classifySection(match, false)),
  ];
  const classifications = [...productMainSections, ...exportMainSections, ...appendixSections];
  const mainSections = [...productMainSections, ...exportMainSections];
  const developerMainBodySectionCount = mainSections.filter((section) => section.sectionAudience === "developer").length;
  const persistenceMainBodySectionCount = mainSections.filter((section) => section.containsPersistenceDetails).length;
  const databaseMainBodySectionCount = mainSections.filter((section) => section.containsDatabaseDetails).length;
  const calibrationMainBodySectionCount = mainSections.filter((section) => section.containsCalibrationHistory).length;
  const technicalMainBodySectionCount = mainSections.filter((section) => section.containsTechnicalDetails && section.sectionAudience === "developer").length;
  const misplacedSectionCount = mainSections.filter((section) => section.warningCodes.length > 0).length;
  const mainBodyCoachOnly = developerMainBodySectionCount === 0 &&
    persistenceMainBodySectionCount === 0 &&
    databaseMainBodySectionCount === 0 &&
    calibrationMainBodySectionCount === 0 &&
    technicalMainBodySectionCount === 0;
  const scopeBoundaryWarningCodes: ProductReportScopeDensityWordingCleanupWarningCode[] = [
    ...(mainBodyCoachOnly ? ["MAIN_BODY_COACH_ONLY" as const, "REPORT_SCOPE_CLEAN" as const, "EXPORT_SCOPE_CLEAN" as const] : ["REPORT_SCOPE_TOO_BROAD" as const, "EXPORT_SCOPE_TOO_BROAD" as const]),
    ...(persistenceMainBodySectionCount === 0 ? ["PERSISTENCE_SECTIONS_NOT_IN_MAIN_BODY" as const] : ["PERSISTENCE_SECTIONS_IN_MAIN_BODY" as const]),
    ...(databaseMainBodySectionCount === 0 ? ["DATABASE_SECTIONS_NOT_IN_MAIN_BODY" as const] : ["DATABASE_SECTIONS_IN_MAIN_BODY" as const]),
    ...(calibrationMainBodySectionCount === 0 ? ["CALIBRATION_HISTORY_NOT_IN_MAIN_BODY" as const] : ["CALIBRATION_HISTORY_IN_MAIN_BODY" as const]),
    ...(technicalMainBodySectionCount === 0 ? ["DEVELOPER_SECTIONS_MOVED_TO_APPENDIX" as const] : ["DEVELOPER_SECTIONS_IN_MAIN_BODY" as const]),
  ];

  return {
    totalSectionCount: classifications.length,
    mainBodySectionCount: mainSections.length,
    coachMainBodySectionCount: mainSections.filter((section) => section.sectionAudience === "coach" || section.sectionAudience === "product_reviewer").length,
    developerMainBodySectionCount,
    persistenceMainBodySectionCount,
    databaseMainBodySectionCount,
    calibrationMainBodySectionCount,
    technicalMainBodySectionCount,
    appendixSectionCount: appendixSections.length,
    technicalAppendixSectionCount: appendixSections.filter((section) => section.containsTechnicalDetails).length,
    removedOrExternalizedSectionCount: 0,
    misplacedSectionCount,
    mainBodyCoachOnly,
    reportScopeClean: mainBodyCoachOnly,
    exportScopeClean: mainBodyCoachOnly,
    classifications,
    scopeBoundaryWarningCodes,
    recommendation: mainBodyCoachOnly ? "KEEP_SCOPE_BOUNDARY" : misplacedSectionCount > 0 ? "MOVE_TECHNICAL_SECTIONS_TO_APPENDIX" : "REMOVE_DEVELOPER_SECTIONS_FROM_COACH_REPORT",
  };
}
