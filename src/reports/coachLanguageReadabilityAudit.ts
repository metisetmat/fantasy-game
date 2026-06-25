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

const forbidden = /score [Ã©e]quilibr[Ã©e] manuellement|score ajust[Ã©e]|but de compensation|essai de compensation|comeback garanti|[Ã©e]quilibre garanti|preuve d[Ã©e]finitive|v[Ã©e]rit[Ã©e] globale depuis ce run|composition recommand[Ã©e]e automatiquement|s[Ã©e]lection impos[Ã©e]e|plan tactique impos[Ã©e]?|sandbox appliqu[Ã©e]|diagnostic comme v[Ã©e]rit[Ã©e] officielle|batch score comme score officiel/giu;

function count(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

function mainBody(html: string): string {
  const appendix = html.indexOf("<section id=\"appendices\"");
  return (appendix === -1 ? html : html.slice(0, appendix)).replace(/<[^>]+>/gu, " ");
}

export function auditCoachLanguageReadability(input: {
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachLanguageReadabilityAudit {
  const text = `${mainBody(input.productReportHtml)}\n${mainBody(input.exportReportHtml)}`;
  const sentences = text.split(/[.!?]+/u).map((item) => item.trim()).filter((item) => item.length > 0);
  const jargonCount = count(text, /internalTags|sandbox_only|trace_supported|canDriveLiveSelection|production route|score mutation/giu);
  const forbiddenWordingCount = count(text, forbidden);
  const technicalSentenceCount = sentences.filter((sentence) => /internalTags|score_change|sandbox|batch|guardrail/iu.test(sentence)).length;
  const repeatedTechnicalCopyCount = Math.max(0, count(text, /score_change|sandbox|batch|guardrail/giu) - 90);
  const overlongParagraphCount = count(text, /\b(?:\S+\s+){85,}\S+/gu);
  const excessiveCaveatCount = Math.max(0, count(text, /non appliqu|a confirmer|ne remplace pas|separe/giu) - 80);
  const missingPlainLanguageExplanationCount = text.includes("Pourquoi c'est important") || text.includes("Pourquoi")
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
