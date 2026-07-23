import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { CoachReplayUXIterationView8G } from "./coachReplayUXIterationTypes8G";
import type { CoachReplayUXIterationWarningCode } from "./coachReplayUXIterationWarnings";

export interface CoachReplayIntegrationBudgetAudit8G {
  readonly status: OfficialCausalityStatus;
  readonly productReplaySectionVisible: boolean;
  readonly exportReplaySectionVisible: boolean;
  readonly productStoryStillVisible: boolean;
  readonly exportStoryStillVisible: boolean;
  readonly actionPlanStillVisible: boolean;
  readonly tacticalMapCardsStillVisible: boolean;
  readonly trendsStillVisible: boolean;
  readonly sequenceCausalityStillVisible: boolean;
  readonly actorMappingStillVisible: boolean;
  readonly naturalReplayStillVisible: boolean;
  readonly naturalReplayContentPreserved: boolean;
  readonly legacyNaturalReplaySectionVisible: boolean;
  readonly exportReadTimeSecondsBefore8G: number;
  readonly exportReadTimeSecondsAfter8G: number;
  readonly exportReadTimeDelta: number;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly productReplayMomentCardCount: number;
  readonly exportReplayMomentCardCount: number;
  readonly reportIntegrationWarningCodes: readonly CoachReplayUXIterationWarningCode[];
  readonly recommendation: string;
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function readTimeSeconds(html: string): number {
  const words = stripTags(html).split(/\s+/u).filter((word) => word.length > 0).length;
  return Math.ceil(words / 3);
}

function countMatches(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

function sectionInner(html: string, sectionId: string): string {
  const start = html.indexOf(`id="${sectionId}"`);
  if (start < 0) return "";
  const sectionStart = html.lastIndexOf("<section", start);
  const end = html.indexOf("</section>", start);
  return html.slice(sectionStart < 0 ? start : sectionStart, end < 0 ? html.length : end + "</section>".length);
}

export function auditCoachReplayIntegrationBudget8G(input: {
  readonly view: CoachReplayUXIterationView8G;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
  readonly exportReadTimeSecondsBefore8G: number;
}): CoachReplayIntegrationBudgetAudit8G {
  const productReplaySectionVisible = input.productReportHtml.includes('id="coach-replay-8e"') &&
    input.productReportHtml.includes('data-replay-ux-version="8G"');
  const exportReplaySectionVisible = input.exportReportHtml.includes("Replay coach en 60 secondes") &&
    input.exportReportHtml.includes('data-replay-ux-version="8G"');
  const productStoryStillVisible = input.productReportHtml.includes('id="official-match-reading"') ||
    input.productReportHtml.includes('id="official-match-story-spine"');
  const exportStoryStillVisible = input.exportReportHtml.includes('id="match-story"') ||
    input.exportReportHtml.includes("Le match en 2 minutes");
  const actionPlanStillVisible = input.productReportHtml.includes('id="coach-action-plan"') || input.productReportHtml.includes("Plan d'action");
  const tacticalMapCardsStillVisible = input.productReportHtml.includes("tactical-map-card");
  const trendsStillVisible = input.productReportHtml.includes("multi-match-trend-signals") || input.productReportHtml.includes("trend-card");
  const sequenceCausalityStillVisible = input.productReportHtml.includes("sequence-causality-8d");
  const actorMappingStillVisible = input.productReportHtml.includes("Space Hunter") &&
    input.productReportHtml.includes("Left Piston hybride");
  const legacyNaturalReplaySectionVisible = input.productReportHtml.includes("replay-narratif-8f");
  const naturalReplayContentPreserved = input.view.momentCards.every((card) => {
    const [scoreBefore, scoreAfter] = card.scoreLabel.split(/\s*->\s*/u);
    return input.productReportHtml.includes(card.actorRoleLine) &&
      (scoreBefore === undefined || input.productReportHtml.includes(scoreBefore)) &&
      (scoreAfter === undefined || input.productReportHtml.includes(scoreAfter));
  });
  const naturalReplayStillVisible = naturalReplayContentPreserved;
  const exportReadTimeSecondsAfter8G = input.exportReadTimeSecondsBefore8G + readTimeSeconds(sectionInner(input.exportReportHtml, "coach-replay-8e"));
  const exportUnder900Seconds = exportReadTimeSecondsAfter8G <= 900;
  const exportUnder800Seconds = exportReadTimeSecondsAfter8G <= 800;
  const productReplayMomentCardCount = input.view.momentCards.filter((card) => card.isVisibleInProduct).length;
  const exportReplayMomentCardCount = countMatches(input.exportReportHtml, /<li><strong>[\s\S]*?<\/li>/giu);
  const warningCodes: CoachReplayUXIterationWarningCode[] = [];
  if (!exportUnder900Seconds) warningCodes.push("EXPORT_LENGTH_REGRESSED");
  if (!productReplaySectionVisible || !exportReplaySectionVisible || !productStoryStillVisible || !exportStoryStillVisible ||
    !actionPlanStillVisible || !tacticalMapCardsStillVisible || !trendsStillVisible || !sequenceCausalityStillVisible ||
    !actorMappingStillVisible || !naturalReplayStillVisible) {
    warningCodes.push("COACH_REPLAY_UX_ITERATION_FAIL");
  }
  if (warningCodes.length === 0) warningCodes.push("REPLAY_EXPORT_READY", "EXPORT_LENGTH_PRESERVED");
  const pass = productReplaySectionVisible &&
    exportReplaySectionVisible &&
    productStoryStillVisible &&
    exportStoryStillVisible &&
    actionPlanStillVisible &&
    tacticalMapCardsStillVisible &&
    trendsStillVisible &&
    sequenceCausalityStillVisible &&
    actorMappingStillVisible &&
    naturalReplayStillVisible &&
    exportUnder900Seconds &&
    productReplayMomentCardCount >= 4 &&
    productReplayMomentCardCount <= 7 &&
    exportReplayMomentCardCount <= 3;

  return {
    status: pass ? "PASS" : "FAIL",
    productReplaySectionVisible,
    exportReplaySectionVisible,
    productStoryStillVisible,
    exportStoryStillVisible,
    actionPlanStillVisible,
    tacticalMapCardsStillVisible,
    trendsStillVisible,
    sequenceCausalityStillVisible,
    actorMappingStillVisible,
    naturalReplayStillVisible,
    naturalReplayContentPreserved,
    legacyNaturalReplaySectionVisible,
    exportReadTimeSecondsBefore8G: input.exportReadTimeSecondsBefore8G,
    exportReadTimeSecondsAfter8G,
    exportReadTimeDelta: exportReadTimeSecondsAfter8G - input.exportReadTimeSecondsBefore8G,
    exportUnder900Seconds,
    exportUnder800Seconds,
    productReplayMomentCardCount,
    exportReplayMomentCardCount,
    reportIntegrationWarningCodes: warningCodes,
    recommendation: pass ? "KEEP_REPLAY_INTEGRATION_BUDGET_8G" : "REVIEW_REPLAY_INTEGRATION_BUDGET_8G",
  };
}
