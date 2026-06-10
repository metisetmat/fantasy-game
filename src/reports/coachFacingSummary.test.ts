import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import {
  coachFacingKeyMomentSummary,
  coachFacingWarningSummaryByType,
  isTechnicalContextLeak,
} from "./coachFacingSummary";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function visibleHtml(html: string): string {
  return html.replace(/<details[\s\S]*?<\/details>/g, "");
}

export function validateCoachFacingSummaryBoundary(): readonly string[] {
  assertTest(isTechnicalContextLeak("Final danger LOW"), "Final danger should be detected as a technical leak.");
  assertTest(isTechnicalContextLeak("Score context 0-0"), "Score context should be detected as a technical leak.");
  assertTest(isTechnicalContextLeak("Plan influence: tempo balanced"), "Plan influence should be detected as a technical leak.");
  assertTest(isTechnicalContextLeak("Adapter influence is intentionally limited"), "Adapter influence should be detected as a technical leak.");
  assertTest(!isTechnicalContextLeak("BLITZ subit une sequence de pression sans convertir."), "Clean French coach copy should not be a technical leak.");

  const fallbackSummary = coachFacingKeyMomentSummary({
    title: "Signal de pression",
    evidenceSummary: "Final danger LOW. Score context 0-0.",
    eventContext: "Plan influence: tempo balanced.",
    teamId: "BLITZ",
    zone: "Z3-C",
    category: "PRESSURE_WITHOUT_CONVERSION",
  });
  assertTest(!isTechnicalContextLeak(fallbackSummary), "Generated key moment fallback summary must be coach-facing clean.");

  const warningSummary = coachFacingWarningSummaryByType({
    warningType: "INFLATED_SINGLE_RUN_SCORE",
    fallbackSummary: "FULL_MATCH_HARNESS_SINGLE_RUN",
    score: { home: 51, away: 0 },
  });
  assertTest(!isTechnicalContextLeak(warningSummary), "Generated warning coach summary must be coach-facing clean.");

  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture);
  for (const moment of report.keyMoments) {
    assertTest(!isTechnicalContextLeak(moment.summary), `Key moment ${moment.eventId} summary must not leak technical context.`);
  }
  for (const warning of report.warnings) {
    assertTest(!isTechnicalContextLeak(warning.coachSummary), `Warning ${warning.warningId} coach summary must not leak technical context.`);
  }

  const html = renderHtmlCoachReport(report);
  assertTest(!isTechnicalContextLeak(visibleHtml(html)), "Visible coach HTML must not leak technical context.");
  assertTest(html.includes("FULL_MATCH_HARNESS_SINGLE_RUN"), "Internal technical details may preserve harness scope enum.");

  return [
    "technical leak detector catches Final danger",
    "technical leak detector catches Score context",
    "technical leak detector catches Plan influence",
    "technical leak detector catches Adapter influence",
    "clean coach copy is accepted",
    "generated key moment summaries contain no technical leaks",
    "generated warning coach summaries contain no technical leaks",
    "generated coach HTML visible copy contains no technical leaks",
    "internal details may still contain technical markers",
  ];
}

if (require.main === module) {
  const checks = validateCoachFacingSummaryBoundary();

  console.log("Coach-facing summary boundary tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
