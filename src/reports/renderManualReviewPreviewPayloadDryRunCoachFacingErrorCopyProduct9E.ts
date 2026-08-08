import type { ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyTypes9E";

function escapeHtml(value: string): string {
  return value
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;");
}

function copyCard(copy: ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel["errorCopies"][number]): string {
  return [
    '<li class="manual-review-error-copy-card">',
    `<strong>${escapeHtml(copy.title)}</strong> <span>${escapeHtml(copy.copyId)}</span>`,
    `<p>${escapeHtml(copy.shortMessage)}</p>`,
    "<dl>",
    `<dt>Ce qui se passe</dt><dd>${escapeHtml(copy.whatHappened)}</dd>`,
    `<dt>Pourquoi c'est bloque</dt><dd>${escapeHtml(copy.whyItBlocks)}</dd>`,
    `<dt>Correction future</dt><dd>${escapeHtml(copy.howToFixLater)}</dd>`,
    `<dt>Frontiere protegee</dt><dd>${escapeHtml(copy.protectedBoundary)}</dd>`,
    `<dt>Reste interdit</dt><dd>${escapeHtml(copy.stillForbidden)}</dd>`,
    `<dt>Reference technique</dt><dd>${escapeHtml(copy.technicalReference)}</dd>`,
    "</dl>",
    "</li>",
  ].join("");
}

function copySection(
  title: string,
  copies: readonly ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel["errorCopies"][number][],
): string {
  return [`<h3>${escapeHtml(title)}</h3>`, `<ul>${copies.map(copyCard).join("")}</ul>`].join("\n");
}

export function renderManualReviewPreviewPayloadDryRunCoachFacingErrorCopyProduct9E(
  model: ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel,
): string {
  return [
    '<section id="manual-review-preview-payload-dry-run-coach-facing-error-copy-9e" class="premium-section manual-review-preview-payload-dry-run-coach-facing-error-copy-9e" data-manual-review-preview-payload-dry-run-coach-facing-error-copy-version="9E">',
    '<p class="eyebrow">Sprint 9E - error copy coach-facing, sans preview</p>',
    "<h2>Messages d'erreur coach-facing dry-run</h2>",
    `<p><strong>${model.coachFacingErrorCopyCount} messages d'erreur lisibles</strong>, ${model.coachFacingBlockerCopyCount} blockers, ${model.coachFacingRefusalCopyCount} refusals et ${model.compatibleCaseCopyCount} cas compatible non accepte.</p>`,
    '<div class="kpi-grid">',
    `<article><span class="kpi-label">Erreurs</span><strong>${model.coachFacingErrorCopyCount}/${model.coachFacingErrorCopyCountExpected}</strong></article>`,
    `<article><span class="kpi-label">Blockers</span><strong>${model.coachFacingBlockerCopyCount}/${model.coachFacingBlockerCopyCountExpected}</strong></article>`,
    `<article><span class="kpi-label">Refusals</span><strong>${model.coachFacingRefusalCopyCount}/${model.coachFacingRefusalCopyCountExpected}</strong></article>`,
    `<article><span class="kpi-label">Wording</span><strong>${model.wordingReadabilityScore}</strong></article>`,
    "</div>",
    "<h3>Groupes</h3>",
    `<ul>${model.copyGroups.map((group) => `<li><strong>${escapeHtml(group.label)}</strong> (${group.copyCount}) - ${escapeHtml(group.coachFacingMeaning)}</li>`).join("")}</ul>`,
    "<h3>Cas compatible - non accepte</h3>",
    `<ul>${copyCard(model.compatibleCopy)}</ul>`,
    copySection("Messages d'erreur", model.errorCopies),
    copySection("Messages blockers", model.blockerCopies),
    copySection("Messages refusals", model.refusalCopies),
    '<p class="guardrail-note">Copy de lecture uniquement : aucun payload lu, cree ou accepte; aucune preview reelle; aucun submit, API, backend, stockage, official truth, decision, selection, tactique, score ou timeline.</p>',
    "</section>",
  ].join("\n");
}

export function insertManualReviewPreviewPayloadDryRunCoachFacingErrorCopyProduct9E(productHtml: string, section: string): string {
  if (productHtml.includes('id="manual-review-preview-payload-dry-run-coach-facing-error-copy-9e"')) return productHtml;
  const anchor = 'id="manual-review-export-metadata-badge-cleanup-9d"';
  const sectionEnd = "</section>";
  const index = productHtml.indexOf(anchor);
  if (index !== -1) {
    const end = productHtml.indexOf(sectionEnd, index);
    if (end !== -1) {
      const insertAt = end + sectionEnd.length;
      return `${productHtml.slice(0, insertAt)}\n${section}\n${productHtml.slice(insertAt)}`;
    }
  }
  return productHtml.includes("</main>")
    ? productHtml.replace("</main>", `${section}\n</main>`)
    : `${productHtml}\n${section}`;
}
