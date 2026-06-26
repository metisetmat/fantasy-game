import { containsForbiddenCoachWording, extractSection } from "./coachReportHtmlAuditUtils";
import type { CoachTacticalMapCard } from "./coachReportTacticalMapCards";
import type { CoachReportPhaseVisualsTacticalMapCardsWarningCode } from "./coachReportPhaseVisualsTacticalMapCardsWarnings";

export interface CoachReportVisualSourceOfTruthAudit {
  readonly officialVisualCardsCorrectlyLabeled: boolean;
  readonly diagnosticVisualCardsCorrectlyLabeled: boolean;
  readonly sandboxVisualCardsCorrectlyLabeled: boolean;
  readonly sandboxVisualCardsBelowOfficialSections: boolean;
  readonly visualClaimsSupportedBySource: boolean;
  readonly visualClaimsOverstatedCount: number;
  readonly unsupportedVisualTruthClaimCount: number;
  readonly batchAsOfficialVisualCount: number;
  readonly sandboxAsOfficialVisualCount: number;
  readonly visualSourceOfTruthWarningCodes: readonly CoachReportPhaseVisualsTacticalMapCardsWarningCode[];
  readonly recommendation: "KEEP_VISUAL_SOURCE_BOUNDARY" | "FIX_VISUAL_SOURCE_LABELS" | "FIX_VISUAL_TRUTH_CLAIMS";
}

export function auditCoachReportVisualSourceOfTruth(input: {
  readonly cards: readonly CoachTacticalMapCard[];
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachReportVisualSourceOfTruthAudit {
  const combined = `${input.productReportHtml}\n${input.exportReportHtml}`;
  const productSection = extractSection(input.productReportHtml, "tactical-map-cards");
  const officialVisualCardsCorrectlyLabeled = input.cards
    .filter((card) => card.sourceType === "official")
    .every((card) => productSection.includes(card.cardId) && productSection.includes("Source : Officiel"));
  const diagnosticVisualCardsCorrectlyLabeled = input.cards
    .filter((card) => card.sourceType === "diagnostic")
    .every((card) => productSection.includes("Source : diagnostic"));
  const sandboxVisualCardsCorrectlyLabeled = input.cards
    .filter((card) => card.sourceType === "sandbox")
    .every((card) => productSection.includes("Source : sandbox"));
  const sandboxVisualCardsBelowOfficialSections = input.cards.every((card) => card.sourceType !== "sandbox" || card.collapsedByDefault);
  const visualClaimsSupportedBySource = input.cards.every((card) =>
    card.insufficientDataState || card.affectedZones.length > 0 || card.limitationNote.length > 0
  );
  const forbiddenClaimRegex = /heatmap certaine|preuve definitive|preuve d.finitive|verite globale depuis ce run|v.rit. globale depuis ce run|zone dominante garantie|plan tactique impose|plan tactique impos./iu;
  const visualClaimsOverstatedCount = (combined.match(forbiddenClaimRegex) ?? []).length + (containsForbiddenCoachWording(combined) ? 1 : 0);
  const unsupportedVisualTruthClaimCount = input.cards.filter((card) =>
    card.confidence === "high" && card.affectedZones.length === 0
  ).length;
  const batchAsOfficialVisualCount = /batch score comme score officiel|diagnostic comme verite officielle|diagnostic comme v.rit. officielle/iu.test(productSection) ? 1 : 0;
  const sandboxAsOfficialVisualCount = /sandbox applique|sandbox appliqu./iu.test(productSection) ? 1 : 0;
  const ready = officialVisualCardsCorrectlyLabeled &&
    diagnosticVisualCardsCorrectlyLabeled &&
    sandboxVisualCardsCorrectlyLabeled &&
    sandboxVisualCardsBelowOfficialSections &&
    visualClaimsSupportedBySource &&
    visualClaimsOverstatedCount === 0 &&
    unsupportedVisualTruthClaimCount === 0 &&
    batchAsOfficialVisualCount === 0 &&
    sandboxAsOfficialVisualCount === 0;
  const visualSourceOfTruthWarningCodes: CoachReportPhaseVisualsTacticalMapCardsWarningCode[] = [
    ...(ready ? [] : ["SOURCE_OF_TRUTH_AMBIGUOUS" as const]),
    ...(officialVisualCardsCorrectlyLabeled ? ["OFFICIAL_VISUAL_CARDS_READY" as const] : ["VISUAL_SOURCE_BADGE_MISSING" as const]),
    ...(visualClaimsOverstatedCount > 0 ? ["OVERCONFIDENT_VISUAL_CLAIM" as const] : []),
    ...(unsupportedVisualTruthClaimCount > 0 ? ["UNSUPPORTED_VISUAL_CLAIM" as const] : []),
    ...(batchAsOfficialVisualCount > 0 ? ["BATCH_AS_OFFICIAL_VISUAL" as const] : []),
    ...(sandboxAsOfficialVisualCount > 0 ? ["SANDBOX_TRUTH_LEAKAGE" as const] : []),
  ];

  return {
    officialVisualCardsCorrectlyLabeled,
    diagnosticVisualCardsCorrectlyLabeled,
    sandboxVisualCardsCorrectlyLabeled,
    sandboxVisualCardsBelowOfficialSections,
    visualClaimsSupportedBySource,
    visualClaimsOverstatedCount,
    unsupportedVisualTruthClaimCount,
    batchAsOfficialVisualCount,
    sandboxAsOfficialVisualCount,
    visualSourceOfTruthWarningCodes,
    recommendation: ready
      ? "KEEP_VISUAL_SOURCE_BOUNDARY"
      : !officialVisualCardsCorrectlyLabeled
        ? "FIX_VISUAL_SOURCE_LABELS"
        : "FIX_VISUAL_TRUTH_CLAIMS",
  };
}
