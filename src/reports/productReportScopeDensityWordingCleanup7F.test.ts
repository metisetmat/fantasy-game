import { strict as assert } from "node:assert";
import {
  currentGeneratedProductReportScopeDensityWordingCleanup7FModel,
  renderProductReportScopeDensityWordingCleanup7FValidation,
} from "./productReportScopeDensityWordingCleanup7F";

const model = currentGeneratedProductReportScopeDensityWordingCleanup7FModel();
const validation = renderProductReportScopeDensityWordingCleanup7FValidation(model);

assert.equal(model.scope, "PRODUCT_REPORT_SCOPE_DENSITY_WORDING_CLEANUP");
assert.equal(model.version, "PRODUCT_REPORT_SCOPE_DENSITY_WORDING_CLEANUP_7F");
assert.equal(model.baselineVersion, "COACH_REPORT_PHASE_VISUALS_TACTICAL_MAP_CARDS_7E");
assert.equal(model.status, "PASS");
assert.equal(model.productReportReady, true);
assert.equal(model.coachExportReady, true);
assert.equal(model.premiumLayoutPreserved, true);
assert.equal(model.tacticalMapCardsPreserved, true);
assert.equal(model.reportScopeClean, true);
assert.equal(model.exportScopeClean, true);
assert.equal(model.mainBodyCoachOnly, true);
assert.equal(model.mechanicalWordingRemoved, true);
assert.equal(model.repeatedWarningsReduced, true);
assert.equal(model.sourceOfTruthSeparationPreserved, true);
assert.equal(model.scopeBoundaryAudit.databaseMainBodySectionCount, 0);
assert.equal(model.scopeBoundaryAudit.persistenceMainBodySectionCount, 0);
assert.equal(model.scopeBoundaryAudit.calibrationMainBodySectionCount, 0);
assert.equal(model.exportScopeAudit.exportDatabaseSectionsCount, 0);
assert.equal(model.exportScopeAudit.exportPersistenceSectionsCount, 0);
assert.equal(model.exportScopeAudit.exportCalibrationSectionsCount, 0);
assert.equal(model.wordingCleanupAudit.mechanicalPhraseCount, 0);
assert.equal(model.wordingCleanupAudit.forbiddenWordingCount, 0);
assert.match(validation, /Status: PASS/u);

console.log("PASS productReportScopeDensityWordingCleanup7F");
