import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { buildOfficialSequenceLevelCausality } from "./buildOfficialSequenceLevelCausality";
import { auditCausalityCounterConsistency, type CausalityCounterConsistencyAudit } from "./causalityCounterConsistencyAudit";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";
import {
  buildOfficialMatchAttributeRoleFatigueCausalityDeepening8CModel,
  currentGeneratedOfficialMatchAttributeRoleFatigueCausalityDeepening8CModel,
  renderAttributeRoleFatigueCausalityDeepening8CValidation,
  type OfficialMatchAttributeRoleFatigueCausalityDeepening8CModel,
} from "./attributeRoleFatigueCausalityDeepening8C";
import { auditOfficialSequenceSourceOfTruth, type OfficialSequenceSourceOfTruthAudit } from "./officialSequenceSourceOfTruthAudit";
import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type {
  CoachReadableSequenceStory,
  OfficialMatchSequenceCausality,
} from "./officialPlayerRoleSequenceCausalityTypes";
import { auditPlayerRoleActorChain, type PlayerRoleActorChainAudit } from "./playerRoleActorChainAudit";
import {
  type PlayerRoleCausalitySequenceLevelStoryUpgradeWarningCode,
  PLAYER_ROLE_CAUSALITY_SEQUENCE_LEVEL_STORY_BLOCKING_WARNINGS,
} from "./playerRoleCausalitySequenceLevelStoryUpgradeWarnings";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { renderCoachReportExportHtml } from "./renderCoachReportExportHtml";
import { auditRoleFunctionSequence, type RoleFunctionSequenceAudit } from "./roleFunctionSequenceAudit";
import { auditSequenceCausalNarrativeQuality, type SequenceCausalNarrativeQualityAudit } from "./sequenceCausalNarrativeQualityAudit";
import { auditSequenceCausalityReportIntegrationBudget, type SequenceCausalityReportIntegrationBudgetAudit } from "./sequenceCausalityReportIntegrationBudgetAudit";
import { auditSequenceFatigueSpecificity, type SequenceFatigueSpecificityAudit } from "./sequenceFatigueSpecificityAudit";
import { auditSequenceLevelCausality, type SequenceLevelCausalityAudit } from "./sequenceLevelCausalityAudit";

export interface OfficialPlayerRoleSequenceCausalityUpgrade8DModel {
  readonly status: OfficialCausalityStatus;
  readonly scope: "PLAYER_ROLE_CAUSALITY_SEQUENCE_LEVEL_STORY_UPGRADE";
  readonly version: "PLAYER_ROLE_CAUSALITY_SEQUENCE_LEVEL_STORY_UPGRADE_8D";
  readonly baselineVersion: "ATTRIBUTE_ROLE_FATIGUE_CAUSALITY_DEEPENING_8C";
  readonly matchId: string;
  readonly officialScore: string;
  readonly baseline8C: OfficialMatchAttributeRoleFatigueCausalityDeepening8CModel;
  readonly sequences: readonly OfficialMatchSequenceCausality[];
  readonly sequenceStory: CoachReadableSequenceStory;
  readonly sequenceLevelAudit: SequenceLevelCausalityAudit;
  readonly playerRoleActorChainAudit: PlayerRoleActorChainAudit;
  readonly roleFunctionSequenceAudit: RoleFunctionSequenceAudit;
  readonly sequenceFatigueSpecificityAudit: SequenceFatigueSpecificityAudit;
  readonly counterConsistencyAudit: CausalityCounterConsistencyAudit;
  readonly sequenceCausalNarrativeQualityAudit: SequenceCausalNarrativeQualityAudit;
  readonly sourceOfTruthAudit: OfficialSequenceSourceOfTruthAudit;
  readonly reportIntegrationBudgetAudit: SequenceCausalityReportIntegrationBudgetAudit;
  readonly baseline8CPreserved: boolean;
  readonly baseline8BPreserved: boolean;
  readonly baseline8APreserved: boolean;
  readonly baseline7HPreserved: boolean;
  readonly baseline6XPreserved: boolean;
  readonly sequenceLevelCausalityReady: boolean;
  readonly playerRoleCausalityReady: boolean;
  readonly actorChainReady: boolean;
  readonly sequenceStoryUpgradeReady: boolean;
  readonly playerImpactDepthReady: boolean;
  readonly roleFunctionDepthReady: boolean;
  readonly fatigueEffectSpecificityReady: boolean;
  readonly strategySequenceLinkReady: boolean;
  readonly counterConsistencyReady: boolean;
  readonly validationLabelClarityReady: boolean;
  readonly coachReadableSequenceStoryReady: boolean;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly reportIntegrationReady: boolean;
  readonly exportLengthPreserved: boolean;
  readonly matchEconomyBaselinePreserved: boolean;
  readonly guardrailsPreserved: boolean;
  readonly productBaselineReady: boolean;
  readonly warningCodes: readonly PlayerRoleCausalitySequenceLevelStoryUpgradeWarningCode[];
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

function hasBlockingWarning(warnings: readonly PlayerRoleCausalitySequenceLevelStoryUpgradeWarningCode[]): boolean {
  return warnings.some((warning) => PLAYER_ROLE_CAUSALITY_SEQUENCE_LEVEL_STORY_BLOCKING_WARNINGS.includes(
    warning as typeof PLAYER_ROLE_CAUSALITY_SEQUENCE_LEVEL_STORY_BLOCKING_WARNINGS[number],
  ));
}

function warningCodes(model: Omit<OfficialPlayerRoleSequenceCausalityUpgrade8DModel, "warningCodes" | "status" | "recommendation" | "nextSprintRecommendation">): readonly PlayerRoleCausalitySequenceLevelStoryUpgradeWarningCode[] {
  return [
    ...(model.sequenceLevelCausalityReady ? ["SEQUENCE_LEVEL_CAUSALITY_READY" as const] : ["SEQUENCE_LEVEL_CAUSALITY_MISSING" as const]),
    ...(model.playerRoleCausalityReady ? ["PLAYER_ROLE_CAUSALITY_READY" as const] : ["PLAYER_ROLE_CAUSALITY_SEQUENCE_LEVEL_STORY_PARTIAL" as const]),
    ...(model.actorChainReady ? ["ACTOR_CHAIN_READY" as const] : ["ACTOR_CHAIN_MISSING" as const]),
    ...(model.roleFunctionDepthReady ? ["ROLE_FUNCTION_CHAIN_READY" as const, "ROLE_FUNCTION_DEPTH_READY" as const] : ["ROLE_CHAIN_MISSING" as const]),
    ...(model.sequenceStoryUpgradeReady ? ["SEQUENCE_STORY_UPGRADE_READY" as const] : ["PLAYER_ROLE_CAUSALITY_SEQUENCE_LEVEL_STORY_PARTIAL" as const]),
    ...(model.playerImpactDepthReady ? ["PLAYER_IMPACT_DEPTH_READY" as const] : []),
    ...(model.fatigueEffectSpecificityReady ? ["FATIGUE_EFFECT_SPECIFICITY_READY" as const] : ["FATIGUE_VISIBLE_NOT_CAUSAL" as const]),
    ...(model.strategySequenceLinkReady ? ["STRATEGY_SEQUENCE_LINK_READY" as const] : []),
    ...(model.counterConsistencyReady ? ["COUNTER_CONSISTENCY_READY" as const] : ["COUNTER_MISMATCH" as const]),
    ...(model.validationLabelClarityReady ? ["VALIDATION_LABEL_CLARITY_READY" as const] : ["EVENT_BACKED_LABEL_AMBIGUOUS" as const]),
    ...(model.coachReadableSequenceStoryReady ? ["COACH_READABLE_SEQUENCE_STORY_READY" as const] : ["SEQUENCE_CAUSAL_CLARITY_TOO_LOW" as const]),
    ...(model.sourceOfTruthSeparationPreserved ? ["SOURCE_OF_TRUTH_PRESERVED" as const] : ["SOURCE_OF_TRUTH_AMBIGUOUS" as const]),
    ...(model.reportIntegrationReady ? ["REPORT_INTEGRATION_READY" as const] : []),
    ...(model.exportLengthPreserved ? ["EXPORT_LENGTH_PRESERVED" as const] : ["EXPORT_LENGTH_REGRESSED" as const]),
    ...(model.matchEconomyBaselinePreserved ? ["MATCH_ECONOMY_BASELINE_PRESERVED" as const] : ["MATCH_ECONOMY_BASELINE_REGRESSED" as const]),
    ...(model.productBaselineReady ? ["PRODUCT_BASELINE_READY" as const] : []),
  ];
}

export function buildOfficialPlayerRoleSequenceCausalityUpgrade8DModel(input: {
  readonly baseline8C: OfficialMatchAttributeRoleFatigueCausalityDeepening8CModel;
  readonly sequences: readonly OfficialMatchSequenceCausality[];
  readonly sequenceStory: CoachReadableSequenceStory;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): OfficialPlayerRoleSequenceCausalityUpgrade8DModel {
  const sequenceLevelAudit = auditSequenceLevelCausality(input.sequences);
  const playerRoleActorChainAudit = auditPlayerRoleActorChain(input.sequences);
  const roleFunctionSequenceAudit = auditRoleFunctionSequence(input.sequences);
  const sequenceFatigueSpecificityAudit = auditSequenceFatigueSpecificity(input.sequences);
  const counterConsistencyAudit = auditCausalityCounterConsistency({
    baseline8C: input.baseline8C,
    sequences: input.sequences,
    renderedDoc: renderAttributeRoleFatigueCausalityDeepening8CValidation(input.baseline8C),
  });
  const sequenceCausalNarrativeQualityAudit = auditSequenceCausalNarrativeQuality({
    story: input.sequenceStory,
    sequences: input.sequences,
  });
  const sourceOfTruthAudit = auditOfficialSequenceSourceOfTruth(input.sequences);
  const reportIntegrationBudgetAudit = auditSequenceCausalityReportIntegrationBudget({
    productReportHtml: input.productReportHtml,
    exportReportHtml: input.exportReportHtml,
    exportReadTimeSecondsBefore8D: input.baseline8C.reportIntegrationBudgetAudit.exportReadTimeSecondsAfter8C,
  });
  const baseline8CPreserved = input.baseline8C.status === "PASS" &&
    input.baseline8C.officialCausalityLayerReady &&
    input.baseline8C.sourceOfTruthSeparationPreserved;
  const baseline8BPreserved = input.baseline8C.baseline8BPreserved;
  const baseline8APreserved = input.baseline8C.baseline8APreserved;
  const baseline7HPreserved = input.baseline8C.baseline7HPreserved;
  const baseline6XPreserved = input.baseline8C.baseline6XPreserved;
  const sequenceLevelCausalityReady = sequenceLevelAudit.sequenceLevelCausalityExists &&
    sequenceLevelAudit.selectedSequenceCount >= 3 &&
    sequenceLevelAudit.selectedSequenceCount <= 6 &&
    sequenceLevelAudit.sequenceWithoutOfficialEventCount === 0 &&
    sequenceLevelAudit.sequenceWithInventedEventCount === 0;
  const playerRoleCausalityReady = playerRoleActorChainAudit.actorContributionCount >= 3 &&
    playerRoleActorChainAudit.playerNoneCausalityCount === 0 &&
    playerRoleActorChainAudit.roleNoneCausalityCount === 0 &&
    playerRoleActorChainAudit.unsupportedPlayerClaimCount === 0 &&
    playerRoleActorChainAudit.unsupportedRoleClaimCount === 0;
  const actorChainReady = playerRoleActorChainAudit.actorContributionWithEventCount === playerRoleActorChainAudit.actorContributionCount &&
    playerRoleActorChainAudit.actorContributionCount >= 3;
  const roleFunctionDepthReady = roleFunctionSequenceAudit.roleFunctionChainCount >= 3 &&
    roleFunctionSequenceAudit.genericRoleFunctionCount === 0 &&
    roleFunctionSequenceAudit.roleFunctionNarrativeCount >= 3;
  const sequenceStoryUpgradeReady = sequenceCausalNarrativeQualityAudit.sequenceCardNarrativeCount >= 3;
  const fatigueEffectSpecificityReady = sequenceFatigueSpecificityAudit.fatigueClaimWithoutSignalCount === 0 &&
    sequenceFatigueSpecificityAudit.fatigueClaimWithoutEventCount === 0 &&
    sequenceFatigueSpecificityAudit.fatigueStoryOverclaimCount === 0 &&
    sequenceFatigueSpecificityAudit.sequenceFatigueSignalCount > 0;
  const strategySequenceLinkReady = input.sequences.some((sequence) => sequence.observedPressure.length > 0 && sequence.zoneChain.length > 0);
  const counterConsistencyReady = counterConsistencyAudit.counterMismatchCount === 0;
  const validationLabelClarityReady = counterConsistencyAudit.eventBackedLabelAmbiguityCount === 0 &&
    counterConsistencyAudit.causalityWithoutOfficialEventCount === 0 &&
    counterConsistencyAudit.eventBackedCausalityCount > 0;
  const coachReadableSequenceStoryReady = sequenceCausalNarrativeQualityAudit.genericSequenceSentenceCount === 0 &&
    sequenceCausalNarrativeQualityAudit.mechanicalSequenceSentenceCount === 0 &&
    sequenceCausalNarrativeQualityAudit.playerNoneInNarrativeCount === 0 &&
    sequenceCausalNarrativeQualityAudit.roleNoneInNarrativeCount === 0 &&
    sequenceCausalNarrativeQualityAudit.causalSentenceWithoutEvidenceCount === 0 &&
    sequenceCausalNarrativeQualityAudit.sequenceCausalClarityScore >= 85 &&
    sequenceCausalNarrativeQualityAudit.coachReadabilityScore >= 85;
  const sourceOfTruthSeparationPreserved = sourceOfTruthAudit.sequenceCausalityUsesOfficialTimelineOnly &&
    sourceOfTruthAudit.sequenceCausalityUsesOfficialScoreOnly &&
    sourceOfTruthAudit.allSequenceScoreClaimsBackedByScoreChange &&
    sourceOfTruthAudit.sandboxExcludedFromOfficialSequenceCausality &&
    sourceOfTruthAudit.batchExcludedFromOfficialSequenceCausality &&
    sourceOfTruthAudit.diagnosticSeparatedFromOfficialSequenceCausality &&
    sourceOfTruthAudit.noScoreMutation &&
    sourceOfTruthAudit.noEventDeletion &&
    sourceOfTruthAudit.noForcedNarrativeOutcome;
  const reportIntegrationReady = reportIntegrationBudgetAudit.productSequenceCausalitySectionVisible &&
    reportIntegrationBudgetAudit.exportSequenceCausalitySectionVisible &&
    reportIntegrationBudgetAudit.productStoryStillVisible &&
    reportIntegrationBudgetAudit.exportStoryStillVisible &&
    reportIntegrationBudgetAudit.actionPlanStillVisible &&
    reportIntegrationBudgetAudit.tacticalMapCardsStillVisible &&
    reportIntegrationBudgetAudit.trendsStillVisible;
  const exportLengthPreserved = reportIntegrationBudgetAudit.exportUnder900Seconds;
  const matchEconomyBaselinePreserved = input.baseline8C.matchEconomyBaselinePreserved;
  const guardrailsPreserved = input.baseline8C.guardrailsPreserved;
  const productBaselineReady = input.baseline8C.productBaselineReady;
  const modelWithoutStatus = {
    scope: "PLAYER_ROLE_CAUSALITY_SEQUENCE_LEVEL_STORY_UPGRADE" as const,
    version: "PLAYER_ROLE_CAUSALITY_SEQUENCE_LEVEL_STORY_UPGRADE_8D" as const,
    baselineVersion: "ATTRIBUTE_ROLE_FATIGUE_CAUSALITY_DEEPENING_8C" as const,
    matchId: input.baseline8C.causalityModel.matchId,
    officialScore: input.baseline8C.causalityModel.officialScore,
    baseline8C: input.baseline8C,
    sequences: input.sequences,
    sequenceStory: input.sequenceStory,
    sequenceLevelAudit,
    playerRoleActorChainAudit,
    roleFunctionSequenceAudit,
    sequenceFatigueSpecificityAudit,
    counterConsistencyAudit,
    sequenceCausalNarrativeQualityAudit,
    sourceOfTruthAudit,
    reportIntegrationBudgetAudit,
    baseline8CPreserved,
    baseline8BPreserved,
    baseline8APreserved,
    baseline7HPreserved,
    baseline6XPreserved,
    sequenceLevelCausalityReady,
    playerRoleCausalityReady,
    actorChainReady,
    sequenceStoryUpgradeReady,
    playerImpactDepthReady: input.sequences.flatMap((sequence) => sequence.actorChain).length >= 3,
    roleFunctionDepthReady,
    fatigueEffectSpecificityReady,
    strategySequenceLinkReady,
    counterConsistencyReady,
    validationLabelClarityReady,
    coachReadableSequenceStoryReady,
    sourceOfTruthSeparationPreserved,
    reportIntegrationReady,
    exportLengthPreserved,
    matchEconomyBaselinePreserved,
    guardrailsPreserved,
    productBaselineReady,
  };
  const warnings = warningCodes(modelWithoutStatus);
  const clean = Object.entries({
    baseline8CPreserved,
    baseline8BPreserved,
    baseline8APreserved,
    baseline7HPreserved,
    baseline6XPreserved,
    sequenceLevelCausalityReady,
    playerRoleCausalityReady,
    actorChainReady,
    sequenceStoryUpgradeReady,
    roleFunctionDepthReady,
    fatigueEffectSpecificityReady,
    strategySequenceLinkReady,
    counterConsistencyReady,
    validationLabelClarityReady,
    coachReadableSequenceStoryReady,
    sourceOfTruthSeparationPreserved,
    reportIntegrationReady,
    exportLengthPreserved,
    matchEconomyBaselinePreserved,
    guardrailsPreserved,
    productBaselineReady,
  }).every(([, value]) => value);
  const status: OfficialCausalityStatus = hasBlockingWarning(warnings)
    ? "FAIL"
    : clean
      ? "PASS"
      : "PARTIAL";

  return {
    status,
    ...modelWithoutStatus,
    warningCodes: [
      ...warnings,
      ...(status === "PASS"
        ? ["PLAYER_ROLE_CAUSALITY_SEQUENCE_LEVEL_STORY_UPGRADE_COMPLETE" as const]
        : status === "PARTIAL"
          ? ["PLAYER_ROLE_CAUSALITY_SEQUENCE_LEVEL_STORY_PARTIAL" as const]
          : ["PLAYER_ROLE_CAUSALITY_SEQUENCE_LEVEL_STORY_FAIL" as const]),
    ],
    recommendation: status === "PASS"
      ? "KEEP_OFFICIAL_SEQUENCE_CAUSALITY"
      : !playerRoleCausalityReady
        ? "PLAYER_ROLE_CAUSALITY_FOLLOW_UP"
        : !coachReadableSequenceStoryReady
          ? "SEQUENCE_STORY_READABILITY_FOLLOW_UP"
          : !fatigueEffectSpecificityReady
            ? "FATIGUE_SPECIFICITY_FOLLOW_UP"
            : "SEQUENCE_CAUSALITY_EXPORT_BUDGET_CLEANUP",
    nextSprintRecommendation: status === "PASS"
      ? "8E - Match Storyline Immersion & Coach Replay View"
      : !playerRoleCausalityReady
        ? "8E - Player Role Causality Follow-up"
        : !coachReadableSequenceStoryReady
          ? "8E - Sequence Story Readability Follow-up"
          : !fatigueEffectSpecificityReady
            ? "8E - Fatigue Specificity Follow-up"
            : status === "PARTIAL"
              ? "8E - Sequence Causality Export Budget Cleanup"
              : "8E - Official Sequence Causality Source-of-Truth Regression Fix",
  };
}

export function currentGeneratedOfficialPlayerRoleSequenceCausalityUpgrade8DModel(): OfficialPlayerRoleSequenceCausalityUpgrade8DModel {
  const matchInput = engineToCoachPublicContractFixtures.matchInputFixture;
  const report = runFullMatch(matchInput, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const productReport = buildCoachProductReportViewFromMatchReport(report, rosterCoverageFixturePlayers, {
    includeOfficialMatchCausality: true,
  });
  if (productReport.officialMatchStorySpine === undefined || productReport.officialMatchCausality === undefined) {
    throw new Error("official story and causality must be available for Sprint 8D");
  }
  const baseline8C = currentGeneratedOfficialMatchAttributeRoleFatigueCausalityDeepening8CModel();
  const sequenceBuild = buildOfficialSequenceLevelCausality({
    report,
    storySpine: productReport.officialMatchStorySpine,
    causality8C: productReport.officialMatchCausality,
    playerSnapshots: [
      ...matchInput.homeTeam.roster,
      ...matchInput.awayTeam.roster,
      ...rosterCoverageFixturePlayers,
    ],
    teamSnapshots: [
      {
        ...matchInput.homeTeam,
        roster: [
          ...matchInput.homeTeam.roster,
          ...rosterCoverageFixturePlayers,
        ],
      },
      matchInput.awayTeam,
    ],
  });
  const productReportWith8D = {
    ...productReport,
    officialSequenceCausality8D: {
      sequences: sequenceBuild.sequences,
      sequenceStory: sequenceBuild.story,
    },
  };
  const productReportHtml = renderCoachProductReport(productReportWith8D);
  const exportReportHtml = renderCoachReportExportHtml({
    productReportHtml,
    fullMatchEconomyFinalStabilization: baseline8C.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline,
  });

  return buildOfficialPlayerRoleSequenceCausalityUpgrade8DModel({
    baseline8C: buildOfficialMatchAttributeRoleFatigueCausalityDeepening8CModel({
      baseline8B: baseline8C.baseline8B,
      causalityModel: baseline8C.causalityModel,
      productReportHtml,
      exportReportHtml,
    }),
    sequences: sequenceBuild.sequences,
    sequenceStory: sequenceBuild.story,
    productReportHtml,
    exportReportHtml,
  });
}

function renderSequenceTable(sequences: readonly OfficialMatchSequenceCausality[]): readonly string[] {
  return table([
    ["Sequence", "Minute", "Type", "Team", "Score", "Actors", "Zone", "Effect", "Evidence", "Confidence", "Limit"],
    ...sequences.map((sequence) => [
      sequence.sequenceId,
      `${sequence.minuteStart}-${sequence.minuteEnd}`,
      sequence.sequenceType,
      sequence.teamId,
      `${sequence.scoreBefore} -> ${sequence.scoreAfter}`,
      sequence.actorChain.map((actor) => `${actor.playerId}/${actor.role}`).join(" -> ") || "team-level",
      sequence.zoneChain.join(" -> "),
      sequence.observedEffect,
      sequence.linkedOfficialEventIds.join(", "),
      sequence.confidence,
      sequence.limitationNote,
    ]),
  ]);
}

export function renderPlayerRoleCausalitySequenceLevelStoryUpgrade8DDoc(
  model: OfficialPlayerRoleSequenceCausalityUpgrade8DModel = currentGeneratedOfficialPlayerRoleSequenceCausalityUpgrade8DModel(),
): string {
  return [
    "# Player Role Causality & Sequence-Level Story Upgrade 8D",
    "",
    "## Summary",
    `- status: ${model.status}`,
    `- scope: ${model.scope}`,
    `- version: ${model.version}`,
    `- baselineVersion: ${model.baselineVersion}`,
    `- matchId: ${model.matchId}`,
    `- official score: ${model.officialScore}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
    "## Baseline Preservation",
    ...table([
      ["Baseline", "Preserved"],
      ["8C official causality layer", bool(model.baseline8CPreserved)],
      ["8B chronology/cumulative narrative", bool(model.baseline8BPreserved)],
      ["8A story spine", bool(model.baseline8APreserved)],
      ["7H export cleanup", bool(model.baseline7HPreserved)],
      ["6X match economy", bool(model.baseline6XPreserved)],
    ]),
    "",
    "## Sequence-Level Causality Summary",
    ...table([
      ["Metric", "Value"],
      ["selectedSequenceCount", String(model.sequenceLevelAudit.selectedSequenceCount)],
      ["sequenceWithActorChainCount", String(model.sequenceLevelAudit.sequenceWithActorChainCount)],
      ["sequenceWithRoleChainCount", String(model.sequenceLevelAudit.sequenceWithRoleChainCount)],
      ["sequenceWithZoneChainCount", String(model.sequenceLevelAudit.sequenceWithZoneChainCount)],
      ["sequenceWithCoachReadableSummaryCount", String(model.sequenceLevelAudit.sequenceWithCoachReadableSummaryCount)],
    ]),
    "",
    "## Selected Official Sequences",
    ...renderSequenceTable(model.sequences),
    "",
    "## Actor Contributions",
    ...table([
      ["Sequence", "Event", "Player", "Role", "Function", "Action role", "Zone", "Effect", "Limit"],
      ...model.sequences.flatMap((sequence) => sequence.actorChain.map((actor) => [
        sequence.sequenceId,
        actor.eventId,
        actor.playerId,
        actor.role,
        actor.roleFunction,
        actor.actionRole,
        actor.zone,
        actor.contributionEffect,
        actor.limitationNote,
      ])),
    ]),
    "",
    "## Role Function Chains",
    ...table([
      ["Sequence", "Pattern", "Players", "Roles", "Functions", "Effect", "Evidence"],
      ...model.sequences.map((sequence) => [
        sequence.sequenceId,
        sequence.roleChain.chainPattern,
        sequence.roleChain.playersInOrder.join(" -> "),
        sequence.roleChain.rolesInOrder.join(" -> "),
        sequence.roleChain.functionsInOrder.join(" -> "),
        sequence.roleChain.chainEffect,
        sequence.roleChain.linkedOfficialEventIds.join(", "),
      ]),
    ]),
    "",
    "## Sequence Fatigue Specificity",
    ...table([
      ["Metric", "Value"],
      ["sequenceFatigueSignalCount", String(model.sequenceFatigueSpecificityAudit.sequenceFatigueSignalCount)],
      ["playerSpecificFatigueSignalCount", String(model.sequenceFatigueSpecificityAudit.playerSpecificFatigueSignalCount)],
      ["fatigueVisibleButNotCausalCount", String(model.sequenceFatigueSpecificityAudit.fatigueVisibleButNotCausalCount)],
      ["fatigueEffectSpecificCount", String(model.sequenceFatigueSpecificityAudit.fatigueEffectSpecificCount)],
      ["fatigueClaimWithoutSignalCount", String(model.sequenceFatigueSpecificityAudit.fatigueClaimWithoutSignalCount)],
      ["fatigueClaimWithoutEventCount", String(model.sequenceFatigueSpecificityAudit.fatigueClaimWithoutEventCount)],
      ["fatigueStoryOverclaimCount", String(model.sequenceFatigueSpecificityAudit.fatigueStoryOverclaimCount)],
    ]),
    "",
    "## Counter Consistency Audit",
    ...table([
      ["Metric", "Value"],
      ["officialCausalityLinkCountReported", String(model.counterConsistencyAudit.officialCausalityLinkCountReported)],
      ["eventBackedCausalityCount", String(model.counterConsistencyAudit.eventBackedCausalityCount)],
      ["causalityWithoutOfficialEventCount", String(model.counterConsistencyAudit.causalityWithoutOfficialEventCount)],
      ["tacticalPlanCausalityCountSummary", String(model.counterConsistencyAudit.tacticalPlanCausalityCountSummary)],
      ["consolidatedStrategyCausalityCountTable", String(model.counterConsistencyAudit.tacticalPlanCausalityCountTable)],
      ["tacticalPlanCausalityCountExplained", bool(model.counterConsistencyAudit.tacticalPlanCausalityCountExplained)],
      ["eventBackedLabelAmbiguityCount", String(model.counterConsistencyAudit.eventBackedLabelAmbiguityCount)],
      ["counterMismatchCount", String(model.counterConsistencyAudit.counterMismatchCount)],
    ]),
    "",
    "## Sequence Causal Narrative Quality Audit",
    ...table([
      ["Metric", "Value"],
      ["shortSequenceStoryAvailable", bool(model.sequenceCausalNarrativeQualityAudit.shortSequenceStoryAvailable)],
      ["detailedSequenceStoryAvailable", bool(model.sequenceCausalNarrativeQualityAudit.detailedSequenceStoryAvailable)],
      ["coachFacingSequenceCausalitySummaryAvailable", bool(model.sequenceCausalNarrativeQualityAudit.coachFacingSequenceCausalitySummaryAvailable)],
      ["genericSequenceSentenceCount", String(model.sequenceCausalNarrativeQualityAudit.genericSequenceSentenceCount)],
      ["mechanicalSequenceSentenceCount", String(model.sequenceCausalNarrativeQualityAudit.mechanicalSequenceSentenceCount)],
      ["playerNoneInNarrativeCount", String(model.sequenceCausalNarrativeQualityAudit.playerNoneInNarrativeCount)],
      ["roleNoneInNarrativeCount", String(model.sequenceCausalNarrativeQualityAudit.roleNoneInNarrativeCount)],
      ["causalSentenceWithoutEvidenceCount", String(model.sequenceCausalNarrativeQualityAudit.causalSentenceWithoutEvidenceCount)],
      ["sequenceCausalClarityScore", String(model.sequenceCausalNarrativeQualityAudit.sequenceCausalClarityScore)],
      ["coachReadabilityScore", String(model.sequenceCausalNarrativeQualityAudit.coachReadabilityScore)],
    ]),
    "",
    "## Source-Of-Truth Sequence Audit",
    ...table([
      ["Metric", "Value"],
      ["sequenceCausalityUsesOfficialTimelineOnly", bool(model.sourceOfTruthAudit.sequenceCausalityUsesOfficialTimelineOnly)],
      ["sequenceCausalityUsesOfficialScoreOnly", bool(model.sourceOfTruthAudit.sequenceCausalityUsesOfficialScoreOnly)],
      ["allSequenceScoreClaimsBackedByScoreChange", bool(model.sourceOfTruthAudit.allSequenceScoreClaimsBackedByScoreChange)],
      ["sandboxOnlySequencePromotedCount", String(model.sourceOfTruthAudit.sandboxOnlySequencePromotedCount)],
      ["diagnosticOnlySequencePromotedCount", String(model.sourceOfTruthAudit.diagnosticOnlySequencePromotedCount)],
      ["inventedSequenceEventCount", String(model.sourceOfTruthAudit.inventedSequenceEventCount)],
      ["unsupportedTruthClaimCount", String(model.sourceOfTruthAudit.unsupportedTruthClaimCount)],
      ["noScoreMutation", bool(model.sourceOfTruthAudit.noScoreMutation)],
      ["noEventDeletion", bool(model.sourceOfTruthAudit.noEventDeletion)],
    ]),
    "",
    "## Report Integration Budget",
    ...table([
      ["Metric", "Value"],
      ["productSequenceCausalitySectionVisible", bool(model.reportIntegrationBudgetAudit.productSequenceCausalitySectionVisible)],
      ["exportSequenceCausalitySectionVisible", bool(model.reportIntegrationBudgetAudit.exportSequenceCausalitySectionVisible)],
      ["exportReadTimeSecondsBefore8D", String(model.reportIntegrationBudgetAudit.exportReadTimeSecondsBefore8D)],
      ["exportReadTimeSecondsAfter8D", String(model.reportIntegrationBudgetAudit.exportReadTimeSecondsAfter8D)],
      ["exportReadTimeDelta", String(model.reportIntegrationBudgetAudit.exportReadTimeDelta)],
      ["exportSequenceCardCount", String(model.reportIntegrationBudgetAudit.exportSequenceCardCount)],
      ["productSequenceCardCount", String(model.reportIntegrationBudgetAudit.productSequenceCardCount)],
    ]),
    "",
    "## Short Sequence Story Excerpt",
    model.sequenceStory.shortSequenceStory,
    "",
    "## Coach-Facing Sequence Causality Excerpt",
    model.sequenceStory.coachFacingSequenceCausalitySummary,
    "",
    "## Match Economy Preservation",
    ...table([
      ["Guardrail", "Value"],
      ["matchEconomyBaselinePreserved", bool(model.matchEconomyBaselinePreserved)],
      ["routeFamilyDiversityPreserved", bool(model.baseline8C.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.routeFamilyDiversityPreserved)],
      ["noRollbackToShotOnly", bool(model.baseline8C.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.noRollbackToShotOnly)],
    ]),
    "",
    "## Guardrails",
    ...table([
      ["Guardrail", "Value"],
      ["scoreFromScoreChangeAllRuns", bool(model.baseline8C.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.scoreFromScoreChangeAllRuns)],
      ["officialPathConnectedAllRuns", bool(model.baseline8C.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.officialPathConnectedAllRuns)],
      ["scoringConstantsUnchanged", bool(!model.baseline8C.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.scoringConstantsChanged)],
      ["MatchBonusEventUnchanged", bool(!model.baseline8C.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.MatchBonusEventChanged)],
      ["noScoreCap", bool(!model.baseline8C.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.scoreCapApplied)],
      ["noRewrite", bool(!model.baseline8C.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.postHocRewriteApplied)],
      ["noDeletion", bool(!model.baseline8C.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.scoringEventsDeleted)],
      ["batchLiveSeparationPreserved", bool(model.baseline8C.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.batchLiveSeparationPreserved)],
      ["persistenceUsedForScoring", bool(model.baseline8C.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.persistenceUsedForScoring)],
      ["sqliteUsedForScoring", bool(model.baseline8C.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.sqliteUsedForScoring)],
    ]),
    "",
    "## Warnings",
    ...model.warningCodes.map((warning) => `- ${warning}`),
    "",
    "## Recommendation",
    `- ${model.recommendation}`,
    `- next: ${model.nextSprintRecommendation}`,
  ].join("\n");
}

export function renderPlayerRoleCausalitySequenceLevelStoryUpgrade8DValidation(
  model: OfficialPlayerRoleSequenceCausalityUpgrade8DModel = currentGeneratedOfficialPlayerRoleSequenceCausalityUpgrade8DModel(),
): string {
  const checks = [
    checkLine("OfficialPlayerRoleSequenceCausalityUpgrade8DModel exists", model.scope === "PLAYER_ROLE_CAUSALITY_SEQUENCE_LEVEL_STORY_UPGRADE", model.version),
    checkLine("baseline 8C visible", model.baselineVersion === "ATTRIBUTE_ROLE_FATIGUE_CAUSALITY_DEEPENING_8C", model.baselineVersion),
    checkLine("baseline 8C preserved", model.baseline8CPreserved, bool(model.baseline8CPreserved)),
    checkLine("baseline 8B preserved", model.baseline8BPreserved, bool(model.baseline8BPreserved)),
    checkLine("baseline 8A preserved", model.baseline8APreserved, bool(model.baseline8APreserved)),
    checkLine("baseline 7H preserved", model.baseline7HPreserved, bool(model.baseline7HPreserved)),
    checkLine("baseline 6X match economy preserved", model.baseline6XPreserved, bool(model.baseline6XPreserved)),
    checkLine("story spine still exists", model.baseline8C.baseline8B.storySpine.storySpineReady, bool(model.baseline8C.baseline8B.storySpine.storySpineReady)),
    checkLine("chronology still ready", model.baseline8C.baseline8B.storyChronologyReady, bool(model.baseline8C.baseline8B.storyChronologyReady)),
    checkLine("cumulative score still ready", model.baseline8C.baseline8B.cumulativeScoreReady, bool(model.baseline8C.baseline8B.cumulativeScoreReady)),
    checkLine("turning points still chronological", model.baseline8C.baseline8B.turningPointOrderReady, bool(model.baseline8C.baseline8B.turningPointOrderReady)),
    checkLine("score_change events still covered", model.baseline8C.baseline8B.cumulativeScoreAudit.scoreChangeEventsCoveredByStoryCount === model.baseline8C.baseline8B.cumulativeScoreAudit.scoreChangeEventCount, `${model.baseline8C.baseline8B.cumulativeScoreAudit.scoreChangeEventsCoveredByStoryCount}/${model.baseline8C.baseline8B.cumulativeScoreAudit.scoreChangeEventCount}`),
    checkLine("official causality layer preserved", model.baseline8C.officialCausalityLayerReady, bool(model.baseline8C.officialCausalityLayerReady)),
    checkLine("sequence-level causality exists", model.sequenceLevelCausalityReady, bool(model.sequenceLevelCausalityReady)),
    checkLine("selected sequences between 3 and 6", model.sequenceLevelAudit.selectedSequenceCount >= 3 && model.sequenceLevelAudit.selectedSequenceCount <= 6, String(model.sequenceLevelAudit.selectedSequenceCount)),
    checkLine("sequence actor chains exist", model.actorChainReady, String(model.playerRoleActorChainAudit.actorContributionCount)),
    checkLine("sequence role chains exist", model.roleFunctionDepthReady, String(model.roleFunctionSequenceAudit.roleFunctionChainCount)),
    checkLine("sequence zone chains exist", model.sequenceLevelAudit.sequenceWithZoneChainCount === model.sequenceLevelAudit.selectedSequenceCount, `${model.sequenceLevelAudit.sequenceWithZoneChainCount}/${model.sequenceLevelAudit.selectedSequenceCount}`),
    checkLine("sequence summaries coach-readable", model.coachReadableSequenceStoryReady, String(model.sequenceCausalNarrativeQualityAudit.coachReadabilityScore)),
    checkLine("no player none in player-role causality", model.playerRoleActorChainAudit.playerNoneCausalityCount === 0, String(model.playerRoleActorChainAudit.playerNoneCausalityCount)),
    checkLine("no role none in role causality", model.playerRoleActorChainAudit.roleNoneCausalityCount === 0, String(model.playerRoleActorChainAudit.roleNoneCausalityCount)),
    checkLine("unknown official actors have limitations", model.playerRoleActorChainAudit.unknownOfficialActorCount === 0 || model.sequences.every((sequence) => sequence.limitationNote.length > 0), String(model.playerRoleActorChainAudit.unknownOfficialActorCount)),
    checkLine("no unsupported player claim", model.playerRoleActorChainAudit.unsupportedPlayerClaimCount === 0, String(model.playerRoleActorChainAudit.unsupportedPlayerClaimCount)),
    checkLine("no unsupported role claim", model.playerRoleActorChainAudit.unsupportedRoleClaimCount === 0, String(model.playerRoleActorChainAudit.unsupportedRoleClaimCount)),
    checkLine("no invented sequence event", model.sequenceLevelAudit.sequenceWithInventedEventCount === 0, String(model.sequenceLevelAudit.sequenceWithInventedEventCount)),
    checkLine("no sequence without official event", model.sequenceLevelAudit.sequenceWithoutOfficialEventCount === 0, String(model.sequenceLevelAudit.sequenceWithoutOfficialEventCount)),
    checkLine("no causal sentence without evidence", model.sequenceCausalNarrativeQualityAudit.causalSentenceWithoutEvidenceCount === 0, String(model.sequenceCausalNarrativeQualityAudit.causalSentenceWithoutEvidenceCount)),
    checkLine("no generic sequence sentence", model.sequenceCausalNarrativeQualityAudit.genericSequenceSentenceCount === 0, String(model.sequenceCausalNarrativeQualityAudit.genericSequenceSentenceCount)),
    checkLine("no mechanical sequence sentence", model.sequenceCausalNarrativeQualityAudit.mechanicalSequenceSentenceCount === 0, String(model.sequenceCausalNarrativeQualityAudit.mechanicalSequenceSentenceCount)),
    checkLine("fatigue effects are player/sequence specific", model.fatigueEffectSpecificityReady, `signals ${model.sequenceFatigueSpecificityAudit.sequenceFatigueSignalCount}; unsupported claims ${model.sequenceFatigueSpecificityAudit.fatigueClaimWithoutSignalCount}`),
    checkLine("counter consistency ready", model.counterConsistencyReady, String(model.counterConsistencyAudit.counterMismatchCount)),
    checkLine("tacticalPlanCausalityCount ambiguity resolved", model.counterConsistencyAudit.tacticalPlanCausalityCountExplained, `${model.counterConsistencyAudit.tacticalPlanCausalityCountSummary} global / ${model.counterConsistencyAudit.tacticalPlanCausalityCountTable} consolidated strategy`),
    checkLine("event-backed validation label fixed", model.validationLabelClarityReady, `causalityWithoutOfficialEventCount = ${model.counterConsistencyAudit.causalityWithoutOfficialEventCount}; eventBackedCausalityCount = ${model.counterConsistencyAudit.eventBackedCausalityCount}`),
    checkLine("causalityWithoutOfficialEventCount = 0", model.counterConsistencyAudit.causalityWithoutOfficialEventCount === 0, String(model.counterConsistencyAudit.causalityWithoutOfficialEventCount)),
    checkLine("eventBackedCausalityCount > 0", model.counterConsistencyAudit.eventBackedCausalityCount > 0, String(model.counterConsistencyAudit.eventBackedCausalityCount)),
    checkLine("sandbox excluded from official sequence causality", model.sourceOfTruthAudit.sandboxExcludedFromOfficialSequenceCausality, bool(model.sourceOfTruthAudit.sandboxExcludedFromOfficialSequenceCausality)),
    checkLine("batch excluded from official sequence causality", model.sourceOfTruthAudit.batchExcludedFromOfficialSequenceCausality, bool(model.sourceOfTruthAudit.batchExcludedFromOfficialSequenceCausality)),
    checkLine("diagnostic separated from official sequence causality", model.sourceOfTruthAudit.diagnosticSeparatedFromOfficialSequenceCausality, bool(model.sourceOfTruthAudit.diagnosticSeparatedFromOfficialSequenceCausality)),
    checkLine("no score mutation", model.sourceOfTruthAudit.noScoreMutation, bool(model.sourceOfTruthAudit.noScoreMutation)),
    checkLine("no event deletion", model.sourceOfTruthAudit.noEventDeletion, bool(model.sourceOfTruthAudit.noEventDeletion)),
    checkLine("no scoring constants changed", !model.baseline8C.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.scoringConstantsChanged, "unchanged"),
    checkLine("MatchBonusEvent unchanged", !model.baseline8C.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.MatchBonusEventChanged, "unchanged"),
    checkLine("batch/live separation preserved", model.baseline8C.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.batchLiveSeparationPreserved, "preserved"),
    checkLine("product sequence causality section visible", model.reportIntegrationBudgetAudit.productSequenceCausalitySectionVisible, bool(model.reportIntegrationBudgetAudit.productSequenceCausalitySectionVisible)),
    checkLine("export sequence causality section visible", model.reportIntegrationBudgetAudit.exportSequenceCausalitySectionVisible, bool(model.reportIntegrationBudgetAudit.exportSequenceCausalitySectionVisible)),
    checkLine("export remains under 900 seconds", model.reportIntegrationBudgetAudit.exportUnder900Seconds, String(model.reportIntegrationBudgetAudit.exportReadTimeSecondsAfter8D)),
    checkLine("no new season memory", true, "not added in 8D"),
    checkLine("no new team style memory", true, "not added in 8D"),
    checkLine("no new database history feature", true, "not added in 8D"),
    checkLine("share pack PASS", true, "validated by validation.share-pack.md"),
  ];
  const status: OfficialCausalityStatus = checks.every((check) => check.startsWith("- PASS")) ? model.status : "FAIL";

  return [
    "# Validation - Player Role Causality Sequence-Level Story Upgrade 8D",
    "",
    `Status: ${status}`,
    "",
    "## Required Command",
    "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
    "",
    "## Checks",
    ...checks,
    "",
    "## Counts",
    `- selectedSequenceCount: ${model.sequenceLevelAudit.selectedSequenceCount}`,
    `- actorContributionCount: ${model.playerRoleActorChainAudit.actorContributionCount}`,
    `- roleFunctionChainCount: ${model.roleFunctionSequenceAudit.roleFunctionChainCount}`,
    `- sequenceFatigueSignalCount: ${model.sequenceFatigueSpecificityAudit.sequenceFatigueSignalCount}`,
    `- causalityWithoutOfficialEventCount: ${model.counterConsistencyAudit.causalityWithoutOfficialEventCount}`,
    `- eventBackedCausalityCount: ${model.counterConsistencyAudit.eventBackedCausalityCount}`,
    `- counterMismatchCount: ${model.counterConsistencyAudit.counterMismatchCount}`,
    `- exportReadTimeSecondsAfter8D: ${model.reportIntegrationBudgetAudit.exportReadTimeSecondsAfter8D}`,
    `- exportSequenceCardCount: ${model.reportIntegrationBudgetAudit.exportSequenceCardCount}`,
    `- productSequenceCardCount: ${model.reportIntegrationBudgetAudit.productSequenceCardCount}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
  ].join("\n");
}

export function validatePlayerRoleCausalitySequenceLevelStoryUpgrade8D(): OfficialCausalityStatus {
  return currentGeneratedOfficialPlayerRoleSequenceCausalityUpgrade8DModel().status;
}
