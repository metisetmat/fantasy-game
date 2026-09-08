import type {
  ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JGroupView,
  ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JLevel,
} from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureTypes9J";

const PRODUCT_9I_SECTION_ID = "manual-review-preview-payload-dry-run-export-budget-cushion-9i";

function escapeHtml(value: string): string {
  return value
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;");
}

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

function insertAfterSectionById(html: string, id: string, addition: string): string {
  const range = findElementRangeById(html, id);
  if (range === null) {
    const mainEnd = html.lastIndexOf("</main>");
    return mainEnd < 0 ? `${html}\n${addition}` : `${html.slice(0, mainEnd)}${addition}\n${html.slice(mainEnd)}`;
  }
  return `${html.slice(0, range.end)}\n${addition}${html.slice(range.end)}`;
}

function renderTechnicalRefs(groupView: ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JGroupView): string {
  const refs = groupView.technicalReferenceIds;
  return [
    "<ul>",
    `<li>copy ids: ${escapeHtml(refs.copyIds.join(", ") || "none")}</li>`,
    `<li>source error ids: ${escapeHtml(refs.sourceErrorIds.join(", ") || "none")}</li>`,
    `<li>blocker ids: ${escapeHtml(refs.blockerIds.join(", ") || "none")}</li>`,
    `<li>refusal ids: ${escapeHtml(refs.refusalIds.join(", ") || "none")}</li>`,
    `<li>boundary guards: ${escapeHtml(refs.boundaryGuardIds.join(", ") || "none")}</li>`,
    `<li>source sprints: ${escapeHtml(refs.sourceSprintIds.join(", "))}</li>`,
    `<li>no-runtime flags: ${escapeHtml(refs.noRuntimeFlagIds.join(", "))}</li>`,
    "</ul>",
  ].join("\n");
}

export function renderManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureProduct9J(input: {
  readonly levels: readonly ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JLevel[];
  readonly groupViews: readonly ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JGroupView[];
  readonly exportReadTimeSecondsBefore9J: number;
  readonly exportReadTimeSecondsAfter9J: number;
  readonly exportBudgetCushionSecondsAfter9J: number;
}): string {
  const levelRows = input.levels
    .map(
      (level) =>
        `<tr><td>${escapeHtml(level.levelName)}</td><td>${escapeHtml(level.coachFacingPurpose)}</td><td>${escapeHtml(level.defaultState)}</td><td>${level.containsTechnicalIds ? "oui" : "non"}</td></tr>`,
    )
    .join("\n");
  const groupCards = input.groupViews
    .map((groupView) =>
      [
        `<article class="detail-card" data-9j-group="${escapeHtml(groupView.groupId)}">`,
        `<h3>${escapeHtml(groupView.label)}</h3>`,
        `<p>${escapeHtml(groupView.summaryText)}</p>`,
        `<p>${escapeHtml(groupView.coachDetailText)}</p>`,
        `<p><strong>Frontiere protegee :</strong> ${escapeHtml(groupView.protectedBoundary)}</p>`,
        `<p><strong>Correction future possible :</strong> ${escapeHtml(groupView.futureCorrectionSummary)}</p>`,
        `<p><strong>Reste interdit :</strong> ${escapeHtml(groupView.stillForbiddenSummary)}</p>`,
        "<details>",
        "<summary>References techniques repliees</summary>",
        renderTechnicalRefs(groupView),
        "</details>",
        "</article>",
      ].join("\n"),
    )
    .join("\n");

  return [
    '<section id="manual-review-preview-payload-dry-run-error-copy-progressive-disclosure-9j" class="product-section manual-review-preview-payload-dry-run-error-copy-progressive-disclosure-9j" data-manual-review-preview-payload-dry-run-error-copy-progressive-disclosure-version="9J">',
    '<p class="eyebrow">Manual review 9J</p>',
    "<h2>Progressive disclosure des erreurs dry-run</h2>",
    '<p class="guard">Lecture read-only : runtime inactive, payload accepte 0, preview reelle false, aucune persistence, non official truth, aucune selection ni tactique, aucune mutation score ou timeline.</p>',
    '<section class="detail-card">',
    "<h3>Niveau 1 - Synthese</h3>",
    "<p>5 groupes UX; 19 error copies; 12 blockers; 8 refusals; 1 cas compatible non accepte; coverage 19/12/14/8; warning contradiction 0.</p>",
    "</section>",
    '<section class="detail-card">',
    "<h3>Niveaux de lecture</h3>",
    "<table><thead><tr><th>Niveau</th><th>But coach</th><th>Etat initial</th><th>IDs techniques</th></tr></thead><tbody>",
    levelRows,
    "</tbody></table>",
    "</section>",
    '<section class="detail-card-grid" aria-label="Details coach-facing par groupe">',
    groupCards,
    "</section>",
    '<p class="guard">Cette section n est pas un formulaire, pas un validateur et pas une decision prete; elle explique seulement les erreurs dry-run par niveaux.</p>',
    `<p class="microcopy">Budget export: ${input.exportReadTimeSecondsBefore9J}s avant 9J, ${input.exportReadTimeSecondsAfter9J}s apres 9J, cushion ${input.exportBudgetCushionSecondsAfter9J}s.</p>`,
    "</section>",
  ].join("\n");
}

export function insertManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureProduct9J(
  html: string,
  input: {
    readonly levels: readonly ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JLevel[];
    readonly groupViews: readonly ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JGroupView[];
    readonly exportReadTimeSecondsBefore9J: number;
    readonly exportReadTimeSecondsAfter9J: number;
    readonly exportBudgetCushionSecondsAfter9J: number;
  },
): string {
  return insertAfterSectionById(html, PRODUCT_9I_SECTION_ID, renderManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureProduct9J(input));
}
