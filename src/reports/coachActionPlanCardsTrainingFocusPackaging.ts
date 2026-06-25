import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import {
  buildCoachActionPlanCards,
  buildTrainingFocusPackages,
  type CoachActionPlanCard,
  type TrainingFocusPackage,
} from "./coachActionPlanCards";
import { auditCoachActionPlanCards, type CoachActionPlanCardsAudit } from "./coachActionPlanCardsAudit";
import {
  COACH_ACTION_PLAN_PACKAGING_BLOCKING_WARNINGS,
  type CoachActionPlanCardsTrainingFocusPackagingWarningCode,
} from "./coachActionPlanCardsTrainingFocusPackagingWarnings";
import {
  buildCoachInsightDepthNextMatchRecommendationsModel,
  type CoachInsightDepthNextMatchRecommendationsModel,
} from "./coachInsightDepthNextMatchRecommendations";
import { auditCoachReportWordingPolish, type CoachReportWordingPolishAudit } from "./coachReportWordingPolishAudit";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";
import {
  currentFullMatchEconomyFinalStabilizationModel,
  type FullMatchEconomyFinalStabilizationModel,
} from "./fullMatchMatchEconomyFinalStabilization";
import { auditNextMatchPlanPackaging, type NextMatchPlanPackagingAudit } from "./nextMatchPlanPackagingAudit";
import {
  buildProductBaselineCoachReportReadinessModel,
  currentProductBaselineCoachReportReadinessModel,
  type ProductBaselineCoachReportReadinessModel,
} from "./productBaselineCoachReportReadiness";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import type { CoachProductReportViewModel } from "./coachProductReportView";
import { renderCoachProductReport } from "./renderCoachProductReport";
import {
  renderCoachInsightDepthNextMatchRecommendationsSection,
  renderCoachReportExportHtml,
  renderProductBaselineCoachReportReadinessSection,
} from "./renderCoachReportExportHtml";
import { auditTrainingFocusPackaging, type TrainingFocusPackagingAudit } from "./trainingFocusPackagingAudit";
import { escapeHtml } from "./htmlCoachReport";

export type CoachActionPlanCardsTrainingFocusPackagingStatus = "PASS" | "PARTIAL" | "FAIL";
export type CoachActionPlanCardsTrainingFocusPackagingRecommendation =
  | "KEEP_COACH_ACTION_PLAN_PACKAGING"
  | "CLARIFY_ACTION_PLAN_CARDS"
  | "CLARIFY_TRAINING_FOCUS"
  | "POLISH_MECHANICAL_WORDING"
  | "FIX_COACH_ACTION_PLAN_PACKAGING_GUARDRAILS";

export interface CoachActionPlanCardsTrainingFocusPackagingModel {
  readonly status: CoachActionPlanCardsTrainingFocusPackagingStatus;
  readonly scope: "COACH_ACTION_PLAN_CARDS_TRAINING_FOCUS_PACKAGING";
  readonly version: "COACH_ACTION_PLAN_CARDS_TRAINING_FOCUS_PACKAGING_7C";
  readonly baselineVersion: "COACH_INSIGHT_DEPTH_NEXT_MATCH_RECOMMENDATIONS_7B";
  readonly matchEconomyBaselinePreserved: boolean;
  readonly productReportReady: boolean;
  readonly coachExportReady: boolean;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly actionPlanCardsReady: boolean;
  readonly trainingFocusPackagingReady: boolean;
  readonly nextMatchPlanPackaged: boolean;
  readonly coachLanguagePolished: boolean;
  readonly mechanicalWordingRemoved: boolean;
  readonly productBaselineReady: boolean;
  readonly actionPlanCards: readonly CoachActionPlanCard[];
  readonly trainingFocuses: readonly TrainingFocusPackage[];
  readonly baseline7B: CoachInsightDepthNextMatchRecommendationsModel;
  readonly baseline7A: ProductBaselineCoachReportReadinessModel;
  readonly matchEconomyBaseline: FullMatchEconomyFinalStabilizationModel;
  readonly actionPlanCardsAudit: CoachActionPlanCardsAudit;
  readonly trainingFocusPackagingAudit: TrainingFocusPackagingAudit;
  readonly nextMatchPlanPackagingAudit: NextMatchPlanPackagingAudit;
  readonly wordingPolishAudit: CoachReportWordingPolishAudit;
  readonly warningCodes: readonly CoachActionPlanCardsTrainingFocusPackagingWarningCode[];
  readonly recommendation: CoachActionPlanCardsTrainingFocusPackagingRecommendation;
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

function includesBlocking(warnings: readonly CoachActionPlanCardsTrainingFocusPackagingWarningCode[]): boolean {
  return warnings.some((warning) => COACH_ACTION_PLAN_PACKAGING_BLOCKING_WARNINGS.includes(warning));
}

function appendProductSection(html: string, section: string): string {
  return html.includes("</main>")
    ? html.replace("</main>", `${section}\n</main>`)
    : `${html}\n${section}`;
}

export function buildCoachActionPlanCardsTrainingFocusPackagingModel(input: {
  readonly productReport: CoachProductReportViewModel;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
  readonly baseline7B?: CoachInsightDepthNextMatchRecommendationsModel;
  readonly baseline7A?: ProductBaselineCoachReportReadinessModel;
  readonly matchEconomyBaseline?: FullMatchEconomyFinalStabilizationModel;
}): CoachActionPlanCardsTrainingFocusPackagingModel {
  const matchEconomyBaseline = input.matchEconomyBaseline ?? currentFullMatchEconomyFinalStabilizationModel();
  const baseline7A = input.baseline7A ?? currentProductBaselineCoachReportReadinessModel({
    productReport: input.productReport,
    productReportHtml: input.productReportHtml,
    exportReportHtml: input.exportReportHtml,
    matchEconomyBaseline,
  });
  const baseline7B = input.baseline7B ?? buildCoachInsightDepthNextMatchRecommendationsModel({
    productReport: input.productReport,
    productReportHtml: input.productReportHtml,
    exportReportHtml: input.exportReportHtml,
    baseline7A,
    matchEconomyBaseline,
  });
  const actionPlanCards = buildCoachActionPlanCards(baseline7B.deepInsights);
  const trainingFocuses = buildTrainingFocusPackages(actionPlanCards);
  const actionPlanCardsAudit = auditCoachActionPlanCards(actionPlanCards);
  const trainingFocusPackagingAudit = auditTrainingFocusPackaging(trainingFocuses);
  const nextMatchPlanPackagingAudit = auditNextMatchPlanPackaging(actionPlanCards);
  const wordingPolishAudit = auditCoachReportWordingPolish(input);
  const actionPlanCardsReady = actionPlanCardsAudit.actionPlanCardCount >= 2 &&
    actionPlanCardsAudit.actionPlanCardCount <= 3 &&
    actionPlanCardsAudit.primaryActionCardCount === 1 &&
    actionPlanCardsAudit.cardWithTrainingFocusCount === actionPlanCardsAudit.actionPlanCardCount &&
    actionPlanCardsAudit.cardWithCoachActionCount === actionPlanCardsAudit.actionPlanCardCount &&
    actionPlanCardsAudit.cardWithObservableSignalCount === actionPlanCardsAudit.actionPlanCardCount &&
    actionPlanCardsAudit.cardWithSuccessIndicatorCount === actionPlanCardsAudit.actionPlanCardCount &&
    actionPlanCardsAudit.cardWithRiskOrTradeoffCount === actionPlanCardsAudit.actionPlanCardCount &&
    actionPlanCardsAudit.cardWithEvidenceCount === actionPlanCardsAudit.actionPlanCardCount &&
    actionPlanCardsAudit.overlongActionCardCount === 0 &&
    actionPlanCardsAudit.vagueActionCardCount === 0 &&
    actionPlanCardsAudit.unsupportedActionCardCount === 0 &&
    actionPlanCardsAudit.forcedSelectionCardCount === 0 &&
    actionPlanCardsAudit.forcedTacticalPlanCardCount === 0 &&
    actionPlanCardsAudit.sandboxActionCardInOfficialBodyCount === 0;
  const trainingFocusPackagingReady = trainingFocusPackagingAudit.trainingFocusCount >= 1 &&
    trainingFocusPackagingAudit.trainingFocusCount <= 2 &&
    trainingFocusPackagingAudit.primaryTrainingFocusCount === 1 &&
    trainingFocusPackagingAudit.trainingFocusWithWhyCount === trainingFocusPackagingAudit.trainingFocusCount &&
    trainingFocusPackagingAudit.trainingFocusWithCoachCueCount === trainingFocusPackagingAudit.trainingFocusCount &&
    trainingFocusPackagingAudit.trainingFocusWithObservableSignalCount === trainingFocusPackagingAudit.trainingFocusCount &&
    trainingFocusPackagingAudit.trainingFocusWithRiskCount === trainingFocusPackagingAudit.trainingFocusCount &&
    trainingFocusPackagingAudit.trainingFocusWithEvidenceCount === trainingFocusPackagingAudit.trainingFocusCount &&
    trainingFocusPackagingAudit.genericDrillCueCount === 0 &&
    trainingFocusPackagingAudit.unsupportedTrainingFocusCount === 0 &&
    trainingFocusPackagingAudit.trainingFocusTooBroadCount === 0;
  const nextMatchPlanPackaged = nextMatchPlanPackagingAudit.nextMatchPriorityCount >= 2 &&
    nextMatchPlanPackagingAudit.nextMatchPriorityCount <= 3 &&
    nextMatchPlanPackagingAudit.concretePriorityCount === nextMatchPlanPackagingAudit.nextMatchPriorityCount &&
    nextMatchPlanPackagingAudit.priorityWithObservableSignalCount === nextMatchPlanPackagingAudit.nextMatchPriorityCount &&
    nextMatchPlanPackagingAudit.priorityWithRiskCount === nextMatchPlanPackagingAudit.nextMatchPriorityCount &&
    nextMatchPlanPackagingAudit.priorityWithConfidenceCount === nextMatchPlanPackagingAudit.nextMatchPriorityCount &&
    nextMatchPlanPackagingAudit.priorityWithSourceCount === nextMatchPlanPackagingAudit.nextMatchPriorityCount &&
    nextMatchPlanPackagingAudit.priorityWithSuccessIndicatorCount === nextMatchPlanPackagingAudit.nextMatchPriorityCount &&
    !nextMatchPlanPackagingAudit.planTooLong;
  const coachLanguagePolished = wordingPolishAudit.coachLanguageReady;
  const mechanicalWordingRemoved = wordingPolishAudit.mechanicalPhraseCount === 0 &&
    wordingPolishAudit.duplicatedLabelCount === 0 &&
    wordingPolishAudit.repeatedPrefixCount === 0;
  const productReportReady = input.productReportHtml.includes("id=\"coach-action-plan\"") &&
    input.productReportHtml.includes("id=\"training-focus-package\"") &&
    input.productReportHtml.includes("id=\"coach-deep-insights\"") &&
    input.productReportHtml.includes("id=\"next-match-plan\"");
  const coachExportReady = input.exportReportHtml.includes("id=\"coach-action-plan\"") &&
    input.exportReportHtml.includes("id=\"training-focus-package\"") &&
    input.exportReportHtml.includes("id=\"coach-deep-insights\"") &&
    input.exportReportHtml.includes("id=\"next-match-plan\"");
  const sourceOfTruthSeparationPreserved = baseline7B.sourceOfTruthSeparationPreserved;
  const warningCodes = [
    ...actionPlanCardsAudit.actionPlanCardsWarningCodes,
    ...trainingFocusPackagingAudit.trainingFocusPackagingWarningCodes,
    ...nextMatchPlanPackagingAudit.nextMatchPlanPackagingWarningCodes,
    ...wordingPolishAudit.wordingPolishWarningCodes,
    ...(sourceOfTruthSeparationPreserved ? ["OFFICIAL_DIAGNOSTIC_SANDBOX_SEPARATION_PRESERVED" as const] : ["SOURCE_OF_TRUTH_AMBIGUOUS" as const]),
    ...(productReportReady ? ["PRODUCT_REPORT_READY" as const] : []),
    ...(coachExportReady ? ["COACH_EXPORT_READY" as const] : []),
    ...(baseline7B.matchEconomyBaselinePreserved ? ["MATCH_ECONOMY_BASELINE_PRESERVED" as const] : ["MATCH_ECONOMY_BASELINE_REGRESSED" as const]),
    ...(baseline7B.productBaselineReady ? ["PRODUCT_BASELINE_READY" as const] : []),
    ...(baseline7B.noScoreManipulationConfirmed ? [] : ["SCORE_MANIPULATION_DETECTED" as const]),
    ...(baseline7B.noPenaltyLeak ? [] : ["PENALTY_SHOT_LEAKAGE_DETECTED" as const]),
    ...(baseline7B.noUnknownScoringFamily ? [] : ["UNKNOWN_SCORING_FAMILY_DETECTED" as const]),
  ];
  const blocking = includesBlocking(warningCodes);
  const productBaselineReady = productReportReady &&
    coachExportReady &&
    sourceOfTruthSeparationPreserved &&
    baseline7B.status === "PASS" &&
    baseline7B.productBaselineReady &&
    baseline7B.matchEconomyBaselinePreserved &&
    baseline7B.guardrailsPreserved &&
    actionPlanCardsReady &&
    trainingFocusPackagingReady &&
    nextMatchPlanPackaged &&
    coachLanguagePolished &&
    mechanicalWordingRemoved &&
    !blocking;
  const status: CoachActionPlanCardsTrainingFocusPackagingStatus = blocking
    ? "FAIL"
    : productBaselineReady
      ? "PASS"
      : "PARTIAL";
  const recommendation: CoachActionPlanCardsTrainingFocusPackagingRecommendation = status === "PASS"
    ? "KEEP_COACH_ACTION_PLAN_PACKAGING"
    : !actionPlanCardsReady
      ? "CLARIFY_ACTION_PLAN_CARDS"
      : !trainingFocusPackagingReady
        ? "CLARIFY_TRAINING_FOCUS"
        : !coachLanguagePolished || !mechanicalWordingRemoved
          ? "POLISH_MECHANICAL_WORDING"
          : "FIX_COACH_ACTION_PLAN_PACKAGING_GUARDRAILS";

  return {
    status,
    scope: "COACH_ACTION_PLAN_CARDS_TRAINING_FOCUS_PACKAGING",
    version: "COACH_ACTION_PLAN_CARDS_TRAINING_FOCUS_PACKAGING_7C",
    baselineVersion: "COACH_INSIGHT_DEPTH_NEXT_MATCH_RECOMMENDATIONS_7B",
    matchEconomyBaselinePreserved: baseline7B.matchEconomyBaselinePreserved,
    productReportReady,
    coachExportReady,
    sourceOfTruthSeparationPreserved,
    actionPlanCardsReady,
    trainingFocusPackagingReady,
    nextMatchPlanPackaged,
    coachLanguagePolished,
    mechanicalWordingRemoved,
    productBaselineReady,
    actionPlanCards,
    trainingFocuses,
    baseline7B,
    baseline7A,
    matchEconomyBaseline,
    actionPlanCardsAudit,
    trainingFocusPackagingAudit,
    nextMatchPlanPackagingAudit,
    wordingPolishAudit,
    warningCodes: [...new Set(warningCodes)],
    recommendation,
    nextSprintRecommendation: status === "PASS"
      ? "7D - Coach Report Premium Layout & Visual Hierarchy"
      : "7C - Coach Action Plan Packaging Follow-up",
  };
}

export function currentGeneratedCoachActionPlanCardsTrainingFocusPackagingModel(): CoachActionPlanCardsTrainingFocusPackagingModel {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const productReport = buildCoachProductReportViewFromMatchReport(report, rosterCoverageFixturePlayers);
  const matchEconomyBaseline = currentFullMatchEconomyFinalStabilizationModel();
  const baseProductReportHtml = renderCoachProductReport(productReport);
  const exportHtmlFor7A = renderCoachReportExportHtml({
    productReportHtml: baseProductReportHtml,
    fullMatchEconomyFinalStabilization: matchEconomyBaseline,
  });
  const baseline7A = buildProductBaselineCoachReportReadinessModel({
    productReport,
    productReportHtml: baseProductReportHtml,
    exportReportHtml: exportHtmlFor7A,
    matchEconomyBaseline,
  });
  const productHtmlWith7A = appendProductSection(
    baseProductReportHtml,
    renderProductBaselineCoachReportReadinessSection(baseline7A),
  );
  const exportHtmlFor7B = renderCoachReportExportHtml({
    productReportHtml: productHtmlWith7A,
    fullMatchEconomyFinalStabilization: matchEconomyBaseline,
    productBaselineCoachReportReadiness: baseline7A,
  });
  const baseline7B = buildCoachInsightDepthNextMatchRecommendationsModel({
    productReport,
    productReportHtml: productHtmlWith7A,
    exportReportHtml: exportHtmlFor7B,
    baseline7A,
    matchEconomyBaseline,
  });
  const productHtmlWith7B = appendProductSection(
    productHtmlWith7A,
    renderCoachInsightDepthNextMatchRecommendationsSection(baseline7B),
  );
  const exportReportHtml = renderCoachReportExportHtml({
    productReportHtml: productHtmlWith7B,
    fullMatchEconomyFinalStabilization: matchEconomyBaseline,
    productBaselineCoachReportReadiness: baseline7A,
    coachInsightDepthNextMatchRecommendations: baseline7B,
  });
  return buildCoachActionPlanCardsTrainingFocusPackagingModel({
    productReport,
    productReportHtml: productHtmlWith7B,
    exportReportHtml,
    baseline7B,
    baseline7A,
    matchEconomyBaseline,
  });
}

export function renderCoachActionPlanCardsTrainingFocusPackagingSection(
  model: CoachActionPlanCardsTrainingFocusPackagingModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  return `
    <section class="controlled-local-readonly-db-section" aria-label="Plan action coach et focus entrainement">
      <div class="section-heading">
        <p class="eyebrow">Sprint 7C</p>
        <h3>Plan d'action coach & focus entrainement</h3>
        <p>Les insights 7B sont empaquetes en cartes courtes: observation, travail, signal visible, critere de reussite et risque.</p>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>Cartes action</h4>
          <ul>
            <li>Cartes visibles: ${model.actionPlanCardsAudit.actionPlanCardCount}</li>
            <li>Priorite principale: ${model.actionPlanCardsAudit.primaryActionCardCount}</li>
            <li>Signaux observables: ${model.actionPlanCardsAudit.cardWithObservableSignalCount}</li>
            <li>Criteres de reussite: ${model.actionPlanCardsAudit.cardWithSuccessIndicatorCount}</li>
            <li>Selection forcee: ${model.actionPlanCardsAudit.forcedSelectionCardCount}</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Packaging coach</h4>
          <ul>
            <li>Focus entrainement: ${model.trainingFocusPackagingAudit.trainingFocusCount}</li>
            <li>Plan prochain match: ${model.nextMatchPlanPackagingAudit.nextMatchPriorityCount}</li>
            <li>Wording mecanique: ${model.wordingPolishAudit.mechanicalPhraseCount}</li>
            <li>Libelles dupliques: ${model.wordingPolishAudit.duplicatedLabelCount}</li>
            <li>Wording interdit: ${model.wordingPolishAudit.forbiddenWordingCount}</li>
          </ul>
        </article>
      </div>
      <p class="muted">
        Statut: ${escapeHtml(model.status)}. Recommendation: ${escapeHtml(model.recommendation)}.
        Sprint suivant: ${escapeHtml(model.nextSprintRecommendation)}.
      </p>
    </section>`;
}

export function renderCoachActionPlanCardsTrainingFocusPackaging7CDoc(
  model: CoachActionPlanCardsTrainingFocusPackagingModel = currentGeneratedCoachActionPlanCardsTrainingFocusPackagingModel(),
): string {
  return [
    "# Coach Action Plan Cards & Training Focus Packaging 7C",
    "",
    "## Summary",
    `- status: ${model.status}`,
    `- scope: ${model.scope}`,
    `- version: ${model.version}`,
    `- baselineVersion: ${model.baselineVersion}`,
    `- matchEconomyBaselinePreserved: ${model.matchEconomyBaselinePreserved}`,
    `- productReportReady: ${model.productReportReady}`,
    `- coachExportReady: ${model.coachExportReady}`,
    `- sourceOfTruthSeparationPreserved: ${model.sourceOfTruthSeparationPreserved}`,
    `- actionPlanCardsReady: ${model.actionPlanCardsReady}`,
    `- trainingFocusPackagingReady: ${model.trainingFocusPackagingReady}`,
    `- nextMatchPlanPackaged: ${model.nextMatchPlanPackaged}`,
    `- coachLanguagePolished: ${model.coachLanguagePolished}`,
    `- mechanicalWordingRemoved: ${model.mechanicalWordingRemoved}`,
    `- productBaselineReady: ${model.productBaselineReady}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
    "## Baseline Preservation",
    ...table([
      ["Baseline", "Value"],
      ["7B status", model.baseline7B.status],
      ["7B productBaselineReady", bool(model.baseline7B.productBaselineReady)],
      ["7A status", model.baseline7A.status],
      ["6X averageTotalPoints", String(model.matchEconomyBaseline.averageTotalPointsAfter)],
      ["6X closeGameRate", `${model.matchEconomyBaseline.closeGameRateAfter}%`],
      ["guardrailsPreserved", bool(model.baseline7B.guardrailsPreserved)],
    ]),
    "",
    "## Action Plan Cards",
    ...model.actionPlanCards.map((card) => [
      `### ${card.title}`,
      `- priority: ${card.priority}`,
      `- sourceType: ${card.sourceType}`,
      `- confidence: ${card.confidence}`,
      `- observation: ${card.observation}`,
      `- coachingProblem: ${card.coachingProblem}`,
      `- trainingFocus: ${card.trainingFocus}`,
      `- coachAction: ${card.coachAction}`,
      `- nextMatchObservableSignal: ${card.nextMatchObservableSignal}`,
      `- successIndicator: ${card.successIndicator}`,
      `- riskOrTradeoff: ${card.riskOrTradeoff}`,
      `- estimatedReadTimeSeconds: ${card.estimatedReadTimeSeconds}`,
    ].join("\n")),
    "",
    "## Training Focus Packaging",
    ...table([
      ["Metric", "Value"],
      ["trainingFocusCount", String(model.trainingFocusPackagingAudit.trainingFocusCount)],
      ["primaryTrainingFocusCount", String(model.trainingFocusPackagingAudit.primaryTrainingFocusCount)],
      ["trainingFocusWithWhyCount", String(model.trainingFocusPackagingAudit.trainingFocusWithWhyCount)],
      ["trainingFocusWithCoachCueCount", String(model.trainingFocusPackagingAudit.trainingFocusWithCoachCueCount)],
      ["trainingFocusWithObservableSignalCount", String(model.trainingFocusPackagingAudit.trainingFocusWithObservableSignalCount)],
      ["genericDrillCueCount", String(model.trainingFocusPackagingAudit.genericDrillCueCount)],
    ]),
    "",
    "## Next Match Plan Packaging",
    ...table([
      ["Metric", "Value"],
      ["nextMatchPriorityCount", String(model.nextMatchPlanPackagingAudit.nextMatchPriorityCount)],
      ["concretePriorityCount", String(model.nextMatchPlanPackagingAudit.concretePriorityCount)],
      ["vaguePriorityCount", String(model.nextMatchPlanPackagingAudit.vaguePriorityCount)],
      ["priorityWithObservableSignalCount", String(model.nextMatchPlanPackagingAudit.priorityWithObservableSignalCount)],
      ["priorityWithSuccessIndicatorCount", String(model.nextMatchPlanPackagingAudit.priorityWithSuccessIndicatorCount)],
      ["planReadingTimeEstimate", String(model.nextMatchPlanPackagingAudit.planReadingTimeEstimate)],
    ]),
    "",
    "## Wording Polish Audit",
    ...table([
      ["Metric", "Value"],
      ["duplicatedLabelCount", String(model.wordingPolishAudit.duplicatedLabelCount)],
      ["mechanicalPhraseCount", String(model.wordingPolishAudit.mechanicalPhraseCount)],
      ["awkwardSentenceCount", String(model.wordingPolishAudit.awkwardSentenceCount)],
      ["repeatedPrefixCount", String(model.wordingPolishAudit.repeatedPrefixCount)],
      ["jargonCount", String(model.wordingPolishAudit.jargonCount)],
      ["forbiddenWordingCount", String(model.wordingPolishAudit.forbiddenWordingCount)],
      ["unresolvedTemplatePlaceholderCount", String(model.wordingPolishAudit.unresolvedTemplatePlaceholderCount)],
    ]),
    "",
    "## Warning Codes",
    ...model.warningCodes.map((warning) => `- ${warning}`),
  ].join("\n");
}

export function renderCoachActionPlanCardsTrainingFocusPackaging7CValidation(
  model: CoachActionPlanCardsTrainingFocusPackagingModel = currentGeneratedCoachActionPlanCardsTrainingFocusPackagingModel(),
): string {
  const checks = [
    checkLine("CoachActionPlanCardsTrainingFocusPackagingModel exists", model.scope === "COACH_ACTION_PLAN_CARDS_TRAINING_FOCUS_PACKAGING", model.scope),
    checkLine("baseline 7B visible", model.baselineVersion === "COACH_INSIGHT_DEPTH_NEXT_MATCH_RECOMMENDATIONS_7B", model.baselineVersion),
    checkLine("baseline 7B still PASS", model.baseline7B.status === "PASS" && model.baseline7B.productBaselineReady, `${model.baseline7B.status}/${bool(model.baseline7B.productBaselineReady)}`),
    checkLine("baseline 7B guardrails preserved", model.baseline7B.guardrailsPreserved && model.baseline7B.matchEconomyBaselinePreserved, `${model.baseline7B.status}/${bool(model.baseline7B.guardrailsPreserved)}`),
    checkLine("baseline 7A visible", model.baseline7A.version === "PRODUCT_BASELINE_COACH_REPORT_READINESS_7A", model.baseline7A.version),
    checkLine("baseline 6X preserved", model.matchEconomyBaselinePreserved, bool(model.matchEconomyBaselinePreserved)),
    checkLine("product report ready", model.productReportReady, bool(model.productReportReady)),
    checkLine("export report ready", model.coachExportReady, bool(model.coachExportReady)),
    checkLine("source of truth separation preserved", model.sourceOfTruthSeparationPreserved, bool(model.sourceOfTruthSeparationPreserved)),
    checkLine("action plan cards visible", model.actionPlanCardsAudit.actionPlanCardCount >= 2 && model.actionPlanCardsAudit.actionPlanCardCount <= 3, String(model.actionPlanCardsAudit.actionPlanCardCount)),
    checkLine("exactly one primary action card", model.actionPlanCardsAudit.primaryActionCardCount === 1, String(model.actionPlanCardsAudit.primaryActionCardCount)),
    checkLine("cards have training focus", model.actionPlanCardsAudit.cardWithTrainingFocusCount === model.actionPlanCardsAudit.actionPlanCardCount, `${model.actionPlanCardsAudit.cardWithTrainingFocusCount}/${model.actionPlanCardsAudit.actionPlanCardCount}`),
    checkLine("cards have coach action", model.actionPlanCardsAudit.cardWithCoachActionCount === model.actionPlanCardsAudit.actionPlanCardCount, `${model.actionPlanCardsAudit.cardWithCoachActionCount}/${model.actionPlanCardsAudit.actionPlanCardCount}`),
    checkLine("cards have observable signal", model.actionPlanCardsAudit.cardWithObservableSignalCount === model.actionPlanCardsAudit.actionPlanCardCount, `${model.actionPlanCardsAudit.cardWithObservableSignalCount}/${model.actionPlanCardsAudit.actionPlanCardCount}`),
    checkLine("cards have success indicator", model.actionPlanCardsAudit.cardWithSuccessIndicatorCount === model.actionPlanCardsAudit.actionPlanCardCount, `${model.actionPlanCardsAudit.cardWithSuccessIndicatorCount}/${model.actionPlanCardsAudit.actionPlanCardCount}`),
    checkLine("cards have tradeoff", model.actionPlanCardsAudit.cardWithRiskOrTradeoffCount === model.actionPlanCardsAudit.actionPlanCardCount, `${model.actionPlanCardsAudit.cardWithRiskOrTradeoffCount}/${model.actionPlanCardsAudit.actionPlanCardCount}`),
    checkLine("card read time under 30s", model.actionPlanCardsAudit.cardReadTimeUnder30sCount === model.actionPlanCardsAudit.actionPlanCardCount, `${model.actionPlanCardsAudit.cardReadTimeUnder30sCount}/${model.actionPlanCardsAudit.actionPlanCardCount}`),
    checkLine("training focus packaged", model.trainingFocusPackagingReady, bool(model.trainingFocusPackagingReady)),
    checkLine("next-match plan packaged", model.nextMatchPlanPackaged, bool(model.nextMatchPlanPackaged)),
    checkLine("no forced selection", model.actionPlanCardsAudit.forcedSelectionCardCount === 0, String(model.actionPlanCardsAudit.forcedSelectionCardCount)),
    checkLine("no forced tactical plan", model.actionPlanCardsAudit.forcedTacticalPlanCardCount === 0, String(model.actionPlanCardsAudit.forcedTacticalPlanCardCount)),
    checkLine("no sandbox card in official body", model.actionPlanCardsAudit.sandboxActionCardInOfficialBodyCount === 0, String(model.actionPlanCardsAudit.sandboxActionCardInOfficialBodyCount)),
    checkLine("coach language polished", model.coachLanguagePolished, bool(model.coachLanguagePolished)),
    checkLine("mechanical wording removed", model.mechanicalWordingRemoved, bool(model.mechanicalWordingRemoved)),
    checkLine("no duplicated labels", model.wordingPolishAudit.duplicatedLabelCount === 0, String(model.wordingPolishAudit.duplicatedLabelCount)),
    checkLine("no forbidden wording", model.wordingPolishAudit.forbiddenWordingCount === 0, String(model.wordingPolishAudit.forbiddenWordingCount)),
    checkLine("score constants unchanged", model.baseline7B.scoreConstantsUnchanged, bool(model.baseline7B.scoreConstantsUnchanged)),
    checkLine("MatchBonusEvent unchanged", model.baseline7B.matchBonusEventUnchanged, bool(model.baseline7B.matchBonusEventUnchanged)),
    checkLine("batch/live separation preserved", model.baseline7B.batchLiveSeparationPreserved, bool(model.baseline7B.batchLiveSeparationPreserved)),
    checkLine("guardrails preserved", model.baseline7B.guardrailsPreserved, bool(model.baseline7B.guardrailsPreserved)),
  ];
  const hasFailure = checks.some((line) => line.startsWith("- FAIL"));

  return [
    "# Validation - Coach Action Plan Cards & Training Focus Packaging 7C",
    "",
    `Status: ${hasFailure || model.status !== "PASS" ? model.status : "PASS"}`,
    "",
    "## Required Command",
    "`npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share`",
    "",
    "## Checks",
    ...checks,
    "",
    "## Counts",
    `- actionPlanCardCount: ${model.actionPlanCardsAudit.actionPlanCardCount}`,
    `- primaryActionCardCount: ${model.actionPlanCardsAudit.primaryActionCardCount}`,
    `- trainingFocusCount: ${model.trainingFocusPackagingAudit.trainingFocusCount}`,
    `- nextMatchPriorityCount: ${model.nextMatchPlanPackagingAudit.nextMatchPriorityCount}`,
    `- forcedSelectionCardCount: ${model.actionPlanCardsAudit.forcedSelectionCardCount}`,
    `- forcedTacticalPlanCardCount: ${model.actionPlanCardsAudit.forcedTacticalPlanCardCount}`,
    `- sandboxActionCardInOfficialBodyCount: ${model.actionPlanCardsAudit.sandboxActionCardInOfficialBodyCount}`,
    `- duplicatedLabelCount: ${model.wordingPolishAudit.duplicatedLabelCount}`,
    `- mechanicalPhraseCount: ${model.wordingPolishAudit.mechanicalPhraseCount}`,
    `- forbiddenWordingCount: ${model.wordingPolishAudit.forbiddenWordingCount}`,
    `- productBaselineReady: ${model.productBaselineReady}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
  ].join("\n");
}
