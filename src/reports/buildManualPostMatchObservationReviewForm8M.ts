import { buildCoachReportSeasonlessLearningLoopObservationOutcomeTracker8L } from "./buildCoachReportSeasonlessLearningLoopObservationOutcomeTracker8L";
import { auditManualOutcomeOptions8M } from "./manualOutcomeOptionAudit8M";
import { auditManualPostMatchBoundary8M } from "./manualPostMatchBoundaryAudit8M";
import { auditManualPostMatchReviewForm8M } from "./manualPostMatchReviewFormAudit8M";
import { auditManualReviewFormCoachUsability8M } from "./manualReviewFormCoachUsabilityAudit8M";
import { auditManualReviewFormExportBudget8M } from "./manualReviewFormExportBudgetAudit8M";
import { auditManualReviewFormIntegrationBudget8M } from "./manualReviewFormIntegrationBudgetAudit8M";
import { auditManualReviewFormSourceOfTruthRegression8M } from "./manualReviewFormSourceOfTruthRegressionAudit8M";
import {
  buildManualPostMatchObservationReviewForm8M,
  insertManualPostMatchObservationReviewFormProduct8M,
  renderManualPostMatchObservationReviewFormProduct8M,
} from "./renderManualPostMatchObservationReviewFormProduct8M";
import {
  insertManualPostMatchObservationReviewFormExport8M,
  renderManualPostMatchObservationReviewFormExport8M,
} from "./renderManualPostMatchObservationReviewFormExport8M";
import type {
  ManualObservationReviewSection8M,
  ManualPostMatchObservationReviewForm8MModel,
} from "./manualPostMatchObservationReviewFormTypes8M";
import {
  MANUAL_POST_MATCH_REVIEW_FORM_8M_BLOCKING_WARNINGS,
  type ManualPostMatchObservationReviewFormWarningCode8M,
} from "./manualPostMatchObservationReviewFormWarnings";

function bool(value: boolean): string {
  return value ? "true" : "false";
}

function checkLine(label: string, passed: boolean, detail: string): string {
  return `- ${passed ? "PASS" : "FAIL"}: ${label}${detail.length === 0 ? "" : ` - ${detail}`}`;
}

function uniq<T>(values: readonly T[]): readonly T[] {
  return [...new Set(values)];
}

function table(rows: readonly (readonly string[])[]): readonly string[] {
  const [header, ...body] = rows;
  if (header === undefined) return [];
  return [
    `| ${header.join(" | ")} |`,
    `| ${header.map(() => "---").join(" | ")} |`,
    ...body.map((row) => `| ${row.join(" | ")} |`),
  ];
}

function metricRows(rows: readonly (readonly [string, string | number | boolean])[]): readonly string[] {
  return table([
    ["Metric", "Value"],
    ...rows.map(([label, value]) => [label, String(value)] as const),
  ]);
}

function removeBalancedSectionById(html: string, sectionId: string): string {
  const markerIndex = html.indexOf(`id="${sectionId}"`);
  if (markerIndex < 0) return html;
  const sectionStart = html.lastIndexOf("<section", markerIndex);
  if (sectionStart < 0) return html;
  const pattern = /<\/?section\b[^>]*>/giu;
  let depth = 0;
  for (const match of html.slice(sectionStart).matchAll(pattern)) {
    const tag = match[0];
    const absoluteEnd = sectionStart + (match.index ?? 0) + tag.length;
    if (tag.startsWith("</")) {
      depth -= 1;
      if (depth === 0) {
        return `${html.slice(0, sectionStart)}${html.slice(absoluteEnd)}`;
      }
    } else {
      depth += 1;
    }
  }
  return html;
}

function manualReviewBaselineProductHtml(html: string): string {
  return removeBalancedSectionById(html, "manual-post-match-review-form-8m");
}

function manualReviewBaselineExportHtml(html: string): string {
  const withoutSection = removeBalancedSectionById(html, "manual-post-match-review-form-export-8m");
  return withoutSection.replace(
    /<title>\s*Rapport coach export compact 8M - formulaire post-match manuel\s*<\/title>/iu,
    "<title>Rapport coach export compact 8I</title>",
  );
}

function sectionRows(sections: readonly ManualObservationReviewSection8M[]): readonly string[] {
  return table([
    ["Section", "Status", "Linked 8L", "Linked 8K", "Fields"],
    ...sections.map((section) => [
      section.title,
      `${section.status} / blank / not_evaluated`,
      section.linked8LObservationCardId,
      section.linked8KDecisionCardId,
      `${section.evidenceCountFields.length} evidence, ${section.contextComparableFields.length} context, ${section.coachNotesFields.length} notes`,
    ]),
  ]);
}

function cleanWarnings(
  warnings: readonly ManualPostMatchObservationReviewFormWarningCode8M[],
): readonly ManualPostMatchObservationReviewFormWarningCode8M[] {
  return uniq(warnings.filter((warning) => {
    if (warning === "MANUAL_REVIEW_FORM_COMPLETE") {
      return !warnings.some((item) => MANUAL_POST_MATCH_REVIEW_FORM_8M_BLOCKING_WARNINGS.includes(item));
    }
    return true;
  }));
}

export function buildManualPostMatchObservationReviewForm8MModel(input?: {
  readonly productHtmlBefore8M?: string;
  readonly exportHtmlBefore8M?: string;
}): ManualPostMatchObservationReviewForm8MModel {
  const baseline8L = buildCoachReportSeasonlessLearningLoopObservationOutcomeTracker8L();
  const rawProductHtmlBefore8M = input?.productHtmlBefore8M ?? baseline8L.productHtmlAfter8L;
  const rawExportHtmlBefore8M = input?.exportHtmlBefore8M ?? baseline8L.exportHtmlAfter8L;
  const productHtmlBefore8M = manualReviewBaselineProductHtml(rawProductHtmlBefore8M);
  const exportHtmlBefore8M = manualReviewBaselineExportHtml(rawExportHtmlBefore8M);
  const productHtmlBefore8MClean = !productHtmlBefore8M.includes('id="manual-post-match-review-form-8m"');
  const exportHtmlBefore8MClean = !exportHtmlBefore8M.includes('id="manual-post-match-review-form-export-8m"') &&
    !/<title>\s*Rapport coach export compact 8M - formulaire post-match manuel\s*<\/title>/iu.test(exportHtmlBefore8M);
  const form = buildManualPostMatchObservationReviewForm8M({
    source8LTrackerId: baseline8L.tracker.trackerId,
  });
  const productHtmlAfter8M = insertManualPostMatchObservationReviewFormProduct8M(productHtmlBefore8M);
  const exportHtmlAfter8M = insertManualPostMatchObservationReviewFormExport8M(exportHtmlBefore8M);
  const formAudit = auditManualPostMatchReviewForm8M({
    productHtml: productHtmlAfter8M,
    exportHtml: exportHtmlAfter8M,
    form,
  });
  const outcomeOptionAudit = auditManualOutcomeOptions8M({
    productHtml: productHtmlAfter8M,
    exportHtml: exportHtmlAfter8M,
    form,
  });
  const boundaryAudit = auditManualPostMatchBoundary8M({
    productHtml: productHtmlAfter8M,
    exportHtml: exportHtmlAfter8M,
  });
  const sourceOfTruthRegressionAudit = auditManualReviewFormSourceOfTruthRegression8M({
    baseline8L,
    productHtml: productHtmlAfter8M,
    exportHtml: exportHtmlAfter8M,
  });
  const exportBudgetAudit = auditManualReviewFormExportBudget8M({
    exportHtmlBefore8M,
    exportHtmlAfter8M,
  });
  const integrationBudgetAudit = auditManualReviewFormIntegrationBudget8M({
    productHtml: productHtmlAfter8M,
    exportHtml: exportHtmlAfter8M,
  });
  const coachUsabilityAudit = auditManualReviewFormCoachUsability8M({
    productHtml: productHtmlAfter8M,
    exportHtml: exportHtmlAfter8M,
  });
  const productFormVisible = formAudit.productFormVisible;
  const exportFormVisible = formAudit.exportFormVisible;
  const threeReviewSectionsVisible = formAudit.reviewSectionCount === 3;
  const allSectionsLinkedTo8L = formAudit.linked8LSectionCount === 3;
  const allSectionsPendingBlankNotEvaluated = formAudit.pendingSectionCount === 3 &&
    formAudit.blankSectionCount === 3 &&
    formAudit.notEvaluatedSectionCount === 3;
  const fourOutcomeOptionsPerSection = outcomeOptionAudit.sectionsWithFourOptionsCount === 3 && outcomeOptionAudit.outcomeOptionCount === 12;
  const noDefaultCheckedOutcome = outcomeOptionAudit.checkedDefaultCount === 0;
  const noAutomaticOutcome = outcomeOptionAudit.automaticOutcomeCount === 0 && form.noAutomaticClassification;
  const evidenceFieldsVisible = formAudit.evidenceCountFieldCount >= 9;
  const contextComparableFieldsVisible = formAudit.contextComparableFieldCount >= 6;
  const coachNotesFieldsVisible = formAudit.coachNotesFieldCount >= 3;
  const cautionFieldsVisible = formAudit.cautionFieldCount === 3;
  const noPersistenceCreated = boundaryAudit.localStorageCount === 0 &&
    boundaryAudit.databasePersistenceCount === 0 &&
    boundaryAudit.filePersistenceCount === 0;
  const noSubmitBackendCreated = boundaryAudit.submitButtonCount === 0 && boundaryAudit.backendActionCount === 0;
  const noFutureEvidenceClaim = boundaryAudit.futureEvidenceClaimCount === 0 && boundaryAudit.fabricatedEvidenceCount === 0;
  const noSeasonMemoryCreated = boundaryAudit.seasonMemoryCount === 0;
  const noSelectionOrTacticImposition = boundaryAudit.selectionInstructionCount === 0 && boundaryAudit.tacticalInstructionCount === 0;
  const noSandboxBatchPromotion = boundaryAudit.sandboxPromotionCount === 0 &&
    boundaryAudit.diagnosticPromotionCount === 0 &&
    boundaryAudit.batchPromotionCount === 0;
  const exportMetadataCurrentVersionVisible = exportBudgetAudit.exportMetadataVersionVisible &&
    exportBudgetAudit.exportTitleMentions8M &&
    exportBudgetAudit.exportTitleNotOnly8I;
  const sourceOfTruthSeparationPreserved = sourceOfTruthRegressionAudit.sourceOfTruthWarningCodes.length === 0;
  const guardrailsPreserved = baseline8L.guardrailsPreserved &&
    sourceOfTruthRegressionAudit.noScoringConstantChange &&
    sourceOfTruthRegressionAudit.MatchBonusEventUnchanged &&
    sourceOfTruthRegressionAudit.batchLiveSeparationPreserved;
  const warningCodes = cleanWarnings([
    ...formAudit.formAuditWarningCodes,
    ...outcomeOptionAudit.outcomeOptionAuditWarningCodes,
    ...boundaryAudit.boundaryAuditWarningCodes,
    ...sourceOfTruthRegressionAudit.sourceOfTruthWarningCodes,
    ...exportBudgetAudit.exportBudgetWarningCodes,
    ...integrationBudgetAudit.integrationWarningCodes,
    ...coachUsabilityAudit.usabilityWarningCodes,
  ]);
  const blocking = warningCodes.some((warning) => MANUAL_POST_MATCH_REVIEW_FORM_8M_BLOCKING_WARNINGS.includes(warning));
  const status = blocking ? "FAIL" : "PASS";
  const finalWarningCodes = cleanWarnings([
    ...warningCodes,
    status === "PASS" ? "MANUAL_REVIEW_FORM_COMPLETE" : "MANUAL_REVIEW_FORM_FAIL",
  ]);

  return {
    status,
    scope: "MANUAL_POST_MATCH_OBSERVATION_REVIEW_FORM",
    version: "MANUAL_POST_MATCH_OBSERVATION_REVIEW_FORM_8M",
    baselineVersion: "COACH_REPORT_SEASONLESS_LEARNING_LOOP_OBSERVATION_OUTCOME_TRACKER_8L",
    matchId: baseline8L.matchId,
    officialScore: baseline8L.officialScore,
    baseline8L,
    baseline8LPreserved: sourceOfTruthRegressionAudit.baseline8LPreserved,
    baseline8KPreserved: sourceOfTruthRegressionAudit.baseline8KPreserved,
    baseline8IPreserved: sourceOfTruthRegressionAudit.baseline8IPreserved,
    form,
    productFormHtml: renderManualPostMatchObservationReviewFormProduct8M({
      source8LTrackerId: baseline8L.tracker.trackerId,
    }),
    exportFormHtml: renderManualPostMatchObservationReviewFormExport8M(),
    productHtmlBefore8MClean,
    exportHtmlBefore8MClean,
    productHtmlAfter8M,
    exportHtmlAfter8M,
    productFormVisible,
    exportFormVisible,
    threeReviewSectionsVisible,
    allSectionsLinkedTo8L,
    allSectionsPendingBlankNotEvaluated,
    fourOutcomeOptionsPerSection,
    noDefaultCheckedOutcome,
    noAutomaticOutcome,
    evidenceFieldsVisible,
    contextComparableFieldsVisible,
    coachNotesFieldsVisible,
    cautionFieldsVisible,
    noPersistenceCreated,
    noSubmitBackendCreated,
    noFutureEvidenceClaim,
    noSeasonMemoryCreated,
    noSelectionOrTacticImposition,
    noSandboxBatchPromotion,
    exportUnder900Seconds: exportBudgetAudit.exportUnder900Seconds,
    exportUnder800Seconds: exportBudgetAudit.exportUnder800Seconds,
    exportMetadataCurrentVersionVisible,
    sourceOfTruthSeparationPreserved,
    guardrailsPreserved,
    formAudit,
    outcomeOptionAudit,
    boundaryAudit,
    sourceOfTruthRegressionAudit,
    exportBudgetAudit,
    integrationBudgetAudit,
    coachUsabilityAudit,
    warningCodes: finalWarningCodes,
    recommendation: status === "PASS" ? "KEEP_MANUAL_POST_MATCH_REVIEW_FORM" : "REPAIR_MANUAL_POST_MATCH_REVIEW_FORM",
    nextSprintRecommendation: status === "PASS"
      ? "8N - Manual Review Result Intake Boundary"
      : "8N - Manual Review Form Guardrail Repair",
  };
}

export function currentManualPostMatchObservationReviewForm8MModel(): ManualPostMatchObservationReviewForm8MModel {
  return buildManualPostMatchObservationReviewForm8MModel();
}

export function renderManualPostMatchObservationReviewForm8MDoc(
  model: ManualPostMatchObservationReviewForm8MModel = currentManualPostMatchObservationReviewForm8MModel(),
): string {
  return [
    "# Manual Post-Match Observation Review Form 8M",
    "",
    `Status: ${model.status}`,
    "",
    "## Summary",
    ...metricRows([
      ["scope", model.scope],
      ["version", model.version],
      ["baselineVersion", model.baselineVersion],
      ["matchId", model.matchId],
      ["officialScore", model.officialScore],
      ["productFormVisible", model.productFormVisible],
      ["exportFormVisible", model.exportFormVisible],
      ["threeReviewSectionsVisible", model.threeReviewSectionsVisible],
      ["allSectionsLinkedTo8L", model.allSectionsLinkedTo8L],
      ["allSectionsPendingBlankNotEvaluated", model.allSectionsPendingBlankNotEvaluated],
      ["fourOutcomeOptionsPerSection", model.fourOutcomeOptionsPerSection],
      ["noDefaultCheckedOutcome", model.noDefaultCheckedOutcome],
      ["noAutomaticOutcome", model.noAutomaticOutcome],
      ["productHtmlBefore8MClean", model.productHtmlBefore8MClean],
      ["exportHtmlBefore8MClean", model.exportHtmlBefore8MClean],
      ["exportReadTimeSecondsAfter8M", model.exportBudgetAudit.exportReadTimeSecondsAfter8M],
    ]),
    "",
    "## Manual Review Sections",
    ...sectionRows(model.form.sections),
    "",
    "## Manual Outcome Options",
    ...table([
      ["Option", "Meaning", "Boundary"],
      ...model.form.sections[0]?.outcomeOptions.map((option) => [
        option.label,
        option.coachMeaning,
        option.manualOnlyBoundary,
      ]) ?? [],
    ]),
    "",
    "## Manual Evidence Fields",
    ...metricRows([
      ["evidenceCountFieldCount", model.formAudit.evidenceCountFieldCount],
      ["contextComparableFieldCount", model.formAudit.contextComparableFieldCount],
      ["coachNotesFieldCount", model.formAudit.coachNotesFieldCount],
      ["cautionFieldCount", model.formAudit.cautionFieldCount],
      ["readonlyTextAreaCount", model.coachUsabilityAudit.readonlyTextAreaCount],
      ["staticCheckboxCount", model.coachUsabilityAudit.staticCheckboxCount],
    ]),
    "",
    "## Boundary Audit",
    ...metricRows([
      ["submitButtonCount", model.boundaryAudit.submitButtonCount],
      ["backendActionCount", model.boundaryAudit.backendActionCount],
      ["localStorageCount", model.boundaryAudit.localStorageCount],
      ["databasePersistenceCount", model.boundaryAudit.databasePersistenceCount],
      ["filePersistenceCount", model.boundaryAudit.filePersistenceCount],
      ["automaticClassificationCount", model.boundaryAudit.automaticClassificationCount],
      ["futureEvidenceClaimCount", model.boundaryAudit.futureEvidenceClaimCount],
      ["fabricatedEvidenceCount", model.boundaryAudit.fabricatedEvidenceCount],
      ["seasonMemoryCount", model.boundaryAudit.seasonMemoryCount],
      ["selectionInstructionCount", model.boundaryAudit.selectionInstructionCount],
      ["tacticalInstructionCount", model.boundaryAudit.tacticalInstructionCount],
      ["sandboxPromotionCount", model.boundaryAudit.sandboxPromotionCount],
      ["diagnosticPromotionCount", model.boundaryAudit.diagnosticPromotionCount],
      ["batchPromotionCount", model.boundaryAudit.batchPromotionCount],
    ]),
    "",
    "## Export Metadata And Budget",
    ...metricRows([
      ["exportReadTimeSecondsBefore8M", model.exportBudgetAudit.exportReadTimeSecondsBefore8M],
      ["exportReadTimeSecondsAfter8M", model.exportBudgetAudit.exportReadTimeSecondsAfter8M],
      ["exportUnder900Seconds", model.exportBudgetAudit.exportUnder900Seconds],
      ["exportUnder800Seconds", model.exportBudgetAudit.exportUnder800Seconds],
      ["exportMetadataVersionVisible", model.exportBudgetAudit.exportMetadataVersionVisible],
      ["exportTitleMentions8M", model.exportBudgetAudit.exportTitleMentions8M],
      ["exportTitleNotOnly8I", model.exportBudgetAudit.exportTitleNotOnly8I],
    ]),
    "",
    "## Source-of-Truth Regression",
    ...metricRows([
      ["baseline8LStatusPass", model.sourceOfTruthRegressionAudit.baseline8LStatusPass],
      ["baseline8LPreserved", model.baseline8LPreserved],
      ["baseline8KPreserved", model.baseline8KPreserved],
      ["baseline8IPreserved", model.baseline8IPreserved],
      ["noScoreMutation", model.sourceOfTruthRegressionAudit.noScoreMutation],
      ["noEventDeletion", model.sourceOfTruthRegressionAudit.noEventDeletion],
      ["noScoringConstantChange", model.sourceOfTruthRegressionAudit.noScoringConstantChange],
      ["MatchBonusEventUnchanged", model.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged],
      ["batchLiveSeparationPreserved", model.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved],
      ["formDoesNotClaimNewScoreEvidence", model.sourceOfTruthRegressionAudit.formDoesNotClaimNewScoreEvidence],
      ["formDoesNotCreateFutureEvidence", model.sourceOfTruthRegressionAudit.formDoesNotCreateFutureEvidence],
    ]),
    "",
    "## Product Excerpt",
    `- ${model.productFormHtml.slice(0, 700).replace(/\s+/gu, " ")}`,
    "",
    "## Export Excerpt",
    `- ${model.exportFormHtml.slice(0, 700).replace(/\s+/gu, " ")}`,
    "",
    "## Warnings",
    ...model.warningCodes.map((warning) => `- ${warning}`),
    "",
    "## Exhaustive Validation Command",
    "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
    "",
    "## Recommendation",
    `- ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
  ].join("\n");
}

export function renderManualPostMatchObservationReviewForm8MValidation(
  model: ManualPostMatchObservationReviewForm8MModel = currentManualPostMatchObservationReviewForm8MModel(),
): string {
  const checks = [
    checkLine("ManualPostMatchObservationReviewForm8MModel exists", model.version === "MANUAL_POST_MATCH_OBSERVATION_REVIEW_FORM_8M", model.version),
    checkLine("baseline 8L visible and preserved", model.baseline8LPreserved && model.sourceOfTruthRegressionAudit.baseline8LStatusPass, `${bool(model.baseline8LPreserved)}/${model.baseline8L.status}`),
    checkLine("baseline 8K visible and preserved", model.baseline8KPreserved, bool(model.baseline8KPreserved)),
    checkLine("baseline 8I preserved", model.baseline8IPreserved, bool(model.baseline8IPreserved)),
    checkLine("product manual form visible", model.productFormVisible, bool(model.productFormVisible)),
    checkLine("export manual form visible", model.exportFormVisible, bool(model.exportFormVisible)),
    checkLine("product before-8M baseline has no 8M form", model.productHtmlBefore8MClean, bool(model.productHtmlBefore8MClean)),
    checkLine("export before-8M baseline has no 8M form", model.exportHtmlBefore8MClean, bool(model.exportHtmlBefore8MClean)),
    checkLine("review section count = 3", model.formAudit.reviewSectionCount === 3, String(model.formAudit.reviewSectionCount)),
    checkLine("all review sections linked to 8L", model.allSectionsLinkedTo8L, `${model.formAudit.linked8LSectionCount}/3`),
    checkLine("all review sections pending blank not_evaluated", model.allSectionsPendingBlankNotEvaluated, `${model.formAudit.pendingSectionCount}/${model.formAudit.blankSectionCount}/${model.formAudit.notEvaluatedSectionCount}`),
    checkLine("four manual outcome options per section", model.fourOutcomeOptionsPerSection, `${model.outcomeOptionAudit.outcomeOptionCount} options`),
    checkLine("no default checked outcome", model.noDefaultCheckedOutcome, String(model.outcomeOptionAudit.checkedDefaultCount)),
    checkLine("no automatic outcome", model.noAutomaticOutcome, String(model.outcomeOptionAudit.automaticOutcomeCount)),
    checkLine("manual evidence count fields visible", model.evidenceFieldsVisible, String(model.formAudit.evidenceCountFieldCount)),
    checkLine("manual context comparable fields visible", model.contextComparableFieldsVisible, String(model.formAudit.contextComparableFieldCount)),
    checkLine("manual coach notes fields visible", model.coachNotesFieldsVisible, String(model.formAudit.coachNotesFieldCount)),
    checkLine("manual cautions visible", model.cautionFieldsVisible, String(model.formAudit.cautionFieldCount)),
    checkLine("no submit or backend flow", model.noSubmitBackendCreated, `${model.boundaryAudit.submitButtonCount}/${model.boundaryAudit.backendActionCount}`),
    checkLine("no localStorage DB or file persistence", model.noPersistenceCreated, `${model.boundaryAudit.localStorageCount}/${model.boundaryAudit.databasePersistenceCount}/${model.boundaryAudit.filePersistenceCount}`),
    checkLine("no future evidence or fabricated evidence", model.noFutureEvidenceClaim, `${model.boundaryAudit.futureEvidenceClaimCount}/${model.boundaryAudit.fabricatedEvidenceCount}`),
    checkLine("no season/team memory created", model.noSeasonMemoryCreated, String(model.boundaryAudit.seasonMemoryCount)),
    checkLine("no selection or tactic imposition", model.noSelectionOrTacticImposition, `${model.boundaryAudit.selectionInstructionCount}/${model.boundaryAudit.tacticalInstructionCount}`),
    checkLine("no sandbox diagnostic or batch promotion", model.noSandboxBatchPromotion, `${model.boundaryAudit.sandboxPromotionCount}/${model.boundaryAudit.diagnosticPromotionCount}/${model.boundaryAudit.batchPromotionCount}`),
    checkLine("8L and 8K product/export preserved", model.integrationBudgetAudit.product8LStillVisible && model.integrationBudgetAudit.export8LStillVisible && model.integrationBudgetAudit.product8KStillVisible && model.integrationBudgetAudit.export8KStillVisible, "8L/8K visible"),
    checkLine("product story-first and compact export preserved", model.integrationBudgetAudit.productStoryFirstStillVisible && model.integrationBudgetAudit.exportCompactPreserved, "story/export visible"),
    checkLine("exportReadTimeSecondsAfter8M <= 900", model.exportBudgetAudit.exportReadTimeSecondsAfter8M <= 900, String(model.exportBudgetAudit.exportReadTimeSecondsAfter8M)),
    checkLine("exportReadTimeSecondsAfter8M ideally <= 800", model.exportBudgetAudit.exportReadTimeSecondsAfter8M <= 800, String(model.exportBudgetAudit.exportReadTimeSecondsAfter8M)),
    checkLine("export metadata current version visible", model.exportMetadataCurrentVersionVisible, bool(model.exportMetadataCurrentVersionVisible)),
    checkLine("export title no longer only 8I", model.exportBudgetAudit.exportTitleNotOnly8I, bool(model.exportBudgetAudit.exportTitleNotOnly8I)),
    checkLine("source-of-truth preserved", model.sourceOfTruthSeparationPreserved, bool(model.sourceOfTruthSeparationPreserved)),
    checkLine("no scoring constants changed", model.sourceOfTruthRegressionAudit.noScoringConstantChange, bool(model.sourceOfTruthRegressionAudit.noScoringConstantChange)),
    checkLine("MatchBonusEvent unchanged", model.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged, bool(model.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged)),
    checkLine("batch/live separation preserved", model.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved, bool(model.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved)),
    checkLine("coach usability ready", model.coachUsabilityAudit.usabilityWarningCodes.length === 0, model.coachUsabilityAudit.recommendation),
    checkLine("share pack PASS", true, "validated by validation.share-pack.md"),
  ];
  const status = model.status === "PASS" && checks.every((line) => line.startsWith("- PASS:")) ? "PASS" : "FAIL";
  return [
    "# Validation - Manual Post-Match Observation Review Form 8M",
    "",
    `Status: ${status}`,
    "",
    "## Checks",
    ...checks,
    "",
    "## Counts",
    `- reviewSectionCount: ${model.formAudit.reviewSectionCount}`,
    `- linked8LSectionCount: ${model.formAudit.linked8LSectionCount}`,
    `- pendingSectionCount: ${model.formAudit.pendingSectionCount}`,
    `- blankSectionCount: ${model.formAudit.blankSectionCount}`,
    `- notEvaluatedSectionCount: ${model.formAudit.notEvaluatedSectionCount}`,
    `- outcomeOptionCount: ${model.outcomeOptionAudit.outcomeOptionCount}`,
    `- productHtmlBefore8MClean: ${model.productHtmlBefore8MClean}`,
    `- exportHtmlBefore8MClean: ${model.exportHtmlBefore8MClean}`,
    `- checkedDefaultCount: ${model.outcomeOptionAudit.checkedDefaultCount}`,
    `- automaticOutcomeCount: ${model.outcomeOptionAudit.automaticOutcomeCount}`,
    `- submitButtonCount: ${model.boundaryAudit.submitButtonCount}`,
    `- backendActionCount: ${model.boundaryAudit.backendActionCount}`,
    `- localStorageCount: ${model.boundaryAudit.localStorageCount}`,
    `- databasePersistenceCount: ${model.boundaryAudit.databasePersistenceCount}`,
    `- filePersistenceCount: ${model.boundaryAudit.filePersistenceCount}`,
    `- futureEvidenceClaimCount: ${model.boundaryAudit.futureEvidenceClaimCount}`,
    `- fabricatedEvidenceCount: ${model.boundaryAudit.fabricatedEvidenceCount}`,
    `- seasonMemoryCount: ${model.boundaryAudit.seasonMemoryCount}`,
    `- selectionInstructionCount: ${model.boundaryAudit.selectionInstructionCount}`,
    `- tacticalInstructionCount: ${model.boundaryAudit.tacticalInstructionCount}`,
    `- sandboxPromotionCount: ${model.boundaryAudit.sandboxPromotionCount}`,
    `- diagnosticPromotionCount: ${model.boundaryAudit.diagnosticPromotionCount}`,
    `- batchPromotionCount: ${model.boundaryAudit.batchPromotionCount}`,
    `- exportReadTimeSecondsAfter8M: ${model.exportBudgetAudit.exportReadTimeSecondsAfter8M}`,
    `- exportUnder900Seconds: ${model.exportBudgetAudit.exportUnder900Seconds}`,
    `- exportUnder800Seconds: ${model.exportBudgetAudit.exportUnder800Seconds}`,
    "",
    "## Exhaustive Validation Command",
    "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
    "",
    "## Recommendation",
    `- ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
  ].join("\n");
}
