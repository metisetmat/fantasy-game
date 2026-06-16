import type { CoachProductReportViewModel } from "./coachProductReportView";
import {
  buildCoachProductReportPolishTags,
  type CoachProductReportPolishModel,
} from "./coachProductReportPolish";

const forbiddenVisibleJargonTerms = [
  "sandbox_only",
  "trace_supported",
  "officially_confirmed",
  "workbench",
  "route resolution",
  "production route",
  "canDriveLiveSelection",
  "global economy claim",
  "score mutation",
  "possession mutation",
  "internalTags",
] as const;

const forbiddenOfficialSelectionTerms = [
  "composition recommandée",
  "meilleure sélection",
  "le coach doit sélectionner",
] as const;

const internalRoleIdTerms = [
  "support_near_z4_hsr_profile",
  "second_ball_presence_profile",
  "strong_goalkeeper_response_profile",
  "goalkeeper_response_profile",
  "_profile",
] as const;

const internalAttributeIdTerms = [
  "decision_making",
  "off_ball_support",
  "mental_freshness",
  "tactical_discipline",
  "technical_mastery",
] as const;

function countMatches(text: string, terms: readonly string[]): number {
  const lower = text.toLocaleLowerCase("fr-FR");

  return terms.reduce((count, term) => count + (lower.includes(term.toLocaleLowerCase("fr-FR")) ? 1 : 0), 0);
}

function visibleProductText(view: CoachProductReportViewModel): string {
  return [
    view.matchId,
    view.scoreLabel,
    view.scoreSourceNote,
    ...view.executiveSummary,
    ...view.officialMatchReading,
    ...view.keyCoachSignals.flatMap((signal) => [
      signal.title,
      signal.summary,
      signal.sourceLabel,
      signal.confidenceLabel,
      ...signal.evidenceSummary,
      signal.coachMeaning,
    ]),
    ...view.profilesToObserve.flatMap((profile) => [
      profile.title,
      ...profile.roleFamilies,
      ...profile.usefulAttributes,
      ...profile.whyObserve,
      ...profile.traceSupport,
      ...profile.expectedBenefit,
      ...profile.tacticalRisk,
      ...profile.nextMatchSignal,
      profile.nonAppliedLabel,
      profile.confirmationLabel,
    ]),
    ...(view.playerCandidateComparisonView?.profileBlocks.flatMap((block) => [
      block.profileTitle,
      block.profileSummary,
      ...(block.emptyState === null ? [] : [block.emptyState]),
      ...block.comparisonSummary,
      ...block.cards.flatMap((card) => [
        card.playerName,
        card.roleLabel,
        card.fitBandLabel,
        card.nonAppliedLabel,
        card.confirmationLabel,
        card.shortWhyVisible,
        card.strongestVisibleAsset,
        card.mainGapOrCheck,
        card.mainRisk,
        card.nextObservationSignal,
        ...card.matchedAttributes,
        ...card.partialAttributes,
        ...card.missingAttributes,
        ...card.visibleTraits,
        ...card.limitNotes,
      ]),
    ]) ?? []),
    ...view.nextMatchSignals,
  ].join(" ");
}

function guardrailsIntact(view: CoachProductReportViewModel): boolean {
  return view.profileAppliedCount === 0 &&
    view.officiallyConfirmedCount === 0 &&
    view.confidenceUpgradeCount === 0 &&
    view.diagnosticAggregatesKeptSeparate &&
    view.sandboxAggregatesKeptSeparate &&
    view.officialAggregatesUsedAsSupportOnly &&
    !view.canChangeLineup &&
    !view.canChangeStarters &&
    !view.canChangeBench &&
    !view.canDriveCoachInstruction &&
    !view.canDriveLiveSelection &&
    !view.canDriveProductionRouteResolution &&
    !view.canMutateTimeline &&
    !view.canMutateScore &&
    !view.canMutatePossession &&
    !view.canCreateScoringEvent &&
    !view.canClaimGlobalEconomy &&
    view.scoringConstantsUnchanged &&
    view.matchBonusEventUnchanged &&
    view.fullMatchBatchEconomyRemainsOnlyGlobalProof;
}

function modelWithoutTags(input: Omit<CoachProductReportPolishModel, "tags">): CoachProductReportPolishModel {
  return {
    ...input,
    tags: buildCoachProductReportPolishTags(input),
  };
}

export function buildCoachProductReportPolish(input: {
  readonly productReportView: CoachProductReportViewModel;
}): CoachProductReportPolishModel {
  const view = input.productReportView;

  if (view.status !== "available") {
    return modelWithoutTags({
      status: "not_available",
      origin: "coach_product_report_view",
      productReportFileGenerated: true,
      productReportReviewReady: false,
      visualHierarchyStatus: "not_available",
      headerPolished: false,
      executiveSummaryCompact: false,
      keySignalsReadable: false,
      profileCardsReadable: false,
      nextMatchSignalsReadable: false,
      appendicesLessIntrusive: false,
      printFriendly: false,
      sectionCount: view.sectionCount,
      keySignalCount: view.keyCoachSignals.length,
      profileCardCount: view.profilesToObserve.length,
      nextMatchSignalCount: view.nextMatchSignals.length,
      appendixCount: view.appendices.length,
      mainReportVisibleJargonCount: view.productVisibleJargonCount,
      mainReportInternalStatusLeakCount: view.productVisibleInternalStatusLeakCount,
      mainReportInternalRoleIdLeakCount: 0,
      mainReportInternalAttributeIdLeakCount: 0,
      mainReportOfficialSelectionWordingCount: view.productVisibleOfficialSelectionWordingCount,
      mojibakeMarkerCount: 0,
      profileAppliedCount: 0,
      officiallyConfirmedCount: 0,
      confidenceUpgradeCount: 0,
      diagnosticAggregatesKeptSeparate: true,
      sandboxAggregatesKeptSeparate: true,
      officialAggregatesUsedAsSupportOnly: true,
      canChangeLineup: false,
      canChangeStarters: false,
      canChangeBench: false,
      canDriveCoachInstruction: false,
      canDriveLiveSelection: false,
      canDriveProductionRouteResolution: false,
      canMutateTimeline: false,
      canMutateScore: false,
      canMutatePossession: false,
      canCreateScoringEvent: false,
      canClaimGlobalEconomy: false,
      scoringConstantsUnchanged: true,
      matchBonusEventUnchanged: true,
      fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
      warnings: ["Coach Product Report Polish requires an available Coach Product Report View."],
    });
  }

  const visibleText = visibleProductText(view);
  const mainReportVisibleJargonCount = countMatches(visibleText, forbiddenVisibleJargonTerms);
  const mainReportInternalStatusLeakCount = countMatches(visibleText, ["sandbox_only", "trace_supported", "officially_confirmed"]);
  const mainReportInternalRoleIdLeakCount = countMatches(visibleText, internalRoleIdTerms);
  const mainReportInternalAttributeIdLeakCount = countMatches(visibleText, internalAttributeIdTerms);
  const mainReportOfficialSelectionWordingCount = countMatches(visibleText, forbiddenOfficialSelectionTerms);
  const headerPolished = view.matchId.length > 0 && view.scoreLabel.length > 0 && view.scoreSourceNote.length > 0;
  const executiveSummaryCompact = view.executiveSummary.length >= 3 && view.executiveSummary.length <= 4;
  const keySignalsReadable = view.keyCoachSignals.length === 3 &&
    view.keyCoachSignals.every((signal) =>
      signal.title.length > 0 &&
      signal.summary.length > 0 &&
      signal.evidenceSummary.length > 0 &&
      signal.coachMeaning.length > 0
    );
  const profileCardsReadable = view.profilesToObserve.length === 3 &&
    view.profilesToObserve.every((profile) =>
      profile.roleFamilies.length > 0 &&
      profile.usefulAttributes.length > 0 &&
      profile.whyObserve.length > 0 &&
      profile.expectedBenefit.length > 0 &&
      profile.tacticalRisk.length > 0
    );
  const comparisonView = view.playerCandidateComparisonView;
  const playerMatchupsReadable = comparisonView !== undefined &&
    comparisonView.status !== "not_available" &&
    comparisonView.profileBlockCount === 3 &&
    comparisonView.profileBlocks.every((block) =>
      block.compactCandidateCount <= 3 &&
      (block.cards.length > 0 || block.emptyState !== null) &&
      block.comparisonSummary.length > 0
    );
  const nextMatchSignalsReadable = view.nextMatchSignals.length >= 3 && view.nextMatchSignals.length <= 5;
  const appendicesLessIntrusive = view.appendices.length > 0 && view.appendices.every((appendix) => appendix.defaultCollapsed);
  const printFriendly = true;
  const noLeaks = mainReportVisibleJargonCount === 0 &&
    mainReportInternalStatusLeakCount === 0 &&
    mainReportInternalRoleIdLeakCount === 0 &&
    mainReportInternalAttributeIdLeakCount === 0 &&
    mainReportOfficialSelectionWordingCount === 0 &&
    view.mojibakeMarkerCount === 0;
  const productReportReviewReady = headerPolished &&
    executiveSummaryCompact &&
    keySignalsReadable &&
    profileCardsReadable &&
    playerMatchupsReadable &&
    nextMatchSignalsReadable &&
    appendicesLessIntrusive &&
    printFriendly &&
    noLeaks &&
    guardrailsIntact(view);

  return modelWithoutTags({
    status: "available",
    origin: "coach_product_report_view",
    productReportFileGenerated: true,
    productReportReviewReady,
    visualHierarchyStatus: productReportReviewReady ? "review_ready" : "basic",
    headerPolished,
    executiveSummaryCompact,
    keySignalsReadable,
    profileCardsReadable,
    nextMatchSignalsReadable,
    appendicesLessIntrusive,
    printFriendly,
    sectionCount: view.sectionCount,
    keySignalCount: view.keyCoachSignals.length,
    profileCardCount: view.profilesToObserve.length,
    nextMatchSignalCount: view.nextMatchSignals.length,
    appendixCount: view.appendices.length,
    mainReportVisibleJargonCount,
    mainReportInternalStatusLeakCount,
    mainReportInternalRoleIdLeakCount,
    mainReportInternalAttributeIdLeakCount,
    mainReportOfficialSelectionWordingCount,
    mojibakeMarkerCount: 0,
    profileAppliedCount: 0,
    officiallyConfirmedCount: 0,
    confidenceUpgradeCount: 0,
    diagnosticAggregatesKeptSeparate: true,
    sandboxAggregatesKeptSeparate: true,
    officialAggregatesUsedAsSupportOnly: true,
    canChangeLineup: false,
    canChangeStarters: false,
    canChangeBench: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canMutateTimeline: false,
    canMutateScore: false,
    canMutatePossession: false,
    canCreateScoringEvent: false,
    canClaimGlobalEconomy: false,
    scoringConstantsUnchanged: true,
    matchBonusEventUnchanged: true,
    fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
    warnings: productReportReviewReady ? [] : ["Coach Product Report Polish is still visually basic or has visible-copy issues."],
  });
}
