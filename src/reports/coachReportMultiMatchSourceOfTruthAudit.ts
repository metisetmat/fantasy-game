import type { CoachReportMultiMatchComparisonTrendSignalsWarningCode } from "./coachReportMultiMatchComparisonTrendSignalsWarnings";

export interface CoachReportMultiMatchSourceOfTruthAudit {
  readonly currentMatchOfficialScoreStillAboveFold: boolean;
  readonly currentMatchSourceOfTruthStillAboveFold: boolean;
  readonly trendsSeparatedFromCurrentMatchTruth: boolean;
  readonly historyNotOfficialScoreTruth: boolean;
  readonly historyNotSelectionTruth: boolean;
  readonly persistenceNotScoringTruth: boolean;
  readonly sqliteNotScoringTruth: boolean;
  readonly databaseNotProductTruthInCoachReport: boolean;
  readonly trendTruthLeakageCount: number;
  readonly unsupportedTruthClaimCount: number;
  readonly batchAsOfficialTrendCount: number;
  readonly sandboxAsOfficialTrendCount: number;
  readonly sourceOfTruthWarningCodes: readonly CoachReportMultiMatchComparisonTrendSignalsWarningCode[];
  readonly recommendation: "KEEP_SOURCE_OF_TRUTH_SEPARATION" | "FIX_MULTI_MATCH_TRUTH_LEAKAGE";
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<head[\s\S]*?<\/head>/giu, " ")
    .replace(/<[^>]+>/gu, " ");
}

function mainBody(html: string): string {
  return html
    .replace(/<head[\s\S]*?<\/head>/giu, "")
    .replace(/<script[\s\S]*?<\/script>/giu, "")
    .replace(/<style[\s\S]*?<\/style>/giu, "")
    .replace(/<details[\s\S]*?<\/details>/giu, "")
    .replace(/<section\s+id="appendices"[\s\S]*?(?=<\/main>|$)/giu, "")
    .replace(/<section\s+id="technical-appendices"[\s\S]*?(?=<\/main>|$)/giu, "");
}

function stripAllowedTrendSection(html: string): string {
  return html.replace(/<section\s+id="multi-match-trend-signals"[\s\S]*?<\/section>/giu, "");
}

function count(text: string, pattern: RegExp): number {
  return (text.match(pattern) ?? []).length;
}

export function auditCoachReportMultiMatchSourceOfTruth(input: {
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachReportMultiMatchSourceOfTruthAudit {
  const productHead = stripTags(input.productReportHtml).slice(0, 2500);
  const mainText = stripTags(`${mainBody(input.productReportHtml)}\n${mainBody(input.exportReportHtml)}`);
  const technicalMainText = stripTags(stripAllowedTrendSection(`${mainBody(input.productReportHtml)}\n${mainBody(input.exportReportHtml)}`));
  const currentMatchOfficialScoreStillAboveFold = /Score officiel|Score du rapport full-match/iu.test(productHead);
  const currentMatchSourceOfTruthStillAboveFold = /score_change|Diagnostics separes|Sandbox non applique/iu.test(productHead);
  const trendsSeparatedFromCurrentMatchTruth = /ne remplacent pas la lecture officielle du match courant|ne remplace pas la lecture officielle du match courant/iu.test(mainText);
  const historyNotOfficialScoreTruth = !/historique.{0,80}(score officiel|source officielle|verite officielle)/iu.test(mainText);
  const historyNotSelectionTruth = !/historique.{0,80}(selection|composition|choix impose|choix officiel)/iu.test(mainText);
  const persistenceNotScoringTruth = !/persistence.{0,80}(scoring truth|score officiel|verite officielle)/iu.test(mainText);
  const sqliteNotScoringTruth = !/sqlite.{0,80}(scoring truth|score officiel|prouve)/iu.test(mainText);
  const databaseNotProductTruthInCoachReport = !/\b(?:database|db)\b.{0,80}(confirme|prouve|verite|score officiel)/iu.test(technicalMainText);
  const trendTruthLeakageCount = count(mainText, /tendance.{0,80}(prouve|garantie|verite|decide)/giu);
  const unsupportedTruthClaimCount = count(mainText, /preuve definitive|verite globale|zone dominante garantie|diagnostic comme verite officielle/giu);
  const batchAsOfficialTrendCount = count(mainText, /batch score officiel|batch.{0,80}verite officielle/giu);
  const sandboxAsOfficialTrendCount = count(mainText, /sandbox applique|sandbox.{0,80}verite officielle/giu);
  const clean = currentMatchOfficialScoreStillAboveFold &&
    currentMatchSourceOfTruthStillAboveFold &&
    trendsSeparatedFromCurrentMatchTruth &&
    historyNotOfficialScoreTruth &&
    historyNotSelectionTruth &&
    persistenceNotScoringTruth &&
    sqliteNotScoringTruth &&
    databaseNotProductTruthInCoachReport &&
    trendTruthLeakageCount === 0 &&
    unsupportedTruthClaimCount === 0 &&
    batchAsOfficialTrendCount === 0 &&
    sandboxAsOfficialTrendCount === 0;

  return {
    currentMatchOfficialScoreStillAboveFold,
    currentMatchSourceOfTruthStillAboveFold,
    trendsSeparatedFromCurrentMatchTruth,
    historyNotOfficialScoreTruth,
    historyNotSelectionTruth,
    persistenceNotScoringTruth,
    sqliteNotScoringTruth,
    databaseNotProductTruthInCoachReport,
    trendTruthLeakageCount,
    unsupportedTruthClaimCount,
    batchAsOfficialTrendCount,
    sandboxAsOfficialTrendCount,
    sourceOfTruthWarningCodes: [
      ...(clean ? ["SOURCE_OF_TRUTH_PRESERVED" as const] : ["SOURCE_OF_TRUTH_AMBIGUOUS" as const]),
      ...(historyNotOfficialScoreTruth ? [] : ["HISTORY_USED_AS_OFFICIAL_TRUTH" as const]),
      ...(historyNotSelectionTruth ? [] : ["HISTORY_USED_AS_SELECTION_TRUTH" as const]),
      ...(sandboxAsOfficialTrendCount === 0 ? [] : ["SANDBOX_TRUTH_LEAKAGE" as const]),
      ...(batchAsOfficialTrendCount === 0 ? [] : ["BATCH_SCORE_LEAKAGE" as const]),
      ...(unsupportedTruthClaimCount === 0 && trendTruthLeakageCount === 0 ? [] : ["FORBIDDEN_WORDING_DETECTED" as const]),
    ],
    recommendation: clean ? "KEEP_SOURCE_OF_TRUTH_SEPARATION" : "FIX_MULTI_MATCH_TRUTH_LEAKAGE",
  };
}
