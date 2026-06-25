import type { CoachActionPlanCardsTrainingFocusPackagingWarningCode } from "./coachActionPlanCardsTrainingFocusPackagingWarnings";

export interface CoachReportWordingPolishAudit {
  readonly duplicatedLabelCount: number;
  readonly mechanicalPhraseCount: number;
  readonly awkwardSentenceCount: number;
  readonly repeatedPrefixCount: number;
  readonly overlongParagraphCount: number;
  readonly jargonCount: number;
  readonly forbiddenWordingCount: number;
  readonly excessiveCaveatCount: number;
  readonly unresolvedTemplatePlaceholderCount: number;
  readonly coachLanguageReady: boolean;
  readonly wordingPolishWarningCodes: readonly CoachActionPlanCardsTrainingFocusPackagingWarningCode[];
  readonly recommendation: "KEEP_WORDING_POLISH" | "POLISH_MECHANICAL_WORDING";
}

const mechanicalPatterns = [
  /Le signal principal montre Le rapport officiel/giu,
  /Le deuxieme signal indique La qualite/giu,
  /Le troisieme signal montre La suite/giu,
  /Action coach prudente:\s*Action coach prudente/giu,
  /Tradeoff:\s*Tradeoff/giu,
  /Cause probable:\s*Cause probable/giu,
  /Consequence tactique:\s*Consequence tactique/giu,
  /Risque si on insiste:\s*Risque si on insiste/giu,
];

const forbidden = /score equilibre manuellement|score ajuste|but de compensation|essai de compensation|comeback garanti|equilibre garanti|preuve definitive|verite globale depuis ce run|composition recommandee automatiquement|selection imposee|plan tactique impose|sandbox applique|diagnostic comme verite officielle|batch score comme score officiel/giu;

function normalize(text: string): string {
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
    .replaceAll("&rsquo;", "'")
    .replace(/\s+/gu, " ")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("fr-FR");
}

function visibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<details[\s\S]*?<\/details>/giu, " ");
}

function count(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

export function auditCoachReportWordingPolish(input: {
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachReportWordingPolishAudit {
  const raw = visibleText(`${input.productReportHtml}\n${input.exportReportHtml}`);
  const normalized = normalize(raw);
  const mechanicalPhraseCount = mechanicalPatterns.reduce((total, pattern) => total + count(raw, pattern), 0);
  const duplicatedLabelCount = count(normalized, /\b(action coach|tradeoff|cause probable|risque si on insiste|consequence tactique)\s*:\s*\1\b/giu);
  const repeatedPrefixCount = count(normalized, /\b(le signal principal montre|le deuxieme signal indique|le troisieme signal montre)\s+\b(le rapport officiel|la qualite|la suite)\b/giu);
  const awkwardSentenceCount = mechanicalPhraseCount + repeatedPrefixCount;
  const overlongParagraphCount = count(normalized, /\b(?:\S+\s+){90,}\S+/gu);
  const jargonCount = count(normalized, /internaltags|candriverliveselection|production route|score mutation/giu);
  const forbiddenWordingCount = count(normalized, forbidden);
  const excessiveCaveatCount = Math.max(0, count(normalized, /non applique|a confirmer|ne remplace pas|separe/giu) - 90);
  const unresolvedTemplatePlaceholderCount = count(normalized, /\{\{[^}]+\}\}|undefined|\[object object\]/giu);
  const coachLanguageReady = duplicatedLabelCount === 0 &&
    mechanicalPhraseCount === 0 &&
    awkwardSentenceCount === 0 &&
    jargonCount === 0 &&
    forbiddenWordingCount === 0 &&
    unresolvedTemplatePlaceholderCount === 0;

  return {
    duplicatedLabelCount,
    mechanicalPhraseCount,
    awkwardSentenceCount,
    repeatedPrefixCount,
    overlongParagraphCount,
    jargonCount,
    forbiddenWordingCount,
    excessiveCaveatCount,
    unresolvedTemplatePlaceholderCount,
    coachLanguageReady,
    wordingPolishWarningCodes: coachLanguageReady
      ? ["COACH_LANGUAGE_POLISHED", "MECHANICAL_WORDING_REMOVED"]
      : [
          "COACH_ACTION_PLAN_PACKAGING_PARTIAL",
          ...(mechanicalPhraseCount > 0 ? ["MECHANICAL_WORDING_STILL_PRESENT" as const] : []),
          ...(duplicatedLabelCount > 0 ? ["DUPLICATED_LABELS_STILL_PRESENT" as const] : []),
          ...(forbiddenWordingCount > 0 ? ["FORBIDDEN_WORDING_DETECTED" as const] : []),
          ...(jargonCount > 0 ? ["REPORT_TOO_TECHNICAL" as const] : []),
        ],
    recommendation: coachLanguageReady ? "KEEP_WORDING_POLISH" : "POLISH_MECHANICAL_WORDING",
  };
}
