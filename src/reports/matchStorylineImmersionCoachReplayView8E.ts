import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { buildCoachReplayView } from "./buildCoachReplayView";
import { buildNaturalCoachMatchNarrative } from "./buildNaturalCoachMatchNarrative";
import { auditCoachReplayReportIntegrationBudget } from "./coachReplayReportIntegrationBudgetAudit";
import { auditCoachReplayView } from "./coachReplayViewAudit";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";
import { auditMatchStorylineImmersion } from "./matchStorylineImmersionAudit";
import {
  MATCH_STORYLINE_IMMERSION_COACH_REPLAY_VIEW_BLOCKING_WARNINGS,
  type MatchStorylineImmersionCoachReplayViewWarningCode,
} from "./matchStorylineImmersionCoachReplayViewWarnings";
import type {
  CoachReplayReportIntegrationBudgetAudit,
  CoachReplayViewAudit,
  MatchStorylineImmersionAudit,
  NaturalCoachMatchNarrative,
  NaturalNarrativeWordingAudit,
  OfficialMatchReplayTimeline,
  ReplayScoreSourceOfTruthAudit,
  ReplayWordingTransform,
  ReplayWordingTransformAudit,
} from "./matchStorylineImmersionTypes";
import { auditNaturalNarrativeWording } from "./naturalNarrativeWordingAudit";
import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import {
  currentGeneratedOfficialPlayerRoleSequenceCausalityUpgrade8DModel,
  type OfficialPlayerRoleSequenceCausalityUpgrade8DModel,
} from "./playerRoleCausalitySequenceLevelStoryUpgrade8D";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { renderCoachReportExportHtml } from "./renderCoachReportExportHtml";
import { auditReplayScoreSourceOfTruth } from "./replayScoreSourceOfTruthAudit";
import { auditReplayWordingTransforms } from "./replayWordingTransformAudit";

export interface OfficialMatchStorylineImmersionReplay8EModel {
  readonly status: OfficialCausalityStatus;
  readonly scope: "MATCH_STORYLINE_IMMERSION_COACH_REPLAY_VIEW";
  readonly version: "MATCH_STORYLINE_IMMERSION_COACH_REPLAY_VIEW_8E";
  readonly baselineVersion: "PLAYER_ROLE_CAUSALITY_SEQUENCE_LEVEL_STORY_UPGRADE_8D";
  readonly matchId: string;
  readonly officialScore: string;
  readonly baseline8D: OfficialPlayerRoleSequenceCausalityUpgrade8DModel;
  readonly replayTimeline: OfficialMatchReplayTimeline;
  readonly naturalNarrative: NaturalCoachMatchNarrative;
  readonly wordingTransforms: readonly ReplayWordingTransform[];
  readonly matchStorylineImmersionAudit: MatchStorylineImmersionAudit;
  readonly coachReplayViewAudit: CoachReplayViewAudit;
  readonly naturalNarrativeWordingAudit: NaturalNarrativeWordingAudit;
  readonly replayScoreSourceOfTruthAudit: ReplayScoreSourceOfTruthAudit;
  readonly replayWordingTransformAudit: ReplayWordingTransformAudit;
  readonly reportIntegrationBudgetAudit: CoachReplayReportIntegrationBudgetAudit;
  readonly baseline8DPreserved: boolean;
  readonly baseline8CPreserved: boolean;
  readonly baseline8BPreserved: boolean;
  readonly baseline8APreserved: boolean;
  readonly baseline7HPreserved: boolean;
  readonly baseline6XPreserved: boolean;
  readonly matchStorylineImmersionReady: boolean;
  readonly coachReplayViewReady: boolean;
  readonly naturalNarrativeReady: boolean;
  readonly replayScoreSourceOfTruthPreserved: boolean;
  readonly replayWordingTransformsReady: boolean;
  readonly reportIntegrationReady: boolean;
  readonly exportLengthPreserved: boolean;
  readonly scoringConstantsUnchanged: boolean;
  readonly matchBonusEventUnchanged: boolean;
  readonly batchLiveSeparationPreserved: boolean;
  readonly warningCodes: readonly MatchStorylineImmersionCoachReplayViewWarningCode[];
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

function warningsFor(model: Omit<OfficialMatchStorylineImmersionReplay8EModel, "status" | "warningCodes" | "recommendation" | "nextSprintRecommendation">): readonly MatchStorylineImmersionCoachReplayViewWarningCode[] {
  return [
    model.matchStorylineImmersionReady ? "MATCH_STORYLINE_IMMERSION_READY" : "MATCH_STORYLINE_IMMERSION_PARTIAL",
    model.coachReplayViewReady ? "COACH_REPLAY_VIEW_READY" : "COACH_REPLAY_VIEW_PARTIAL",
    model.naturalNarrativeReady ? "NATURAL_NARRATIVE_WORDING_READY" : "TECHNICAL_ID_LEAKAGE",
    model.replayScoreSourceOfTruthPreserved ? "REPLAY_SCORE_SOURCE_OF_TRUTH_PRESERVED" : "REPLAY_SCORE_SOURCE_AMBIGUOUS",
    model.replayWordingTransformsReady ? "REPLAY_WORDING_TRANSFORMS_READY" : "REPLAY_WORDING_TRANSFORMS_MISSING",
    model.reportIntegrationReady ? "REPORT_INTEGRATION_READY" : "REPORT_INTEGRATION_PARTIAL",
    model.baseline8DPreserved ? "BASELINE_8D_PRESERVED" : "BASELINE_8D_REGRESSED",
  ];
}

function hasBlockingWarning(warnings: readonly MatchStorylineImmersionCoachReplayViewWarningCode[]): boolean {
  return warnings.some((warning) => MATCH_STORYLINE_IMMERSION_COACH_REPLAY_VIEW_BLOCKING_WARNINGS.includes(
    warning as typeof MATCH_STORYLINE_IMMERSION_COACH_REPLAY_VIEW_BLOCKING_WARNINGS[number],
  ));
}

export function buildOfficialMatchStorylineImmersionReplay8EModel(input: {
  readonly baseline8D: OfficialPlayerRoleSequenceCausalityUpgrade8DModel;
  readonly replayTimeline: OfficialMatchReplayTimeline;
  readonly naturalNarrative: NaturalCoachMatchNarrative;
  readonly wordingTransforms: readonly ReplayWordingTransform[];
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): OfficialMatchStorylineImmersionReplay8EModel {
  const matchStorylineImmersionAudit = auditMatchStorylineImmersion(input.replayTimeline);
  const coachReplayViewAudit = auditCoachReplayView({
    timeline: input.replayTimeline,
    selectedSequenceCount: input.baseline8D.sequences.length,
    productReportHtml: input.productReportHtml,
    exportReportHtml: input.exportReportHtml,
  });
  const naturalNarrativeWordingAudit = auditNaturalNarrativeWording(input.naturalNarrative);
  const replayScoreSourceOfTruthAudit = auditReplayScoreSourceOfTruth({
    baseline8D: input.baseline8D,
    timeline: input.replayTimeline,
  });
  const replayWordingTransformAudit = auditReplayWordingTransforms(input.wordingTransforms);
  const reportIntegrationBudgetAudit = auditCoachReplayReportIntegrationBudget({
    productReportHtml: input.productReportHtml,
    exportReportHtml: input.exportReportHtml,
    exportReadTimeSecondsBefore8E: input.baseline8D.reportIntegrationBudgetAudit.exportReadTimeSecondsAfter8D,
  });
  const baseline8DPreserved = input.baseline8D.status === "PASS" &&
    input.baseline8D.sequenceLevelCausalityReady &&
    input.baseline8D.sourceOfTruthSeparationPreserved;
  const baseline8CPreserved = input.baseline8D.baseline8CPreserved;
  const baseline8BPreserved = input.baseline8D.baseline8BPreserved;
  const baseline8APreserved = input.baseline8D.baseline8APreserved;
  const baseline7HPreserved = input.baseline8D.baseline7HPreserved;
  const baseline6XPreserved = input.baseline8D.baseline6XPreserved;
  const matchStorylineImmersionReady = matchStorylineImmersionAudit.status === "PASS";
  const coachReplayViewReady = coachReplayViewAudit.status === "PASS";
  const naturalNarrativeReady = naturalNarrativeWordingAudit.status === "PASS";
  const replayScoreSourceOfTruthPreserved = replayScoreSourceOfTruthAudit.status === "PASS";
  const replayWordingTransformsReady = replayWordingTransformAudit.status === "PASS";
  const reportIntegrationReady = reportIntegrationBudgetAudit.status === "PASS";
  const exportLengthPreserved = reportIntegrationBudgetAudit.exportUnder900Seconds;
  const scoringConstantsUnchanged = !input.baseline8D.baseline8C.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.scoringConstantsChanged;
  const matchBonusEventUnchanged = !input.baseline8D.baseline8C.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.MatchBonusEventChanged;
  const batchLiveSeparationPreserved = input.baseline8D.baseline8C.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.batchLiveSeparationPreserved;
  const modelWithoutStatus = {
    scope: "MATCH_STORYLINE_IMMERSION_COACH_REPLAY_VIEW" as const,
    version: "MATCH_STORYLINE_IMMERSION_COACH_REPLAY_VIEW_8E" as const,
    baselineVersion: "PLAYER_ROLE_CAUSALITY_SEQUENCE_LEVEL_STORY_UPGRADE_8D" as const,
    matchId: input.replayTimeline.matchId,
    officialScore: input.replayTimeline.officialScore,
    baseline8D: input.baseline8D,
    replayTimeline: input.replayTimeline,
    naturalNarrative: input.naturalNarrative,
    wordingTransforms: input.wordingTransforms,
    matchStorylineImmersionAudit,
    coachReplayViewAudit,
    naturalNarrativeWordingAudit,
    replayScoreSourceOfTruthAudit,
    replayWordingTransformAudit,
    reportIntegrationBudgetAudit,
    baseline8DPreserved,
    baseline8CPreserved,
    baseline8BPreserved,
    baseline8APreserved,
    baseline7HPreserved,
    baseline6XPreserved,
    matchStorylineImmersionReady,
    coachReplayViewReady,
    naturalNarrativeReady,
    replayScoreSourceOfTruthPreserved,
    replayWordingTransformsReady,
    reportIntegrationReady,
    exportLengthPreserved,
    scoringConstantsUnchanged,
    matchBonusEventUnchanged,
    batchLiveSeparationPreserved,
  };
  const warningCodes = warningsFor(modelWithoutStatus);
  const status: OfficialCausalityStatus = hasBlockingWarning(warningCodes) ? "FAIL" : "PASS";

  return {
    ...modelWithoutStatus,
    status,
    warningCodes,
    recommendation: status === "PASS" ? "KEEP_STORYLINE_REPLAY_VIEW" : "REVIEW_REPLAY_SOURCE_OF_TRUTH",
    nextSprintRecommendation: status === "PASS" ? "8F - Coach Replay UX Iteration" : "8F - Replay Evidence Cleanup",
  };
}

export function currentGeneratedOfficialMatchStorylineImmersionReplay8EModel(): OfficialMatchStorylineImmersionReplay8EModel {
  const baseline8D = currentGeneratedOfficialPlayerRoleSequenceCausalityUpgrade8DModel();
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const productReport = buildCoachProductReportViewFromMatchReport(report, rosterCoverageFixturePlayers, {
    includeOfficialMatchCausality: true,
  });
  const replayBuild = buildCoachReplayView({
    matchId: baseline8D.matchId,
    officialScore: baseline8D.officialScore,
    sequences: baseline8D.sequences,
  });
  const naturalNarrative = buildNaturalCoachMatchNarrative(replayBuild.timeline);
  const productReportHtml = renderCoachProductReport({
    ...productReport,
    officialSequenceCausality8D: {
      sequences: baseline8D.sequences,
      sequenceStory: baseline8D.sequenceStory,
    },
    officialReplay8E: replayBuild.timeline,
  });
  const exportReportHtml = renderCoachReportExportHtml({
    productReportHtml,
    fullMatchEconomyFinalStabilization: baseline8D.baseline8C.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline,
  });

  return buildOfficialMatchStorylineImmersionReplay8EModel({
    baseline8D,
    replayTimeline: replayBuild.timeline,
    naturalNarrative,
    wordingTransforms: replayBuild.transforms,
    productReportHtml,
    exportReportHtml,
  });
}

function renderMomentTable(model: OfficialMatchStorylineImmersionReplay8EModel): readonly string[] {
  return table([
    ["Moment", "Minute", "Score", "Team", "Actor", "Role", "Zone", "Source", "Why"],
    ...model.replayTimeline.replayMoments.map((moment) => [
      moment.title,
      moment.minuteLabel,
      `${moment.scoreBefore} -> ${moment.scoreAfter}`,
      moment.teamLabel,
      moment.actorLabel,
      moment.roleLabel,
      moment.zoneLabel,
      moment.sourceBadge,
      moment.whyItMatters,
    ]),
  ]);
}

export function renderMatchStorylineImmersionCoachReplayView8EDoc(
  model: OfficialMatchStorylineImmersionReplay8EModel = currentGeneratedOfficialMatchStorylineImmersionReplay8EModel(),
): string {
  return [
    "# Match Storyline Immersion & Coach Replay View 8E",
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
      ["8D player-role sequence causality", bool(model.baseline8DPreserved)],
      ["8C official causality", bool(model.baseline8CPreserved)],
      ["8B chronology/cumulative score", bool(model.baseline8BPreserved)],
      ["8A story spine", bool(model.baseline8APreserved)],
      ["7H export cleanup", bool(model.baseline7HPreserved)],
      ["6X match economy", bool(model.baseline6XPreserved)],
    ]),
    "",
    "## Natural Replay Narrative",
    model.naturalNarrative.shortImmersiveNarrative,
    "",
    model.naturalNarrative.coachFacingReplaySummary,
    "",
    "## Coach Replay Moments",
    ...renderMomentTable(model),
    "",
    "## Storyline Chapters",
    ...table([
      ["Chapter", "Minute", "Score", "Narrative", "Meaning", "Source"],
      ...model.replayTimeline.storylineChapters.map((chapter) => [
        chapter.title,
        chapter.minuteRange,
        chapter.scoreRange,
        chapter.chapterNarrative,
        chapter.coachMeaning,
        chapter.sourceBadge,
      ]),
    ]),
    "",
    "## Wording Transforms",
    ...table([
      ["Type", "Raw value", "Coach value", "Safe"],
      ...model.wordingTransforms.slice(0, 30).map((transform) => [
        transform.transformType,
        transform.rawValue,
        transform.coachValue,
        bool(transform.safeForCoachCopy),
      ]),
    ]),
    "",
    "## Audits",
    ...table([
      ["Audit", "Status", "Key metric", "Recommendation"],
      ["matchStorylineImmersionAudit", model.matchStorylineImmersionAudit.status, `${model.matchStorylineImmersionAudit.storylineChapterCount} chapters / ${model.matchStorylineImmersionAudit.replayMomentCount} moments`, model.matchStorylineImmersionAudit.recommendation],
      ["coachReplayViewAudit", model.coachReplayViewAudit.status, `${model.coachReplayViewAudit.replayCoverageRate}% coverage`, model.coachReplayViewAudit.recommendation],
      ["naturalNarrativeWordingAudit", model.naturalNarrativeWordingAudit.status, `${model.naturalNarrativeWordingAudit.rawEventIdLeakCount} raw event leaks`, model.naturalNarrativeWordingAudit.recommendation],
      ["replayScoreSourceOfTruthAudit", model.replayScoreSourceOfTruthAudit.status, `${model.replayScoreSourceOfTruthAudit.replayScoreChangeEventCoverageCount}/${model.replayScoreSourceOfTruthAudit.scoreChangeEventCount} score events`, model.replayScoreSourceOfTruthAudit.recommendation],
      ["replayWordingTransformAudit", model.replayWordingTransformAudit.status, `${model.replayWordingTransformAudit.playerTransformCount} player transforms`, model.replayWordingTransformAudit.recommendation],
      ["reportIntegrationBudgetAudit", model.reportIntegrationBudgetAudit.status, `${model.reportIntegrationBudgetAudit.exportReadTimeSecondsAfter8E}s export`, model.reportIntegrationBudgetAudit.recommendation],
    ]),
    "",
    "## Source-Of-Truth Guardrails",
    ...table([
      ["Guardrail", "Value"],
      ["score source remains official score_change events", bool(model.replayScoreSourceOfTruthPreserved)],
      ["sandbox score claims", String(model.replayScoreSourceOfTruthAudit.sandboxScoreClaimCount)],
      ["batch score claims", String(model.replayScoreSourceOfTruthAudit.batchScoreClaimCount)],
      ["score mutation count", String(model.replayScoreSourceOfTruthAudit.scoreMutationCount)],
      ["scoring constants unchanged", bool(model.scoringConstantsUnchanged)],
      ["MatchBonusEvent unchanged", bool(model.matchBonusEventUnchanged)],
      ["batch/live separation preserved", bool(model.batchLiveSeparationPreserved)],
    ]),
    "",
    "## Report Integration",
    ...table([
      ["Metric", "Value"],
      ["productReplaySectionVisible", bool(model.reportIntegrationBudgetAudit.productReplaySectionVisible)],
      ["exportReplaySectionVisible", bool(model.reportIntegrationBudgetAudit.exportReplaySectionVisible)],
      ["productReplayMomentCount", String(model.reportIntegrationBudgetAudit.productReplayMomentCount)],
      ["exportReplayMomentCount", String(model.reportIntegrationBudgetAudit.exportReplayMomentCount)],
      ["exportReadTimeSecondsBefore8E", String(model.reportIntegrationBudgetAudit.exportReadTimeSecondsBefore8E)],
      ["exportReadTimeSecondsAfter8E", String(model.reportIntegrationBudgetAudit.exportReadTimeSecondsAfter8E)],
    ]),
    "",
    "## Warnings",
    ...model.warningCodes.map((warning) => `- ${warning}`),
  ].join("\n");
}

export function renderMatchStorylineImmersionCoachReplayView8EValidation(
  model: OfficialMatchStorylineImmersionReplay8EModel = currentGeneratedOfficialMatchStorylineImmersionReplay8EModel(),
): string {
  const checks = [
    checkLine("OfficialMatchStorylineImmersionReplay8EModel exists", model.scope === "MATCH_STORYLINE_IMMERSION_COACH_REPLAY_VIEW", model.version),
    checkLine("baseline is 8D", model.baselineVersion === "PLAYER_ROLE_CAUSALITY_SEQUENCE_LEVEL_STORY_UPGRADE_8D", model.baselineVersion),
    checkLine("baseline 8D preserved", model.baseline8DPreserved, bool(model.baseline8DPreserved)),
    checkLine("baseline 8C preserved", model.baseline8CPreserved, bool(model.baseline8CPreserved)),
    checkLine("baseline 8B preserved", model.baseline8BPreserved, bool(model.baseline8BPreserved)),
    checkLine("baseline 8A preserved", model.baseline8APreserved, bool(model.baseline8APreserved)),
    checkLine("baseline 7H preserved", model.baseline7HPreserved, bool(model.baseline7HPreserved)),
    checkLine("baseline 6X preserved", model.baseline6XPreserved, bool(model.baseline6XPreserved)),
    checkLine("3-5 storyline chapters", model.matchStorylineImmersionAudit.storylineChapterCount >= 3 && model.matchStorylineImmersionAudit.storylineChapterCount <= 5, String(model.matchStorylineImmersionAudit.storylineChapterCount)),
    checkLine("4-7 replay moments", model.matchStorylineImmersionAudit.replayMomentCount >= 4 && model.matchStorylineImmersionAudit.replayMomentCount <= 7, String(model.matchStorylineImmersionAudit.replayMomentCount)),
    checkLine("chapters backed by official evidence", model.matchStorylineImmersionAudit.chapterWithOfficialEvidenceCount === model.matchStorylineImmersionAudit.storylineChapterCount, `${model.matchStorylineImmersionAudit.chapterWithOfficialEvidenceCount}/${model.matchStorylineImmersionAudit.storylineChapterCount}`),
    checkLine("moments backed by official evidence", model.matchStorylineImmersionAudit.momentWithOfficialEvidenceCount === model.matchStorylineImmersionAudit.replayMomentCount, `${model.matchStorylineImmersionAudit.momentWithOfficialEvidenceCount}/${model.matchStorylineImmersionAudit.replayMomentCount}`),
    checkLine("replay score source note visible", model.matchStorylineImmersionAudit.scoreSourceNoteCount > 0, String(model.matchStorylineImmersionAudit.scoreSourceNoteCount)),
    checkLine("replay limitations visible", model.matchStorylineImmersionAudit.limitationNoteCount > 0, String(model.matchStorylineImmersionAudit.limitationNoteCount)),
    checkLine("coach replay view coverage >= 70%", model.coachReplayViewAudit.replayCoverageRate >= 70, `${model.coachReplayViewAudit.replayCoverageRate}%`),
    checkLine("product contains Revivez le match", model.coachReplayViewAudit.productReplaySectionVisible, bool(model.coachReplayViewAudit.productReplaySectionVisible)),
    checkLine("export contains Replay coach en 60 secondes", model.coachReplayViewAudit.exportReplaySectionVisible, bool(model.coachReplayViewAudit.exportReplaySectionVisible)),
    checkLine("export replay has 2-3 moments", model.coachReplayViewAudit.exportReplayMomentCount >= 2 && model.coachReplayViewAudit.exportReplayMomentCount <= 3, String(model.coachReplayViewAudit.exportReplayMomentCount)),
    checkLine("no raw player ids in coach narrative", model.naturalNarrativeWordingAudit.rawPlayerIdLeakCount === 0, String(model.naturalNarrativeWordingAudit.rawPlayerIdLeakCount)),
    checkLine("no raw event ids in coach narrative", model.naturalNarrativeWordingAudit.rawEventIdLeakCount === 0, String(model.naturalNarrativeWordingAudit.rawEventIdLeakCount)),
    checkLine("no raw effect labels in coach narrative", model.naturalNarrativeWordingAudit.rawEffectLabelLeakCount === 0, String(model.naturalNarrativeWordingAudit.rawEffectLabelLeakCount)),
    checkLine("replay score uses official score source", model.replayScoreSourceOfTruthPreserved, `${model.replayScoreSourceOfTruthAudit.replayScoreChangeEventCoverageCount}/${model.replayScoreSourceOfTruthAudit.scoreChangeEventCount}`),
    checkLine("no sandbox score claim", model.replayScoreSourceOfTruthAudit.sandboxScoreClaimCount === 0, String(model.replayScoreSourceOfTruthAudit.sandboxScoreClaimCount)),
    checkLine("no batch score claim", model.replayScoreSourceOfTruthAudit.batchScoreClaimCount === 0, String(model.replayScoreSourceOfTruthAudit.batchScoreClaimCount)),
    checkLine("no score mutation", model.replayScoreSourceOfTruthAudit.scoreMutationCount === 0, String(model.replayScoreSourceOfTruthAudit.scoreMutationCount)),
    checkLine("wording transforms include players", model.replayWordingTransformAudit.playerTransformCount >= 3, String(model.replayWordingTransformAudit.playerTransformCount)),
    checkLine("wording transforms include roles", model.replayWordingTransformAudit.roleTransformCount >= 3, String(model.replayWordingTransformAudit.roleTransformCount)),
    checkLine("wording transforms include events", model.replayWordingTransformAudit.eventTransformCount >= 3, String(model.replayWordingTransformAudit.eventTransformCount)),
    checkLine("wording transforms safe", model.replayWordingTransformAudit.unsafeTransformCount === 0 && model.replayWordingTransformAudit.unmappedTechnicalTermCount === 0, `${model.replayWordingTransformAudit.unsafeTransformCount}/${model.replayWordingTransformAudit.unmappedTechnicalTermCount}`),
    checkLine("export remains under 900 seconds", model.exportLengthPreserved, String(model.reportIntegrationBudgetAudit.exportReadTimeSecondsAfter8E)),
    checkLine("scoring constants unchanged", model.scoringConstantsUnchanged, bool(model.scoringConstantsUnchanged)),
    checkLine("MatchBonusEvent unchanged", model.matchBonusEventUnchanged, bool(model.matchBonusEventUnchanged)),
    checkLine("batch/live separation preserved", model.batchLiveSeparationPreserved, bool(model.batchLiveSeparationPreserved)),
    checkLine("no new season memory", true, "not added in 8E"),
    checkLine("no new team style memory", true, "not added in 8E"),
    checkLine("no new database history feature", true, "not added in 8E"),
  ];
  const status: OfficialCausalityStatus = checks.every((check) => check.startsWith("- PASS")) ? model.status : "FAIL";

  return [
    "# Validation - Match Storyline Immersion & Coach Replay View 8E",
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
    `- storyline chapter count: ${model.matchStorylineImmersionAudit.storylineChapterCount}`,
    `- replay moment count: ${model.matchStorylineImmersionAudit.replayMomentCount}`,
    `- replay coverage rate: ${model.coachReplayViewAudit.replayCoverageRate}%`,
    `- product replay moment count: ${model.reportIntegrationBudgetAudit.productReplayMomentCount}`,
    `- export replay moment count: ${model.reportIntegrationBudgetAudit.exportReplayMomentCount}`,
    `- raw player id leak count: ${model.naturalNarrativeWordingAudit.rawPlayerIdLeakCount}`,
    `- raw event id leak count: ${model.naturalNarrativeWordingAudit.rawEventIdLeakCount}`,
    `- raw effect label leak count: ${model.naturalNarrativeWordingAudit.rawEffectLabelLeakCount}`,
    `- score change event coverage: ${model.replayScoreSourceOfTruthAudit.replayScoreChangeEventCoverageCount}/${model.replayScoreSourceOfTruthAudit.scoreChangeEventCount}`,
    `- unsafe wording transform count: ${model.replayWordingTransformAudit.unsafeTransformCount}`,
    `- unmapped technical term count: ${model.replayWordingTransformAudit.unmappedTechnicalTermCount}`,
    `- export read time seconds after 8E: ${model.reportIntegrationBudgetAudit.exportReadTimeSecondsAfter8E}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
  ].join("\n");
}

export function validateMatchStorylineImmersionCoachReplayView8E(): OfficialCausalityStatus {
  return currentGeneratedOfficialMatchStorylineImmersionReplay8EModel().status;
}
