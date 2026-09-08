import type { ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HModel } from "./manualReviewPreviewPayloadDryRunErrorCopyUxGroupingTypes9H";

const PRODUCT_9G_SECTION_ID = "manual-review-preview-payload-dry-run-export-key-messages-warning-consistency-repair-9g";

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

export function renderManualReviewPreviewPayloadDryRunErrorCopyUxGroupingProduct9H(
  model: Pick<
    ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HModel,
    | "status"
    | "uxGroupCount"
    | "groupedErrorCopyCount"
    | "groupedBlockerCopyCount"
    | "groupedRefusalCopyCount"
    | "groupedCompatibleCaseCount"
    | "errorCopyErrorCoverageCountFrom9E"
    | "errorCopyBlockerCoverageCountFrom9E"
    | "errorCopyBoundaryGuardCoverageCountFrom9E"
    | "errorCopyRefusalStateCoverageCountFrom9E"
    | "warningContradictionCountAfter9H"
    | "validationRuntimeActive"
    | "dryRunAcceptedPayloadCount"
    | "realPreviewGenerated"
    | "groups"
  >,
): string {
  const groupCards = model.groups.map((group) => {
    const examples = group.copyIds.slice(0, 3).join(", ");
    return [
      '<article class="detail-card">',
      `<h3>${group.label}</h3>`,
      `<p>${group.coachFacingPurpose}</p>`,
      `<p><strong>Copies :</strong> ${group.copyCount}. <strong>Exemples :</strong> ${examples}.</p>`,
      `<p><strong>Frontiere protegee :</strong> ${group.primaryBoundary}</p>`,
      `<p><strong>Reste interdit :</strong> ${group.stillForbiddenSummary}</p>`,
      "</article>",
    ].join("\n");
  });

  return [
    '<section id="manual-review-preview-payload-dry-run-error-copy-ux-grouping-9h" class="product-section manual-review-preview-payload-dry-run-error-copy-ux-grouping-9h" data-manual-review-preview-payload-dry-run-error-copy-ux-grouping-version="9H">',
    '<p class="eyebrow">Sprint 9H - regroupement UX dry-run</p>',
    "<h2>Regroupement UX des erreurs dry-run</h2>",
    "<p><strong>5 familles lisibles - aucune validation active.</strong></p>",
    "<p>Les messages 9E sont regroupes pour lecture coach/reviewer. Ce regroupement ne valide rien, n'accepte aucun payload et ne genere aucune preview.</p>",
    '<div class="detail-card-grid">',
    `<article class="detail-card"><h3>Statut</h3><p>${model.status}. Groupes UX : ${model.uxGroupCount}. Copies erreurs : ${model.groupedErrorCopyCount}. Blockers : ${model.groupedBlockerCopyCount}. Refus : ${model.groupedRefusalCopyCount}. Cas compatible : ${model.groupedCompatibleCaseCount}, non accepte.</p></article>`,
    `<article class="detail-card"><h3>Coverage</h3><p>${model.errorCopyErrorCoverageCountFrom9E}/${model.errorCopyBlockerCoverageCountFrom9E}/${model.errorCopyBoundaryGuardCoverageCountFrom9E}/${model.errorCopyRefusalStateCoverageCountFrom9E}. Warning contradiction : ${model.warningContradictionCountAfter9H}. Runtime : ${model.validationRuntimeActive ? "active" : "inactive"}. Payload accepte : ${model.dryRunAcceptedPayloadCount}. Preview reelle : ${model.realPreviewGenerated ? "true" : "false"}.</p></article>`,
    "</div>",
    '<div class="detail-card-grid">',
    ...groupCards,
    "</div>",
    '<div class="product-callout">',
    "<p><strong>Cas compatible :</strong> Le cas compatible reste non accepte. Il sert de repere de forme, pas de payload valide.</p>",
    "<p><strong>Garde-fou :</strong> UX grouping uniquement : aucun runtime, aucun payload reel, aucune acceptation de payload, aucune preview reelle, aucun submit/API/backend, aucun stockage, aucune memoire, aucune official truth, aucune decision automatique, aucune selection, aucune tactique, aucune mutation match.</p>",
    "</div>",
    "</section>",
  ].join("\n");
}

export function insertManualReviewPreviewPayloadDryRunErrorCopyUxGroupingProduct9H(
  html: string,
  model: Pick<
    ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HModel,
    | "status"
    | "uxGroupCount"
    | "groupedErrorCopyCount"
    | "groupedBlockerCopyCount"
    | "groupedRefusalCopyCount"
    | "groupedCompatibleCaseCount"
    | "errorCopyErrorCoverageCountFrom9E"
    | "errorCopyBlockerCoverageCountFrom9E"
    | "errorCopyBoundaryGuardCoverageCountFrom9E"
    | "errorCopyRefusalStateCoverageCountFrom9E"
    | "warningContradictionCountAfter9H"
    | "validationRuntimeActive"
    | "dryRunAcceptedPayloadCount"
    | "realPreviewGenerated"
    | "groups"
  >,
): string {
  return insertAfterSectionById(html, PRODUCT_9G_SECTION_ID, renderManualReviewPreviewPayloadDryRunErrorCopyUxGroupingProduct9H(model));
}
