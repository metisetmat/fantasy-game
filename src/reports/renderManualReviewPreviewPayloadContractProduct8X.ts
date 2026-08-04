import { escapeHtml } from "./htmlCoachReport";
import type { ManualReviewPreviewPayloadContract8X } from "./manualReviewPreviewPayloadContractTypes8X";

function renderList(items: readonly string[]): string {
  return [
    "<ul>",
    ...items.map((item) => `<li>${escapeHtml(item)}</li>`),
    "</ul>",
  ].join("\n");
}

export function renderManualReviewPreviewPayloadContractProduct8X(
  contract: ManualReviewPreviewPayloadContract8X,
): string {
  return [
    '<section id="manual-review-preview-payload-contract-8x" class="premium-section manual-review-preview-payload-contract-8x" data-manual-review-preview-payload-contract-version="8X">',
    "<h2>Contrat du payload preview-only</h2>",
    '<p class="eyebrow">payload preview-only documente - aucune instance creee - aucun stockage</p>',
    "<p>Cette section decrit la forme future du payload de revue manuelle. Elle ne cree pas de payload reel, ne traite aucun champ actif, ne genere aucune preview reelle et ne promeut jamais une note coach en verite officielle.</p>",
    '<article class="product-card manual-review-preview-payload-summary-8x">',
    "<h3>Etat 8X</h3>",
    `<p><strong>Statut contrat :</strong> ${escapeHtml(contract.payloadContractStatus)}.</p>`,
    `<p><strong>Source :</strong> ${escapeHtml(contract.payloadSource)}; <strong>scope :</strong> ${escapeHtml(contract.payloadScope)}; <strong>persistence :</strong> ${escapeHtml(contract.payloadPersistence)}; <strong>application :</strong> ${escapeHtml(contract.payloadApplication)}.</p>`,
    `<p><strong>Schema :</strong> ${contract.allowedTopLevelFields.length} champs autorises, ${contract.forbiddenTopLevelFields.length} champs interdits, ${contract.observationEntries.length} exemples d'entree, ${contract.validationRules.length} regles futures inactives.</p>`,
    '<p class="guard">Contrat uniquement. Pas de vrai payload, pas de preview reelle, pas de submit, pas d API, pas de backend, pas de stockage, pas de decision automatique, pas de selection et pas de consigne tactique.</p>',
    "</article>",
    '<article class="product-card manual-review-preview-payload-fields-8x">',
    "<h3>Champs autorises du payload futur</h3>",
    "<ul>",
    ...contract.allowedTopLevelFields.map((field) => `<li><strong>${escapeHtml(field.name)} :</strong> ${escapeHtml(field.description)}</li>`),
    "</ul>",
    "</article>",
    '<article class="product-card manual-review-preview-payload-forbidden-8x">',
    "<h3>Champs interdits</h3>",
    renderList(contract.forbiddenTopLevelFields),
    "</article>",
    '<article class="product-card manual-review-preview-payload-groups-8x">',
    "<h3>Groupes et exemples d'observation</h3>",
    "<div class=\"product-card-grid\">",
    ...contract.fieldGroups.map((group) => [
      '<article class="product-card manual-review-preview-payload-group-8x">',
      `<h4>${escapeHtml(group.label)}</h4>`,
      `<p>${escapeHtml(group.purpose)}</p>`,
      `<p><strong>Champs :</strong> ${escapeHtml(group.fields.join(", "))}.</p>`,
      "</article>",
    ].join("\n")),
    "</div>",
    "<ul>",
    ...contract.observationEntries.map((entry) => `<li><strong>${escapeHtml(entry.entryId)} :</strong> ${escapeHtml(entry.previewOnlyMeaning)}</li>`),
    "</ul>",
    "</article>",
    '<article class="product-card manual-review-preview-payload-rules-8x">',
    "<h3>Regles futures inactives et error states</h3>",
    `<p>${contract.validationRules.length} regles sont documentees et toutes inactives en 8X; ${contract.errorStates.length} error states sont documentes et tous inactifs en 8X.</p>`,
    "<ul>",
    ...contract.validationRules.slice(0, 8).map((rule) => `<li><strong>${escapeHtml(rule.ruleId)} :</strong> ${escapeHtml(rule.futurePurpose)}</li>`),
    "</ul>",
    "</article>",
    '<article class="product-card manual-review-preview-payload-boundaries-8x">',
    "<h3>Refus et boundary guards</h3>",
    `<p>${contract.refusalStates.length} refusal states et ${contract.boundaryGuards.length} boundary guards gardent le payload hors execution.</p>`,
    "<ul>",
    ...contract.boundaryGuards.map((guard) => `<li><strong>${escapeHtml(guard.guardId)} :</strong> ${escapeHtml(guard.blocks)}</li>`),
    "</ul>",
    "</article>",
    "</section>",
  ].join("\n");
}

function findBalancedSectionEnd(html: string, markerIndex: number): number {
  const sectionStart = html.lastIndexOf("<section", markerIndex);
  if (sectionStart < 0) return -1;
  const pattern = /<\/?section\b[^>]*>/giu;
  let depth = 0;
  for (const match of html.slice(sectionStart).matchAll(pattern)) {
    const tag = match[0];
    const absoluteEnd = sectionStart + (match.index ?? 0) + tag.length;
    if (tag.startsWith("</")) {
      depth -= 1;
      if (depth === 0) return absoluteEnd;
    } else {
      depth += 1;
    }
  }
  return -1;
}

export function insertManualReviewPreviewPayloadContractProduct8X(productHtml: string, section: string): string {
  if (productHtml.includes('id="manual-review-preview-payload-contract-8x"')) return productHtml;
  const activationIndex = productHtml.indexOf('id="manual-review-preview-activation-guards-8w"');
  if (activationIndex >= 0) {
    const insertAt = findBalancedSectionEnd(productHtml, activationIndex);
    if (insertAt >= 0) return `${productHtml.slice(0, insertAt)}\n${section}${productHtml.slice(insertAt)}`;
  }
  return productHtml.includes("</main>")
    ? productHtml.replace("</main>", `${section}\n</main>`)
    : `${productHtml}\n${section}`;
}
