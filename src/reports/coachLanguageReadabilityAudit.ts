import type { CoachInsightDepthNextMatchRecommendationsWarningCode } from "./coachInsightDepthNextMatchRecommendationsWarnings";

export interface CoachLanguageReadabilityAudit {
  readonly coachReadableSentenceCount: number;
  readonly technicalSentenceCount: number;
  readonly jargonCount: number;
  readonly repeatedTechnicalCopyCount: number;
  readonly overlongParagraphCount: number;
  readonly forbiddenWordingCount: number;
  readonly excessiveCaveatCount: number;
  readonly missingPlainLanguageExplanationCount: number;
  readonly coachLanguageWarningCodes: readonly CoachInsightDepthNextMatchRecommendationsWarningCode[];
  readonly recommendation: "KEEP_COACH_LANGUAGE" | "SIMPLIFY_COACH_LANGUAGE";
}

const forbidden = /score equilibre manuellement|score ajuste|but de compensation|essai de compensation|comeback garanti|equilibre garanti|preuve definitive|verite globale depuis ce run|composition recommandee automatiquement|selection imposee|plan tactique impose|sandbox applique|diagnostic comme verite officielle|batch score comme score officiel/giu;

function normalizedCoachText(text: string): string {
  return text
    .replace(/<[^>]+>/gu, " ")
    .replaceAll("&eacute;", "e")
    .replaceAll("&Eacute;", "e")
    .replaceAll("&egrave;", "e")
    .replaceAll("&Egrave;", "e")
    .replaceAll("&ecirc;", "e")
    .replaceAll("&Ecirc;", "e")
    .replaceAll("&agrave;", "a")
    .replaceAll("&Agrave;", "a")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&rsquo;", "'")
    .replace(/\s+/gu, " ")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("fr-FR");
}

function count(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

function mainBody(html: string): string {
  const appendix = html.indexOf("<section id=\"appendices\"");
  return appendix === -1 ? html : html.slice(0, appendix);
}

export function auditCoachLanguageReadability(input: {
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachLanguageReadabilityAudit {
  const rawText = `${mainBody(input.productReportHtml)}\n${mainBody(input.exportReportHtml)}`;
  const text = normalizedCoachText(rawText);
  const sentences = text.split(/[.!?]+/u).map((item) => item.trim()).filter((item) => item.length > 0);
  const jargonCount = count(text, /internaltags|sandbox_only|trace_supported|candriverliveselection|production route|score mutation/giu);
  const forbiddenWordingCount = count(text, forbidden);
  const technicalSentenceCount = sentences.filter((sentence) => /internaltags|score_change|sandbox|batch|guardrail/iu.test(sentence)).length;
  const repeatedTechnicalCopyCount = Math.max(0, count(text, /score_change|sandbox|batch|guardrail/giu) - 90);
  const overlongParagraphCount = count(text, /\b(?:\S+\s+){85,}\S+/gu);
  const excessiveCaveatCount = Math.max(0, count(text, /non appliqu|a confirmer|ne remplace pas|separe/giu) - 80);
  const missingPlainLanguageExplanationCount = text.includes("pourquoi c'est important") || text.includes("pourquoi")
    ? 0
    : 1;
  const ready = forbiddenWordingCount === 0 &&
    jargonCount === 0 &&
    repeatedTechnicalCopyCount === 0 &&
    overlongParagraphCount === 0 &&
    missingPlainLanguageExplanationCount === 0;

  return {
    coachReadableSentenceCount: Math.max(0, sentences.length - technicalSentenceCount),
    technicalSentenceCount,
    jargonCount,
    repeatedTechnicalCopyCount,
    overlongParagraphCount,
    forbiddenWordingCount,
    excessiveCaveatCount,
    missingPlainLanguageExplanationCount,
    coachLanguageWarningCodes: ready ? [] : [
      ...(forbiddenWordingCount > 0 ? ["FORBIDDEN_WORDING_DETECTED" as const] : []),
      ...(jargonCount > 0 || repeatedTechnicalCopyCount > 0 ? ["REPORT_TOO_TECHNICAL" as const] : []),
    ],
    recommendation: ready ? "KEEP_COACH_LANGUAGE" : "SIMPLIFY_COACH_LANGUAGE",
  };
}
