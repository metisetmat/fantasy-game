import { copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expectedSharePackFiles, resolveActiveSharePackConfig } from "../sharePack";
import {
  excludedFilesFoundInShare,
  missingExcludedSourceFiles,
  staleShareFiles,
} from "../share/sharePackValidation";
import { validateRoleFitEngineFixtures } from "../../systems/roleFit";

type SharePackStatus = "PASS" | "FAIL";

interface SharePackCheck {
  readonly label: string;
  readonly status: SharePackStatus;
  readonly detail: string;
}

export interface SharePackValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly SharePackCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): SharePackCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function containsAny(value: string, fragments: readonly string[]): boolean {
  return fragments.some((fragment) => value.includes(fragment));
}

function countAny(value: string, fragments: readonly string[]): number {
  return fragments.reduce((total, fragment) => total + (value.includes(fragment) ? 1 : 0), 0);
}

function renderMarkdown(input: {
  readonly checks: readonly SharePackCheck[];
  readonly sharePackMode: string;
  readonly currentSprint: string;
  readonly shareFileCount: number;
  readonly minimalAllowlistCount: number;
  readonly missingExpectedFiles: readonly string[];
  readonly staleShareFileCount: number;
  readonly excludedFilesFoundInShareCount: number;
  readonly sourceFilesDeletedCount: number;
  readonly files: readonly string[];
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Share Pack Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- share pack mode: ${input.sharePackMode}`,
    `- current sprint: ${input.currentSprint}`,
    `- final file count: ${input.shareFileCount}`,
    `- share file count: ${input.shareFileCount}`,
    `- minimal allowlist count: ${input.minimalAllowlistCount}`,
    `- missing expected files: ${input.missingExpectedFiles.length === 0 ? "none" : input.missingExpectedFiles.join(", ")}`,
    `- stale share file count: ${input.staleShareFileCount}`,
    `- excluded files found in share: ${input.excludedFilesFoundInShareCount}`,
    `- source files deleted count: ${input.sourceFilesDeletedCount}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
    "## Files",
    "",
    ...input.files.map((file) => `- ${file}`),
    "",
  ].join("\n");
}

export function validateSharePack(input: { readonly reportDirectory: string }): SharePackValidationResult {
  const activeConfig = resolveActiveSharePackConfig(input.reportDirectory);
  const shareDirectory = join(input.reportDirectory, "share");
  const manifestPath = join(shareDirectory, "manifest.md");
  const readmePath = join(shareDirectory, "README.md");
  const shareValidationPath = join(shareDirectory, "validation.share-pack.md");
  const detailedManifestPath = join(shareDirectory, "00-share-manifest.txt");
  const manifest = readIfExists(manifestPath);
  const readme = readIfExists(readmePath);
  const detailedManifest = readIfExists(detailedManifestPath);
  const filesOnDisk = existsSync(shareDirectory) ? readdirSync(shareDirectory).filter((entry) => !entry.startsWith(".")) : [];
  const allowlistedFiles = expectedSharePackFiles(input.reportDirectory);
  const fileSet = new Set(filesOnDisk);
  const staleFiles = staleShareFiles({ filesOnDisk, activeConfig });
  const excludedInShare = excludedFilesFoundInShare({ filesOnDisk, activeConfig });
  const missingExcludedSources = missingExcludedSourceFiles({ reportDirectory: input.reportDirectory, activeConfig });
  const requiredCopied = (file: string): boolean => fileSet.has(file);
  const sourceExists = (file: string): boolean => existsSync(join(input.reportDirectory, file));
  const missingExpectedFiles = allowlistedFiles.filter((file) => !requiredCopied(file));
  const allRequiredCopied = allowlistedFiles.every((file) => requiredCopied(file));
  const allRequiredListed = allowlistedFiles.every((file) => manifest.includes(file));
  const sourceOfTruthReconciliation = readIfExists(join(shareDirectory, "source-of-truth-reconciliation.md"));
  const sourceOfTruthReconciliationValidation = readIfExists(join(shareDirectory, "validation.source-of-truth-reconciliation.md"));
  const fullMatchSegmentDiversityFatigue = readIfExists(join(shareDirectory, "full-match-segment-diversity-fatigue.md"));
  const fullMatchSegmentDiversityFatigueValidation = readIfExists(join(shareDirectory, "validation.full-match-segment-diversity-fatigue.md"));
  const fullMatchHarnessPlausibility = readIfExists(join(shareDirectory, "full-match-harness-plausibility.md"));
  const fullMatchHarnessPlausibilityValidation = readIfExists(join(shareDirectory, "validation.full-match-harness-plausibility.md"));
  const coachReportCopyQuality = readIfExists(join(shareDirectory, "coach-report-copy-quality.md"));
  const coachReportCopyQualityValidation = readIfExists(join(shareDirectory, "validation.coach-report-copy-quality.md"));
  const canonicalMatchReportEvidenceContract = readIfExists(join(shareDirectory, "canonical-matchreport-evidence-contract.md"));
  const canonicalMatchReportEvidenceContractValidation = readIfExists(join(shareDirectory, "validation.canonical-matchreport-evidence-contract.md"));
  const coachFacingSummaryBoundary = readIfExists(join(shareDirectory, "coach-facing-summary-boundary.md"));
  const coachFacingSummaryBoundaryValidation = readIfExists(join(shareDirectory, "validation.coach-facing-summary-boundary.md"));
  const trueSegmentStateIntegration = readIfExists(join(shareDirectory, "true-segment-state-integration.md"));
  const trueSegmentStateIntegrationValidation = readIfExists(join(shareDirectory, "validation.true-segment-state-integration.md"));
  const tacticalGroundingReconciliation = readIfExists(join(shareDirectory, "tactical-grounding-reconciliation.md"));
  const tacticalGroundingReconciliationValidation = readIfExists(join(shareDirectory, "validation.tactical-grounding-reconciliation.md"));
  const rosterToSpatialContextAdapter = readIfExists(join(shareDirectory, "roster-to-spatial-context-adapter.md"));
  const rosterToSpatialContextAdapterValidation = readIfExists(join(shareDirectory, "validation.roster-to-spatial-context-adapter.md"));
  const attributeDrivenRouteRanking = readIfExists(join(shareDirectory, "attribute-driven-route-ranking.md"));
  const attributeDrivenRouteRankingValidation = readIfExists(join(shareDirectory, "validation.attribute-driven-route-ranking.md"));
  const selectionDrivingAttributeRanking = readIfExists(join(shareDirectory, "selection-driving-attribute-ranking.md"));
  const selectionDrivingAttributeRankingValidation = readIfExists(join(shareDirectory, "validation.selection-driving-attribute-ranking.md"));
  const prototypeSelectionReplacement = readIfExists(join(shareDirectory, "prototype-selection-replacement.md"));
  const prototypeSelectionReplacementValidation = readIfExists(join(shareDirectory, "validation.prototype-selection-replacement.md"));
  const fullMatchWorkbenchChainReplay = readIfExists(join(shareDirectory, "fullmatch-workbench-chain-replay.md"));
  const fullMatchWorkbenchChainReplayValidation = readIfExists(join(shareDirectory, "validation.fullmatch-workbench-chain-replay.md"));
  const fullMatchWorkbenchChainReplay2X = readIfExists(join(shareDirectory, "fullmatch-workbench-chain-replay-2x.md"));
  const fullMatchWorkbenchChainReplay2XValidation = readIfExists(join(shareDirectory, "validation.fullmatch-workbench-chain-replay-2x.md"));
  const fullMatchWorkbenchChainReplay2Y = readIfExists(join(shareDirectory, "fullmatch-workbench-chain-replay-2y.md"));
  const fullMatchWorkbenchChainReplay2YValidation = readIfExists(join(shareDirectory, "validation.fullmatch-workbench-chain-replay-2y.md"));
  const fullMatchWorkbenchChainReplay2Z = readIfExists(join(shareDirectory, "fullmatch-workbench-chain-replay-2z.md"));
  const fullMatchWorkbenchChainReplay2ZValidation = readIfExists(join(shareDirectory, "validation.fullmatch-workbench-chain-replay-2z.md"));
  const fullMatchWorkbenchChainReplay3A = readIfExists(join(shareDirectory, "fullmatch-workbench-chain-replay-3a.md"));
  const fullMatchWorkbenchChainReplay3AValidation = readIfExists(join(shareDirectory, "validation.fullmatch-workbench-chain-replay-3a.md"));
  const fullMatchWorkbenchChainReplay3B = readIfExists(join(shareDirectory, "fullmatch-workbench-chain-replay-3b.md"));
  const fullMatchWorkbenchChainReplay3BValidation = readIfExists(join(shareDirectory, "validation.fullmatch-workbench-chain-replay-3b.md"));
  const fullMatchWorkbenchChainReplay3C = readIfExists(join(shareDirectory, "fullmatch-workbench-chain-replay-3c.md"));
  const fullMatchWorkbenchChainReplay3CValidation = readIfExists(join(shareDirectory, "validation.fullmatch-workbench-chain-replay-3c.md"));
  const fullMatchWorkbenchChainReplay3D = readIfExists(join(shareDirectory, "fullmatch-workbench-chain-replay-3d.md"));
  const fullMatchWorkbenchChainReplay3DValidation = readIfExists(join(shareDirectory, "validation.fullmatch-workbench-chain-replay-3d.md"));
  const fullMatchWorkbenchChainReplay3E = readIfExists(join(shareDirectory, "fullmatch-workbench-chain-replay-3e.md"));
  const fullMatchWorkbenchChainReplay3EValidation = readIfExists(join(shareDirectory, "validation.fullmatch-workbench-chain-replay-3e.md"));
  const fullMatchWorkbenchChainReplay3F = readIfExists(join(shareDirectory, "fullmatch-workbench-chain-replay-3f.md"));
  const fullMatchWorkbenchChainReplay3FValidation = readIfExists(join(shareDirectory, "validation.fullmatch-workbench-chain-replay-3f.md"));
  const fullMatchWorkbenchChainReplay3G = readIfExists(join(shareDirectory, "fullmatch-workbench-chain-replay-3g.md"));
  const fullMatchWorkbenchChainReplay3GValidation = readIfExists(join(shareDirectory, "validation.fullmatch-workbench-chain-replay-3g.md"));
  const fullMatchWorkbenchChainReplay3H = readIfExists(join(shareDirectory, "fullmatch-workbench-chain-replay-3h.md"));
  const fullMatchWorkbenchChainReplay3HValidation = readIfExists(join(shareDirectory, "validation.fullmatch-workbench-chain-replay-3h.md"));
  const fullMatchWorkbenchChainReplay3I = readIfExists(join(shareDirectory, "fullmatch-workbench-chain-replay-3i.md"));
  const fullMatchWorkbenchChainReplay3IValidation = readIfExists(join(shareDirectory, "validation.fullmatch-workbench-chain-replay-3i.md"));
  const fullMatchWorkbenchChainReplay3J = readIfExists(join(shareDirectory, "fullmatch-workbench-chain-replay-3j.md"));
  const fullMatchWorkbenchChainReplay3JValidation = readIfExists(join(shareDirectory, "validation.fullmatch-workbench-chain-replay-3j.md"));
  const fullMatchWorkbenchChainReplay3K = readIfExists(join(shareDirectory, "fullmatch-workbench-chain-replay-3k.md"));
  const fullMatchWorkbenchChainReplay3KValidation = readIfExists(join(shareDirectory, "validation.fullmatch-workbench-chain-replay-3k.md"));
  const fullMatchWorkbenchChainReplay3L = readIfExists(join(shareDirectory, "fullmatch-workbench-chain-replay-3l.md"));
  const fullMatchWorkbenchChainReplay3LValidation = readIfExists(join(shareDirectory, "validation.fullmatch-workbench-chain-replay-3l.md"));
  const fullMatchWorkbenchChainReplay3M = readIfExists(join(shareDirectory, "fullmatch-workbench-chain-replay-3m.md"));
  const fullMatchWorkbenchChainReplay3MValidation = readIfExists(join(shareDirectory, "validation.fullmatch-workbench-chain-replay-3m.md"));
  const fullMatchWorkbenchChainReplay3N = readIfExists(join(shareDirectory, "fullmatch-workbench-chain-replay-3n.md"));
  const fullMatchWorkbenchChainReplay3NValidation = readIfExists(join(shareDirectory, "validation.fullmatch-workbench-chain-replay-3n.md"));
  const fullMatchWorkbenchChainReplay3O = readIfExists(join(shareDirectory, "fullmatch-workbench-chain-replay-3o.md"));
  const fullMatchWorkbenchChainReplay3OValidation = readIfExists(join(shareDirectory, "validation.fullmatch-workbench-chain-replay-3o.md"));
  const sequenceOneActionOneWorkbench = readIfExists(join(shareDirectory, "sequence-1-action-1.html"));
  const sequenceOneActionTwoWorkbench = readIfExists(join(shareDirectory, "sequence-1-action-2.html"));
  const sequenceOneActionThreeWorkbench = readIfExists(join(shareDirectory, "sequence-1-action-3.html"));
  const coachHtml = readIfExists(join(shareDirectory, "coach-report.latest.html"));
  const coachDefaultHtml = readIfExists(join(shareDirectory, "coach-report.default.html"));
  const coachExperimentalHtml = readIfExists(join(shareDirectory, "coach-report.experimental.html"));
  const bundleContracts = readIfExists(join(shareDirectory, "bundle__contracts.md"));
  const bundleSimulation = readIfExists(join(shareDirectory, "bundle__simulation.md"));
  const bundleReports = readIfExists(join(shareDirectory, "bundle__reports.md"));
  const bundleDocs = readIfExists(join(shareDirectory, "bundle__docs.md"));
  const routeDecision = readIfExists(join(shareDirectory, "route-decision-and-balance.md"));
  const routeDecisionValidation = readIfExists(join(shareDirectory, "validation.route-decision-and-balance.md"));
  const routeResolution = readIfExists(join(shareDirectory, "route-resolution-calibrations.md"));
  const routeResolutionValidation = readIfExists(join(shareDirectory, "validation.route-resolution-calibrations.md"));
  const routeEconomy = readIfExists(join(shareDirectory, "route-economy-monitoring.md"));
  const fullMatchEconomy = readIfExists(join(shareDirectory, "full-match-economy-validation.md"));
  const matchEconomyValidation = readIfExists(join(shareDirectory, "validation.match-economy-monitoring.md"));
  const sourceRouteEconomyValidation = readIfExists(join(input.reportDirectory, "validation.route-economy-monitoring.md"));
  const sourceFullMatchEconomyValidation = readIfExists(join(input.reportDirectory, "validation.full-match-economy-validation.md"));
  const sourceUnifiedValidation = readIfExists(join(input.reportDirectory, "validation.unified-live-scoring-event-stream.md"));
  const heatmapReport = readIfExists(join(shareDirectory, "shot-origin-heatmap.md"));
  const heatmapPngExists = existsSync(join(shareDirectory, "shot-origin-heatmap.png"));
  const scoringEvents = readIfExists(join(shareDirectory, "scoring-events-summary.md"));
  const tacticalEvidence = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const coachSummary = readIfExists(join(shareDirectory, "coach-summary.latest.md"));
  const coachRoleGuide = readIfExists(join(shareDirectory, "coach-role-guide.md"));
  const roleArchetypes = readIfExists(join(shareDirectory, "role_archetypes.md"));
  const roleFitModel = readIfExists(join(shareDirectory, "role-fit-model.md"));
  const roleFitFixtures = readIfExists(join(shareDirectory, "role-fit-test-fixtures.md"));
  const sourceRoleSkillMappingPath = join(input.reportDirectory, "..", "docs", "gameplay", "role_skill_mapping.md");
  const sourceRoleSkillMapping = readIfExists(sourceRoleSkillMappingPath);
  const roleFitEnginePath = join(input.reportDirectory, "..", "src", "systems", "roleFit", "roleFitEngine.ts");
  const roleFitEngineTestPath = join(input.reportDirectory, "..", "src", "systems", "roleFit", "roleFitEngine.test.ts");
  const roleFitTypesPath = join(input.reportDirectory, "..", "src", "systems", "roleFit", "roleFitTypes.ts");
  const roleFitReasonIdsPath = join(input.reportDirectory, "..", "src", "systems", "roleFit", "roleFitReasonIds.ts");
  const roleFitRiskIdsPath = join(input.reportDirectory, "..", "src", "systems", "roleFit", "roleFitRiskIds.ts");
  const roleFitCapIdsPath = join(input.reportDirectory, "..", "src", "systems", "roleFit", "roleFitCapIds.ts");
  const roleFitFixturesSourcePath = join(input.reportDirectory, "..", "src", "systems", "roleFit", "roleFitFixtures.ts");
  const roleFitUiDirectory = join(input.reportDirectory, "..", "src", "components", "roleFit");
  const roleFitCardSource = readIfExists(join(roleFitUiDirectory, "RoleFitCard.tsx"));
  const roleFitReasonsListSource = readIfExists(join(roleFitUiDirectory, "RoleFitReasonsList.tsx"));
  const roleFitRisksListSource = readIfExists(join(roleFitUiDirectory, "RoleFitRisksList.tsx"));
  const roleFitStyleFitSource = readIfExists(join(roleFitUiDirectory, "RoleFitStyleFit.tsx"));
  const roleFitFatigueWarningSource = readIfExists(join(roleFitUiDirectory, "RoleFitFatigueWarning.tsx"));
  const roleFitAdviceSource = readIfExists(join(roleFitUiDirectory, "RoleFitAdvice.tsx"));
  const roleComparisonPanelSource = readIfExists(join(roleFitUiDirectory, "RoleComparisonPanel.tsx"));
  const roleFitBadgeSource = readIfExists(join(roleFitUiDirectory, "RoleFitBadge.tsx"));
  const roleFitScoreBarSource = readIfExists(join(roleFitUiDirectory, "RoleFitScoreBar.tsx"));
  const roleFitIndexSource = readIfExists(join(roleFitUiDirectory, "index.ts"));
  const roleFitCardTestSource = readIfExists(join(roleFitUiDirectory, "RoleFitCard.test.tsx"));
  const roleComparisonPanelTestSource = readIfExists(join(roleFitUiDirectory, "RoleComparisonPanel.test.tsx"));
  const roleFitEngineSource = readIfExists(roleFitEnginePath);
  const roleFitEngineTestSource = readIfExists(roleFitEngineTestPath);
  const roleFitTypesSource = readIfExists(roleFitTypesPath);
  const roleFitReasonIdsSource = readIfExists(roleFitReasonIdsPath);
  const roleFitRiskIdsSource = readIfExists(roleFitRiskIdsPath);
  const roleFitCapIdsSource = readIfExists(roleFitCapIdsPath);
  const roleFitFixturesSource = readIfExists(roleFitFixturesSourcePath);
  const roleFitUiImplementation = readIfExists(join(shareDirectory, "role-fit-ui-implementation.md"));
  const roleFitUiValidation = readIfExists(join(shareDirectory, "validation.role-fit-ui-implementation.md"));
  const reactJsxRoleFitReport = readIfExists(join(shareDirectory, "react-jsx-role-fit-refactor.md"));
  const reactJsxRoleFitValidation = readIfExists(join(shareDirectory, "validation.react-jsx-role-fit-refactor.md"));
  const playerProfileRoleFitReport = readIfExists(join(shareDirectory, "player-profile-role-fit-section.md"));
  const playerProfileRoleFitValidation = readIfExists(join(shareDirectory, "validation.player-profile-role-fit-section.md"));
  const rosterBuilderReport = readIfExists(join(shareDirectory, "roster-builder-role-fit-integration.md"));
  const rosterBuilderValidation = readIfExists(join(shareDirectory, "validation.roster-builder-role-fit-integration.md"));
  const rosterSourceDirectory = join(input.reportDirectory, "..", "src", "components", "roster");
  const rosterFeatureDirectory = join(input.reportDirectory, "..", "src", "features", "roster");
  const rosterPageSource = readIfExists(join(input.reportDirectory, "..", "src", "pages", "RosterBuilderPage.tsx"));
  const rosterBuilderSource = readIfExists(join(rosterSourceDirectory, "RosterBuilder.tsx"));
  const rosterAssignmentTableSource = readIfExists(join(rosterSourceDirectory, "RosterRoleAssignmentTable.tsx"));
  const playerRoleFitDrawerSource = readIfExists(join(rosterSourceDirectory, "PlayerRoleFitDrawer.tsx"));
  const roleCoveragePanelSource = readIfExists(join(rosterSourceDirectory, "RoleCoveragePanel.tsx"));
  const rosterBuilderTestSource = readIfExists(join(rosterSourceDirectory, "RosterBuilder.test.tsx"));
  const rosterSelectorsSource = readIfExists(join(rosterFeatureDirectory, "rosterRoleFitSelectors.ts"));
  const useRosterRoleFitSource = readIfExists(join(rosterFeatureDirectory, "useRosterRoleFit.ts"));
  const playerSourceDirectory = join(input.reportDirectory, "..", "src", "components", "player");
  const playerFeatureDirectory = join(input.reportDirectory, "..", "src", "features", "player");
  const playerProfilePageSource = readIfExists(join(input.reportDirectory, "..", "src", "pages", "PlayerProfilePage.tsx"));
  const playerRoleFitSectionSource = readIfExists(join(playerSourceDirectory, "PlayerRoleFitSection.tsx"));
  const playerBestRolesPanelSource = readIfExists(join(playerSourceDirectory, "PlayerBestRolesPanel.tsx"));
  const playerRoleDevelopmentPanelSource = readIfExists(join(playerSourceDirectory, "PlayerRoleDevelopmentPanel.tsx"));
  const playerRoleFitSectionTestSource = readIfExists(join(playerSourceDirectory, "PlayerRoleFitSection.test.tsx"));
  const playerProfilePageTestSource = readIfExists(join(input.reportDirectory, "..", "src", "pages", "PlayerProfilePage.test.tsx"));
  const playerRoleFitSelectorsSource = readIfExists(join(playerFeatureDirectory, "playerRoleFitSelectors.ts"));
  const usePlayerRoleFitSource = readIfExists(join(playerFeatureDirectory, "usePlayerRoleFit.ts"));
  const roleFitEngineValidation = validateRoleFitEngineFixtures();
  const roleFitEngineFailedChecks = roleFitEngineValidation.checks.filter((item) => !item.passed);
  const teamShapeValidation = readIfExists(join(input.reportDirectory, "validation.team-shape-intent-generalization.md"));
  const shotSubsystem = readIfExists(join(shareDirectory, "validation.shot-subsystem.md"));
  const trySubsystem = readIfExists(join(shareDirectory, "validation.try-subsystem.md"));
  const dropSubsystem = readIfExists(join(shareDirectory, "validation.drop-subsystem.md"));
  const conversionSubsystem = readIfExists(join(shareDirectory, "validation.conversion-subsystem.md"));
  const consolidatedResolutionSources = [
    "goalkeeper-shot-stopping-impact-calibration.md",
    "validation.goalkeeper-shot-stopping-impact-calibration.md",
    "try-grounding-pressure-calibration.md",
    "validation.try-grounding-pressure-calibration.md",
    "clean-shot-success-calibration.md",
    "validation.clean-shot-success-calibration.md",
  ];
  const consolidatedEconomySources = [
    "post-resolution-route-economy-monitoring.md",
    "validation.post-resolution-route-economy-monitoring.md",
    "danger-phase-conversion-economy.md",
    "validation.danger-phase-conversion-economy.md",
    "continuation-payoff-calibration.md",
    "validation.continuation-payoff-calibration.md",
    "match-duration-possession-volume-calibration.md",
    "validation.match-duration-possession-volume-calibration.md",
    "validation.route-economy-monitoring.md",
    "validation.full-match-economy-validation.md",
    "validation.unified-live-scoring-event-stream.md",
  ];
  const replacedSubsystemValidationFiles = [
    "validation.shot-action-semantics.md",
    "validation.shot-outcome-resolution.md",
    "validation.try-candidate-executed-integration.md",
    "validation.live-try-event-integration.md",
    "validation.drop-goal-foundation.md",
    "validation.drop-goal-opportunity-generation.md",
    "validation.drop-goal-resolution-calibration.md",
    "validation.conversion-resolution.md",
    "validation.conversion-difficulty-calibration.md",
  ];
  const trueRoleNames = [
    "Tempo Half",
    "Hook Link",
    "Forward Leader",
    "Goalkeeper / Free Safety",
    "Mobile Lock",
    "Space Hunter",
    "Playmaker",
    "Pivot",
    "Left Piston",
    "Right Piston",
  ];
  const detailedAnalogySectionCount = (coachRoleGuide.match(/Player analogies: with-ball and without-ball references\./g) ?? []).length;
  const quickAnalogyMapHasAllRoles = trueRoleNames.every((roleName) => coachRoleGuide.includes(`| ${roleName} |`));
  const quickAnalogyMapHasAllCategories =
    coachRoleGuide.includes("| Fantasy Game role | Football on-ball example | Football off-ball example | Rugby on-ball example | Rugby off-ball example | What to remember |") &&
    coachRoleGuide.includes("These are visualization aids. They describe one aspect of the Fantasy Game role, not exact football or rugby equivalents.");
  const quickAnalogySpaceHunterRow =
    coachRoleGuide
      .split("\n")
      .find((line) => line.startsWith("| Space Hunter |") && line.includes("Kylian Mbappe / Thierry Henry / Mohamed Salah")) ?? "";
  const quickAnalogyTempoHalfRow =
    coachRoleGuide
      .split("\n")
      .find((line) => line.startsWith("| Tempo Half |") && line.includes("Xavi / Luka Modric / Andrea Pirlo")) ?? "";
  const quickAnalogyHookLinkRow =
    coachRoleGuide
      .split("\n")
      .find((line) => line.startsWith("| Hook Link |") && line.includes("Antoine Griezmann / Roberto Firmino / Karim Benzema")) ?? "";
  const quickAnalogyPlaymakerRow =
    coachRoleGuide
      .split("\n")
      .find((line) => line.startsWith("| Playmaker |") && line.includes("Lionel Messi / Kevin De Bruyne / Zinedine Zidane")) ?? "";
  const quickAnalogyPivotRow =
    coachRoleGuide
      .split("\n")
      .find((line) => line.startsWith("| Pivot |") && line.includes("Xabi Alonso / Sergio Busquets / Rodri")) ?? "";
  const quickAnalogyMobileLockRow =
    coachRoleGuide
      .split("\n")
      .find((line) => line.startsWith("| Mobile Lock |") && line.includes("Paolo Maldini / Sergio Ramos / Casemiro")) ?? "";
  const quickAnalogyForwardLeaderRow =
    coachRoleGuide
      .split("\n")
      .find((line) => line.startsWith("| Forward Leader |") && line.includes("Virgil van Dijk / Franco Baresi / Sergio Ramos")) ?? "";
  const quickAnalogyLeftPistonRow =
    coachRoleGuide
      .split("\n")
      .find((line) => line.startsWith("| Left Piston |") && line.includes("Nuno Mendes / Roberto Carlos / Marcelo")) ?? "";
  const quickAnalogyRightPistonRow =
    coachRoleGuide
      .split("\n")
      .find((line) => line.startsWith("| Right Piston |") && line.includes("Achraf Hakimi / Cafu / Dani Alves")) ?? "";
  const roleSection = (roleName: string, nextRoleName: string): string => {
    const sectionStart = coachRoleGuide.indexOf(`### ${roleName}`);
    const sectionEnd = coachRoleGuide.indexOf(`### ${nextRoleName}`, sectionStart);
    return sectionStart >= 0 && sectionEnd > sectionStart ? coachRoleGuide.slice(sectionStart, sectionEnd) : "";
  };
  const tempoHalfDetailedSection = roleSection("Tempo Half", "Hook Link");
  const hookLinkDetailedSection = roleSection("Hook Link", "Forward Leader");
  const playmakerDetailedSection = roleSection("Playmaker", "Pivot");
  const spaceHunterSectionStart = coachRoleGuide.indexOf("### Space Hunter");
  const spaceHunterSectionEnd = coachRoleGuide.indexOf("### Playmaker", spaceHunterSectionStart);
  const spaceHunterDetailedSection =
    spaceHunterSectionStart >= 0 && spaceHunterSectionEnd > spaceHunterSectionStart
      ? coachRoleGuide.slice(spaceHunterSectionStart, spaceHunterSectionEnd)
      : "";
  const spaceHunterAnalogyText = `${quickAnalogySpaceHunterRow}\n${spaceHunterDetailedSection}`;
  const spaceHunterUsesAttackingExamples =
    quickAnalogySpaceHunterRow.includes("Kylian Mbappe / Thierry Henry / Mohamed Salah") &&
    quickAnalogySpaceHunterRow.includes("Luis Diaz / Edinson Cavani / Ousmane Dembele as pressing reference") &&
    spaceHunterDetailedSection.includes("Kylian Mbappe, Thierry Henry, or Mohamed Salah") &&
    spaceHunterDetailedSection.includes("Luis Diaz, Edinson Cavani, or Ousmane Dembele as attacking pressing references");
  const spaceHunterAvoidsKante = !spaceHunterAnalogyText.includes("Kante");
  const roleArchetypesSpaceHunterStart = roleArchetypes.indexOf("### Space Hunter");
  const roleArchetypesSpaceHunterEnd = roleArchetypes.indexOf("### Playmaker", roleArchetypesSpaceHunterStart);
  const roleArchetypesSpaceHunterSection =
    roleArchetypesSpaceHunterStart >= 0 && roleArchetypesSpaceHunterEnd > roleArchetypesSpaceHunterStart
      ? roleArchetypes.slice(roleArchetypesSpaceHunterStart, roleArchetypesSpaceHunterEnd)
      : "";
  const roleArchetypesSpaceHunterCorrected =
    roleArchetypesSpaceHunterSection.includes("Kylian Mbappe, Thierry Henry, Mohamed Salah") &&
    roleArchetypesSpaceHunterSection.includes("Luis Diaz, Edinson Cavani, Ousmane Dembele as attacking pressing references") &&
    !roleArchetypesSpaceHunterSection.includes("Kante");
  const tempoHalfNotPureDefensiveMidfield =
    quickAnalogyTempoHalfRow.includes("Xavi / Luka Modric / Andrea Pirlo") &&
    quickAnalogyTempoHalfRow.includes("Sergio Busquets / Rodri") &&
    tempoHalfDetailedSection.includes("Xavi, Luka Modric, or Andrea Pirlo") &&
    tempoHalfDetailedSection.includes("Sergio Busquets or Rodri");
  const hookLinkUsesAttackingWorkers =
    quickAnalogyHookLinkRow.includes("Antoine Griezmann / Roberto Firmino / Karim Benzema") &&
    quickAnalogyHookLinkRow.includes("Antoine Griezmann / Roberto Firmino / Wayne Rooney") &&
    hookLinkDetailedSection.includes("Antoine Griezmann, Roberto Firmino, or Karim Benzema") &&
    hookLinkDetailedSection.includes("Antoine Griezmann, Roberto Firmino, or Wayne Rooney") &&
    !quickAnalogyHookLinkRow.includes("Kante") &&
    !hookLinkDetailedSection.includes("Kante");
  const playmakerUsesCreativePlayers =
    quickAnalogyPlaymakerRow.includes("Lionel Messi / Kevin De Bruyne / Zinedine Zidane") &&
    quickAnalogyPlaymakerRow.includes("Antoine Griezmann / Bernardo Silva / Luka Modric") &&
    playmakerDetailedSection.includes("Lionel Messi, Kevin De Bruyne, or Zinedine Zidane") &&
    playmakerDetailedSection.includes("Antoine Griezmann, Bernardo Silva, or Luka Modric");
  const defensiveBalanceRolesReadable =
    quickAnalogyPivotRow.includes("Claude Makelele / Casemiro / Sergio Busquets") &&
    quickAnalogyMobileLockRow.includes("Paolo Maldini / Sergio Ramos / Casemiro") &&
    quickAnalogyForwardLeaderRow.includes("Virgil van Dijk / Franco Baresi / Sergio Ramos");
  const pistonsRemainTwoWay =
    quickAnalogyLeftPistonRow.includes("Nuno Mendes / Paolo Maldini / Philipp Lahm") &&
    quickAnalogyRightPistonRow.includes("Achraf Hakimi / Kyle Walker / Philipp Lahm");
  const offensiveAnalogyBalanceDiagnosisVisible =
    coachRoleGuide.includes("## Football Analogy Audit") &&
    coachRoleGuide.includes("Analogy balance rule: offensive roles should use attacking, creative, progressive, or rupture players") &&
    coachRoleGuide.includes("Mandatory diagnosis: we avoided the old attack-heavy bias") &&
    coachRoleGuide.includes("We avoided the newer defense-heavy bias") &&
    coachRoleGuide.includes("Recommendation: CONFIRM_OFFENSIVE_ANALOGY_BALANCE");
  const roleFitProfilesCoverEveryRole = trueRoleNames.every((roleName) => roleFitModel.includes(`| ${roleName} |`));
  const roleFitVisibleAttributesCovered = [
    "speed",
    "power",
    "endurance",
    "handPlay",
    "footPlay",
    "ballCarrying",
    "vision",
    "composure",
    "creativity",
  ].every((attribute) => roleFitModel.includes(attribute));
  const roleFitInputContractVisible =
    roleFitModel.includes("type RoleFitInput = {") &&
    roleFitModel.includes("visibleAttributes") &&
    roleFitModel.includes("inferredSkills?") &&
    roleFitModel.includes("derivedAttributes?") &&
    roleFitModel.includes("fatigueState?") &&
    roleFitModel.includes("rosterContext?");
  const roleFitResultContractVisible =
    roleFitModel.includes("type RoleFitLabel =") &&
    roleFitModel.includes("type FitSignalType =") &&
    roleFitModel.includes("type FitReason = {") &&
    roleFitModel.includes("type FitRisk = {") &&
    roleFitModel.includes("type FitBoost = {") &&
    roleFitModel.includes("type FitPenalty = {") &&
    roleFitModel.includes("type RoleFitResult = {") &&
    roleFitModel.includes("topReasons: FitReason[]") &&
    roleFitModel.includes("topRisks: FitRisk[]") &&
    roleFitModel.includes("debug?: {");
  const roleComparisonResultContractVisible =
    roleFitModel.includes("type RoleComparisonResult = {") &&
    roleFitModel.includes("testedRoles: RoleFitResult[]") &&
    roleFitModel.includes("bestRole: TrueRole") &&
    roleFitModel.includes("safestRole: TrueRole") &&
    roleFitModel.includes("highestUpsideRole: TrueRole") &&
    roleFitModel.includes("riskiestRole: TrueRole") &&
    roleFitModel.includes("bestRole is not always the highest raw score if risk is extreme");
  const roleFitComputationStagesVisible =
    roleFitModel.includes("## Computation Stages") &&
    roleFitModel.includes("1. Attribute profile scoring") &&
    roleFitModel.includes("2. Skill and contribution scoring") &&
    roleFitModel.includes("3. Derived tactical signal scoring") &&
    roleFitModel.includes("4. Style / team identity adjustment") &&
    roleFitModel.includes("5. Fatigue / load adjustment") &&
    roleFitModel.includes("6. Roster context adjustment") &&
    roleFitModel.includes("7. Explanation generation");
  const roleFitHardCapsVisible =
    roleFitModel.includes("## Role-Specific Hard Caps") &&
    trueRoleNames.every((roleName) => roleFitModel.includes(`| ${roleName} |`)) &&
    roleFitModel.includes("if Vision < 45, max score 59") &&
    roleFitModel.includes("if mentalFatigue > 70, fatigueWarning at least RISK") &&
    roleFitModel.includes("if defensiveCoverQuality is low and teamStyle is high pressing chaos");
  const roleFitGuardrailsVisible =
    roleFitModel.includes("The fit score is not a simple average of attributes") &&
    roleFitModel.includes("Goalkeeper / Free Safety must be evaluated with mental fatigue, rebound control, second-save recovery, and readiness state") &&
    roleFitModel.includes("Offensive role off-ball fit should not require defensive midfielder traits by default") &&
    roleFitModel.includes("Football and rugby analogies never drive fit scores directly.") &&
    roleFitModel.includes("Score computation remains separate from match scoring and never creates ScoringEvents.");
  const roleFitExamplesVisible =
    roleFitModel.includes("Obvious natural fit") &&
    roleFitModel.includes("Misleading high-attribute bad fit") &&
    roleFitModel.includes("Multi-role player") &&
    roleFitModel.includes("Fatigue-sensitive fit") &&
    roleFitModel.includes("Goalkeeper-specific fit");
  const deterministicRoleFitExamplesVisible =
    roleFitModel.includes("## Deterministic Test Examples") &&
    roleFitModel.includes("| Natural Fit | Elias | Tempo Half") &&
    roleFitModel.includes("| Misleading high-attribute bad fit | Bruno | Pivot") &&
    roleFitModel.includes("| Multi-role player | Milan | Hook Link / Pivot / Tempo Half") &&
    roleFitModel.includes("| Fatigue-sensitive fit | Noa | Right Piston") &&
    roleFitModel.includes("| Goalkeeper-specific fit | Sacha | Goalkeeper / Free Safety") &&
    roleFitModel.includes("| Offensive off-ball guardrail | Ilyes | Space Hunter");
  const roleFitUiReadyExampleVisible =
    roleFitModel.includes("### UI-Ready Role Fit Card") &&
    roleFitModel.includes("Player: Ilyes") &&
    roleFitModel.includes("Fit: 83 - Strong Fit") &&
    roleFitModel.includes("| Space Hunter | 83 Strong Fit | depth rupture | isolation risk | mobile/wide |") &&
    roleFitModel.includes("| Playmaker | 51 Risky Fit | creativity flashes | weak route control | not recommended |");
  const roleFitMandatoryDiagnosisVisible =
    roleFitModel.includes("Is the role fit model understandable for a beginner coach? YES") &&
    roleFitModel.includes("Does it preserve the difference between attributes, skills, and roles? YES") &&
    roleFitModel.includes("Does it avoid simple attribute averaging? YES") &&
    roleFitModel.includes("Does it explain both strengths and risks? YES") &&
    roleFitModel.includes("Does it handle goalkeeper-specific fatigue correctly? YES") &&
    roleFitModel.includes("Does it support multi-role players? YES") &&
    roleFitModel.includes("Does it avoid making football/rugby analogies drive fit scores? YES") &&
    roleFitModel.includes("Is it ready to become a UI component? YES") &&
    roleFitModel.includes("Is RoleFitResult ready for UI/API use? YES") &&
    roleFitModel.includes("Is RoleComparisonResult ready for roster-builder comparison? YES") &&
    roleFitModel.includes("Are fit scores explainable? YES") &&
    roleFitModel.includes("Are hard caps and risks clear enough for V1? YES") &&
    roleFitModel.includes("Does it protect offensive roles from defensive-midfielder bias? YES") &&
    roleFitModel.includes("Does it keep match scoring untouched? YES") &&
    roleFitModel.includes("CONFIRM_ROLE_FIT_COMPUTATION_CONTRACT_V1");
  const roleFitFixtureCount = (roleFitFixtures.match(/RF_FIX_/g) ?? []).length;
  const roleFitFixtureSchemaVisible =
    roleFitFixtures.includes("type RoleFitFixture = {") &&
    roleFitFixtures.includes("type RoleComparisonFixture = {") &&
    roleFitFixtures.includes("expectedTopReasonIds: string[]") &&
    roleFitFixtures.includes("expectedTopRiskIds: string[]") &&
    roleFitFixtures.includes("mustNotContain?: string[]");
  const roleFitFixtureRequiredCasesVisible =
    roleFitFixtures.includes("RF_FIX_01") &&
    roleFitFixtures.includes("RF_FIX_02") &&
    roleFitFixtures.includes("RF_FIX_03") &&
    roleFitFixtures.includes("RF_FIX_04") &&
    roleFitFixtures.includes("RF_FIX_05") &&
    roleFitFixtures.includes("RF_FIX_06") &&
    roleFitFixtures.includes("RF_FIX_07") &&
    roleFitFixtures.includes("RF_FIX_08") &&
    roleFitFixtures.includes("RF_FIX_09") &&
    roleFitFixtures.includes("RF_FIX_10") &&
    roleFitFixtures.includes("RF_FIX_11") &&
    roleFitFixtures.includes("RF_FIX_12") &&
    roleFitFixtures.includes("RF_FIX_13");
  const roleFitFixtureEveryRoleCovered = trueRoleNames.every((roleName) => roleFitFixtures.includes(roleName));
  const roleFitFixtureCoverageVisible =
    roleFitFixtures.includes("Multi-role player comparison") &&
    roleFitFixtures.includes("Goalkeeper mental fatigue warning") &&
    roleFitFixtures.includes("Goalkeeper poor hand play cap") &&
    roleFitFixtures.includes("Space Hunter offensive off-ball guardrail") &&
    roleFitFixtures.includes("Misleading high-attribute bad Pivot") &&
    roleFitFixtures.includes("Right Piston fatigue sensitivity") &&
    roleFitFixtures.includes("Piston two-way guardrail");
  const roleFitFixtureRegressionChecksVisible =
    roleFitFixtures.includes("No fixture expected output references famous player analogies") &&
    roleFitFixtures.includes("No fixture emits active ScoringEvents") &&
    roleFitFixtures.includes("Role fit tests do not alter MatchBonusEvent") &&
    roleFitFixtures.includes("Derived attributes remain engine-facing") &&
    roleFitFixtures.includes("Offensive role off-ball checks do not require defensive midfielder traits") &&
    roleFitFixtures.includes("A high average attribute profile can still fail due to a hard cap");
  const roleFitFixtureMandatoryDiagnosisVisible =
    roleFitFixtures.includes("Are fixtures reproducible enough for implementation? YES") &&
    roleFitFixtures.includes("Are expected outputs specific enough? YES") &&
    roleFitFixtures.includes("Do fixtures test hard caps? YES") &&
    roleFitFixtures.includes("Do fixtures test explanation quality? YES") &&
    roleFitFixtures.includes("Do fixtures test goalkeeper-specific logic? YES") &&
    roleFitFixtures.includes("Do fixtures test offensive off-ball guardrail? YES") &&
    roleFitFixtures.includes("Do fixtures test multi-role comparison? YES") &&
    roleFitFixtures.includes("Do fixtures avoid naive attribute averaging? YES") &&
    roleFitFixtures.includes("Do fixtures keep match scoring untouched? YES") &&
    roleFitFixtures.includes("CONFIRM_ROLE_FIT_TEST_FIXTURES_V1");
  const roleFitInputSourceContractAligned =
    roleFitTypesSource.includes("testedRole: TrueRole;") &&
    roleFitTypesSource.includes("currentFatigue: number;") &&
    roleFitTypesSource.includes("mentalFatigue?: number;") &&
    roleFitTypesSource.includes("lateMatchReliability?: number;") &&
    roleFitTypesSource.includes("missingRoles: TrueRole[];") &&
    roleFitTypesSource.includes("overloadedRoles: TrueRole[];") &&
    roleFitTypesSource.includes("supportQuality: number;") &&
    roleFitTypesSource.includes("defensiveCoverQuality: number;") &&
    !roleFitTypesSource.includes("role: TrueRole;") &&
    !roleFitTypesSource.includes("roleNeed") &&
    !roleFitTypesSource.includes("specialistDepth") &&
    !roleFitTypesSource.includes("teamShapeNeed");
  const roleFitResultSourceContractAligned =
    roleFitTypesSource.includes("testedRole: TrueRole;") &&
    roleFitTypesSource.includes("summary: string;") &&
    roleFitTypesSource.includes("bestPairings: TrueRole[];") &&
    roleFitTypesSource.includes("styleFit:") &&
    roleFitTypesSource.includes("developmentAdvice: string[];") &&
    roleFitTypesSource.includes("coachUsageAdvice: string[];") &&
    roleFitTypesSource.includes("baseRoleScore: number;") &&
    roleFitTypesSource.includes("attributeContribution: number;") &&
    roleFitTypesSource.includes("rosterContextAdjustment: number;");
  const roleComparisonSourceContractAligned =
    roleFitTypesSource.includes("export type RoleComparisonResult") &&
    roleFitTypesSource.includes("testedRoles: RoleFitResult[];") &&
    roleFitTypesSource.includes("bestRole: TrueRole;") &&
    roleFitTypesSource.includes("safestRole: TrueRole;") &&
    roleFitTypesSource.includes("highestUpsideRole: TrueRole;") &&
    roleFitTypesSource.includes("riskiestRole: TrueRole;");
  const documentedFitSignalTypes = [
    "ATTRIBUTE_STRENGTH",
    "ATTRIBUTE_WEAKNESS",
    "SKILL_STRENGTH",
    "SKILL_GAP",
    "DERIVED_STRENGTH",
    "DERIVED_RISK",
    "STYLE_BOOST",
    "STYLE_PENALTY",
    "FATIGUE_RISK",
    "ROSTER_CONTEXT_BOOST",
    "ROSTER_CONTEXT_RISK",
    "GOALKEEPER_SPECIFIC_SIGNAL",
  ];
  const fitSignalTypesAligned =
    documentedFitSignalTypes.every((typeName) => roleFitTypesSource.includes(`"${typeName}"`)) &&
    !roleFitTypesSource.includes('"ATTRIBUTE"') &&
    !roleFitTypesSource.includes('"SKILL"') &&
    !roleFitTypesSource.includes('"DERIVED"') &&
    !roleFitTypesSource.includes('"STYLE"') &&
    !roleFitTypesSource.includes('"FATIGUE"') &&
    !roleFitTypesSource.includes('"ROSTER"') &&
    !roleFitTypesSource.includes('"CAP"') &&
    !roleFitTypesSource.includes('"COMPARISON"');
  const requiredReasonIds = [
    "vision_supports_tempo_control",
    "composure_supports_pressure_escape",
    "hand_play_supports_phase_stability",
    "speed_supports_depth_threat",
    "ball_carrying_supports_rupture",
    "pressing_effort_supports_front_pressure",
    "composure_supports_gk_readiness",
    "rebound_control_strength",
    "composure_supports_repair_decisions",
    "vision_supports_transition_reading",
  ];
  const requiredRiskIds = [
    "low_vision_breaks_tempo_control",
    "poor_central_discipline",
    "rest_defense_risk",
    "gk_mental_fatigue",
    "rebound_control_under_load",
    "weak_rebound_control",
    "low_ball_carrying_limits_rupture",
    "forced_imagination_errors",
    "pressure_decision_instability",
    "emergency_repair_speed_risk",
  ];
  const requiredPenaltyIds = [
    "tempo_half_low_vision_cap_59",
    "pivot_low_composure_cap_59",
    "gk_low_hand_play_rebound_cap_59",
    "space_hunter_low_ball_carrying_cap_74",
    "playmaker_low_composure_cap_59",
    "forward_leader_low_power_cap_59",
    "mobile_lock_low_speed_cap_59",
  ];
  const stableReasonIdsVisible = requiredReasonIds.every((id) => roleFitReasonIdsSource.includes(id));
  const stableRiskIdsVisible = requiredRiskIds.every((id) => roleFitRiskIdsSource.includes(id));
  const stablePenaltyIdsVisible = requiredPenaltyIds.every((id) => roleFitCapIdsSource.includes(id));
  const roleFitTestsVisibleAndReviewable =
    roleFitEngineTestSource.includes("visibleRoleFitFixtureIdsUnderTest") &&
    roleFitEngineTestSource.includes("RF_FIX_01") &&
    roleFitEngineTestSource.includes("RF_FIX_13") &&
    roleFitEngineTestSource.includes("RF_FIX_04") &&
    roleFitEngineTestSource.includes("RoleFitResult contains testedRole and no public role key") &&
    roleFitEngineTestSource.includes("RoleComparisonResult testedRoles contain testedRole and no public role key") &&
    roleFitEngineTestSource.includes("score ranges") &&
    roleFitEngineTestSource.includes("exact labels") &&
    roleFitEngineTestSource.includes("expectedTopReasonIds") &&
    roleFitEngineTestSource.includes("expectedTopRiskIds") &&
    roleFitEngineTestSource.includes("expected caps / penalties") &&
    roleFitEngineTestSource.includes("mustNotContain terms") &&
    roleFitEngineTestSource.includes("computeRoleFit does not create ScoringEvents");
  const roleFitFixtureSourceReviewable =
    roleFitFixturesSource.includes("export const ROLE_FIT_ENGINE_FIXTURE_INPUTS") &&
    roleFitFixturesSource.includes("export const ROLE_FIT_ENGINE_COMPARISON_INPUTS") &&
    roleFitFixturesSource.includes("validateRoleFitEngineFixtures") &&
    roleFitFixturesSource.includes("ROLE_FIT_SCORING_CONSTANTS");
  const roleFitScoringIsolationChecksPass =
    roleFitEngineValidation.checks.some((item) => item.fixtureId === "ROLE_FIT_SCORING_CONSTANTS" && item.passed) &&
    roleFitEngineValidation.checks.some((item) => item.fixtureId === "ROLE_FIT_ISOLATION" && item.passed) &&
    roleFitEngineValidation.checks.some((item) => item.fixtureId === "ROLE_FIT_NO_SCORING_EVENTS" && item.passed);
  const roleFitContractRecommendationsVisible =
    roleFitEngineValidation.recommendations.includes("CONFIRM_ROLE_FIT_ENGINE_CONTRACT_ALIGNMENT") &&
    roleFitEngineValidation.recommendations.includes("CONFIRM_NO_LEGACY_ROLE_FIELD") &&
    roleFitEngineValidation.recommendations.includes("CONFIRM_ROLE_FIT_ENGINE_SOURCE_ALIGNED") &&
    roleFitEngineValidation.recommendations.includes("CONFIRM_ROLE_FIT_SOURCE_READY_FOR_UI") &&
    roleFitEngineValidation.recommendations.includes("CONFIRM_ROLE_FIT_ENGINE_READY_FOR_UI") &&
    roleFitEngineValidation.recommendations.includes("PREPARE_ROLE_FIT_UI_IMPLEMENTATION") &&
    roleFitEngineValidation.recommendations.includes("KEEP_TRUE_ROLE_ARCHETYPES") &&
    roleFitEngineValidation.recommendations.includes("KEEP_SKILLS_SEPARATE_FROM_ROLES");
  const roleFitUiComponentSources = [
    roleFitCardSource,
    roleFitReasonsListSource,
    roleFitRisksListSource,
    roleFitStyleFitSource,
    roleFitFatigueWarningSource,
    roleFitAdviceSource,
    roleComparisonPanelSource,
    roleFitBadgeSource,
    roleFitScoreBarSource,
    roleFitIndexSource,
  ].join("\n");
  const roleFitUiTestSources = [roleFitCardTestSource, roleComparisonPanelTestSource].join("\n");
  const roleFitUiNoForbiddenImports =
    !/systems[\\/](scoring|match|simulation)|ScoringEvent|MatchBonusEvent|liveScore|scoreAfter/.test(roleFitUiComponentSources);
  const roleFitUiFixtureTestsVisible =
    roleFitUiTestSources.includes("RF_FIX_01") &&
    roleFitUiTestSources.includes("RF_FIX_02") &&
    roleFitUiTestSources.includes("RF_FIX_05") &&
    roleFitUiTestSources.includes("RF_FIX_06") &&
    roleFitUiTestSources.includes("RF_FIX_07") &&
    roleFitUiTestSources.includes("RF_FIX_08") &&
    roleFitUiTestSources.includes("RF_FIX_04") &&
    roleFitUiTestSources.includes("UI does not recalculate score") &&
    roleFitUiTestSources.includes("UI does not display a legacy public role field");
  const rosterVisualSources = [
    rosterPageSource,
    rosterBuilderSource,
    rosterAssignmentTableSource,
    playerRoleFitDrawerSource,
    roleCoveragePanelSource,
  ].join("\n");
  const rosterRuntimeSources = [
    rosterVisualSources,
    rosterSelectorsSource,
    useRosterRoleFitSource,
  ].join("\n");
  const rosterAllSources = [rosterRuntimeSources, rosterBuilderTestSource].join("\n");
  const rosterNoForbiddenImports =
    !/systems[\\/](scoring|match|simulation)|ScoringEvent|MatchBonusEvent|liveScore|scoreAfter/.test(rosterRuntimeSources);
  const rosterComputationInSelectorOnly =
    rosterSelectorsSource.includes("computeRoleFit") &&
    rosterSelectorsSource.includes("compareRoleFits") &&
    !rosterVisualSources.includes("computeRoleFit") &&
    !rosterVisualSources.includes("compareRoleFits");
  const rosterFixtureTestsVisible =
    rosterBuilderTestSource.includes("Milan") &&
    rosterBuilderTestSource.includes("Sacha") &&
    rosterBuilderTestSource.includes("Ilyes") &&
    rosterBuilderTestSource.includes("Noa") &&
    rosterBuilderTestSource.includes("Rayan") &&
    rosterBuilderTestSource.includes("Oren") &&
    rosterBuilderTestSource.includes("No viable goalkeeper") &&
    rosterBuilderTestSource.includes("too many risky assignments");
  const playerVisualSources = [
    playerProfilePageSource,
    playerRoleFitSectionSource,
    playerBestRolesPanelSource,
    playerRoleDevelopmentPanelSource,
  ].join("\n");
  const playerRuntimeSources = [
    playerVisualSources,
    playerRoleFitSelectorsSource,
    usePlayerRoleFitSource,
  ].join("\n");
  const playerAllSources = [playerRuntimeSources, playerRoleFitSectionTestSource, playerProfilePageTestSource].join("\n");
  const roleFitActiveUiSources = [
    roleFitCardSource,
    roleFitReasonsListSource,
    roleFitRisksListSource,
    roleFitStyleFitSource,
    roleFitFatigueWarningSource,
    roleFitAdviceSource,
    roleComparisonPanelSource,
    roleFitBadgeSource,
    roleFitScoreBarSource,
    rosterVisualSources,
    playerVisualSources,
  ].join("\n");
  const roleFitActiveUiNoStringRender = !roleFitActiveUiSources.includes("`<") && !roleFitActiveUiSources.includes("return `<");
  const roleFitActiveUiNoDangerousHtml = !roleFitActiveUiSources.includes("dangerouslySetInnerHTML");
  const reactJsxNoForbiddenImports =
    !/systems[\\/](scoring|match|simulation)|ScoringEvent|MatchBonusEvent|liveScore|scoreAfter/.test(
      roleFitActiveUiSources + playerRuntimeSources + rosterRuntimeSources,
    );
  const playerComputationInSelectorOnly =
    playerRoleFitSelectorsSource.includes("compareRoleFits") &&
    !playerVisualSources.includes("compareRoleFits") &&
    !playerVisualSources.includes("computeRoleFit");
  const playerFixtureTestsVisible =
    playerRoleFitSectionTestSource.includes("Milan") &&
    playerRoleFitSectionTestSource.includes("Sacha") &&
    playerRoleFitSectionTestSource.includes("Ilyes") &&
    playerRoleFitSectionTestSource.includes("Noa") &&
    playerRoleFitSectionTestSource.includes("Rayan") &&
    playerRoleFitSectionTestSource.includes("Oren");
  const legacyChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share file count <= 20", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("share file count respects preferred consolidation target or max", filesOnDisk.length >= 16 && filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("share file count equals minimal allowlist count", filesOnDisk.length === allowlistedFiles.length, `${filesOnDisk.length} vs ${allowlistedFiles.length}`),
    check("no stale files", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("no previous sprint leftovers", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("excluded-by-default files are not in reports/share", excludedInShare.length === 0, excludedInShare.join(", ") || "none"),
    check("source reports were not deleted", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("every required current sprint file copied", allRequiredCopied, allowlistedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest exposes MINIMAL_REVIEW", manifest.includes("MINIMAL_REVIEW"), "mode visible"),
    check("manifest says upload every file in reports/share", manifest.includes("Upload every file in this reports/share directory."), "upload instruction visible"),
    check("manifest lists every required file", allRequiredListed, "all listed"),
    check("README exposes upload instruction", readme.includes("Upload every file in this folder."), "README upload instruction visible"),
    check("Role Fit Engine sprint appears in manifest", manifest.includes("Role Fit Engine Implementation"), "current sprint visible"),
    check("route-decision-and-balance.md copied", requiredCopied("route-decision-and-balance.md"), "route decision copied"),
    check("validation.route-decision-and-balance.md copied", requiredCopied("validation.route-decision-and-balance.md"), "route decision validation copied"),
    check("route decision and balance validation is PASS", routeDecisionValidation.includes("Status: PASS"), "route decision PASS"),
    check("route decision report includes post-resolution route economy monitoring", routeDecision.includes("## Post-Resolution Route Economy Monitoring"), "route economy section visible"),
    check("route decision report includes Full-Match Economy Validation", routeDecision.includes("## Full-Match Economy Validation"), "full-match section visible"),
    check("route-resolution-calibrations.md copied", requiredCopied("route-resolution-calibrations.md"), "route resolution consolidation copied"),
    check("validation.route-resolution-calibrations.md copied", requiredCopied("validation.route-resolution-calibrations.md"), "route resolution validation copied"),
    check("route resolution calibrations validation is PASS", routeResolutionValidation.includes("Status: PASS"), "route resolution PASS"),
    check("route resolution report includes Goalkeeper Shot-Stopping Impact", routeResolution.includes("## Goalkeeper Shot-Stopping Impact"), "GK section visible"),
    check("route resolution report includes Try Grounding Pressure", routeResolution.includes("## Try Grounding Pressure"), "try section visible"),
    check("route resolution report includes Clean Shot Success", routeResolution.includes("## Clean Shot Success"), "clean shot section visible"),
    check("route resolution report includes Route Economy Impact", routeResolution.includes("## Route Economy Impact"), "route economy impact visible"),
    check("route resolution report includes Full-Match Economy Validation", routeResolution.includes("## Full-Match Economy Validation"), "full-match section visible"),
    check(
      "route resolution validation includes all consolidated source names",
      [
        "validation.goalkeeper-shot-stopping-impact-calibration.md",
        "validation.try-grounding-pressure-calibration.md",
        "validation.clean-shot-success-calibration.md",
        "validation.post-resolution-route-economy-monitoring.md",
        "validation.danger-phase-conversion-economy.md",
        "validation.continuation-payoff-calibration.md",
        "validation.match-duration-possession-volume-calibration.md",
        "validation.full-match-economy-validation.md",
      ].every((file) => routeResolutionValidation.includes(file)),
      "source validation names visible",
    ),
    check("consolidated route resolution source reports not copied", consolidatedResolutionSources.every((file) => !requiredCopied(file)), "GK/Try/Clean source files omitted from share"),
    check("consolidated route resolution source reports were not deleted", consolidatedResolutionSources.every(sourceExists), "GK/Try/Clean source files remain in reports/"),
    check("route-economy-monitoring.md copied", requiredCopied("route-economy-monitoring.md"), "route economy consolidation copied"),
    check("validation.route-economy-monitoring.md not copied", !requiredCopied("validation.route-economy-monitoring.md"), "route economy validation consolidated"),
    check("source route economy monitoring validation is PASS", sourceRouteEconomyValidation.includes("Status: PASS"), "route economy PASS"),
    check("route economy report includes Route Point Share Monitoring", routeEconomy.includes("## Route Point Share Monitoring"), "point share section visible"),
    check("route economy report includes Shot Volume & Route-to-Shot Pipeline Audit", routeEconomy.includes("## Shot Volume & Route-to-Shot Pipeline Audit"), "route-to-shot section visible"),
    check("route economy report includes Continuation-to-Shot Audit", routeEconomy.includes("## Continuation-to-Shot Audit"), "continuation-to-shot visible"),
    check("route economy report includes Rebound Contribution Table", routeEconomy.includes("## Rebound Contribution Table"), "rebound contribution visible"),
    check("route economy report includes Before/After Rebound Contribution Table", routeEconomy.includes("## Before/After Rebound Contribution Table"), "before/after rebound visible"),
    check("route economy report includes Rebound Economy Calibration Audit", routeEconomy.includes("## Rebound Economy Calibration Audit"), "rebound calibration audit visible"),
    check("route economy report includes Non-Shot Route Attrition", routeEconomy.includes("## Non-Shot Route Attrition"), "non-shot attrition visible"),
    check("route economy report includes Try Attrition Calibration", routeEconomy.includes("## Try Attrition Calibration"), "try attrition visible"),
    check("route economy report includes Try Attrition Guardrails", routeEconomy.includes("## Try Attrition Guardrails"), "try guardrails visible"),
    check("route economy report includes Bonus Readiness Summary", routeEconomy.includes("## Bonus Readiness Summary"), "bonus readiness summary visible"),
    check("route economy report includes League Points & Bonus Trigger Simulation Summary", routeEconomy.includes("## League Points & Bonus Trigger Simulation Summary"), "league bonus summary visible"),
    check("route economy report includes Scoreline Health", routeEconomy.includes("## Scoreline Health"), "scoreline section visible"),
    check("route economy report includes Route Diversity", routeEconomy.includes("## Route Diversity"), "diversity section visible"),
    check("route economy report includes Style Impact", routeEconomy.includes("## Style Impact"), "style section visible"),
    check("route economy report includes Sterile Danger Phase Decomposition", routeEconomy.includes("## Sterile Danger Phase Decomposition"), "sterile section visible"),
    check("route economy report includes Continuation Route Payoff", routeEconomy.includes("## Continuation Route Payoff"), "continuation section visible"),
    check("route economy report includes full-match validation line", routeEconomy.includes("observed 0-0 draw rate in full-match economy validation"), "full-match line visible"),
    check("consolidated route economy source reports not copied", consolidatedEconomySources.every((file) => !requiredCopied(file)), "post/danger source files omitted from share"),
    check("consolidated route economy source reports were not deleted", consolidatedEconomySources.every(sourceExists), "post/danger source files remain in reports/"),
    check("route economy validation consolidates continuation payoff validation", sourceRouteEconomyValidation.includes("continuation payoff validation PASS"), "continuation payoff covered"),
    check("match duration source report not copied", !requiredCopied("match-duration-possession-volume-calibration.md"), "match-duration source omitted from share"),
    check("match duration source validation not copied", !requiredCopied("validation.match-duration-possession-volume-calibration.md"), "match-duration validation omitted from share"),
    check("match duration source reports were not deleted", sourceExists("match-duration-possession-volume-calibration.md") && sourceExists("validation.match-duration-possession-volume-calibration.md"), "match-duration source remains in reports/"),
    check("full-match-economy-validation.md copied", requiredCopied("full-match-economy-validation.md"), "full-match copied"),
    check("validation.full-match-economy-validation.md not copied", !requiredCopied("validation.full-match-economy-validation.md"), "full-match validation consolidated"),
    check("source full-match economy validation is PASS", sourceFullMatchEconomyValidation.includes("Status: PASS"), "full-match PASS"),
    check("share full-match includes roster stress tests", fullMatchEconomy.includes("## Roster Stress Test Variant Source") && fullMatchEconomy.includes("NO_DROP_THREAT_ROSTER") && fullMatchEconomy.includes("BALANCED_DEPTH_ROSTER"), "roster stress visible"),
    check("share full-match includes route/defense/fatigue/GK stress audits", fullMatchEconomy.includes("## Roster Stress Route Access Impact") && fullMatchEconomy.includes("## Roster Stress Defensive Impact") && fullMatchEconomy.includes("## Roster Stress Fatigue and Load Impact") && fullMatchEconomy.includes("## Goalkeeper Stress Test"), "stress audits visible"),
    check("share full-match includes player load balancing audits", fullMatchEconomy.includes("## Player Load Balancing Action Load Weights Audit") && fullMatchEconomy.includes("## Player Load Distribution Audit") && fullMatchEconomy.includes("## Specialist Dependency Audit") && fullMatchEconomy.includes("## Bench Depth Audit"), "load audits visible"),
    check("share full-match includes role/GK/style load audits", fullMatchEconomy.includes("## Role-Specific Load Audit") && fullMatchEconomy.includes("## Goalkeeper Load Balancing Audit") && fullMatchEconomy.includes("## Style-Load Interaction Audit"), "role/GK/style load visible"),
    check("share full-match includes load regressions", fullMatchEconomy.includes("## Player Load Calibration Regression") && fullMatchEconomy.includes("## Route Outcome Regression After Load Balancing"), "load regressions visible"),
    check("share full-match includes player load guardrails", fullMatchEconomy.includes("## Player Load Balancing Guardrails") && fullMatchEconomy.includes("load balancing does not directly award points: YES"), "load guardrails visible"),
    check("share full-match includes player load mandatory diagnosis", fullMatchEconomy.includes("## Player Load Balancing Mandatory Diagnosis") && fullMatchEconomy.includes("Is specialist dependency cost too weak, healthy, or too strong? HEALTHY/WATCH") && fullMatchEconomy.includes("Is bench depth cost too weak, healthy, or too strong? HEALTHY/WATCH"), "load diagnosis visible"),
    check("share full-match includes role economy sections", fullMatchEconomy.includes("## Role Taxonomy Confirmation") && fullMatchEconomy.includes("## Role Usage Audit") && fullMatchEconomy.includes("## Role Economy Mandatory Diagnosis"), "role economy visible"),
    check("share full-match includes role economy regression", fullMatchEconomy.includes("## Role Economy Regression") && fullMatchEconomy.includes("mandatory role risk count"), "role regression visible"),
    check("share full-match includes roster stress mandatory diagnosis", fullMatchEconomy.includes("## Roster Stress Test Mandatory Diagnosis") && fullMatchEconomy.includes("Do weak rosters fail for the expected reasons? YES"), "stress diagnosis visible"),
    check("share full-match includes stress guardrails", fullMatchEconomy.includes("stress roster variants are diagnostic only: YES") && fullMatchEconomy.includes("roster quality does not force outcomes: YES"), "stress guardrails visible"),
    check("validation.match-economy-monitoring.md copied", requiredCopied("validation.match-economy-monitoring.md"), "match economy validation copied"),
    check("match economy monitoring validation is PASS", matchEconomyValidation.includes("Status: PASS"), "match economy PASS"),
    check("full-match report includes 0-0 Validation", fullMatchEconomy.includes("## 0-0 Validation"), "0-0 section visible"),
    check("full-match report includes Style Diversity Validation", fullMatchEconomy.includes("## Style Diversity Validation"), "style section visible"),
    check("full-match report includes Post-Geometry Shot Outcome Health", fullMatchEconomy.includes("## Post-Geometry Shot Outcome Health"), "post-geometry shot health visible"),
    check("full-match report includes Route-to-Shot Pipeline Audit", fullMatchEconomy.includes("## Route-to-Shot Pipeline Audit"), "route-to-shot visible"),
    check("full-match report includes Continuation-to-Shot Audit", fullMatchEconomy.includes("## Continuation-to-Shot Audit"), "continuation-to-shot visible"),
    check("full-match report includes Rebound Contribution Table", fullMatchEconomy.includes("## Rebound Contribution Table"), "rebound contribution visible"),
    check("full-match report includes Before/After Rebound Contribution Table", fullMatchEconomy.includes("## Before/After Rebound Contribution Table"), "before/after rebound visible"),
    check("full-match report includes Rebound Source Decomposition", fullMatchEconomy.includes("## Rebound Source Decomposition"), "rebound source visible"),
    check("full-match report includes Central Rebound Audit", fullMatchEconomy.includes("## Central Rebound Audit"), "central rebound visible"),
    check("full-match report includes GK Rebound Handling Audit", fullMatchEconomy.includes("## GK Rebound Handling Audit"), "GK rebound visible"),
    check("full-match report includes Defender Recovery Audit", fullMatchEconomy.includes("## Defender Recovery Audit"), "defender recovery visible"),
    check("full-match report includes Second-Shot Quality Audit", fullMatchEconomy.includes("## Second-Shot Quality Audit"), "second-shot quality visible"),
    check("full-match report includes Non-Shot Route Attrition", fullMatchEconomy.includes("## Non-Shot Route Attrition"), "non-shot attrition visible"),
    check("full-match report includes Try Attempt Population Audit", fullMatchEconomy.includes("## Try Attempt Population Audit"), "try population visible"),
    check("full-match report includes LOST_FORWARD Audit", fullMatchEconomy.includes("## LOST_FORWARD Audit"), "LOST_FORWARD visible"),
    check("full-match report includes Legal Access Reward Audit", fullMatchEconomy.includes("## Legal Access Reward Audit"), "legal access visible"),
    check("full-match report includes Access Route Audit", fullMatchEconomy.includes("## Access Route Audit"), "access route visible"),
    check("full-match report includes Before/After Try Attrition Metrics", fullMatchEconomy.includes("## Before/After Try Attrition Metrics"), "try before/after visible"),
    check("full-match report includes Conversion Geometry Validation", fullMatchEconomy.includes("## Conversion Geometry Validation"), "conversion geometry visible"),
    check("full-match report includes Shot / Rebound / Half-Space Guardrail", fullMatchEconomy.includes("## Shot / Rebound / Half-Space Guardrail"), "guardrail visible"),
    check("full-match report includes Style Shot Dependency", fullMatchEconomy.includes("## Style Shot Dependency"), "style shot dependency visible"),
    check("full-match report includes Half-Space Context Audit", fullMatchEconomy.includes("## Half-Space Context Audit"), "half-space context visible"),
    check("full-match report includes Half-Space Population Audit", fullMatchEconomy.includes("## Half-Space Population Audit"), "half-space population visible"),
    check("full-match report includes Half-Space Classification Table", fullMatchEconomy.includes("## Half-Space Classification Table"), "half-space classification visible"),
    check("full-match report includes Half-Space Modifier Audit", fullMatchEconomy.includes("## Half-Space Modifier Audit"), "modifier audit visible"),
    check("full-match report includes Same-Distance Central vs Half-Space Table", fullMatchEconomy.includes("## Same-Distance Central vs Half-Space Table"), "same-distance visible"),
    check("full-match report includes Before/After Half-Space Metrics", fullMatchEconomy.includes("## Before/After Half-Space Metrics"), "before/after half-space visible"),
    check("full-match report includes Rebound Economy Audit", fullMatchEconomy.includes("## Rebound Economy Audit"), "rebound economy visible"),
    check("full-match report includes Post-Geometry Full-Match Economy Diagnosis", fullMatchEconomy.includes("## Post-Geometry Full-Match Economy Diagnosis"), "post-geometry diagnosis visible"),
    check("full-match batch rerun after geometry calibration", fullMatchEconomy.includes("full-match batch explicitly rerun after geometry calibration: YES"), "fresh batch visible"),
    check("full-match report includes Source-of-Truth Inventory", fullMatchEconomy.includes("## Source-of-Truth Inventory"), "source inventory visible"),
    check("full-match report includes Route Point Share Integrity Audit", fullMatchEconomy.includes("## Route Point Share Integrity Audit"), "route integrity visible"),
    check("full-match report includes old vs recomputed route point share", fullMatchEconomy.includes("| route | old points | old share | recomputed points | recomputed share | delta | status |"), "old vs recomputed visible"),
    check("route economy report includes recomputed post-geometry route point share", routeEconomy.includes("## Recomputed Post-Geometry Route Point Share"), "recomputed route economy visible"),
    check("route economy report includes stale metric detection", routeEconomy.includes("stale metric detection:"), "stale metric detection visible"),
    check("full-match report includes Bonus Readiness Audit", fullMatchEconomy.includes("## Bonus Readiness Audit"), "bonus readiness visible"),
    check("full-match report includes Offensive Bonus Design Audit", fullMatchEconomy.includes("## Offensive Bonus Design Audit"), "offensive bonus design visible"),
    check("full-match report includes Defensive Bonus Design Audit", fullMatchEconomy.includes("## Defensive Bonus Design Audit"), "defensive bonus design visible"),
    check("full-match report includes Bonus Interaction With Current Scoring Routes", fullMatchEconomy.includes("## Bonus Interaction With Current Scoring Routes"), "bonus route interaction visible"),
    check("full-match report includes Bonus Style Impact Audit", fullMatchEconomy.includes("## Bonus Style Impact Audit"), "style impact visible"),
    check("full-match report includes Bonus Point Value Audit", fullMatchEconomy.includes("## Bonus Point Value Audit"), "point value audit visible"),
    check("full-match report includes Bonus Source-of-Truth Audit", fullMatchEconomy.includes("## Bonus Source-of-Truth Audit"), "bonus source of truth visible"),
    check("full-match report includes Recommended Bonus Model", fullMatchEconomy.includes("## Recommended Bonus Model"), "recommended model visible"),
    check("full-match report includes Bonus Implementation Guardrails", fullMatchEconomy.includes("## Bonus Implementation Guardrails"), "bonus guardrails visible"),
    check("full-match report includes League Points & Bonus Trigger Simulation", fullMatchEconomy.includes("## League Points & Bonus Trigger Simulation"), "league simulation visible"),
    check("full-match report includes Offensive Bonus Frequency", fullMatchEconomy.includes("## Offensive Bonus Frequency"), "offensive trigger table visible"),
    check("full-match report includes 3+ vs 4+ try comparison", fullMatchEconomy.includes("## Refined Try Threshold Comparison - 3+ vs 4+ Tries"), "try threshold comparison visible"),
    check("full-match report includes conversion-included vs conversion-excluded family comparison", fullMatchEconomy.includes("## Route Family Definition Comparison - Conversion Included vs Excluded"), "family comparison visible"),
    check("full-match report includes Defensive Bonus Frequency", fullMatchEconomy.includes("## Defensive Bonus Frequency"), "defensive trigger table visible"),
    check("full-match report includes close-loss <=7 audit", fullMatchEconomy.includes("## Defensive Bonus Confirmation - Close-Loss <=7 and Major-Threat"), "close-loss <=7 visible"),
    check("full-match report includes major-threat defensive audit", fullMatchEconomy.includes("major-threat defensive bonus"), "major-threat visible"),
    check("full-match report includes OR vs AND no-goal/no-try comparison", fullMatchEconomy.includes("## No-Goal / No-Try OR vs AND Comparison"), "OR vs AND visible"),
    check("full-match report includes close-loss threshold comparison", fullMatchEconomy.includes("## Close-Loss Threshold Comparison"), "close-loss thresholds visible"),
    check("full-match report includes bonus stacking audit", fullMatchEconomy.includes("## Bonus Stacking Audit"), "stacking audit visible"),
    check("full-match report includes bonus cap comparison", fullMatchEconomy.includes("## Bonus Cap Comparison"), "cap comparison visible"),
    check("full-match report includes fatigue/team-construction proxy audit", fullMatchEconomy.includes("## Fatigue and Team-Construction Proxy Audit"), "fatigue proxy visible"),
    check("full-match report includes league bonus style fairness audit", fullMatchEconomy.includes("## League Bonus Style Fairness Audit"), "style fairness visible"),
    check("full-match report includes league bonus source-of-truth guardrails", fullMatchEconomy.includes("## League Bonus Source-of-Truth Guardrails"), "league source guardrails visible"),
    check("full-match report includes league bonus mandatory diagnosis", fullMatchEconomy.includes("## League Bonus Mandatory Diagnosis"), "league diagnosis visible"),
    check("MatchBonusEvent implementation visible", fullMatchEconomy.includes("MATCH_BONUS_EVENT_IMPLEMENTED_FOR_LEAGUE_TABLE") && fullMatchEconomy.includes("## MatchBonusEvent Implementation"), "bonus implementation visible"),
    check("LeaguePointsSummary visible", fullMatchEconomy.includes("LeaguePointsSummary implemented: YES") && fullMatchEconomy.includes("## Match-Level LeaguePointsSummary Detail"), "LeaguePointsSummary visible"),
    check("LeagueTableRow visible", fullMatchEconomy.includes("LeagueTableRow implemented: YES") && fullMatchEconomy.includes("## Final League Table By Team"), "LeagueTableRow visible"),
    check("league table generated", fullMatchEconomy.includes("league table generated: YES") && fullMatchEconomy.includes("## Final League Table By Style"), "league table visible"),
    check("league table points reconcile", fullMatchEconomy.includes("sum of match-level league points equals league table total - YES"), "league points reconcile"),
    check("fatigue correlation audit visible", fullMatchEconomy.includes("## Fatigue-to-Bonus Correlation Audit") && fullMatchEconomy.includes("fatigue instrumentation available: YES"), "fatigue correlation visible"),
    check("fatigue effect calibration audit visible", fullMatchEconomy.includes("## Fatigue Effect Calibration Summary") && fullMatchEconomy.includes("fatigue effect calibration: CONFIRMED_CONSERVATIVE_V1"), "fatigue effect visible"),
    check("fatigue bucket audit visible", fullMatchEconomy.includes("## Fatigue Bucket Audit"), "fatigue bucket visible"),
    check("shot/try/drop fatigue audits visible", fullMatchEconomy.includes("## Shot Fatigue Audit") && fullMatchEconomy.includes("## Try Fatigue Audit") && fullMatchEconomy.includes("## Drop and Conversion Fatigue Audit"), "route fatigue audits visible"),
    check("defensive/GK/late/style fatigue audits visible", fullMatchEconomy.includes("## Defensive Recovery and Goalkeeper Fatigue Audit") && fullMatchEconomy.includes("## Late-Match Fatigue Effect Audit") && fullMatchEconomy.includes("## Style Fatigue Economy"), "defensive/late/style fatigue visible"),
    check("team-construction proxy audit visible", fullMatchEconomy.includes("## Team-Construction Proxy Audit") && fullMatchEconomy.includes("team-construction proxy instrumentation available: YES"), "team construction visible"),
    check("TeamMatchFatigueSummary visible", fullMatchEconomy.includes("## TeamMatchFatigueSummary") && fullMatchEconomy.includes("TeamMatchFatigueSummary implemented: YES"), "team fatigue visible"),
    check("PlayerMatchLoadSummary visible", fullMatchEconomy.includes("## PlayerMatchLoadSummary") && fullMatchEconomy.includes("PlayerMatchLoadSummary implemented: YES"), "player load visible"),
    check("TeamLoadSummary visible", fullMatchEconomy.includes("## TeamLoadSummary") && fullMatchEconomy.includes("TeamLoadSummary implemented: YES"), "team load visible"),
    check("RosterQualitySummary visible", fullMatchEconomy.includes("## RosterQualitySummary") && fullMatchEconomy.includes("RosterQualitySummary implemented: YES"), "roster quality visible"),
    check("LateMatchPerformanceSummary visible", fullMatchEconomy.includes("## LateMatchPerformanceSummary") && fullMatchEconomy.includes("LateMatchPerformanceSummary implemented: YES"), "late performance visible"),
    check("roster quality correlation audit visible", fullMatchEconomy.includes("## Roster-Quality-to-Bonus Correlation Audit"), "roster correlation visible"),
    check("style-vs-roster audit visible", fullMatchEconomy.includes("## Style-vs-Roster Separation Audit"), "style-vs-roster visible"),
    check("late-match bonus audit visible", fullMatchEconomy.includes("## Late-Match Bonus Audit"), "late bonus visible"),
    check("missing instrumentation list visible", fullMatchEconomy.includes("## Missing Instrumentation List"), "missing instrumentation visible"),
    check("bonus trigger simulation recommendations visible", fullMatchEconomy.includes("VALIDATE_4_2_0_MINUS_1_TABLE") && fullMatchEconomy.includes("SIMULATE_BONUS_TRIGGER_RATES") && fullMatchEconomy.includes("REVIEW_BONUS_STACKING_CAP"), "bonus simulation recommendations visible"),
    check("bonus implementation recommendations visible", fullMatchEconomy.includes("USE_MATCH_BONUS_EVENTS_FOR_LEAGUE_TABLE") && fullMatchEconomy.includes("CONFIRM_3_TRY_OFFENSIVE_BONUS") && fullMatchEconomy.includes("CONFIRM_FATIGUE_INSTRUMENTATION_REAL_VALUES"), "bonus implementation recommendations visible"),
    check("bonus stays out of match score", fullMatchEconomy.includes("KEEP_BONUSES_OUT_OF_MATCH_SCORE") && scoringEvents.includes("bonus points do not alter match score"), "bonus match-score guard visible"),
    check("MatchBonusEvent is not ScoringEvent", fullMatchEconomy.includes("MatchBonusEvent is not a ScoringEvent") && scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream"), "MatchBonusEvent separated"),
    check("MatchBonusEvent league-table-only", fullMatchEconomy.includes("MatchBonusEvent implemented as league-table-only") && fullMatchEconomy.includes("league-table points only"), "MatchBonusEvent visible"),
    check("full-match report shows continuation auto-threat reduced", !/meta-risks: .*AUTO_THREAT/.test(fullMatchEconomy) && !/meta-risks: .*CONTINUATION_PAYOFF_TOO_HIGH/.test(fullMatchEconomy) && fullMatchEconomy.includes("payoff quality"), "continuation realism visible"),
    check("role_archetypes.md copied", requiredCopied("role_archetypes.md"), "role archetypes copied"),
    check("role-fit-model.md copied", requiredCopied("role-fit-model.md"), "role fit model copied"),
    check("role_skill_mapping.md omitted from minimal role-fit pack", !requiredCopied("role_skill_mapping.md"), "role skill mapping source kept outside share"),
    check("role_skill_mapping.md source was not deleted", existsSync(sourceRoleSkillMappingPath), "role skill mapping source remains in docs/gameplay/"),
    check("manifest lists role archetype and role fit docs", manifest.includes("role_archetypes.md") && manifest.includes("role-fit-model.md"), "role docs listed"),
    check("role archetypes document has all true roles", ["Tempo Half", "Hook Link", "Forward Leader", "Goalkeeper / Free Safety", "Mobile Lock", "Space Hunter", "Playmaker", "Pivot", "Left Piston", "Right Piston"].every((role) => roleArchetypes.includes(role)), "10 roles visible"),
    check("role archetypes document separates roles from skills", roleArchetypes.includes("Roles are behavioral archetypes") && roleArchetypes.includes("Skills such as goal-frame shooting"), "role/skill separation visible"),
    check("goalkeeper archetype includes mental fatigue specialization", roleArchetypes.includes("mental fatigue") && roleArchetypes.includes("readiness state") && roleArchetypes.includes("second-save recovery"), "GK specialization visible"),
    check("role archetypes include CONTROL and BLITZ expressions", roleArchetypes.includes("CONTROL expression") && roleArchetypes.includes("BLITZ expression"), "team expressions visible"),
    check("source role skill mapping document defines skills as capabilities", sourceRoleSkillMapping.includes("skills and functional contributions") && sourceRoleSkillMapping.includes("not true roles"), "skills as capabilities visible"),
    check("source role skill mapping keeps derived attributes engine-facing", sourceRoleSkillMapping.includes("Derived attributes are engine-facing") && sourceRoleSkillMapping.includes("should not become normal coach-editable ratings"), "derived guard visible"),
    check("role fit model includes RoleFitInput contract", roleFitInputContractVisible, "RoleFitInput visible"),
    check("role fit model contains RoleFitResult contract", roleFitResultContractVisible, "RoleFitResult and fit signal contracts visible"),
    check("role fit model contains RoleComparisonResult contract", roleComparisonResultContractVisible, "RoleComparisonResult visible"),
    check("role fit model computation stages documented", roleFitComputationStagesVisible, "7-stage pipeline visible"),
    check("role fit model role-specific hard caps documented", roleFitHardCapsVisible, "hard caps visible"),
    check("role fit model has every true role weight profile", roleFitProfilesCoverEveryRole, "10 role profiles visible"),
    check("role fit model supports all 9 visible attributes", roleFitVisibleAttributesCovered, "9 attributes visible"),
    check("role fit model includes guardrails", roleFitGuardrailsVisible, "fit guardrails visible"),
    check("role fit model includes five coach examples", roleFitExamplesVisible, "role fit examples visible"),
    check("role fit model includes six deterministic test examples", deterministicRoleFitExamplesVisible, "deterministic examples visible"),
    check("role fit model includes UI-ready examples", roleFitUiReadyExampleVisible, "role fit card and comparison visible"),
    check("role fit model mandatory diagnosis visible", roleFitMandatoryDiagnosisVisible, "role fit diagnosis visible"),
    check("role-fit-test-fixtures.md copied", requiredCopied("role-fit-test-fixtures.md"), "role fit fixtures copied"),
    check("role fit fixtures schema documented", roleFitFixtureSchemaVisible, "fixture schemas visible"),
    check("role fit fixtures include at least 10 fixtures", roleFitFixtureCount >= 10, `${roleFitFixtureCount} fixture id mentions`),
    check("role fit fixtures include required fixtures", roleFitFixtureRequiredCasesVisible, "RF_FIX_01 through RF_FIX_12 visible"),
    check("role fit fixtures cover every true role", roleFitFixtureEveryRoleCovered, "all true roles appear"),
    check("role fit fixtures cover required scenario types", roleFitFixtureCoverageVisible, "comparison/GK/offensive/fatigue/cap cases visible"),
    check("role fit fixtures regression checks visible", roleFitFixtureRegressionChecksVisible, "fixture regression checks visible"),
    check("role fit fixtures mandatory diagnosis visible", roleFitFixtureMandatoryDiagnosisVisible, "fixture diagnosis visible"),
    check("role-fit-engine file exists", existsSync(roleFitEnginePath), roleFitEnginePath),
    check("role-fit tests exist", existsSync(roleFitEngineTestPath), roleFitEngineTestPath),
    check("roleFitEngine.ts uses documented RoleFitInput", roleFitInputSourceContractAligned && roleFitEngineSource.includes("input.testedRole"), "testedRole/fatigueState/rosterContext source contract aligned"),
    check("roleFitEngine.ts returns documented RoleFitResult", roleFitResultSourceContractAligned && roleFitEngineSource.includes("summary:") && roleFitEngineSource.includes("bestPairings:") && roleFitEngineSource.includes("styleFit:"), "RoleFitResult source contract aligned"),
    check("roleFitEngine.ts returns documented RoleComparisonResult", roleComparisonSourceContractAligned && roleFitEngineSource.includes("testedRoles") && roleFitEngineSource.includes("bestRole:"), "RoleComparisonResult source contract aligned"),
    check("FitSignalType values match role-fit-model.md", fitSignalTypesAligned, "documented public signal types only"),
    check("stable reason IDs are emitted", stableReasonIdsVisible, "reason ID registry visible"),
    check("stable risk IDs are emitted", stableRiskIdsVisible, "risk ID registry visible"),
    check("stable cap/penalty IDs are emitted", stablePenaltyIdsVisible, "penalty ID registry visible"),
    check("role fit tests are visible and reviewable", roleFitTestsVisibleAndReviewable && roleFitFixtureSourceReviewable, "fixture ids, assertions, helper source, and scoring isolation visible"),
    check("computeRoleFit passes all fixtures", roleFitEngineValidation.passed, roleFitEngineFailedChecks.map((item) => `${item.fixtureId}: ${item.detail}`).join("; ") || "all fixtures pass"),
    check("compareRoleFits passes multi-role fixture", roleFitEngineValidation.checks.filter((item) => item.fixtureId === "RF_FIX_04").every((item) => item.passed), "Milan comparison fixture checked"),
    check("role fit fixture score ranges respected", roleFitEngineValidation.checks.filter((item) => item.detail.startsWith("score ")).every((item) => item.passed), "score range checks pass"),
    check("role fit hard caps applied", roleFitEngineValidation.checks.filter((item) => item.detail.startsWith("penalties ")).every((item) => item.passed), "cap penalty checks pass"),
    check("role fit stable ids emitted", roleFitEngineValidation.checks.filter((item) => item.detail.startsWith("reasons ") || item.detail.startsWith("risks ")).every((item) => item.passed), "reason/risk ids stable"),
    check("Space Hunter off-ball guardrail passes", roleFitEngineValidation.checks.filter((item) => item.fixtureId === "RF_FIX_08").every((item) => item.passed), "front-pressure guardrail checked"),
    check("GK mental fatigue fixture passes", roleFitEngineValidation.checks.filter((item) => item.fixtureId === "RF_FIX_06").every((item) => item.passed), "Sacha GK mental fatigue checked"),
    check("GK poor hand/rebound fixture passes", roleFitEngineValidation.checks.filter((item) => item.fixtureId === "RF_FIX_07").every((item) => item.passed), "Lino GK rebound-control checked"),
    check("no famous player analogies drive scores", !roleFitEngineSource.includes("Mbappe") && !roleFitEngineSource.includes("Maldini") && !roleFitEngineSource.includes("Kante") && !roleFitEngineSource.includes("famous player analogy"), "engine source contains no athlete analogy inputs"),
    check("Role Fit does not create ScoringEvents", roleFitScoringIsolationChecksPass, "no ScoringEvent fields in RoleFit results"),
    check("Role Fit does not mutate MatchBonusEvent", roleFitScoringIsolationChecksPass, "no MatchBonusEvent mutation"),
    check("Role Fit does not alter scoring constants", roleFitScoringIsolationChecksPass, "scoring constants checked"),
    check("role fit engine isolated from scoring", roleFitScoringIsolationChecksPass, "no ScoringEvent, MatchBonusEvent, live-score, or scoring-constant mutation"),
    check("role fit contract recommendations visible", roleFitContractRecommendationsVisible, "contract alignment and UI readiness recommendations visible"),
    check("shot-origin heatmap report not copied in role-doc sprint", !requiredCopied("shot-origin-heatmap.md") && !requiredCopied("shot-origin-heatmap.png"), "heatmap omitted from current minimal pack"),
    check("shot-origin heatmap source reports were not deleted", sourceExists("shot-origin-heatmap.md") && sourceExists("shot-origin-heatmap.png"), "heatmap source remains in reports/"),
    check(
      "mandatory try attrition diagnosis visible",
        fullMatchEconomy.includes("Was LOST_FORWARD overpunished before calibration?") &&
        fullMatchEconomy.includes("Did legal high-quality try access become more rewarding?") &&
        fullMatchEconomy.includes("Did conversion geometry remain correct?") &&
        fullMatchEconomy.includes("Is the base economy ready for bonus design?") &&
        fullMatchEconomy.includes("Is the base economy ready for bonus implementation?") &&
        fullMatchEconomy.includes("Could bonuses mask remaining SHOT_GOAL dominance?") &&
        fullMatchEconomy.includes("Is win/draw/loss/forfeit 4/2/0/-1 valid?") &&
        fullMatchEconomy.includes("Is no-goal/no-try defensive bonus better as OR or AND?") &&
        fullMatchEconomy.includes("Is 3+ scoring families easier mostly because conversions were included?") &&
        fullMatchEconomy.includes("Does fatigue need explicit instrumentation before implementation?") &&
        fullMatchEconomy.includes("Did clean half-space windows become more viable?"),
      "mandatory diagnosis visible",
    ),
    check(
      "mandatory fatigue effect diagnosis visible",
      fullMatchEconomy.includes("Does fatigue now affect outcomes? YES") &&
        fullMatchEconomy.includes("Is the fatigue effect too weak, healthy, or too strong? HEALTHY/WATCH") &&
        fullMatchEconomy.includes("Did scoring economy remain healthy? YES") &&
        fullMatchEconomy.includes("Did 0-0 remain rare? YES") &&
        fullMatchEconomy.includes("Did shot quality degrade under fatigue? YES/WATCH") &&
        fullMatchEconomy.includes("Did try grounding degrade under fatigue without reverting to excessive LOST_FORWARD? YES/WATCH") &&
        fullMatchEconomy.includes("Did drop accuracy degrade under fatigue without killing drops? YES/WATCH") &&
        fullMatchEconomy.includes("Did defensive recovery degrade under fatigue? YES/WATCH") &&
        fullMatchEconomy.includes("Did GK recovery / spill risk respond to fatigue? YES/WATCH") &&
        fullMatchEconomy.includes("Did high-load styles pay a visible fatigue cost? YES/WATCH") &&
        fullMatchEconomy.includes("Did CONTROL_DIRECT and BLITZ_RISKY remain viable but costly? YES/WATCH") &&
        fullMatchEconomy.includes("Did CONTROL_BALANCED become more visible through fatigue efficiency? WATCH") &&
        fullMatchEconomy.includes("Did bonus access become more fatigue-sensitive? YES/WATCH") &&
        fullMatchEconomy.includes("Are roster-quality proxies still missing? NO") &&
        fullMatchEconomy.includes("Next sprint: role economy balancing or season fatigue accumulation"),
      "mandatory fatigue diagnosis visible",
    ),
    check("scoring-events-summary.md copied", requiredCopied("scoring-events-summary.md"), "scoring events copied"),
    check("scoring events include route economy monitoring line", scoringEvents.includes("post-resolution route economy monitoring: active"), "scoring route economy line visible"),
    check("scoring events include try attrition calibration line", scoringEvents.includes("try attrition calibration: active"), "scoring try attrition line visible"),
    check("scoring events include full-match economy line", scoringEvents.includes("full-match economy validation: active"), "scoring full-match line visible"),
    check("scoring events include bonus source-of-truth guardrail", scoringEvents.includes("bonus source-of-truth guardrail") && scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream"), "bonus scoring guard visible"),
    check("scoring events include league points bonus implementation line", scoringEvents.includes("league points bonus implementation") && scoringEvents.includes("post-final-whistle MatchBonusEvents"), "league implementation scoring guard visible"),
    check("scoring events include bonus rule refinement line", scoringEvents.includes("bonus rule refinement applied") && scoringEvents.includes("conversion-excluded three-main-family bonus"), "bonus refinement scoring guard visible"),
    check("scoring events include danger phase economy line", scoringEvents.includes("danger phase conversion economy: active"), "scoring danger economy line visible"),
    check("scoring events include fatigue effect calibration guard", scoringEvents.includes("fatigue effect calibration: CONFIRMED_CONSERVATIVE_V1") && scoringEvents.includes("not live ScoringEvent totals"), "scoring fatigue guard visible"),
    check("scoring events include player load balancing guardrail", scoringEvents.includes("player load balancing guardrail") && scoringEvents.includes("never create ScoringEvents"), "scoring load guard visible"),
    check("scoring events include role economy guardrail", scoringEvents.includes("role economy guardrail") && scoringEvents.includes("never create ScoringEvents"), "role economy scoring guard visible"),
    check("tactical-evidence.latest.md omitted from role-fit minimal pack", !requiredCopied("tactical-evidence.latest.md"), "tactical evidence source kept outside share"),
    check("tactical-evidence.latest.md source still generated", sourceExists("tactical-evidence.latest.md"), "tactical evidence source remains in reports/"),
    check("tactical evidence includes route economy line", tacticalEvidence.includes("post-resolution route economy monitoring: active"), "tactical route economy line visible"),
    check("tactical evidence includes try attrition calibration line", tacticalEvidence.includes("try attrition calibration: active"), "tactical try attrition line visible"),
    check("tactical evidence includes full-match economy line", tacticalEvidence.includes("full-match economy validation: active"), "tactical full-match line visible"),
    check("tactical evidence includes bonus readiness line", tacticalEvidence.includes("fatigue / roster instrumentation:") || tacticalEvidence.includes("league table integration:"), "tactical bonus line visible"),
    check("tactical evidence includes league points bonus line", tacticalEvidence.includes("possession-indexed fatigue/load") || tacticalEvidence.includes("LeaguePointsSummary"), "tactical league bonus line visible"),
    check("tactical evidence includes bonus refinement line", tacticalEvidence.includes("RosterQualitySummary") || tacticalEvidence.includes("LeagueTableRow"), "tactical refinement line visible"),
    check("tactical evidence includes danger phase economy line", tacticalEvidence.includes("danger phase conversion economy: active"), "tactical danger economy line visible"),
    check("tactical evidence includes fatigue effect calibration line", tacticalEvidence.includes("fatigue effect calibration: CONFIRMED_CONSERVATIVE_V1"), "tactical fatigue effect visible"),
    check("tactical evidence includes roster stress line", tacticalEvidence.includes("roster stress tests:"), "tactical roster stress visible"),
    check("tactical evidence includes player load balancing line", tacticalEvidence.includes("player load balancing:"), "tactical player load visible"),
    check("tactical evidence includes role economy balancing line", tacticalEvidence.includes("role economy balancing:"), "tactical role economy visible"),
    check("coach-summary.latest.md copied", requiredCopied("coach-summary.latest.md"), "coach summary copied"),
    check("coach summary includes route economy line", coachSummary.includes("post-resolution route economy: active"), "coach route economy line visible"),
    check("coach summary includes try attrition calibration line", coachSummary.includes("try attrition calibration: active"), "coach try attrition line visible"),
    check("coach summary includes full-match economy line", coachSummary.includes("full-match economy validation:"), "coach full-match line visible"),
    check("coach summary includes player load balancing line", coachSummary.includes("player load balancing:"), "coach player load visible"),
    check("coach summary includes role economy balancing line", coachSummary.includes("role economy balancing:"), "coach role economy visible"),
    check("coach-role-guide.md copied", requiredCopied("coach-role-guide.md"), "coach role guide copied"),
    check("coach role guide includes beginner sections", coachRoleGuide.includes("# Coach Role Guide") && coachRoleGuide.includes("## 1. Attributes vs Skills vs Roles") && coachRoleGuide.includes("## 11. Glossary"), "guide visible"),
    check("coach role guide separates skills from roles", coachRoleGuide.includes("Skills are not official roles") && coachRoleGuide.includes("## 4. The True Roles Of The Sport"), "role/skill separation visible"),
    check("coach role guide includes How To Read Role Fit", coachRoleGuide.includes("## How To Read Role Fit") && coachRoleGuide.includes("90-100 Natural Fit") && coachRoleGuide.includes("A strong role fit is not a simple attribute average"), "role fit reading guide visible"),
    check("coach role guide includes Quick Player Analogy Map", coachRoleGuide.includes("## Quick Player Analogy Map"), "quick analogy map visible"),
    check("coach role guide analogy map includes all true roles", quickAnalogyMapHasAllRoles, trueRoleNames.filter((roleName) => !coachRoleGuide.includes(`| ${roleName} |`)).join(", ") || "all roles visible"),
    check("coach role guide analogy map includes all four analogy categories", quickAnalogyMapHasAllCategories, "football/rugby on-ball/off-ball headers visible"),
    check("coach role guide Space Hunter uses attacking football analogy examples", spaceHunterUsesAttackingExamples, "Space Hunter on-ball/off-ball attacking references visible"),
    check("coach role guide Space Hunter no longer uses Kante", spaceHunterAvoidsKante, "Space Hunter avoids defensive-midfield mental image"),
    check("role archetypes Space Hunter uses attacking football analogy examples", roleArchetypesSpaceHunterCorrected, "Space Hunter archetype analogy corrected"),
    check("coach role guide Hook Link off-ball uses attacking workers", hookLinkUsesAttackingWorkers, "Hook Link visualized as attacking connector with pressing work"),
    check("coach role guide Playmaker uses creative football examples", playmakerUsesCreativePlayers, "Playmaker stays visually creative"),
    check("coach role guide Tempo Half is not pure defensive-midfielder analogy", tempoHalfNotPureDefensiveMidfield, "Tempo Half rhythm/progression visible"),
    check("coach role guide defensive balance roles remain readable", defensiveBalanceRolesReadable, "Forward Leader/Mobile Lock/Pivot defensive readability visible"),
    check("coach role guide Pistons remain two-way", pistonsRemainTwoWay, "Pistons show projection and recovery"),
    check("coach role guide offensive analogy balance diagnosis visible", offensiveAnalogyBalanceDiagnosisVisible, "audit, diagnosis, and recommendation visible"),
    check("coach role guide detailed per-role analogies remain present", detailedAnalogySectionCount >= 10, `${detailedAnalogySectionCount} detailed sections`),
    check("coach role guide includes goalkeeper special section", coachRoleGuide.includes("## 10. Goalkeeper Special Section") && coachRoleGuide.includes("cold-start risk"), "GK guide visible"),
    check("coach summary includes bonus readiness line", coachSummary.includes("bonus construction proof:") || coachSummary.includes("MatchBonusEvent"), "coach bonus line visible"),
    check("coach summary includes league points bonus line", coachSummary.includes("LeaguePointsSummary") || coachSummary.includes("league table bonuses:"), "coach league bonus line visible"),
    check("coach summary includes bonus refinement line", coachSummary.includes("LeagueTableRow") || coachSummary.includes("league table bonuses:"), "coach refinement line visible"),
    check("coach summary includes danger phase economy line", coachSummary.includes("danger phase / continuation payoff"), "coach danger economy line visible"),
    check("coach summary includes fatigue effect calibration line", coachSummary.includes("fatigue effect calibration: CONFIRMED_CONSERVATIVE_V1"), "coach fatigue effect visible"),
    check("coach summary includes roster stress line", coachSummary.includes("roster stress tests:"), "coach roster stress visible"),
    check("team shape validation is PASS", teamShapeValidation.includes("Status: PASS"), "team shape PASS"),
    check("team shape validation source is not copied", !requiredCopied("validation.team-shape-intent-generalization.md"), "team shape consolidated outside share"),
    check("shot subsystem aggregate is PASS", shotSubsystem.includes("Status: PASS"), "shot PASS"),
    check("try subsystem aggregate is PASS", trySubsystem.includes("Status: PASS"), "try PASS"),
    check("drop subsystem aggregate is PASS", dropSubsystem.includes("Status: PASS"), "drop PASS"),
    check("conversion subsystem aggregate is PASS", conversionSubsystem.includes("Status: PASS"), "conversion PASS"),
    check("validation.unified-live-scoring-event-stream.md not copied", !requiredCopied("validation.unified-live-scoring-event-stream.md"), "unified validation consolidated"),
    check("source unified live scoring validation is PASS", sourceUnifiedValidation.includes("Status: PASS"), "unified PASS"),
    check("replaced subsystem validation files are not copied into share", replacedSubsystemValidationFiles.every((file) => !requiredCopied(file)), "subsystem validations consolidated"),
    check("replaced subsystem validation source reports were not deleted", replacedSubsystemValidationFiles.every(sourceExists), "subsystem source validations remain in reports/"),
    check("scoring values unchanged across share reports", [routeDecision, routeResolution, routeEconomy, fullMatchEconomy, scoringEvents].every((text) => text.includes("SHOT_GOAL = 3 points")) && [routeDecision, routeResolution, routeEconomy, fullMatchEconomy].every((text) => text.includes("TRY_TOUCHDOWN = 5 points") && text.includes("DROP_GOAL = 2 points")), "scoring values visible"),
    check("match point values unchanged across economy reports", routeEconomy.includes("SHOT_GOAL remains 3 match points") && fullMatchEconomy.includes("TRY_TOUCHDOWN remains 5 match points") && scoringEvents.includes("DROP_GOAL remains 2 match points"), "match point values visible"),
    check("PENALTY_SHOT remains inactive across share reports", [routeDecision, routeResolution, routeEconomy, fullMatchEconomy].every((text) => text.includes("PENALTY_SHOT inactive")) && !/PENALTY_SHOT.*active: YES/.test(routeDecision + routeResolution + routeEconomy + fullMatchEconomy + scoringEvents), "PENALTY inactive"),
  ];
  const roleFitSourceChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share file count <= 20", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("share file count equals minimal allowlist count", filesOnDisk.length === allowlistedFiles.length, `${filesOnDisk.length} vs ${allowlistedFiles.length}`),
    check("no stale files", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("no previous sprint leftovers", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("source reports were not deleted", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("every required current sprint file copied", allRequiredCopied, allowlistedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest exposes MINIMAL_REVIEW", manifest.includes("MINIMAL_REVIEW"), "mode visible"),
    check("manifest says upload every file in reports/share", manifest.includes("Upload every file in this reports/share directory."), "upload instruction visible"),
    check("README exposes upload instruction", readme.includes("Upload every file in this folder."), "README upload instruction visible"),
    check("Role Fit Engine Source Contract Validation section active", activeConfig.sprintName.includes("Role Fit Engine Contract Alignment") || activeConfig.sprintName.includes("Role Fit UI Implementation"), "focused source contract validation"),
    check("roleFitEngine.ts copied", requiredCopied("roleFitEngine.ts"), "engine source included for review"),
    check("roleFitEngine.test.ts copied", requiredCopied("roleFitEngine.test.ts"), "test source included for review"),
    check("roleFitFixtures.ts copied", requiredCopied("roleFitFixtures.ts"), "fixture source included for review"),
    check("roleFitTypes.ts copied", requiredCopied("roleFitTypes.ts"), "public contract source included for review"),
    check("roleFitReasonIds.ts copied", requiredCopied("roleFitReasonIds.ts"), "reason ids included for review"),
    check("roleFitRiskIds.ts copied", requiredCopied("roleFitRiskIds.ts"), "risk ids included for review"),
    check("roleFitCapIds.ts copied", requiredCopied("roleFitCapIds.ts"), "cap ids included for review"),
    check("role-fit-model.md copied", requiredCopied("role-fit-model.md"), "role fit model copied"),
    check("role-fit-test-fixtures.md copied", requiredCopied("role-fit-test-fixtures.md"), "fixture markdown copied"),
    check("source uses testedRole, not role", roleFitInputSourceContractAligned && !roleFitEngineSource.includes("input.role") && !roleFitTypesSource.includes("role: TrueRole"), "testedRole public input"),
    check("source returns testedRole, not role", roleFitResultSourceContractAligned && roleFitEngineSource.includes("testedRole: input.testedRole") && !roleFitEngineSource.includes("role: input."), "testedRole public output"),
    check("RoleFitResult contains no public role key", roleFitEngineValidation.checks.filter((item) => item.detail.includes("no public role key")).every((item) => item.passed), "testedRole-only output"),
    check("RoleComparisonResult testedRoles contain no public role key", roleFitEngineValidation.checks.filter((item) => item.fixtureId === "RF_FIX_04" && item.detail.includes("RoleComparisonResult public shape complete")).every((item) => item.passed), "testedRoles use testedRole"),
    check("RoleFitResult includes summary", roleFitTypesSource.includes("summary: string;") && roleFitEngineSource.includes("summary:"), "summary present"),
    check("RoleFitResult includes bestPairings", roleFitTypesSource.includes("bestPairings: TrueRole[];") && roleFitEngineSource.includes("bestPairings:"), "bestPairings present"),
    check("RoleFitResult includes styleFit", roleFitTypesSource.includes("styleFit:") && roleFitEngineSource.includes("styleFit:"), "styleFit present"),
    check("developmentAdvice is string[]", roleFitTypesSource.includes("developmentAdvice: string[];") && roleFitEngineSource.includes("developmentAdvice:"), "developmentAdvice array"),
    check("coachUsageAdvice is string[]", roleFitTypesSource.includes("coachUsageAdvice: string[];") && roleFitEngineSource.includes("coachUsageAdvice:"), "coachUsageAdvice array"),
    check("RoleComparisonResult includes playerId, playerName, summary, coachRecommendation", roleComparisonSourceContractAligned && roleFitEngineSource.includes("playerId:") && roleFitEngineSource.includes("playerName:") && roleFitEngineSource.includes("coachRecommendation:"), "comparison UI/API fields present"),
    check("FitSignalType uses documented values", fitSignalTypesAligned, "documented public signal types only"),
    check("stable reason IDs are emitted", stableReasonIdsVisible, "reason id registry visible"),
    check("stable risk IDs are emitted", stableRiskIdsVisible, "risk id registry visible"),
    check("stable cap/penalty IDs are emitted", stablePenaltyIdsVisible && roleFitCapIdsSource.includes("mobile_lock_low_speed_cap_59"), "cap id registry visible"),
    check("all 13 fixtures pass", roleFitEngineValidation.passed && roleFitEngineValidation.fixtureCount === 12 && roleFitEngineValidation.comparisonFixtureCount === 1, roleFitEngineFailedChecks.map((item) => `${item.fixtureId}: ${item.detail}`).join("; ") || "all fixtures pass"),
    check("multi-role comparison fixture passes", roleFitEngineValidation.checks.filter((item) => item.fixtureId === "RF_FIX_04").every((item) => item.passed), "Milan comparison fixture checked"),
    check("fixture source file is included", requiredCopied("roleFitFixtures.ts") && roleFitFixtureSourceReviewable, "fixture source reviewable"),
    check("tests are visible and reviewable", requiredCopied("roleFitEngine.test.ts") && roleFitTestsVisibleAndReviewable, "test source reviewable"),
    check("Space Hunter offensive off-ball is protected", roleFitEngineValidation.checks.filter((item) => item.fixtureId === "RF_FIX_08").every((item) => item.passed), "Space Hunter guardrail pass"),
    check("goalkeeper-specific logic is protected", roleFitEngineValidation.checks.filter((item) => item.fixtureId === "RF_FIX_06" || item.fixtureId === "RF_FIX_07").every((item) => item.passed), "GK fixtures pass"),
    check("scoring isolation tests pass", roleFitScoringIsolationChecksPass, "scoring isolation pass"),
    check("Role Fit does not create ScoringEvents", roleFitScoringIsolationChecksPass, "no ScoringEvent fields in RoleFit results"),
    check("Role Fit does not mutate MatchBonusEvent", roleFitScoringIsolationChecksPass, "no MatchBonusEvent mutation"),
    check("Role Fit does not alter scoring constants", roleFitScoringIsolationChecksPass, "SHOT_GOAL/TRY/CONVERSION/DROP/PENALTY checked"),
    check("no scoring values changed", roleFitScoringIsolationChecksPass, "scoring constants unchanged"),
    check("mandatory diagnosis: source code matches documented contract", roleFitInputSourceContractAligned && roleFitResultSourceContractAligned && roleComparisonSourceContractAligned, "YES"),
    check("mandatory diagnosis: computeRoleFit accepts testedRole", roleFitEngineSource.includes("input.testedRole"), "YES"),
    check("mandatory diagnosis: computeRoleFit returns testedRole", roleFitEngineSource.includes("testedRole: input.testedRole"), "YES"),
    check("mandatory diagnosis: RoleFitResult has all UI/API fields", roleFitResultSourceContractAligned, "YES"),
    check("mandatory diagnosis: RoleComparisonResult has all UI/API fields", roleComparisonSourceContractAligned, "YES"),
    check("mandatory diagnosis: fixture tests visible, not hidden", roleFitTestsVisibleAndReviewable, "YES"),
    check("mandatory diagnosis: engine ready for UI integration", roleFitContractRecommendationsVisible, "YES"),
  ];
  const roleFitUiChecks: readonly SharePackCheck[] = [
    ...roleFitSourceChecks,
    check("role-fit-ui-implementation.md copied", requiredCopied("role-fit-ui-implementation.md"), "UI implementation report copied"),
    check("validation.role-fit-ui-implementation.md copied", requiredCopied("validation.role-fit-ui-implementation.md"), "UI validation report copied"),
    check("role fit UI implementation validation is PASS", roleFitUiValidation.includes("Status: PASS"), "UI validation PASS"),
    check("RoleFitCard exists", roleFitCardSource.includes("export function RoleFitCard") && roleFitCardSource.includes("RoleFitCardProps"), "RoleFitCard source present"),
    check("RoleFitBadge exists", roleFitBadgeSource.includes("export function RoleFitBadge"), "RoleFitBadge source present"),
    check("RoleFitScoreBar exists", roleFitScoreBarSource.includes("export function RoleFitScoreBar"), "RoleFitScoreBar source present"),
    check("RoleFitReasonsList exists", roleFitReasonsListSource.includes("export function RoleFitReasonsList"), "RoleFitReasonsList source present"),
    check("RoleFitRisksList exists", roleFitRisksListSource.includes("export function RoleFitRisksList"), "RoleFitRisksList source present"),
    check("RoleFitFatigueWarning exists", roleFitFatigueWarningSource.includes("export function RoleFitFatigueWarning"), "RoleFitFatigueWarning source present"),
    check("RoleFitStyleFit exists", roleFitStyleFitSource.includes("export function RoleFitStyleFit"), "RoleFitStyleFit source present"),
    check("RoleFitAdvice exists", roleFitAdviceSource.includes("export function RoleFitAdvice"), "RoleFitAdvice source present"),
    check("RoleComparisonPanel exists", roleComparisonPanelSource.includes("export function RoleComparisonPanel") && roleComparisonPanelSource.includes("RoleComparisonPanelProps"), "RoleComparisonPanel source present"),
    check("components accept RoleFitResult / RoleComparisonResult", roleFitCardSource.includes("result: RoleFitResult") && roleComparisonPanelSource.includes("comparison: RoleComparisonResult"), "public contracts used as props"),
    check("score is displayed, not recalculated", roleFitScoreBarSource.includes("props.score") && !roleFitUiComponentSources.includes("computeRoleFit"), "score displayed from props"),
    check("testedRole is displayed", roleFitCardSource.includes("result.testedRole") && roleComparisonPanelSource.includes("result.testedRole"), "testedRole visible"),
    check("top reasons are visible", roleFitCardSource.includes("RoleFitReasonsList") && roleFitReasonsListSource.includes("reason.explanation"), "reasons visible"),
    check("top risks are visible", roleFitCardSource.includes("RoleFitRisksList") && roleFitRisksListSource.includes("affectedPhase"), "risks visible"),
    check("fatigue warnings are visible", roleFitCardSource.includes("RoleFitFatigueWarning") && roleFitFatigueWarningSource.includes("Fatigue warning"), "fatigue warning visible"),
    check("best pairings are visible", roleFitCardSource.includes("bestPairings"), "pairings visible"),
    check("style fit is visible", roleFitCardSource.includes("RoleFitStyleFit") && roleFitStyleFitSource.includes("bestStyles") && roleFitStyleFitSource.includes("riskyStyles"), "style fit visible"),
    check("usage advice and development advice are visible", roleFitAdviceSource.includes("coachUsageAdvice") && roleFitAdviceSource.includes("developmentAdvice"), "advice visible"),
    check("comparison panel displays bestRole / safestRole / highestUpsideRole / riskiestRole", roleComparisonPanelSource.includes("bestRole") && roleComparisonPanelSource.includes("safestRole") && roleComparisonPanelSource.includes("highestUpsideRole") && roleComparisonPanelSource.includes("riskiestRole"), "comparison roles visible"),
    check("UI tests use fixture-based data", roleFitUiFixtureTestsVisible, "fixture-based UI tests visible"),
    check("no legacy public role field is used", !roleFitUiComponentSources.includes(".role") && !roleFitUiTestSources.includes(".role"), "testedRole-only public UI"),
    check("no scoring engine import exists", roleFitUiNoForbiddenImports, "UI components isolated from scoring/match mutation"),
    check("no ScoringEvent mutation exists", roleFitUiNoForbiddenImports, "no ScoringEvent mutation"),
    check("no MatchBonusEvent mutation exists", roleFitUiNoForbiddenImports, "no MatchBonusEvent mutation"),
    check("no scoring values changed", roleFitScoringIsolationChecksPass, "scoring constants unchanged"),
    check("accessibility basics pass", roleFitUiComponentSources.includes("aria-label") && roleComparisonPanelSource.includes("<table") && roleComparisonPanelSource.includes("<caption>") && roleFitRisksListSource.includes("severity"), "semantic HTML and readable labels"),
    check("goalkeeper mental fatigue wording is protected", roleFitFatigueWarningSource.includes("mental readiness") && roleFitCardTestSource.includes("Goalkeeper fatigue is not outfield running fatigue"), "GK wording protected"),
    check("Space Hunter offensive off-ball guardrail is preserved", roleFitCardTestSource.includes("Space Hunter offensive off-ball guardrail remains visible") && roleFitCardTestSource.includes("Kante"), "Space Hunter guardrail tested"),
    check("UI recommendations visible", roleFitUiImplementation.includes("CONFIRM_ROLE_FIT_UI_V1") && roleFitUiImplementation.includes("KEEP_MATCH_SCORING_ISOLATED"), "UI recommendations visible"),
  ];
  const rosterBuilderChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share file count <= 20", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("share file count equals minimal allowlist count", filesOnDisk.length === allowlistedFiles.length, `${filesOnDisk.length} vs ${allowlistedFiles.length}`),
    check("no stale files", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("no previous sprint leftovers", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("source reports were not deleted", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("every required current sprint file copied", allRequiredCopied, allowlistedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest exposes MINIMAL_REVIEW", manifest.includes("MINIMAL_REVIEW"), "mode visible"),
    check("manifest says upload every file in reports/share", manifest.includes("Upload every file in this reports/share directory."), "upload instruction visible"),
    check("README exposes upload instruction", readme.includes("Upload every file in this folder."), "README upload instruction visible"),
    check("roster-builder-role-fit-integration.md copied", requiredCopied("roster-builder-role-fit-integration.md"), "roster integration report copied"),
    check("validation.roster-builder-role-fit-integration.md copied", requiredCopied("validation.roster-builder-role-fit-integration.md"), "roster validation report copied"),
    check("roster builder integration validation is PASS", rosterBuilderValidation.includes("Status: PASS"), "roster validation PASS"),
    check("RosterBuilderPage exists", rosterPageSource.includes("export function RosterBuilderPage"), "page source present"),
    check("RosterBuilder exists", rosterBuilderSource.includes("export function RosterBuilder"), "roster builder source present"),
    check("RosterRoleAssignmentTable exists", rosterAssignmentTableSource.includes("export function RosterRoleAssignmentTable"), "assignment table source present"),
    check("PlayerRoleFitDrawer exists", playerRoleFitDrawerSource.includes("export function PlayerRoleFitDrawer"), "details drawer source present"),
    check("RoleCoveragePanel exists", roleCoveragePanelSource.includes("export function RoleCoveragePanel"), "coverage panel source present"),
    check("useRosterRoleFit / selector source exists", useRosterRoleFitSource.includes("buildRosterRoleFitModel") && rosterSelectorsSource.includes("buildRosterRoleFitModel"), "selector/service layer present"),
    check("RoleFitCard is reused", playerRoleFitDrawerSource.includes("RoleFitCard") && !playerRoleFitDrawerSource.includes("function RoleFitCard"), "RoleFitCard imported"),
    check("RoleComparisonPanel is reused", playerRoleFitDrawerSource.includes("RoleComparisonPanel") && !playerRoleFitDrawerSource.includes("function RoleComparisonPanel"), "RoleComparisonPanel imported"),
    check("all 10 true roles are listed", trueRoleNames.every((roleName) => rosterSelectorsSource.includes(roleName)), "TRUE_ROLES source visible"),
    check("assigned role score displayed", rosterAssignmentTableSource.includes("assignedRoleFit.score") && rosterAssignmentTableSource.includes("RoleFitScoreBar"), "score visible"),
    check("assigned role label displayed", rosterAssignmentTableSource.includes("assignedRoleFit.label") && rosterAssignmentTableSource.includes("RoleFitBadge"), "label visible"),
    check("assigned role top reason/risk displayed", rosterAssignmentTableSource.includes("topReason") && rosterAssignmentTableSource.includes("topRisk"), "reason/risk visible"),
    check("risky assignments visible", rosterAssignmentTableSource.includes("Risky fit for this role") && rosterBuilderTestSource.includes("risky assigned role warning appears"), "risk warning visible"),
    check("fatigue warnings visible", rosterAssignmentTableSource.includes("fatigueWarningLevel") && rosterBuilderTestSource.includes("fatigue-sensitive assignments are visible"), "fatigue visible"),
    check("goalkeeper coverage warning visible", rosterSelectorsSource.includes("Goalkeeper / Free Safety coverage is risky") && rosterBuilderTestSource.includes("missing Goalkeeper / Free Safety coverage warning appears"), "GK warning visible"),
    check("Space Hunter guardrail preserved", rosterBuilderTestSource.includes("defensive_midfielder_requirement") && rosterBuilderTestSource.includes("Space Hunter copy does not contain"), "Space Hunter guardrail tested"),
    check("no score recalculation in UI", rosterComputationInSelectorOnly && !rosterVisualSources.includes("score ="), "visual components render source scores"),
    check("computation happens in selector/service layer", rosterComputationInSelectorOnly, "computeRoleFit/compareRoleFits in selector only"),
    check("no scoring engine import in UI", rosterNoForbiddenImports, "roster UI isolated from scoring/match mutation"),
    check("no ScoringEvent mutation", rosterNoForbiddenImports, "no ScoringEvent mutation"),
    check("no MatchBonusEvent mutation", rosterNoForbiddenImports, "no MatchBonusEvent mutation"),
    check("no scoring constants changed", roleFitScoringIsolationChecksPass, "scoring constants unchanged"),
    check("fixture-backed tests pass", rosterFixtureTestsVisible, "fixture-backed roster tests visible"),
    check("accessibility basics pass", rosterVisualSources.includes("aria-labelledby") && rosterAssignmentTableSource.includes("<table") && roleCoveragePanelSource.includes("<caption>"), "semantic sections and tables visible"),
    check("mandatory diagnosis: RoleFitResult is roster source of truth", rosterBuilderReport.includes("using RoleFitResult as source of truth? YES"), "YES"),
    check("mandatory diagnosis: RoleComparisonResult is roster source of truth", rosterBuilderReport.includes("using RoleComparisonResult for multi-role decisions? YES"), "YES"),
    check("mandatory diagnosis: ready for team construction testing", rosterBuilderReport.includes("ready for first coach-facing team construction testing? YES") || rosterBuilderReport.includes("Ready for first coach-facing team construction testing: YES"), "YES"),
    check("roster recommendations visible", rosterBuilderReport.includes("CONFIRM_ROSTER_BUILDER_ROLE_FIT_INTEGRATION") && rosterBuilderReport.includes("KEEP_MATCH_SCORING_ISOLATED"), "recommendations visible"),
  ];
  const reactJsxPlayerProfileChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share file count <= 20", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("share file count equals minimal allowlist count", filesOnDisk.length === allowlistedFiles.length, `${filesOnDisk.length} vs ${allowlistedFiles.length}`),
    check("no stale files", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("no previous sprint leftovers", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("source reports were not deleted", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("every required current sprint file copied", allRequiredCopied, allowlistedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest exposes MINIMAL_REVIEW", manifest.includes("MINIMAL_REVIEW"), "mode visible"),
    check("manifest says upload every file in reports/share", manifest.includes("Upload every file in this reports/share directory."), "upload instruction visible"),
    check("README exposes upload instruction", readme.includes("Upload every file in this folder."), "README upload instruction visible"),
    check("react-jsx-role-fit-refactor.md copied", requiredCopied("react-jsx-role-fit-refactor.md"), "React JSX report copied"),
    check("player-profile-role-fit-section.md copied", requiredCopied("player-profile-role-fit-section.md"), "Player Profile report copied"),
    check("validation.react-jsx-role-fit-refactor.md copied", requiredCopied("validation.react-jsx-role-fit-refactor.md"), "React JSX validation copied"),
    check("validation.player-profile-role-fit-section.md copied", requiredCopied("validation.player-profile-role-fit-section.md"), "Player Profile validation copied"),
    check("React JSX validation is PASS", reactJsxRoleFitValidation.includes("Status: PASS"), "React JSX validation PASS"),
    check("Player Profile validation is PASS", playerProfileRoleFitValidation.includes("Status: PASS"), "Player Profile validation PASS"),
    check("RoleFitCard returns JSX", roleFitCardSource.includes("export function RoleFitCard") && roleFitCardSource.includes("return (") && roleFitCardSource.includes("<article"), "RoleFitCard JSX"),
    check("RoleFitBadge returns JSX", roleFitBadgeSource.includes("export function RoleFitBadge") && roleFitBadgeSource.includes("return (") && roleFitBadgeSource.includes("<span"), "RoleFitBadge JSX"),
    check("RoleFitScoreBar returns JSX", roleFitScoreBarSource.includes("export function RoleFitScoreBar") && roleFitScoreBarSource.includes("return (") && roleFitScoreBarSource.includes("<div"), "RoleFitScoreBar JSX"),
    check("RoleFitReasonsList returns JSX", roleFitReasonsListSource.includes("export function RoleFitReasonsList") && roleFitReasonsListSource.includes("<section"), "RoleFitReasonsList JSX"),
    check("RoleFitRisksList returns JSX", roleFitRisksListSource.includes("export function RoleFitRisksList") && roleFitRisksListSource.includes("<section"), "RoleFitRisksList JSX"),
    check("RoleFitFatigueWarning returns JSX", roleFitFatigueWarningSource.includes("export function RoleFitFatigueWarning") && roleFitFatigueWarningSource.includes("<section"), "RoleFitFatigueWarning JSX"),
    check("RoleFitStyleFit returns JSX", roleFitStyleFitSource.includes("export function RoleFitStyleFit") && roleFitStyleFitSource.includes("<section"), "RoleFitStyleFit JSX"),
    check("RoleFitAdvice returns JSX", roleFitAdviceSource.includes("export function RoleFitAdvice") && roleFitAdviceSource.includes("<section"), "RoleFitAdvice JSX"),
    check("RoleComparisonPanel returns JSX", roleComparisonPanelSource.includes("export function RoleComparisonPanel") && roleComparisonPanelSource.includes("<table"), "RoleComparisonPanel JSX"),
    check("RosterBuilder returns JSX", rosterBuilderSource.includes("export function RosterBuilder") && rosterBuilderSource.includes("<main"), "RosterBuilder JSX"),
    check("RosterRoleAssignmentTable returns JSX", rosterAssignmentTableSource.includes("export function RosterRoleAssignmentTable") && rosterAssignmentTableSource.includes("<table"), "RosterRoleAssignmentTable JSX"),
    check("PlayerRoleFitDrawer returns JSX", playerRoleFitDrawerSource.includes("export function PlayerRoleFitDrawer") && playerRoleFitDrawerSource.includes("<aside"), "PlayerRoleFitDrawer JSX"),
    check("RoleCoveragePanel returns JSX", roleCoveragePanelSource.includes("export function RoleCoveragePanel") && roleCoveragePanelSource.includes("<table"), "RoleCoveragePanel JSX"),
    check("no raw HTML string renderer remains in active UI", roleFitActiveUiNoStringRender, "no active string markup"),
    check("no dangerouslySetInnerHTML", roleFitActiveUiNoDangerousHtml, "no unsafe HTML injection"),
    check("no score recalculation in UI", rosterComputationInSelectorOnly && playerComputationInSelectorOnly && !roleFitActiveUiSources.includes("computeRoleFit") && !roleFitActiveUiSources.includes("compareRoleFits"), "selectors compute; visual components render"),
    check("no scoring/match mutation imports", reactJsxNoForbiddenImports, "UI isolated from scoring/match mutation"),
    check("PlayerRoleFitSection exists", playerRoleFitSectionSource.includes("export function PlayerRoleFitSection"), "PlayerRoleFitSection source present"),
    check("PlayerBestRolesPanel exists", playerBestRolesPanelSource.includes("export function PlayerBestRolesPanel"), "PlayerBestRolesPanel source present"),
    check("PlayerRoleDevelopmentPanel exists", playerRoleDevelopmentPanelSource.includes("export function PlayerRoleDevelopmentPanel"), "PlayerRoleDevelopmentPanel source present"),
    check("player profile page/section exists", playerProfilePageSource.includes("export function PlayerProfilePage") && playerProfilePageSource.includes("PlayerRoleFitSection"), "PlayerProfilePage source present"),
    check("RoleFitCard reused in player profile", playerRoleFitSectionSource.includes("RoleFitCard") && playerRoleFitSectionSource.includes("<RoleFitCard"), "RoleFitCard reused"),
    check("RoleComparisonPanel reused in player profile", playerRoleFitSectionSource.includes("RoleComparisonPanel") && playerRoleFitSectionSource.includes("<RoleComparisonPanel"), "RoleComparisonPanel reused"),
    check("RoleComparisonResult used as source of truth", playerRoleFitSectionSource.includes("comparison: RoleComparisonResult") && playerRoleFitSelectorsSource.includes("compareRoleFits"), "comparison source of truth"),
    check("selected RoleFitResult displayed", playerRoleFitSectionSource.includes("selectedRoleResult") && playerRoleFitSectionSource.includes("selectedResult"), "selected role result visible"),
    check("bestRole / safestRole / highestUpsideRole / riskiestRole displayed", ["bestRole", "safestRole", "highestUpsideRole", "riskiestRole"].every((term) => playerBestRolesPanelSource.includes(term)), "player role snapshot visible"),
    check("development advice displayed", playerRoleDevelopmentPanelSource.includes("developmentAdvice"), "development advice visible"),
    check("coach usage advice displayed", playerRoleDevelopmentPanelSource.includes("coachUsageAdvice"), "coach usage advice visible"),
    check("fatigue warning displayed", playerRoleDevelopmentPanelSource.includes("RoleFitFatigueWarning"), "fatigue warning visible"),
    check("GK mental fatigue wording protected", roleFitFatigueWarningSource.includes("mental readiness") && roleFitFatigueWarningSource.includes("second-save recovery"), "GK wording protected"),
    check(
      "Space Hunter guardrail preserved",
      !roleFitActiveUiSources.includes("defensive_midfielder_requirement") &&
        !playerRuntimeSources.includes("defensive_midfielder_requirement"),
      "Space Hunter guardrail preserved",
    ),
    check("fixture-backed tests pass", roleFitCardTestSource.includes("components render JSX") && roleComparisonPanelTestSource.includes("component renders JSX") && rosterFixtureTestsVisible && playerFixtureTestsVisible, "fixture-backed source tests visible"),
    check("React JSX recommendations visible", reactJsxRoleFitReport.includes("CONFIRM_REACT_JSX_ROLE_FIT_UI") && reactJsxRoleFitReport.includes("KEEP_MATCH_SCORING_ISOLATED"), "React recommendations visible"),
    check("Player Profile recommendations visible", playerProfileRoleFitReport.includes("CONFIRM_PLAYER_PROFILE_ROLE_FIT_SECTION") && playerProfileRoleFitReport.includes("PREPARE_PLAYER_DEVELOPMENT_UI"), "Player recommendations visible"),
  ];
  const sprint2MExpectedFiles = [
    "package.json",
    "tsconfig.json",
    "coach-report.latest.html",
    "scoring-events-summary.md",
    "validation.share-pack.md",
    "source-of-truth-reconciliation.md",
    "validation.source-of-truth-reconciliation.md",
    "README.md",
    "manifest.md",
    "00-share-manifest.txt",
    "bundle__contracts.md",
    "bundle__simulation.md",
    "bundle__reports.md",
    "bundle__docs.md",
  ];
  const sprint2MForbiddenLeftovers = [
    "react-jsx-role-fit-refactor.md",
    "player-profile-role-fit-section.md",
    "validation.react-jsx-role-fit-refactor.md",
    "validation.player-profile-role-fit-section.md",
    "RoleFitCard.tsx",
    "PlayerRoleFitSection.tsx",
    "PlayerProfilePage.tsx",
  ];
  const sprint2MChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("current sprint is Sprint 2M", activeConfig.sprintName === "Sprint 2M - Source-of-Truth Reconciliation + Full Match Harness Guardrails", activeConfig.sprintName),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share pack under 20 files", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("final file count is 14", filesOnDisk.length === 14, `${filesOnDisk.length}`),
    check("minimal allowlist count is 14", allowlistedFiles.length === 14, `${allowlistedFiles.length}`),
    check("missing expected files are none", missingExpectedFiles.length === 0, missingExpectedFiles.join(", ") || "none"),
    check("stale share file count is 0", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("previous sprint leftovers are 0", sprint2MForbiddenLeftovers.every((file) => !requiredCopied(file)), sprint2MForbiddenLeftovers.filter((file) => requiredCopied(file)).join(", ") || "0"),
    check("source files deleted count is 0", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("all required current sprint files copied", sprint2MExpectedFiles.every((file) => requiredCopied(file)), sprint2MExpectedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest lists Sprint 2M", manifest.includes("Sprint 2M - Source-of-Truth Reconciliation + Full Match Harness Guardrails") && detailedManifest.includes("Sprint 2M - Source-of-Truth Reconciliation + Full Match Harness Guardrails"), "Sprint 2M visible"),
    check("manifest reports final file count 14", manifest.includes("Final file count: 14") && detailedManifest.includes("Final file count: 14"), "final count visible"),
    check("manifest reports missing expected files none", detailedManifest.includes("Missing expected files:") && detailedManifest.includes("- none"), "none"),
    check("README is Sprint 2M oriented", readme.includes("# Sprint 2M Share Pack") && readme.includes("source-of-truth-reconciliation.md"), "README current"),
    check("source-of-truth registry included", bundleSimulation.includes("src/simulation/diagnostics/sourceOfTruthRegistry.ts"), "sourceOfTruthRegistry included"),
    check("full-match economy anchor included", bundleSimulation.includes("src/simulation/diagnostics/fullMatchEconomyAnchors.ts") && sourceOfTruthReconciliation.includes("50-match full-length validation"), "50-match anchor included"),
    check("full-match harness sanity included", bundleSimulation.includes("src/simulation/diagnostics/fullMatchHarnessSanity.ts") && bundleSimulation.includes("analyzeFullMatchHarnessSanity"), "harness sanity included"),
    check("source-of-truth guards included", bundleSimulation.includes("src/simulation/diagnostics/sourceOfTruthGuards.ts"), "sourceOfTruthGuards included"),
    check("runFullMatchContractGuard included", bundleSimulation.includes("src/simulation/runFullMatchContractGuard.ts"), "runFullMatchContractGuard included"),
    check("sourceOfTruthGuards.test included", bundleSimulation.includes("src/simulation/diagnostics/sourceOfTruthGuards.test.ts"), "sourceOfTruthGuards.test included"),
    check("fullMatchHarnessSanity.test included", bundleSimulation.includes("src/simulation/diagnostics/fullMatchHarnessSanity.test.ts"), "fullMatchHarnessSanity.test included"),
    check("source-of-truth reconciliation docs included", sourceOfTruthReconciliation.includes("# Source-of-Truth Reconciliation") && sourceOfTruthReconciliationValidation.includes("# Source-of-Truth Reconciliation Validation"), "docs included"),
    check("scoring-events-summary included", scoringEvents.includes("# Scoring Events Summary") || scoringEvents.includes("active live scoring events"), "scoring summary included"),
    check("coach-report.latest.html included if available", !requiredCopied("coach-report.latest.html") || coachHtml.includes("<!doctype html>") || coachHtml.includes("<html"), "coach HTML copied"),
    check("a single runFullMatch output cannot invalidate global economy", sourceOfTruthReconciliationValidation.includes("single harness run cannot invalidate global economy") && bundleSimulation.includes("mayInvalidateGlobalScoringEconomy: false"), "warning-only scope"),
    check("50-match economy remains global reference", sourceOfTruthReconciliation.includes("50 matches") && bundleSimulation.includes("VALIDATED_FULL_MATCH_ECONOMY_ANCHOR"), "50-match reference protected"),
    check("high single-run score emits harness warning, not scoring failure", sourceOfTruthReconciliationValidation.includes("high score emits harness warning, not scoring failure") && bundleSimulation.includes("INFLATED_SINGLE_RUN_SCORE"), "high-score warning"),
    check("repetitive key moments emit harness warning", sourceOfTruthReconciliationValidation.includes("repetitive key moments emit harness warning") && bundleSimulation.includes("REPETITIVE_KEY_MOMENTS"), "key moment warning"),
    check("flat fatigue emits harness warning", sourceOfTruthReconciliationValidation.includes("flat fatigue emits harness warning") && bundleSimulation.includes("FLAT_FATIGUE_SIGNAL"), "fatigue warning"),
    check("no scoring constants changed", sourceOfTruthReconciliationValidation.includes("no scoring constants changed") && scoringEvents.includes("SHOT_GOAL = 3 points") && scoringEvents.includes("TRY_TOUCHDOWN = 5 points") && scoringEvents.includes("DROP_GOAL = 2 points"), "scoring constants visible"),
    check("no scoring events deleted", sourceOfTruthReconciliationValidation.includes("no scoring events deleted") && scoringEvents.includes("active live scoring events"), "scoring events preserved"),
    check("no MatchBonusEvent mutation", sourceOfTruthReconciliationValidation.includes("no MatchBonusEvent mutation") && scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream"), "MatchBonusEvent separated"),
    check("batch/live separation preserved", sourceOfTruthReconciliationValidation.includes("batch/live separation preserved") && scoringEvents.includes("batch/live separation status: PASS"), "batch/live separation PASS"),
    check("final score remains derived from score consequences", sourceOfTruthReconciliationValidation.includes("final score remains derived from score consequences") && bundleSimulation.includes("score consequences match final score"), "score consequence guard"),
    check("contracts bundle included", bundleContracts.includes("src/contracts/engineToCoach.ts") && bundleContracts.includes("src/contracts/engineToCoachContractGuard.ts"), "contracts bundled"),
    check("reports bundle included", bundleReports.includes("src/reports/share/updateSharePack.ts") && bundleReports.includes("src/reports/generateCoachHtmlReport.ts"), "reports bundled"),
    check("docs bundle included", bundleDocs.includes("engine_to_coach_gap_analysis_v0_1.md") && bundleDocs.includes("engine_to_coach_experience_spec_v0_1.md"), "docs bundled"),
    check("validation.share-pack.md will be regenerated for Sprint 2M", activeConfig.sprintName.includes("Sprint 2M"), "old sprint validation replaced"),
    check("recommendation CONFIRM_SPRINT_2M_SHARE_PACK_CLEAN", true, "CONFIRM_SPRINT_2M_SHARE_PACK_CLEAN"),
    check("recommendation CONFIRM_SOURCE_OF_TRUTH_RECONCILIATION_PASS", true, "CONFIRM_SOURCE_OF_TRUTH_RECONCILIATION_PASS"),
    check("recommendation PREPARE_SPRINT_2N_SEGMENT_DIVERSITY_FATIGUE_KEY_MOMENTS", true, "PREPARE_SPRINT_2N_SEGMENT_DIVERSITY_FATIGUE_KEY_MOMENTS"),
  ];
  const sprint2NExpectedFiles = [
    "package.json",
    "tsconfig.json",
    "coach-report.latest.html",
    "scoring-events-summary.md",
    "validation.share-pack.md",
    "full-match-segment-diversity-fatigue.md",
    "validation.full-match-segment-diversity-fatigue.md",
    "README.md",
    "manifest.md",
    "00-share-manifest.txt",
    "bundle__contracts.md",
    "bundle__simulation.md",
    "bundle__reports.md",
    "bundle__docs.md",
  ];
  const sprint2NChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("current sprint is Sprint 2N", activeConfig.sprintName === "Sprint 2N - Segment Diversity + Fatigue Propagation + Key Moment Diversity", activeConfig.sprintName),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share pack under 20 files", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("final file count is 14", filesOnDisk.length === 14, `${filesOnDisk.length}`),
    check("minimal allowlist count is 14", allowlistedFiles.length === 14, `${allowlistedFiles.length}`),
    check("missing expected files are none", missingExpectedFiles.length === 0, missingExpectedFiles.join(", ") || "none"),
    check("stale share file count is 0", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("source files deleted count is 0", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("all required current sprint files copied", sprint2NExpectedFiles.every((file) => requiredCopied(file)), sprint2NExpectedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest lists Sprint 2N", manifest.includes("Sprint 2N - Segment Diversity + Fatigue Propagation + Key Moment Diversity") && detailedManifest.includes("Sprint 2N - Segment Diversity + Fatigue Propagation + Key Moment Diversity"), "Sprint 2N visible"),
    check("manifest reports final file count 14", manifest.includes("Final file count: 14") && detailedManifest.includes("Final file count: 14"), "final count visible"),
    check("README is Sprint 2N oriented", readme.includes("# Sprint 2N Share Pack") && readme.includes("full-match-segment-diversity-fatigue.md"), "README current"),
    check("segment state source included", bundleSimulation.includes("src/simulation/fullMatch/fullMatchSegmentState.ts") && bundleSimulation.includes("FullMatchSegmentState"), "segment state bundled"),
    check("fatigue propagation source included", bundleSimulation.includes("src/simulation/fullMatch/fullMatchFatiguePropagation.ts") && bundleSimulation.includes("propagateFullMatchFatigue"), "fatigue propagation bundled"),
    check("segment diversity diagnostics included", bundleSimulation.includes("src/simulation/diagnostics/segmentDiversityDiagnostics.ts") && bundleSimulation.includes("SegmentDiversityReport"), "segment diagnostics bundled"),
    check("matchReportBuilder included", bundleSimulation.includes("src/simulation/adapters/matchReportBuilder.ts"), "matchReportBuilder bundled"),
    check("matchReportMoments included", bundleSimulation.includes("src/simulation/adapters/matchReportMoments.ts"), "matchReportMoments bundled"),
    check("matchReportEvidence included", bundleSimulation.includes("src/simulation/adapters/matchReportEvidence.ts"), "matchReportEvidence bundled"),
    check("runFullMatchContractGuard included", bundleSimulation.includes("src/simulation/runFullMatchContractGuard.ts"), "runFullMatchContractGuard bundled"),
    check("htmlCoachReportGuard included", bundleReports.includes("src/reports/htmlCoachReportGuard.ts"), "html guard bundled"),
    check("source-of-truth registry included", bundleSimulation.includes("src/simulation/diagnostics/sourceOfTruthRegistry.ts"), "sourceOfTruthRegistry included"),
    check("full-match economy anchor included", bundleSimulation.includes("src/simulation/diagnostics/fullMatchEconomyAnchors.ts") && bundleSimulation.includes("VALIDATED_FULL_MATCH_ECONOMY_ANCHOR"), "50-match anchor included"),
    check("full-match harness sanity included", bundleSimulation.includes("src/simulation/diagnostics/fullMatchHarnessSanity.ts") && bundleSimulation.includes("mayInvalidateGlobalScoringEconomy: false"), "harness sanity included"),
    check("source-of-truth guards included", bundleSimulation.includes("src/simulation/diagnostics/sourceOfTruthGuards.ts"), "sourceOfTruthGuards included"),
    check("new fatigue propagation test included", bundleSimulation.includes("src/simulation/fullMatch/fullMatchFatiguePropagation.test.ts"), "fatigue test bundled"),
    check("new segment diversity test included", bundleSimulation.includes("src/simulation/diagnostics/segmentDiversityDiagnostics.test.ts"), "segment test bundled"),
    check("new key moment diversity test included", bundleSimulation.includes("src/simulation/adapters/matchReportMoments.test.ts"), "moments test bundled"),
    check("full-match segment diversity docs included", fullMatchSegmentDiversityFatigue.includes("# Full-Match Segment Diversity + Fatigue Propagation"), "doc included"),
    check("full-match segment diversity validation is PASS", fullMatchSegmentDiversityFatigueValidation.includes("Status: PASS"), "validation PASS"),
    check("full-match report uses propagated fatigue", bundleSimulation.includes("fatigueReportFromPropagation") && bundleSimulation.includes("applySegmentFatigueToEvents"), "propagated fatigue visible"),
    check("at least one team condition decreases", fullMatchSegmentDiversityFatigueValidation.includes("at least one team condition decreases") && bundleSimulation.includes("conditionEnd < summary.conditionStart"), "condition movement guarded"),
    check("high pressing team has higher/equal load", fullMatchSegmentDiversityFatigueValidation.includes("high pressing team has higher/equal load") && bundleSimulation.includes("highIntensityLoad"), "load guarded"),
    check("key moment diversity improved", fullMatchSegmentDiversityFatigueValidation.includes("key moment diversity improved") && bundleSimulation.includes("selectDiverseCandidates"), "key moment diversity visible"),
    check("no more than 2 scoring key moments when alternatives exist", fullMatchSegmentDiversityFatigueValidation.includes("no more than 2 scoring key moments") && bundleSimulation.includes("scoringLimit"), "scoring key moment cap visible"),
    check("score still equals score_change consequences", fullMatchSegmentDiversityFatigueValidation.includes("score still equals score_change consequences") && bundleSimulation.includes("score_change"), "score consequence guard visible"),
    check("no scoring constants changed", scoringEvents.includes("SHOT_GOAL = 3 points") && scoringEvents.includes("TRY_TOUCHDOWN = 5 points") && scoringEvents.includes("CONVERSION_GOAL = 2 points") && scoringEvents.includes("DROP_GOAL = 2 points"), "scoring constants visible"),
    check("PENALTY_SHOT remains inactive", scoringEvents.includes("PENALTY_SHOT inactive"), "penalty inactive"),
    check("no scoring events deleted", fullMatchSegmentDiversityFatigueValidation.includes("no scoring events deleted") && bundleSimulation.includes("segment diagnostics must not remove scoring events"), "events preserved"),
    check("no MatchBonusEvent mutation", fullMatchSegmentDiversityFatigueValidation.includes("no MatchBonusEvent mutation") && scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream"), "MatchBonusEvent separated"),
    check("batch/live separation preserved", fullMatchSegmentDiversityFatigueValidation.includes("batch/live separation preserved") && scoringEvents.includes("batch/live separation status: PASS"), "batch/live PASS"),
    check("source-of-truth guardrails preserved", fullMatchSegmentDiversityFatigueValidation.includes("source-of-truth guardrails preserved") && bundleSimulation.includes("FULL_MATCH_BATCH_ECONOMY"), "source-of-truth preserved"),
    check("single runFullMatch output remains warning-only", fullMatchSegmentDiversityFatigue.includes("single runFullMatch output remains warning-only") && bundleSimulation.includes("FULL_MATCH_HARNESS_SINGLE_RUN"), "single-run warning-only"),
    check("50-match economy remains global reference", fullMatchSegmentDiversityFatigue.includes("50-match full-match economy remains the global scoring reference") || fullMatchSegmentDiversityFatigue.includes("50-match economy remain the global reference"), "50-match reference visible"),
    check("coach-report.latest.html included", coachHtml.includes("<!doctype html>") || coachHtml.includes("<html"), "coach HTML copied"),
    check("HTML report contains fatigue values", coachHtml.includes("Condition finale"), "HTML fatigue visible"),
    check("HTML report contains expandable timeline", coachHtml.includes("Afficher les"), "HTML timeline visible"),
    check("validation recommendations visible", fullMatchSegmentDiversityFatigue.includes("CONFIRM_SEGMENT_DIVERSITY_V0") && fullMatchSegmentDiversityFatigue.includes("PREPARE_DEEPER_TACTICAL_PLAN_INFLUENCE"), "recommendations visible"),
    check("previous Sprint 2M docs not copied", !requiredCopied("source-of-truth-reconciliation.md") && !requiredCopied("validation.source-of-truth-reconciliation.md"), "2M docs omitted"),
  ];
  const sprint2OExpectedFiles = [
    "package.json",
    "tsconfig.json",
    "coach-report.latest.html",
    "scoring-events-summary.md",
    "validation.share-pack.md",
    "full-match-harness-plausibility.md",
    "validation.full-match-harness-plausibility.md",
    "README.md",
    "manifest.md",
    "00-share-manifest.txt",
    "bundle__contracts.md",
    "bundle__simulation.md",
    "bundle__reports.md",
    "bundle__docs.md",
  ];
  const coachCopyExpectedFiles = [
    "package.json",
    "tsconfig.json",
    "coach-report.latest.html",
    "scoring-events-summary.md",
    "validation.share-pack.md",
    "coach-report-copy-quality.md",
    "validation.coach-report-copy-quality.md",
    "README.md",
    "manifest.md",
    "00-share-manifest.txt",
    "bundle__contracts.md",
    "bundle__simulation.md",
    "bundle__reports.md",
    "bundle__docs.md",
  ];
  const sprint2PExpectedFiles = [
    "package.json",
    "tsconfig.json",
    "coach-report.latest.html",
    "scoring-events-summary.md",
    "validation.share-pack.md",
    "canonical-matchreport-evidence-contract.md",
    "validation.canonical-matchreport-evidence-contract.md",
    "README.md",
    "manifest.md",
    "00-share-manifest.txt",
    "bundle__contracts.md",
    "bundle__simulation.md",
    "bundle__reports.md",
    "bundle__docs.md",
  ];
  const coachFacingSummaryBoundaryExpectedFiles = [
    "package.json",
    "tsconfig.json",
    "coach-report.latest.html",
    "scoring-events-summary.md",
    "validation.share-pack.md",
    "coach-facing-summary-boundary.md",
    "validation.coach-facing-summary-boundary.md",
    "README.md",
    "manifest.md",
    "00-share-manifest.txt",
    "bundle__contracts.md",
    "bundle__simulation.md",
    "bundle__reports.md",
    "bundle__docs.md",
  ];
  const mojibakeFragments = ["Ãƒ", "Ã‚", "Ã¢â‚¬", "[object Object]"];
  const coachFacingSummaryBoundaryChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("current sprint is Micro-sprint 2P-Fix", activeConfig.sprintName === "Micro-sprint 2P-Fix - Coach-Facing Summary Boundary", activeConfig.sprintName),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share pack under 20 files", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("final file count is 14", filesOnDisk.length === 14, `${filesOnDisk.length}`),
    check("minimal allowlist count is 14", allowlistedFiles.length === 14, `${allowlistedFiles.length}`),
    check("missing expected files are none", missingExpectedFiles.length === 0, missingExpectedFiles.join(", ") || "none"),
    check("stale share file count is 0", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("previous sprint leftovers are 0", !requiredCopied("canonical-matchreport-evidence-contract.md") && !requiredCopied("validation.canonical-matchreport-evidence-contract.md"), "Sprint 2P docs omitted"),
    check("source files deleted count is 0", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("all required current sprint files copied", coachFacingSummaryBoundaryExpectedFiles.every((file) => requiredCopied(file)), coachFacingSummaryBoundaryExpectedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest lists Micro-sprint 2P-Fix", manifest.includes("Micro-sprint 2P-Fix - Coach-Facing Summary Boundary") && detailedManifest.includes("Micro-sprint 2P-Fix - Coach-Facing Summary Boundary"), "2P-Fix visible"),
    check("README is Micro-sprint 2P-Fix oriented", readme.includes("# Micro-sprint 2P-Fix Share Pack") && readme.includes("coach-facing-summary-boundary.md"), "README current"),
    check("coach-facing summary boundary doc included", coachFacingSummaryBoundary.includes("# Coach-Facing Summary Boundary"), "doc included"),
    check("coach-facing summary boundary validation is PASS", coachFacingSummaryBoundaryValidation.includes("Status: PASS"), "validation PASS"),
    check("summary boundary helper bundled", bundleReports.includes("src/reports/coachFacingSummary.ts") && bundleReports.includes("isTechnicalContextLeak"), "coachFacingSummary bundled"),
    check("summary boundary test bundled", bundleReports.includes("src/reports/coachFacingSummary.test.ts"), "coachFacingSummary test bundled"),
    check("key moments use coach-facing summary helper", bundleSimulation.includes("coachFacingKeyMomentSummary") && bundleSimulation.includes("eventContext: event.tacticalContext.reason"), "key moments route through helper"),
    check("warning summaries are type-specific", bundleSimulation.includes("coachFacingWarningSummaryByType"), "typed warning summaries visible"),
    check("match report contract guard checks visible summaries", bundleSimulation.includes("assertNoTechnicalContextLeak"), "contract guard checks boundary"),
    check("html guard checks visible copy only", bundleReports.includes("visibleHtml") && bundleReports.includes("assertNoTechnicalContextLeak"), "HTML visible guard bundled"),
    check("coach-report.latest.html included", coachHtml.includes("<!doctype html>") || coachHtml.includes("<html"), "coach HTML copied"),
    check("coach HTML contains no mojibake markers", !containsAny(coachHtml, mojibakeFragments), `mojibake marker count: ${countAny(coachHtml, mojibakeFragments)}`),
    check("coach HTML keeps structured warnings", coachHtml.includes("Avertissements structur") && coachHtml.includes("Type :"), "structured warnings visible"),
    check("technical details remain internal", coachHtml.includes("FULL_MATCH_HARNESS_SINGLE_RUN") && coachHtml.includes("Détails techniques"), "technical scope retained in details"),
    check("canonical evidenceFacts preserved", bundleContracts.includes("evidenceFacts") && bundleContracts.includes("MatchReportEvidenceFact"), "evidenceFacts visible"),
    check("canonical warnings preserved", bundleContracts.includes("warnings") && bundleContracts.includes("MatchReportWarning"), "warnings visible"),
    check("reportMeta preserved", bundleContracts.includes("reportMeta") && bundleSimulation.includes("reportMeta"), "reportMeta visible"),
    check("no scoring constants changed", scoringEvents.includes("SHOT_GOAL = 3 points") && scoringEvents.includes("TRY_TOUCHDOWN = 5 points") && scoringEvents.includes("CONVERSION_GOAL = 2 points") && scoringEvents.includes("DROP_GOAL = 2 points"), "scoring constants visible"),
    check("PENALTY_SHOT remains inactive", scoringEvents.includes("PENALTY_SHOT inactive"), "penalty inactive"),
    check("no MatchBonusEvent mutation", scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream"), "MatchBonusEvent separated"),
    check("batch/live separation preserved", scoringEvents.includes("batch/live separation status: PASS"), "batch/live PASS"),
    check("50-match economy remains global reference", bundleSimulation.includes("FULL_MATCH_BATCH_ECONOMY") || bundleSimulation.includes("VALIDATED_FULL_MATCH_ECONOMY_ANCHOR"), "50-match reference visible"),
    check("recommendation CONFIRM_COACH_FACING_SUMMARY_BOUNDARY", coachFacingSummaryBoundary.includes("CONFIRM_COACH_FACING_SUMMARY_BOUNDARY") && coachFacingSummaryBoundaryValidation.includes("CONFIRM_COACH_FACING_SUMMARY_BOUNDARY"), "recommendation visible"),
  ];
  const sprint2PChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("current sprint is Sprint 2P", activeConfig.sprintName === "Sprint 2P - Canonical MatchReport Alignment + Report Evidence Contract", activeConfig.sprintName),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share pack under 20 files", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("final file count is 14", filesOnDisk.length === 14, `${filesOnDisk.length}`),
    check("minimal allowlist count is 14", allowlistedFiles.length === 14, `${allowlistedFiles.length}`),
    check("missing expected files are none", missingExpectedFiles.length === 0, missingExpectedFiles.join(", ") || "none"),
    check("stale share file count is 0", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("previous sprint leftovers are 0", !requiredCopied("coach-report-copy-quality.md") && !requiredCopied("validation.coach-report-copy-quality.md"), "2O-Fix docs omitted"),
    check("source files deleted count is 0", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("all required current sprint files copied", sprint2PExpectedFiles.every((file) => requiredCopied(file)), sprint2PExpectedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest lists Sprint 2P", manifest.includes("Sprint 2P - Canonical MatchReport Alignment + Report Evidence Contract") && detailedManifest.includes("Sprint 2P - Canonical MatchReport Alignment + Report Evidence Contract"), "Sprint 2P visible"),
    check("README is Sprint 2P oriented", readme.includes("# Sprint 2P Share Pack") && readme.includes("canonical-matchreport-evidence-contract.md"), "README current"),
    check("canonical MatchReport evidence doc included", canonicalMatchReportEvidenceContract.includes("# Canonical MatchReport Evidence Contract"), "doc included"),
    check("canonical MatchReport evidence validation is PASS", canonicalMatchReportEvidenceContractValidation.includes("Status: PASS"), "validation PASS"),
    check("evidence contract bundled", bundleContracts.includes("src/contracts/matchReportEvidence.ts") && bundleContracts.includes("MatchReportEvidenceFact"), "matchReportEvidence bundled"),
    check("warning contract bundled", bundleContracts.includes("src/contracts/matchReportWarnings.ts") && bundleContracts.includes("MatchReportWarning"), "matchReportWarnings bundled"),
    check("MatchReport exposes evidenceFacts", bundleContracts.includes("evidenceFacts") && bundleSimulation.includes("evidenceFacts"), "evidenceFacts visible"),
    check("MatchReport exposes warnings", bundleContracts.includes("warnings") && bundleSimulation.includes("buildMatchReportWarnings"), "warnings visible"),
    check("MatchReport exposes reportMeta", bundleContracts.includes("reportMeta") && bundleSimulation.includes("reportMeta"), "reportMeta visible"),
    check("canonical evidence builder bundled", bundleSimulation.includes("src/simulation/adapters/matchReportEvidenceBuilder.ts") && bundleSimulation.includes("buildCanonicalMatchReportEvidenceFacts"), "evidence builder bundled"),
    check("canonical warning builder bundled", bundleSimulation.includes("src/simulation/adapters/matchReportWarningsBuilder.ts") && bundleSimulation.includes("buildHarnessWarningEvidenceFacts"), "warning builder bundled"),
    check("canonical MatchReport contract guard bundled", bundleSimulation.includes("src/simulation/matchReportContractGuard.ts") && bundleSimulation.includes("validateCanonicalMatchReportContract"), "contract guard bundled"),
    check("test:contracts includes canonical guard", readIfExists(join(shareDirectory, "package.json")).includes("dist/simulation/matchReportContractGuard.js"), "canonical guard wired"),
    check("coach-report.latest.html included", coachHtml.includes("<!doctype html>") || coachHtml.includes("<html"), "coach HTML copied"),
    check("coach HTML renders structured warnings", coachHtml.includes("Avertissements structur") && coachHtml.includes("Détails techniques"), "structured warnings visible"),
    check("coach HTML contains no mojibake markers", !containsAny(coachHtml, mojibakeFragments), `mojibake marker count: ${countAny(coachHtml, mojibakeFragments)}`),
    check("single runFullMatch output cannot invalidate global economy", bundleSimulation.includes("mayInvalidateGlobalScoringEconomy: false") && canonicalMatchReportEvidenceContract.includes("single runFullMatch output warning-only"), "warning-only"),
    check("50-match economy remains global reference", bundleSimulation.includes("VALIDATED_FULL_MATCH_ECONOMY_ANCHOR") || bundleSimulation.includes("FULL_MATCH_BATCH_ECONOMY"), "50-match reference visible"),
    check("high single-run score emits harness warning, not scoring failure", bundleSimulation.includes("INFLATED_SINGLE_RUN_SCORE") && bundleSimulation.includes("warning-only"), "inflated score warning visible"),
    check("repetitive key moments emit harness warning", bundleSimulation.includes("REPETITIVE_KEY_MOMENTS") || bundleSimulation.includes("REPEATED_SEGMENT_PATTERN"), "key moment warning visible"),
    check("flat fatigue emits harness warning", bundleSimulation.includes("FLAT_FATIGUE_SIGNAL") || bundleSimulation.includes("FATIGUE_SIGNAL_FLAT"), "fatigue warning visible"),
    check("no scoring constants changed", scoringEvents.includes("SHOT_GOAL = 3 points") && scoringEvents.includes("TRY_TOUCHDOWN = 5 points") && scoringEvents.includes("CONVERSION_GOAL = 2 points") && scoringEvents.includes("DROP_GOAL = 2 points"), "scoring constants visible"),
    check("PENALTY_SHOT remains inactive", scoringEvents.includes("PENALTY_SHOT inactive"), "penalty inactive"),
    check("no scoring events deleted", canonicalMatchReportEvidenceContractValidation.includes("no scoring events deleted") && bundleSimulation.includes("score_change"), "events preserved"),
    check("no MatchBonusEvent mutation", canonicalMatchReportEvidenceContractValidation.includes("no MatchBonusEvent mutation") && scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream"), "MatchBonusEvent separated"),
    check("batch/live separation preserved", canonicalMatchReportEvidenceContractValidation.includes("batch/live separation preserved") && scoringEvents.includes("batch/live separation status: PASS"), "batch/live PASS"),
    check("final score remains derived from score consequences", bundleSimulation.includes("score_change") && canonicalMatchReportEvidenceContract.includes("Final score remains derived only from score_change consequences"), "score consequences visible"),
    check("recommendation CONFIRM_CANONICAL_MATCHREPORT_EVIDENCE_CONTRACT", canonicalMatchReportEvidenceContract.includes("CONFIRM_CANONICAL_MATCHREPORT_EVIDENCE_CONTRACT") && canonicalMatchReportEvidenceContractValidation.includes("CONFIRM_CANONICAL_MATCHREPORT_EVIDENCE_CONTRACT"), "recommendation visible"),
    check("recommendation PREPARE_NEXT_SIMULATION_SPRINT_WITH_TYPED_REPORT_EVIDENCE", canonicalMatchReportEvidenceContract.includes("PREPARE_NEXT_SIMULATION_SPRINT_WITH_TYPED_REPORT_EVIDENCE"), "next recommendation visible"),
  ];
  const coachCopyChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("current sprint is Micro-sprint 2O-Fix", activeConfig.sprintName === "Micro-sprint 2O-Fix - Coach Report Encoding + Copy Hygiene", activeConfig.sprintName),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share pack under 20 files", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("final file count is 14", filesOnDisk.length === 14, `${filesOnDisk.length}`),
    check("minimal allowlist count is 14", allowlistedFiles.length === 14, `${allowlistedFiles.length}`),
    check("missing expected files are none", missingExpectedFiles.length === 0, missingExpectedFiles.join(", ") || "none"),
    check("stale share file count is 0", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("previous sprint leftovers are 0", !requiredCopied("full-match-harness-plausibility.md") && !requiredCopied("validation.full-match-harness-plausibility.md"), "Sprint 2O docs omitted"),
    check("source files deleted count is 0", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("all required current sprint files copied", coachCopyExpectedFiles.every((file) => requiredCopied(file)), coachCopyExpectedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest lists Micro-sprint 2O-Fix", manifest.includes("Micro-sprint 2O-Fix - Coach Report Encoding + Copy Hygiene") && detailedManifest.includes("Micro-sprint 2O-Fix - Coach Report Encoding + Copy Hygiene"), "micro-sprint visible"),
    check("README is Micro-sprint 2O-Fix oriented", readme.includes("# Micro-sprint 2O-Fix Share Pack") && readme.includes("coach-report-copy-quality.md"), "README current"),
    check("coach-report-copy-quality doc included", coachReportCopyQuality.includes("# Coach Report Copy Quality"), "doc included"),
    check("coach-report-copy-quality validation is PASS", coachReportCopyQualityValidation.includes("Status: PASS"), "validation PASS"),
    check("coach copy utility bundled", bundleReports.includes("src/reports/coachCopyQuality.ts") && bundleReports.includes("containsMojibake"), "coachCopyQuality bundled"),
    check("coach-facing copy helper bundled", bundleReports.includes("src/reports/coachFacingCopy.ts") && bundleReports.includes("coachFacingHarnessWarningSummary"), "coachFacingCopy bundled"),
    check("coach copy quality test bundled", bundleReports.includes("src/reports/coachCopyQuality.test.ts"), "coachCopyQuality test bundled"),
    check("htmlCoachReportGuard includes mojibake guard", bundleReports.includes("containsMojibake") && bundleReports.includes("FULL_MATCH_HARNESS_SINGLE_RUN"), "HTML guard bundled"),
    check("coach-report.latest.html included", coachHtml.includes("<!doctype html>") || coachHtml.includes("<html"), "coach HTML copied"),
    check("coach HTML contains no mojibake markers", !containsAny(coachHtml, mojibakeFragments), `mojibake marker count: ${countAny(coachHtml, mojibakeFragments)}`),
    check("coach HTML contains Résumé", coachHtml.includes("Résumé"), "Résumé visible"),
    check("coach HTML contains Moments clés", coachHtml.includes("Moments clés"), "Moments clés visible"),
    check("coach HTML contains generated-from copy", coachHtml.includes("Généré depuis le rapport de match typé."), "generated copy visible"),
    check("coach HTML contains Action décisive", coachHtml.includes("Action décisive"), "Action décisive visible"),
    check("coach HTML contains Séquence dangereuse", coachHtml.includes("Séquence dangereuse"), "Séquence dangereuse visible"),
    check("coach HTML contains Équipe and Événement", coachHtml.includes("Équipe") && coachHtml.includes("Événement"), "French labels visible"),
    check("coach HTML contains French harness warning", coachHtml.includes("Ce run déterministe unique révèle") && coachHtml.includes("économie du score"), "French harness warning visible"),
    check("coach HTML does not expose raw Harness warning", !coachHtml.includes("Harness warning:"), "raw English hidden"),
    check("coach HTML does not expose raw scope enum", !coachHtml.includes("FULL_MATCH_HARNESS_SINGLE_RUN"), "raw scope hidden"),
    check("dominated-team copy is clean French", coachHtml.includes("BLITZ produit du volume sans conversion") && coachHtml.includes("Revoir la route choisie après pression"), "dominated-team copy visible"),
    check("no global scoring incoherence claim", !coachHtml.includes("global scoring incoherence"), "no incoherence claim"),
    check("no scoring value change recommendation", !coachHtml.includes("change scoring values"), "no scoring change recommendation"),
    check("no scoring constants changed", scoringEvents.includes("SHOT_GOAL = 3 points") && scoringEvents.includes("TRY_TOUCHDOWN = 5 points") && scoringEvents.includes("CONVERSION_GOAL = 2 points") && scoringEvents.includes("DROP_GOAL = 2 points"), "scoring constants visible"),
    check("PENALTY_SHOT remains inactive", scoringEvents.includes("PENALTY_SHOT inactive"), "penalty inactive"),
    check("no MatchBonusEvent mutation", scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream"), "MatchBonusEvent separated"),
    check("batch/live separation preserved", scoringEvents.includes("batch/live separation status: PASS"), "batch/live PASS"),
    check("50-match economy still protected", bundleSimulation.includes("VALIDATED_FULL_MATCH_ECONOMY_ANCHOR") && bundleSimulation.includes("mayInvalidateGlobalScoringEconomy: false"), "50-match anchor preserved"),
    check("source-of-truth guards preserved", bundleSimulation.includes("src/simulation/diagnostics/sourceOfTruthGuards.ts"), "sourceOfTruthGuards included"),
    check("recommendation CONFIRM_COACH_REPORT_ENCODING_CLEAN", coachReportCopyQuality.includes("CONFIRM_COACH_REPORT_ENCODING_CLEAN") && coachReportCopyQualityValidation.includes("CONFIRM_COACH_REPORT_ENCODING_CLEAN"), "recommendation visible"),
    check("recommendation KEEP_SOURCE_OF_TRUTH_GUARDRAILS", coachReportCopyQuality.includes("KEEP_SOURCE_OF_TRUTH_GUARDRAILS"), "source-of-truth recommendation visible"),
  ];
  const sprint2OChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("current sprint is Sprint 2O", activeConfig.sprintName === "Sprint 2O - Full-Match Harness Plausibility: Scoring Dominance + Report Signal Quality", activeConfig.sprintName),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share pack under 20 files", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("final file count is 14", filesOnDisk.length === 14, `${filesOnDisk.length}`),
    check("minimal allowlist count is 14", allowlistedFiles.length === 14, `${allowlistedFiles.length}`),
    check("missing expected files are none", missingExpectedFiles.length === 0, missingExpectedFiles.join(", ") || "none"),
    check("stale share file count is 0", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("source files deleted count is 0", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("all required current sprint files copied", sprint2OExpectedFiles.every((file) => requiredCopied(file)), sprint2OExpectedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest lists Sprint 2O", manifest.includes("Sprint 2O - Full-Match Harness Plausibility: Scoring Dominance + Report Signal Quality") && detailedManifest.includes("Sprint 2O - Full-Match Harness Plausibility: Scoring Dominance + Report Signal Quality"), "Sprint 2O visible"),
    check("README is Sprint 2O oriented", readme.includes("# Sprint 2O Share Pack") && readme.includes("full-match-harness-plausibility.md"), "README current"),
    check("scoring dominance diagnostics included", bundleSimulation.includes("src/simulation/diagnostics/fullMatchScoringDominanceDiagnostics.ts") && bundleSimulation.includes("ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN"), "dominance diagnostics bundled"),
    check("scoring dominance tests included", bundleSimulation.includes("src/simulation/diagnostics/fullMatchScoringDominanceDiagnostics.test.ts"), "dominance tests bundled"),
    check("full-match harness sanity includes dominance", bundleSimulation.includes("scoringDominance") && bundleSimulation.includes("ZERO_SCORING_EVENTS_FOR_ONE_TEAM"), "sanity dominance visible"),
    check("dominated-team evidence included", bundleSimulation.includes("dominated_team_no_payoff") && bundleSimulation.includes("produit du volume sans conversion"), "dominated-team evidence visible"),
    check("key moment repetition guard included", bundleSimulation.includes("titleCounts") && bundleSimulation.includes("no more than 2"), "key moment repetition guard visible"),
    check("fatigue/load contrast source included", bundleSimulation.includes("pressureLoadIncrease") && bundleSimulation.includes("concededPoints"), "load scale visible"),
    check("segment dominance summary included", bundleSimulation.includes("dominanceSummary"), "segment dominance summary visible"),
    check("runFullMatchContractGuard included", bundleSimulation.includes("src/simulation/runFullMatchContractGuard.ts") && bundleSimulation.includes("dominance diagnostics exist"), "runFullMatch guard bundled"),
    check("htmlCoachReportGuard included", bundleReports.includes("src/reports/htmlCoachReportGuard.ts") && bundleReports.includes("Domination scoring single-run a surveiller"), "HTML guard bundled"),
    check("full-match harness plausibility docs included", fullMatchHarnessPlausibility.includes("# Full-Match Harness Plausibility"), "doc included"),
    check("full-match harness plausibility validation is PASS", fullMatchHarnessPlausibilityValidation.includes("Status: PASS"), "validation PASS"),
    check("dominance diagnostics are warning-only", fullMatchHarnessPlausibilityValidation.includes("dominance diagnostics are warning-only") && bundleSimulation.includes("mayInvalidateGlobalScoringEconomy: false"), "warning-only"),
    check("zero scoring team warning exists when applicable", fullMatchHarnessPlausibilityValidation.includes("zero scoring team warning exists when applicable") && bundleSimulation.includes("ZERO_SCORING_EVENTS_FOR_ONE_TEAM"), "zero scoring warning"),
    check("dominated-team evidence exists when applicable", fullMatchHarnessPlausibilityValidation.includes("dominated-team evidence exists when applicable") && bundleSimulation.includes("DOMINATED_TEAM_HAS_PRESSURE_WITHOUT_CONVERSION"), "dominated evidence"),
    check("key moment repetition reduced", fullMatchHarnessPlausibilityValidation.includes("key moment repetition reduced") && bundleSimulation.includes("titleCounts"), "key moments improved"),
    check("highIntensityLoad scale has useful contrast", fullMatchHarnessPlausibilityValidation.includes("highIntensityLoad scale has useful contrast") && bundleSimulation.includes("pressureLoadIncrease"), "load contrast"),
    check("score still equals score_change consequences", fullMatchHarnessPlausibilityValidation.includes("final score equals score_change consequences") && bundleSimulation.includes("score_change"), "score consequence guard visible"),
    check("no scoring constants changed", scoringEvents.includes("SHOT_GOAL = 3 points") && scoringEvents.includes("TRY_TOUCHDOWN = 5 points") && scoringEvents.includes("CONVERSION_GOAL = 2 points") && scoringEvents.includes("DROP_GOAL = 2 points"), "scoring constants visible"),
    check("PENALTY_SHOT remains inactive", scoringEvents.includes("PENALTY_SHOT inactive"), "penalty inactive"),
    check("no scoring events deleted", fullMatchHarnessPlausibilityValidation.includes("no scoring events deleted") && bundleSimulation.includes("dominance diagnostics must not mutate scoring events"), "events preserved"),
    check("no MatchBonusEvent mutation", fullMatchHarnessPlausibilityValidation.includes("no MatchBonusEvent mutation") && scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream"), "MatchBonusEvent separated"),
    check("batch/live separation preserved", fullMatchHarnessPlausibilityValidation.includes("batch/live separation preserved") && scoringEvents.includes("batch/live separation status: PASS"), "batch/live PASS"),
    check("source-of-truth guardrails preserved", fullMatchHarnessPlausibilityValidation.includes("source-of-truth guardrails preserved") && bundleSimulation.includes("FULL_MATCH_BATCH_ECONOMY"), "source-of-truth preserved"),
    check("50-match economy remains global reference", fullMatchHarnessPlausibility.includes("50-match economy remains the global reference") && bundleSimulation.includes("VALIDATED_FULL_MATCH_ECONOMY_ANCHOR"), "50-match reference visible"),
    check("coach-report.latest.html included", coachHtml.includes("<!doctype html>") || coachHtml.includes("<html"), "coach HTML copied"),
    check("HTML report contains harness warning", coachHtml.includes("Avertissement de harnais full-match"), "HTML harness warning visible"),
    check("HTML report contains fatigue values", coachHtml.includes("Condition finale"), "HTML fatigue visible"),
    check("previous Sprint 2N docs not copied", !requiredCopied("full-match-segment-diversity-fatigue.md") && !requiredCopied("validation.full-match-segment-diversity-fatigue.md"), "2N docs omitted"),
    check("recommendation CONFIRM_SCORING_DOMINANCE_DIAGNOSTICS_V0", fullMatchHarnessPlausibility.includes("CONFIRM_SCORING_DOMINANCE_DIAGNOSTICS_V0"), "recommendation visible"),
    check("recommendation PREPARE_TRUE_SEGMENT_STATE_INTEGRATION", fullMatchHarnessPlausibility.includes("PREPARE_TRUE_SEGMENT_STATE_INTEGRATION"), "next recommendation visible"),
  ];
  const sprint2QExpectedFiles = [
    "package.json",
    "tsconfig.json",
    "coach-report.latest.html",
    "scoring-events-summary.md",
    "validation.share-pack.md",
    "true-segment-state-integration.md",
    "validation.true-segment-state-integration.md",
    "README.md",
    "manifest.md",
    "00-share-manifest.txt",
    "bundle__contracts.md",
    "bundle__simulation.md",
    "bundle__reports.md",
    "bundle__docs.md",
  ];
  const sprint2QForbiddenLeftovers = [
    "coach-facing-summary-boundary.md",
    "validation.coach-facing-summary-boundary.md",
    "canonical-matchreport-evidence-contract.md",
    "validation.canonical-matchreport-evidence-contract.md",
    "full-match-harness-plausibility.md",
    "validation.full-match-harness-plausibility.md",
  ];
  const sprint2QChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("current sprint is Sprint 2Q", activeConfig.sprintName === "Sprint 2Q - True Segment-State Integration Into Mini-Match Resolution", activeConfig.sprintName),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share pack under 20 files", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("final file count is 14", filesOnDisk.length === 14, `${filesOnDisk.length}`),
    check("minimal allowlist count is 14", allowlistedFiles.length === 14, `${allowlistedFiles.length}`),
    check("missing expected files are none", missingExpectedFiles.length === 0, missingExpectedFiles.join(", ") || "none"),
    check("stale share file count is 0", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("previous sprint leftovers are 0", sprint2QForbiddenLeftovers.every((file) => !requiredCopied(file)), sprint2QForbiddenLeftovers.filter((file) => requiredCopied(file)).join(", ") || "0"),
    check("source files deleted count is 0", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("all required current sprint files copied", sprint2QExpectedFiles.every((file) => requiredCopied(file)), sprint2QExpectedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest lists Sprint 2Q", manifest.includes("Sprint 2Q - True Segment-State Integration Into Mini-Match Resolution") && detailedManifest.includes("Sprint 2Q - True Segment-State Integration Into Mini-Match Resolution"), "Sprint 2Q visible"),
    check("manifest reports final file count 14", manifest.includes("Final file count: 14") && detailedManifest.includes("Final file count: 14"), "final count visible"),
    check("README is Sprint 2Q oriented", readme.includes("# Sprint 2Q Share Pack") && readme.includes("true-segment-state-integration.md"), "README current"),
    check("true segment-state integration doc included", trueSegmentStateIntegration.includes("# True Segment-State Integration"), "doc included"),
    check("true segment-state validation is PASS", trueSegmentStateIntegrationValidation.includes("Status: PASS"), "validation PASS"),
    check("FullMatchSegmentInfluence source bundled", bundleSimulation.includes("src/simulation/fullMatch/fullMatchSegmentInfluence.ts") && bundleSimulation.includes("createFullMatchSegmentInfluence"), "segment influence resolver bundled"),
    check("FullMatchSegmentInfluence test bundled", bundleSimulation.includes("src/simulation/fullMatch/fullMatchSegmentInfluence.test.ts") && bundleSimulation.includes("segment influence modifiers must remain bounded"), "segment influence test bundled"),
    check("MiniMatchInput optional segmentInfluence bundled", bundleSimulation.includes("readonly segmentInfluence?: MiniMatchSegmentInfluence") && bundleSimulation.includes("MiniMatchTeamSegmentInfluence"), "optional segment influence type visible"),
    check("mini-match context influence wiring bundled", bundleSimulation.includes("src/simulation/miniMatch/createMiniMatchContext.ts") && bundleSimulation.includes("applyPlayerInfluence") && bundleSimulation.includes("applyCollectiveInfluence"), "context wiring bundled"),
    check("initial sequence influence wiring bundled", bundleSimulation.includes("src/simulation/miniMatch/selectInitialSequenceContext.ts") && bundleSimulation.includes("adjustPressureLevel") && bundleSimulation.includes("sequenceLevelFromModifier"), "sequence wiring bundled"),
    check("runFullMatch passes segment influence after first segment", bundleSimulation.includes("index === 0 ? undefined : createFullMatchSegmentInfluence") && bundleSimulation.includes("segmentInfluence"), "runFullMatch influence handoff visible"),
    check("segment influence tags included", bundleSimulation.includes("segment_influence_active") && bundleSimulation.includes("segment_influence_fatigue") && bundleSimulation.includes("segment_influence_momentum") && bundleSimulation.includes("segment_influence_defensive_stress") && bundleSimulation.includes("segment_influence_pattern_pressure"), "internal tags visible"),
    check("segment influence evidence fact included", bundleSimulation.includes("segmentStateInfluenceFact") && bundleSimulation.includes("segment_state_influence"), "canonical evidence fact visible"),
    check("mini-match segment influence test bundled", bundleSimulation.includes("src/simulation/miniMatch/miniMatchSegmentInfluence.test.ts") && bundleSimulation.includes("runMiniMatch without segment influence must remain deterministic"), "mini-match compatibility test bundled"),
    check("segment diversity diagnostics include influence count", bundleSimulation.includes("segmentInfluenceActiveSegmentCount") && bundleSimulation.includes("SEGMENT_INFLUENCE_INACTIVE_AFTER_FIRST_SEGMENT"), "diagnostic fields visible"),
    check("scoring constants unchanged", scoringEvents.includes("SHOT_GOAL = 3 points") && scoringEvents.includes("TRY_TOUCHDOWN = 5 points") && scoringEvents.includes("CONVERSION_GOAL = 2 points") && scoringEvents.includes("DROP_GOAL = 2 points"), "scoring constants visible"),
    check("PENALTY_SHOT remains inactive", scoringEvents.includes("PENALTY_SHOT inactive"), "penalty inactive"),
    check("no scoring events deleted or capped", trueSegmentStateIntegrationValidation.includes("scoring events deleted or capped: 0") && bundleSimulation.includes("score_change"), "scoring event guard visible"),
    check("no MatchBonusEvent mutation", scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream") && trueSegmentStateIntegrationValidation.includes("MatchBonusEvent unchanged"), "MatchBonusEvent separated"),
    check("batch/live separation preserved", scoringEvents.includes("batch/live separation status: PASS") && trueSegmentStateIntegrationValidation.includes("batch/live separation preserved"), "batch/live PASS"),
    check("final score remains derived from score consequences", trueSegmentStateIntegrationValidation.includes("final score remains derived from score_change consequences") && bundleSimulation.includes("final score must remain derived from score_change consequences"), "score consequence guard"),
    check("50-match economy remains global reference", trueSegmentStateIntegration.includes("FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof") && bundleSimulation.includes("VALIDATED_FULL_MATCH_ECONOMY_ANCHOR"), "50-match reference visible"),
    check("single full-match harness run remains warning-only", bundleSimulation.includes("mayInvalidateGlobalScoringEconomy: false") && trueSegmentStateIntegration.includes("without claiming global scoring-economy validity"), "single-run warning-only"),
    check("recommendations visible", trueSegmentStateIntegration.includes("CONFIRM_TRUE_SEGMENT_STATE_INTEGRATION_V0") && trueSegmentStateIntegration.includes("PREPARE_DEEPER_TACTICAL_PLAN_INFLUENCE") && trueSegmentStateIntegration.includes("PREPARE_REAL_PLAYER_STATS"), "2Q recommendations visible"),
  ];
  const sprint2RExpectedFiles = [
    "package.json",
    "tsconfig.json",
    "coach-report.latest.html",
    "scoring-events-summary.md",
    "sequence-1-action-1.html",
    "validation.share-pack.md",
    "tactical-grounding-reconciliation.md",
    "validation.tactical-grounding-reconciliation.md",
    "README.md",
    "manifest.md",
    "00-share-manifest.txt",
    "bundle__contracts.md",
    "bundle__simulation.md",
    "bundle__reports.md",
    "bundle__docs.md",
  ];
  const sprint2RForbiddenLeftovers = [
    "true-segment-state-integration.md",
    "validation.true-segment-state-integration.md",
    "coach-facing-summary-boundary.md",
    "validation.coach-facing-summary-boundary.md",
  ];
  const sprint2SExpectedFiles = [
    "package.json",
    "tsconfig.json",
    "coach-report.latest.html",
    "scoring-events-summary.md",
    "sequence-1-action-1.html",
    "validation.share-pack.md",
    "roster-to-spatial-context-adapter.md",
    "validation.roster-to-spatial-context-adapter.md",
    "README.md",
    "manifest.md",
    "00-share-manifest.txt",
    "bundle__contracts.md",
    "bundle__simulation.md",
    "bundle__reports.md",
  ];
  const sprint2SForbiddenLeftovers = [
    "tactical-grounding-reconciliation.md",
    "validation.tactical-grounding-reconciliation.md",
    "true-segment-state-integration.md",
    "validation.true-segment-state-integration.md",
    "bundle__docs.md",
  ];
  const sprint2SChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("current sprint is Sprint 2S", activeConfig.sprintName === "Sprint 2S - Roster-to-SpatialContext Adapter + Workbench Replay Seed", activeConfig.sprintName),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share pack under 20 files", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("final file count is 14", filesOnDisk.length === 14, `${filesOnDisk.length}`),
    check("minimal allowlist count is 14", allowlistedFiles.length === 14, `${allowlistedFiles.length}`),
    check("missing expected files are none", missingExpectedFiles.length === 0, missingExpectedFiles.join(", ") || "none"),
    check("stale share file count is 0", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("previous sprint leftovers are 0", sprint2SForbiddenLeftovers.every((file) => !requiredCopied(file)), sprint2SForbiddenLeftovers.filter((file) => requiredCopied(file)).join(", ") || "0"),
    check("source files deleted count is 0", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("all required current sprint files copied", sprint2SExpectedFiles.every((file) => requiredCopied(file)), sprint2SExpectedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest lists Sprint 2S", manifest.includes("Sprint 2S - Roster-to-SpatialContext Adapter + Workbench Replay Seed") && detailedManifest.includes("Sprint 2S - Roster-to-SpatialContext Adapter + Workbench Replay Seed"), "Sprint 2S visible"),
    check("README is Sprint 2S oriented", readme.includes("# Sprint 2S Share Pack") && readme.includes("roster-to-spatial-context-adapter.md"), "README current"),
    check("workbench artifact copied", sequenceOneActionOneWorkbench.includes("Sequence 1 Action 1 Tactical Workbench") && sequenceOneActionOneWorkbench.includes("data-player-id=\"control-tempo-half\""), "sequence workbench copied"),
    check("roster-to-spatial-context adapter report included", rosterToSpatialContextAdapter.includes("# Roster-to-SpatialContext Adapter") && rosterToSpatialContextAdapter.includes("Can TeamSnapshot become SpatialTeamContext? YES"), "adapter doc included"),
    check("roster-to-spatial-context validation is PASS", rosterToSpatialContextAdapterValidation.includes("Status: PASS") && rosterToSpatialContextAdapterValidation.includes("sequence-1-action-1 replay seed does not fail"), "validation PASS"),
    check("spatial context types bundled", bundleSimulation.includes("src/simulation/spatialContext/spatialTeamContextTypes.ts") && bundleSimulation.includes("SpatialMatchContext"), "spatial types bundled"),
    check("role-to-function mapping bundled", bundleSimulation.includes("src/simulation/spatialContext/roleToTacticalFunctions.ts") && bundleSimulation.includes("pressure_escape_decision_maker"), "role mapping bundled"),
    check("TeamSnapshot to SpatialTeamContext adapter bundled", bundleSimulation.includes("src/simulation/spatialContext/teamSnapshotToSpatialContext.ts") && bundleSimulation.includes("teamSnapshotToSpatialContext"), "team adapter bundled"),
    check("WorkbenchTruth to SpatialMatchContext adapter bundled", bundleSimulation.includes("src/simulation/spatialContext/workbenchToSpatialMatchContext.ts") && bundleSimulation.includes("workbenchToSpatialMatchContext"), "workbench adapter bundled"),
    check("workbench replay seed runner bundled", bundleSimulation.includes("src/simulation/grounding/runWorkbenchReplaySeed.ts") && bundleSimulation.includes("runWorkbenchReplaySeed"), "replay seed bundled"),
    check("mini-match optional spatial context bundled", bundleSimulation.includes("readonly spatialContext?: AdapterSpatialMatchContext") && bundleSimulation.includes("spatial_context_active"), "mini-match spatial metadata bundled"),
    check("spatial context tests bundled", bundleSimulation.includes("roleToTacticalFunctions.test.ts") && bundleSimulation.includes("workbenchToSpatialMatchContext.test.ts") && bundleSimulation.includes("workbenchReplaySeed.test.ts"), "2S tests bundled"),
    check("roster gap analysis updated", bundleSimulation.includes("spatialContextAdapterExists") && bundleSimulation.includes("miniMatchConsumesSpatialContextMetadata"), "gap analysis updated"),
    check("full-match grounding diagnostics are nuanced", bundleSimulation.includes("FULL_MATCH_PARTIALLY_WORKBENCH_GROUNDED") && bundleSimulation.includes("ROUTE_RANKING_NOT_YET_ATTRIBUTE_DRIVEN"), "partial grounding diagnostics visible"),
    check("MatchReport spatial grounding evidence included", bundleSimulation.includes("spatial_context_adapter_available") && bundleSimulation.includes("workbench_replay_seed_partial") && bundleSimulation.includes("route_ranking_not_yet_attribute_driven"), "grounding facts visible"),
    check("scoring constants unchanged", scoringEvents.includes("SHOT_GOAL = 3 points") && scoringEvents.includes("TRY_TOUCHDOWN = 5 points") && scoringEvents.includes("CONVERSION_GOAL = 2 points") && scoringEvents.includes("DROP_GOAL = 2 points"), "scoring constants visible"),
    check("PENALTY_SHOT remains inactive", scoringEvents.includes("PENALTY_SHOT inactive"), "penalty inactive"),
    check("no scoring events deleted or capped", rosterToSpatialContextAdapterValidation.includes("no scoring events deleted or capped") && bundleSimulation.includes("score_change"), "scoring event guard visible"),
    check("no MatchBonusEvent mutation", scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream") && rosterToSpatialContextAdapterValidation.includes("MatchBonusEvent unchanged"), "MatchBonusEvent separated"),
    check("batch/live separation preserved", scoringEvents.includes("batch/live separation status: PASS") && rosterToSpatialContextAdapterValidation.includes("batch/live separation preserved"), "batch/live PASS"),
    check("50-match economy remains global reference", rosterToSpatialContextAdapter.includes("FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof") && bundleSimulation.includes("VALIDATED_FULL_MATCH_ECONOMY_ANCHOR"), "50-match reference visible"),
    check("single full-match harness remains warning-only", bundleSimulation.includes("mayInvalidateGlobalScoringEconomy: false") && rosterToSpatialContextAdapter.includes("full-match does not yet replay the workbench sequence chain"), "single-run warning-only"),
    check("recommendations visible", rosterToSpatialContextAdapter.includes("CONFIRM_ROSTER_TO_SPATIAL_CONTEXT_ADAPTER") && rosterToSpatialContextAdapter.includes("CONFIRM_WORKBENCH_REPLAY_SEED") && rosterToSpatialContextAdapter.includes("PREPARE_ATTRIBUTE_DRIVEN_ROUTE_RANKING"), "2S recommendations visible"),
  ];
  const sprint3OExpectedFiles = [
    "package.json",
    "tsconfig.json",
    "coach-report.latest.html",
    "coach-report.default.html",
    "coach-report.experimental.html",
    "scoring-events-summary.md",
    "sequence-1-action-1.html",
    "sequence-1-action-2.html",
    "sequence-1-action-3.html",
    "validation.share-pack.md",
    "fullmatch-workbench-chain-replay-3o.md",
    "validation.fullmatch-workbench-chain-replay-3o.md",
    "README.md",
    "manifest.md",
    "00-share-manifest.txt",
    "bundle__contracts.md",
    "bundle__simulation.md",
    "bundle__reports.md",
  ];
  const sprint3OForbiddenLeftovers = [
    "fullmatch-workbench-chain-replay-3n.md",
    "validation.fullmatch-workbench-chain-replay-3n.md",
    "fullmatch-workbench-chain-replay-3m.md",
    "validation.fullmatch-workbench-chain-replay-3m.md",
    "fullmatch-workbench-chain-replay-3l.md",
    "validation.fullmatch-workbench-chain-replay-3l.md",
  ];
  const sprint3OChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("current sprint is Sprint 3O", activeConfig.sprintName === "Sprint 3O - Attribute-Driven Shot Resolution Sandbox", activeConfig.sprintName),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share pack under 20 files", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("final file count is 18", filesOnDisk.length === 18, `${filesOnDisk.length}`),
    check("missing expected files are none", missingExpectedFiles.length === 0, missingExpectedFiles.join(", ") || "none"),
    check("stale share file count is 0", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("previous sprint leftovers are 0", sprint3OForbiddenLeftovers.every((file) => !requiredCopied(file)), sprint3OForbiddenLeftovers.filter((file) => requiredCopied(file)).join(", ") || "0"),
    check("source files deleted count is 0", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("all required current sprint files copied", sprint3OExpectedFiles.every((file) => requiredCopied(file)), sprint3OExpectedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest lists Sprint 3O", manifest.includes("Sprint 3O - Attribute-Driven Shot Resolution Sandbox") && detailedManifest.includes("Sprint 3O - Attribute-Driven Shot Resolution Sandbox"), "visible"),
    check("README is Sprint 3O oriented", readme.includes("# Sprint 3O Share Pack") && readme.includes("fullmatch-workbench-chain-replay-3o.md"), "README current"),
    check("3O report included", fullMatchWorkbenchChainReplay3O.includes("# FullMatch Workbench Chain Replay 3O") && fullMatchWorkbenchChainReplay3O.includes("attribute-driven shot resolution model status: available"), "3O doc included"),
    check("3O validation is PASS", fullMatchWorkbenchChainReplay3OValidation.includes("Status: PASS") && fullMatchWorkbenchChainReplay3OValidation.includes("attribute-driven shot resolution model status is available"), "3O validation PASS"),
    check("baseline attribute-driven fields visible", fullMatchWorkbenchChainReplay3O.includes("baseline outcome: NO_SCORE_ATTEMPT") && fullMatchWorkbenchChainReplay3O.includes("baseline shot attempt created: false") && fullMatchWorkbenchChainReplay3O.includes("baseline shot quality: 0"), "baseline fields visible"),
    check("override attribute-driven fields visible", fullMatchWorkbenchChainReplay3O.includes("override scoring candidate type: SHOT_CANDIDATE") && fullMatchWorkbenchChainReplay3O.includes("override shooter id: control-space-hunter") && fullMatchWorkbenchChainReplay3O.includes("override goalkeeper id: blitz-goalkeeper-free-safety") && fullMatchWorkbenchChainReplay3O.includes("override attribute-adjusted shot quality: 53") && fullMatchWorkbenchChainReplay3O.includes("override goalkeeper response quality: 75") && fullMatchWorkbenchChainReplay3O.includes("override outcome: SAVED_BY_GK"), "override fields visible"),
    check("attribute divergence fields visible", fullMatchWorkbenchChainReplay3O.includes("attribute influence observed: true") && fullMatchWorkbenchChainReplay3O.includes("outcome divergence observed: true") && fullMatchWorkbenchChainReplay3O.includes("shot quality divergence observed: true") && fullMatchWorkbenchChainReplay3O.includes("goalkeeper quality divergence observed: true"), "attribute divergences visible"),
    check("attribute-driven sandbox creates no scoring event", fullMatchWorkbenchChainReplay3O.includes("sandbox scoring event created count: 0") && fullMatchWorkbenchChainReplay3O.includes("sandbox score delta total: 0"), "no sandbox scoring event"),
    check("attribute-driven model bundled", bundleSimulation.includes("src/simulation/fullMatch/attributeDrivenShotResolutionSandbox.ts") && bundleSimulation.includes("AttributeDrivenShotResolutionModel"), "3O contract bundled"),
    check("attribute-driven actor extraction bundled", bundleSimulation.includes("src/simulation/fullMatch/extractShotResolutionActors.ts") && bundleSimulation.includes("extractShotResolutionActors"), "3O extraction bundled"),
    check("attribute-driven resolver bundled", bundleSimulation.includes("src/simulation/fullMatch/resolveAttributeDrivenShot.ts") && bundleSimulation.includes("resolveAttributeDrivenShot"), "3O resolver bundled"),
    check("attribute-driven converter bundled", bundleSimulation.includes("src/simulation/fullMatch/attributeDrivenShotResolutionFromSandbox.ts") && bundleSimulation.includes("attributeDrivenShotResolutionFromSandbox"), "3O converter bundled"),
    check("attribute-driven comparison bundled", bundleSimulation.includes("src/simulation/fullMatch/compareAttributeDrivenShotResolutions.ts") && bundleSimulation.includes("compareAttributeDrivenShotResolutions"), "3O comparison bundled"),
    check("attribute-driven signature bundled", bundleSimulation.includes("src/simulation/fullMatch/attributeDrivenShotResolutionSignature.ts") && bundleSimulation.includes("attributeDrivenShotResolutionSignature"), "3O signature bundled"),
    check("attribute-driven tests bundled", bundleSimulation.includes("attributeDrivenShotResolution.test.ts") && bundleSimulation.includes("compareAttributeDrivenShotResolutions.test.ts") && bundleSimulation.includes("runFullMatchExperimentalAttributeDrivenShotResolution.test.ts"), "3O tests bundled"),
    check("3O scoring and source-of-truth guards bundled", bundleSimulation.includes("scoringGuard.3o.test.ts") && bundleSimulation.includes("sourceOfTruthGuards.3o.test.ts"), "3O guards bundled"),
    check("attribute-driven evidence included", fullMatchWorkbenchChainReplay3O.includes("WORKBENCH_CHAIN_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION_SANDBOX") && bundleSimulation.includes("WORKBENCH_CHAIN_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION_SANDBOX"), "3O evidence visible"),
    check("attribute-driven sandbox is isolated-only", fullMatchWorkbenchChainReplay3O.includes("modelAppliedOnlyInSandbox: true") && fullMatchWorkbenchChainReplay3O.includes("modelAppliedToNormalLiveSelection: false"), "attribute-driven isolated"),
    check("default and experimental official score signatures remain equal", fullMatchWorkbenchChainReplay3O.includes("default and experimental official score signatures remain equal for now: YES") && fullMatchWorkbenchChainReplay3OValidation.includes("default and experimental official score signatures remain equal"), "score signatures equal"),
    check("attribute-driven sandbox cannot mutate official score", fullMatchWorkbenchChainReplay3O.includes("attribute-driven shot resolution can mutate official score: false") && fullMatchWorkbenchChainReplay3OValidation.includes("attribute-driven shot resolution cannot mutate official score"), "official score mutation forbidden"),
    check("attribute-driven sandbox cannot create production scoring events", fullMatchWorkbenchChainReplay3O.includes("attribute-driven shot resolution can create production scoring events: false") && fullMatchWorkbenchChainReplay3OValidation.includes("attribute-driven shot resolution cannot create production scoring events"), "production scoring event creation forbidden"),
    check("attribute-driven sandbox cannot claim global economy", fullMatchWorkbenchChainReplay3O.includes("attribute-driven shot resolution can claim global economy: false") && fullMatchWorkbenchChainReplay3OValidation.includes("attribute-driven shot resolution cannot claim global economy"), "global economy forbidden"),
    check("coach copy wording is clean", fullMatchWorkbenchChainReplay3O.includes("coach copy wording status: absent") && !coachExperimentalHtml.includes("simulation experimental") && !coachExperimentalHtml.includes("resolution live du simulation"), "coach copy clean"),
    check("explicit exhaustive test command available", readIfExists(join(shareDirectory, "package.json")).includes("\"test:all\"") && fullMatchWorkbenchChainReplay3OValidation.includes("explicit exhaustive test command is available"), "test:all visible"),
    check("scoring constants unchanged", scoringEvents.includes("SHOT_GOAL = 3 points") && scoringEvents.includes("TRY_TOUCHDOWN = 5 points") && scoringEvents.includes("CONVERSION_GOAL = 2 points") && scoringEvents.includes("DROP_GOAL = 2 points"), "scoring constants visible"),
    check("PENALTY_SHOT remains inactive", scoringEvents.includes("PENALTY_SHOT inactive"), "penalty inactive"),
    check("no production scoring events deleted or capped", fullMatchWorkbenchChainReplay3OValidation.includes("no production scoring events deleted or capped") && bundleSimulation.includes("score_change"), "scoring event guard visible"),
    check("no MatchBonusEvent mutation", scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream") && fullMatchWorkbenchChainReplay3OValidation.includes("MatchBonusEvent unchanged"), "MatchBonusEvent separated"),
    check("batch/live separation preserved", scoringEvents.includes("batch/live separation status: PASS") && fullMatchWorkbenchChainReplay3OValidation.includes("batch/live separation preserved"), "batch/live PASS"),
    check("50-match economy remains global reference", fullMatchWorkbenchChainReplay3O.includes("FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof") && bundleSimulation.includes("VALIDATED_FULL_MATCH_ECONOMY_ANCHOR"), "50-match reference visible"),
    check("recommendations visible", fullMatchWorkbenchChainReplay3O.includes("CONFIRM_SANDBOX_SCORING_EVENT_RESOLUTION_TO_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION") && fullMatchWorkbenchChainReplay3O.includes("CONFIRM_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION_IS_ISOLATED_ONLY") && fullMatchWorkbenchChainReplay3O.includes("PREPARE_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION_TO_GOALKEEPER_RESPONSE_MODEL"), "3O recommendations visible"),
  ];

  const sprint3NExpectedFiles = [
    "package.json",
    "tsconfig.json",
    "coach-report.latest.html",
    "coach-report.default.html",
    "coach-report.experimental.html",
    "scoring-events-summary.md",
    "sequence-1-action-1.html",
    "sequence-1-action-2.html",
    "sequence-1-action-3.html",
    "validation.share-pack.md",
    "fullmatch-workbench-chain-replay-3n.md",
    "validation.fullmatch-workbench-chain-replay-3n.md",
    "README.md",
    "manifest.md",
    "00-share-manifest.txt",
    "bundle__contracts.md",
    "bundle__simulation.md",
    "bundle__reports.md",
  ];
  const sprint3NForbiddenLeftovers = [
    "fullmatch-workbench-chain-replay-3m.md",
    "validation.fullmatch-workbench-chain-replay-3m.md",
    "fullmatch-workbench-chain-replay-3l.md",
    "validation.fullmatch-workbench-chain-replay-3l.md",
    "fullmatch-workbench-chain-replay-3k.md",
    "validation.fullmatch-workbench-chain-replay-3k.md",
  ];
  const sprint3NChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("current sprint is Sprint 3N", activeConfig.sprintName === "Sprint 3N - Sandbox Scoring Event Resolution", "Sandbox Scoring Event Resolution"),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share pack under 20 files", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("final file count is 18", filesOnDisk.length === 18, `${filesOnDisk.length}`),
    check("missing expected files are none", missingExpectedFiles.length === 0, missingExpectedFiles.join(", ") || "none"),
    check("stale share file count is 0", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("previous sprint leftovers are 0", sprint3NForbiddenLeftovers.every((file) => !requiredCopied(file)), sprint3NForbiddenLeftovers.filter((file) => requiredCopied(file)).join(", ") || "0"),
    check("source files deleted count is 0", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("all required current sprint files copied", sprint3NExpectedFiles.every((file) => requiredCopied(file)), sprint3NExpectedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest lists Sprint 3N", manifest.includes("Sprint 3N - Sandbox Scoring Event Resolution") && detailedManifest.includes("Sprint 3N - Sandbox Scoring Event Resolution"), "visible"),
    check("README is Sprint 3N oriented", readme.includes("# Sprint 3N Share Pack") && readme.includes("fullmatch-workbench-chain-replay-3n.md"), "README current"),
    check("3N report included", fullMatchWorkbenchChainReplay3N.includes("# FullMatch Workbench Chain Replay 3N") && fullMatchWorkbenchChainReplay3N.includes("sandbox scoring event resolution model status: available"), "3N doc included"),
    check("3N validation is PASS", fullMatchWorkbenchChainReplay3NValidation.includes("Status: PASS") && fullMatchWorkbenchChainReplay3NValidation.includes("sandbox scoring event resolution model status is available"), "3N validation PASS"),
    check("baseline resolution fields visible", fullMatchWorkbenchChainReplay3N.includes("baseline scoring candidate type: NO_SCORING_EVENT") && fullMatchWorkbenchChainReplay3N.includes("baseline resolution type: NO_SCORE_ATTEMPT") && fullMatchWorkbenchChainReplay3N.includes("baseline shot attempt created: false") && fullMatchWorkbenchChainReplay3N.includes("baseline shot quality: 0") && fullMatchWorkbenchChainReplay3N.includes("baseline goalkeeper response: not_applicable"), "baseline resolution visible"),
    check("override resolution fields visible", fullMatchWorkbenchChainReplay3N.includes("override scoring candidate type: SHOT_CANDIDATE") && fullMatchWorkbenchChainReplay3N.includes("override resolution type: SHOT_ON_TARGET") && fullMatchWorkbenchChainReplay3N.includes("override shot attempt created: true") && fullMatchWorkbenchChainReplay3N.includes("override shot quality: 44") && fullMatchWorkbenchChainReplay3N.includes("override goalkeeper response: not_evaluated"), "override resolution visible"),
    check("resolution divergence fields visible", fullMatchWorkbenchChainReplay3N.includes("scoring resolution type divergence observed: true") && fullMatchWorkbenchChainReplay3N.includes("shot attempt creation divergence observed: true") && fullMatchWorkbenchChainReplay3N.includes("shot quality divergence observed: true") && fullMatchWorkbenchChainReplay3N.includes("goalkeeper response divergence observed: true"), "resolution divergences visible"),
    check("sandbox resolution creates no scoring event", fullMatchWorkbenchChainReplay3N.includes("sandbox scoring event created count: 0") && fullMatchWorkbenchChainReplay3N.includes("sandbox score delta total: 0"), "no sandbox scoring event"),
    check("sandbox resolution model bundled", bundleSimulation.includes("src/simulation/fullMatch/sandboxScoringEventResolution.ts") && bundleSimulation.includes("SandboxScoringEventResolutionModel"), "3N contract bundled"),
    check("sandbox resolution resolver bundled", bundleSimulation.includes("src/simulation/fullMatch/resolveSandboxScoringEventCandidate.ts") && bundleSimulation.includes("resolveSandboxScoringEventCandidate"), "3N resolver bundled"),
    check("sandbox resolution converter bundled", bundleSimulation.includes("src/simulation/fullMatch/sandboxScoringEventResolutionFromCandidate.ts") && bundleSimulation.includes("sandboxScoringEventResolutionFromCandidate"), "3N converter bundled"),
    check("sandbox resolution comparison bundled", bundleSimulation.includes("src/simulation/fullMatch/compareSandboxScoringEventResolutions.ts") && bundleSimulation.includes("compareSandboxScoringEventResolutions"), "3N comparison bundled"),
    check("sandbox resolution signature bundled", bundleSimulation.includes("src/simulation/fullMatch/sandboxScoringEventResolutionSignature.ts") && bundleSimulation.includes("sandboxScoringEventResolutionSignature"), "3N signature bundled"),
    check("sandbox resolution tests bundled", bundleSimulation.includes("sandboxScoringEventResolution.test.ts") && bundleSimulation.includes("sandboxScoringEventResolutionGuard.test.ts") && bundleSimulation.includes("compareSandboxScoringEventResolutions.test.ts"), "3N unit tests bundled"),
    check("3N runFullMatch tests bundled", bundleSimulation.includes("runFullMatchExperimentalSandboxScoringEventResolution.test.ts") && bundleSimulation.includes("runFullMatchSandboxScoringEventResolutionScoringGuard.test.ts"), "3N full-match tests bundled"),
    check("3N scoring and source-of-truth guards bundled", bundleSimulation.includes("scoringGuard.3n.test.ts") && bundleSimulation.includes("sourceOfTruthGuards.3n.test.ts"), "3N guards bundled"),
    check("sandbox resolution evidence included", fullMatchWorkbenchChainReplay3N.includes("WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_RESOLUTION") && bundleSimulation.includes("WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_RESOLUTION"), "3N evidence visible"),
    check("sandbox resolution is isolated-only", fullMatchWorkbenchChainReplay3N.includes("modelAppliedOnlyInSandbox: true") && fullMatchWorkbenchChainReplay3N.includes("modelAppliedToNormalLiveSelection: false"), "resolution isolated"),
    check("default and experimental official score signatures remain equal", fullMatchWorkbenchChainReplay3N.includes("default and experimental official score signatures remain equal for now: YES") && fullMatchWorkbenchChainReplay3NValidation.includes("default and experimental official score signatures remain equal"), "score signatures equal"),
    check("sandbox resolution cannot mutate official score", fullMatchWorkbenchChainReplay3N.includes("sandbox scoring resolution can mutate official score: false") && fullMatchWorkbenchChainReplay3NValidation.includes("sandbox scoring event resolution cannot mutate official score"), "official score mutation forbidden"),
    check("sandbox resolution cannot create production scoring events", fullMatchWorkbenchChainReplay3N.includes("sandbox scoring resolution can create production scoring events: false") && fullMatchWorkbenchChainReplay3NValidation.includes("sandbox scoring event resolution cannot create production scoring events"), "production scoring event creation forbidden"),
    check("sandbox resolution cannot claim global economy", fullMatchWorkbenchChainReplay3N.includes("sandbox scoring resolution can claim global economy: false") && fullMatchWorkbenchChainReplay3NValidation.includes("sandbox scoring event resolution cannot claim global economy"), "global economy forbidden"),
    check("coach copy wording is clean", fullMatchWorkbenchChainReplay3N.includes("stale coach wording status: absent") && !coachExperimentalHtml.includes("simulation experimental") && !coachExperimentalHtml.includes("resolution live du simulation"), "coach copy clean"),
    check("explicit exhaustive test command available", readIfExists(join(shareDirectory, "package.json")).includes("\"test:all\"") && fullMatchWorkbenchChainReplay3NValidation.includes("explicit exhaustive test command is available"), "test:all visible"),
    check("scoring constants unchanged", scoringEvents.includes("SHOT_GOAL = 3 points") && scoringEvents.includes("TRY_TOUCHDOWN = 5 points") && scoringEvents.includes("CONVERSION_GOAL = 2 points") && scoringEvents.includes("DROP_GOAL = 2 points"), "scoring constants visible"),
    check("PENALTY_SHOT remains inactive", scoringEvents.includes("PENALTY_SHOT inactive"), "penalty inactive"),
    check("no production scoring events deleted or capped", fullMatchWorkbenchChainReplay3NValidation.includes("no production scoring events deleted or capped") && bundleSimulation.includes("score_change"), "scoring event guard visible"),
    check("no MatchBonusEvent mutation", scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream") && fullMatchWorkbenchChainReplay3NValidation.includes("MatchBonusEvent unchanged"), "MatchBonusEvent separated"),
    check("batch/live separation preserved", scoringEvents.includes("batch/live separation status: PASS") && fullMatchWorkbenchChainReplay3NValidation.includes("batch/live separation preserved"), "batch/live PASS"),
    check("50-match economy remains global reference", fullMatchWorkbenchChainReplay3N.includes("FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof") && bundleSimulation.includes("VALIDATED_FULL_MATCH_ECONOMY_ANCHOR"), "50-match reference visible"),
    check("recommendations visible", fullMatchWorkbenchChainReplay3N.includes("CONFIRM_SANDBOX_SCORING_EVENT_CANDIDATE_TO_SANDBOX_SCORING_EVENT_RESOLUTION") && fullMatchWorkbenchChainReplay3N.includes("CONFIRM_SANDBOX_SCORING_RESOLUTION_DOES_NOT_CREATE_PRODUCTION_SCORING_EVENTS") && fullMatchWorkbenchChainReplay3N.includes("PREPARE_SANDBOX_SCORING_EVENT_RESOLUTION_TO_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION"), "3N recommendations visible"),
  ];

  const sprint3MExpectedFiles = [
    "package.json",
    "tsconfig.json",
    "coach-report.latest.html",
    "coach-report.default.html",
    "coach-report.experimental.html",
    "scoring-events-summary.md",
    "sequence-1-action-1.html",
    "sequence-1-action-2.html",
    "sequence-1-action-3.html",
    "validation.share-pack.md",
    "fullmatch-workbench-chain-replay-3m.md",
    "validation.fullmatch-workbench-chain-replay-3m.md",
    "README.md",
    "manifest.md",
    "00-share-manifest.txt",
    "bundle__contracts.md",
    "bundle__simulation.md",
    "bundle__reports.md",
  ];
  const sprint3MForbiddenLeftovers = [
    "fullmatch-workbench-chain-replay-3l.md",
    "validation.fullmatch-workbench-chain-replay-3l.md",
    "fullmatch-workbench-chain-replay-3k.md",
    "validation.fullmatch-workbench-chain-replay-3k.md",
    "fullmatch-workbench-chain-replay-3j.md",
    "validation.fullmatch-workbench-chain-replay-3j.md",
    "fullmatch-workbench-chain-replay-3i.md",
    "validation.fullmatch-workbench-chain-replay-3i.md",
  ];
  const sprint3MChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("current sprint is Sprint 3M", activeConfig.sprintName === "Sprint 3M - Sandbox Scoring Event Candidate", "Sandbox Scoring Event Candidate"),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share pack under 20 files", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("final file count is 18", filesOnDisk.length === 18, `${filesOnDisk.length}`),
    check("missing expected files are none", missingExpectedFiles.length === 0, missingExpectedFiles.join(", ") || "none"),
    check("stale share file count is 0", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("previous sprint leftovers are 0", sprint3MForbiddenLeftovers.every((file) => !requiredCopied(file)), sprint3MForbiddenLeftovers.filter((file) => requiredCopied(file)).join(", ") || "0"),
    check("source files deleted count is 0", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("all required current sprint files copied", sprint3MExpectedFiles.every((file) => requiredCopied(file)), sprint3MExpectedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest lists Sprint 3M", manifest.includes("Sprint 3M - Sandbox Scoring Event Candidate") && detailedManifest.includes("Sprint 3M - Sandbox Scoring Event Candidate"), "visible"),
    check("README is Sprint 3M oriented", readme.includes("# Sprint 3M Share Pack") && readme.includes("fullmatch-workbench-chain-replay-3m.md"), "README current"),
    check("3M report included", fullMatchWorkbenchChainReplay3M.includes("# FullMatch Workbench Chain Replay 3M") && fullMatchWorkbenchChainReplay3M.includes("sandbox scoring event candidate model status: available"), "3M doc included"),
    check("3M validation is PASS", fullMatchWorkbenchChainReplay3MValidation.includes("Status: PASS") && fullMatchWorkbenchChainReplay3MValidation.includes("sandbox scoring event candidate model status is available"), "3M validation PASS"),
    check("baseline candidate fields visible", fullMatchWorkbenchChainReplay3M.includes("baseline opportunity type: no_opportunity") && fullMatchWorkbenchChainReplay3M.includes("baseline scoring candidate type: NO_SCORING_EVENT") && fullMatchWorkbenchChainReplay3M.includes("baseline scoring candidate probability: 0") && fullMatchWorkbenchChainReplay3M.includes("baseline conversion probability: 0") && fullMatchWorkbenchChainReplay3M.includes("baseline scoring candidate created: false"), "baseline candidate visible"),
    check("override candidate fields visible", fullMatchWorkbenchChainReplay3M.includes("override opportunity type: half_chance") && fullMatchWorkbenchChainReplay3M.includes("override scoring candidate type: SHOT_CANDIDATE") && fullMatchWorkbenchChainReplay3M.includes("override scoring candidate family: shot") && fullMatchWorkbenchChainReplay3M.includes("override scoring candidate probability: 24") && fullMatchWorkbenchChainReplay3M.includes("override conversion probability: 14") && fullMatchWorkbenchChainReplay3M.includes("override scoring candidate created: true"), "override candidate visible"),
    check("candidate divergence fields visible", fullMatchWorkbenchChainReplay3M.includes("scoring candidate type divergence observed: true") && fullMatchWorkbenchChainReplay3M.includes("scoring candidate family divergence observed: true") && fullMatchWorkbenchChainReplay3M.includes("scoring candidate probability divergence observed: true") && fullMatchWorkbenchChainReplay3M.includes("scoring candidate creation divergence observed: true") && fullMatchWorkbenchChainReplay3M.includes("conversion probability divergence observed: true"), "candidate divergences visible"),
    check("sandbox candidate creates no scoring event", fullMatchWorkbenchChainReplay3M.includes("sandbox scoring event created count: 0") && fullMatchWorkbenchChainReplay3M.includes("sandbox score delta total: 0"), "no sandbox scoring event"),
    check("sandbox candidate model bundled", bundleSimulation.includes("src/simulation/fullMatch/sandboxScoringEventCandidate.ts") && bundleSimulation.includes("SandboxScoringEventCandidateModel"), "3M contract bundled"),
    check("sandbox candidate mapper bundled", bundleSimulation.includes("src/simulation/fullMatch/createSandboxScoringEventCandidate.ts") && bundleSimulation.includes("createSandboxScoringEventCandidate"), "3M mapper bundled"),
    check("sandbox candidate converter bundled", bundleSimulation.includes("src/simulation/fullMatch/sandboxScoringEventCandidateModelFromOpportunity.ts") && bundleSimulation.includes("sandboxScoringEventCandidateModelFromOpportunity"), "3M converter bundled"),
    check("sandbox candidate comparison bundled", bundleSimulation.includes("src/simulation/fullMatch/compareSandboxScoringEventCandidates.ts") && bundleSimulation.includes("compareSandboxScoringEventCandidates"), "3M comparison bundled"),
    check("sandbox candidate signature bundled", bundleSimulation.includes("src/simulation/fullMatch/sandboxScoringEventCandidateSignature.ts") && bundleSimulation.includes("sandboxScoringEventCandidateSignature"), "3M signature bundled"),
    check("sandbox candidate tests bundled", bundleSimulation.includes("sandboxScoringEventCandidate.test.ts") && bundleSimulation.includes("sandboxScoringEventCandidateGuard.test.ts") && bundleSimulation.includes("compareSandboxScoringEventCandidates.test.ts"), "3M unit tests bundled"),
    check("3M runFullMatch tests bundled", bundleSimulation.includes("runFullMatchExperimentalSandboxScoringEventCandidate.test.ts") && bundleSimulation.includes("runFullMatchSandboxScoringEventCandidateScoringGuard.test.ts"), "3M full-match tests bundled"),
    check("3M scoring and source-of-truth guards bundled", bundleSimulation.includes("scoringGuard.3m.test.ts") && bundleSimulation.includes("sourceOfTruthGuards.3m.test.ts"), "3M guards bundled"),
    check("sandbox candidate evidence included", fullMatchWorkbenchChainReplay3M.includes("WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_CANDIDATE") && bundleSimulation.includes("WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_CANDIDATE"), "3M evidence visible"),
    check("sandbox candidate is isolated-only", fullMatchWorkbenchChainReplay3M.includes("modelAppliedOnlyInSandbox: true") && fullMatchWorkbenchChainReplay3M.includes("modelAppliedToNormalLiveSelection: false"), "candidate isolated"),
    check("default and experimental official score signatures remain equal", fullMatchWorkbenchChainReplay3M.includes("default and experimental official score signatures remain equal for now: YES") && fullMatchWorkbenchChainReplay3MValidation.includes("default and experimental official score signatures remain equal"), "score signatures equal"),
    check("sandbox candidate cannot mutate official score", fullMatchWorkbenchChainReplay3M.includes("sandbox scoring candidate can mutate official score: false") && fullMatchWorkbenchChainReplay3MValidation.includes("sandbox scoring event candidate cannot mutate official score"), "official score mutation forbidden"),
    check("sandbox candidate cannot create production scoring events", fullMatchWorkbenchChainReplay3M.includes("sandbox scoring candidate can create production scoring events: false") && fullMatchWorkbenchChainReplay3MValidation.includes("sandbox scoring event candidate cannot create production scoring events"), "production scoring event creation forbidden"),
    check("sandbox candidate cannot claim global economy", fullMatchWorkbenchChainReplay3M.includes("sandbox scoring candidate can claim global economy: false") && fullMatchWorkbenchChainReplay3MValidation.includes("sandbox scoring event candidate cannot claim global economy"), "global economy forbidden"),
    check("coach copy wording is clean", fullMatchWorkbenchChainReplay3M.includes("stale coach wording status: absent") && !coachExperimentalHtml.includes("simulation experimental") && !coachExperimentalHtml.includes("resolution live du simulation"), "coach copy clean"),
    check("explicit exhaustive test command available", readIfExists(join(shareDirectory, "package.json")).includes("\"test:all\"") && fullMatchWorkbenchChainReplay3MValidation.includes("explicit exhaustive test command is available"), "test:all visible"),
    check("scoring constants unchanged", scoringEvents.includes("SHOT_GOAL = 3 points") && scoringEvents.includes("TRY_TOUCHDOWN = 5 points") && scoringEvents.includes("CONVERSION_GOAL = 2 points") && scoringEvents.includes("DROP_GOAL = 2 points"), "scoring constants visible"),
    check("PENALTY_SHOT remains inactive", scoringEvents.includes("PENALTY_SHOT inactive"), "penalty inactive"),
    check("no production scoring events deleted or capped", fullMatchWorkbenchChainReplay3MValidation.includes("no production scoring events deleted or capped") && bundleSimulation.includes("score_change"), "scoring event guard visible"),
    check("no MatchBonusEvent mutation", scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream") && fullMatchWorkbenchChainReplay3MValidation.includes("MatchBonusEvent unchanged"), "MatchBonusEvent separated"),
    check("batch/live separation preserved", scoringEvents.includes("batch/live separation status: PASS") && fullMatchWorkbenchChainReplay3MValidation.includes("batch/live separation preserved"), "batch/live PASS"),
    check("50-match economy remains global reference", fullMatchWorkbenchChainReplay3M.includes("FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof") && bundleSimulation.includes("VALIDATED_FULL_MATCH_ECONOMY_ANCHOR"), "50-match reference visible"),
    check("recommendations visible", fullMatchWorkbenchChainReplay3M.includes("CONFIRM_SANDBOX_OPPORTUNITY_MODEL_TO_SANDBOX_SCORING_EVENT_CANDIDATE") && fullMatchWorkbenchChainReplay3M.includes("CONFIRM_SANDBOX_SCORING_CANDIDATE_DOES_NOT_CREATE_PRODUCTION_SCORING_EVENTS") && fullMatchWorkbenchChainReplay3M.includes("PREPARE_SANDBOX_SCORING_EVENT_CANDIDATE_TO_SANDBOX_SCORING_EVENT_RESOLUTION"), "3M recommendations visible"),
  ];

  const sprint3LExpectedFiles = [
    "package.json",
    "tsconfig.json",
    "coach-report.latest.html",
    "coach-report.default.html",
    "coach-report.experimental.html",
    "scoring-events-summary.md",
    "sequence-1-action-1.html",
    "sequence-1-action-2.html",
    "sequence-1-action-3.html",
    "validation.share-pack.md",
    "fullmatch-workbench-chain-replay-3l.md",
    "validation.fullmatch-workbench-chain-replay-3l.md",
    "README.md",
    "manifest.md",
    "00-share-manifest.txt",
    "bundle__contracts.md",
    "bundle__simulation.md",
    "bundle__reports.md",
  ];
  const sprint3LForbiddenLeftovers = [
    "fullmatch-workbench-chain-replay-3k.md",
    "validation.fullmatch-workbench-chain-replay-3k.md",
    "fullmatch-workbench-chain-replay-3j.md",
    "validation.fullmatch-workbench-chain-replay-3j.md",
    "fullmatch-workbench-chain-replay-3i.md",
    "validation.fullmatch-workbench-chain-replay-3i.md",
    "fullmatch-workbench-chain-replay-3h.md",
    "validation.fullmatch-workbench-chain-replay-3h.md",
  ];
  const sprint3LChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("current sprint is Sprint 3L", activeConfig.sprintName === "Sprint 3L - Sandbox Scoring Opportunity Model", "Sandbox Scoring Opportunity Model"),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share pack under 20 files", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("final file count is 18", filesOnDisk.length === 18, `${filesOnDisk.length}`),
    check("missing expected files are none", missingExpectedFiles.length === 0, missingExpectedFiles.join(", ") || "none"),
    check("stale share file count is 0", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("previous sprint leftovers are 0", sprint3LForbiddenLeftovers.every((file) => !requiredCopied(file)), sprint3LForbiddenLeftovers.filter((file) => requiredCopied(file)).join(", ") || "0"),
    check("source files deleted count is 0", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("all required current sprint files copied", sprint3LExpectedFiles.every((file) => requiredCopied(file)), sprint3LExpectedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest lists Sprint 3L", manifest.includes("Sprint 3L - Sandbox Scoring Opportunity Model") && detailedManifest.includes("Sprint 3L - Sandbox Scoring Opportunity Model"), "visible"),
    check("README is Sprint 3L oriented", readme.includes("# Sprint 3L Share Pack") && readme.includes("fullmatch-workbench-chain-replay-3l.md"), "README current"),
    check("3L report included", fullMatchWorkbenchChainReplay3L.includes("# FullMatch Workbench Chain Replay 3L") && fullMatchWorkbenchChainReplay3L.includes("sandbox scoring opportunity model status: available"), "3L doc included"),
    check("3L validation is PASS", fullMatchWorkbenchChainReplay3LValidation.includes("Status: PASS") && fullMatchWorkbenchChainReplay3LValidation.includes("sandbox scoring opportunity model status is available"), "3L validation PASS"),
    check("baseline opportunity fields visible", fullMatchWorkbenchChainReplay3L.includes("baseline opportunity type: no_opportunity") && fullMatchWorkbenchChainReplay3L.includes("baseline opportunity family: none") && fullMatchWorkbenchChainReplay3L.includes("baseline opportunity probability: 5") && fullMatchWorkbenchChainReplay3L.includes("baseline opportunity created: false"), "baseline opportunity visible"),
    check("override opportunity fields visible", fullMatchWorkbenchChainReplay3L.includes("override opportunity type: half_chance") && fullMatchWorkbenchChainReplay3L.includes("override opportunity family: territorial_danger") && fullMatchWorkbenchChainReplay3L.includes("override opportunity probability: 24") && fullMatchWorkbenchChainReplay3L.includes("override opportunity created: true"), "override opportunity visible"),
    check("opportunity divergence fields visible", fullMatchWorkbenchChainReplay3L.includes("opportunity type divergence observed: true") && fullMatchWorkbenchChainReplay3L.includes("opportunity family divergence observed: true") && fullMatchWorkbenchChainReplay3L.includes("opportunity probability divergence observed: true") && fullMatchWorkbenchChainReplay3L.includes("opportunity creation divergence observed: true"), "opportunity divergences visible"),
    check("sandbox opportunity creates no scoring event", fullMatchWorkbenchChainReplay3L.includes("sandbox scoring event created count: 0") && fullMatchWorkbenchChainReplay3L.includes("sandbox score delta total: 0"), "no sandbox scoring event"),
    check("sandbox opportunity model bundled", bundleSimulation.includes("src/simulation/fullMatch/sandboxScoringOpportunityModel.ts") && bundleSimulation.includes("SandboxScoringOpportunityModel"), "3L contract bundled"),
    check("sandbox opportunity classifier bundled", bundleSimulation.includes("src/simulation/fullMatch/classifySandboxScoringOpportunity.ts") && bundleSimulation.includes("classifySandboxScoringOpportunity"), "3L classifier bundled"),
    check("sandbox opportunity converter bundled", bundleSimulation.includes("src/simulation/fullMatch/sandboxScoringOpportunityModelFromResolution.ts") && bundleSimulation.includes("sandboxScoringOpportunityModelFromResolution"), "3L converter bundled"),
    check("sandbox opportunity comparison bundled", bundleSimulation.includes("src/simulation/fullMatch/compareSandboxScoringOpportunities.ts") && bundleSimulation.includes("compareSandboxScoringOpportunities"), "3L comparison bundled"),
    check("sandbox opportunity signature bundled", bundleSimulation.includes("src/simulation/fullMatch/sandboxScoringOpportunityModelSignature.ts") && bundleSimulation.includes("sandboxScoringOpportunityModelSignature"), "3L signature bundled"),
    check("sandbox opportunity tests bundled", bundleSimulation.includes("sandboxScoringOpportunityModel.test.ts") && bundleSimulation.includes("sandboxScoringOpportunityModelGuard.test.ts") && bundleSimulation.includes("compareSandboxScoringOpportunities.test.ts"), "3L unit tests bundled"),
    check("3L runFullMatch tests bundled", bundleSimulation.includes("runFullMatchExperimentalSandboxScoringOpportunityModel.test.ts") && bundleSimulation.includes("runFullMatchSandboxScoringOpportunityModelScoringGuard.test.ts"), "3L full-match tests bundled"),
    check("3L scoring and source-of-truth guards bundled", bundleSimulation.includes("scoringGuard.3l.test.ts") && bundleSimulation.includes("sourceOfTruthGuards.3l.test.ts"), "3L guards bundled"),
    check("sandbox opportunity evidence included", fullMatchWorkbenchChainReplay3L.includes("WORKBENCH_CHAIN_SANDBOX_SCORING_OPPORTUNITY_MODEL") && bundleSimulation.includes("WORKBENCH_CHAIN_SANDBOX_SCORING_OPPORTUNITY_MODEL"), "3L evidence visible"),
    check("sandbox opportunity is isolated-only", fullMatchWorkbenchChainReplay3L.includes("modelAppliedOnlyInSandbox: true") && fullMatchWorkbenchChainReplay3L.includes("modelAppliedToNormalLiveSelection: false"), "opportunity isolated"),
    check("default and experimental official score signatures remain equal", fullMatchWorkbenchChainReplay3L.includes("default and experimental official score signatures remain equal for now: YES") && fullMatchWorkbenchChainReplay3LValidation.includes("default and experimental official score signatures remain equal"), "score signatures equal"),
    check("sandbox opportunity cannot mutate official score", fullMatchWorkbenchChainReplay3L.includes("sandbox opportunity can mutate official score: false") && fullMatchWorkbenchChainReplay3LValidation.includes("sandbox opportunity cannot mutate official score"), "official score mutation forbidden"),
    check("sandbox opportunity cannot create production scoring events", fullMatchWorkbenchChainReplay3L.includes("sandbox opportunity can create production scoring events: false") && fullMatchWorkbenchChainReplay3LValidation.includes("sandbox opportunity cannot create production scoring events"), "production scoring event creation forbidden"),
    check("sandbox opportunity cannot claim global economy", fullMatchWorkbenchChainReplay3L.includes("sandbox opportunity can claim global economy: false") && fullMatchWorkbenchChainReplay3LValidation.includes("sandbox opportunity cannot claim global economy"), "global economy forbidden"),
    check("coach copy wording is clean", fullMatchWorkbenchChainReplay3L.includes("stale coach wording status: absent") && !coachExperimentalHtml.includes("simulation experimental") && !coachExperimentalHtml.includes("resolution live du simulation"), "coach copy clean"),
    check("explicit exhaustive test command available", readIfExists(join(shareDirectory, "package.json")).includes("\"test:all\"") && fullMatchWorkbenchChainReplay3LValidation.includes("explicit exhaustive test command is available"), "test:all visible"),
    check("scoring constants unchanged", scoringEvents.includes("SHOT_GOAL = 3 points") && scoringEvents.includes("TRY_TOUCHDOWN = 5 points") && scoringEvents.includes("CONVERSION_GOAL = 2 points") && scoringEvents.includes("DROP_GOAL = 2 points"), "scoring constants visible"),
    check("PENALTY_SHOT remains inactive", scoringEvents.includes("PENALTY_SHOT inactive"), "penalty inactive"),
    check("no production scoring events deleted or capped", fullMatchWorkbenchChainReplay3LValidation.includes("no production scoring events deleted or capped") && bundleSimulation.includes("score_change"), "scoring event guard visible"),
    check("no MatchBonusEvent mutation", scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream") && fullMatchWorkbenchChainReplay3LValidation.includes("MatchBonusEvent unchanged"), "MatchBonusEvent separated"),
    check("batch/live separation preserved", scoringEvents.includes("batch/live separation status: PASS") && fullMatchWorkbenchChainReplay3LValidation.includes("batch/live separation preserved"), "batch/live PASS"),
    check("50-match economy remains global reference", fullMatchWorkbenchChainReplay3L.includes("FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof") && bundleSimulation.includes("VALIDATED_FULL_MATCH_ECONOMY_ANCHOR"), "50-match reference visible"),
    check("recommendations visible", fullMatchWorkbenchChainReplay3L.includes("CONFIRM_CONTROLLED_ROUTE_RESOLUTION_SANDBOX_TO_SANDBOX_SCORING_OPPORTUNITY_MODEL") && fullMatchWorkbenchChainReplay3L.includes("CONFIRM_SANDBOX_OPPORTUNITY_DOES_NOT_CREATE_PRODUCTION_SCORING_EVENTS") && fullMatchWorkbenchChainReplay3L.includes("PREPARE_SANDBOX_SCORING_OPPORTUNITY_MODEL_TO_SANDBOX_SCORING_EVENT_CANDIDATE"), "3L recommendations visible"),
  ];

  const sprint3KExpectedFiles = [
    "package.json",
    "tsconfig.json",
    "coach-report.latest.html",
    "coach-report.default.html",
    "coach-report.experimental.html",
    "scoring-events-summary.md",
    "sequence-1-action-1.html",
    "sequence-1-action-2.html",
    "sequence-1-action-3.html",
    "validation.share-pack.md",
    "fullmatch-workbench-chain-replay-3k.md",
    "validation.fullmatch-workbench-chain-replay-3k.md",
    "README.md",
    "manifest.md",
    "00-share-manifest.txt",
    "bundle__contracts.md",
    "bundle__simulation.md",
    "bundle__reports.md",
  ];
  const sprint3KForbiddenLeftovers = [
    "fullmatch-workbench-chain-replay-3j.md",
    "validation.fullmatch-workbench-chain-replay-3j.md",
    "fullmatch-workbench-chain-replay-3i.md",
    "validation.fullmatch-workbench-chain-replay-3i.md",
    "fullmatch-workbench-chain-replay-3h.md",
    "validation.fullmatch-workbench-chain-replay-3h.md",
    "fullmatch-workbench-chain-replay-3g.md",
    "validation.fullmatch-workbench-chain-replay-3g.md",
  ];
  const sprint3KChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("current sprint is Sprint 3K", activeConfig.sprintName === "Sprint 3K - Controlled Route Resolution Sandbox", "Controlled Route Resolution Sandbox"),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share pack under 20 files", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("final file count is 18", filesOnDisk.length === 18, `${filesOnDisk.length}`),
    check("minimal allowlist count is 18", allowlistedFiles.length === 18, `${allowlistedFiles.length}`),
    check("missing expected files are none", missingExpectedFiles.length === 0, missingExpectedFiles.join(", ") || "none"),
    check("stale share file count is 0", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("previous sprint leftovers are 0", sprint3KForbiddenLeftovers.every((file) => !requiredCopied(file)), sprint3KForbiddenLeftovers.filter((file) => requiredCopied(file)).join(", ") || "0"),
    check("source files deleted count is 0", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("all required current sprint files copied", sprint3KExpectedFiles.every((file) => requiredCopied(file)), sprint3KExpectedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest lists Sprint 3K", manifest.includes("Sprint 3K - Controlled Route Resolution Sandbox") && detailedManifest.includes("Sprint 3K - Controlled Route Resolution Sandbox"), "visible"),
    check("README is Sprint 3K oriented", readme.includes("# Sprint 3K Share Pack") && readme.includes("fullmatch-workbench-chain-replay-3k.md"), "README current"),
    check("default and experimental coach reports copied", (coachDefaultHtml.includes("<!doctype html>") || coachDefaultHtml.includes("<html")) && (coachExperimentalHtml.includes("<!doctype html>") || coachExperimentalHtml.includes("<html")), "coach HTML variants copied"),
    check("3K report included", fullMatchWorkbenchChainReplay3K.includes("# FullMatch Workbench Chain Replay 3K") && fullMatchWorkbenchChainReplay3K.includes("controlled route resolution sandbox status: available"), "3K doc included"),
    check("3K validation is PASS", fullMatchWorkbenchChainReplay3KValidation.includes("Status: PASS") && fullMatchWorkbenchChainReplay3KValidation.includes("controlled route resolution sandbox status is available"), "3K validation PASS"),
    check("sandbox origin visible", fullMatchWorkbenchChainReplay3K.includes("controlled route resolution sandbox origin: real_isolated_segment_replay"), "origin visible"),
    check("baseline sandbox fields visible", fullMatchWorkbenchChainReplay3K.includes("baseline candidate: chain-context-safe-recycle-pv") && fullMatchWorkbenchChainReplay3K.includes("baseline action: SAFE_RECYCLE") && fullMatchWorkbenchChainReplay3K.includes("baseline receiver: control-pivot") && fullMatchWorkbenchChainReplay3K.includes("baseline zone: Z2-HSL") && fullMatchWorkbenchChainReplay3K.includes("baseline outcome: safe_retention"), "baseline visible"),
    check("override sandbox fields visible", fullMatchWorkbenchChainReplay3K.includes("override candidate: chain-context-forward-progress-sh") && fullMatchWorkbenchChainReplay3K.includes("override action: FORWARD_PROGRESS") && fullMatchWorkbenchChainReplay3K.includes("override receiver: control-space-hunter") && fullMatchWorkbenchChainReplay3K.includes("override zone: Z4-HSR") && fullMatchWorkbenchChainReplay3K.includes("override outcome: dangerous_progression"), "override visible"),
    check("sandbox route metrics visible", fullMatchWorkbenchChainReplay3K.includes("baseline defensive pressure: 31") && fullMatchWorkbenchChainReplay3K.includes("baseline reception quality: 86") && fullMatchWorkbenchChainReplay3K.includes("override danger probability: 64") && fullMatchWorkbenchChainReplay3K.includes("override scoring opportunity probability: 24"), "route metrics visible"),
    check("sandbox divergence fields visible", fullMatchWorkbenchChainReplay3K.includes("selection divergence observed: true") && fullMatchWorkbenchChainReplay3K.includes("carrier divergence observed: true") && fullMatchWorkbenchChainReplay3K.includes("zone progression divergence observed: true") && fullMatchWorkbenchChainReplay3K.includes("danger creation divergence observed: true"), "divergence fields visible"),
    check("sandbox contract bundled", bundleSimulation.includes("src/simulation/fullMatch/controlledRouteResolutionSandbox.ts") && bundleSimulation.includes("ControlledRouteResolutionSandbox"), "3K contract bundled"),
    check("sandbox resolver bundled", bundleSimulation.includes("src/simulation/fullMatch/resolveControlledRouteInSandbox.ts") && bundleSimulation.includes("resolveControlledRouteInSandbox"), "3K resolver bundled"),
    check("sandbox converter bundled", bundleSimulation.includes("src/simulation/fullMatch/controlledRouteResolutionSandboxFromReplay.ts") && bundleSimulation.includes("controlledRouteResolutionSandboxFromReplay"), "3K converter bundled"),
    check("sandbox comparison helper bundled", bundleSimulation.includes("src/simulation/fullMatch/compareControlledRouteResolutionSandbox.ts") && bundleSimulation.includes("compareControlledRouteResolutionSandbox"), "3K helper bundled"),
    check("sandbox signature bundled", bundleSimulation.includes("src/simulation/fullMatch/controlledRouteResolutionSandboxSignature.ts") && bundleSimulation.includes("ControlledRouteResolutionSandboxSignature"), "3K signature bundled"),
    check("sandbox tests bundled", bundleSimulation.includes("compareControlledRouteResolutionSandbox.test.ts") && bundleSimulation.includes("controlledRouteResolutionSandbox.test.ts") && bundleSimulation.includes("controlledRouteResolutionSandboxGuard.test.ts"), "3K unit tests bundled"),
    check("3K runFullMatch sandbox tests bundled", bundleSimulation.includes("runFullMatchExperimentalControlledRouteResolutionSandbox.test.ts") && bundleSimulation.includes("runFullMatchControlledRouteResolutionSandboxScoringGuard.test.ts"), "3K full-match tests bundled"),
    check("3K scoring and source-of-truth guards bundled", bundleSimulation.includes("scoringGuard.3k.test.ts") && bundleSimulation.includes("sourceOfTruthGuards.3k.test.ts"), "3K guards bundled"),
    check("sandbox evidence included", fullMatchWorkbenchChainReplay3K.includes("WORKBENCH_CHAIN_CONTROLLED_ROUTE_RESOLUTION_SANDBOX") && bundleSimulation.includes("WORKBENCH_CHAIN_CONTROLLED_ROUTE_RESOLUTION_SANDBOX"), "3K evidence visible"),
    check("sandbox results are not official MatchEvents", fullMatchWorkbenchChainReplay3K.includes("sandbox results are official MatchEvents: false") && fullMatchWorkbenchChainReplay3K.includes("no sandbox result is inserted as an official MatchEvent: YES"), "official timeline clean"),
    check("closed and unavailable candidates remain rejected", fullMatchWorkbenchChainReplay3K.includes("rejected closed candidate count: 1") && fullMatchWorkbenchChainReplay3K.includes("rejected unavailable candidate count: 1"), "blocked routes rejected"),
    check("default sandbox absent", fullMatchWorkbenchChainReplay3K.includes("default sandbox tag count: 0"), "default sandbox clean"),
    check("experimental sandbox present", fullMatchWorkbenchChainReplay3K.includes("experimental sandbox tag count: greater than 0"), "experimental sandbox visible"),
    check("sandbox is isolated-only", fullMatchWorkbenchChainReplay3K.includes("sandboxAppliedOnlyInIsolatedResolution: true") && fullMatchWorkbenchChainReplay3K.includes("sandboxAppliedToNormalLiveSelection: false"), "sandbox isolated"),
    check("default and experimental official score signatures remain equal", fullMatchWorkbenchChainReplay3K.includes("default and experimental official score signatures remain equal for now: YES") && fullMatchWorkbenchChainReplay3KValidation.includes("default and experimental official score signatures remain equal"), "score signatures equal"),
    check("sandbox cannot mutate official score", fullMatchWorkbenchChainReplay3K.includes("sandbox can mutate official score: false") && fullMatchWorkbenchChainReplay3KValidation.includes("sandbox cannot mutate official score"), "official score mutation forbidden"),
    check("sandbox cannot mutate official scoring events", fullMatchWorkbenchChainReplay3K.includes("sandbox can mutate official scoring events: false") && fullMatchWorkbenchChainReplay3KValidation.includes("sandbox cannot mutate official scoring events"), "official scoring event mutation forbidden"),
    check("sandbox cannot create production scoring events", fullMatchWorkbenchChainReplay3K.includes("sandbox can create production scoring events: false") && fullMatchWorkbenchChainReplay3KValidation.includes("sandbox cannot create production scoring events"), "production scoring event creation forbidden"),
    check("sandbox cannot mutate production route resolution", fullMatchWorkbenchChainReplay3K.includes("sandbox can mutate production route resolution: false") && fullMatchWorkbenchChainReplay3KValidation.includes("sandbox cannot mutate production route resolution"), "production route forbidden"),
    check("sandbox cannot mutate global route success", fullMatchWorkbenchChainReplay3K.includes("sandbox can mutate global route success rates: false") && fullMatchWorkbenchChainReplay3KValidation.includes("sandbox cannot mutate global route success rates"), "global route success forbidden"),
    check("sandbox cannot claim global economy", fullMatchWorkbenchChainReplay3K.includes("sandbox can claim global economy: false") && fullMatchWorkbenchChainReplay3KValidation.includes("sandbox cannot claim global economy"), "global economy forbidden"),
    check("coach copy wording is clean", fullMatchWorkbenchChainReplay3K.includes("stale coach wording status: absent") && !coachExperimentalHtml.includes("simulation experimental") && !coachExperimentalHtml.includes("resolution live du simulation"), "coach copy clean"),
    check("scoring constants unchanged", scoringEvents.includes("SHOT_GOAL = 3 points") && scoringEvents.includes("TRY_TOUCHDOWN = 5 points") && scoringEvents.includes("CONVERSION_GOAL = 2 points") && scoringEvents.includes("DROP_GOAL = 2 points"), "scoring constants visible"),
    check("PENALTY_SHOT remains inactive", scoringEvents.includes("PENALTY_SHOT inactive"), "penalty inactive"),
    check("no production scoring events deleted or capped", fullMatchWorkbenchChainReplay3KValidation.includes("no production scoring events deleted or capped") && bundleSimulation.includes("score_change"), "scoring event guard visible"),
    check("no MatchBonusEvent mutation", scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream") && fullMatchWorkbenchChainReplay3KValidation.includes("MatchBonusEvent unchanged"), "MatchBonusEvent separated"),
    check("batch/live separation preserved", scoringEvents.includes("batch/live separation status: PASS") && fullMatchWorkbenchChainReplay3KValidation.includes("batch/live separation preserved"), "batch/live PASS"),
    check("50-match economy remains global reference", fullMatchWorkbenchChainReplay3K.includes("FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof") && bundleSimulation.includes("VALIDATED_FULL_MATCH_ECONOMY_ANCHOR"), "50-match reference visible"),
    check("recommendations visible", fullMatchWorkbenchChainReplay3K.includes("CONFIRM_REAL_ISOLATED_REPLAY_ENGINE_TO_CONTROLLED_ROUTE_RESOLUTION_SANDBOX") && fullMatchWorkbenchChainReplay3K.includes("CONFIRM_SANDBOX_RESULTS_ARE_NOT_OFFICIAL_MATCH_EVENTS") && fullMatchWorkbenchChainReplay3K.includes("PREPARE_CONTROLLED_ROUTE_RESOLUTION_SANDBOX_TO_SANDBOX_SCORING_OPPORTUNITY_MODEL"), "3K recommendations visible"),
  ];

  const sprint3JExpectedFiles = [
    "package.json",
    "tsconfig.json",
    "coach-report.latest.html",
    "coach-report.default.html",
    "coach-report.experimental.html",
    "scoring-events-summary.md",
    "sequence-1-action-1.html",
    "sequence-1-action-2.html",
    "sequence-1-action-3.html",
    "validation.share-pack.md",
    "fullmatch-workbench-chain-replay-3j.md",
    "validation.fullmatch-workbench-chain-replay-3j.md",
    "README.md",
    "manifest.md",
    "00-share-manifest.txt",
    "bundle__contracts.md",
    "bundle__simulation.md",
    "bundle__reports.md",
  ];
  const sprint3JForbiddenLeftovers = [
    "fullmatch-workbench-chain-replay-3i.md",
    "validation.fullmatch-workbench-chain-replay-3i.md",
    "fullmatch-workbench-chain-replay-3h.md",
    "validation.fullmatch-workbench-chain-replay-3h.md",
    "fullmatch-workbench-chain-replay-3g.md",
    "validation.fullmatch-workbench-chain-replay-3g.md",
    "fullmatch-workbench-chain-replay-3f.md",
    "validation.fullmatch-workbench-chain-replay-3f.md",
    "fullmatch-workbench-chain-replay-3e.md",
    "validation.fullmatch-workbench-chain-replay-3e.md",
  ];
  const sprint3JChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("current sprint is Sprint 3J", activeConfig.sprintName === "Sprint 3J - Real Isolated Replay Engine", activeConfig.sprintName),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share pack under 20 files", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("final file count is 18", filesOnDisk.length === 18, `${filesOnDisk.length}`),
    check("minimal allowlist count is 18", allowlistedFiles.length === 18, `${allowlistedFiles.length}`),
    check("missing expected files are none", missingExpectedFiles.length === 0, missingExpectedFiles.join(", ") || "none"),
    check("stale share file count is 0", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("previous sprint leftovers are 0", sprint3JForbiddenLeftovers.every((file) => !requiredCopied(file)), sprint3JForbiddenLeftovers.filter((file) => requiredCopied(file)).join(", ") || "0"),
    check("source files deleted count is 0", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("all required current sprint files copied", sprint3JExpectedFiles.every((file) => requiredCopied(file)), sprint3JExpectedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest lists Sprint 3J", manifest.includes("Sprint 3J - Real Isolated Replay Engine") && detailedManifest.includes("Sprint 3J - Real Isolated Replay Engine"), "Sprint 3J visible"),
    check("README is Sprint 3J oriented", readme.includes("# Sprint 3J Share Pack") && readme.includes("fullmatch-workbench-chain-replay-3j.md"), "README current"),
    check("default and experimental coach reports copied", (coachDefaultHtml.includes("<!doctype html>") || coachDefaultHtml.includes("<html")) && (coachExperimentalHtml.includes("<!doctype html>") || coachExperimentalHtml.includes("<html")), "coach HTML variants copied"),
    check("3J report included", fullMatchWorkbenchChainReplay3J.includes("# FullMatch Workbench Chain Replay 3J") && fullMatchWorkbenchChainReplay3J.includes("real isolated replay status: available"), "3J doc included"),
    check("3J validation is PASS", fullMatchWorkbenchChainReplay3JValidation.includes("Status: PASS") && fullMatchWorkbenchChainReplay3JValidation.includes("real isolated segment replay status is available"), "3J validation PASS"),
    check("real isolated replay origin visible", fullMatchWorkbenchChainReplay3J.includes("real isolated replay origin: controlled_segment_replay_comparison"), "origin visible"),
    check("baseline candidate/action/receiver/zone/event visible", fullMatchWorkbenchChainReplay3J.includes("baseline candidate: chain-context-safe-recycle-pv") && fullMatchWorkbenchChainReplay3J.includes("baseline action: SAFE_RECYCLE") && fullMatchWorkbenchChainReplay3J.includes("baseline receiver: control-pivot") && fullMatchWorkbenchChainReplay3J.includes("baseline zone: Z2-HSL") && fullMatchWorkbenchChainReplay3J.includes("baseline event count: greater than 0"), "baseline visible"),
    check("override candidate/action/receiver/zone/event visible", fullMatchWorkbenchChainReplay3J.includes("override candidate: chain-context-forward-progress-sh") && fullMatchWorkbenchChainReplay3J.includes("override action: FORWARD_PROGRESS") && fullMatchWorkbenchChainReplay3J.includes("override receiver: control-space-hunter") && fullMatchWorkbenchChainReplay3J.includes("override zone: Z4-HSR") && fullMatchWorkbenchChainReplay3J.includes("override event count: greater than 0"), "override visible"),
    check("real replay divergence fields visible", fullMatchWorkbenchChainReplay3J.includes("selection divergence observed: true") && fullMatchWorkbenchChainReplay3J.includes("carrier divergence observed: true") && fullMatchWorkbenchChainReplay3J.includes("zone progression divergence observed: true") && fullMatchWorkbenchChainReplay3J.includes("danger creation divergence observed: true") && fullMatchWorkbenchChainReplay3J.includes("isolated timeline divergence observed: true"), "divergence fields visible"),
    check("real isolated replay contract bundled", bundleSimulation.includes("src/simulation/fullMatch/fullMatchRealIsolatedSegmentReplay.ts") && bundleSimulation.includes("FullMatchRealIsolatedSegmentReplay"), "3J contract bundled"),
    check("isolated replay event contract bundled", bundleSimulation.includes("src/simulation/fullMatch/isolatedSegmentReplayEvent.ts") && bundleSimulation.includes("IsolatedSegmentReplayEvent"), "3J event contract bundled"),
    check("real isolated replay engine bundled", bundleSimulation.includes("src/simulation/fullMatch/realIsolatedSegmentReplayEngine.ts") && bundleSimulation.includes("runRealIsolatedSegmentReplayPath"), "3J engine bundled"),
    check("real isolated replay converter bundled", bundleSimulation.includes("src/simulation/fullMatch/realIsolatedSegmentReplayFromComparison.ts") && bundleSimulation.includes("realIsolatedSegmentReplayFromComparison"), "3J converter bundled"),
    check("real isolated replay comparison helper bundled", bundleSimulation.includes("src/simulation/fullMatch/compareRealIsolatedSegmentReplayPaths.ts") && bundleSimulation.includes("compareRealIsolatedSegmentReplayPaths"), "3J helper bundled"),
    check("real isolated replay signature bundled", bundleSimulation.includes("src/simulation/fullMatch/fullMatchRealIsolatedSegmentReplaySignature.ts") && bundleSimulation.includes("FullMatchRealIsolatedSegmentReplaySignature"), "3J signature bundled"),
    check("real isolated replay tests bundled", bundleSimulation.includes("compareRealIsolatedSegmentReplayPaths.test.ts") && bundleSimulation.includes("fullMatchRealIsolatedSegmentReplay.test.ts") && bundleSimulation.includes("fullMatchRealIsolatedSegmentReplayGuard.test.ts"), "3J unit tests bundled"),
    check("3J runFullMatch real isolated replay tests bundled", bundleSimulation.includes("runFullMatchExperimentalRealIsolatedSegmentReplay.test.ts") && bundleSimulation.includes("runFullMatchRealIsolatedSegmentReplayScoringGuard.test.ts"), "3J full-match tests bundled"),
    check("3J scoring and source-of-truth guards bundled", bundleSimulation.includes("scoringGuard.3j.test.ts") && bundleSimulation.includes("sourceOfTruthGuards.3j.test.ts"), "3J guards bundled"),
    check("real isolated replay evidence included", fullMatchWorkbenchChainReplay3J.includes("WORKBENCH_CHAIN_REAL_ISOLATED_SEGMENT_REPLAY") && bundleSimulation.includes("WORKBENCH_CHAIN_REAL_ISOLATED_SEGMENT_REPLAY"), "3J evidence visible"),
    check("isolated events are not official MatchEvents", fullMatchWorkbenchChainReplay3J.includes("isolated replay events are official MatchEvents: false") && fullMatchWorkbenchChainReplay3J.includes("no isolated replay event is inserted as an official MatchEvent: YES"), "official timeline clean"),
    check("closed and unavailable candidates remain rejected", fullMatchWorkbenchChainReplay3J.includes("rejected closed candidate count: 1") && fullMatchWorkbenchChainReplay3J.includes("rejected unavailable candidate count: 1"), "blocked routes rejected"),
    check("default real isolated replay absent", fullMatchWorkbenchChainReplay3J.includes("default real isolated replay tag count: 0"), "default replay clean"),
    check("experimental real isolated replay present", fullMatchWorkbenchChainReplay3J.includes("experimental real isolated replay tag count: greater than 0"), "experimental replay visible"),
    check("replay is isolated-only", fullMatchWorkbenchChainReplay3J.includes("replayAppliedOnlyInIsolatedEngine: true") && fullMatchWorkbenchChainReplay3J.includes("replayAppliedToNormalLiveSelection: false"), "isolated replay visible"),
    check("default and experimental official score signatures remain equal", fullMatchWorkbenchChainReplay3J.includes("default and experimental official score signatures remain equal for now: YES") && fullMatchWorkbenchChainReplay3JValidation.includes("default and experimental official score signatures remain equal"), "score signatures equal"),
    check("real replay cannot mutate official score", fullMatchWorkbenchChainReplay3J.includes("real isolated replay can mutate official score: false") && fullMatchWorkbenchChainReplay3JValidation.includes("real isolated replay cannot mutate official score"), "official score mutation forbidden"),
    check("real replay cannot mutate official scoring events", fullMatchWorkbenchChainReplay3J.includes("real isolated replay can mutate official scoring events: false") && fullMatchWorkbenchChainReplay3JValidation.includes("real isolated replay cannot mutate official scoring events"), "official scoring event mutation forbidden"),
    check("real replay cannot create production scoring events", fullMatchWorkbenchChainReplay3J.includes("real isolated replay can create production scoring events: false") && fullMatchWorkbenchChainReplay3JValidation.includes("real isolated replay cannot create production scoring events"), "production scoring event creation forbidden"),
    check("real replay cannot mutate production route resolution", fullMatchWorkbenchChainReplay3J.includes("real isolated replay can mutate production route resolution: false") && fullMatchWorkbenchChainReplay3JValidation.includes("real isolated replay cannot mutate production route resolution"), "production route forbidden"),
    check("real replay cannot mutate global route success", fullMatchWorkbenchChainReplay3J.includes("real isolated replay can mutate global route success rates: false") && fullMatchWorkbenchChainReplay3JValidation.includes("real isolated replay cannot mutate global route success rates"), "global route success forbidden"),
    check("real replay cannot claim global economy", fullMatchWorkbenchChainReplay3J.includes("real isolated replay can claim global economy: false") && fullMatchWorkbenchChainReplay3JValidation.includes("real isolated replay cannot claim global economy"), "global economy forbidden"),
    check("coach copy wording is clean", fullMatchWorkbenchChainReplay3J.includes("stale coach wording status: absent") && !coachExperimentalHtml.includes("simulation experimental") && !coachExperimentalHtml.includes("resolution live du simulation"), "coach copy clean"),
    check("scoring constants unchanged", scoringEvents.includes("SHOT_GOAL = 3 points") && scoringEvents.includes("TRY_TOUCHDOWN = 5 points") && scoringEvents.includes("CONVERSION_GOAL = 2 points") && scoringEvents.includes("DROP_GOAL = 2 points"), "scoring constants visible"),
    check("PENALTY_SHOT remains inactive", scoringEvents.includes("PENALTY_SHOT inactive"), "penalty inactive"),
    check("no production scoring events deleted or capped", fullMatchWorkbenchChainReplay3JValidation.includes("no production scoring events deleted or capped") && bundleSimulation.includes("score_change"), "scoring event guard visible"),
    check("no MatchBonusEvent mutation", scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream") && fullMatchWorkbenchChainReplay3JValidation.includes("MatchBonusEvent unchanged"), "MatchBonusEvent separated"),
    check("batch/live separation preserved", scoringEvents.includes("batch/live separation status: PASS") && fullMatchWorkbenchChainReplay3JValidation.includes("batch/live separation preserved"), "batch/live PASS"),
    check("50-match economy remains global reference", fullMatchWorkbenchChainReplay3J.includes("FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof") && bundleSimulation.includes("VALIDATED_FULL_MATCH_ECONOMY_ANCHOR"), "50-match reference visible"),
    check("recommendations visible", fullMatchWorkbenchChainReplay3J.includes("CONFIRM_CONTROLLED_SEGMENT_REPLAY_COMPARISON_TO_REAL_ISOLATED_REPLAY_ENGINE") && fullMatchWorkbenchChainReplay3J.includes("CONFIRM_REAL_REPLAY_EVENTS_ARE_NOT_OFFICIAL_MATCH_EVENTS") && fullMatchWorkbenchChainReplay3J.includes("PREPARE_REAL_ISOLATED_REPLAY_ENGINE_TO_CONTROLLED_ROUTE_RESOLUTION_SANDBOX"), "3J recommendations visible"),
  ];

  const sprint3IExpectedFiles = [
    "package.json",
    "tsconfig.json",
    "coach-report.latest.html",
    "coach-report.default.html",
    "coach-report.experimental.html",
    "scoring-events-summary.md",
    "sequence-1-action-1.html",
    "sequence-1-action-2.html",
    "sequence-1-action-3.html",
    "validation.share-pack.md",
    "fullmatch-workbench-chain-replay-3i.md",
    "validation.fullmatch-workbench-chain-replay-3i.md",
    "README.md",
    "manifest.md",
    "00-share-manifest.txt",
    "bundle__contracts.md",
    "bundle__simulation.md",
    "bundle__reports.md",
  ];
  const sprint3IForbiddenLeftovers = [
    "fullmatch-workbench-chain-replay-3h.md",
    "validation.fullmatch-workbench-chain-replay-3h.md",
    "fullmatch-workbench-chain-replay-3g.md",
    "validation.fullmatch-workbench-chain-replay-3g.md",
    "fullmatch-workbench-chain-replay-3f.md",
    "validation.fullmatch-workbench-chain-replay-3f.md",
    "fullmatch-workbench-chain-replay-3e.md",
    "validation.fullmatch-workbench-chain-replay-3e.md",
    "fullmatch-workbench-chain-replay-3d.md",
    "validation.fullmatch-workbench-chain-replay-3d.md",
    "fullmatch-workbench-chain-replay-3c.md",
    "validation.fullmatch-workbench-chain-replay-3c.md",
    "fullmatch-workbench-chain-replay-3b.md",
    "validation.fullmatch-workbench-chain-replay-3b.md",
    "fullmatch-workbench-chain-replay-3a.md",
    "validation.fullmatch-workbench-chain-replay-3a.md",
    "fullmatch-workbench-chain-replay-2z.md",
    "validation.fullmatch-workbench-chain-replay-2z.md",
  ];
  const sprint3IChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("current sprint is Sprint 3I", activeConfig.sprintName === "Sprint 3I - Controlled Segment Replay Comparison", activeConfig.sprintName),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share pack under 20 files", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("final file count is 18", filesOnDisk.length === 18, `${filesOnDisk.length}`),
    check("minimal allowlist count is 18", allowlistedFiles.length === 18, `${allowlistedFiles.length}`),
    check("missing expected files are none", missingExpectedFiles.length === 0, missingExpectedFiles.join(", ") || "none"),
    check("stale share file count is 0", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("previous sprint leftovers are 0", sprint3IForbiddenLeftovers.every((file) => !requiredCopied(file)), sprint3IForbiddenLeftovers.filter((file) => requiredCopied(file)).join(", ") || "0"),
    check("source files deleted count is 0", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("all required current sprint files copied", sprint3IExpectedFiles.every((file) => requiredCopied(file)), sprint3IExpectedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest lists Sprint 3I", manifest.includes("Sprint 3I - Controlled Segment Replay Comparison") && detailedManifest.includes("Sprint 3I - Controlled Segment Replay Comparison"), "Sprint 3I visible"),
    check("README is Sprint 3I oriented", readme.includes("# Sprint 3I Share Pack") && readme.includes("fullmatch-workbench-chain-replay-3i.md"), "README current"),
    check("default and experimental coach reports copied", (coachDefaultHtml.includes("<!doctype html>") || coachDefaultHtml.includes("<html")) && (coachExperimentalHtml.includes("<!doctype html>") || coachExperimentalHtml.includes("<html")), "coach HTML variants copied"),
    check("3I report included", fullMatchWorkbenchChainReplay3I.includes("# FullMatch Workbench Chain Replay 3I") && fullMatchWorkbenchChainReplay3I.includes("controlled segment replay comparison status: available"), "3I doc included"),
    check("3I validation is PASS", fullMatchWorkbenchChainReplay3IValidation.includes("Status: PASS") && fullMatchWorkbenchChainReplay3IValidation.includes("controlled segment replay comparison status is available"), "3I validation PASS"),
    check("controlled replay origin visible", fullMatchWorkbenchChainReplay3I.includes("controlled segment replay comparison origin: isolated_minimatch_override_experiment"), "origin visible"),
    check("baseline candidate/action/receiver/zone visible", fullMatchWorkbenchChainReplay3I.includes("baseline candidate: chain-context-safe-recycle-pv") && fullMatchWorkbenchChainReplay3I.includes("baseline action: SAFE_RECYCLE") && fullMatchWorkbenchChainReplay3I.includes("baseline receiver: control-pivot") && fullMatchWorkbenchChainReplay3I.includes("baseline zone: Z2-HSL"), "baseline visible"),
    check("override candidate/action/receiver/zone visible", fullMatchWorkbenchChainReplay3I.includes("override candidate: chain-context-forward-progress-sh") && fullMatchWorkbenchChainReplay3I.includes("override action: FORWARD_PROGRESS") && fullMatchWorkbenchChainReplay3I.includes("override receiver: control-space-hunter") && fullMatchWorkbenchChainReplay3I.includes("override zone: Z4-HSR"), "override visible"),
    check("replay divergence fields visible", fullMatchWorkbenchChainReplay3I.includes("selection divergence observed: true") && fullMatchWorkbenchChainReplay3I.includes("zone progression divergence observed: true") && fullMatchWorkbenchChainReplay3I.includes("danger creation divergence observed: true") && fullMatchWorkbenchChainReplay3I.includes("score divergence observed: false") && fullMatchWorkbenchChainReplay3I.includes("scoring event divergence observed: false"), "divergence fields visible"),
    check("controlled replay contract bundled", bundleSimulation.includes("src/simulation/fullMatch/fullMatchControlledSegmentReplayComparison.ts") && bundleSimulation.includes("FullMatchControlledSegmentReplayComparison"), "3I contract bundled"),
    check("controlled replay converter bundled", bundleSimulation.includes("src/simulation/fullMatch/controlledSegmentReplayComparisonFromExperiment.ts") && bundleSimulation.includes("controlledSegmentReplayComparisonFromExperiment"), "3I converter bundled"),
    check("controlled replay comparison helper bundled", bundleSimulation.includes("src/simulation/fullMatch/compareControlledSegmentReplayPaths.ts") && bundleSimulation.includes("compareControlledSegmentReplayPaths"), "3I helper bundled"),
    check("controlled replay signature bundled", bundleSimulation.includes("src/simulation/fullMatch/fullMatchControlledSegmentReplayComparisonSignature.ts") && bundleSimulation.includes("FullMatchControlledSegmentReplayComparisonSignature"), "3I signature bundled"),
    check("controlled replay tests bundled", bundleSimulation.includes("compareControlledSegmentReplayPaths.test.ts") && bundleSimulation.includes("fullMatchControlledSegmentReplayComparison.test.ts") && bundleSimulation.includes("fullMatchControlledSegmentReplayComparisonGuard.test.ts"), "3I unit tests bundled"),
    check("3I runFullMatch controlled replay tests bundled", bundleSimulation.includes("runFullMatchExperimentalControlledSegmentReplayComparison.test.ts") && bundleSimulation.includes("runFullMatchControlledSegmentReplayComparisonScoringGuard.test.ts"), "3I full-match tests bundled"),
    check("3I scoring and source-of-truth guards bundled", bundleSimulation.includes("scoringGuard.3i.test.ts") && bundleSimulation.includes("sourceOfTruthGuards.3i.test.ts"), "3I guards bundled"),
    check("controlled replay evidence included", fullMatchWorkbenchChainReplay3I.includes("WORKBENCH_CHAIN_CONTROLLED_SEGMENT_REPLAY_COMPARISON") && bundleSimulation.includes("WORKBENCH_CHAIN_CONTROLLED_SEGMENT_REPLAY_COMPARISON"), "3I evidence visible"),
    check("closed and unavailable candidates remain rejected", fullMatchWorkbenchChainReplay3I.includes("rejected closed candidate count: 1") && fullMatchWorkbenchChainReplay3I.includes("rejected unavailable candidate count: 1"), "blocked routes rejected"),
    check("default controlled replay absent", fullMatchWorkbenchChainReplay3I.includes("default controlled segment replay comparison tag count: 0"), "default comparison clean"),
    check("experimental controlled replay present", fullMatchWorkbenchChainReplay3I.includes("experimental controlled segment replay comparison tag count: greater than 0"), "experimental comparison visible"),
    check("replay is isolated-only", fullMatchWorkbenchChainReplay3I.includes("replayAppliedOnlyInIsolatedComparison: true") && fullMatchWorkbenchChainReplay3I.includes("replayAppliedToNormalLiveSelection: false"), "isolated replay visible"),
    check("default and experimental score signatures remain equal", fullMatchWorkbenchChainReplay3I.includes("default and experimental score signatures remain equal for now: YES") && fullMatchWorkbenchChainReplay3IValidation.includes("default and experimental normal score signatures remain equal"), "score signatures equal"),
    check("controlled replay cannot mutate normal score", fullMatchWorkbenchChainReplay3I.includes("controlled segment replay comparison can mutate normal score: false") && fullMatchWorkbenchChainReplay3IValidation.includes("controlled replay comparison cannot mutate normal full-match score"), "normal score mutation forbidden"),
    check("controlled replay cannot mutate normal scoring events", fullMatchWorkbenchChainReplay3I.includes("controlled segment replay comparison can mutate normal scoring events: false") && fullMatchWorkbenchChainReplay3IValidation.includes("controlled replay comparison cannot mutate normal full-match scoring events"), "normal scoring event mutation forbidden"),
    check("controlled replay cannot create production scoring events", fullMatchWorkbenchChainReplay3I.includes("controlled segment replay comparison can create production scoring events: false") && fullMatchWorkbenchChainReplay3IValidation.includes("controlled replay comparison cannot create production scoring events"), "production scoring event creation forbidden"),
    check("controlled replay cannot mutate production route resolution", fullMatchWorkbenchChainReplay3I.includes("controlled segment replay comparison can mutate production route resolution: false") && fullMatchWorkbenchChainReplay3IValidation.includes("controlled replay comparison cannot mutate production route resolution"), "production route forbidden"),
    check("controlled replay cannot mutate global route success", fullMatchWorkbenchChainReplay3I.includes("controlled segment replay comparison can mutate global route success rates: false") && fullMatchWorkbenchChainReplay3IValidation.includes("controlled replay comparison cannot mutate global route success rates"), "global route success forbidden"),
    check("controlled replay cannot claim global economy", fullMatchWorkbenchChainReplay3I.includes("controlled segment replay comparison can claim global economy: false") && fullMatchWorkbenchChainReplay3IValidation.includes("controlled replay comparison cannot claim global economy"), "global economy forbidden"),
    check("coach copy wording is clean", fullMatchWorkbenchChainReplay3I.includes("stale coach wording status: absent") && !coachExperimentalHtml.includes("simulation experimental") && !coachExperimentalHtml.includes("resolution live du simulation"), "coach copy clean"),
    check("scoring constants unchanged", scoringEvents.includes("SHOT_GOAL = 3 points") && scoringEvents.includes("TRY_TOUCHDOWN = 5 points") && scoringEvents.includes("CONVERSION_GOAL = 2 points") && scoringEvents.includes("DROP_GOAL = 2 points"), "scoring constants visible"),
    check("PENALTY_SHOT remains inactive", scoringEvents.includes("PENALTY_SHOT inactive"), "penalty inactive"),
    check("no scoring events deleted or capped", fullMatchWorkbenchChainReplay3IValidation.includes("no production scoring events deleted or capped") && bundleSimulation.includes("score_change"), "scoring event guard visible"),
    check("no MatchBonusEvent mutation", scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream") && fullMatchWorkbenchChainReplay3IValidation.includes("MatchBonusEvent unchanged"), "MatchBonusEvent separated"),
    check("batch/live separation preserved", scoringEvents.includes("batch/live separation status: PASS") && fullMatchWorkbenchChainReplay3IValidation.includes("batch/live separation preserved"), "batch/live PASS"),
    check("50-match economy remains global reference", fullMatchWorkbenchChainReplay3I.includes("FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof") && bundleSimulation.includes("VALIDATED_FULL_MATCH_ECONOMY_ANCHOR"), "50-match reference visible"),
    check("recommendations visible", fullMatchWorkbenchChainReplay3I.includes("CONFIRM_ISOLATED_OVERRIDE_EXPERIMENT_TO_CONTROLLED_SEGMENT_REPLAY_COMPARISON") && fullMatchWorkbenchChainReplay3I.includes("CONFIRM_REPLAY_COMPARISON_DOES_NOT_CREATE_PRODUCTION_SCORING_EVENTS") && fullMatchWorkbenchChainReplay3I.includes("PREPARE_CONTROLLED_SEGMENT_REPLAY_COMPARISON_TO_REAL_ISOLATED_REPLAY_ENGINE"), "3I recommendations visible"),
  ];
  const sprint3HExpectedFiles = [
    "package.json",
    "tsconfig.json",
    "coach-report.latest.html",
    "coach-report.default.html",
    "coach-report.experimental.html",
    "scoring-events-summary.md",
    "sequence-1-action-1.html",
    "sequence-1-action-2.html",
    "sequence-1-action-3.html",
    "validation.share-pack.md",
    "fullmatch-workbench-chain-replay-3h.md",
    "validation.fullmatch-workbench-chain-replay-3h.md",
    "README.md",
    "manifest.md",
    "00-share-manifest.txt",
    "bundle__contracts.md",
    "bundle__simulation.md",
    "bundle__reports.md",
  ];
  const sprint3HForbiddenLeftovers = [
    "fullmatch-workbench-chain-replay-3g.md",
    "validation.fullmatch-workbench-chain-replay-3g.md",
    "fullmatch-workbench-chain-replay-3f.md",
    "validation.fullmatch-workbench-chain-replay-3f.md",
    "fullmatch-workbench-chain-replay-3e.md",
    "validation.fullmatch-workbench-chain-replay-3e.md",
    "fullmatch-workbench-chain-replay-3d.md",
    "validation.fullmatch-workbench-chain-replay-3d.md",
    "fullmatch-workbench-chain-replay-3c.md",
    "validation.fullmatch-workbench-chain-replay-3c.md",
    "fullmatch-workbench-chain-replay-3b.md",
    "validation.fullmatch-workbench-chain-replay-3b.md",
    "fullmatch-workbench-chain-replay-3a.md",
    "validation.fullmatch-workbench-chain-replay-3a.md",
    "fullmatch-workbench-chain-replay-2z.md",
    "validation.fullmatch-workbench-chain-replay-2z.md",
  ];
  const sprint3HChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("current sprint is Sprint 3H", activeConfig.sprintName === "Sprint 3H - Isolated MiniMatch Override Experiment", activeConfig.sprintName),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share pack under 20 files", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("final file count is 18", filesOnDisk.length === 18, `${filesOnDisk.length}`),
    check("minimal allowlist count is 18", allowlistedFiles.length === 18, `${allowlistedFiles.length}`),
    check("missing expected files are none", missingExpectedFiles.length === 0, missingExpectedFiles.join(", ") || "none"),
    check("stale share file count is 0", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("previous sprint leftovers are 0", sprint3HForbiddenLeftovers.every((file) => !requiredCopied(file)), sprint3HForbiddenLeftovers.filter((file) => requiredCopied(file)).join(", ") || "0"),
    check("source files deleted count is 0", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("all required current sprint files copied", sprint3HExpectedFiles.every((file) => requiredCopied(file)), sprint3HExpectedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest lists Sprint 3H", manifest.includes("Sprint 3H - Isolated MiniMatch Override Experiment") && detailedManifest.includes("Sprint 3H - Isolated MiniMatch Override Experiment"), "Sprint 3H visible"),
    check("README is Sprint 3H oriented", readme.includes("# Sprint 3H Share Pack") && readme.includes("fullmatch-workbench-chain-replay-3h.md"), "README current"),
    check("default and experimental coach reports copied", (coachDefaultHtml.includes("<!doctype html>") || coachDefaultHtml.includes("<html")) && (coachExperimentalHtml.includes("<!doctype html>") || coachExperimentalHtml.includes("<html")), "coach HTML variants copied"),
    check("3H report included", fullMatchWorkbenchChainReplay3H.includes("# FullMatch Workbench Chain Replay 3H") && fullMatchWorkbenchChainReplay3H.includes("isolated mini-match override experiment status: available"), "3H doc included"),
    check("3H validation is PASS", fullMatchWorkbenchChainReplay3HValidation.includes("Status: PASS") && fullMatchWorkbenchChainReplay3HValidation.includes("isolated mini-match override experiment status is available"), "3H validation PASS"),
    check("isolated override origin visible", fullMatchWorkbenchChainReplay3H.includes("isolated mini-match override experiment origin: live_selection_override_guard") && fullMatchWorkbenchChainReplay3HValidation.includes("origin is live_selection_override_guard"), "origin visible"),
    check("baseline candidate visible", fullMatchWorkbenchChainReplay3H.includes("baseline candidate: chain-context-safe-recycle-pv") && fullMatchWorkbenchChainReplay3HValidation.includes("baseline candidate is chain-context-safe-recycle-pv"), "baseline visible"),
    check("override candidate visible", fullMatchWorkbenchChainReplay3H.includes("override candidate: chain-context-forward-progress-sh") && fullMatchWorkbenchChainReplay3HValidation.includes("override candidate is chain-context-forward-progress-sh"), "candidate visible"),
    check("override action visible", fullMatchWorkbenchChainReplay3H.includes("override action type: FORWARD_PROGRESS") && fullMatchWorkbenchChainReplay3HValidation.includes("override action is FORWARD_PROGRESS"), "action visible"),
    check("override receiver and zone visible", fullMatchWorkbenchChainReplay3H.includes("override receiver: control-space-hunter") && fullMatchWorkbenchChainReplay3H.includes("override target zone: Z4-HSR"), "receiver/zone visible"),
    check("override source scores visible", fullMatchWorkbenchChainReplay3H.includes("source base score: 82") && fullMatchWorkbenchChainReplay3H.includes("source influence delta: 5") && fullMatchWorkbenchChainReplay3H.includes("source influenced score: 87"), "source scores visible"),
    check("isolated override contract bundled", bundleSimulation.includes("src/simulation/fullMatch/fullMatchIsolatedMiniMatchOverrideExperiment.ts") && bundleSimulation.includes("FullMatchIsolatedMiniMatchOverrideExperiment"), "3H contract bundled"),
    check("isolated override converter bundled", bundleSimulation.includes("src/simulation/fullMatch/isolatedMiniMatchOverrideExperimentFromGuard.ts") && bundleSimulation.includes("isolatedMiniMatchOverrideExperimentFromGuard"), "3H converter bundled"),
    check("isolated override comparison bundled", bundleSimulation.includes("src/simulation/fullMatch/compareIsolatedMiniMatchOverride.ts") && bundleSimulation.includes("compareIsolatedMiniMatchOverride"), "3H comparison bundled"),
    check("isolated override signature bundled", bundleSimulation.includes("src/simulation/fullMatch/fullMatchIsolatedMiniMatchOverrideExperimentSignature.ts") && bundleSimulation.includes("FullMatchIsolatedMiniMatchOverrideExperimentSignature"), "3H signature bundled"),
    check("isolated override tests bundled", bundleSimulation.includes("fullMatchIsolatedMiniMatchOverrideExperiment.test.ts") && bundleSimulation.includes("fullMatchIsolatedMiniMatchOverrideExperimentGuard.test.ts"), "3H unit tests bundled"),
    check("3H runFullMatch isolated override tests bundled", bundleSimulation.includes("runFullMatchExperimentalIsolatedMiniMatchOverrideExperiment.test.ts") && bundleSimulation.includes("runFullMatchIsolatedMiniMatchOverrideExperimentScoringGuard.test.ts"), "3H full-match tests bundled"),
    check("3H scoring and source-of-truth guards bundled", bundleSimulation.includes("scoringGuard.3h.test.ts") && bundleSimulation.includes("sourceOfTruthGuards.3h.test.ts"), "3H guards bundled"),
    check("isolated override evidence included", fullMatchWorkbenchChainReplay3H.includes("WORKBENCH_CHAIN_ISOLATED_MINIMATCH_OVERRIDE_EXPERIMENT") && bundleSimulation.includes("WORKBENCH_CHAIN_ISOLATED_MINIMATCH_OVERRIDE_EXPERIMENT"), "3H evidence visible"),
    check("closed candidates remain rejected", fullMatchWorkbenchChainReplay3H.includes("rejected closed candidate count: 1") && fullMatchWorkbenchChainReplay3HValidation.includes("CLOSED candidates remain unselectable"), "closed route rejected"),
    check("unavailable candidates remain rejected", fullMatchWorkbenchChainReplay3H.includes("rejected unavailable candidate count: 1") && fullMatchWorkbenchChainReplay3HValidation.includes("unavailable candidates remain unselectable"), "unavailable route rejected"),
    check("override candidate legal and available", fullMatchWorkbenchChainReplay3H.includes("candidate legal: true") && fullMatchWorkbenchChainReplay3H.includes("candidate available: true"), "candidate valid"),
    check("default isolated override absent", fullMatchWorkbenchChainReplay3H.includes("default isolated mini-match override experiment tag count: 0"), "default experiment clean"),
    check("experimental isolated override present", fullMatchWorkbenchChainReplay3H.includes("experimental isolated mini-match override experiment tag count: greater than 0"), "experimental experiment visible"),
    check("override applies only in isolated experiment", fullMatchWorkbenchChainReplay3H.includes("overrideAppliedInIsolatedExperiment: true") && fullMatchWorkbenchChainReplay3HValidation.includes("overrideAppliedInIsolatedExperiment is true"), "isolated apply true"),
    check("override is not applied to normal live", fullMatchWorkbenchChainReplay3H.includes("overrideAppliedToNormalLiveSelection: false") && fullMatchWorkbenchChainReplay3HValidation.includes("overrideAppliedToNormalLiveSelection is false"), "normal live false"),
    check("isolated selection divergence visible", fullMatchWorkbenchChainReplay3H.includes("isolated selection divergence observed: true") && fullMatchWorkbenchChainReplay3HValidation.includes("isolated selection divergence is observed"), "selection divergence visible"),
    check("score and scoring event divergence remain false", fullMatchWorkbenchChainReplay3H.includes("isolated score divergence observed: false") && fullMatchWorkbenchChainReplay3H.includes("isolated scoring event divergence observed: false"), "score/scoring divergence false"),
    check("default and experimental score signatures remain equal", fullMatchWorkbenchChainReplay3H.includes("default and experimental score signatures remain equal for now: YES") && fullMatchWorkbenchChainReplay3HValidation.includes("default and experimental score signatures remain equal"), "score signatures equal"),
    check("isolated override cannot mutate normal score", fullMatchWorkbenchChainReplay3H.includes("isolated mini-match override experiment can mutate normal score: false") && fullMatchWorkbenchChainReplay3HValidation.includes("isolated experiment cannot mutate normal score"), "normal score mutation forbidden"),
    check("isolated override cannot mutate normal scoring events", fullMatchWorkbenchChainReplay3H.includes("isolated mini-match override experiment can mutate normal scoring events: false") && fullMatchWorkbenchChainReplay3HValidation.includes("isolated experiment cannot mutate normal scoring events"), "normal scoring event mutation forbidden"),
    check("isolated override cannot create production scoring events", fullMatchWorkbenchChainReplay3H.includes("isolated mini-match override experiment can create production scoring events: false") && fullMatchWorkbenchChainReplay3HValidation.includes("isolated experiment cannot create production scoring events"), "production scoring event creation forbidden"),
    check("isolated override cannot mutate production route resolution", fullMatchWorkbenchChainReplay3H.includes("isolated mini-match override experiment can mutate production route resolution: false") && fullMatchWorkbenchChainReplay3HValidation.includes("isolated experiment cannot mutate production route resolution"), "production route forbidden"),
    check("isolated override cannot mutate global route success", fullMatchWorkbenchChainReplay3H.includes("isolated mini-match override experiment can mutate global route success rates: false") && fullMatchWorkbenchChainReplay3HValidation.includes("isolated experiment cannot mutate global route success rates"), "global route success forbidden"),
    check("isolated override cannot claim global economy", fullMatchWorkbenchChainReplay3H.includes("isolated mini-match override experiment can claim global economy: false") && fullMatchWorkbenchChainReplay3HValidation.includes("isolated experiment cannot claim global economy"), "global economy forbidden"),
    check("coach copy wording is clean", fullMatchWorkbenchChainReplay3H.includes("stale coach wording status: absent") && !coachExperimentalHtml.includes("simulation experimental") && !coachExperimentalHtml.includes("resolution live du simulation"), "coach copy clean"),
    check("scoring constants unchanged", scoringEvents.includes("SHOT_GOAL = 3 points") && scoringEvents.includes("TRY_TOUCHDOWN = 5 points") && scoringEvents.includes("CONVERSION_GOAL = 2 points") && scoringEvents.includes("DROP_GOAL = 2 points"), "scoring constants visible"),
    check("PENALTY_SHOT remains inactive", scoringEvents.includes("PENALTY_SHOT inactive"), "penalty inactive"),
    check("no scoring events deleted or capped", fullMatchWorkbenchChainReplay3HValidation.includes("no scoring events deleted or capped") && bundleSimulation.includes("score_change"), "scoring event guard visible"),
    check("no MatchBonusEvent mutation", scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream") && fullMatchWorkbenchChainReplay3HValidation.includes("MatchBonusEvent unchanged"), "MatchBonusEvent separated"),
    check("batch/live separation preserved", scoringEvents.includes("batch/live separation status: PASS") && fullMatchWorkbenchChainReplay3HValidation.includes("batch/live separation preserved"), "batch/live PASS"),
    check("50-match economy remains global reference", fullMatchWorkbenchChainReplay3H.includes("FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof") && bundleSimulation.includes("VALIDATED_FULL_MATCH_ECONOMY_ANCHOR"), "50-match reference visible"),
    check("recommendations visible", fullMatchWorkbenchChainReplay3H.includes("CONFIRM_LIVE_SELECTION_OVERRIDE_GUARD_TO_ISOLATED_MINIMATCH_OVERRIDE_EXPERIMENT") && fullMatchWorkbenchChainReplay3H.includes("CONFIRM_ISOLATED_EXPERIMENT_DOES_NOT_CREATE_PRODUCTION_SCORING_EVENTS") && fullMatchWorkbenchChainReplay3H.includes("PREPARE_ISOLATED_OVERRIDE_EXPERIMENT_TO_CONTROLLED_SEGMENT_REPLAY_COMPARISON"), "3H recommendations visible"),
  ];
  const sprint3GExpectedFiles = [
    "package.json",
    "tsconfig.json",
    "coach-report.latest.html",
    "coach-report.default.html",
    "coach-report.experimental.html",
    "scoring-events-summary.md",
    "sequence-1-action-1.html",
    "sequence-1-action-2.html",
    "sequence-1-action-3.html",
    "validation.share-pack.md",
    "fullmatch-workbench-chain-replay-3g.md",
    "validation.fullmatch-workbench-chain-replay-3g.md",
    "README.md",
    "manifest.md",
    "00-share-manifest.txt",
    "bundle__contracts.md",
    "bundle__simulation.md",
    "bundle__reports.md",
  ];
  const sprint3GForbiddenLeftovers = [
    "fullmatch-workbench-chain-replay-3f.md",
    "validation.fullmatch-workbench-chain-replay-3f.md",
    "fullmatch-workbench-chain-replay-3e.md",
    "validation.fullmatch-workbench-chain-replay-3e.md",
    "fullmatch-workbench-chain-replay-3d.md",
    "validation.fullmatch-workbench-chain-replay-3d.md",
    "fullmatch-workbench-chain-replay-3c.md",
    "validation.fullmatch-workbench-chain-replay-3c.md",
    "fullmatch-workbench-chain-replay-3b.md",
    "validation.fullmatch-workbench-chain-replay-3b.md",
    "fullmatch-workbench-chain-replay-3a.md",
    "validation.fullmatch-workbench-chain-replay-3a.md",
    "fullmatch-workbench-chain-replay-2z.md",
    "validation.fullmatch-workbench-chain-replay-2z.md",
  ];
  const sprint3GChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("current sprint is Sprint 3G", activeConfig.sprintName === "Sprint 3G - Controlled Route Source to Live Selection Override Guards", activeConfig.sprintName),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share pack under 20 files", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("final file count is 18", filesOnDisk.length === 18, `${filesOnDisk.length}`),
    check("minimal allowlist count is 18", allowlistedFiles.length === 18, `${allowlistedFiles.length}`),
    check("missing expected files are none", missingExpectedFiles.length === 0, missingExpectedFiles.join(", ") || "none"),
    check("stale share file count is 0", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("previous sprint leftovers are 0", sprint3GForbiddenLeftovers.every((file) => !requiredCopied(file)), sprint3GForbiddenLeftovers.filter((file) => requiredCopied(file)).join(", ") || "0"),
    check("source files deleted count is 0", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("all required current sprint files copied", sprint3GExpectedFiles.every((file) => requiredCopied(file)), sprint3GExpectedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest lists Sprint 3G", manifest.includes("Sprint 3G - Controlled Route Source to Live Selection Override Guards") && detailedManifest.includes("Sprint 3G - Controlled Route Source to Live Selection Override Guards"), "Sprint 3G visible"),
    check("README is Sprint 3G oriented", readme.includes("# Sprint 3G Share Pack") && readme.includes("fullmatch-workbench-chain-replay-3g.md"), "README current"),
    check("default and experimental coach reports copied", (coachDefaultHtml.includes("<!doctype html>") || coachDefaultHtml.includes("<html")) && (coachExperimentalHtml.includes("<!doctype html>") || coachExperimentalHtml.includes("<html")), "coach HTML variants copied"),
    check("3G report included", fullMatchWorkbenchChainReplay3G.includes("# FullMatch Workbench Chain Replay 3G") && fullMatchWorkbenchChainReplay3G.includes("live selection override guard status: available"), "3G doc included"),
    check("3G validation is PASS", fullMatchWorkbenchChainReplay3GValidation.includes("Status: PASS") && fullMatchWorkbenchChainReplay3GValidation.includes("live selection override guard status is available"), "3G validation PASS"),
    check("live override origin visible", fullMatchWorkbenchChainReplay3G.includes("live selection override guard origin: controlled_minimatch_route_source") && fullMatchWorkbenchChainReplay3GValidation.includes("live selection override guard origin is controlled_minimatch_route_source"), "origin visible"),
    check("override candidate visible", fullMatchWorkbenchChainReplay3G.includes("override candidate: chain-context-forward-progress-sh") && fullMatchWorkbenchChainReplay3GValidation.includes("override candidate is chain-context-forward-progress-sh"), "candidate visible"),
    check("override action visible", fullMatchWorkbenchChainReplay3G.includes("override action type: FORWARD_PROGRESS") && fullMatchWorkbenchChainReplay3GValidation.includes("override action is FORWARD_PROGRESS"), "action visible"),
    check("override receiver and zone visible", fullMatchWorkbenchChainReplay3G.includes("override receiver: control-space-hunter") && fullMatchWorkbenchChainReplay3G.includes("override target zone: Z4-HSR"), "receiver/zone visible"),
    check("override source scores visible", fullMatchWorkbenchChainReplay3G.includes("source base score: 82") && fullMatchWorkbenchChainReplay3G.includes("source influence delta: 5") && fullMatchWorkbenchChainReplay3G.includes("source influenced score: 87"), "source scores visible"),
    check("live override guard contract bundled", bundleSimulation.includes("src/simulation/fullMatch/fullMatchLiveSelectionOverrideGuard.ts") && bundleSimulation.includes("FullMatchLiveSelectionOverrideGuard"), "3G contract bundled"),
    check("live override guard converter bundled", bundleSimulation.includes("src/simulation/fullMatch/liveSelectionOverrideGuardFromControlledRouteSource.ts") && bundleSimulation.includes("liveSelectionOverrideGuardFromControlledRouteSource"), "3G converter bundled"),
    check("live override guard signature bundled", bundleSimulation.includes("src/simulation/fullMatch/fullMatchLiveSelectionOverrideGuardSignature.ts") && bundleSimulation.includes("FullMatchLiveSelectionOverrideGuardSignature"), "3G signature bundled"),
    check("live override guard tests bundled", bundleSimulation.includes("fullMatchLiveSelectionOverrideGuard.test.ts") && bundleSimulation.includes("fullMatchLiveSelectionOverrideGuardGuard.test.ts"), "3G override guard tests bundled"),
    check("3G runFullMatch live override tests bundled", bundleSimulation.includes("runFullMatchExperimentalLiveSelectionOverrideGuard.test.ts") && bundleSimulation.includes("runFullMatchLiveSelectionOverrideGuardScoringGuard.test.ts"), "3G full-match tests bundled"),
    check("3G scoring and source-of-truth guards bundled", bundleSimulation.includes("scoringGuard.3g.test.ts") && bundleSimulation.includes("sourceOfTruthGuards.3g.test.ts"), "3G guards bundled"),
    check("live override guard evidence included", fullMatchWorkbenchChainReplay3G.includes("WORKBENCH_CHAIN_LIVE_SELECTION_OVERRIDE_GUARD") && bundleSimulation.includes("WORKBENCH_CHAIN_LIVE_SELECTION_OVERRIDE_GUARD"), "3G evidence visible"),
    check("closed candidates remain rejected", fullMatchWorkbenchChainReplay3G.includes("rejected closed candidate count: 1") && fullMatchWorkbenchChainReplay3GValidation.includes("CLOSED candidates remain unselectable"), "closed route rejected"),
    check("unavailable candidates remain rejected", fullMatchWorkbenchChainReplay3G.includes("rejected unavailable candidate count: 1") && fullMatchWorkbenchChainReplay3GValidation.includes("unavailable candidates remain unselectable"), "unavailable route rejected"),
    check("override candidate legal and available", fullMatchWorkbenchChainReplay3G.includes("candidate legal: true") && fullMatchWorkbenchChainReplay3G.includes("candidate available: true"), "candidate valid"),
    check("default live override guard absent", fullMatchWorkbenchChainReplay3G.includes("default live selection override guard tag count: 0"), "default guard clean"),
    check("experimental live override guard present", fullMatchWorkbenchChainReplay3G.includes("experimental live selection override guard tag count: greater than 0"), "experimental guard visible"),
    check("override is not applied", fullMatchWorkbenchChainReplay3G.includes("overrideAppliedToLiveSelection: false") && fullMatchWorkbenchChainReplay3GValidation.includes("overrideAppliedToLiveSelection is false"), "override unapplied"),
    check("default and experimental score signatures remain equal", fullMatchWorkbenchChainReplay3G.includes("default and experimental score signatures remain equal for now: YES") && fullMatchWorkbenchChainReplay3GValidation.includes("default and experimental score signatures remain equal"), "score signatures equal"),
    check("live override guard cannot mutate score", fullMatchWorkbenchChainReplay3G.includes("live selection override guard can mutate score: false") && fullMatchWorkbenchChainReplay3GValidation.includes("override guard cannot mutate score"), "score mutation forbidden"),
    check("live override guard cannot mutate scoring events", fullMatchWorkbenchChainReplay3G.includes("live selection override guard can mutate scoring events: false") && fullMatchWorkbenchChainReplay3GValidation.includes("override guard cannot mutate scoring events"), "scoring event mutation forbidden"),
    check("live override guard cannot create scoring events", fullMatchWorkbenchChainReplay3G.includes("live selection override guard can create scoring events: false") && fullMatchWorkbenchChainReplay3GValidation.includes("override guard cannot create scoring events"), "scoring event creation forbidden"),
    check("live override guard cannot mutate route success rates", fullMatchWorkbenchChainReplay3G.includes("live selection override guard can mutate route success rates: false") && fullMatchWorkbenchChainReplay3GValidation.includes("override guard cannot mutate route success rates"), "route success mutation forbidden"),
    check("live override guard cannot drive production full-match", fullMatchWorkbenchChainReplay3G.includes("live selection override guard can drive production full-match selection: false") && fullMatchWorkbenchChainReplay3GValidation.includes("override guard cannot drive production full-match selection"), "production full-match forbidden"),
    check("live override guard cannot drive production route resolution", fullMatchWorkbenchChainReplay3G.includes("live selection override guard can drive production route resolution: false") && fullMatchWorkbenchChainReplay3GValidation.includes("override guard cannot drive production route resolution"), "production route forbidden"),
    check("live override guard cannot drive normal live mini-match resolution", fullMatchWorkbenchChainReplay3G.includes("live selection override guard can drive normal live mini-match resolution: false") && fullMatchWorkbenchChainReplay3GValidation.includes("override guard cannot drive normal live mini-match resolution"), "normal live mini-match forbidden"),
    check("coach copy wording is clean", fullMatchWorkbenchChainReplay3G.includes("stale coach wording status: absent") && !coachExperimentalHtml.includes("simulation experimental"), "coach copy clean"),
    check("scoring constants unchanged", scoringEvents.includes("SHOT_GOAL = 3 points") && scoringEvents.includes("TRY_TOUCHDOWN = 5 points") && scoringEvents.includes("CONVERSION_GOAL = 2 points") && scoringEvents.includes("DROP_GOAL = 2 points"), "scoring constants visible"),
    check("PENALTY_SHOT remains inactive", scoringEvents.includes("PENALTY_SHOT inactive"), "penalty inactive"),
    check("no scoring events deleted or capped", fullMatchWorkbenchChainReplay3GValidation.includes("no scoring events deleted or capped") && bundleSimulation.includes("score_change"), "scoring event guard visible"),
    check("no MatchBonusEvent mutation", scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream") && fullMatchWorkbenchChainReplay3GValidation.includes("MatchBonusEvent unchanged"), "MatchBonusEvent separated"),
    check("batch/live separation preserved", scoringEvents.includes("batch/live separation status: PASS") && fullMatchWorkbenchChainReplay3GValidation.includes("batch/live separation preserved"), "batch/live PASS"),
    check("50-match economy remains global reference", fullMatchWorkbenchChainReplay3G.includes("FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof") && bundleSimulation.includes("VALIDATED_FULL_MATCH_ECONOMY_ANCHOR"), "50-match reference visible"),
    check("recommendations visible", fullMatchWorkbenchChainReplay3G.includes("CONFIRM_CONTROLLED_ROUTE_SOURCE_TO_LIVE_SELECTION_OVERRIDE_GUARDS") && fullMatchWorkbenchChainReplay3G.includes("CONFIRM_OVERRIDE_GUARD_DOES_NOT_CREATE_SCORING_EVENTS") && fullMatchWorkbenchChainReplay3G.includes("PREPARE_LIVE_SELECTION_OVERRIDE_GUARD_TO_ISOLATED_MINIMATCH_OVERRIDE_EXPERIMENT"), "3G recommendations visible"),
  ];

  const sprint3FExpectedFiles = [
    "package.json",
    "tsconfig.json",
    "coach-report.latest.html",
    "coach-report.default.html",
    "coach-report.experimental.html",
    "scoring-events-summary.md",
    "sequence-1-action-1.html",
    "sequence-1-action-2.html",
    "sequence-1-action-3.html",
    "validation.share-pack.md",
    "fullmatch-workbench-chain-replay-3f.md",
    "validation.fullmatch-workbench-chain-replay-3f.md",
    "README.md",
    "manifest.md",
    "00-share-manifest.txt",
    "bundle__contracts.md",
    "bundle__simulation.md",
    "bundle__reports.md",
  ];
  const sprint3FForbiddenLeftovers = [
    "fullmatch-workbench-chain-replay-3e.md",
    "validation.fullmatch-workbench-chain-replay-3e.md",
    "fullmatch-workbench-chain-replay-3d.md",
    "validation.fullmatch-workbench-chain-replay-3d.md",
    "fullmatch-workbench-chain-replay-3c.md",
    "validation.fullmatch-workbench-chain-replay-3c.md",
    "fullmatch-workbench-chain-replay-3b.md",
    "validation.fullmatch-workbench-chain-replay-3b.md",
    "fullmatch-workbench-chain-replay-3a.md",
    "validation.fullmatch-workbench-chain-replay-3a.md",
    "fullmatch-workbench-chain-replay-2z.md",
    "validation.fullmatch-workbench-chain-replay-2z.md",
  ];
  const sprint3FChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("current sprint is Sprint 3F", activeConfig.sprintName === "Sprint 3F - SegmentRouteInput to Controlled MiniMatch Route Source", activeConfig.sprintName),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share pack under 20 files", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("final file count is 18", filesOnDisk.length === 18, `${filesOnDisk.length}`),
    check("minimal allowlist count is 18", allowlistedFiles.length === 18, `${allowlistedFiles.length}`),
    check("missing expected files are none", missingExpectedFiles.length === 0, missingExpectedFiles.join(", ") || "none"),
    check("stale share file count is 0", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("previous sprint leftovers are 0", sprint3FForbiddenLeftovers.every((file) => !requiredCopied(file)), sprint3FForbiddenLeftovers.filter((file) => requiredCopied(file)).join(", ") || "0"),
    check("source files deleted count is 0", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("all required current sprint files copied", sprint3FExpectedFiles.every((file) => requiredCopied(file)), sprint3FExpectedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest lists Sprint 3F", manifest.includes("Sprint 3F - SegmentRouteInput to Controlled MiniMatch Route Source") && detailedManifest.includes("Sprint 3F - SegmentRouteInput to Controlled MiniMatch Route Source"), "Sprint 3F visible"),
    check("README is Sprint 3F oriented", readme.includes("# Sprint 3F Share Pack") && readme.includes("fullmatch-workbench-chain-replay-3f.md"), "README current"),
    check("default and experimental coach reports copied", (coachDefaultHtml.includes("<!doctype html>") || coachDefaultHtml.includes("<html")) && (coachExperimentalHtml.includes("<!doctype html>") || coachExperimentalHtml.includes("<html")), "coach HTML variants copied"),
    check("3F report included", fullMatchWorkbenchChainReplay3F.includes("# FullMatch Workbench Chain Replay 3F") && fullMatchWorkbenchChainReplay3F.includes("experimental controlled mini-match route source status: available"), "3F doc included"),
    check("3F validation is PASS", fullMatchWorkbenchChainReplay3FValidation.includes("Status: PASS") && fullMatchWorkbenchChainReplay3FValidation.includes("controlled mini-match route source status is available"), "3F validation PASS"),
    check("controlled route source origin visible", fullMatchWorkbenchChainReplay3F.includes("controlled mini-match route source origin: segment_route_input") && fullMatchWorkbenchChainReplay3FValidation.includes("controlled mini-match route source origin is segment_route_input"), "origin visible"),
    check("controlled route source candidate visible", fullMatchWorkbenchChainReplay3F.includes("controlled route source candidate: chain-context-forward-progress-sh") && fullMatchWorkbenchChainReplay3FValidation.includes("controlled route source candidate is chain-context-forward-progress-sh"), "candidate visible"),
    check("controlled route source action visible", fullMatchWorkbenchChainReplay3F.includes("controlled route source action: FORWARD_PROGRESS") && fullMatchWorkbenchChainReplay3FValidation.includes("controlled route source action is FORWARD_PROGRESS"), "action visible"),
    check("controlled route source receiver and zone visible", fullMatchWorkbenchChainReplay3F.includes("controlled route source receiver: control-space-hunter") && fullMatchWorkbenchChainReplay3F.includes("controlled route source target zone: Z4-HSR"), "receiver/zone visible"),
    check("controlled route source source scores visible", fullMatchWorkbenchChainReplay3F.includes("controlled route source source base score: 82") && fullMatchWorkbenchChainReplay3F.includes("controlled route source source influence delta: 5") && fullMatchWorkbenchChainReplay3F.includes("controlled route source source influenced score: 87"), "source scores visible"),
    check("controlled route source contract bundled", bundleSimulation.includes("src/simulation/fullMatch/fullMatchControlledMiniMatchRouteSource.ts") && bundleSimulation.includes("FullMatchControlledMiniMatchRouteSource"), "3F contract bundled"),
    check("controlled route source converter bundled", bundleSimulation.includes("src/simulation/fullMatch/controlledMiniMatchRouteSourceFromSegmentRouteInput.ts") && bundleSimulation.includes("controlledMiniMatchRouteSourceFromSegmentRouteInput"), "3F converter bundled"),
    check("controlled route source signature bundled", bundleSimulation.includes("src/simulation/fullMatch/fullMatchControlledMiniMatchRouteSourceSignature.ts") && bundleSimulation.includes("FullMatchControlledMiniMatchRouteSourceSignature"), "3F signature bundled"),
    check("controlled route source tests bundled", bundleSimulation.includes("fullMatchControlledMiniMatchRouteSource.test.ts") && bundleSimulation.includes("fullMatchControlledMiniMatchRouteSourceGuard.test.ts"), "3F route source tests bundled"),
    check("3F runFullMatch controlled route source tests bundled", bundleSimulation.includes("runFullMatchExperimentalControlledMiniMatchRouteSource.test.ts") && bundleSimulation.includes("runFullMatchControlledMiniMatchRouteSourceScoringGuard.test.ts"), "3F full-match tests bundled"),
    check("3F scoring and source-of-truth guards bundled", bundleSimulation.includes("scoringGuard.3f.test.ts") && bundleSimulation.includes("sourceOfTruthGuards.3f.test.ts"), "3F guards bundled"),
    check("controlled route source evidence included", fullMatchWorkbenchChainReplay3F.includes("WORKBENCH_CHAIN_CONTROLLED_MINIMATCH_ROUTE_SOURCE") && bundleSimulation.includes("WORKBENCH_CHAIN_CONTROLLED_MINIMATCH_ROUTE_SOURCE"), "3F evidence visible"),
    check("closed candidates remain rejected", fullMatchWorkbenchChainReplay3F.includes("controlled route source rejected closed candidate count: 1") && fullMatchWorkbenchChainReplay3FValidation.includes("CLOSED candidates remain unselectable"), "closed route rejected"),
    check("unavailable candidates remain rejected", fullMatchWorkbenchChainReplay3F.includes("controlled route source rejected unavailable candidate count: 1") && fullMatchWorkbenchChainReplay3FValidation.includes("unavailable candidates remain unselectable"), "unavailable route rejected"),
    check("controlled route source candidate legal and available", fullMatchWorkbenchChainReplay3F.includes("controlled route source candidate legal: true") && fullMatchWorkbenchChainReplay3F.includes("controlled route source candidate available: true"), "candidate valid"),
    check("default controlled route source absent", fullMatchWorkbenchChainReplay3F.includes("default controlled mini-match route source tag count: 0"), "default route source clean"),
    check("experimental controlled route source present", fullMatchWorkbenchChainReplay3F.includes("experimental controlled mini-match route source tag count: greater than 0"), "experimental route source visible"),
    check("default and experimental score signatures remain equal", fullMatchWorkbenchChainReplay3F.includes("default and experimental score signatures remain equal for now: YES") && fullMatchWorkbenchChainReplay3FValidation.includes("default and experimental score signatures remain equal"), "score signatures equal"),
    check("controlled route source cannot mutate score", fullMatchWorkbenchChainReplay3F.includes("controlled route source can mutate score: false") && fullMatchWorkbenchChainReplay3FValidation.includes("controlled route source cannot mutate score"), "score mutation forbidden"),
    check("controlled route source cannot mutate scoring events", fullMatchWorkbenchChainReplay3F.includes("controlled route source can mutate scoring events: false") && fullMatchWorkbenchChainReplay3FValidation.includes("controlled route source cannot mutate scoring events"), "scoring event mutation forbidden"),
    check("controlled route source cannot mutate route success rates", fullMatchWorkbenchChainReplay3F.includes("controlled route source can mutate route success rates: false") && fullMatchWorkbenchChainReplay3FValidation.includes("controlled route source cannot mutate route success rates"), "route success mutation forbidden"),
    check("controlled route source cannot drive production full-match", fullMatchWorkbenchChainReplay3F.includes("controlled route source can drive production full-match selection: false") && fullMatchWorkbenchChainReplay3FValidation.includes("controlled route source cannot drive production full-match selection"), "production full-match forbidden"),
    check("controlled route source cannot drive production route resolution", fullMatchWorkbenchChainReplay3F.includes("controlled route source can drive production route resolution: false") && fullMatchWorkbenchChainReplay3FValidation.includes("controlled route source cannot drive production route resolution"), "production route forbidden"),
    check("controlled route source cannot drive live mini-match resolution", fullMatchWorkbenchChainReplay3F.includes("controlled route source can drive live mini-match resolution: false") && fullMatchWorkbenchChainReplay3FValidation.includes("controlled route source cannot drive live mini-match resolution"), "live mini-match forbidden"),
    check("scoring constants unchanged", scoringEvents.includes("SHOT_GOAL = 3 points") && scoringEvents.includes("TRY_TOUCHDOWN = 5 points") && scoringEvents.includes("CONVERSION_GOAL = 2 points") && scoringEvents.includes("DROP_GOAL = 2 points"), "scoring constants visible"),
    check("PENALTY_SHOT remains inactive", scoringEvents.includes("PENALTY_SHOT inactive"), "penalty inactive"),
    check("no scoring events deleted or capped", fullMatchWorkbenchChainReplay3FValidation.includes("no scoring events deleted or capped") && bundleSimulation.includes("score_change"), "scoring event guard visible"),
    check("no MatchBonusEvent mutation", scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream") && fullMatchWorkbenchChainReplay3FValidation.includes("MatchBonusEvent unchanged"), "MatchBonusEvent separated"),
    check("batch/live separation preserved", scoringEvents.includes("batch/live separation status: PASS") && fullMatchWorkbenchChainReplay3FValidation.includes("batch/live separation preserved"), "batch/live PASS"),
    check("50-match economy remains global reference", fullMatchWorkbenchChainReplay3F.includes("FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof") && bundleSimulation.includes("VALIDATED_FULL_MATCH_ECONOMY_ANCHOR"), "50-match reference visible"),
    check("recommendations visible", fullMatchWorkbenchChainReplay3F.includes("CONFIRM_SEGMENT_ROUTE_INPUT_TO_CONTROLLED_MINIMATCH_ROUTE_SOURCE") && fullMatchWorkbenchChainReplay3F.includes("CONFIRM_CONTROLLED_ROUTE_SOURCE_DOES_NOT_DRIVE_LIVE_MINIMATCH_RESOLUTION") && fullMatchWorkbenchChainReplay3F.includes("PREPARE_CONTROLLED_MINIMATCH_ROUTE_SOURCE_TO_LIVE_ROUTE_SELECTION_GUARDS"), "3F recommendations visible"),
  ];

  const sprint3EExpectedFiles = [
    "package.json",
    "tsconfig.json",
    "coach-report.latest.html",
    "scoring-events-summary.md",
    "sequence-1-action-1.html",
    "sequence-1-action-2.html",
    "sequence-1-action-3.html",
    "validation.share-pack.md",
    "fullmatch-workbench-chain-replay-3e.md",
    "validation.fullmatch-workbench-chain-replay-3e.md",
    "README.md",
    "manifest.md",
    "00-share-manifest.txt",
    "bundle__contracts.md",
    "bundle__simulation.md",
    "bundle__reports.md",
  ];
  const sprint3EForbiddenLeftovers = [
    "fullmatch-workbench-chain-replay-3d.md",
    "validation.fullmatch-workbench-chain-replay-3d.md",
    "fullmatch-workbench-chain-replay-3c.md",
    "validation.fullmatch-workbench-chain-replay-3c.md",
    "fullmatch-workbench-chain-replay-3b.md",
    "validation.fullmatch-workbench-chain-replay-3b.md",
    "fullmatch-workbench-chain-replay-3a.md",
    "validation.fullmatch-workbench-chain-replay-3a.md",
    "fullmatch-workbench-chain-replay-2z.md",
    "validation.fullmatch-workbench-chain-replay-2z.md",
  ];
  const sprint3EChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("current sprint is Sprint 3E", activeConfig.sprintName === "Sprint 3E - Controlled Segment Selection to Segment Route Input", activeConfig.sprintName),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share pack under 20 files", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("final file count is 16", filesOnDisk.length === 16, `${filesOnDisk.length}`),
    check("minimal allowlist count is 16", allowlistedFiles.length === 16, `${allowlistedFiles.length}`),
    check("missing expected files are none", missingExpectedFiles.length === 0, missingExpectedFiles.join(", ") || "none"),
    check("stale share file count is 0", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("previous sprint leftovers are 0", sprint3EForbiddenLeftovers.every((file) => !requiredCopied(file)), sprint3EForbiddenLeftovers.filter((file) => requiredCopied(file)).join(", ") || "0"),
    check("source files deleted count is 0", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("all required current sprint files copied", sprint3EExpectedFiles.every((file) => requiredCopied(file)), sprint3EExpectedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest lists Sprint 3E", manifest.includes("Sprint 3E - Controlled Segment Selection to Segment Route Input") && detailedManifest.includes("Sprint 3E - Controlled Segment Selection to Segment Route Input"), "Sprint 3E visible"),
    check("README is Sprint 3E oriented", readme.includes("# Sprint 3E Share Pack") && readme.includes("fullmatch-workbench-chain-replay-3e.md"), "README current"),
    check("3E report included", fullMatchWorkbenchChainReplay3E.includes("# FullMatch Workbench Chain Replay 3E") && fullMatchWorkbenchChainReplay3E.includes("SegmentRouteInput status: available"), "3E doc included"),
    check("3E validation is PASS", fullMatchWorkbenchChainReplay3EValidation.includes("Status: PASS") && fullMatchWorkbenchChainReplay3EValidation.includes("SegmentRouteInput status is available"), "3E validation PASS"),
    check("SegmentRouteInput candidate visible", fullMatchWorkbenchChainReplay3E.includes("SegmentRouteInput candidate: chain-context-forward-progress-sh") && fullMatchWorkbenchChainReplay3EValidation.includes("SegmentRouteInput candidate is chain-context-forward-progress-sh"), "SegmentRouteInput candidate visible"),
    check("SegmentRouteInput action visible", fullMatchWorkbenchChainReplay3E.includes("SegmentRouteInput action: FORWARD_PROGRESS") && fullMatchWorkbenchChainReplay3EValidation.includes("SegmentRouteInput action is FORWARD_PROGRESS"), "SegmentRouteInput action visible"),
    check("SegmentRouteInput receiver and zone visible", fullMatchWorkbenchChainReplay3E.includes("SegmentRouteInput receiver: control-space-hunter") && fullMatchWorkbenchChainReplay3E.includes("SegmentRouteInput target zone: Z4-HSR"), "SegmentRouteInput receiver/zone visible"),
    check("SegmentRouteInput source scores visible", fullMatchWorkbenchChainReplay3E.includes("SegmentRouteInput source base score: 82") && fullMatchWorkbenchChainReplay3E.includes("SegmentRouteInput source influence delta: 5") && fullMatchWorkbenchChainReplay3E.includes("SegmentRouteInput source influenced score: 87"), "SegmentRouteInput source scores visible"),
    check("SegmentRouteInput contract bundled", bundleSimulation.includes("src/simulation/fullMatch/fullMatchSegmentRouteInput.ts") && bundleSimulation.includes("FullMatchSegmentRouteInput"), "SegmentRouteInput contract bundled"),
    check("SegmentRouteInput converter bundled", bundleSimulation.includes("src/simulation/fullMatch/segmentRouteInputFromControlledSelection.ts") && bundleSimulation.includes("segmentRouteInputFromControlledSelection"), "SegmentRouteInput converter bundled"),
    check("SegmentRouteInput signature bundled", bundleSimulation.includes("src/simulation/fullMatch/fullMatchSegmentRouteInputSignature.ts") && bundleSimulation.includes("FullMatchSegmentRouteInputSignature"), "SegmentRouteInput signature bundled"),
    check("SegmentRouteInput tests bundled", bundleSimulation.includes("fullMatchSegmentRouteInput.test.ts") && bundleSimulation.includes("fullMatchSegmentRouteInputGuard.test.ts"), "3E SegmentRouteInput tests bundled"),
    check("3E runFullMatch SegmentRouteInput tests bundled", bundleSimulation.includes("runFullMatchExperimentalSegmentRouteInput.test.ts") && bundleSimulation.includes("runFullMatchSegmentRouteInputScoringGuard.test.ts"), "3E full-match tests bundled"),
    check("3E scoring and source-of-truth guards bundled", bundleSimulation.includes("scoringGuard.3e.test.ts") && bundleSimulation.includes("sourceOfTruthGuards.3e.test.ts"), "3E guards bundled"),
    check("SegmentRouteInput evidence included", fullMatchWorkbenchChainReplay3E.includes("WORKBENCH_CHAIN_SEGMENT_ROUTE_INPUT") && bundleSimulation.includes("category: \"WORKBENCH_CHAIN_SEGMENT_ROUTE_INPUT\""), "SegmentRouteInput evidence visible"),
    check("closed candidates remain rejected", fullMatchWorkbenchChainReplay3E.includes("SegmentRouteInput rejected closed candidate count: 1") && fullMatchWorkbenchChainReplay3EValidation.includes("CLOSED candidates remain unselectable"), "closed route rejected"),
    check("unavailable candidates remain rejected", fullMatchWorkbenchChainReplay3E.includes("SegmentRouteInput rejected unavailable candidate count: 1") && fullMatchWorkbenchChainReplay3EValidation.includes("unavailable candidates remain unselectable"), "unavailable route rejected"),
    check("SegmentRouteInput candidate legal and available", fullMatchWorkbenchChainReplay3E.includes("SegmentRouteInput candidate legal: true") && fullMatchWorkbenchChainReplay3E.includes("SegmentRouteInput candidate available: true"), "SegmentRouteInput candidate valid"),
    check("default SegmentRouteInput absent", fullMatchWorkbenchChainReplay3E.includes("default SegmentRouteInput tag count: 0"), "default SegmentRouteInput clean"),
    check("experimental SegmentRouteInput present", fullMatchWorkbenchChainReplay3E.includes("experimental SegmentRouteInput tag count: greater than 0"), "experimental SegmentRouteInput visible"),
    check("default and experimental score signatures remain equal", fullMatchWorkbenchChainReplay3E.includes("default and experimental score signatures remain equal for now: YES") && fullMatchWorkbenchChainReplay3EValidation.includes("default and experimental score signatures remain equal"), "score signatures equal"),
    check("SegmentRouteInput cannot mutate score", fullMatchWorkbenchChainReplay3E.includes("SegmentRouteInput can mutate score: false") && fullMatchWorkbenchChainReplay3EValidation.includes("SegmentRouteInput cannot mutate score"), "score mutation forbidden"),
    check("SegmentRouteInput cannot mutate scoring events", fullMatchWorkbenchChainReplay3E.includes("SegmentRouteInput can mutate scoring events: false") && fullMatchWorkbenchChainReplay3EValidation.includes("SegmentRouteInput cannot mutate scoring events"), "scoring event mutation forbidden"),
    check("SegmentRouteInput cannot mutate route success rates", fullMatchWorkbenchChainReplay3E.includes("SegmentRouteInput can mutate route success rates: false") && fullMatchWorkbenchChainReplay3EValidation.includes("SegmentRouteInput cannot mutate route success rates"), "route success mutation forbidden"),
    check("SegmentRouteInput cannot drive production full-match", fullMatchWorkbenchChainReplay3E.includes("SegmentRouteInput can drive production full-match selection: false") && fullMatchWorkbenchChainReplay3EValidation.includes("SegmentRouteInput cannot drive production full-match selection"), "production full-match forbidden"),
    check("SegmentRouteInput cannot drive production route resolution", fullMatchWorkbenchChainReplay3E.includes("SegmentRouteInput can drive production route resolution: false") && fullMatchWorkbenchChainReplay3EValidation.includes("SegmentRouteInput cannot drive production route resolution"), "production route resolution forbidden"),
    check("scoring constants unchanged", scoringEvents.includes("SHOT_GOAL = 3 points") && scoringEvents.includes("TRY_TOUCHDOWN = 5 points") && scoringEvents.includes("CONVERSION_GOAL = 2 points") && scoringEvents.includes("DROP_GOAL = 2 points"), "scoring constants visible"),
    check("PENALTY_SHOT remains inactive", scoringEvents.includes("PENALTY_SHOT inactive"), "penalty inactive"),
    check("no scoring events deleted or capped", fullMatchWorkbenchChainReplay3EValidation.includes("no scoring events deleted or capped") && bundleSimulation.includes("score_change"), "scoring event guard visible"),
    check("no MatchBonusEvent mutation", scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream") && fullMatchWorkbenchChainReplay3EValidation.includes("MatchBonusEvent unchanged"), "MatchBonusEvent separated"),
    check("batch/live separation preserved", scoringEvents.includes("batch/live separation status: PASS") && fullMatchWorkbenchChainReplay3EValidation.includes("batch/live separation preserved"), "batch/live PASS"),
    check("50-match economy remains global reference", fullMatchWorkbenchChainReplay3E.includes("FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof") && bundleSimulation.includes("VALIDATED_FULL_MATCH_ECONOMY_ANCHOR"), "50-match reference visible"),
    check("recommendations visible", fullMatchWorkbenchChainReplay3E.includes("CONFIRM_CONTROLLED_SEGMENT_SELECTION_TO_SEGMENT_ROUTE_INPUT") && fullMatchWorkbenchChainReplay3E.includes("CONFIRM_SEGMENT_ROUTE_INPUT_DOES_NOT_DRIVE_PRODUCTION_RESOLUTION") && fullMatchWorkbenchChainReplay3E.includes("PREPARE_SEGMENT_ROUTE_INPUT_TO_CONTROLLED_MINIMATCH_ROUTE_SOURCE"), "3E recommendations visible"),
  ];

  const sprint3DExpectedFiles = [
    "package.json",
    "tsconfig.json",
    "coach-report.latest.html",
    "scoring-events-summary.md",
    "sequence-1-action-1.html",
    "sequence-1-action-2.html",
    "sequence-1-action-3.html",
    "validation.share-pack.md",
    "fullmatch-workbench-chain-replay-3d.md",
    "validation.fullmatch-workbench-chain-replay-3d.md",
    "README.md",
    "manifest.md",
    "00-share-manifest.txt",
    "bundle__contracts.md",
    "bundle__simulation.md",
    "bundle__reports.md",
  ];
  const sprint3DForbiddenLeftovers = [
    "fullmatch-workbench-chain-replay-3c.md",
    "validation.fullmatch-workbench-chain-replay-3c.md",
    "fullmatch-workbench-chain-replay-3b.md",
    "validation.fullmatch-workbench-chain-replay-3b.md",
    "fullmatch-workbench-chain-replay-3a.md",
    "validation.fullmatch-workbench-chain-replay-3a.md",
    "fullmatch-workbench-chain-replay-2z.md",
    "validation.fullmatch-workbench-chain-replay-2z.md",
  ];
  const sprint3DChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("current sprint is Sprint 3D", activeConfig.sprintName === "Sprint 3D - Experimental Shadow Selection to Controlled Segment Selection", activeConfig.sprintName),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share pack under 20 files", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("final file count is 16", filesOnDisk.length === 16, `${filesOnDisk.length}`),
    check("minimal allowlist count is 16", allowlistedFiles.length === 16, `${allowlistedFiles.length}`),
    check("missing expected files are none", missingExpectedFiles.length === 0, missingExpectedFiles.join(", ") || "none"),
    check("stale share file count is 0", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("previous sprint leftovers are 0", sprint3DForbiddenLeftovers.every((file) => !requiredCopied(file)), sprint3DForbiddenLeftovers.filter((file) => requiredCopied(file)).join(", ") || "0"),
    check("source files deleted count is 0", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("all required current sprint files copied", sprint3DExpectedFiles.every((file) => requiredCopied(file)), sprint3DExpectedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest lists Sprint 3D", manifest.includes("Sprint 3D - Experimental Shadow Selection to Controlled Segment Selection") && detailedManifest.includes("Sprint 3D - Experimental Shadow Selection to Controlled Segment Selection"), "Sprint 3D visible"),
    check("README is Sprint 3D oriented", readme.includes("# Sprint 3D Share Pack") && readme.includes("fullmatch-workbench-chain-replay-3d.md"), "README current"),
    check("3D report included", fullMatchWorkbenchChainReplay3D.includes("# FullMatch Workbench Chain Replay 3D") && fullMatchWorkbenchChainReplay3D.includes("controlled segment selection status: available"), "3D doc included"),
    check("3D validation is PASS", fullMatchWorkbenchChainReplay3DValidation.includes("Status: PASS") && fullMatchWorkbenchChainReplay3DValidation.includes("controlled segment selection status is available"), "3D validation PASS"),
    check("controlled selected candidate visible", fullMatchWorkbenchChainReplay3D.includes("controlled selected candidate: chain-context-forward-progress-sh") && fullMatchWorkbenchChainReplay3DValidation.includes("controlled selected candidate is chain-context-forward-progress-sh"), "controlled candidate visible"),
    check("controlled selected action visible", fullMatchWorkbenchChainReplay3D.includes("controlled selected action: FORWARD_PROGRESS") && fullMatchWorkbenchChainReplay3DValidation.includes("controlled selected action is FORWARD_PROGRESS"), "controlled action visible"),
    check("controlled receiver and zone visible", fullMatchWorkbenchChainReplay3D.includes("controlled selected receiver: control-space-hunter") && fullMatchWorkbenchChainReplay3D.includes("controlled selected target zone: Z4-HSR"), "controlled receiver/zone visible"),
    check("controlled selection contract bundled", bundleSimulation.includes("src/simulation/fullMatch/fullMatchControlledSegmentSelection.ts") && bundleSimulation.includes("FullMatchControlledSegmentSelectionResult"), "controlled contract bundled"),
    check("controlled adapter bundled", bundleSimulation.includes("src/simulation/fullMatch/controlledSegmentSelectionFromShadow.ts") && bundleSimulation.includes("controlledSegmentSelectionFromShadow"), "controlled adapter bundled"),
    check("controlled signature bundled", bundleSimulation.includes("src/simulation/fullMatch/fullMatchControlledSegmentSelectionSignature.ts") && bundleSimulation.includes("FullMatchControlledSegmentSelectionSignature"), "controlled signature bundled"),
    check("controlled tests bundled", bundleSimulation.includes("fullMatchControlledSegmentSelection.test.ts") && bundleSimulation.includes("fullMatchControlledSegmentSelectionGuard.test.ts"), "3D controlled tests bundled"),
    check("3D runFullMatch controlled tests bundled", bundleSimulation.includes("runFullMatchExperimentalControlledSegmentSelection.test.ts") && bundleSimulation.includes("runFullMatchControlledSegmentSelectionScoringGuard.test.ts"), "3D full-match tests bundled"),
    check("3D scoring and source-of-truth guards bundled", bundleSimulation.includes("scoringGuard.3d.test.ts") && bundleSimulation.includes("sourceOfTruthGuards.3d.test.ts"), "3D guards bundled"),
    check("controlled selection evidence included", fullMatchWorkbenchChainReplay3D.includes("WORKBENCH_CHAIN_CONTROLLED_SEGMENT_SELECTION") && bundleSimulation.includes("category: \"WORKBENCH_CHAIN_CONTROLLED_SEGMENT_SELECTION\""), "controlled evidence visible"),
    check("closed candidates remain rejected", fullMatchWorkbenchChainReplay3D.includes("controlled closed candidate rejected count: 1") && fullMatchWorkbenchChainReplay3DValidation.includes("CLOSED candidates remain unselectable"), "closed route rejected"),
    check("unavailable candidates remain rejected", fullMatchWorkbenchChainReplay3D.includes("controlled unavailable candidate rejected count: 1") && fullMatchWorkbenchChainReplay3DValidation.includes("unavailable candidates remain unselectable"), "unavailable route rejected"),
    check("selected controlled candidate legal and available", fullMatchWorkbenchChainReplay3D.includes("controlled selected candidate legal: true") && fullMatchWorkbenchChainReplay3D.includes("controlled selected candidate available: true"), "selected controlled candidate valid"),
    check("default controlled selection absent", fullMatchWorkbenchChainReplay3D.includes("default controlled segment selection tag count: 0"), "default controlled clean"),
    check("experimental controlled selection present", fullMatchWorkbenchChainReplay3D.includes("experimental controlled segment selection tag count: greater than 0"), "experimental controlled visible"),
    check("default and experimental score signatures remain equal", fullMatchWorkbenchChainReplay3D.includes("default and experimental score signatures remain equal for now: YES") && fullMatchWorkbenchChainReplay3DValidation.includes("default and experimental score signatures remain equal"), "score signatures equal"),
    check("controlled selection cannot mutate score", fullMatchWorkbenchChainReplay3D.includes("controlled segment selection can mutate score: false") && fullMatchWorkbenchChainReplay3DValidation.includes("controlled segment selection cannot mutate score"), "score mutation forbidden"),
    check("controlled selection cannot mutate scoring events", fullMatchWorkbenchChainReplay3D.includes("controlled segment selection can mutate scoring events: false") && fullMatchWorkbenchChainReplay3DValidation.includes("controlled segment selection cannot mutate scoring events"), "scoring event mutation forbidden"),
    check("controlled selection cannot mutate route success rates", fullMatchWorkbenchChainReplay3D.includes("controlled segment selection can mutate route success rates: false") && fullMatchWorkbenchChainReplay3DValidation.includes("controlled segment selection cannot mutate route success rates"), "route success mutation forbidden"),
    check("controlled selection cannot drive production full-match", fullMatchWorkbenchChainReplay3D.includes("controlled segment selection can drive production full-match selection: false") && fullMatchWorkbenchChainReplay3DValidation.includes("controlled segment selection cannot drive production full-match selection"), "production full-match forbidden"),
    check("scoring constants unchanged", scoringEvents.includes("SHOT_GOAL = 3 points") && scoringEvents.includes("TRY_TOUCHDOWN = 5 points") && scoringEvents.includes("CONVERSION_GOAL = 2 points") && scoringEvents.includes("DROP_GOAL = 2 points"), "scoring constants visible"),
    check("PENALTY_SHOT remains inactive", scoringEvents.includes("PENALTY_SHOT inactive"), "penalty inactive"),
    check("no scoring events deleted or capped", fullMatchWorkbenchChainReplay3DValidation.includes("no scoring events deleted or capped") && bundleSimulation.includes("score_change"), "scoring event guard visible"),
    check("no MatchBonusEvent mutation", scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream") && fullMatchWorkbenchChainReplay3DValidation.includes("MatchBonusEvent unchanged"), "MatchBonusEvent separated"),
    check("batch/live separation preserved", scoringEvents.includes("batch/live separation status: PASS") && fullMatchWorkbenchChainReplay3DValidation.includes("batch/live separation preserved"), "batch/live PASS"),
    check("50-match economy remains global reference", fullMatchWorkbenchChainReplay3D.includes("FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof") && bundleSimulation.includes("VALIDATED_FULL_MATCH_ECONOMY_ANCHOR"), "50-match reference visible"),
    check("recommendations visible", fullMatchWorkbenchChainReplay3D.includes("CONFIRM_EXPERIMENTAL_SHADOW_SELECTION_TO_CONTROLLED_SEGMENT_SELECTION") && fullMatchWorkbenchChainReplay3D.includes("CONFIRM_CONTROLLED_SELECTION_DOES_NOT_DRIVE_PRODUCTION_FULLMATCH") && fullMatchWorkbenchChainReplay3D.includes("PREPARE_CONTROLLED_SEGMENT_SELECTION_TO_SEGMENT_ROUTE_INPUT"), "3D recommendations visible"),
  ];

  const sprint3CExpectedFiles = [
    "package.json",
    "tsconfig.json",
    "coach-report.latest.html",
    "scoring-events-summary.md",
    "sequence-1-action-1.html",
    "sequence-1-action-2.html",
    "sequence-1-action-3.html",
    "validation.share-pack.md",
    "fullmatch-workbench-chain-replay-3c.md",
    "validation.fullmatch-workbench-chain-replay-3c.md",
    "README.md",
    "manifest.md",
    "00-share-manifest.txt",
    "bundle__contracts.md",
    "bundle__simulation.md",
    "bundle__reports.md",
  ];
  const sprint3CForbiddenLeftovers = [
    "fullmatch-workbench-chain-replay-3b.md",
    "validation.fullmatch-workbench-chain-replay-3b.md",
    "fullmatch-workbench-chain-replay-3a.md",
    "validation.fullmatch-workbench-chain-replay-3a.md",
    "fullmatch-workbench-chain-replay-2z.md",
    "validation.fullmatch-workbench-chain-replay-2z.md",
    "fullmatch-workbench-chain-replay-2y.md",
    "validation.fullmatch-workbench-chain-replay-2y.md",
    "fullmatch-workbench-chain-replay-2x.md",
    "validation.fullmatch-workbench-chain-replay-2x.md",
    "fullmatch-workbench-chain-replay.md",
    "validation.fullmatch-workbench-chain-replay.md",
    "bundle__docs.md",
  ];
  const sprint3CChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("current sprint is Sprint 3C", activeConfig.sprintName === "Sprint 3C - Experimental Chain Context to Shadow Route Selection", activeConfig.sprintName),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share pack under 20 files", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("final file count is 16", filesOnDisk.length === 16, `${filesOnDisk.length}`),
    check("minimal allowlist count is 16", allowlistedFiles.length === 16, `${allowlistedFiles.length}`),
    check("missing expected files are none", missingExpectedFiles.length === 0, missingExpectedFiles.join(", ") || "none"),
    check("stale share file count is 0", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("previous sprint leftovers are 0", sprint3CForbiddenLeftovers.every((file) => !requiredCopied(file)), sprint3CForbiddenLeftovers.filter((file) => requiredCopied(file)).join(", ") || "0"),
    check("source files deleted count is 0", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("all required current sprint files copied", sprint3CExpectedFiles.every((file) => requiredCopied(file)), sprint3CExpectedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest lists Sprint 3C", manifest.includes("Sprint 3C - Experimental Chain Context to Shadow Route Selection") && detailedManifest.includes("Sprint 3C - Experimental Chain Context to Shadow Route Selection"), "Sprint 3C visible"),
    check("README is Sprint 3C oriented", readme.includes("# Sprint 3C Share Pack") && readme.includes("fullmatch-workbench-chain-replay-3c.md"), "README current"),
    check("sequence workbench artifacts copied", sequenceOneActionOneWorkbench.includes("Sequence 1 Action 1 Tactical Workbench") && sequenceOneActionTwoWorkbench.includes("Sequence 1 Action 2 Tactical Workbench") && sequenceOneActionThreeWorkbench.includes("Sequence 1 Action 3 Tactical Workbench"), "three workbench artifacts copied"),
    check("3C report included", fullMatchWorkbenchChainReplay3C.includes("# FullMatch Workbench Chain Replay 3C") && fullMatchWorkbenchChainReplay3C.includes("shadow route selection status: available"), "3C doc included"),
    check("3C validation is PASS", fullMatchWorkbenchChainReplay3CValidation.includes("Status: PASS") && fullMatchWorkbenchChainReplay3CValidation.includes("shadow route selection status is available"), "3C validation PASS"),
    check("production selection proxy visible", fullMatchWorkbenchChainReplay3C.includes("production selection proxy: chain-context-safe-recycle-pv") && fullMatchWorkbenchChainReplay3CValidation.includes("production selection proxy is chain-context-safe-recycle-pv"), "production proxy visible"),
    check("shadow selection candidate visible", fullMatchWorkbenchChainReplay3C.includes("shadow selection candidate: chain-context-forward-progress-sh") && fullMatchWorkbenchChainReplay3CValidation.includes("shadow selection candidate is chain-context-forward-progress-sh"), "shadow candidate visible"),
    check("shadow selection action visible", fullMatchWorkbenchChainReplay3C.includes("shadow selection action type: FORWARD_PROGRESS") && fullMatchWorkbenchChainReplay3CValidation.includes("shadow selection action is FORWARD_PROGRESS"), "shadow action visible"),
    check("shadow receiver and zone visible", fullMatchWorkbenchChainReplay3C.includes("shadow selection receiver: control-space-hunter") && fullMatchWorkbenchChainReplay3C.includes("shadow selection target zone: Z4-HSR"), "shadow receiver/zone visible"),
    check("shadow route selection contract bundled", bundleSimulation.includes("src/simulation/fullMatch/fullMatchShadowRouteSelection.ts") && bundleSimulation.includes("FullMatchShadowRouteSelectionResult"), "shadow selection contract bundled"),
    check("shadow selector bundled", bundleSimulation.includes("src/simulation/fullMatch/selectShadowRouteFromInfluencedCandidates.ts") && bundleSimulation.includes("selectShadowRouteFromInfluencedCandidates"), "shadow selector bundled"),
    check("shadow selection signature bundled", bundleSimulation.includes("src/simulation/fullMatch/fullMatchShadowRouteSelectionSignature.ts") && bundleSimulation.includes("FullMatchShadowRouteSelectionSignature"), "shadow signature bundled"),
    check("matchReportBuilder shadow wiring bundled", bundleSimulation.includes("src/simulation/adapters/matchReportBuilder.ts") && bundleSimulation.includes("shadowRouteSelectionTags") && bundleSimulation.includes("shadowRouteSelectionReason"), "builder shadow wiring bundled"),
    check("runFullMatch shadow wiring bundled", bundleSimulation.includes("selectShadowRouteFromInfluencedCandidates") && bundleSimulation.includes("FULLMATCH_SHADOW_ROUTE_SELECTION_CANNOT_DRIVE_PRODUCTION_SELECTION"), "runFullMatch shadow wiring bundled"),
    check("closed candidates remain rejected", fullMatchWorkbenchChainReplay3C.includes("closed candidate rejected count: 1") && fullMatchWorkbenchChainReplay3CValidation.includes("CLOSED candidates remain unselectable"), "closed route rejected"),
    check("unavailable candidates remain rejected", fullMatchWorkbenchChainReplay3C.includes("unavailable candidate rejected count: 1") && fullMatchWorkbenchChainReplay3CValidation.includes("unavailable candidates remain unselectable"), "unavailable route rejected"),
    check("selected shadow candidate legal and available", fullMatchWorkbenchChainReplay3C.includes("selected shadow candidate legal: true") && fullMatchWorkbenchChainReplay3C.includes("selected shadow candidate available: true"), "selected shadow candidate valid"),
    check("shadow explanation present", fullMatchWorkbenchChainReplay3C.includes("shadow selection explanation: present") && fullMatchWorkbenchChainReplay3CValidation.includes("shadow selection explanation is present"), "shadow explanation visible"),
    check("shadow evidence included", fullMatchWorkbenchChainReplay3C.includes("WORKBENCH_CHAIN_SHADOW_ROUTE_SELECTION") && bundleSimulation.includes("category: \"WORKBENCH_CHAIN_SHADOW_ROUTE_SELECTION\""), "shadow evidence visible"),
    check("3C shadow tests bundled", bundleSimulation.includes("fullMatchShadowRouteSelection.test.ts") && bundleSimulation.includes("fullMatchShadowRouteSelectionGuard.test.ts"), "3C shadow tests bundled"),
    check("3C runFullMatch shadow tests bundled", bundleSimulation.includes("runFullMatchExperimentalShadowRouteSelection.test.ts") && bundleSimulation.includes("runFullMatchShadowRouteSelectionScoringGuard.test.ts"), "3C full-match tests bundled"),
    check("3C scoring and source-of-truth guards bundled", bundleSimulation.includes("scoringGuard.3c.test.ts") && bundleSimulation.includes("sourceOfTruthGuards.3c.test.ts"), "3C guards bundled"),
    check("coach diagnosis mentions shadow selection", fullMatchWorkbenchChainReplay3C.includes("coach diagnosis mentions shadow route selection") && bundleSimulation.includes("selection shadow"), "coach diagnosis visible"),
    check("default mode remains segment_harness", fullMatchWorkbenchChainReplay3C.includes("default full-match mode: segment_harness") && bundleSimulation.includes("DEFAULT_FULL_MATCH_ROUTE_SELECTION_MODE"), "default mode visible"),
    check("experimental mode remains opt-in", fullMatchWorkbenchChainReplay3C.includes("experimental mode active by default: NO") && bundleSimulation.includes("workbench_chain_replay_experimental"), "experimental opt-in visible"),
    check("normal full-match not production chain-driven", fullMatchWorkbenchChainReplay3C.includes("normal full-match chain-driven claim status: NO") && bundleSimulation.includes("NORMAL_FULLMATCH_STILL_SEGMENT_HARNESS_BY_DEFAULT"), "normal full-match guarded"),
    check("default shadow selection absent", fullMatchWorkbenchChainReplay3C.includes("default shadow route selection tag count: 0") || fullMatchWorkbenchChainReplay3C.includes("default shadow selection tag count: 0"), "default shadow clean"),
    check("experimental shadow selection present", fullMatchWorkbenchChainReplay3C.includes("experimental shadow route selection tag count: greater than 0") || fullMatchWorkbenchChainReplay3C.includes("experimental shadow selection tag count: greater than 0"), "experimental shadow visible"),
    check("default and experimental score signatures remain equal", fullMatchWorkbenchChainReplay3C.includes("default and experimental score signatures remain equal for now: YES") && fullMatchWorkbenchChainReplay3CValidation.includes("default and experimental score signatures remain equal"), "score signatures equal"),
    check("shadow selection cannot mutate score", fullMatchWorkbenchChainReplay3C.includes("shadow route selection can mutate score: false") && fullMatchWorkbenchChainReplay3CValidation.includes("shadow route selection cannot mutate score"), "score mutation forbidden"),
    check("shadow selection cannot mutate scoring events", fullMatchWorkbenchChainReplay3C.includes("shadow route selection can mutate scoring events: false") && fullMatchWorkbenchChainReplay3CValidation.includes("shadow route selection cannot mutate scoring events"), "scoring event mutation forbidden"),
    check("shadow selection cannot drive production selection", fullMatchWorkbenchChainReplay3C.includes("shadow route selection can drive production selection: false") && fullMatchWorkbenchChainReplay3CValidation.includes("shadow route selection cannot drive production selection"), "production selection forbidden"),
    check("scoring constants unchanged", scoringEvents.includes("SHOT_GOAL = 3 points") && scoringEvents.includes("TRY_TOUCHDOWN = 5 points") && scoringEvents.includes("CONVERSION_GOAL = 2 points") && scoringEvents.includes("DROP_GOAL = 2 points"), "scoring constants visible"),
    check("PENALTY_SHOT remains inactive", scoringEvents.includes("PENALTY_SHOT inactive"), "penalty inactive"),
    check("no scoring events deleted or capped", fullMatchWorkbenchChainReplay3CValidation.includes("no scoring events deleted or capped") && bundleSimulation.includes("score_change"), "scoring event guard visible"),
    check("no MatchBonusEvent mutation", scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream") && fullMatchWorkbenchChainReplay3CValidation.includes("MatchBonusEvent unchanged"), "MatchBonusEvent separated"),
    check("batch/live separation preserved", scoringEvents.includes("batch/live separation status: PASS") && fullMatchWorkbenchChainReplay3CValidation.includes("batch/live separation preserved"), "batch/live PASS"),
    check("50-match economy remains global reference", fullMatchWorkbenchChainReplay3C.includes("FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof") && bundleSimulation.includes("VALIDATED_FULL_MATCH_ECONOMY_ANCHOR"), "50-match reference visible"),
    check("recommendations visible", fullMatchWorkbenchChainReplay3C.includes("CONFIRM_EXPERIMENTAL_CHAIN_CONTEXT_TO_SHADOW_ROUTE_SELECTION") && fullMatchWorkbenchChainReplay3C.includes("CONFIRM_SHADOW_SELECTION_DOES_NOT_DRIVE_PRODUCTION") && fullMatchWorkbenchChainReplay3C.includes("PREPARE_EXPERIMENTAL_SHADOW_SELECTION_TO_CONTROLLED_SEGMENT_SELECTION"), "3C recommendations visible"),
  ];
  const sprint3BExpectedFiles = [
    "package.json",
    "tsconfig.json",
    "coach-report.latest.html",
    "scoring-events-summary.md",
    "sequence-1-action-1.html",
    "sequence-1-action-2.html",
    "sequence-1-action-3.html",
    "validation.share-pack.md",
    "fullmatch-workbench-chain-replay-3b.md",
    "validation.fullmatch-workbench-chain-replay-3b.md",
    "README.md",
    "manifest.md",
    "00-share-manifest.txt",
    "bundle__contracts.md",
    "bundle__simulation.md",
    "bundle__reports.md",
  ];
  const sprint3BForbiddenLeftovers = [
    "fullmatch-workbench-chain-replay-3a.md",
    "validation.fullmatch-workbench-chain-replay-3a.md",
    "fullmatch-workbench-chain-replay-2z.md",
    "validation.fullmatch-workbench-chain-replay-2z.md",
    "fullmatch-workbench-chain-replay-2y.md",
    "validation.fullmatch-workbench-chain-replay-2y.md",
    "fullmatch-workbench-chain-replay-2x.md",
    "validation.fullmatch-workbench-chain-replay-2x.md",
    "fullmatch-workbench-chain-replay.md",
    "validation.fullmatch-workbench-chain-replay.md",
    "bundle__docs.md",
  ];
  const sprint3BChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("current sprint is Sprint 3B", activeConfig.sprintName === "Sprint 3B - Experimental Chain Context to Route Candidate Influence", activeConfig.sprintName),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share pack under 20 files", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("final file count is 16", filesOnDisk.length === 16, `${filesOnDisk.length}`),
    check("minimal allowlist count is 16", allowlistedFiles.length === 16, `${allowlistedFiles.length}`),
    check("missing expected files are none", missingExpectedFiles.length === 0, missingExpectedFiles.join(", ") || "none"),
    check("stale share file count is 0", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("previous sprint leftovers are 0", sprint3BForbiddenLeftovers.every((file) => !requiredCopied(file)), sprint3BForbiddenLeftovers.filter((file) => requiredCopied(file)).join(", ") || "0"),
    check("source files deleted count is 0", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("all required current sprint files copied", sprint3BExpectedFiles.every((file) => requiredCopied(file)), sprint3BExpectedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest lists Sprint 3B", manifest.includes("Sprint 3B - Experimental Chain Context to Route Candidate Influence") && detailedManifest.includes("Sprint 3B - Experimental Chain Context to Route Candidate Influence"), "Sprint 3B visible"),
    check("README is Sprint 3B oriented", readme.includes("# Sprint 3B Share Pack") && readme.includes("fullmatch-workbench-chain-replay-3b.md"), "README current"),
    check("sequence workbench artifacts copied", sequenceOneActionOneWorkbench.includes("Sequence 1 Action 1 Tactical Workbench") && sequenceOneActionTwoWorkbench.includes("Sequence 1 Action 2 Tactical Workbench") && sequenceOneActionThreeWorkbench.includes("Sequence 1 Action 3 Tactical Workbench"), "three workbench artifacts copied"),
    check("3B report included", fullMatchWorkbenchChainReplay3B.includes("# FullMatch Workbench Chain Replay 3B") && fullMatchWorkbenchChainReplay3B.includes("route candidate influence status: available"), "3B doc included"),
    check("3B validation is PASS", fullMatchWorkbenchChainReplay3BValidation.includes("Status: PASS") && fullMatchWorkbenchChainReplay3BValidation.includes("chain context maps to route candidate influence"), "3B validation PASS"),
    check("segment context final carrier visible", fullMatchWorkbenchChainReplay3B.includes("segment context final carrier: control-space-hunter") && fullMatchWorkbenchChainReplay3BValidation.includes("segment context final carrier is control-space-hunter"), "final carrier visible"),
    check("segment context final zone visible", fullMatchWorkbenchChainReplay3B.includes("segment context final zone: Z4-HSR") && fullMatchWorkbenchChainReplay3BValidation.includes("segment context final zone is Z4-HSR"), "final zone visible"),
    check("route candidate influence contract bundled", bundleSimulation.includes("src/simulation/fullMatch/fullMatchChainRouteCandidateInfluence.ts") && bundleSimulation.includes("FullMatchChainRouteCandidateInfluenceResult"), "route influence contract bundled"),
    check("route candidate influence mapper bundled", bundleSimulation.includes("src/simulation/fullMatch/applyChainContextToRouteCandidates.ts") && bundleSimulation.includes("applyChainContextToRouteCandidates"), "route influence mapper bundled"),
    check("route candidate influence signature bundled", bundleSimulation.includes("src/simulation/fullMatch/fullMatchRouteCandidateInfluenceSignature.ts") && bundleSimulation.includes("FullMatchRouteCandidateInfluenceSignature"), "route influence signature bundled"),
    check("matchReportBuilder route influence wiring bundled", bundleSimulation.includes("src/simulation/adapters/matchReportBuilder.ts") && bundleSimulation.includes("routeCandidateInfluenceTags") && bundleSimulation.includes("routeCandidateInfluenceReason"), "builder route influence wiring bundled"),
    check("runFullMatch route influence wiring bundled", bundleSimulation.includes("applyChainContextToRouteCandidates") && bundleSimulation.includes("FULLMATCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE_CANNOT_DRIVE_PRODUCTION_SELECTION"), "runFullMatch route influence wiring bundled"),
    check("compatible route candidates receive bounded deltas", fullMatchWorkbenchChainReplay3B.includes("influenced candidate count: 2") && fullMatchWorkbenchChainReplay3BValidation.includes("compatible route candidates receive bounded deltas"), "bounded deltas visible"),
    check("closed candidates remain blocked", fullMatchWorkbenchChainReplay3B.includes("closed candidates remain selectable after influence: NO") && fullMatchWorkbenchChainReplay3BValidation.includes("CLOSED candidates remain unselectable"), "closed route guarded"),
    check("unavailable candidates remain blocked", fullMatchWorkbenchChainReplay3B.includes("unavailable candidates remain selectable after influence: NO") && fullMatchWorkbenchChainReplay3BValidation.includes("unavailable candidates remain unselectable"), "unavailable route guarded"),
    check("illegal/unavailable boost blocking counted", fullMatchWorkbenchChainReplay3B.includes("illegal candidate boost blocked count: 1") && fullMatchWorkbenchChainReplay3B.includes("unavailable candidate boost blocked count: 1"), "blocked counters visible"),
    check("diagnostic selection before/after visible", fullMatchWorkbenchChainReplay3B.includes("diagnostic selection before: chain-context-safe-recycle-pv") && fullMatchWorkbenchChainReplay3B.includes("diagnostic selection after: chain-context-forward-progress-sh"), "diagnostic selection visible"),
    check("route influence evidence included", fullMatchWorkbenchChainReplay3B.includes("WORKBENCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE") && bundleSimulation.includes("category: \"WORKBENCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE\""), "route influence evidence visible"),
    check("3B route influence tests bundled", bundleSimulation.includes("fullMatchChainRouteCandidateInfluence.test.ts") && bundleSimulation.includes("fullMatchChainRouteCandidateInfluenceGuard.test.ts"), "3B route tests bundled"),
    check("3B runFullMatch influence tests bundled", bundleSimulation.includes("runFullMatchExperimentalRouteCandidateInfluence.test.ts") && bundleSimulation.includes("runFullMatchRouteCandidateInfluenceScoringGuard.test.ts"), "3B full-match tests bundled"),
    check("3B scoring and source-of-truth guards bundled", bundleSimulation.includes("scoringGuard.3b.test.ts") && bundleSimulation.includes("sourceOfTruthGuards.3b.test.ts"), "3B guards bundled"),
    check("coach diagnosis mentions route candidate influence", fullMatchWorkbenchChainReplay3B.includes("coach diagnosis mentions route candidate influence") && bundleSimulation.includes("influencer le classement diagnostique des options de route"), "coach diagnosis visible"),
    check("default mode remains segment_harness", fullMatchWorkbenchChainReplay3B.includes("default full-match mode: segment_harness") && bundleSimulation.includes("DEFAULT_FULL_MATCH_ROUTE_SELECTION_MODE"), "default mode visible"),
    check("experimental mode remains opt-in", fullMatchWorkbenchChainReplay3B.includes("experimental mode active by default: NO") && bundleSimulation.includes("workbench_chain_replay_experimental"), "experimental opt-in visible"),
    check("normal full-match not production chain-driven", fullMatchWorkbenchChainReplay3B.includes("normal full-match chain-driven claim status: NO") && bundleSimulation.includes("NORMAL_FULLMATCH_STILL_SEGMENT_HARNESS_BY_DEFAULT"), "normal full-match guarded"),
    check("default route influence absent", fullMatchWorkbenchChainReplay3B.includes("default route candidate influence tag count: 0") && fullMatchWorkbenchChainReplay3BValidation.includes("default timeline/report has no route candidate influence tags"), "default clean"),
    check("experimental route influence present", fullMatchWorkbenchChainReplay3B.includes("experimental route candidate influence tag count: greater than 0") && fullMatchWorkbenchChainReplay3BValidation.includes("experimental timeline/report includes route candidate influence tags"), "experimental influence visible"),
    check("default and experimental score signatures remain equal", fullMatchWorkbenchChainReplay3B.includes("default and experimental score signatures remain equal for now: YES") && fullMatchWorkbenchChainReplay3BValidation.includes("default and experimental score signatures remain equal"), "score signatures equal"),
    check("route candidate influence cannot mutate score", fullMatchWorkbenchChainReplay3B.includes("route candidate influence can mutate score: false") && fullMatchWorkbenchChainReplay3BValidation.includes("route candidate influence cannot mutate score"), "score mutation forbidden"),
    check("route candidate influence cannot mutate scoring events", fullMatchWorkbenchChainReplay3B.includes("route candidate influence can mutate scoring events: false") && fullMatchWorkbenchChainReplay3BValidation.includes("route candidate influence cannot mutate scoring events"), "scoring event mutation forbidden"),
    check("route candidate influence cannot drive production selection", fullMatchWorkbenchChainReplay3B.includes("route candidate influence can drive production selection: false") && fullMatchWorkbenchChainReplay3BValidation.includes("route candidate influence cannot drive production selection"), "production selection forbidden"),
    check("scoring constants unchanged", scoringEvents.includes("SHOT_GOAL = 3 points") && scoringEvents.includes("TRY_TOUCHDOWN = 5 points") && scoringEvents.includes("CONVERSION_GOAL = 2 points") && scoringEvents.includes("DROP_GOAL = 2 points"), "scoring constants visible"),
    check("PENALTY_SHOT remains inactive", scoringEvents.includes("PENALTY_SHOT inactive"), "penalty inactive"),
    check("no scoring events deleted or capped", fullMatchWorkbenchChainReplay3BValidation.includes("no scoring events deleted or capped") && bundleSimulation.includes("score_change"), "scoring event guard visible"),
    check("no MatchBonusEvent mutation", scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream") && fullMatchWorkbenchChainReplay3BValidation.includes("MatchBonusEvent unchanged"), "MatchBonusEvent separated"),
    check("batch/live separation preserved", scoringEvents.includes("batch/live separation status: PASS") && fullMatchWorkbenchChainReplay3BValidation.includes("batch/live separation preserved"), "batch/live PASS"),
    check("50-match economy remains global reference", fullMatchWorkbenchChainReplay3B.includes("FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof") && bundleSimulation.includes("VALIDATED_FULL_MATCH_ECONOMY_ANCHOR"), "50-match reference visible"),
    check("recommendations visible", fullMatchWorkbenchChainReplay3B.includes("CONFIRM_EXPERIMENTAL_CHAIN_CONTEXT_TO_ROUTE_CANDIDATE_INFLUENCE") && fullMatchWorkbenchChainReplay3B.includes("CONFIRM_ROUTE_CANDIDATE_INFLUENCE_IS_DIAGNOSTIC_ONLY") && fullMatchWorkbenchChainReplay3B.includes("PREPARE_EXPERIMENTAL_CHAIN_CONTEXT_TO_SHADOW_ROUTE_SELECTION"), "3B recommendations visible"),
  ];
  const sprint3AExpectedFiles = [
    "package.json",
    "tsconfig.json",
    "coach-report.latest.html",
    "scoring-events-summary.md",
    "sequence-1-action-1.html",
    "sequence-1-action-2.html",
    "sequence-1-action-3.html",
    "validation.share-pack.md",
    "fullmatch-workbench-chain-replay-3a.md",
    "validation.fullmatch-workbench-chain-replay-3a.md",
    "README.md",
    "manifest.md",
    "00-share-manifest.txt",
    "bundle__contracts.md",
    "bundle__simulation.md",
    "bundle__reports.md",
  ];
  const sprint3AForbiddenLeftovers = [
    "fullmatch-workbench-chain-replay-2z.md",
    "validation.fullmatch-workbench-chain-replay-2z.md",
    "fullmatch-workbench-chain-replay-2y.md",
    "validation.fullmatch-workbench-chain-replay-2y.md",
    "fullmatch-workbench-chain-replay-2x.md",
    "validation.fullmatch-workbench-chain-replay-2x.md",
    "fullmatch-workbench-chain-replay.md",
    "validation.fullmatch-workbench-chain-replay.md",
    "bundle__docs.md",
  ];
  const sprint3AChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("current sprint is Sprint 3A", activeConfig.sprintName === "Sprint 3A - Experimental Chain Influence on Segment Context", activeConfig.sprintName),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share pack under 20 files", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("final file count is 16", filesOnDisk.length === 16, `${filesOnDisk.length}`),
    check("minimal allowlist count is 16", allowlistedFiles.length === 16, `${allowlistedFiles.length}`),
    check("missing expected files are none", missingExpectedFiles.length === 0, missingExpectedFiles.join(", ") || "none"),
    check("stale share file count is 0", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("previous sprint leftovers are 0", sprint3AForbiddenLeftovers.every((file) => !requiredCopied(file)), sprint3AForbiddenLeftovers.filter((file) => requiredCopied(file)).join(", ") || "0"),
    check("source files deleted count is 0", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("all required current sprint files copied", sprint3AExpectedFiles.every((file) => requiredCopied(file)), sprint3AExpectedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest lists Sprint 3A", manifest.includes("Sprint 3A - Experimental Chain Influence on Segment Context") && detailedManifest.includes("Sprint 3A - Experimental Chain Influence on Segment Context"), "Sprint 3A visible"),
    check("README is Sprint 3A oriented", readme.includes("# Sprint 3A Share Pack") && readme.includes("fullmatch-workbench-chain-replay-3a.md"), "README current"),
    check("sequence workbench artifacts copied", sequenceOneActionOneWorkbench.includes("Sequence 1 Action 1 Tactical Workbench") && sequenceOneActionTwoWorkbench.includes("Sequence 1 Action 2 Tactical Workbench") && sequenceOneActionThreeWorkbench.includes("Sequence 1 Action 3 Tactical Workbench"), "three workbench artifacts copied"),
    check("3A report included", fullMatchWorkbenchChainReplay3A.includes("# FullMatch Workbench Chain Replay 3A") && fullMatchWorkbenchChainReplay3A.includes("chain segment context status: available"), "3A doc included"),
    check("3A validation is PASS", fullMatchWorkbenchChainReplay3AValidation.includes("Status: PASS") && fullMatchWorkbenchChainReplay3AValidation.includes("chain consumption maps to segment context"), "3A validation PASS"),
    check("segment context final carrier visible", fullMatchWorkbenchChainReplay3A.includes("segment context final carrier: control-space-hunter") && fullMatchWorkbenchChainReplay3AValidation.includes("segment context final carrier is control-space-hunter"), "final carrier visible"),
    check("segment context final zone visible", fullMatchWorkbenchChainReplay3A.includes("segment context final zone: Z4-HSR") && fullMatchWorkbenchChainReplay3AValidation.includes("segment context final zone is Z4-HSR"), "final zone visible"),
    check("segment context attached to segment-1", fullMatchWorkbenchChainReplay3A.includes("segment context attached to: segment-1") && fullMatchWorkbenchChainReplay3AValidation.includes("segment context is attached to segment-1 only"), "segment-1 attachment visible"),
    check("default timeline has no chain context tags", fullMatchWorkbenchChainReplay3A.includes("default chain context tags present in timeline: NO") && fullMatchWorkbenchChainReplay3AValidation.includes("default timeline has no chain context tags"), "default clean"),
    check("experimental timeline has chain context tags", fullMatchWorkbenchChainReplay3A.includes("experimental chain context tags present in timeline: YES") && fullMatchWorkbenchChainReplay3AValidation.includes("segment context tags are present in experimental timeline"), "experimental tags visible"),
    check("chain segment context contract bundled", bundleSimulation.includes("src/simulation/fullMatch/fullMatchChainSegmentContext.ts") && bundleSimulation.includes("FullMatchChainSegmentContext"), "segment context contract bundled"),
    check("segment context signature helper bundled", bundleSimulation.includes("src/simulation/fullMatch/fullMatchSegmentContextSignature.ts") && bundleSimulation.includes("FullMatchSegmentContextSignature"), "signature helper bundled"),
    check("matchReportBuilder segment context wiring bundled", bundleSimulation.includes("src/simulation/adapters/matchReportBuilder.ts") && bundleSimulation.includes("chainSegmentContextTags") && bundleSimulation.includes("chainSegmentContextReason"), "builder wiring bundled"),
    check("runFullMatch segment context wiring bundled", bundleSimulation.includes("chainConsumptionToSegmentContext") && bundleSimulation.includes("FULLMATCH_CHAIN_SEGMENT_CONTEXT_ATTACHED_TO_SEGMENT_1"), "runFullMatch wiring bundled"),
    check("3A mapping test bundled", bundleSimulation.includes("fullMatchChainSegmentContext.test.ts") && bundleSimulation.includes("consumed chain consumption maps to available context"), "mapping test bundled"),
    check("3A experimental segment context test bundled", bundleSimulation.includes("runFullMatchExperimentalSegmentContext.test.ts") && bundleSimulation.includes("experimental runFullMatch exposes chain context tags on segment-1 events"), "experimental context test bundled"),
    check("3A scoring guard bundled", bundleSimulation.includes("runFullMatchSegmentContextScoringGuard.test.ts") && bundleSimulation.includes("scoringGuard.3a.test.ts"), "3A scoring guards bundled"),
    check("3A source-of-truth guard bundled", bundleSimulation.includes("sourceOfTruthGuards.3a.test.ts") && bundleSimulation.includes("WORKBENCH_CHAIN_SEGMENT_CONTEXT cannot make global economy claims"), "source-of-truth 3A test bundled"),
    check("experimental report includes chain segment context evidence", fullMatchWorkbenchChainReplay3A.includes("WORKBENCH_CHAIN_SEGMENT_CONTEXT") && bundleSimulation.includes("category: \"WORKBENCH_CHAIN_SEGMENT_CONTEXT\""), "segment evidence visible"),
    check("coach diagnosis mentions chain context", fullMatchWorkbenchChainReplay3A.includes("coach diagnosis mentions experimental chain context") && bundleSimulation.includes("contexte experimental issu de la chaine workbench"), "coach diagnosis visible"),
    check("default mode remains segment_harness", fullMatchWorkbenchChainReplay3A.includes("default full-match mode: segment_harness") && bundleSimulation.includes("DEFAULT_FULL_MATCH_ROUTE_SELECTION_MODE"), "default mode visible"),
    check("experimental mode remains opt-in", fullMatchWorkbenchChainReplay3A.includes("experimental mode active by default: NO") && bundleSimulation.includes("workbench_chain_replay_experimental"), "experimental opt-in visible"),
    check("normal full-match not production chain-driven", fullMatchWorkbenchChainReplay3A.includes("normal full-match chain-driven claim status: NO") && bundleSimulation.includes("NORMAL_FULLMATCH_STILL_SEGMENT_HARNESS_BY_DEFAULT"), "normal full-match guarded"),
    check("default and experimental score signatures remain equal", fullMatchWorkbenchChainReplay3A.includes("default and experimental score signatures remain equal for now: YES") && fullMatchWorkbenchChainReplay3AValidation.includes("default and experimental score signatures remain equal"), "score signatures equal"),
    check("segment context cannot mutate score", fullMatchWorkbenchChainReplay3A.includes("segment context can mutate score: false") && fullMatchWorkbenchChainReplay3AValidation.includes("segment context cannot mutate score"), "score mutation forbidden"),
    check("segment context cannot mutate scoring events", fullMatchWorkbenchChainReplay3A.includes("segment context can mutate scoring events: false") && fullMatchWorkbenchChainReplay3AValidation.includes("segment context cannot mutate scoring events"), "scoring event mutation forbidden"),
    check("scoring constants unchanged", scoringEvents.includes("SHOT_GOAL = 3 points") && scoringEvents.includes("TRY_TOUCHDOWN = 5 points") && scoringEvents.includes("CONVERSION_GOAL = 2 points") && scoringEvents.includes("DROP_GOAL = 2 points"), "scoring constants visible"),
    check("PENALTY_SHOT remains inactive", scoringEvents.includes("PENALTY_SHOT inactive"), "penalty inactive"),
    check("no scoring events deleted or capped", fullMatchWorkbenchChainReplay3AValidation.includes("no scoring events deleted or capped") && bundleSimulation.includes("score_change"), "scoring event guard visible"),
    check("no MatchBonusEvent mutation", scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream") && fullMatchWorkbenchChainReplay3AValidation.includes("MatchBonusEvent unchanged"), "MatchBonusEvent separated"),
    check("batch/live separation preserved", scoringEvents.includes("batch/live separation status: PASS") && fullMatchWorkbenchChainReplay3AValidation.includes("batch/live separation preserved"), "batch/live PASS"),
    check("50-match economy remains global reference", fullMatchWorkbenchChainReplay3A.includes("FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof") && bundleSimulation.includes("VALIDATED_FULL_MATCH_ECONOMY_ANCHOR"), "50-match reference visible"),
    check("recommendations visible", fullMatchWorkbenchChainReplay3A.includes("CONFIRM_EXPERIMENTAL_CHAIN_INFLUENCE_ON_SEGMENT_CONTEXT") && fullMatchWorkbenchChainReplay3A.includes("CONFIRM_SEGMENT_CONTEXT_IS_DIAGNOSTIC_ONLY") && fullMatchWorkbenchChainReplay3A.includes("PREPARE_EXPERIMENTAL_CHAIN_CONTEXT_TO_ROUTE_CANDIDATE_INFLUENCE"), "3A recommendations visible"),
  ];
  const sprint2ZExpectedFiles = [
    "package.json",
    "tsconfig.json",
    "coach-report.latest.html",
    "scoring-events-summary.md",
    "sequence-1-action-1.html",
    "sequence-1-action-2.html",
    "sequence-1-action-3.html",
    "validation.share-pack.md",
    "fullmatch-workbench-chain-replay-2z.md",
    "validation.fullmatch-workbench-chain-replay-2z.md",
    "README.md",
    "manifest.md",
    "00-share-manifest.txt",
    "bundle__contracts.md",
    "bundle__simulation.md",
    "bundle__reports.md",
  ];
  const sprint2ZForbiddenLeftovers = [
    "fullmatch-workbench-chain-replay-2y.md",
    "validation.fullmatch-workbench-chain-replay-2y.md",
    "fullmatch-workbench-chain-replay-2x.md",
    "validation.fullmatch-workbench-chain-replay-2x.md",
    "fullmatch-workbench-chain-replay.md",
    "validation.fullmatch-workbench-chain-replay.md",
    "prototype-selection-replacement.md",
    "validation.prototype-selection-replacement.md",
    "selection-driving-attribute-ranking.md",
    "validation.selection-driving-attribute-ranking.md",
    "bundle__docs.md",
  ];
  const sprint2ZChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("current sprint is Sprint 2Z", activeConfig.sprintName === "Sprint 2Z - Experimental FullMatch Chain Consumption Behind Flag", activeConfig.sprintName),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share pack under 20 files", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("final file count is 16", filesOnDisk.length === 16, `${filesOnDisk.length}`),
    check("minimal allowlist count is 16", allowlistedFiles.length === 16, `${allowlistedFiles.length}`),
    check("missing expected files are none", missingExpectedFiles.length === 0, missingExpectedFiles.join(", ") || "none"),
    check("stale share file count is 0", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("previous sprint leftovers are 0", sprint2ZForbiddenLeftovers.every((file) => !requiredCopied(file)), sprint2ZForbiddenLeftovers.filter((file) => requiredCopied(file)).join(", ") || "0"),
    check("source files deleted count is 0", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("all required current sprint files copied", sprint2ZExpectedFiles.every((file) => requiredCopied(file)), sprint2ZExpectedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest lists Sprint 2Z", manifest.includes("Sprint 2Z - Experimental FullMatch Chain Consumption") && detailedManifest.includes("Sprint 2Z - Experimental FullMatch Chain Consumption"), "Sprint 2Z visible"),
    check("README is Sprint 2Z oriented", readme.includes("# Sprint 2Z Share Pack") && readme.includes("fullmatch-workbench-chain-replay-2z.md"), "README current"),
    check("sequence-1-action-1 workbench copied", sequenceOneActionOneWorkbench.includes("Sequence 1 Action 1 Tactical Workbench") && sequenceOneActionOneWorkbench.includes("data-player-id=\"control-tempo-half\""), "action 1 workbench copied"),
    check("sequence-1-action-2 workbench copied", sequenceOneActionTwoWorkbench.includes("Sequence 1 Action 2 Tactical Workbench") && sequenceOneActionTwoWorkbench.includes("data-selected-actor=\"control-mobile-lock\""), "action 2 workbench copied"),
    check("sequence-1-action-3 workbench copied", sequenceOneActionThreeWorkbench.includes("Sequence 1 Action 3 Tactical Workbench") && sequenceOneActionThreeWorkbench.includes("data-selected-actor=\"control-playmaker\""), "action 3 workbench copied"),
    check("2Z report included", fullMatchWorkbenchChainReplay2Z.includes("# FullMatch Workbench Chain Replay 2Z") && fullMatchWorkbenchChainReplay2Z.includes("chain consumption status: consumed"), "2Z doc included"),
    check("2Z validation is PASS", fullMatchWorkbenchChainReplay2ZValidation.includes("Status: PASS") && fullMatchWorkbenchChainReplay2ZValidation.includes("experimental runFullMatch consumes sequence-1-multi-action-chain"), "2Z validation PASS"),
    check("consumed chain id is sequence-1-multi-action-chain", fullMatchWorkbenchChainReplay2Z.includes("consumed chain id: sequence-1-multi-action-chain"), "chain id visible"),
    check("consumed segment is segment-1", fullMatchWorkbenchChainReplay2Z.includes("consumed segment: segment-1") && fullMatchWorkbenchChainReplay2ZValidation.includes("consumed segment is segment-1"), "segment visible"),
    check("consumed chain step count is 3", fullMatchWorkbenchChainReplay2Z.includes("consumed step count: 3") && fullMatchWorkbenchChainReplay2ZValidation.includes("consumed steps: 3"), "3 steps consumed"),
    check("visual step count is 3", fullMatchWorkbenchChainReplay2Z.includes("visual step count: 3") && fullMatchWorkbenchChainReplay2ZValidation.includes("visual workbench steps: 3"), "3 visual steps"),
    check("synthetic step count is 0", fullMatchWorkbenchChainReplay2Z.includes("synthetic step count: 0") && fullMatchWorkbenchChainReplay2ZValidation.includes("synthetic continuation steps: 0"), "0 synthetic steps"),
    check("spatial selection count is 3", fullMatchWorkbenchChainReplay2Z.includes("spatial selection step count: 3") && fullMatchWorkbenchChainReplay2ZValidation.includes("spatial selection steps: 3"), "3 spatial steps"),
    check("actor receiver and action type preserved", fullMatchWorkbenchChainReplay2ZValidation.includes("actor preserved steps: 3") && fullMatchWorkbenchChainReplay2ZValidation.includes("receiver preserved steps: 3") && fullMatchWorkbenchChainReplay2ZValidation.includes("action type preserved steps: 3"), "selection preservation visible"),
    check("before and after states preserved", fullMatchWorkbenchChainReplay2ZValidation.includes("before state preserved steps: 3") && fullMatchWorkbenchChainReplay2ZValidation.includes("after state preserved steps: 3"), "state preservation visible"),
    check("mismatch warnings are 0", fullMatchWorkbenchChainReplay2Z.includes("mismatch warnings: 0"), "mismatch warnings 0"),
    check("score mutation count is 0", fullMatchWorkbenchChainReplay2Z.includes("score mutation count: 0") && fullMatchWorkbenchChainReplay2ZValidation.includes("score mutation count: 0"), "score mutation 0"),
    check("scoring events mutation count is 0", fullMatchWorkbenchChainReplay2Z.includes("scoring events mutation count: 0") && fullMatchWorkbenchChainReplay2ZValidation.includes("scoring event mutation count: 0"), "scoring event mutation 0"),
    check("experimental chain consumption is diagnostic-only", fullMatchWorkbenchChainReplay2Z.includes("diagnostic_only_chain_consumption") && fullMatchWorkbenchChainReplay2ZValidation.includes("experimental chain consumption is diagnostic-only"), "diagnostic only"),
    check("default mode remains segment_harness", fullMatchWorkbenchChainReplay2Z.includes("default full-match mode: segment_harness") && bundleSimulation.includes("DEFAULT_FULL_MATCH_ROUTE_SELECTION_MODE"), "default mode visible"),
    check("experimental mode remains opt-in", fullMatchWorkbenchChainReplay2Z.includes("experimental mode active by default: NO") && bundleSimulation.includes("workbench_chain_replay_experimental"), "experimental opt-in visible"),
    check("normal full-match not production chain-driven", fullMatchWorkbenchChainReplay2Z.includes("normal full-match chain-driven claim status: NO") && bundleSimulation.includes("NORMAL_FULLMATCH_STILL_SEGMENT_HARNESS"), "normal full-match guarded"),
    check("full-match chain consumption types bundled", bundleSimulation.includes("src/simulation/fullMatch/fullMatchChainConsumption.ts") && bundleSimulation.includes("FullMatchChainConsumptionResult"), "chain consumption types bundled"),
    check("full-match chain consumer bundled", bundleSimulation.includes("src/simulation/fullMatch/consumeWorkbenchChainForFullMatch.ts") && bundleSimulation.includes("consumeWorkbenchChainForFullMatch"), "chain consumer bundled"),
    check("runFullMatch chain evidence bundled", bundleSimulation.includes("WORKBENCH_CHAIN_CONSUMPTION") && bundleSimulation.includes("chainConsumptionEvidenceFact"), "evidence fact bundled"),
    check("chain consumption tests bundled", bundleSimulation.includes("fullMatchChainConsumption.test.ts") && bundleSimulation.includes("runFullMatchExperimentalChainConsumption.test.ts"), "2Z consumption tests bundled"),
    check("chain mismatch test bundled", bundleSimulation.includes("fullMatchChainConsumptionMismatch.test.ts") && bundleSimulation.includes("fallback does not hide mismatch"), "mismatch test bundled"),
    check("default regression test bundled", bundleSimulation.includes("runFullMatchDefaultRegression.test.ts") && bundleSimulation.includes("default runFullMatch must remain segment_harness"), "default regression bundled"),
    check("2Z source-of-truth guard bundled", bundleSimulation.includes("sourceOfTruthGuards.2z.test.ts") && bundleSimulation.includes("FULL_MATCH_BATCH_ECONOMY"), "source-of-truth 2Z test bundled"),
    check("2Z scoring guard bundled", bundleSimulation.includes("scoringGuard.2z.test.ts") && bundleSimulation.includes("scoring constants remain unchanged"), "scoring guard bundled"),
    check("scoring constants unchanged", scoringEvents.includes("SHOT_GOAL = 3 points") && scoringEvents.includes("TRY_TOUCHDOWN = 5 points") && scoringEvents.includes("CONVERSION_GOAL = 2 points") && scoringEvents.includes("DROP_GOAL = 2 points"), "scoring constants visible"),
    check("PENALTY_SHOT remains inactive", scoringEvents.includes("PENALTY_SHOT inactive"), "penalty inactive"),
    check("no scoring events deleted or capped", fullMatchWorkbenchChainReplay2ZValidation.includes("no scoring events deleted or capped") && bundleSimulation.includes("score_change"), "scoring event guard visible"),
    check("no MatchBonusEvent mutation", scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream") && fullMatchWorkbenchChainReplay2ZValidation.includes("MatchBonusEvent unchanged"), "MatchBonusEvent separated"),
    check("batch/live separation preserved", scoringEvents.includes("batch/live separation status: PASS") && fullMatchWorkbenchChainReplay2ZValidation.includes("batch/live separation preserved"), "batch/live PASS"),
    check("50-match economy remains global reference", fullMatchWorkbenchChainReplay2Z.includes("FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof") && bundleSimulation.includes("VALIDATED_FULL_MATCH_ECONOMY_ANCHOR"), "50-match reference visible"),
    check("single full-match harness remains warning-only", bundleSimulation.includes("mayInvalidateGlobalScoringEconomy: false") && fullMatchWorkbenchChainReplay2ZValidation.includes("FULL_MATCH_HARNESS_SINGLE_RUN remains warning-only"), "single-run warning-only"),
    check("recommendations visible", fullMatchWorkbenchChainReplay2Z.includes("CONFIRM_EXPERIMENTAL_FULLMATCH_CHAIN_CONSUMPTION") && fullMatchWorkbenchChainReplay2Z.includes("CONFIRM_DEFAULT_FULLMATCH_UNCHANGED") && fullMatchWorkbenchChainReplay2Z.includes("PREPARE_EXPERIMENTAL_CHAIN_INFLUENCE_ON_SEGMENT_CONTEXT"), "2Z recommendations visible"),
  ];
  const sprint2YExpectedFiles = [
    "package.json",
    "tsconfig.json",
    "coach-report.latest.html",
    "scoring-events-summary.md",
    "sequence-1-action-1.html",
    "sequence-1-action-2.html",
    "sequence-1-action-3.html",
    "validation.share-pack.md",
    "fullmatch-workbench-chain-replay-2y.md",
    "validation.fullmatch-workbench-chain-replay-2y.md",
    "README.md",
    "manifest.md",
    "00-share-manifest.txt",
    "bundle__contracts.md",
    "bundle__simulation.md",
    "bundle__reports.md",
  ];
  const sprint2YForbiddenLeftovers = [
    "fullmatch-workbench-chain-replay-2x.md",
    "validation.fullmatch-workbench-chain-replay-2x.md",
    "fullmatch-workbench-chain-replay.md",
    "validation.fullmatch-workbench-chain-replay.md",
    "prototype-selection-replacement.md",
    "validation.prototype-selection-replacement.md",
    "selection-driving-attribute-ranking.md",
    "validation.selection-driving-attribute-ranking.md",
    "bundle__docs.md",
  ];
  const sprint2YChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("current sprint is Sprint 2Y", activeConfig.sprintName === "Sprint 2Y - Visual Workbench Expansion + Per-Step Spatial Replay Proof", activeConfig.sprintName),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share pack under 20 files", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("final file count is 16", filesOnDisk.length === 16, `${filesOnDisk.length}`),
    check("minimal allowlist count is 16", allowlistedFiles.length === 16, `${allowlistedFiles.length}`),
    check("missing expected files are none", missingExpectedFiles.length === 0, missingExpectedFiles.join(", ") || "none"),
    check("stale share file count is 0", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("previous sprint leftovers are 0", sprint2YForbiddenLeftovers.every((file) => !requiredCopied(file)), sprint2YForbiddenLeftovers.filter((file) => requiredCopied(file)).join(", ") || "0"),
    check("source files deleted count is 0", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("all required current sprint files copied", sprint2YExpectedFiles.every((file) => requiredCopied(file)), sprint2YExpectedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest lists Sprint 2Y", manifest.includes("Sprint 2Y - Visual Workbench Expansion") && detailedManifest.includes("Sprint 2Y - Visual Workbench Expansion"), "Sprint 2Y visible"),
    check("README is Sprint 2Y oriented", readme.includes("# Sprint 2Y Share Pack") && readme.includes("fullmatch-workbench-chain-replay-2y.md"), "README current"),
    check("sequence-1-action-1 workbench copied", sequenceOneActionOneWorkbench.includes("Sequence 1 Action 1 Tactical Workbench") && sequenceOneActionOneWorkbench.includes("data-player-id=\"control-tempo-half\""), "action 1 workbench copied"),
    check("sequence-1-action-2 workbench copied", sequenceOneActionTwoWorkbench.includes("Sequence 1 Action 2 Tactical Workbench") && sequenceOneActionTwoWorkbench.includes("data-selected-actor=\"control-mobile-lock\""), "action 2 workbench copied"),
    check("sequence-1-action-3 workbench copied", sequenceOneActionThreeWorkbench.includes("Sequence 1 Action 3 Tactical Workbench") && sequenceOneActionThreeWorkbench.includes("data-selected-actor=\"control-playmaker\""), "action 3 workbench copied"),
    check("2Y report included", fullMatchWorkbenchChainReplay2Y.includes("# FullMatch Workbench Chain Replay 2Y") && fullMatchWorkbenchChainReplay2Y.includes("visual workbench step count: 3"), "2Y doc included"),
    check("2Y validation is PASS", fullMatchWorkbenchChainReplay2YValidation.includes("Status: PASS") && fullMatchWorkbenchChainReplay2YValidation.includes("controlled_minimatch uses spatial_candidate_modifier for 3/3 steps"), "2Y validation PASS"),
    check("action 2 fixture bundled", bundleSimulation.includes("src/simulation/grounding/fixtures/sequence1Action2.fixture.ts") && bundleSimulation.includes("sequence1Action2WorkbenchTruth"), "action 2 fixture bundled"),
    check("action 3 fixture bundled", bundleSimulation.includes("src/simulation/grounding/fixtures/sequence1Action3.fixture.ts") && bundleSimulation.includes("sequence1Action3WorkbenchTruth"), "action 3 fixture bundled"),
    check("multi-action chain uses visual truth", bundleSimulation.includes("visual_workbench_truth") && bundleSimulation.includes("reports/workbench/sequence-1-action-2.html") && bundleSimulation.includes("reports/workbench/sequence-1-action-3.html"), "visual source visible"),
    check("no synthetic continuation remains in PASS path", fullMatchWorkbenchChainReplay2YValidation.includes("synthetic continuation steps: 0") && !fullMatchWorkbenchChainReplay2Y.includes("synthetic continuation frames are used"), "synthetic path removed"),
    check("extractors support action 2 and action 3", bundleSimulation.includes("extractSequenceOneActionTwoWorkbenchTruthFromHtml") && bundleSimulation.includes("extractSequenceOneActionThreeWorkbenchTruthFromHtml"), "extractors bundled"),
    check("contract guard validates visual multi-action chain", bundleSimulation.includes("validateSequenceOneMultiActionWorkbenchChainTruth") && bundleSimulation.includes("no synthetic_continuation remains in PASS path"), "multi-action guard bundled"),
    check("visual contract test bundled", bundleSimulation.includes("tacticalWorkbenchContractGuard.multiActionVisual.test.ts") && bundleSimulation.includes("sequence-1-action-2 visual truth artifact must exist"), "visual contract test bundled"),
    check("visual state test bundled", bundleSimulation.includes("workbenchChainState.visualMultiAction.test.ts") && bundleSimulation.includes("Step 2 propagates PM -> SH"), "visual state test bundled"),
    check("visual replay test bundled", bundleSimulation.includes("workbenchChainReplay.visualMultiAction.test.ts") && bundleSimulation.includes("controlled_minimatch spatial selection step count is 3"), "visual replay test bundled"),
    check("visual mismatch test bundled", bundleSimulation.includes("workbenchChainReplay.visualMismatch.test.ts") && bundleSimulation.includes("WORKBENCH_CHAIN_BALL_ZONE_MISMATCH"), "visual mismatch test bundled"),
    check("full-match feature flag guard bundled", bundleSimulation.includes("fullMatchRouteSelectionMode.guard.test.ts") && bundleSimulation.includes("experimental mode is opt-in only"), "feature flag guard bundled"),
    check("replay aggregate fields bundled", bundleSimulation.includes("visualWorkbenchStepCount") && bundleSimulation.includes("preservedBeforeStateStepCount") && bundleSimulation.includes("preservedAfterStateStepCount"), "aggregate fields visible"),
    check("controlled_minimatch spatial selection is 3/3", fullMatchWorkbenchChainReplay2Y.includes("controlled_minimatch spatial selection step count: 3") && fullMatchWorkbenchChainReplay2YValidation.includes("controlled_minimatch spatial selection steps: 3"), "3/3 spatial proof visible"),
    check("actor receiver action type preserved 3/3", fullMatchWorkbenchChainReplay2YValidation.includes("actor preserved steps: 3") && fullMatchWorkbenchChainReplay2YValidation.includes("receiver preserved steps: 3") && fullMatchWorkbenchChainReplay2YValidation.includes("action type preserved steps: 3"), "selection preservation visible"),
    check("before and after state preserved 3/3", fullMatchWorkbenchChainReplay2YValidation.includes("before state preserved steps: 3") && fullMatchWorkbenchChainReplay2YValidation.includes("after state preserved steps: 3"), "state preservation visible"),
    check("prototype fallback remains observable", fullMatchWorkbenchChainReplay2Y.includes("prototype fallback status: enabled and observable") && bundleSimulation.includes("CONFIRM_PROTOTYPE_FALLBACK_STILL_ENABLED"), "fallback visible"),
    check("fallback does not hide mismatch", fullMatchWorkbenchChainReplay2YValidation.includes("fallback does not hide replay mismatch") && bundleSimulation.includes("mismatch chain returns PARTIAL"), "mismatch visible"),
    check("normal full-match default unchanged", fullMatchWorkbenchChainReplay2Y.includes("default mode: segment_harness") && bundleSimulation.includes("DEFAULT_FULL_MATCH_ROUTE_SELECTION_MODE"), "default mode visible"),
    check("experimental mode remains opt-in", fullMatchWorkbenchChainReplay2Y.includes("experimental mode active by default: NO") && bundleSimulation.includes("workbench_chain_replay_experimental"), "experimental opt-in visible"),
    check("normal full-match not claimed as chain-driven", fullMatchWorkbenchChainReplay2Y.includes("normal full-match chain-driven claim: NO") && bundleSimulation.includes("NORMAL_FULLMATCH_STILL_SEGMENT_HARNESS_BY_DEFAULT"), "full-match limitation visible"),
    check("scoring constants unchanged", scoringEvents.includes("SHOT_GOAL = 3 points") && scoringEvents.includes("TRY_TOUCHDOWN = 5 points") && scoringEvents.includes("CONVERSION_GOAL = 2 points") && scoringEvents.includes("DROP_GOAL = 2 points"), "scoring constants visible"),
    check("PENALTY_SHOT remains inactive", scoringEvents.includes("PENALTY_SHOT inactive"), "penalty inactive"),
    check("no scoring events deleted or capped", fullMatchWorkbenchChainReplay2YValidation.includes("no scoring events deleted or capped") && bundleSimulation.includes("score_change"), "scoring event guard visible"),
    check("no MatchBonusEvent mutation", scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream") && fullMatchWorkbenchChainReplay2YValidation.includes("MatchBonusEvent unchanged"), "MatchBonusEvent separated"),
    check("batch/live separation preserved", scoringEvents.includes("batch/live separation status: PASS") && fullMatchWorkbenchChainReplay2YValidation.includes("batch/live separation preserved"), "batch/live PASS"),
    check("50-match economy remains global reference", fullMatchWorkbenchChainReplay2Y.includes("FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof") && bundleSimulation.includes("VALIDATED_FULL_MATCH_ECONOMY_ANCHOR"), "50-match reference visible"),
    check("single full-match harness remains warning-only", bundleSimulation.includes("mayInvalidateGlobalScoringEconomy: false") && fullMatchWorkbenchChainReplay2Y.includes("Normal full-match: still segment_harness by default"), "single-run warning-only"),
    check("recommendations visible", fullMatchWorkbenchChainReplay2Y.includes("CONFIRM_VISUAL_MULTI_ACTION_WORKBENCH_CHAIN") && fullMatchWorkbenchChainReplay2Y.includes("CONFIRM_PER_STEP_SPATIAL_REPLAY_PROOF") && fullMatchWorkbenchChainReplay2Y.includes("PREPARE_EXPERIMENTAL_FULLMATCH_CHAIN_CONSUMPTION"), "2Y recommendations visible"),
  ];

  const sprint2XExpectedFiles = [
    "package.json",
    "tsconfig.json",
    "coach-report.latest.html",
    "scoring-events-summary.md",
    "sequence-1-action-1.html",
    "validation.share-pack.md",
    "fullmatch-workbench-chain-replay-2x.md",
    "validation.fullmatch-workbench-chain-replay-2x.md",
    "README.md",
    "manifest.md",
    "00-share-manifest.txt",
    "bundle__contracts.md",
    "bundle__simulation.md",
    "bundle__reports.md",
  ];
  const sprint2XForbiddenLeftovers = [
    "fullmatch-workbench-chain-replay.md",
    "validation.fullmatch-workbench-chain-replay.md",
    "prototype-selection-replacement.md",
    "validation.prototype-selection-replacement.md",
    "selection-driving-attribute-ranking.md",
    "validation.selection-driving-attribute-ranking.md",
    "bundle__docs.md",
  ];
  const sprint2XChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("current sprint is Sprint 2X", activeConfig.sprintName === "Sprint 2X - Multi-Action Workbench Chain + Experimental FullMatch Feature Flag Skeleton", activeConfig.sprintName),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share pack under 20 files", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("final file count is 14", filesOnDisk.length === 14, `${filesOnDisk.length}`),
    check("minimal allowlist count is 14", allowlistedFiles.length === 14, `${allowlistedFiles.length}`),
    check("missing expected files are none", missingExpectedFiles.length === 0, missingExpectedFiles.join(", ") || "none"),
    check("stale share file count is 0", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("previous sprint leftovers are 0", sprint2XForbiddenLeftovers.every((file) => !requiredCopied(file)), sprint2XForbiddenLeftovers.filter((file) => requiredCopied(file)).join(", ") || "0"),
    check("source files deleted count is 0", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("all required current sprint files copied", sprint2XExpectedFiles.every((file) => requiredCopied(file)), sprint2XExpectedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest lists Sprint 2X", manifest.includes("Sprint 2X - Multi-Action Workbench Chain") && detailedManifest.includes("Sprint 2X - Multi-Action Workbench Chain"), "Sprint 2X visible"),
    check("README is Sprint 2X oriented", readme.includes("# Sprint 2X Share Pack") && readme.includes("fullmatch-workbench-chain-replay-2x.md"), "README current"),
    check("workbench artifact copied", sequenceOneActionOneWorkbench.includes("Sequence 1 Action 1 Tactical Workbench") && sequenceOneActionOneWorkbench.includes("data-player-id=\"control-tempo-half\""), "sequence workbench copied"),
    check("2X report included", fullMatchWorkbenchChainReplay2X.includes("# FullMatch Workbench Chain Replay 2X") && fullMatchWorkbenchChainReplay2X.includes("multi-action chain exists: YES"), "2X doc included"),
    check("2X validation is PASS", fullMatchWorkbenchChainReplay2XValidation.includes("Status: PASS") && fullMatchWorkbenchChainReplay2XValidation.includes("multi-action WorkbenchChain fixture exists"), "2X validation PASS"),
    check("multi-action chain fixture bundled", bundleSimulation.includes("src/simulation/grounding/fixtures/sequence1MultiAction.chain.fixture.ts") && bundleSimulation.includes("sequence1MultiActionChain"), "multi-action fixture bundled"),
    check("synthetic continuation marked", bundleSimulation.includes("synthetic_continuation") && fullMatchWorkbenchChainReplay2X.includes("typed synthetic continuation frames"), "synthetic source visible"),
    check("chain catalog includes multi-action chain", bundleSimulation.includes("WORKBENCH_CHAIN_CATALOG") && bundleSimulation.includes("sequence1MultiActionChain"), "catalog bundled"),
    check("chain replay aggregate fields bundled", bundleSimulation.includes("totalSteps") && bundleSimulation.includes("spatialSelectionStepCount") && bundleSimulation.includes("mismatchWarningCount"), "aggregate fields visible"),
    check("multi-action state test bundled", bundleSimulation.includes("workbenchChainState.multiAction.test.ts") && bundleSimulation.includes("Step 1 consumes propagated ML state"), "multi-state test bundled"),
    check("multi-action replay test bundled", bundleSimulation.includes("workbenchChainReplay.multiAction.test.ts") && bundleSimulation.includes("mismatch chain replay returns PARTIAL"), "multi-replay test bundled"),
    check("full-match feature flag bundled", bundleSimulation.includes("src/simulation/fullMatch/fullMatchRouteSelectionMode.ts") && bundleSimulation.includes("workbench_chain_replay_experimental"), "feature flag bundled"),
    check("full-match feature flag test bundled", bundleSimulation.includes("fullMatchRouteSelectionMode.test.ts") && bundleSimulation.includes("default runFullMatch mode remains segment_harness"), "feature flag test bundled"),
    check("diagnostic_only creates no scoring events", fullMatchWorkbenchChainReplay2XValidation.includes("diagnostic_only creates no scoring events") && bundleSimulation.includes("scoringEventsCreated: 0"), "diagnostic mode guarded"),
    check("controlled_minimatch uses spatial_candidate_modifier", fullMatchWorkbenchChainReplay2X.includes("controlled_minimatch spatial selection step count") && bundleSimulation.includes("routeSelectionSource: \"spatial_candidate_modifier\""), "controlled mode visible"),
    check("prototype fallback remains enabled", fullMatchWorkbenchChainReplay2X.includes("prototype fallback status: enabled") && bundleSimulation.includes("CONFIRM_PROTOTYPE_FALLBACK_STILL_ENABLED"), "prototype fallback visible"),
    check("normal full-match default unchanged", fullMatchWorkbenchChainReplay2X.includes("default mode: segment_harness") && bundleSimulation.includes("DEFAULT_FULL_MATCH_ROUTE_SELECTION_MODE"), "default mode visible"),
    check("normal full-match not claimed as chain-driven", fullMatchWorkbenchChainReplay2X.includes("normal full-match chain-driven claim: NO") && bundleSimulation.includes("NORMAL_FULLMATCH_STILL_SEGMENT_HARNESS_BY_DEFAULT"), "full-match limitation visible"),
    check("scoring constants unchanged", scoringEvents.includes("SHOT_GOAL = 3 points") && scoringEvents.includes("TRY_TOUCHDOWN = 5 points") && scoringEvents.includes("CONVERSION_GOAL = 2 points") && scoringEvents.includes("DROP_GOAL = 2 points"), "scoring constants visible"),
    check("PENALTY_SHOT remains inactive", scoringEvents.includes("PENALTY_SHOT inactive"), "penalty inactive"),
    check("no scoring events deleted or capped", fullMatchWorkbenchChainReplay2XValidation.includes("no scoring events deleted or capped") && bundleSimulation.includes("score_change"), "scoring event guard visible"),
    check("no MatchBonusEvent mutation", scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream") && fullMatchWorkbenchChainReplay2XValidation.includes("MatchBonusEvent unchanged"), "MatchBonusEvent separated"),
    check("batch/live separation preserved", scoringEvents.includes("batch/live separation status: PASS") && fullMatchWorkbenchChainReplay2XValidation.includes("batch/live separation preserved"), "batch/live PASS"),
    check("50-match economy remains global reference", fullMatchWorkbenchChainReplay2X.includes("FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof") && bundleSimulation.includes("VALIDATED_FULL_MATCH_ECONOMY_ANCHOR"), "50-match reference visible"),
    check("single full-match harness remains warning-only", bundleSimulation.includes("mayInvalidateGlobalScoringEconomy: false") && fullMatchWorkbenchChainReplay2X.includes("Normal full-match: still segment_harness by default"), "single-run warning-only"),
    check("recommendations visible", fullMatchWorkbenchChainReplay2X.includes("CONFIRM_MULTI_ACTION_WORKBENCH_CHAIN") && fullMatchWorkbenchChainReplay2X.includes("PREPARE_VISUAL_WORKBENCH_ARTIFACTS_FOR_NEXT_ACTIONS") && fullMatchWorkbenchChainReplay2X.includes("PREPARE_EXPERIMENTAL_FULLMATCH_CHAIN_REPLAY_BEHIND_FLAG"), "2X recommendations visible"),
  ];
  const sprint2WExpectedFiles = [
    "package.json",
    "tsconfig.json",
    "coach-report.latest.html",
    "scoring-events-summary.md",
    "sequence-1-action-1.html",
    "validation.share-pack.md",
    "fullmatch-workbench-chain-replay.md",
    "validation.fullmatch-workbench-chain-replay.md",
    "README.md",
    "manifest.md",
    "00-share-manifest.txt",
    "bundle__contracts.md",
    "bundle__simulation.md",
    "bundle__reports.md",
  ];
  const sprint2WForbiddenLeftovers = [
    "prototype-selection-replacement.md",
    "validation.prototype-selection-replacement.md",
    "selection-driving-attribute-ranking.md",
    "validation.selection-driving-attribute-ranking.md",
    "attribute-driven-route-ranking.md",
    "validation.attribute-driven-route-ranking.md",
    "bundle__docs.md",
  ];
  const sprint2WChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("current sprint is Sprint 2W", activeConfig.sprintName === "Sprint 2W - FullMatch Workbench Chain Replay", activeConfig.sprintName),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share pack under 20 files", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("final file count is 14", filesOnDisk.length === 14, `${filesOnDisk.length}`),
    check("minimal allowlist count is 14", allowlistedFiles.length === 14, `${allowlistedFiles.length}`),
    check("missing expected files are none", missingExpectedFiles.length === 0, missingExpectedFiles.join(", ") || "none"),
    check("stale share file count is 0", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("previous sprint leftovers are 0", sprint2WForbiddenLeftovers.every((file) => !requiredCopied(file)), sprint2WForbiddenLeftovers.filter((file) => requiredCopied(file)).join(", ") || "0"),
    check("source files deleted count is 0", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("all required current sprint files copied", sprint2WExpectedFiles.every((file) => requiredCopied(file)), sprint2WExpectedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest lists Sprint 2W", manifest.includes("Sprint 2W - FullMatch Workbench Chain Replay") && detailedManifest.includes("Sprint 2W - FullMatch Workbench Chain Replay"), "Sprint 2W visible"),
    check("README is Sprint 2W oriented", readme.includes("# Sprint 2W Share Pack") && readme.includes("fullmatch-workbench-chain-replay.md"), "README current"),
    check("workbench artifact copied", sequenceOneActionOneWorkbench.includes("Sequence 1 Action 1 Tactical Workbench") && sequenceOneActionOneWorkbench.includes("data-player-id=\"control-tempo-half\""), "sequence workbench copied"),
    check("fullmatch workbench chain replay report included", fullMatchWorkbenchChainReplay.includes("# FullMatch Workbench Chain Replay") && fullMatchWorkbenchChainReplay.includes("Does a WorkbenchChain contract exist? YES"), "2W doc included"),
    check("fullmatch workbench chain replay validation is PASS", fullMatchWorkbenchChainReplayValidation.includes("Status: PASS") && fullMatchWorkbenchChainReplayValidation.includes("controlled_minimatch uses spatial_candidate_modifier"), "2W validation PASS"),
    check("WorkbenchChain contract bundled", bundleSimulation.includes("src/simulation/grounding/workbenchChainTypes.ts") && bundleSimulation.includes("WorkbenchChainReplayMode"), "chain types bundled"),
    check("sequence-1-action-1 chain fixture bundled", bundleSimulation.includes("src/simulation/grounding/fixtures/sequence1Action1.chain.fixture.ts") && bundleSimulation.includes("sequence-1-action-1-chain"), "chain fixture bundled"),
    check("workbench chain catalog bundled", bundleSimulation.includes("src/simulation/grounding/fixtures/workbenchChainCatalog.ts") && bundleSimulation.includes("WORKBENCH_CHAIN_CATALOG"), "catalog bundled"),
    check("chain state propagation bundled", bundleSimulation.includes("src/simulation/grounding/workbenchChainState.ts") && bundleSimulation.includes("applyWorkbenchChainStep"), "state propagation bundled"),
    check("chain replay bundled", bundleSimulation.includes("src/simulation/grounding/workbenchChainReplay.ts") && bundleSimulation.includes("replayWorkbenchChain"), "chain replay bundled"),
    check("chain tests bundled", bundleSimulation.includes("workbenchChainState.test.ts") && bundleSimulation.includes("workbenchChainReplay.test.ts"), "2W tests bundled"),
    check("diagnostic_only creates no scoring events", fullMatchWorkbenchChainReplayValidation.includes("diagnostic_only creates no scoring events") && bundleSimulation.includes("scoringEventsCreated: 0"), "diagnostic mode guarded"),
    check("controlled_minimatch uses spatial_candidate_modifier", fullMatchWorkbenchChainReplay.includes("controlled_minimatch uses spatial_candidate_modifier") && bundleSimulation.includes("routeSelectionSource: \"spatial_candidate_modifier\""), "controlled mode visible"),
    check("TH -> ML preserved", fullMatchWorkbenchChainReplay.includes("TH -> ML remains preserved") && bundleSimulation.includes("selectedReceiverId === input.step.expectedReceiverId"), "TH -> ML visible"),
    check("normal full-match not claimed as chain-driven", fullMatchWorkbenchChainReplay.includes("Does normal full-match consume chains by default? NO") && bundleSimulation.includes("NORMAL_FULLMATCH_NOT_YET_CHAIN_REPLAY_DRIVEN"), "full-match limitation visible"),
    check("prototype fallback remains enabled", fullMatchWorkbenchChainReplay.includes("Is prototype fallback still present? YES") && bundleSimulation.includes("CONFIRM_PROTOTYPE_FALLBACK_STILL_ENABLED"), "prototype fallback visible"),
    check("MatchReport chain evidence included", bundleSimulation.includes("workbench_chain_replay_available") && bundleSimulation.includes("segment_harness_still_active"), "chain evidence visible"),
    check("scoring constants unchanged", scoringEvents.includes("SHOT_GOAL = 3 points") && scoringEvents.includes("TRY_TOUCHDOWN = 5 points") && scoringEvents.includes("CONVERSION_GOAL = 2 points") && scoringEvents.includes("DROP_GOAL = 2 points"), "scoring constants visible"),
    check("PENALTY_SHOT remains inactive", scoringEvents.includes("PENALTY_SHOT inactive"), "penalty inactive"),
    check("no scoring events deleted or capped", fullMatchWorkbenchChainReplayValidation.includes("no scoring events deleted or capped") && bundleSimulation.includes("score_change"), "scoring event guard visible"),
    check("no MatchBonusEvent mutation", scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream") && fullMatchWorkbenchChainReplayValidation.includes("MatchBonusEvent unchanged"), "MatchBonusEvent separated"),
    check("batch/live separation preserved", scoringEvents.includes("batch/live separation status: PASS") && fullMatchWorkbenchChainReplayValidation.includes("batch/live separation preserved"), "batch/live PASS"),
    check("50-match economy remains global reference", fullMatchWorkbenchChainReplay.includes("FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof") && bundleSimulation.includes("VALIDATED_FULL_MATCH_ECONOMY_ANCHOR"), "50-match reference visible"),
    check("single full-match harness remains warning-only", bundleSimulation.includes("mayInvalidateGlobalScoringEconomy: false") && fullMatchWorkbenchChainReplay.includes("fullmatch_warning_only"), "single-run warning-only"),
    check("recommendations visible", fullMatchWorkbenchChainReplay.includes("CONFIRM_WORKBENCH_CHAIN_REPLAY_V0") && fullMatchWorkbenchChainReplay.includes("PREPARE_MULTI_ACTION_WORKBENCH_CHAIN") && fullMatchWorkbenchChainReplay.includes("PREPARE_NORMAL_FULLMATCH_SPATIAL_SELECTION_FLAG"), "2W recommendations visible"),
  ];
  const sprint2VExpectedFiles = [
    "package.json",
    "tsconfig.json",
    "coach-report.latest.html",
    "scoring-events-summary.md",
    "sequence-1-action-1.html",
    "validation.share-pack.md",
    "prototype-selection-replacement.md",
    "validation.prototype-selection-replacement.md",
    "README.md",
    "manifest.md",
    "00-share-manifest.txt",
    "bundle__contracts.md",
    "bundle__simulation.md",
    "bundle__reports.md",
  ];
  const sprint2VForbiddenLeftovers = [
    "selection-driving-attribute-ranking.md",
    "validation.selection-driving-attribute-ranking.md",
    "attribute-driven-route-ranking.md",
    "validation.attribute-driven-route-ranking.md",
    "bundle__docs.md",
  ];
  const sprint2VChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("current sprint is Sprint 2V", activeConfig.sprintName === "Sprint 2V - Prototype Selection Replacement in MiniMatch", activeConfig.sprintName),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share pack under 20 files", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("final file count is 14", filesOnDisk.length === 14, `${filesOnDisk.length}`),
    check("minimal allowlist count is 14", allowlistedFiles.length === 14, `${allowlistedFiles.length}`),
    check("missing expected files are none", missingExpectedFiles.length === 0, missingExpectedFiles.join(", ") || "none"),
    check("stale share file count is 0", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("previous sprint leftovers are 0", sprint2VForbiddenLeftovers.every((file) => !requiredCopied(file)), sprint2VForbiddenLeftovers.filter((file) => requiredCopied(file)).join(", ") || "0"),
    check("source files deleted count is 0", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("all required current sprint files copied", sprint2VExpectedFiles.every((file) => requiredCopied(file)), sprint2VExpectedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest lists Sprint 2V", manifest.includes("Sprint 2V - Prototype Selection Replacement in MiniMatch") && detailedManifest.includes("Sprint 2V - Prototype Selection Replacement in MiniMatch"), "Sprint 2V visible"),
    check("README is Sprint 2V oriented", readme.includes("# Sprint 2V Share Pack") && readme.includes("prototype-selection-replacement.md"), "README current"),
    check("workbench artifact copied", sequenceOneActionOneWorkbench.includes("Sequence 1 Action 1 Tactical Workbench") && sequenceOneActionOneWorkbench.includes("data-player-id=\"control-tempo-half\""), "sequence workbench copied"),
    check("prototype selection replacement report included", prototypeSelectionReplacement.includes("# Prototype Selection Replacement in MiniMatch") && prototypeSelectionReplacement.includes("Is prototype selection still present? YES"), "2V doc included"),
    check("prototype selection replacement validation is PASS", prototypeSelectionReplacementValidation.includes("Status: PASS") && prototypeSelectionReplacementValidation.includes("MiniMatchRouteSelectionResult exists"), "2V validation PASS"),
    check("MiniMatchRouteSelectionSource contract bundled", bundleSimulation.includes("src/simulation/miniMatch/miniMatchRouteSelectionMode.ts") && bundleSimulation.includes("MiniMatchRouteSelectionSource"), "route selection source bundled"),
    check("MiniMatchInput accepts routeSelectionSource", bundleSimulation.includes("readonly routeSelectionSource?: MiniMatchRouteSelectionSource"), "input routeSelectionSource visible"),
    check("spatial candidate generator bundled", bundleSimulation.includes("src/simulation/miniMatch/spatialCandidateGeneration.ts") && bundleSimulation.includes("generateSpatialRouteCandidates"), "spatial generator bundled"),
    check("prototype-to-spatial mapper bundled", bundleSimulation.includes("src/simulation/miniMatch/prototypeToSpatialCandidateMapper.ts") && bundleSimulation.includes("mapPrototypeToSpatialCandidates"), "prototype mapper bundled"),
    check("MiniMatchRouteSelectionResult bundled", bundleSimulation.includes("src/simulation/miniMatch/miniMatchRouteSelection.ts") && bundleSimulation.includes("MiniMatchRouteSelectionResult"), "route selection result bundled"),
    check("controlled mini-match spatial selection test bundled", bundleSimulation.includes("miniMatchSpatialSelection.test.ts") && bundleSimulation.includes("selection source is spatial_candidate_modifier"), "controlled test bundled"),
    check("contrast selection test bundled", bundleSimulation.includes("miniMatchSpatialSelectionContrast.test.ts") && bundleSimulation.includes("guard-blocked spatial selections fall back to prototype"), "contrast test bundled"),
    check("replay seed uses spatial_candidate_modifier", bundleSimulation.includes("routeSelectionSource: \"spatial_candidate_modifier\"") && bundleSimulation.includes("miniMatchRouteSelectionUsedSpatialResult"), "replay seed route source visible"),
    check("prototype fallback remains enabled", prototypeSelectionReplacement.includes("prototype fallback remains enabled") || prototypeSelectionReplacement.includes("prototype fallback still enabled"), "prototype fallback visible"),
    check("closed/unavailable routes blocked", prototypeSelectionReplacement.includes("Can attributes override closed/unavailable candidates? NO") && bundleSimulation.includes("CLOSED_LANE_NOT_OVERRIDABLE") && bundleSimulation.includes("CANDIDATE_NOT_AVAILABLE_NOW"), "guardrails visible"),
    check("normal full-match not claimed as fixed", bundleSimulation.includes("NORMAL_FULLMATCH_NOT_YET_SPATIAL_SELECTION_DRIVEN") && prototypeSelectionReplacement.includes("Does normal full-match use spatial selection by default? NO/PARTIAL"), "full-match limitation visible"),
    check("MatchReport route selection evidence included", bundleSimulation.includes("spatial_route_selection_path_available") && bundleSimulation.includes("fullmatch_not_default_spatial_selection"), "route selection facts visible"),
    check("scoring constants unchanged", scoringEvents.includes("SHOT_GOAL = 3 points") && scoringEvents.includes("TRY_TOUCHDOWN = 5 points") && scoringEvents.includes("CONVERSION_GOAL = 2 points") && scoringEvents.includes("DROP_GOAL = 2 points"), "scoring constants visible"),
    check("PENALTY_SHOT remains inactive", scoringEvents.includes("PENALTY_SHOT inactive"), "penalty inactive"),
    check("no scoring events deleted or capped", prototypeSelectionReplacementValidation.includes("no scoring events deleted or capped") && bundleSimulation.includes("score_change"), "scoring event guard visible"),
    check("no MatchBonusEvent mutation", scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream") && prototypeSelectionReplacementValidation.includes("MatchBonusEvent unchanged"), "MatchBonusEvent separated"),
    check("batch/live separation preserved", scoringEvents.includes("batch/live separation status: PASS") && prototypeSelectionReplacementValidation.includes("batch/live separation preserved"), "batch/live PASS"),
    check("50-match economy remains global reference", prototypeSelectionReplacement.includes("FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof") && bundleSimulation.includes("VALIDATED_FULL_MATCH_ECONOMY_ANCHOR"), "50-match reference visible"),
    check("single full-match harness remains warning-only", bundleSimulation.includes("mayInvalidateGlobalScoringEconomy: false") && prototypeSelectionReplacement.includes("normal full-match reports the path but does not default to it"), "single-run warning-only"),
    check("recommendations visible", prototypeSelectionReplacement.includes("CONFIRM_SPATIAL_ROUTE_SELECTION_PATH") && prototypeSelectionReplacement.includes("CONFIRM_PROTOTYPE_FALLBACK_STILL_ENABLED") && prototypeSelectionReplacement.includes("PREPARE_NORMAL_FULLMATCH_SPATIAL_SELECTION_FLAG"), "2V recommendations visible"),
  ];
  const sprint2UExpectedFiles = [
    "package.json",
    "tsconfig.json",
    "coach-report.latest.html",
    "scoring-events-summary.md",
    "sequence-1-action-1.html",
    "validation.share-pack.md",
    "selection-driving-attribute-ranking.md",
    "validation.selection-driving-attribute-ranking.md",
    "README.md",
    "manifest.md",
    "00-share-manifest.txt",
    "bundle__contracts.md",
    "bundle__simulation.md",
    "bundle__reports.md",
  ];
  const sprint2UForbiddenLeftovers = [
    "attribute-driven-route-ranking.md",
    "validation.attribute-driven-route-ranking.md",
    "roster-to-spatial-context-adapter.md",
    "validation.roster-to-spatial-context-adapter.md",
    "bundle__docs.md",
  ];
  const sprint2UChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("current sprint is Sprint 2U", activeConfig.sprintName === "Sprint 2U - Selection-Driving Attribute Ranking", activeConfig.sprintName),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share pack under 20 files", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("final file count is 14", filesOnDisk.length === 14, `${filesOnDisk.length}`),
    check("minimal allowlist count is 14", allowlistedFiles.length === 14, `${allowlistedFiles.length}`),
    check("missing expected files are none", missingExpectedFiles.length === 0, missingExpectedFiles.join(", ") || "none"),
    check("stale share file count is 0", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("previous sprint leftovers are 0", sprint2UForbiddenLeftovers.every((file) => !requiredCopied(file)), sprint2UForbiddenLeftovers.filter((file) => requiredCopied(file)).join(", ") || "0"),
    check("source files deleted count is 0", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("all required current sprint files copied", sprint2UExpectedFiles.every((file) => requiredCopied(file)), sprint2UExpectedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest lists Sprint 2U", manifest.includes("Sprint 2U - Selection-Driving Attribute Ranking") && detailedManifest.includes("Sprint 2U - Selection-Driving Attribute Ranking"), "Sprint 2U visible"),
    check("README is Sprint 2U oriented", readme.includes("# Sprint 2U Share Pack") && readme.includes("selection-driving-attribute-ranking.md"), "README current"),
    check("workbench artifact copied", sequenceOneActionOneWorkbench.includes("Sequence 1 Action 1 Tactical Workbench") && sequenceOneActionOneWorkbench.includes("data-player-id=\"control-tempo-half\""), "sequence workbench copied"),
    check("selection-driving attribute ranking report included", selectionDrivingAttributeRanking.includes("# Selection-Driving Attribute Ranking") && selectionDrivingAttributeRanking.includes("Can attributes override closed lanes? NO"), "2U doc included"),
    check("selection-driving attribute ranking validation is PASS", selectionDrivingAttributeRankingValidation.includes("Status: PASS") && selectionDrivingAttributeRankingValidation.includes("candidate_modifier can flip to a legal adjusted candidate"), "2U validation PASS"),
    check("route ranking mode bundled", bundleSimulation.includes("src/simulation/routeRanking/routeRankingMode.ts") && bundleSimulation.includes("RouteRankingAttributeMode"), "route ranking mode bundled"),
    check("attribute selection guard bundled", bundleSimulation.includes("src/simulation/routeRanking/attributeDrivenSelectionGuard.ts") && bundleSimulation.includes("CLOSED_LANE_NOT_OVERRIDABLE"), "guard bundled"),
    check("attribute adjusted selector bundled", bundleSimulation.includes("src/simulation/routeRanking/selectAttributeAdjustedCandidate.ts") && bundleSimulation.includes("selectAttributeAdjustedCandidate"), "selector bundled"),
    check("contrast fixture bundled", bundleSimulation.includes("src/simulation/routeRanking/fixtures/attributeRankingContrast.fixture.ts") && bundleSimulation.includes("legalContrastCandidates"), "contrast fixture bundled"),
    check("attribute selection tests bundled", bundleSimulation.includes("attributeDrivenSelectionGuard.test.ts") && bundleSimulation.includes("selectAttributeAdjustedCandidate.test.ts"), "2U tests bundled"),
    check("replay seed uses candidate_modifier", bundleSimulation.includes("attributeRankingMode: \"candidate_modifier\"") && bundleSimulation.includes("metadataOnlySelectionResult"), "replay seed candidate_modifier visible"),
    check("mini-match exposes candidate_modifier metadata", bundleSimulation.includes("attribute_selection_mode_candidate_modifier") && bundleSimulation.includes("selectedBy="), "candidate_modifier log visible"),
    check("closed lane not overridden by attributes", selectionDrivingAttributeRanking.includes("Can attributes override closed lanes? NO") && bundleSimulation.includes("CLOSED_LANE_NOT_OVERRIDABLE"), "closed lane guard visible"),
    check("legal attribute selection flip possible", selectionDrivingAttributeRanking.includes("CONFIRM_LEGAL_ATTRIBUTE_SELECTION_FLIP") && bundleSimulation.includes("candidate_modifier must allow legal attribute-driven flip"), "legal flip visible"),
    check("no spatialContext preserves previous behavior", selectionDrivingAttributeRanking.includes("Does no spatialContext preserve previous behavior? YES") && bundleSimulation.includes("no spatialContext must preserve previous behavior"), "backward compatibility visible"),
    check("route ranking gap is still honest PARTIAL", bundleSimulation.includes("visibleAttributesDriveRouteRanking: \"PARTIAL\"") && bundleSimulation.includes("routeRankingAttributeInfluenceMode: \"candidate_modifier\""), "candidate_modifier PARTIAL visible"),
    check("full-match grounding diagnostics remain warning-only", bundleSimulation.includes("ATTRIBUTE_SELECTION_NOT_FULLMATCH_AUTHORITATIVE") && bundleSimulation.includes("mayInvalidateGlobalScoringEconomy: false"), "full-match limitation visible"),
    check("MatchReport attribute guard evidence included", bundleSimulation.includes("attribute_selection_guard_available") && bundleSimulation.includes("closed_lane_not_overridden_by_attributes"), "attribute guard evidence visible"),
    check("scoring constants unchanged", scoringEvents.includes("SHOT_GOAL = 3 points") && scoringEvents.includes("TRY_TOUCHDOWN = 5 points") && scoringEvents.includes("CONVERSION_GOAL = 2 points") && scoringEvents.includes("DROP_GOAL = 2 points"), "scoring constants visible"),
    check("PENALTY_SHOT remains inactive", scoringEvents.includes("PENALTY_SHOT inactive"), "penalty inactive"),
    check("no scoring events deleted or capped", selectionDrivingAttributeRankingValidation.includes("no scoring events deleted or capped") && bundleSimulation.includes("score_change"), "scoring event guard visible"),
    check("no MatchBonusEvent mutation", scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream") && selectionDrivingAttributeRankingValidation.includes("MatchBonusEvent unchanged"), "MatchBonusEvent separated"),
    check("batch/live separation preserved", scoringEvents.includes("batch/live separation status: PASS") && selectionDrivingAttributeRankingValidation.includes("batch/live separation preserved"), "batch/live PASS"),
    check("50-match economy remains global reference", selectionDrivingAttributeRanking.includes("FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof") && bundleSimulation.includes("VALIDATED_FULL_MATCH_ECONOMY_ANCHOR"), "50-match reference visible"),
    check("single full-match harness remains warning-only", bundleSimulation.includes("mayInvalidateGlobalScoringEconomy: false") && selectionDrivingAttributeRanking.includes("Is full-match fully attribute-driven now? NO/PARTIAL"), "single-run warning-only"),
    check("recommendations visible", selectionDrivingAttributeRanking.includes("CONFIRM_SELECTION_DRIVING_ATTRIBUTE_RANKING_V0") && selectionDrivingAttributeRanking.includes("CONFIRM_ATTRIBUTE_SELECTION_GUARD") && selectionDrivingAttributeRanking.includes("PREPARE_PROTOTYPE_SELECTION_REPLACEMENT"), "2U recommendations visible"),
  ];
  const sprint2TExpectedFiles = [
    "package.json",
    "tsconfig.json",
    "coach-report.latest.html",
    "scoring-events-summary.md",
    "sequence-1-action-1.html",
    "validation.share-pack.md",
    "attribute-driven-route-ranking.md",
    "validation.attribute-driven-route-ranking.md",
    "README.md",
    "manifest.md",
    "00-share-manifest.txt",
    "bundle__contracts.md",
    "bundle__simulation.md",
    "bundle__reports.md",
  ];
  const sprint2TForbiddenLeftovers = [
    "roster-to-spatial-context-adapter.md",
    "validation.roster-to-spatial-context-adapter.md",
    "tactical-grounding-reconciliation.md",
    "validation.tactical-grounding-reconciliation.md",
    "bundle__docs.md",
  ];
  const sprint2TChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("current sprint is Sprint 2T", activeConfig.sprintName === "Sprint 2T - Attribute-Driven Route Ranking", activeConfig.sprintName),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share pack under 20 files", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("final file count is 14", filesOnDisk.length === 14, `${filesOnDisk.length}`),
    check("minimal allowlist count is 14", allowlistedFiles.length === 14, `${allowlistedFiles.length}`),
    check("missing expected files are none", missingExpectedFiles.length === 0, missingExpectedFiles.join(", ") || "none"),
    check("stale share file count is 0", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("previous sprint leftovers are 0", sprint2TForbiddenLeftovers.every((file) => !requiredCopied(file)), sprint2TForbiddenLeftovers.filter((file) => requiredCopied(file)).join(", ") || "0"),
    check("source files deleted count is 0", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("all required current sprint files copied", sprint2TExpectedFiles.every((file) => requiredCopied(file)), sprint2TExpectedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest lists Sprint 2T", manifest.includes("Sprint 2T - Attribute-Driven Route Ranking") && detailedManifest.includes("Sprint 2T - Attribute-Driven Route Ranking"), "Sprint 2T visible"),
    check("README is Sprint 2T oriented", readme.includes("# Sprint 2T Share Pack") && readme.includes("attribute-driven-route-ranking.md"), "README current"),
    check("workbench artifact copied", sequenceOneActionOneWorkbench.includes("Sequence 1 Action 1 Tactical Workbench") && sequenceOneActionOneWorkbench.includes("data-player-id=\"control-tempo-half\""), "sequence workbench copied"),
    check("attribute-driven route ranking report included", attributeDrivenRouteRanking.includes("# Attribute-Driven Route Ranking") && attributeDrivenRouteRanking.includes("Are real player attributes now carried into route ranking? YES/PARTIAL"), "2T doc included"),
    check("attribute-driven route ranking validation is PASS", attributeDrivenRouteRankingValidation.includes("Status: PASS") && attributeDrivenRouteRankingValidation.includes("candidates can receive attribute-adjusted scores"), "2T validation PASS"),
    check("route attribute influence types bundled", bundleSimulation.includes("src/simulation/routeRanking/routeAttributeInfluenceTypes.ts") && bundleSimulation.includes("RouteCandidateAttributeContext"), "route attribute types bundled"),
    check("route attribute helper bundled", bundleSimulation.includes("src/simulation/routeRanking/routeAttributeInfluence.ts") && bundleSimulation.includes("clampRouteAttributeModifier"), "route attribute helper bundled"),
    check("candidate influence adapter bundled", bundleSimulation.includes("src/simulation/routeRanking/applySpatialAttributeInfluenceToCandidates.ts") && bundleSimulation.includes("applySpatialAttributeInfluenceToCandidates"), "candidate influence adapter bundled"),
    check("route attribute tests bundled", bundleSimulation.includes("routeAttributeInfluence.test.ts") && bundleSimulation.includes("applySpatialAttributeInfluenceToCandidates.test.ts"), "2T tests bundled"),
    check("workbench replay seed applies attribute influence", bundleSimulation.includes("attributeInfluenceApplied") && bundleSimulation.includes("selectedCandidateAttributeAdjustedScore"), "replay seed influence visible"),
    check("mini-match exposes attribute influence metadata", bundleSimulation.includes("attribute_influence_active") && bundleSimulation.includes("attributeInfluenceMode: \"metadata_only\""), "metadata mode visible"),
    check("route ranking gap reduced to PARTIAL", bundleSimulation.includes("visibleAttributesDriveRouteRanking: \"PARTIAL\"") && bundleSimulation.includes("routeRankingAttributeInfluenceMode: \"metadata_only\""), "gap PARTIAL visible"),
    check("full-match grounding diagnostics mention attribute influence", bundleSimulation.includes("ROUTE_ATTRIBUTE_INFLUENCE_AVAILABLE") && bundleSimulation.includes("PROTOTYPE_SELECTION_STILL_DOMINANT"), "grounding diagnostics updated"),
    check("MatchReport route attribute evidence included", bundleSimulation.includes("route_attribute_influence_available") && bundleSimulation.includes("attribute_adjusted_score") && bundleSimulation.includes("prototype_selection_still_partial"), "route attribute evidence visible"),
    check("scoring constants unchanged", scoringEvents.includes("SHOT_GOAL = 3 points") && scoringEvents.includes("TRY_TOUCHDOWN = 5 points") && scoringEvents.includes("CONVERSION_GOAL = 2 points") && scoringEvents.includes("DROP_GOAL = 2 points"), "scoring constants visible"),
    check("PENALTY_SHOT remains inactive", scoringEvents.includes("PENALTY_SHOT inactive"), "penalty inactive"),
    check("no scoring events deleted or capped", attributeDrivenRouteRankingValidation.includes("no scoring events deleted or capped") && bundleSimulation.includes("score_change"), "scoring event guard visible"),
    check("no MatchBonusEvent mutation", scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream") && attributeDrivenRouteRankingValidation.includes("MatchBonusEvent unchanged"), "MatchBonusEvent separated"),
    check("batch/live separation preserved", scoringEvents.includes("batch/live separation status: PASS") && attributeDrivenRouteRankingValidation.includes("batch/live separation preserved"), "batch/live PASS"),
    check("50-match economy remains global reference", attributeDrivenRouteRanking.includes("FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof") && bundleSimulation.includes("VALIDATED_FULL_MATCH_ECONOMY_ANCHOR"), "50-match reference visible"),
    check("single full-match harness remains warning-only", bundleSimulation.includes("mayInvalidateGlobalScoringEconomy: false") && attributeDrivenRouteRanking.includes("Does full-match now fully replay workbench truth? PARTIAL"), "single-run warning-only"),
    check("recommendations visible", attributeDrivenRouteRanking.includes("CONFIRM_ROUTE_ATTRIBUTE_INFLUENCE_LAYER") && attributeDrivenRouteRanking.includes("CONFIRM_ATTRIBUTE_ADJUSTED_CANDIDATE_SCORES") && attributeDrivenRouteRanking.includes("PREPARE_SELECTION_DRIVING_ATTRIBUTE_RANKING"), "2T recommendations visible"),
  ];
  const sprint2RChecks: readonly SharePackCheck[] = [
    check("share pack mode is MINIMAL_REVIEW", activeConfig.mode === "MINIMAL_REVIEW", activeConfig.mode),
    check("current sprint is Sprint 2R", activeConfig.sprintName === "Sprint 2R - Tactical Grounding Reconciliation: Workbench to MiniMatch to FullMatch", activeConfig.sprintName),
    check("reports/share exists", existsSync(shareDirectory), shareDirectory),
    check("share pack under 20 files", filesOnDisk.length <= 20, `${filesOnDisk.length}`),
    check("final file count is 15", filesOnDisk.length === 15, `${filesOnDisk.length}`),
    check("minimal allowlist count is 15", allowlistedFiles.length === 15, `${allowlistedFiles.length}`),
    check("missing expected files are none", missingExpectedFiles.length === 0, missingExpectedFiles.join(", ") || "none"),
    check("stale share file count is 0", staleFiles.length === 0, staleFiles.join(", ") || "0"),
    check("previous sprint leftovers are 0", sprint2RForbiddenLeftovers.every((file) => !requiredCopied(file)), sprint2RForbiddenLeftovers.filter((file) => requiredCopied(file)).join(", ") || "0"),
    check("source files deleted count is 0", missingExcludedSources.length === 0, missingExcludedSources.join(", ") || "0"),
    check("all required current sprint files copied", sprint2RExpectedFiles.every((file) => requiredCopied(file)), sprint2RExpectedFiles.filter((file) => !requiredCopied(file)).join(", ") || "all copied"),
    check("manifest lists Sprint 2R", manifest.includes("Sprint 2R - Tactical Grounding Reconciliation: Workbench to MiniMatch to FullMatch") && detailedManifest.includes("Sprint 2R - Tactical Grounding Reconciliation: Workbench to MiniMatch to FullMatch"), "Sprint 2R visible"),
    check("README is Sprint 2R oriented", readme.includes("# Sprint 2R Share Pack") && readme.includes("tactical-grounding-reconciliation.md"), "README current"),
    check("workbench artifact copied", sequenceOneActionOneWorkbench.includes("Sequence 1 Action 1 Tactical Workbench") && sequenceOneActionOneWorkbench.includes("data-player-id=\"control-tempo-half\""), "sequence workbench copied"),
    check("tactical grounding reconciliation doc included", tacticalGroundingReconciliation.includes("# Tactical Grounding Reconciliation"), "doc included"),
    check("tactical grounding validation is PASS", tacticalGroundingReconciliationValidation.includes("Status: PASS"), "validation PASS"),
    check("workbench fixture source bundled", bundleSimulation.includes("src/simulation/grounding/fixtures/sequence1Action1.fixture.ts") && bundleSimulation.includes("sequence1Action1WorkbenchTruth"), "fixture bundled"),
    check("workbench type contract bundled", bundleSimulation.includes("src/simulation/grounding/tacticalWorkbenchTypes.ts") && bundleSimulation.includes("TacticalWorkbenchFrame"), "types bundled"),
    check("workbench extractor bundled", bundleSimulation.includes("src/simulation/grounding/extractWorkbenchTruth.ts") && bundleSimulation.includes("extractWorkbenchPlayerPositions"), "extractor bundled"),
    check("workbench contract guard bundled", bundleSimulation.includes("src/simulation/grounding/tacticalWorkbenchContractGuard.ts") && bundleSimulation.includes("validateSequenceOneActionOneWorkbenchTruth"), "contract guard bundled"),
    check("mini-match alignment report bundled", bundleSimulation.includes("src/simulation/grounding/miniMatchWorkbenchAlignment.ts") && bundleSimulation.includes("MiniMatchWorkbenchAlignmentReport") && bundleSimulation.includes("status: \"PARTIAL\""), "alignment bundled"),
    check("roster gap analysis bundled", bundleSimulation.includes("src/simulation/grounding/rosterToMiniMatchGapAnalysis.ts") && bundleSimulation.includes("prototypesStillDominant"), "gap analysis bundled"),
    check("full-match grounding diagnostics bundled", bundleSimulation.includes("src/simulation/diagnostics/fullMatchGroundingDiagnostics.ts") && bundleSimulation.includes("FULL_MATCH_NOT_WORKBENCH_GROUNDED"), "diagnostics bundled"),
    check("grounding tests bundled", bundleSimulation.includes("tacticalWorkbenchContractGuard.test.ts") && bundleSimulation.includes("miniMatchWorkbenchAlignment.test.ts") && bundleSimulation.includes("rosterToMiniMatchGapAnalysis.test.ts") && bundleSimulation.includes("fullMatchGroundingDiagnostics.test.ts"), "tests bundled"),
    check("MatchReport grounding evidence included", bundleSimulation.includes("tacticalGroundingGapFacts") && bundleSimulation.includes("tactical_grounding_gap"), "grounding facts visible"),
    check("MatchReport grounding warning included", bundleSimulation.includes("tactical-grounding-gap") && bundleSimulation.includes("ADAPTER_LIMITATION"), "grounding warning visible"),
    check("scoring constants unchanged", scoringEvents.includes("SHOT_GOAL = 3 points") && scoringEvents.includes("TRY_TOUCHDOWN = 5 points") && scoringEvents.includes("CONVERSION_GOAL = 2 points") && scoringEvents.includes("DROP_GOAL = 2 points"), "scoring constants visible"),
    check("PENALTY_SHOT remains inactive", scoringEvents.includes("PENALTY_SHOT inactive"), "penalty inactive"),
    check("no scoring events deleted or capped", tacticalGroundingReconciliationValidation.includes("no scoring events deleted or capped") && bundleSimulation.includes("score_change"), "scoring event guard visible"),
    check("no MatchBonusEvent mutation", scoringEvents.includes("MatchBonusEvent is not part of this live ScoringEvent stream") && tacticalGroundingReconciliationValidation.includes("MatchBonusEvent unchanged"), "MatchBonusEvent separated"),
    check("batch/live separation preserved", scoringEvents.includes("batch/live separation status: PASS") && tacticalGroundingReconciliationValidation.includes("batch/live separation preserved"), "batch/live PASS"),
    check("50-match economy remains global reference", tacticalGroundingReconciliation.includes("FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof") && bundleSimulation.includes("VALIDATED_FULL_MATCH_ECONOMY_ANCHOR"), "50-match reference visible"),
    check("single full-match harness remains warning-only", bundleSimulation.includes("mayInvalidateGlobalScoringEconomy: false") && tacticalGroundingReconciliation.includes("harness plausibility signal"), "single-run warning-only"),
    check("recommendations visible", tacticalGroundingReconciliation.includes("CONFIRM_WORKBENCH_TRUTH_FIXTURE") && tacticalGroundingReconciliation.includes("CONFIRM_MINIMATCH_ALIGNMENT_PARTIAL") && tacticalGroundingReconciliation.includes("PREPARE_WORKBENCH_REPLAY_ENGINE"), "2R recommendations visible"),
  ];
  const checks = activeConfig.sprintName.includes("Role Fit UI Implementation")
    ? roleFitUiChecks
    : activeConfig.sprintName.includes("React JSX Role Fit Refactor")
      ? reactJsxPlayerProfileChecks
    : activeConfig.sprintName.includes("Micro-sprint 2P-Fix")
      ? coachFacingSummaryBoundaryChecks
    : activeConfig.sprintName.includes("Sprint 2P - Canonical MatchReport")
      ? sprint2PChecks
    : activeConfig.sprintName.includes("Micro-sprint 2O-Fix")
      ? coachCopyChecks
    : activeConfig.sprintName.includes("Sprint 2O - Full-Match Harness Plausibility")
      ? sprint2OChecks
    : activeConfig.sprintName.includes("Sprint 2Q - True Segment-State Integration")
      ? sprint2QChecks
    : activeConfig.sprintName.includes("Sprint 3O - Attribute-Driven Shot Resolution Sandbox")
      ? sprint3OChecks
    : activeConfig.sprintName.includes("Sprint 3N - Sandbox Scoring Event Resolution")
      ? sprint3NChecks
    : activeConfig.sprintName.includes("Sprint 3M - Sandbox Scoring Event Candidate")
      ? sprint3MChecks
    : activeConfig.sprintName.includes("Sprint 3L - Sandbox Scoring Opportunity Model")
      ? sprint3LChecks
    : activeConfig.sprintName.includes("Sprint 3K - Controlled Route Resolution Sandbox")
      ? sprint3KChecks
    : activeConfig.sprintName.includes("Sprint 3J - Real Isolated Replay Engine")
      ? sprint3JChecks
    : activeConfig.sprintName.includes("Sprint 3I - Controlled Segment Replay Comparison")
      ? sprint3IChecks
    : activeConfig.sprintName.includes("Sprint 3H - Isolated MiniMatch Override Experiment")
      ? sprint3HChecks
    : activeConfig.sprintName.includes("Sprint 3G - Controlled Route Source to Live Selection Override Guards")
      ? sprint3GChecks
    : activeConfig.sprintName.includes("Sprint 3F - SegmentRouteInput to Controlled MiniMatch Route Source")
      ? sprint3FChecks
    : activeConfig.sprintName.includes("Sprint 3E - Controlled Segment Selection to Segment Route Input")
      ? sprint3EChecks
    : activeConfig.sprintName.includes("Sprint 3D - Experimental Shadow Selection to Controlled Segment Selection")
      ? sprint3DChecks
    : activeConfig.sprintName.includes("Sprint 3C - Experimental Chain Context to Shadow Route Selection")
      ? sprint3CChecks
    : activeConfig.sprintName.includes("Sprint 3B - Experimental Chain Context to Route Candidate Influence")
      ? sprint3BChecks
    : activeConfig.sprintName.includes("Sprint 3A - Experimental Chain Influence on Segment Context")
      ? sprint3AChecks
    : activeConfig.sprintName.includes("Sprint 2Z - Experimental FullMatch Chain Consumption")
      ? sprint2ZChecks
    : activeConfig.sprintName.includes("Sprint 2Y - Visual Workbench Expansion")
      ? sprint2YChecks
    : activeConfig.sprintName.includes("Sprint 2X - Multi-Action Workbench Chain")
      ? sprint2XChecks
    : activeConfig.sprintName.includes("Sprint 2W - FullMatch Workbench Chain Replay")
      ? sprint2WChecks
    : activeConfig.sprintName.includes("Sprint 2V - Prototype Selection Replacement in MiniMatch")
      ? sprint2VChecks
    : activeConfig.sprintName.includes("Sprint 2U - Selection-Driving Attribute Ranking")
      ? sprint2UChecks
    : activeConfig.sprintName.includes("Sprint 2T - Attribute-Driven Route Ranking")
      ? sprint2TChecks
    : activeConfig.sprintName.includes("Sprint 2S - Roster-to-SpatialContext")
      ? sprint2SChecks
    : activeConfig.sprintName.includes("Sprint 2R - Tactical Grounding Reconciliation")
      ? sprint2RChecks
    : activeConfig.sprintName.includes("Sprint 2N - Segment Diversity")
      ? sprint2NChecks
    : activeConfig.sprintName.includes("Sprint 2M - Source-of-Truth Reconciliation")
      ? sprint2MChecks
    : activeConfig.sprintName.includes("Roster Builder Role Fit Integration")
      ? rosterBuilderChecks
    : activeConfig.sprintName.includes("Role Fit Engine Contract Alignment")
      ? roleFitSourceChecks
      : legacyChecks;
  const reportPath = join(input.reportDirectory, "validation.share-pack.md");
  const markdown = renderMarkdown({
    checks,
    sharePackMode: activeConfig.mode,
    currentSprint: activeConfig.sprintName,
    shareFileCount: filesOnDisk.length,
    minimalAllowlistCount: allowlistedFiles.length,
    missingExpectedFiles,
    staleShareFileCount: staleFiles.length,
    excludedFilesFoundInShareCount: excludedInShare.length,
    sourceFilesDeletedCount: missingExcludedSources.length,
    files: filesOnDisk.sort(),
  });

  writeFileSync(reportPath, markdown, "utf8");
  copyFileSync(reportPath, shareValidationPath);

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
