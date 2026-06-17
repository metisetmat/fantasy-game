import type { MatchInput } from "../contracts/engineToCoach";
import { runFullMatch } from "../simulation/runFullMatch";
import {
  FULL_MATCH_TRACE_VALIDATION_PROFILES,
  type FullMatchTraceValidationProfileId,
} from "../simulation/validation/fullMatchTraceValidationProfiles";
import { buildCoachReportExportSnapshot } from "./buildCoachReportExportSnapshot";
import { buildCoachReportPhaseVisualReadability } from "./buildCoachReportPhaseVisualReadability";
import { buildCoachReportPhaseVisuals } from "./buildCoachReportPhaseVisuals";
import { buildCoachReportPremiumLayout } from "./buildCoachReportPremiumLayout";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import type { CoachReportPhaseVisualReadabilityModel } from "./coachReportPhaseVisualReadability";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { renderCoachReportExportHtml } from "./renderCoachReportExportHtml";

const DEFAULT_MULTI_MATCH_PHASE_COMPARISON_PROFILE_IDS = [
  "high_press_profile",
  "low_block_profile",
  "strong_goalkeeper_profile",
] as const satisfies readonly FullMatchTraceValidationProfileId[];

function buildPhaseReadabilityForMatchInput(matchInput: MatchInput): CoachReportPhaseVisualReadabilityModel {
  const report = runFullMatch(matchInput, {
    routeSelectionMode: "workbench_chain_replay_experimental",
    enableCoachReportMultiMatchPhaseComparison: false,
  });
  const productView = buildCoachProductReportViewFromMatchReport(report, matchInput.homeTeam.roster);
  const productHtml = renderCoachProductReport(productView);
  const exportSnapshot = buildCoachReportExportSnapshot({
    productReportHtml: productHtml,
    productReportPath: "reports/coach-report.product.html",
  });
  const exportHtml = renderCoachReportExportHtml({
    productReportHtml: productHtml,
  });
  const premiumLayout = buildCoachReportPremiumLayout({
    exportSnapshot,
    productReportHtml: productHtml,
    exportReportHtml: exportHtml,
  });
  const phaseVisuals = buildCoachReportPhaseVisuals({
    premiumLayout,
    productReportHtml: productHtml,
    exportReportHtml: exportHtml,
  });

  return buildCoachReportPhaseVisualReadability({
    phaseVisuals,
    productReportHtml: productHtml,
    exportReportHtml: exportHtml,
  });
}

export function buildCoachReportMultiMatchPhaseComparisonSamples(input?: {
  readonly profileIds?: readonly FullMatchTraceValidationProfileId[];
}): readonly CoachReportPhaseVisualReadabilityModel[] {
  const requestedProfileIds = input?.profileIds ?? DEFAULT_MULTI_MATCH_PHASE_COMPARISON_PROFILE_IDS;

  return requestedProfileIds
    .map((profileId) => FULL_MATCH_TRACE_VALIDATION_PROFILES.find((profile) => profile.profileId === profileId))
    .filter((profile): profile is (typeof FULL_MATCH_TRACE_VALIDATION_PROFILES)[number] => profile !== undefined)
    .map((profile) => buildPhaseReadabilityForMatchInput(profile.createInput()));
}

export function defaultMultiMatchPhaseComparisonProfileIds(): readonly FullMatchTraceValidationProfileId[] {
  return DEFAULT_MULTI_MATCH_PHASE_COMPARISON_PROFILE_IDS;
}
