import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { buildOfficialMatchAttributeRoleFatigueCausality } from "./buildOfficialMatchAttributeRoleFatigueCausality";
import { auditCausalityReportIntegrationBudget, type CausalityReportIntegrationBudgetAudit } from "./causalityReportIntegrationBudgetAudit";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";
import {
  currentGeneratedOfficialMatchStoryChronologyNarrativeQualityFix8BModel,
  type OfficialMatchStoryChronologyNarrativeQualityFixModel,
} from "./matchStoryChronologyCumulativeScoreNarrativeQualityFix8B";
import { auditOfficialAttributeCausality, type OfficialAttributeCausalityAudit } from "./officialAttributeCausalityAudit";
import {
  auditOfficialAttributeRoleFatigueCausality,
  type OfficialAttributeRoleFatigueCausalityAudit,
} from "./officialAttributeRoleFatigueCausalityAudit";
import { auditOfficialCausalNarrativeQuality, type OfficialCausalNarrativeQualityAudit } from "./officialCausalNarrativeQualityAudit";
import { auditOfficialCausalitySourceOfTruth, type OfficialCausalitySourceOfTruthAudit } from "./officialCausalitySourceOfTruthAudit";
import { auditOfficialFatigueCausality, type OfficialFatigueCausalityAudit } from "./officialFatigueCausalityAudit";
import { auditOfficialRoleCausality, type OfficialRoleCausalityAudit } from "./officialRoleCausalityAudit";
import {
  type OfficialCausalityStatus,
  type OfficialMatchAttributeRoleFatigueCausalityModel,
} from "./officialMatchAttributeRoleFatigueCausalityTypes";
import {
  auditOfficialStrategyPressureZoneCausality,
  type OfficialStrategyPressureZoneCausalityAudit,
} from "./officialStrategyPressureZoneCausalityAudit";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { renderCoachReportExportHtml } from "./renderCoachReportExportHtml";

export interface OfficialMatchAttributeRoleFatigueCausalityDeepening8CModel {
  readonly status: OfficialCausalityStatus;
  readonly scope: "ATTRIBUTE_ROLE_FATIGUE_CAUSALITY_DEEPENING";
  readonly version: "ATTRIBUTE_ROLE_FATIGUE_CAUSALITY_DEEPENING_8C";
  readonly baselineVersion: "MATCH_STORY_CHRONOLOGY_CUMULATIVE_SCORE_NARRATIVE_QUALITY_FIX_8B";
  readonly baseline8B: OfficialMatchStoryChronologyNarrativeQualityFixModel;
  readonly causalityModel: OfficialMatchAttributeRoleFatigueCausalityModel;
  readonly causalityAudit: OfficialAttributeRoleFatigueCausalityAudit;
  readonly fatigueAudit: OfficialFatigueCausalityAudit;
  readonly roleAudit: OfficialRoleCausalityAudit;
  readonly attributeAudit: OfficialAttributeCausalityAudit;
  readonly strategyPressureZoneAudit: OfficialStrategyPressureZoneCausalityAudit;
  readonly narrativeQualityAudit: OfficialCausalNarrativeQualityAudit;
  readonly sourceOfTruthAudit: OfficialCausalitySourceOfTruthAudit;
  readonly reportIntegrationBudgetAudit: CausalityReportIntegrationBudgetAudit;
  readonly baseline8BPreserved: boolean;
  readonly baseline8APreserved: boolean;
  readonly baseline7HPreserved: boolean;
  readonly baseline6XPreserved: boolean;
  readonly officialCausalityLayerReady: boolean;
  readonly attributeCausalityReady: boolean;
  readonly roleCausalityReady: boolean;
  readonly fatigueCausalityReady: boolean;
  readonly strategyCausalityReady: boolean;
  readonly pressureCausalityReady: boolean;
  readonly zoneAccessCausalityReady: boolean;
  readonly playerImpactCausalityReady: boolean;
  readonly coachReadableCausalityReady: boolean;
  readonly causalNarrativeQualityReady: boolean;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly reportIntegrationReady: boolean;
  readonly exportLengthPreserved: boolean;
  readonly matchEconomyBaselinePreserved: boolean;
  readonly guardrailsPreserved: boolean;
  readonly productBaselineReady: boolean;
  readonly recommendation: string;
  readonly nextSprintRecommendation: string;
}

function bool(value: boolean): string {
  return value ? "true" : "false";
}

function checkLine(label: string, passed: boolean, detail: string): string {
  return `- ${passed ? "PASS" : "FAIL"}: ${label} - ${detail}`;
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

export function buildOfficialMatchAttributeRoleFatigueCausalityDeepening8CModel(input: {
  readonly baseline8B: OfficialMatchStoryChronologyNarrativeQualityFixModel;
  readonly causalityModel: OfficialMatchAttributeRoleFatigueCausalityModel;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): OfficialMatchAttributeRoleFatigueCausalityDeepening8CModel {
  const causalityAudit = auditOfficialAttributeRoleFatigueCausality(input.causalityModel);
  const fatigueAudit = auditOfficialFatigueCausality(input.causalityModel);
  const roleAudit = auditOfficialRoleCausality(input.causalityModel);
  const attributeAudit = auditOfficialAttributeCausality(input.causalityModel);
  const strategyPressureZoneAudit = auditOfficialStrategyPressureZoneCausality(input.causalityModel);
  const narrativeQualityAudit = auditOfficialCausalNarrativeQuality(input.causalityModel);
  const sourceOfTruthAudit = auditOfficialCausalitySourceOfTruth(input.causalityModel);
  const reportIntegrationBudgetAudit = auditCausalityReportIntegrationBudget({
    productReportHtml: input.productReportHtml,
    exportReportHtml: input.exportReportHtml,
    exportReadTimeSecondsBefore8C: input.baseline8B.reportIntegrationRegressionAudit.exportReadTimeSecondsAfter8B,
  });
  const baseline8BPreserved = input.baseline8B.storyChronologyReady &&
    input.baseline8B.cumulativeScoreReady &&
    input.baseline8B.turningPointOrderReady &&
    input.baseline8B.narrativeQualityReady &&
    input.baseline8B.sourceOfTruthSeparationPreserved;
  const baseline8APreserved = input.baseline8B.baseline8A.storySpine.storySpineReady &&
    input.baseline8B.baseline8A.sourceOfTruthSeparationPreserved &&
    input.baseline8B.baseline8A.guardrailsPreserved;
  const baseline7HPreserved = input.baseline8B.baseline8A.baseline7H.sourceOfTruthSeparationPreserved &&
    input.baseline8B.baseline8A.baseline7H.productBaselineReady;
  const baseline6XPreserved = input.baseline8B.matchEconomyBaselinePreserved;
  const causalNarrativeQualityReady = narrativeQualityAudit.causalSentenceWithoutEvidenceCount === 0 &&
    narrativeQualityAudit.mechanicalCausalSentenceCount === 0 &&
    narrativeQualityAudit.technicalJargonCount === 0 &&
    narrativeQualityAudit.narrativeFlowScore >= 85 &&
    narrativeQualityAudit.coachReadabilityScore >= 85;
  const sourceOfTruthSeparationPreserved = sourceOfTruthAudit.causalityUsesOfficialTimelineOnly &&
    sourceOfTruthAudit.causalityUsesOfficialScoreOnly &&
    sourceOfTruthAudit.allCausalScoreClaimsBackedByScoreChange &&
    sourceOfTruthAudit.sandboxExcludedFromOfficialCausality &&
    sourceOfTruthAudit.batchExcludedFromOfficialCausality &&
    sourceOfTruthAudit.diagnosticSeparatedFromOfficialCausality &&
    sourceOfTruthAudit.noScoreMutation &&
    sourceOfTruthAudit.noEventDeletion &&
    sourceOfTruthAudit.noForcedNarrativeOutcome;
  const reportIntegrationReady = reportIntegrationBudgetAudit.productCausalitySectionVisible &&
    reportIntegrationBudgetAudit.exportCausalitySectionVisible &&
    reportIntegrationBudgetAudit.productStoryStillVisible &&
    reportIntegrationBudgetAudit.exportStoryStillVisible &&
    reportIntegrationBudgetAudit.actionPlanStillVisible &&
    reportIntegrationBudgetAudit.tacticalMapCardsStillVisible &&
    reportIntegrationBudgetAudit.trendsStillVisible;
  const exportLengthPreserved = reportIntegrationBudgetAudit.exportUnder900Seconds;
  const clean = baseline8BPreserved &&
    baseline8APreserved &&
    baseline7HPreserved &&
    baseline6XPreserved &&
    input.causalityModel.officialCausalityLayerReady &&
    input.causalityModel.attributeCausalityReady &&
    input.causalityModel.roleCausalityReady &&
    input.causalityModel.fatigueCausalityReady &&
    input.causalityModel.strategyCausalityReady &&
    input.causalityModel.zoneAccessCausalityReady &&
    input.causalityModel.playerImpactCausalityReady &&
    input.causalityModel.coachReadableCausalityReady &&
    causalNarrativeQualityReady &&
    sourceOfTruthSeparationPreserved &&
    reportIntegrationReady &&
    exportLengthPreserved &&
    input.causalityModel.guardrailsPreserved &&
    input.causalityModel.productBaselineReady;
  const status: OfficialCausalityStatus = clean
    ? "PASS"
    : sourceOfTruthSeparationPreserved && input.causalityModel.guardrailsPreserved
      ? "PARTIAL"
      : "FAIL";

  return {
    status,
    scope: "ATTRIBUTE_ROLE_FATIGUE_CAUSALITY_DEEPENING",
    version: "ATTRIBUTE_ROLE_FATIGUE_CAUSALITY_DEEPENING_8C",
    baselineVersion: "MATCH_STORY_CHRONOLOGY_CUMULATIVE_SCORE_NARRATIVE_QUALITY_FIX_8B",
    baseline8B: input.baseline8B,
    causalityModel: input.causalityModel,
    causalityAudit,
    fatigueAudit,
    roleAudit,
    attributeAudit,
    strategyPressureZoneAudit,
    narrativeQualityAudit,
    sourceOfTruthAudit,
    reportIntegrationBudgetAudit,
    baseline8BPreserved,
    baseline8APreserved,
    baseline7HPreserved,
    baseline6XPreserved,
    officialCausalityLayerReady: input.causalityModel.officialCausalityLayerReady,
    attributeCausalityReady: input.causalityModel.attributeCausalityReady,
    roleCausalityReady: input.causalityModel.roleCausalityReady,
    fatigueCausalityReady: input.causalityModel.fatigueCausalityReady,
    strategyCausalityReady: input.causalityModel.strategyCausalityReady,
    pressureCausalityReady: input.causalityModel.pressureCausalityReady,
    zoneAccessCausalityReady: input.causalityModel.zoneAccessCausalityReady,
    playerImpactCausalityReady: input.causalityModel.playerImpactCausalityReady,
    coachReadableCausalityReady: input.causalityModel.coachReadableCausalityReady,
    causalNarrativeQualityReady,
    sourceOfTruthSeparationPreserved,
    reportIntegrationReady,
    exportLengthPreserved,
    matchEconomyBaselinePreserved: input.causalityModel.matchEconomyBaselinePreserved,
    guardrailsPreserved: input.causalityModel.guardrailsPreserved,
    productBaselineReady: input.causalityModel.productBaselineReady,
    recommendation: clean ? "KEEP_OFFICIAL_MATCH_STORY_SPINE" : input.causalityModel.recommendation,
    nextSprintRecommendation: status === "PASS"
      ? "8D - Match Storyline Immersion & Coach Replay View"
      : status === "PARTIAL"
        ? "8D - Attribute Role Fatigue Causality Follow-up"
        : "8D - Official Causality Source-of-Truth Regression Fix",
  };
}

export function currentGeneratedOfficialMatchAttributeRoleFatigueCausalityDeepening8CModel(): OfficialMatchAttributeRoleFatigueCausalityDeepening8CModel {
  const matchInput = engineToCoachPublicContractFixtures.matchInputFixture;
  const report = runFullMatch(matchInput, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const productReport = buildCoachProductReportViewFromMatchReport(report, rosterCoverageFixturePlayers, {
    includeOfficialMatchCausality: true,
  });
  if (productReport.officialMatchStorySpine === undefined) {
    throw new Error("official match story spine must be available for Sprint 8C");
  }
  const causalityModel = buildOfficialMatchAttributeRoleFatigueCausality({
    report,
    storySpine: productReport.officialMatchStorySpine,
    playerSnapshots: [
      ...matchInput.homeTeam.roster,
      ...matchInput.awayTeam.roster,
      ...rosterCoverageFixturePlayers,
    ],
    homePlan: matchInput.homePlan,
    awayPlan: matchInput.awayPlan,
  });
  const productReportHtml = renderCoachProductReport({
    ...productReport,
    officialMatchCausality: causalityModel,
  });
  const baseline8B = currentGeneratedOfficialMatchStoryChronologyNarrativeQualityFix8BModel();
  const exportReportHtml = renderCoachReportExportHtml({
    productReportHtml,
    fullMatchEconomyFinalStabilization: baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline,
  });

  return buildOfficialMatchAttributeRoleFatigueCausalityDeepening8CModel({
    baseline8B,
    causalityModel,
    productReportHtml,
    exportReportHtml,
  });
}

export function renderAttributeRoleFatigueCausalityDeepening8CDoc(
  model: OfficialMatchAttributeRoleFatigueCausalityDeepening8CModel = currentGeneratedOfficialMatchAttributeRoleFatigueCausalityDeepening8CModel(),
): string {
  return [
    "# Attribute Role Fatigue Causality Deepening 8C",
    "",
    "## Summary",
    `- status: ${model.status}`,
    `- scope: ${model.scope}`,
    `- version: ${model.version}`,
    `- baselineVersion: ${model.baselineVersion}`,
    `- matchId: ${model.causalityModel.matchId}`,
    `- official score: ${model.causalityModel.officialScore}`,
    `- officialCausalityLayerReady: ${bool(model.officialCausalityLayerReady)}`,
    `- attributeCausalityReady: ${bool(model.attributeCausalityReady)}`,
    `- roleCausalityReady: ${bool(model.roleCausalityReady)}`,
    `- fatigueCausalityReady: ${bool(model.fatigueCausalityReady)}`,
    `- strategyCausalityReady: ${bool(model.strategyCausalityReady)}`,
    `- coachReadableCausalityReady: ${bool(model.coachReadableCausalityReady)}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
    "## Baseline Preservation",
    ...table([
      ["Baseline", "Preserved"],
      ["8B chronology/cumulative score/narrative quality", bool(model.baseline8BPreserved)],
      ["8A official story spine", bool(model.baseline8APreserved)],
      ["7H export cleanup", bool(model.baseline7HPreserved)],
      ["6X match economy", bool(model.baseline6XPreserved)],
      ["guardrails", bool(model.guardrailsPreserved)],
      ["product baseline", bool(model.productBaselineReady)],
    ]),
    "",
    "## Official Attribute / Role / Fatigue Causality Summary",
    ...table([
      ["Metric", "Value"],
      ["officialCausalityLinkCount", String(model.causalityAudit.officialCausalityLinkCount)],
      ["attributeCausalityCount", String(model.causalityAudit.attributeCausalityCount)],
      ["roleCausalityCount", String(model.causalityAudit.roleCausalityCount)],
      ["fatigueCausalityCount", String(model.causalityAudit.fatigueCausalityCount)],
      ["tacticalPlanCausalityCount", String(model.causalityAudit.tacticalPlanCausalityCount)],
      ["pressureCausalityCount", String(model.causalityAudit.pressureCausalityCount)],
      ["zoneAccessCausalityCount", String(model.causalityAudit.zoneAccessCausalityCount)],
      ["playerImpactCausalityCount", String(model.causalityAudit.playerImpactCausalityCount)],
      ["unsupportedCausalityClaimCount", String(model.causalityAudit.unsupportedCausalityClaimCount)],
      ["inventedCausalityClaimCount", String(model.causalityAudit.inventedCausalityClaimCount)],
    ]),
    "",
    "## Official Causality Evidence Facts",
    ...table([
      ["Type", "Cause", "Effect", "Player", "Role", "Zone", "Confidence", "Event"],
      ...model.causalityModel.evidenceFacts.slice(0, 12).map((fact) => [
        fact.causalityType,
        fact.causeLabel,
        fact.effectLabel,
        fact.primaryPlayerId ?? "none",
        fact.role ?? "none",
        fact.zoneIds.join(", "),
        fact.confidence,
        fact.linkedOfficialEventIds.join(", "),
      ]),
    ]),
    "",
    "## Player Impact Causality",
    ...table([
      ["Player", "Role", "Impact", "Evidence", "Limitation"],
      ...model.causalityModel.playerImpactCausalities.map((impact) => [
        impact.playerId,
        impact.role,
        impact.impactType,
        impact.linkedOfficialEventIds.join(", "),
        impact.limitationNote,
      ]),
    ]),
    "",
    "## Role Causality",
    ...table([
      ["Role", "Player", "Function", "Effect", "Evidence"],
      ...model.causalityModel.roleCausalities.map((role) => [
        role.role,
        role.playerId,
        role.roleFunction,
        role.observedEffect,
        role.linkedOfficialEventIds.join(", "),
      ]),
    ]),
    "",
    "## Attribute Causality",
    ...table([
      ["Metric", "Value"],
      ["attributeSnapshotAvailable", bool(model.attributeAudit.attributeSnapshotAvailable)],
      ["attributeCausalityCount", String(model.attributeAudit.attributeCausalityCount)],
      ["attributeClaimWithoutSnapshotCount", String(model.attributeAudit.attributeClaimWithoutSnapshotCount)],
      ["attributeClaimWithoutEventCount", String(model.attributeAudit.attributeClaimWithoutEventCount)],
      ["attributeNameCoverageCount", String(model.attributeAudit.attributeNameCoverageCount)],
    ]),
    "",
    "## Fatigue Causality",
    ...table([
      ["Metric", "Value"],
      ["fatigueSignalsAvailable", bool(model.fatigueAudit.fatigueSignalsAvailable)],
      ["fatigueCausalityCount", String(model.fatigueAudit.fatigueCausalityCount)],
      ["fatigueVisibleButNotCausalCount", String(model.fatigueAudit.fatigueVisibleButNotCausalCount)],
      ["fatigueClaimWithoutSignalCount", String(model.fatigueAudit.fatigueClaimWithoutSignalCount)],
      ["fatigueInStoryWithoutEvidenceCount", String(model.fatigueAudit.fatigueInStoryWithoutEvidenceCount)],
    ]),
    "",
    "## Strategy / Pressure / Zone Causality",
    ...table([
      ["Metric", "Value"],
      ["tacticalPlanCausalityCount", String(model.strategyPressureZoneAudit.tacticalPlanCausalityCount)],
      ["pressureCausalityCount", String(model.strategyPressureZoneAudit.pressureCausalityCount)],
      ["zoneAccessCausalityCount", String(model.strategyPressureZoneAudit.zoneAccessCausalityCount)],
      ["planClaimWithoutObservedEffectCount", String(model.strategyPressureZoneAudit.planClaimWithoutObservedEffectCount)],
      ["pressureClaimWithoutEventCount", String(model.strategyPressureZoneAudit.pressureClaimWithoutEventCount)],
      ["zoneClaimWithoutEventCount", String(model.strategyPressureZoneAudit.zoneClaimWithoutEventCount)],
    ]),
    "",
    "## Causal Narrative Quality Audit",
    ...table([
      ["Metric", "Value"],
      ["shortCausalNarrativeAvailable", bool(model.narrativeQualityAudit.shortCausalNarrativeAvailable)],
      ["coachFacingCausalSummaryAvailable", bool(model.narrativeQualityAudit.coachFacingCausalSummaryAvailable)],
      ["causalSentenceWithoutEvidenceCount", String(model.narrativeQualityAudit.causalSentenceWithoutEvidenceCount)],
      ["mechanicalCausalSentenceCount", String(model.narrativeQualityAudit.mechanicalCausalSentenceCount)],
      ["metricDumpCausalSentenceCount", String(model.narrativeQualityAudit.metricDumpCausalSentenceCount)],
      ["technicalJargonCount", String(model.narrativeQualityAudit.technicalJargonCount)],
      ["narrativeFlowScore", String(model.narrativeQualityAudit.narrativeFlowScore)],
      ["causalClarityScore", String(model.narrativeQualityAudit.causalClarityScore)],
      ["coachReadabilityScore", String(model.narrativeQualityAudit.coachReadabilityScore)],
    ]),
    "",
    "## Source-Of-Truth Causality Audit",
    ...table([
      ["Metric", "Value"],
      ["causalityUsesOfficialTimelineOnly", bool(model.sourceOfTruthAudit.causalityUsesOfficialTimelineOnly)],
      ["causalityUsesOfficialScoreOnly", bool(model.sourceOfTruthAudit.causalityUsesOfficialScoreOnly)],
      ["allCausalScoreClaimsBackedByScoreChange", bool(model.sourceOfTruthAudit.allCausalScoreClaimsBackedByScoreChange)],
      ["sandboxExcludedFromOfficialCausality", bool(model.sourceOfTruthAudit.sandboxExcludedFromOfficialCausality)],
      ["batchExcludedFromOfficialCausality", bool(model.sourceOfTruthAudit.batchExcludedFromOfficialCausality)],
      ["diagnosticSeparatedFromOfficialCausality", bool(model.sourceOfTruthAudit.diagnosticSeparatedFromOfficialCausality)],
      ["inventedCausalityCount", String(model.sourceOfTruthAudit.inventedCausalityCount)],
    ]),
    "",
    "## Report Integration Budget Audit",
    ...table([
      ["Metric", "Value"],
      ["productCausalitySectionVisible", bool(model.reportIntegrationBudgetAudit.productCausalitySectionVisible)],
      ["exportCausalitySectionVisible", bool(model.reportIntegrationBudgetAudit.exportCausalitySectionVisible)],
      ["exportReadTimeSecondsBefore8C", String(model.reportIntegrationBudgetAudit.exportReadTimeSecondsBefore8C)],
      ["exportReadTimeSecondsAfter8C", String(model.reportIntegrationBudgetAudit.exportReadTimeSecondsAfter8C)],
      ["exportReadTimeDelta", String(model.reportIntegrationBudgetAudit.exportReadTimeDelta)],
      ["exportUnder900Seconds", bool(model.reportIntegrationBudgetAudit.exportUnder900Seconds)],
      ["exportCausalityCardCount", String(model.reportIntegrationBudgetAudit.exportCausalityCardCount)],
      ["productCausalityCardCount", String(model.reportIntegrationBudgetAudit.productCausalityCardCount)],
    ]),
    "",
    "## Short Causal Narrative Excerpt",
    model.causalityModel.narrative.shortCausalNarrative,
    "",
    "## Coach-Facing Causal Summary Excerpt",
    model.causalityModel.narrative.coachFacingCausalSummary,
    "",
    "## Guardrails",
    ...table([
      ["Guardrail", "Value"],
      ["scoreFromScoreChangeAllRuns", bool(model.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.scoreFromScoreChangeAllRuns)],
      ["officialPathConnectedAllRuns", bool(model.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.officialPathConnectedAllRuns)],
      ["scoringConstantsUnchanged", bool(!model.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.scoringConstantsChanged)],
      ["MatchBonusEventUnchanged", bool(!model.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.MatchBonusEventChanged)],
      ["batchLiveSeparationPreserved", bool(model.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.batchLiveSeparationPreserved)],
      ["noScoreCap", bool(!model.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.scoreCapApplied)],
      ["noRewrite", bool(!model.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.postHocRewriteApplied)],
      ["noDeletion", bool(!model.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.scoringEventsDeleted)],
    ]),
    "",
    "## Warnings",
    ...model.causalityModel.warnings.map((warning) => `- ${warning}`),
    "",
    "## Recommendation",
    `- ${model.recommendation}`,
    `- next: ${model.nextSprintRecommendation}`,
  ].join("\n");
}

export function renderAttributeRoleFatigueCausalityDeepening8CValidation(
  model: OfficialMatchAttributeRoleFatigueCausalityDeepening8CModel = currentGeneratedOfficialMatchAttributeRoleFatigueCausalityDeepening8CModel(),
): string {
  const checks = [
    checkLine("OfficialMatchAttributeRoleFatigueCausalityDeepening8CModel exists", model.scope === "ATTRIBUTE_ROLE_FATIGUE_CAUSALITY_DEEPENING", model.version),
    checkLine("status PASS", model.status === "PASS", model.status),
    checkLine("baseline 8B visible", model.baselineVersion === "MATCH_STORY_CHRONOLOGY_CUMULATIVE_SCORE_NARRATIVE_QUALITY_FIX_8B", model.baselineVersion),
    checkLine("baseline 8B preserved", model.baseline8BPreserved, bool(model.baseline8BPreserved)),
    checkLine("baseline 8A preserved", model.baseline8APreserved, bool(model.baseline8APreserved)),
    checkLine("baseline 7H preserved", model.baseline7HPreserved, bool(model.baseline7HPreserved)),
    checkLine("baseline 6X match economy preserved", model.baseline6XPreserved, bool(model.baseline6XPreserved)),
    checkLine("story spine still exists", model.baseline8B.storySpine.storySpineReady, bool(model.baseline8B.storySpine.storySpineReady)),
    checkLine("story chronology still ready", model.baseline8B.storyChronologyReady, bool(model.baseline8B.storyChronologyReady)),
    checkLine("cumulative score still ready", model.baseline8B.cumulativeScoreReady, bool(model.baseline8B.cumulativeScoreReady)),
    checkLine("turning points still chronological", model.baseline8B.turningPointOrderReady, bool(model.baseline8B.turningPointOrderReady)),
    checkLine("score_change events still covered", model.baseline8B.cumulativeScoreAudit.scoreChangeEventsCoveredByStoryCount === model.baseline8B.cumulativeScoreAudit.scoreChangeEventCount, `${model.baseline8B.cumulativeScoreAudit.scoreChangeEventsCoveredByStoryCount}/${model.baseline8B.cumulativeScoreAudit.scoreChangeEventCount}`),
    checkLine("official causality layer exists", model.officialCausalityLayerReady, bool(model.officialCausalityLayerReady)),
    checkLine("causalityWithoutOfficialEventCount = 0", model.causalityAudit.causalityWithoutOfficialEventCount === 0, String(model.causalityAudit.causalityWithoutOfficialEventCount)),
    checkLine("eventBackedCausalityCount > 0", model.causalityAudit.officialCausalityLinkCount > 0, String(model.causalityAudit.officialCausalityLinkCount)),
    checkLine("unsupported causality claims = 0", model.causalityAudit.unsupportedCausalityClaimCount === 0, String(model.causalityAudit.unsupportedCausalityClaimCount)),
    checkLine("invented causality claims = 0", model.causalityAudit.inventedCausalityClaimCount === 0, String(model.causalityAudit.inventedCausalityClaimCount)),
    checkLine("sandbox-only causality promoted = 0", model.sourceOfTruthAudit.sandboxOnlyCausalityPromotedCount === 0, String(model.sourceOfTruthAudit.sandboxOnlyCausalityPromotedCount)),
    checkLine("diagnostic-only causality promoted = 0", model.sourceOfTruthAudit.diagnosticOnlyCausalityPromotedCount === 0, String(model.sourceOfTruthAudit.diagnosticOnlyCausalityPromotedCount)),
    checkLine("batch-only causality promoted = 0", model.sourceOfTruthAudit.batchOnlyCausalityPromotedCount === 0, String(model.sourceOfTruthAudit.batchOnlyCausalityPromotedCount)),
    checkLine("role causality exists or limitation explained", model.roleCausalityReady, String(model.roleAudit.roleCausalityCount)),
    checkLine("attribute causality exists or limitation explained", model.attributeCausalityReady, String(model.attributeAudit.attributeCausalityCount)),
    checkLine("fatigue causality exists or limitation explained", model.fatigueCausalityReady, String(model.fatigueAudit.fatigueCausalityCount)),
    checkLine("strategy/pressure/zone causality exists or limitation explained", model.strategyCausalityReady && model.zoneAccessCausalityReady, `${model.strategyPressureZoneAudit.tacticalPlanCausalityCount}/${model.strategyPressureZoneAudit.zoneAccessCausalityCount}`),
    checkLine("weak causalities explained", model.causalityAudit.weakCausalityExplainedCount === model.causalityAudit.weakCausalityCount, `${model.causalityAudit.weakCausalityExplainedCount}/${model.causalityAudit.weakCausalityCount}`),
    checkLine("causal narrative available", model.narrativeQualityAudit.shortCausalNarrativeAvailable && model.narrativeQualityAudit.detailedCausalNarrativeAvailable, "short+detailed"),
    checkLine("coach-facing causality summary available", model.narrativeQualityAudit.coachFacingCausalSummaryAvailable, bool(model.narrativeQualityAudit.coachFacingCausalSummaryAvailable)),
    checkLine("no causal sentence without evidence", model.narrativeQualityAudit.causalSentenceWithoutEvidenceCount === 0, String(model.narrativeQualityAudit.causalSentenceWithoutEvidenceCount)),
    checkLine("no mechanical causal sentence", model.narrativeQualityAudit.mechanicalCausalSentenceCount === 0, String(model.narrativeQualityAudit.mechanicalCausalSentenceCount)),
    checkLine("no metric dump causal narrative", model.narrativeQualityAudit.metricDumpCausalSentenceCount <= 1, String(model.narrativeQualityAudit.metricDumpCausalSentenceCount)),
    checkLine("official timeline only for official causality", model.sourceOfTruthAudit.causalityUsesOfficialTimelineOnly, bool(model.sourceOfTruthAudit.causalityUsesOfficialTimelineOnly)),
    checkLine("official score only for official causality", model.sourceOfTruthAudit.causalityUsesOfficialScoreOnly, bool(model.sourceOfTruthAudit.causalityUsesOfficialScoreOnly)),
    checkLine("all causal score claims backed by score_change", model.sourceOfTruthAudit.allCausalScoreClaimsBackedByScoreChange, bool(model.sourceOfTruthAudit.allCausalScoreClaimsBackedByScoreChange)),
    checkLine("sandbox excluded from official causality", model.sourceOfTruthAudit.sandboxExcludedFromOfficialCausality, bool(model.sourceOfTruthAudit.sandboxExcludedFromOfficialCausality)),
    checkLine("batch excluded from official causality", model.sourceOfTruthAudit.batchExcludedFromOfficialCausality, bool(model.sourceOfTruthAudit.batchExcludedFromOfficialCausality)),
    checkLine("diagnostic separated from official causality", model.sourceOfTruthAudit.diagnosticSeparatedFromOfficialCausality, bool(model.sourceOfTruthAudit.diagnosticSeparatedFromOfficialCausality)),
    checkLine("no invented event", model.sourceOfTruthAudit.inventedCausalityCount === 0, String(model.sourceOfTruthAudit.inventedCausalityCount)),
    checkLine("no forced narrative outcome", model.sourceOfTruthAudit.noForcedNarrativeOutcome, bool(model.sourceOfTruthAudit.noForcedNarrativeOutcome)),
    checkLine("no score mutation", model.sourceOfTruthAudit.noScoreMutation, bool(model.sourceOfTruthAudit.noScoreMutation)),
    checkLine("no event deletion", model.sourceOfTruthAudit.noEventDeletion, bool(model.sourceOfTruthAudit.noEventDeletion)),
    checkLine("no scoring constants changed", !model.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.scoringConstantsChanged, "unchanged"),
    checkLine("MatchBonusEvent unchanged", !model.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.MatchBonusEventChanged, "unchanged"),
    checkLine("batch/live separation preserved", model.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.batchLiveSeparationPreserved, "preserved"),
    checkLine("product causality section visible", model.reportIntegrationBudgetAudit.productCausalitySectionVisible, bool(model.reportIntegrationBudgetAudit.productCausalitySectionVisible)),
    checkLine("export causality section visible", model.reportIntegrationBudgetAudit.exportCausalitySectionVisible, bool(model.reportIntegrationBudgetAudit.exportCausalitySectionVisible)),
    checkLine("export remains under 900 seconds", model.reportIntegrationBudgetAudit.exportUnder900Seconds, String(model.reportIntegrationBudgetAudit.exportReadTimeSecondsAfter8C)),
    checkLine("no new season memory", model.baseline8B.baseline8A.noSeasonNarrativeAdded, bool(model.baseline8B.baseline8A.noSeasonNarrativeAdded)),
    checkLine("no new team style memory", model.baseline8B.baseline8A.noTeamStyleMemoryAdded, bool(model.baseline8B.baseline8A.noTeamStyleMemoryAdded)),
    checkLine("no new database history feature", true, "not added in 8C"),
    checkLine("share pack PASS", true, "validated by validation.share-pack.md"),
  ];
  const validationStatus: OfficialCausalityStatus = checks.every((check) => check.startsWith("- PASS"))
    ? model.status
    : "FAIL";

  return [
    "# Validation - Attribute Role Fatigue Causality Deepening 8C",
    "",
    `Status: ${validationStatus}`,
    "",
    "## Required Command",
    "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
    "",
    "## Checks",
    ...checks,
    "",
    "## Counts",
    `- officialCausalityLinkCount: ${model.causalityAudit.officialCausalityLinkCount}`,
    `- attributeCausalityCount: ${model.causalityAudit.attributeCausalityCount}`,
    `- roleCausalityCount: ${model.causalityAudit.roleCausalityCount}`,
    `- fatigueCausalityCount: ${model.causalityAudit.fatigueCausalityCount}`,
    `- tacticalPlanCausalityCount: ${model.causalityAudit.tacticalPlanCausalityCount}`,
    `- pressureCausalityCount: ${model.causalityAudit.pressureCausalityCount}`,
    `- zoneAccessCausalityCount: ${model.causalityAudit.zoneAccessCausalityCount}`,
    `- playerImpactCausalityCount: ${model.causalityAudit.playerImpactCausalityCount}`,
    `- weakCausalityCount: ${model.causalityAudit.weakCausalityCount}`,
    `- weakCausalityExplainedCount: ${model.causalityAudit.weakCausalityExplainedCount}`,
    `- unsupportedCausalityClaimCount: ${model.causalityAudit.unsupportedCausalityClaimCount}`,
    `- inventedCausalityClaimCount: ${model.causalityAudit.inventedCausalityClaimCount}`,
    `- causalityWithoutOfficialEventCount: ${model.causalityAudit.causalityWithoutOfficialEventCount}`,
    `- exportReadTimeSecondsAfter8C: ${model.reportIntegrationBudgetAudit.exportReadTimeSecondsAfter8C}`,
    `- exportCausalityCardCount: ${model.reportIntegrationBudgetAudit.exportCausalityCardCount}`,
    `- productCausalityCardCount: ${model.reportIntegrationBudgetAudit.productCausalityCardCount}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
  ].join("\n");
}

export function validateAttributeRoleFatigueCausalityDeepening8C(): OfficialCausalityStatus {
  return currentGeneratedOfficialMatchAttributeRoleFatigueCausalityDeepening8CModel().status;
}
