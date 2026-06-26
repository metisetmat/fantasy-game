import type { ProductReportScopeDensityWordingCleanupWarningCode } from "./productReportScopeDensityWordingCleanupWarnings";

export interface CoachReportSourceOfTruthScopeCleanupAudit {
  readonly officialScoreStillAboveFold: boolean;
  readonly sourceOfTruthStillAboveFold: boolean;
  readonly batchLiveSeparationStillVisible: boolean;
  readonly sandboxStillNonApplied: boolean;
  readonly persistenceNotScoringTruth: boolean;
  readonly sqliteNotScoringTruth: boolean;
  readonly databaseNotProductTruthInCoachReport: boolean;
  readonly calibrationNotOfficialScore: boolean;
  readonly scoreMutationClaimCount: number;
  readonly unsupportedTruthClaimCount: number;
  readonly sourceOfTruthScopeWarningCodes: readonly ProductReportScopeDensityWordingCleanupWarningCode[];
  readonly recommendation: "KEEP_SOURCE_OF_TRUTH_SCOPE" | "FIX_SOURCE_OF_TRUTH_COPY" | "MOVE_TECHNICAL_TRUTH_CLAIMS";
}

function visibleText(html: string): string {
  const bodyStart = html.search(/<body\b/iu);
  const body = bodyStart >= 0 ? html.slice(bodyStart) : html;

  return body
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/&eacute;/giu, "e")
    .replace(/&egrave;/giu, "e")
    .replace(/&agrave;/giu, "a")
    .replace(/&ecirc;/giu, "e")
    .replace(/&ocirc;/giu, "o")
    .replace(/&ccedil;/giu, "c")
    .replace(/&nbsp;/giu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function firstSlice(html: string): string {
  const text = visibleText(html);

  return text.slice(0, Math.max(12000, Math.floor(text.length / 5)));
}

function mainBody(html: string): string {
  return html
    .replace(/<details[\s\S]*?<\/details>/giu, "")
    .replace(/<section\s+id="appendices"[\s\S]*?(?=<\/main>|$)/giu, "");
}

function count(text: string, pattern: RegExp): number {
  return (text.match(pattern) ?? []).length;
}

export function auditCoachReportSourceOfTruthScopeCleanup(input: {
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachReportSourceOfTruthScopeCleanupAudit {
  const combinedMain = mainBody(`${input.productReportHtml}\n${input.exportReportHtml}`);
  const aboveFold = firstSlice(input.exportReportHtml);
  const officialScoreStillAboveFold = /Score du rapport full-match|Score officiel|score officiel|source du score|score_change/iu.test(aboveFold);
  const sourceOfTruthStillAboveFold = /source de v[ée]rit[ée]|source de verite|source du score|score_change/iu.test(aboveFold);
  const batchLiveSeparationStillVisible = /Diagnostics batch|batch.*s[ée]par[ée]|live.*s[ée]par[ée]/iu.test(input.exportReportHtml);
  const sandboxStillNonApplied = /sandbox non appliqu/iu.test(input.exportReportHtml);
  const persistenceNotScoringTruth = !/persistence.*source officielle du score|historique.*source officielle du score/iu.test(combinedMain);
  const sqliteNotScoringTruth = !/sqlite.*source officielle du score|sqlite.*scoring truth/iu.test(combinedMain);
  const databaseNotProductTruthInCoachReport = !/database.*source officielle|database.*v[ée]rit[ée] produit/iu.test(combinedMain);
  const calibrationNotOfficialScore = !/calibration.*score officiel|score officiel.*calibration/iu.test(combinedMain);
  const scoreMutationClaimCount = count(combinedMain, /score ajust[ée]|score [ée]quilibr[ée] manuellement|score forc[ée]/giu);
  const unsupportedTruthClaimCount = count(combinedMain, /preuve d[ée]finitive|v[ée]rit[ée] globale|diagnostic comme v[ée]rit[ée] officielle|batch score comme score officiel/giu);
  const clean = officialScoreStillAboveFold &&
    sourceOfTruthStillAboveFold &&
    batchLiveSeparationStillVisible &&
    sandboxStillNonApplied &&
    persistenceNotScoringTruth &&
    sqliteNotScoringTruth &&
    databaseNotProductTruthInCoachReport &&
    calibrationNotOfficialScore &&
    scoreMutationClaimCount === 0 &&
    unsupportedTruthClaimCount === 0;

  return {
    officialScoreStillAboveFold,
    sourceOfTruthStillAboveFold,
    batchLiveSeparationStillVisible,
    sandboxStillNonApplied,
    persistenceNotScoringTruth,
    sqliteNotScoringTruth,
    databaseNotProductTruthInCoachReport,
    calibrationNotOfficialScore,
    scoreMutationClaimCount,
    unsupportedTruthClaimCount,
    sourceOfTruthScopeWarningCodes: [
      ...(clean ? ["SOURCE_OF_TRUTH_PRESERVED" as const] : ["SOURCE_OF_TRUTH_AMBIGUOUS" as const]),
      ...(sandboxStillNonApplied ? [] : ["SANDBOX_TRUTH_LEAKAGE" as const]),
      ...(batchLiveSeparationStillVisible ? [] : ["BATCH_SCORE_LEAKAGE" as const]),
      ...(scoreMutationClaimCount === 0 ? [] : ["SCORE_MANIPULATION_DETECTED" as const]),
    ],
    recommendation: clean ? "KEEP_SOURCE_OF_TRUTH_SCOPE" : scoreMutationClaimCount > 0 || unsupportedTruthClaimCount > 0 ? "FIX_SOURCE_OF_TRUTH_COPY" : "MOVE_TECHNICAL_TRUTH_CLAIMS",
  };
}
