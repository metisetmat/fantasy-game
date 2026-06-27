import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import {
  currentGeneratedCoachReportExportLengthTrendCountCleanup7HModel,
  type CoachReportExportLengthTrendCountCleanupModel,
} from "./coachReportExportLengthTrendCountCleanup7H";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";
import { auditEngineCausalityProof, type EngineCausalityProofAudit } from "./engineCausalityProofAudit";
import { auditMatchStoryReadability, type MatchStoryReadabilityAudit } from "./matchStoryReadabilityAudit";
import { auditOfficialMatchStorySpine, type OfficialMatchStorySpineAudit } from "./officialMatchStorySpineAudit";
import { auditOfficialStorySourceOfTruth, type OfficialStorySourceOfTruthAudit } from "./officialStorySourceOfTruthAudit";
import type { OfficialMatchStorySpineModel } from "./officialMatchStorySpineTypes";
import { auditReportConsumptionReadiness, type ReportConsumptionReadinessAudit } from "./reportConsumptionReadinessAudit";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { renderCoachReportExportHtml } from "./renderCoachReportExportHtml";

export type OfficialMatchStorySpineEngineCausalityProof8AStatus = "PASS" | "PARTIAL" | "FAIL";
export type OfficialMatchStorySpineEngineCausalityProof8ARecommendation =
  | "KEEP_OFFICIAL_MATCH_STORY_SPINE"
  | "DEEPEN_ENGINE_CAUSALITY_PROOF"
  | "FIX_OFFICIAL_STORY_SOURCE_OF_TRUTH"
  | "FIX_REPORT_INTEGRATION";

export interface OfficialMatchStorySpineEngineCausalityProof8AModel {
  readonly status: OfficialMatchStorySpineEngineCausalityProof8AStatus;
  readonly scope: "OFFICIAL_MATCH_STORY_SPINE_ENGINE_CAUSALITY_PROOF";
  readonly version: "OFFICIAL_MATCH_STORY_SPINE_ENGINE_CAUSALITY_PROOF_8A";
  readonly baselineVersion: "COACH_REPORT_EXPORT_LENGTH_TREND_COUNT_CLEANUP_7H";
  readonly matchId: string;
  readonly officialScore: string;
  readonly storySpine: OfficialMatchStorySpineModel;
  readonly baseline7H: CoachReportExportLengthTrendCountCleanupModel;
  readonly storySpineAudit: OfficialMatchStorySpineAudit;
  readonly engineCausalityProofAudit: EngineCausalityProofAudit;
  readonly officialStorySourceOfTruthAudit: OfficialStorySourceOfTruthAudit;
  readonly matchStoryReadabilityAudit: MatchStoryReadabilityAudit;
  readonly reportConsumptionReadinessAudit: ReportConsumptionReadinessAudit;
  readonly productStorySectionVisible: boolean;
  readonly exportStorySectionVisible: boolean;
  readonly exportCompactStoryVisible: boolean;
  readonly exportReadTimeSecondsAfter8A: number;
  readonly matchEconomyBaselinePreserved: boolean;
  readonly guardrailsPreserved: boolean;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly productBaselineReady: boolean;
  readonly noNewScoringFeatureAdded: boolean;
  readonly noSeasonNarrativeAdded: boolean;
  readonly noTeamStyleMemoryAdded: boolean;
  readonly warningCodes: readonly string[];
  readonly recommendation: OfficialMatchStorySpineEngineCausalityProof8ARecommendation;
  readonly nextSprintRecommendation: string;
}

function bool(value: boolean): string {
  return value ? "true" : "false";
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

function checkLine(label: string, passed: boolean, detail: string): string {
  return `- ${passed ? "PASS" : "FAIL"}: ${label} - ${detail}`;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/giu, " ")
    .replace(/<style\b[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/&nbsp;/giu, " ")
    .replace(/&eacute;/giu, "e")
    .replace(/&egrave;/giu, "e")
    .replace(/&agrave;/giu, "a")
    .replace(/&ccedil;/giu, "c")
    .replace(/&[a-z0-9#]+;/giu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function readTimeSeconds(html: string): number {
  const appendicesIndex = html.search(/<section\s+id="appendices"[^>]*>/iu);
  const mainHtml = appendicesIndex === -1 ? html : html.slice(0, appendicesIndex);
  const wordCount = stripHtml(mainHtml).split(/\s+/u).filter((word) => word.length > 0).length;

  return Math.ceil((wordCount / 180) * 60);
}

function deriveWarningCodes(model: Omit<OfficialMatchStorySpineEngineCausalityProof8AModel, "warningCodes">): readonly string[] {
  return [
    ...model.storySpine.warningCodes,
    ...model.storySpineAudit.storySpineWarningCodes,
    ...model.engineCausalityProofAudit.causalityCoverageWarningCodes,
    ...model.officialStorySourceOfTruthAudit.sourceOfTruthWarningCodes,
    ...model.matchStoryReadabilityAudit.readabilityWarningCodes,
    ...model.reportConsumptionReadinessAudit.reportConsumptionWarningCodes,
    ...(model.productStorySectionVisible ? ["PRODUCT_STORY_SECTION_READY"] : ["PRODUCT_STORY_SECTION_MISSING"]),
    ...(model.exportStorySectionVisible && model.exportCompactStoryVisible ? ["EXPORT_STORY_SECTION_READY"] : ["EXPORT_STORY_SECTION_MISSING"]),
    ...(model.exportReadTimeSecondsAfter8A <= 1100 ? ["EXPORT_LENGTH_READY"] : ["EXPORT_TOO_LONG"]),
    ...(model.matchEconomyBaselinePreserved ? ["MATCH_ECONOMY_BASELINE_PRESERVED"] : ["MATCH_ECONOMY_BASELINE_REGRESSED"]),
    ...(model.guardrailsPreserved ? ["GUARDRAILS_PRESERVED"] : ["GUARDRAILS_REGRESSED"]),
    ...(model.sourceOfTruthSeparationPreserved ? ["SOURCE_OF_TRUTH_PRESERVED"] : ["SOURCE_OF_TRUTH_AMBIGUOUS"]),
    ...(model.noNewScoringFeatureAdded ? ["NO_NEW_SCORING_FEATURE_ADDED"] : ["NEW_SCORING_FEATURE_ADDED"]),
    ...(model.noSeasonNarrativeAdded && model.noTeamStyleMemoryAdded ? ["NO_PREMATURE_SEASON_LAYER"] : ["PREMATURE_NARRATIVE_LAYER"]),
    ...(model.status === "PASS" ? ["OFFICIAL_MATCH_STORY_SPINE_ENGINE_CAUSALITY_PROOF_COMPLETE"] : model.status === "PARTIAL" ? ["OFFICIAL_MATCH_STORY_SPINE_ENGINE_CAUSALITY_PROOF_PARTIAL"] : ["OFFICIAL_MATCH_STORY_SPINE_ENGINE_CAUSALITY_PROOF_FAIL"]),
  ];
}

export function buildOfficialMatchStorySpineEngineCausalityProof8AModel(input: {
  readonly baseline7H: CoachReportExportLengthTrendCountCleanupModel;
  readonly storySpine: OfficialMatchStorySpineModel;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
  readonly storySpineAudit: OfficialMatchStorySpineAudit;
  readonly engineCausalityProofAudit: EngineCausalityProofAudit;
  readonly officialStorySourceOfTruthAudit: OfficialStorySourceOfTruthAudit;
  readonly matchStoryReadabilityAudit: MatchStoryReadabilityAudit;
  readonly reportConsumptionReadinessAudit: ReportConsumptionReadinessAudit;
}): OfficialMatchStorySpineEngineCausalityProof8AModel {
  const productStorySectionVisible = input.productReportHtml.includes('id="official-match-story-spine"') &&
    input.productReportHtml.includes("R&eacute;cit officiel du match");
  const exportStorySectionVisible = input.exportReportHtml.includes('id="official-match-story-spine"');
  const exportCompactStoryVisible = input.exportReportHtml.includes("R&eacute;cit du match en 45 secondes") ||
    input.exportReportHtml.includes("Recit du match en 45 secondes");
  const exportReadTimeSecondsAfter8A = readTimeSeconds(input.exportReportHtml);
  const matchEconomyBaselinePreserved = input.baseline7H.matchEconomyBaselinePreserved &&
    input.baseline7H.baseline7G.matchEconomyBaseline.status === "PASS" &&
    input.baseline7H.baseline7G.matchEconomyBaseline.routeFamilyDiversityPreserved &&
    input.baseline7H.baseline7G.matchEconomyBaseline.noRollbackToShotOnly &&
    !input.baseline7H.baseline7G.matchEconomyBaseline.scoringConstantsChanged &&
    !input.baseline7H.baseline7G.matchEconomyBaseline.MatchBonusEventChanged;
  const guardrailsPreserved = input.storySpine.guardrailsPreserved &&
    input.baseline7H.sourceOfTruthSeparationPreserved &&
    input.baseline7H.baseline7G.matchEconomyBaseline.batchLiveSeparationPreserved &&
    !input.baseline7H.baseline7G.matchEconomyBaseline.postHocRewriteApplied &&
    !input.baseline7H.baseline7G.matchEconomyBaseline.scoringEventsDeleted;
  const sourceOfTruthSeparationPreserved = input.storySpine.sourceOfTruthSeparationPreserved &&
    input.officialStorySourceOfTruthAudit.storyUsesOfficialTimelineOnly &&
    input.officialStorySourceOfTruthAudit.storyUsesOfficialScoreOnly &&
    input.officialStorySourceOfTruthAudit.allStoryScoreClaimsBackedByScoreChange &&
    input.officialStorySourceOfTruthAudit.sandboxExcludedFromOfficialStory &&
    input.officialStorySourceOfTruthAudit.batchExcludedFromOfficialStory;
  const noNewScoringFeatureAdded = !input.baseline7H.noNewLayerAudit.newScoringFeatureAdded;
  const noSeasonNarrativeAdded = !input.baseline7H.noNewLayerAudit.seasonNarrativeAdded &&
    !input.productReportHtml.includes("season narrative") &&
    !input.exportReportHtml.includes("season narrative");
  const noTeamStyleMemoryAdded = !input.baseline7H.noNewLayerAudit.teamStyleMemoryAdded &&
    !input.productReportHtml.includes("team style memory") &&
    !input.exportReportHtml.includes("team style memory");
  const productBaselineReady = input.baseline7H.productBaselineReady && input.baseline7H.productReportReady;
  const clean = input.storySpine.status === "PASS" &&
    input.baseline7H.status === "PASS" &&
    input.storySpineAudit.storySpineExists &&
    input.storySpineAudit.scoreChangeEventsCoveredByStoryCount === input.storySpineAudit.scoreChangeEventCount &&
    input.storySpineAudit.unsupportedNarrativeClaimCount === 0 &&
    input.storySpineAudit.unsupportedCausalityClaimCount === 0 &&
    input.engineCausalityProofAudit.unsupportedCausalityClaimCount === 0 &&
    input.engineCausalityProofAudit.officialCausalityLinkCount >= 3 &&
    input.officialStorySourceOfTruthAudit.unsupportedTruthClaimCount === 0 &&
    input.matchStoryReadabilityAudit.narrativeFlowScore >= 75 &&
    input.reportConsumptionReadinessAudit.storySpineCanBeRenderedInProductReport &&
    input.reportConsumptionReadinessAudit.storySpineCanBeRenderedInExport &&
    productStorySectionVisible &&
    exportStorySectionVisible &&
    exportCompactStoryVisible &&
    exportReadTimeSecondsAfter8A <= 1100 &&
    matchEconomyBaselinePreserved &&
    guardrailsPreserved &&
    sourceOfTruthSeparationPreserved &&
    productBaselineReady &&
    noNewScoringFeatureAdded &&
    noSeasonNarrativeAdded &&
    noTeamStyleMemoryAdded;
  const status: OfficialMatchStorySpineEngineCausalityProof8AStatus = clean
    ? "PASS"
    : input.storySpine.status === "FAIL" || !sourceOfTruthSeparationPreserved
      ? "FAIL"
      : "PARTIAL";
  const recommendation: OfficialMatchStorySpineEngineCausalityProof8ARecommendation = clean
    ? "KEEP_OFFICIAL_MATCH_STORY_SPINE"
    : !sourceOfTruthSeparationPreserved
      ? "FIX_OFFICIAL_STORY_SOURCE_OF_TRUTH"
      : !productStorySectionVisible || !exportStorySectionVisible
        ? "FIX_REPORT_INTEGRATION"
        : "DEEPEN_ENGINE_CAUSALITY_PROOF";
  const modelWithoutWarnings: Omit<OfficialMatchStorySpineEngineCausalityProof8AModel, "warningCodes"> = {
    status,
    scope: "OFFICIAL_MATCH_STORY_SPINE_ENGINE_CAUSALITY_PROOF",
    version: "OFFICIAL_MATCH_STORY_SPINE_ENGINE_CAUSALITY_PROOF_8A",
    baselineVersion: "COACH_REPORT_EXPORT_LENGTH_TREND_COUNT_CLEANUP_7H",
    matchId: input.storySpine.matchId,
    officialScore: input.storySpine.officialScore,
    storySpine: input.storySpine,
    baseline7H: input.baseline7H,
    storySpineAudit: input.storySpineAudit,
    engineCausalityProofAudit: input.engineCausalityProofAudit,
    officialStorySourceOfTruthAudit: input.officialStorySourceOfTruthAudit,
    matchStoryReadabilityAudit: input.matchStoryReadabilityAudit,
    reportConsumptionReadinessAudit: input.reportConsumptionReadinessAudit,
    productStorySectionVisible,
    exportStorySectionVisible,
    exportCompactStoryVisible,
    exportReadTimeSecondsAfter8A,
    matchEconomyBaselinePreserved,
    guardrailsPreserved,
    sourceOfTruthSeparationPreserved,
    productBaselineReady,
    noNewScoringFeatureAdded,
    noSeasonNarrativeAdded,
    noTeamStyleMemoryAdded,
    recommendation,
    nextSprintRecommendation: status === "PASS"
      ? "8B - Attribute Role Fatigue Causality Deepening"
      : "8B - Official Match Story Spine Follow-up",
  };

  return {
    ...modelWithoutWarnings,
    warningCodes: [...new Set(deriveWarningCodes(modelWithoutWarnings))],
  };
}

export function currentGeneratedOfficialMatchStorySpineEngineCausalityProof8AModel(): OfficialMatchStorySpineEngineCausalityProof8AModel {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const productReport = buildCoachProductReportViewFromMatchReport(report, rosterCoverageFixturePlayers);
  const storySpine = productReport.officialMatchStorySpine;
  if (storySpine === undefined) {
    throw new Error("official match story spine must be present in product report model");
  }
  const productReportHtml = renderCoachProductReport(productReport);
  const baseline7H = currentGeneratedCoachReportExportLengthTrendCountCleanup7HModel();
  const exportReportHtml = renderCoachReportExportHtml({
    productReportHtml,
    fullMatchEconomyFinalStabilization: baseline7H.baseline7G.matchEconomyBaseline,
  });
  const storySpineAudit = auditOfficialMatchStorySpine(storySpine, report);
  const engineCausalityProofAudit = auditEngineCausalityProof(storySpine);
  const officialStorySourceOfTruthAudit = auditOfficialStorySourceOfTruth(storySpine, report);
  const matchStoryReadabilityAudit = auditMatchStoryReadability(storySpine);
  const reportConsumptionReadinessAudit = auditReportConsumptionReadiness(storySpine, {
    productReportHtml,
    exportReportHtml,
  });

  return buildOfficialMatchStorySpineEngineCausalityProof8AModel({
    baseline7H,
    storySpine,
    productReportHtml,
    exportReportHtml,
    storySpineAudit,
    engineCausalityProofAudit,
    officialStorySourceOfTruthAudit,
    matchStoryReadabilityAudit,
    reportConsumptionReadinessAudit,
  });
}

export function renderOfficialMatchStorySpineEngineCausalityProof8ADoc(
  model: OfficialMatchStorySpineEngineCausalityProof8AModel = currentGeneratedOfficialMatchStorySpineEngineCausalityProof8AModel(),
): string {
  return [
    "# Official Match Story Spine & Engine Causality Proof 8A",
    "",
    "## Summary",
    `- status: ${model.status}`,
    `- scope: ${model.scope}`,
    `- version: ${model.version}`,
    `- baselineVersion: ${model.baselineVersion}`,
    `- matchId: ${model.matchId}`,
    `- official score: ${model.officialScore}`,
    `- storySpineReady: ${bool(model.storySpine.storySpineReady)}`,
    `- engineCausalityReady: ${bool(model.storySpine.engineCausalityReady)}`,
    `- sourceOfTruthSeparationPreserved: ${bool(model.sourceOfTruthSeparationPreserved)}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
    "## Official Match Story Spine",
    ...table([
      ["Metric", "Value"],
      ["story segments", String(model.storySpineAudit.storySegmentCount)],
      ["story beats", String(model.storySpineAudit.storyBeatCount)],
      ["turning points", String(model.storySpineAudit.turningPointCount)],
      ["causality links", String(model.storySpineAudit.causalityLinkCount)],
      ["score changes covered", `${model.storySpineAudit.scoreChangeEventsCoveredByStoryCount}/${model.storySpineAudit.scoreChangeEventCount}`],
      ["official event reference coverage", `${model.storySpineAudit.officialEventReferenceCoverage}%`],
      ["unsupported narrative claims", String(model.storySpineAudit.unsupportedNarrativeClaimCount)],
    ]),
    "",
    "## Story Segments",
    ...table([
      ["Segment", "Minutes", "Phase", "Score", "Meaning"],
      ...model.storySpine.segments.map((segment) => [
        segment.title,
        `${segment.startMinute}-${segment.endMinute}`,
        segment.phaseType,
        segment.scoreAfter,
        segment.coachMeaning,
      ]),
    ]),
    "",
    "## Turning Points",
    ...table([
      ["Minute", "Type", "Title", "Why it turned"],
      ...model.storySpine.turningPoints.map((turningPoint) => [
        String(turningPoint.minute),
        turningPoint.turningPointType,
        turningPoint.title,
        turningPoint.whyItTurned,
      ]),
    ]),
    "",
    "## Engine Causality Proof",
    ...table([
      ["Metric", "Value"],
      ["official causality links", String(model.engineCausalityProofAudit.officialCausalityLinkCount)],
      ["pressure causality", String(model.engineCausalityProofAudit.pressureCausalityCount)],
      ["zone access causality", String(model.engineCausalityProofAudit.zoneAccessCausalityCount)],
      ["fatigue causality", String(model.engineCausalityProofAudit.fatigueCausalityCount)],
      ["goalkeeper causality", String(model.engineCausalityProofAudit.goalkeeperCausalityCount)],
      ["unsupported causality claims", String(model.engineCausalityProofAudit.unsupportedCausalityClaimCount)],
      ["sandbox-only causality claims", String(model.engineCausalityProofAudit.sandboxOnlyCausalityInOfficialStoryCount)],
    ]),
    "",
    "## Source Of Truth Audit",
    ...table([
      ["Metric", "Value"],
      ["story uses official timeline only", bool(model.officialStorySourceOfTruthAudit.storyUsesOfficialTimelineOnly)],
      ["story uses official score only", bool(model.officialStorySourceOfTruthAudit.storyUsesOfficialScoreOnly)],
      ["story score matches official score", bool(model.officialStorySourceOfTruthAudit.storyScoreMatchesOfficialScore)],
      ["all score claims backed by score_change", bool(model.officialStorySourceOfTruthAudit.allStoryScoreClaimsBackedByScoreChange)],
      ["sandbox excluded", bool(model.officialStorySourceOfTruthAudit.sandboxExcludedFromOfficialStory)],
      ["batch excluded", bool(model.officialStorySourceOfTruthAudit.batchExcludedFromOfficialStory)],
      ["unsupported truth claims", String(model.officialStorySourceOfTruthAudit.unsupportedTruthClaimCount)],
    ]),
    "",
    "## Report Consumption Readiness",
    ...table([
      ["Metric", "Value"],
      ["product story section visible", bool(model.productStorySectionVisible)],
      ["export story section visible", bool(model.exportStorySectionVisible)],
      ["export compact story visible", bool(model.exportCompactStoryVisible)],
      ["export read time seconds after 8A", String(model.exportReadTimeSecondsAfter8A)],
      ["story spine serializable", bool(model.reportConsumptionReadinessAudit.storySpineSerializable)],
      ["stable ids", bool(model.reportConsumptionReadinessAudit.storySpineHasStableIds)],
      ["event links", bool(model.reportConsumptionReadinessAudit.storySpineHasEventLinks)],
    ]),
    "",
    "## Baseline Preservation",
    ...table([
      ["Guardrail", "Value"],
      ["7H baseline status", model.baseline7H.status],
      ["6X match economy preserved", bool(model.matchEconomyBaselinePreserved)],
      ["guardrails preserved", bool(model.guardrailsPreserved)],
      ["product baseline ready", bool(model.productBaselineReady)],
      ["no new scoring feature", bool(model.noNewScoringFeatureAdded)],
      ["no season narrative", bool(model.noSeasonNarrativeAdded)],
      ["no team style memory", bool(model.noTeamStyleMemoryAdded)],
    ]),
    "",
    "## Narrative",
    `- short: ${model.storySpine.narrative.shortNarrative}`,
    `- coach-facing: ${model.storySpine.narrative.coachFacingNarrative}`,
    `- source note: ${model.storySpine.narrative.sourceOfTruthNote}`,
    "",
    "## Warning Codes",
    ...model.warningCodes.map((warning) => `- ${warning}`),
    "",
    "## Recommendation",
    `- ${model.recommendation}`,
    `- next: ${model.nextSprintRecommendation}`,
  ].join("\n");
}

export function renderOfficialMatchStorySpineEngineCausalityProof8AValidation(
  model: OfficialMatchStorySpineEngineCausalityProof8AModel = currentGeneratedOfficialMatchStorySpineEngineCausalityProof8AModel(),
): string {
  const checks = [
    checkLine("OfficialMatchStorySpineModel exists", model.storySpine.scope === "OFFICIAL_MATCH_STORY_SPINE_ENGINE_CAUSALITY_PROOF", model.storySpine.version),
    checkLine("status PASS", model.status === "PASS", model.status),
    checkLine("baseline 7H preserved", model.baseline7H.status === "PASS", model.baseline7H.status),
    checkLine("baseline 6X match economy preserved", model.matchEconomyBaselinePreserved, bool(model.matchEconomyBaselinePreserved)),
    checkLine("story spine segments are 4-8", model.storySpineAudit.storySegmentCount >= 4 && model.storySpineAudit.storySegmentCount <= 8, String(model.storySpineAudit.storySegmentCount)),
    checkLine("story beats exist", model.storySpineAudit.storyBeatCount >= 8, String(model.storySpineAudit.storyBeatCount)),
    checkLine("turning points are 2-4", model.storySpineAudit.turningPointCount >= 2 && model.storySpineAudit.turningPointCount <= 4, String(model.storySpineAudit.turningPointCount)),
    checkLine("score_change events covered", model.storySpineAudit.scoreChangeEventsCoveredByStoryCount === model.storySpineAudit.scoreChangeEventCount, `${model.storySpineAudit.scoreChangeEventsCoveredByStoryCount}/${model.storySpineAudit.scoreChangeEventCount}`),
    checkLine("official timeline coverage ready", model.storySpine.officialTimelineCoverageReady, bool(model.storySpine.officialTimelineCoverageReady)),
    checkLine("engine causality proof ready", model.storySpine.engineCausalityReady && model.engineCausalityProofAudit.officialCausalityLinkCount >= 3, String(model.engineCausalityProofAudit.officialCausalityLinkCount)),
    checkLine("no unsupported causality claims", model.engineCausalityProofAudit.unsupportedCausalityClaimCount === 0, String(model.engineCausalityProofAudit.unsupportedCausalityClaimCount)),
    checkLine("no diagnostic-only causality in official story", model.engineCausalityProofAudit.diagnosticOnlyCausalityInOfficialStoryCount === 0, String(model.engineCausalityProofAudit.diagnosticOnlyCausalityInOfficialStoryCount)),
    checkLine("no sandbox-only causality in official story", model.engineCausalityProofAudit.sandboxOnlyCausalityInOfficialStoryCount === 0, String(model.engineCausalityProofAudit.sandboxOnlyCausalityInOfficialStoryCount)),
    checkLine("story uses official timeline only", model.officialStorySourceOfTruthAudit.storyUsesOfficialTimelineOnly, bool(model.officialStorySourceOfTruthAudit.storyUsesOfficialTimelineOnly)),
    checkLine("story uses official score only", model.officialStorySourceOfTruthAudit.storyUsesOfficialScoreOnly, bool(model.officialStorySourceOfTruthAudit.storyUsesOfficialScoreOnly)),
    checkLine("all score claims backed by score_change", model.officialStorySourceOfTruthAudit.allStoryScoreClaimsBackedByScoreChange, bool(model.officialStorySourceOfTruthAudit.allStoryScoreClaimsBackedByScoreChange)),
    checkLine("sandbox excluded from official story", model.officialStorySourceOfTruthAudit.sandboxExcludedFromOfficialStory, bool(model.officialStorySourceOfTruthAudit.sandboxExcludedFromOfficialStory)),
    checkLine("batch excluded from official story", model.officialStorySourceOfTruthAudit.batchExcludedFromOfficialStory, bool(model.officialStorySourceOfTruthAudit.batchExcludedFromOfficialStory)),
    checkLine("coach readable narrative ready", model.matchStoryReadabilityAudit.narrativeFlowScore >= 75, String(model.matchStoryReadabilityAudit.narrativeFlowScore)),
    checkLine("product official story section visible", model.productStorySectionVisible, bool(model.productStorySectionVisible)),
    checkLine("export official story section visible", model.exportStorySectionVisible, bool(model.exportStorySectionVisible)),
    checkLine("export compact 45-second story visible", model.exportCompactStoryVisible, bool(model.exportCompactStoryVisible)),
    checkLine("export remains under hard limit", model.exportReadTimeSecondsAfter8A <= 1100, String(model.exportReadTimeSecondsAfter8A)),
    checkLine("report consumption ready", model.reportConsumptionReadinessAudit.storySpineSerializable && model.reportConsumptionReadinessAudit.storySpineHasStableIds, model.reportConsumptionReadinessAudit.recommendation),
    checkLine("source-of-truth separation preserved", model.sourceOfTruthSeparationPreserved, bool(model.sourceOfTruthSeparationPreserved)),
    checkLine("guardrails preserved", model.guardrailsPreserved, bool(model.guardrailsPreserved)),
    checkLine("no scoring constants changed", !model.baseline7H.baseline7G.matchEconomyBaseline.scoringConstantsChanged, bool(!model.baseline7H.baseline7G.matchEconomyBaseline.scoringConstantsChanged)),
    checkLine("MatchBonusEvent unchanged", !model.baseline7H.baseline7G.matchEconomyBaseline.MatchBonusEventChanged, bool(!model.baseline7H.baseline7G.matchEconomyBaseline.MatchBonusEventChanged)),
    checkLine("batch/live separation preserved", model.baseline7H.baseline7G.matchEconomyBaseline.batchLiveSeparationPreserved, bool(model.baseline7H.baseline7G.matchEconomyBaseline.batchLiveSeparationPreserved)),
    checkLine("no new scoring feature added", model.noNewScoringFeatureAdded, bool(model.noNewScoringFeatureAdded)),
    checkLine("no season narrative added", model.noSeasonNarrativeAdded, bool(model.noSeasonNarrativeAdded)),
    checkLine("no team style memory added", model.noTeamStyleMemoryAdded, bool(model.noTeamStyleMemoryAdded)),
  ];
  const validationStatus: OfficialMatchStorySpineEngineCausalityProof8AStatus = checks.every((check) => check.startsWith("- PASS"))
    ? model.status
    : "FAIL";

  return [
    "# Validation - Official Match Story Spine & Engine Causality Proof 8A",
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
    `- story segments: ${model.storySpineAudit.storySegmentCount}`,
    `- story beats: ${model.storySpineAudit.storyBeatCount}`,
    `- turning points: ${model.storySpineAudit.turningPointCount}`,
    `- causality links: ${model.storySpineAudit.causalityLinkCount}`,
    `- score changes covered: ${model.storySpineAudit.scoreChangeEventsCoveredByStoryCount}/${model.storySpineAudit.scoreChangeEventCount}`,
    `- unsupported narrative claims: ${model.storySpineAudit.unsupportedNarrativeClaimCount}`,
    `- unsupported causality claims: ${model.engineCausalityProofAudit.unsupportedCausalityClaimCount}`,
    `- exportReadTimeSecondsAfter8A: ${model.exportReadTimeSecondsAfter8A}`,
    `- recommendation: ${model.recommendation}`,
  ].join("\n");
}

export function validateOfficialMatchStorySpineEngineCausalityProof8A(): OfficialMatchStorySpineEngineCausalityProof8AStatus {
  return currentGeneratedOfficialMatchStorySpineEngineCausalityProof8AModel().status;
}
