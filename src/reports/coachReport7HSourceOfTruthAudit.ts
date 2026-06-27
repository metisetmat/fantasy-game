import {
  extractSection,
  visibleText,
} from "./coachReportHtmlAuditUtils";
import type { CoachReportExportLengthTrendCountCleanupWarningCode } from "./coachReportExportLengthTrendCountCleanupWarnings";

export interface CoachReport7HSourceOfTruthAudit {
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
  readonly sourceOfTruthWarningCodes: readonly CoachReportExportLengthTrendCountCleanupWarningCode[];
  readonly recommendation: "KEEP_SOURCE_OF_TRUTH_BOUNDARY" | "FIX_SOURCE_OF_TRUTH_BOUNDARY";
}

function countMatches(text: string, pattern: RegExp): number {
  return (text.match(pattern) ?? []).length;
}

export function auditCoachReport7HSourceOfTruth(input: {
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachReport7HSourceOfTruthAudit {
  const body = input.productReportHtml;
  const exportBody = input.exportReportHtml.replace(/<details[\s\S]*?<\/details>/giu, "");
  const aboveFold = `${extractSection(body, "premium-cover")}\n${extractSection(body, "express-read")}\n${body.slice(0, 2500)}`;
  const trendSection = `${extractSection(body, "multi-match-trend-signals")}\n${extractSection(exportBody, "multi-match-trend-signals")}`;
  const trendText = visibleText(trendSection).toLocaleLowerCase("fr-FR");
  const allText = visibleText(`${body}\n${exportBody}`).toLocaleLowerCase("fr-FR");
  const aboveFoldText = visibleText(aboveFold).toLocaleLowerCase("fr-FR");
  const currentMatchOfficialScoreStillAboveFold = /score|final/u.test(aboveFoldText) && /officiel|score_change|source du score/u.test(aboveFoldText);
  const currentMatchSourceOfTruthStillAboveFold = /source de verite|source du score|lecture officielle|score officiel|score_change/u.test(aboveFoldText);
  const trendsSeparatedFromCurrentMatchTruth = /ne remplace pas|match courant uniquement|sans effet sur score|observation seulement/u.test(trendText);
  const historyNotOfficialScoreTruth = !/historique d.cide|historique.{0,80}score officiel|historique.{0,80}v.rit/u.test(allText);
  const historyNotSelectionTruth = !/historique.{0,80}s.lection|historique.{0,80}composition recommand.e/u.test(allText);
  const persistenceNotScoringTruth = !/persistence.*scoring truth|persistence.*score officiel/u.test(allText);
  const sqliteNotScoringTruth = !/sqlite.*scoring truth|sqlite prouve|sqlite.*score officiel/u.test(allText);
  const databaseNotProductTruthInCoachReport = !/db confirme|database.*v.rit. produit|database.*official truth/u.test(allText);
  const trendTruthLeakageCount = countMatches(trendText, /preuve d.finitive|v.rit. globale|tendance garantie|score officiel depuis tendance/giu);
  const unsupportedTruthClaimCount = countMatches(allText, /batch score officiel|sandbox appliqu.|diagnostic comme v.rit. officielle/giu);
  const batchAsOfficialTrendCount = countMatches(trendText, /batch.*officiel|batch.*v.rit/giu);
  const sandboxAsOfficialTrendCount = countMatches(trendText, /sandbox.*officiel|sandbox.*v.rit/giu);
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
      ...(historyNotOfficialScoreTruth && historyNotSelectionTruth ? [] : ["HISTORY_USED_AS_OFFICIAL_TRUTH" as const]),
      ...(sandboxAsOfficialTrendCount === 0 ? [] : ["SANDBOX_TRUTH_LEAKAGE" as const]),
      ...(batchAsOfficialTrendCount === 0 ? [] : ["BATCH_SCORE_LEAKAGE" as const]),
      ...(unsupportedTruthClaimCount === 0 ? [] : ["DIAGNOSTIC_SCORE_LEAKAGE" as const]),
    ],
    recommendation: clean ? "KEEP_SOURCE_OF_TRUTH_BOUNDARY" : "FIX_SOURCE_OF_TRUTH_BOUNDARY",
  };
}
