import type { ManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel } from "./manualReviewPreviewPayloadDryRunExportBudgetCushionTypes9I";

const PRODUCT_9H_SECTION_ID = "manual-review-preview-payload-dry-run-error-copy-ux-grouping-9h";

function findElementRangeById(html: string, id: string): { readonly start: number; readonly end: number } | null {
  const idIndex = html.indexOf(`id="${id}"`);
  if (idIndex < 0) return null;
  const openStart = html.lastIndexOf("<section", idIndex);
  if (openStart < 0) return null;
  const tagPattern = /<\/?section\b[^>]*>/giu;
  tagPattern.lastIndex = openStart;
  let depth = 0;
  for (let match = tagPattern.exec(html); match !== null; match = tagPattern.exec(html)) {
    const tag = match[0] ?? "";
    depth += tag.startsWith("</") ? -1 : 1;
    if (depth === 0) return { start: openStart, end: match.index + tag.length };
  }
  return null;
}

function insertAfterSectionById(html: string, id: string, insertion: string): string {
  const range = findElementRangeById(html, id);
  if (range === null) {
    const mainEnd = html.lastIndexOf("</main>");
    return mainEnd < 0 ? `${html}\n${insertion}` : `${html.slice(0, mainEnd)}${insertion}\n${html.slice(mainEnd)}`;
  }
  return `${html.slice(0, range.end)}\n${insertion}${html.slice(range.end)}`;
}

export function renderManualReviewPreviewPayloadDryRunExportBudgetCushionProduct9I(
  model: Pick<
    ManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel,
    | "status"
    | "exportReadTimeSecondsBefore9I"
    | "exportReadTimeSecondsAfter9I"
    | "exportReadTimeDelta9I"
    | "exportBudgetCushionSeconds"
    | "exportBudgetCushionStatus"
    | "uxGroupCountFrom9H"
    | "groupedErrorCopyCountFrom9H"
    | "groupedBlockerCopyCountFrom9H"
    | "groupedRefusalCopyCountFrom9H"
    | "groupedCompatibleCaseCountFrom9H"
    | "exportKeyMessagesDetectedCountFrom9G"
    | "warningContradictionCountAfter9I"
    | "validationRuntimeActive"
    | "dryRunAcceptedPayloadCount"
    | "realPreviewGenerated"
    | "storageCreated"
    | "officialTruthPromoted"
    | "scoreMutationCount"
    | "timelineMutationCount"
  >,
): string {
  return [
    '<section id="manual-review-preview-payload-dry-run-export-budget-cushion-9i" class="product-section manual-review-preview-payload-dry-run-export-budget-cushion-9i" data-manual-review-preview-payload-dry-run-export-budget-cushion-version="9I">',
    '<p class="eyebrow">Sprint 9I - budget export</p>',
    "<h2>Marge export avant progressive disclosure</h2>",
    `<p><strong>Statut :</strong> ${model.status}. Budget 9H : ${model.exportReadTimeSecondsBefore9I}s. Budget 9I : ${model.exportReadTimeSecondsAfter9I}s. Delta : ${model.exportReadTimeDelta9I}s. Marge sous 800s : ${model.exportBudgetCushionSeconds}s.</p>`,
    `<p><strong>Coussin :</strong> ${model.exportBudgetCushionStatus}. L'objectif reste 760-780s avant la prochaine couche de progressive disclosure.</p>`,
    `<p><strong>Preserve :</strong> groupes 9H ${model.uxGroupCountFrom9H}/5; copies ${model.groupedErrorCopyCountFrom9H}/${model.groupedBlockerCopyCountFrom9H}/${model.groupedRefusalCopyCountFrom9H}/${model.groupedCompatibleCaseCountFrom9H}; messages cles 9G ${model.exportKeyMessagesDetectedCountFrom9G}/7; contradiction ${model.warningContradictionCountAfter9I}.</p>`,
    '<div class="detail-card-grid">',
    `<article class="detail-card"><h3>Compaction export</h3><p>Les details produit restent dans le rapport produit. L'export historique est resserre pour garder une marge avant 9J.</p></article>`,
    `<article class="detail-card"><h3>Garde-fous</h3><p>Runtime ${model.validationRuntimeActive ? "actif" : "inactif"}; payload accepte ${model.dryRunAcceptedPayloadCount}; preview reelle ${model.realPreviewGenerated ? "true" : "false"}; stockage ${model.storageCreated ? "true" : "false"}; official truth ${model.officialTruthPromoted ? "true" : "false"}; mutations ${model.scoreMutationCount}/${model.timelineMutationCount}.</p></article>`,
    "</div>",
    '<div class="product-callout">',
    "<p><strong>Limite :</strong> 9I ne cree pas de progressive disclosure. Il prepare seulement de la marge lisible pour le sprint suivant.</p>",
    "</div>",
    "</section>",
  ].join("\n");
}

export function insertManualReviewPreviewPayloadDryRunExportBudgetCushionProduct9I(
  html: string,
  model: Parameters<typeof renderManualReviewPreviewPayloadDryRunExportBudgetCushionProduct9I>[0],
): string {
  return insertAfterSectionById(html, PRODUCT_9H_SECTION_ID, renderManualReviewPreviewPayloadDryRunExportBudgetCushionProduct9I(model));
}
