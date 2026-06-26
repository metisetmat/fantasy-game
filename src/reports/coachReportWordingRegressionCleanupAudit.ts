import type { ProductReportScopeDensityWordingCleanupWarningCode } from "./productReportScopeDensityWordingCleanupWarnings";

export interface CoachReportWordingRegressionCleanupAudit {
  readonly mechanicalPhraseCount: number;
  readonly duplicatedLabelCount: number;
  readonly repeatedPrefixCount: number;
  readonly awkwardSentenceCount: number;
  readonly repeatedWarningSentenceCount: number;
  readonly unresolvedTemplatePlaceholderCount: number;
  readonly excessiveCaveatCount: number;
  readonly forbiddenWordingCount: number;
  readonly nonCoachReadableSentenceCount: number;
  readonly wordingRegressionWarningCodes: readonly ProductReportScopeDensityWordingCleanupWarningCode[];
  readonly recommendation: "KEEP_WORDING_CLEANUP" | "FIX_MECHANICAL_WORDING" | "REDUCE_WARNING_REPETITION";
}

const mechanicalPatterns: readonly RegExp[] = [
  /Le rapport officiel fait ressortir\s+Le rapport officiel met en avant/iu,
  /La deuxieme lecture met en avant\s+La qualit/iu,
  /La suite du rapport signale\s+La suite/iu,
  /Ce que l.histori(?:que|q) montre\s*:\s*ce que l.histori(?:que|q) montre/iu,
  /Pourquoi on reste prudent\s*:\s*pourquoi on reste prudent/iu,
];

const forbiddenPatterns: readonly RegExp[] = [
  /preuve d[ée]finitive/iu,
  /v[ée]rit[ée] globale depuis ce run/iu,
  /zone dominante garantie/iu,
  /plan tactique impos[ée]/iu,
  /composition recommand[ée]e automatiquement/iu,
  /s[ée]lection impos[ée]e/iu,
  /sandbox appliqu[ée]/iu,
  /diagnostic comme v[ée]rit[ée] officielle/iu,
  /batch score comme score officiel/iu,
  /score ajust[ée]/iu,
  /score [ée]quilibr[ée] manuellement/iu,
  /comeback garanti/iu,
];

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/gu, " ");
}

function countPatterns(text: string, patterns: readonly RegExp[]): number {
  return patterns.reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0);
}

function repeatedSentenceCount(text: string, sentence: string): number {
  const escaped = sentence.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  return Math.max(0, (text.match(new RegExp(escaped, "giu")) ?? []).length - 1);
}

export function auditCoachReportWordingRegressionCleanup(input: {
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachReportWordingRegressionCleanupAudit {
  const visibleText = stripTags(`${input.productReportHtml}\n${input.exportReportHtml}`);
  const mechanicalPhraseCount = countPatterns(visibleText, mechanicalPatterns);
  const duplicatedLabelCount = (visibleText.match(/Ce que l.histori(?:que|q) montre\s*:\s*ce que l.histori(?:que|q) montre|Pourquoi on reste prudent\s*:\s*pourquoi on reste prudent|Action coach\s*:\s*Action coach/giu) ?? []).length;
  const repeatedPrefixCount = (visibleText.match(/\b(Le rapport officiel|La deuxieme lecture|La suite du rapport)\b[\s\S]{0,80}\b\1\b/giu) ?? []).length;
  const awkwardSentenceCount = (visibleText.match(/\bmet en avant\s+Le rapport officiel|\bsignale\s+La suite/giu) ?? []).length;
  const repeatedWarningSentenceCount =
    repeatedSentenceCount(visibleText, "Controlled local samples remain visible") +
    repeatedSentenceCount(visibleText, "Database migration is a dry run only");
  const unresolvedTemplatePlaceholderCount = (visibleText.match(/\{\{|\}\}|TODO|MISSING_DATA/giu) ?? []).length;
  const excessiveCaveatCount = Math.max(0, (visibleText.match(/A confirmer|non appliqu|reste prudent/giu) ?? []).length - 18);
  const forbiddenWordingCount = countPatterns(visibleText, forbiddenPatterns);
  const nonCoachReadableSentenceCount = (visibleText.match(/WORKBENCH_CHAIN_|sandbox_only|trace_supported|officially_confirmed/giu) ?? []).length;
  const clean = mechanicalPhraseCount === 0 &&
    duplicatedLabelCount === 0 &&
    repeatedPrefixCount === 0 &&
    awkwardSentenceCount === 0 &&
    repeatedWarningSentenceCount === 0 &&
    unresolvedTemplatePlaceholderCount === 0 &&
    forbiddenWordingCount === 0;

  return {
    mechanicalPhraseCount,
    duplicatedLabelCount,
    repeatedPrefixCount,
    awkwardSentenceCount,
    repeatedWarningSentenceCount,
    unresolvedTemplatePlaceholderCount,
    excessiveCaveatCount,
    forbiddenWordingCount,
    nonCoachReadableSentenceCount,
    wordingRegressionWarningCodes: [
      ...(mechanicalPhraseCount === 0 ? ["MECHANICAL_WORDING_REMOVED" as const] : ["MECHANICAL_WORDING_STILL_PRESENT" as const]),
      ...(duplicatedLabelCount === 0 && repeatedPrefixCount === 0 ? ["DUPLICATED_LABELS_REMOVED" as const] : ["DUPLICATED_LABELS_STILL_PRESENT" as const]),
      ...(repeatedWarningSentenceCount === 0 ? ["REPEATED_WARNINGS_REDUCED" as const] : ["REPEATED_WARNINGS_STILL_PRESENT" as const]),
      ...(forbiddenWordingCount === 0 ? [] : ["FORBIDDEN_WORDING_DETECTED" as const]),
    ],
    recommendation: clean ? "KEEP_WORDING_CLEANUP" : repeatedWarningSentenceCount > 0 ? "REDUCE_WARNING_REPETITION" : "FIX_MECHANICAL_WORDING",
  };
}
