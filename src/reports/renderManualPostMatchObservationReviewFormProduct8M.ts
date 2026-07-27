import { escapeHtml } from "./htmlCoachReport";
import {
  observationOutcomeCards8L,
  postMatchOutcomeOptions8L,
} from "./renderSeasonlessLearningLoopProduct8L";
import type {
  ManualContextComparableField8M,
  ManualCoachNotesField8M,
  ManualEvidenceCountField8M,
  ManualObservationReviewSection8M,
  ManualOutcomeOption8M,
  ManualPostMatchObservationReviewForm8M,
  ManualPostMatchReviewBoundary8M,
} from "./manualPostMatchObservationReviewFormTypes8M";

export const manualOutcomeOptions8M: readonly ManualOutcomeOption8M[] = postMatchOutcomeOptions8L.map((option) => ({
  outcomeId: option.outcomeId,
  label: option.label,
  coachMeaning: option.meaning,
  manualOnlyBoundary: "A cocher seulement apres lecture manuelle du match joue.",
}));

const evidenceFields8M: readonly ManualEvidenceCountField8M[] = [
  {
    fieldId: "comparable-situations-count-8m",
    label: "Nombre de situations comparables observees",
    expectedFormat: "nombre entier",
    blankValue: "",
    minimumComparableCount: 2,
  },
  {
    fieldId: "positive-signal-count-8m",
    label: "Signaux allant dans le sens de l'observation",
    expectedFormat: "nombre entier",
    blankValue: "",
    minimumComparableCount: 1,
  },
  {
    fieldId: "opposite-signal-count-8m",
    label: "Signaux allant contre l'observation",
    expectedFormat: "nombre entier",
    blankValue: "",
    minimumComparableCount: 0,
  },
];

const contextFields8M: readonly ManualContextComparableField8M[] = [
  {
    fieldId: "pressure-context-comparable-8m",
    label: "Pression comparable",
    comparableQuestion: "La pression etait-elle proche du contexte observe en 8L ?",
    blankValue: "",
  },
  {
    fieldId: "score-context-comparable-8m",
    label: "Score et moment comparables",
    comparableQuestion: "Le score, la minute et le risque etaient-ils comparables ?",
    blankValue: "",
  },
];

const notesFields8M: readonly ManualCoachNotesField8M[] = [
  {
    fieldId: "manual-coach-notes-8m",
    label: "Notes coach",
    prompt: "Noter les faits vus, pas une conclusion automatique.",
    blankValue: "",
    maxLines: 4,
  },
];

export const manualPostMatchBoundaries8M: readonly ManualPostMatchReviewBoundary8M[] = [
  {
    boundaryId: "manual-only-no-submit-8m",
    label: "Manuel uniquement",
    text: "Cette section est une aide de revue; elle ne calcule pas de resultat et ne transmet aucune reponse.",
    blocks: ["auto_classification", "persistence", "future_evidence_claim"],
    visibleInProduct: true,
    visibleInExport: true,
  },
  {
    boundaryId: "no-memory-no-storage-8m",
    label: "Sans memoire",
    text: "Les champs restent vides dans le rapport genere et ne creent pas de suivi durable.",
    blocks: ["season_memory", "persistence"],
    visibleInProduct: true,
    visibleInExport: true,
  },
  {
    boundaryId: "no-selection-or-tactic-8m",
    label: "Sans consigne",
    text: "La revue aide a observer; elle ne choisit pas une composition et ne fixe pas une tactique.",
    blocks: ["selection_instruction", "tactical_instruction", "sandbox_promotion"],
    visibleInProduct: true,
    visibleInExport: true,
  },
];

export function buildManualPostMatchObservationReviewForm8M(input: {
  readonly source8LTrackerId: string;
}): ManualPostMatchObservationReviewForm8M {
  return {
    formId: "manual-post-match-review-form-8m",
    version: "MANUAL_POST_MATCH_OBSERVATION_REVIEW_FORM_8M",
    sourceSprint: "8L",
    source8LTrackerId: input.source8LTrackerId,
    state: "pending_blank_manual_only",
    sections: observationOutcomeCards8L.map((card) => ({
      sectionId: `manual-review-${card.observationCardId.replace(/^outcome-/u, "")}`,
      linked8LObservationCardId: card.observationCardId,
      linked8KDecisionCardId: card.linked8KDecisionCardId,
      title: card.title,
      status: "pending",
      sourceObservation: card.manualReviewQuestion,
      reviewPrompt: "A remplir uniquement apres le prochain match, en s'appuyant sur des faits comparables.",
      outcomeOptions: manualOutcomeOptions8M,
      evidenceCountFields: evidenceFields8M,
      contextComparableFields: contextFields8M,
      coachNotesFields: notesFields8M,
      caution: card.cautionNote,
      noDefaultCheckedOutcome: true,
      noAutomaticOutcome: true,
    })),
    boundaries: manualPostMatchBoundaries8M,
    notPersisted: true,
    noSubmitAction: true,
    noAutomaticClassification: true,
  };
}

function renderOutcomeOption(section: ManualObservationReviewSection8M, option: ManualOutcomeOption8M): string {
  const id = `${section.sectionId}-${option.outcomeId}`;
  return [
    `<label class="manual-option manual-outcome-option-8m" for="${escapeHtml(id)}">`,
    `<input id="${escapeHtml(id)}" type="checkbox" name="${escapeHtml(section.sectionId)}-outcome" value="${escapeHtml(option.outcomeId)}" />`,
    `<span><strong>${escapeHtml(option.label)}</strong> - ${escapeHtml(option.coachMeaning)}</span>`,
    "</label>",
  ].join("");
}

function renderEvidenceField(section: ManualObservationReviewSection8M, field: ManualEvidenceCountField8M): string {
  const id = `${section.sectionId}-${field.fieldId}`;
  return [
    `<label class="manual-field manual-evidence-count-field-8m" for="${escapeHtml(id)}">`,
    `<span>${escapeHtml(field.label)}</span>`,
    `<input id="${escapeHtml(id)}" type="text" readonly value="${field.blankValue}" placeholder="${escapeHtml(field.expectedFormat)}" />`,
    "</label>",
  ].join("");
}

function renderContextField(section: ManualObservationReviewSection8M, field: ManualContextComparableField8M): string {
  const id = `${section.sectionId}-${field.fieldId}`;
  return [
    `<label class="manual-field manual-context-comparable-field-8m" for="${escapeHtml(id)}">`,
    `<span>${escapeHtml(field.label)}</span>`,
    `<textarea id="${escapeHtml(id)}" readonly rows="2" placeholder="${escapeHtml(field.comparableQuestion)}">${field.blankValue}</textarea>`,
    "</label>",
  ].join("");
}

function renderNotesField(section: ManualObservationReviewSection8M, field: ManualCoachNotesField8M): string {
  const id = `${section.sectionId}-${field.fieldId}`;
  return [
    `<label class="manual-field manual-coach-notes-field-8m" for="${escapeHtml(id)}">`,
    `<span>${escapeHtml(field.label)}</span>`,
    `<textarea id="${escapeHtml(id)}" readonly rows="${field.maxLines}" placeholder="${escapeHtml(field.prompt)}">${field.blankValue}</textarea>`,
    "</label>",
  ].join("");
}

function renderReviewSection(section: ManualObservationReviewSection8M): string {
  return [
    `<article class="product-card manual-review-section-8m" data-review-section-status="${escapeHtml(section.status)}" data-linked-8l-card-id="${escapeHtml(section.linked8LObservationCardId)}" data-linked-8k-card-id="${escapeHtml(section.linked8KDecisionCardId)}">`,
    `<p class="eyebrow">Statut : pending / blank / not_evaluated</p>`,
    `<h3>${escapeHtml(section.title)}</h3>`,
    `<p><strong>Observation 8L :</strong> ${escapeHtml(section.sourceObservation)}</p>`,
    `<p><strong>Consigne de remplissage :</strong> ${escapeHtml(section.reviewPrompt)}</p>`,
    `<div class="manual-options">${section.outcomeOptions.map((option) => renderOutcomeOption(section, option)).join("")}</div>`,
    `<div class="manual-field-grid">${section.evidenceCountFields.map((field) => renderEvidenceField(section, field)).join("")}</div>`,
    `<div class="manual-field-grid">${section.contextComparableFields.map((field) => renderContextField(section, field)).join("")}</div>`,
    `<div class="manual-field-grid">${section.coachNotesFields.map((field) => renderNotesField(section, field)).join("")}</div>`,
    `<p class="guard manual-caution-8m"><strong>Prudence :</strong> ${escapeHtml(section.caution)}</p>`,
    "</article>",
  ].join("");
}

export function renderManualPostMatchObservationReviewFormProduct8M(input: {
  readonly source8LTrackerId?: string;
} = {}): string {
  const form = buildManualPostMatchObservationReviewForm8M({
    source8LTrackerId: input.source8LTrackerId ?? "seasonless-observation-outcome-tracker-8l",
  });
  return [
    `<section id="manual-post-match-review-form-8m" class="premium-section manual-post-match-review-form-8m" data-manual-review-form-version="8M">`,
    "<h2>Formulaire manuel de revue post-match</h2>",
    "<p class=\"eyebrow\">A remplir uniquement apres le prochain match</p>",
    "<p>Ce formulaire transforme les trois observations 8L en cases et champs vides pour une revue humaine apres match. Il ne classe rien, ne sauvegarde rien et ne modifie aucune preuve officielle.</p>",
    `<div class="product-card-grid">${form.sections.map(renderReviewSection).join("")}</div>`,
    "<h3>Frontieres de la revue</h3>",
    `<div class="product-card-grid">${form.boundaries.map((boundary) => `<article class="product-card manual-review-boundary-8m"><h3>${escapeHtml(boundary.label)}</h3><p>${escapeHtml(boundary.text)}</p></article>`).join("")}</div>`,
    "</section>",
  ].join("\n");
}

function findBalancedSectionEndFromStart(html: string, sectionStart: number): number {
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

export function insertManualPostMatchObservationReviewFormProduct8M(productHtml: string): string {
  if (productHtml.includes('id="manual-post-match-review-form-8m"')) return productHtml;
  const section = renderManualPostMatchObservationReviewFormProduct8M();
  const learningLoopIndex = productHtml.indexOf('id="seasonless-learning-loop-8l"');
  if (learningLoopIndex >= 0) {
    const insertAt = findBalancedSectionEndFromStart(productHtml, productHtml.lastIndexOf("<section", learningLoopIndex));
    if (insertAt >= 0) {
      return `${productHtml.slice(0, insertAt)}\n${section}${productHtml.slice(insertAt)}`;
    }
  }
  return productHtml.includes("</main>")
    ? productHtml.replace("</main>", `${section}\n</main>`)
    : `${productHtml}\n${section}`;
}
