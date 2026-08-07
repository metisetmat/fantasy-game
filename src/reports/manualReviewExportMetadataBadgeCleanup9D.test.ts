import assert from "node:assert/strict";
import { auditManualReviewExportCoverBadge9D } from "./manualReviewExportCoverBadgeAudit9D";
import { buildManualReviewExportMetadataBadgeCleanup9DModel } from "./buildManualReviewExportMetadataBadgeCleanup9D";
import { buildManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel } from "./buildManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9C";
import { currentSprint } from "./share/currentSharePack";
import { scoringRegistryEntry } from "../systems/scoring";

const baseline9C = buildManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel();
const staleExport9C = baseline9C.exportHtmlAfter9C.replace(
  "<main",
  '<header><h1>Rapport coach - export compact</h1><div class="badge-row report-scoreboard report-kpi-grid"><span class="badge">Score officiel : 12 - 7</span><span class="badge">Export compact 9B</span></div></header>\n<main',
);
const staleAudit = auditManualReviewExportCoverBadge9D(staleExport9C);
assert.equal(staleAudit.exportCoverBadgeText, "Export compact 9B");
assert.equal(staleAudit.exportCoverBadgeMentions9B, true);
assert.equal(staleAudit.exportCoverBadgeCorrect, false);

const model = buildManualReviewExportMetadataBadgeCleanup9DModel({
  baseline9C,
  exportHtmlBefore9D: staleExport9C,
});

assert.equal(model.status, "PASS");
assert.equal(model.exportCoverBadgeText, "Export compact 9D");
assert.equal(model.exportCoverBadgeCorrect, true);
assert.equal(model.exportTitleMentions9D, true);
assert.equal(model.exportHtmlAfter9D.includes("<title>Rapport coach export compact 9D - metadata badge cleanup</title>"), true);
assert.equal(model.exportMainIdIs9D, true);
assert.equal(model.exportHtmlAfter9D.includes('id="compressed-export-9d"'), true);
assert.equal(model.exportHtmlAfter9D.match(/<main\b[^>]*>/u)?.[0].includes('data-export-metadata-badge-cleanup-version="9D"'), true);
assert.equal(model.exportCoverBadgeText.includes("9B"), false);
assert.equal(model.exportCoverBadgeText.includes("9C"), false);
assert.equal(model.exportCoverBadgeText.includes("9A"), false);
assert.equal(model.exportCoverBadgeText.includes("8Z"), false);
assert.equal(model.coverBadgeAudit.coverBadgeSource, "header_badge_row");
assert.equal(model.coverBadgeAudit.bodyMentionFallbackUsedForCoverBadge, false);
assert.equal(model.metadataFalsePositiveCountAfter9D, 0);
assert.equal(model.baseline9CPreserved, true);
assert.equal(model.baseline9BPreserved, true);
assert.equal(model.baseline9APreserved, true);
assert.equal(model.baseline8ZPreserved, true);
assert.equal(model.detailCardCountFrom9C, 16);
assert.equal(model.detailCardGroupCountFrom9C, 3);
assert.equal(model.wordingReadabilityScoreFrom9C, 97);
assert.equal(model.detailCoverageStillCompleteFrom9C, true);
assert.equal(model.validationRuntimeActive, false);
assert.equal(model.validationExecutionCount, 0);
assert.equal(model.realPayloadReadCount, 0);
assert.equal(model.payloadCreated, false);
assert.equal(model.realPayloadInstanceCount, 0);
assert.equal(model.dryRunAcceptedPayloadCount, 0);
assert.equal(model.realPreviewGenerated, false);
assert.equal(model.previewActivationCount, 0);
assert.equal(model.submitCreated, false);
assert.equal(model.apiCreated, false);
assert.equal(model.backendCreated, false);
assert.equal(model.storageCreated, false);
assert.equal(model.memoryCreated, false);
assert.equal(model.draftCreated, false);
assert.equal(model.historyCreated, false);
assert.equal(model.officialTruthPromoted, false);
assert.equal(model.automaticDecisionCreated, false);
assert.equal(model.selectionDriven, false);
assert.equal(model.tacticalInstructionDriven, false);
assert.equal(model.scoreMutationCount, 0);
assert.equal(model.timelineMutationCount, 0);
assert.equal(model.scoreChangeCreationCount, 0);
assert.equal(model.eventMutationCount, 0);
assert.equal(model.exportReadTimeSecondsAfter9D <= 900, true);
assert.equal(model.exportUnder900Seconds, model.exportReadTimeSecondsAfter9D <= 900);
assert.equal(model.exportUnder800Seconds, model.exportReadTimeSecondsAfter9D <= 800);
assert.equal(scoringRegistryEntry("SHOT_GOAL").points, 3);
assert.equal(scoringRegistryEntry("TRY_TOUCHDOWN").points, 5);
assert.equal(scoringRegistryEntry("CONVERSION_GOAL").points, 2);
assert.equal(scoringRegistryEntry("DROP_GOAL").points, 2);
assert.equal(scoringRegistryEntry("PENALTY_SHOT").active, false);
assert.equal(model.guardrailsPreserved, true);
assert.equal(model.productHtmlAfter9D.includes("Correction metadata export"), true);
assert.equal(model.exportHtmlAfter9D.includes("Correction metadata export"), true);
assert.equal(currentSprint.name.includes("Sprint 9D"), true);
assert.equal(currentSprint.requiredFiles.includes("coach-report-manual-review-preview-payload-dry-run-result-detail-cards-without-preview-activation-9c.md"), false);

console.log("PASS manualReviewExportMetadataBadgeCleanup9D");
