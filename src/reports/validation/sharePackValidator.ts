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
  const coachHtml = readIfExists(join(shareDirectory, "coach-report.latest.html"));
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
  const mojibakeFragments = ["Ãƒ", "Ã‚", "Ã¢â‚¬", "[object Object]"];
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
  const checks = activeConfig.sprintName.includes("Role Fit UI Implementation")
    ? roleFitUiChecks
    : activeConfig.sprintName.includes("React JSX Role Fit Refactor")
      ? reactJsxPlayerProfileChecks
    : activeConfig.sprintName.includes("Micro-sprint 2O-Fix")
      ? coachCopyChecks
    : activeConfig.sprintName.includes("Sprint 2O - Full-Match Harness Plausibility")
      ? sprint2OChecks
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
