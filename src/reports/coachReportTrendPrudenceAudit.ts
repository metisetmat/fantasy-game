import type { CoachReportMultiMatchComparisonTrendSignalsWarningCode } from "./coachReportMultiMatchComparisonTrendSignalsWarnings";

export interface CoachReportTrendPrudenceAudit {
  readonly localSampleLanguagePresent: boolean;
  readonly globalProofClaimCount: number;
  readonly definitiveTrendClaimCount: number;
  readonly trendAsInstructionCount: number;
  readonly trendAsSelectionCount: number;
  readonly trendAsOfficialScoreTruthCount: number;
  readonly confidenceLabelsPresent: boolean;
  readonly limitationNotesPresent: boolean;
  readonly nextMatchChecksPresent: boolean;
  readonly trendPrudenceWarningCodes: readonly CoachReportMultiMatchComparisonTrendSignalsWarningCode[];
  readonly recommendation: "KEEP_TREND_PRUDENCE" | "FIX_OVERCONFIDENT_TREND_COPY";
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ");
}

function count(text: string, pattern: RegExp): number {
  return (text.match(pattern) ?? []).length;
}

export function auditCoachReportTrendPrudence(input: {
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachReportTrendPrudenceAudit {
  const text = stripTags(`${input.productReportHtml}\n${input.exportReportHtml}`);
  const lower = text.toLocaleLowerCase("fr-FR");
  const localSampleLanguagePresent = /echantillons disponibles|comparaison locale|historique d.observation/iu.test(lower);
  const globalProofClaimCount = count(lower, /v.rit. globale|db confirme|sqlite prouve|batch score officiel/giu);
  const definitiveTrendClaimCount = count(lower, /tendance prouv.e|preuve d.finitive|tendance garantie|\btoujours\b|\bgaranti\b/giu);
  const trendAsInstructionCount = count(lower, /historique d.cide|plan tactique impos.|consigne automatique/giu);
  const trendAsSelectionCount = count(lower, /doit s.lectionner|composition recommand.e|s.lection impos.e/giu);
  const trendAsOfficialScoreTruthCount = count(lower, /historique.*score officiel|tendance.*score officiel|batch score officiel/giu);
  const confidenceLabelsPresent = /confiance (faible|moyenne|haute)/iu.test(lower);
  const limitationNotesPresent = /pas une conclusion generale|ne remplace pas la lecture officielle du match courant/iu.test(lower);
  const nextMatchChecksPresent = /a verifier au prochain match|prochain match/iu.test(lower);
  const clean = localSampleLanguagePresent &&
    globalProofClaimCount === 0 &&
    definitiveTrendClaimCount === 0 &&
    trendAsInstructionCount === 0 &&
    trendAsSelectionCount === 0 &&
    trendAsOfficialScoreTruthCount === 0 &&
    confidenceLabelsPresent &&
    limitationNotesPresent &&
    nextMatchChecksPresent;

  return {
    localSampleLanguagePresent,
    globalProofClaimCount,
    definitiveTrendClaimCount,
    trendAsInstructionCount,
    trendAsSelectionCount,
    trendAsOfficialScoreTruthCount,
    confidenceLabelsPresent,
    limitationNotesPresent,
    nextMatchChecksPresent,
    trendPrudenceWarningCodes: [
      ...(clean ? ["TREND_PRUDENCE_READY" as const] : ["COACH_REPORT_MULTI_MATCH_TRENDS_PARTIAL" as const]),
      ...(globalProofClaimCount === 0 ? [] : ["GLOBAL_PROOF_CLAIM_DETECTED" as const]),
      ...(definitiveTrendClaimCount === 0 ? [] : ["OVERCONFIDENT_TREND_CLAIM" as const]),
      ...(trendAsInstructionCount === 0 ? [] : ["HISTORY_USED_AS_OFFICIAL_TRUTH" as const]),
      ...(trendAsSelectionCount === 0 ? [] : ["HISTORY_USED_AS_SELECTION_TRUTH" as const]),
      ...(trendAsOfficialScoreTruthCount === 0 ? [] : ["BATCH_SCORE_LEAKAGE" as const]),
      ...(limitationNotesPresent ? [] : ["TREND_LIMITATION_MISSING" as const]),
      ...(nextMatchChecksPresent ? [] : ["TREND_NEXT_MATCH_CHECK_MISSING" as const]),
    ],
    recommendation: clean ? "KEEP_TREND_PRUDENCE" : "FIX_OVERCONFIDENT_TREND_COPY",
  };
}
