import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportDurableStorageDecisionCopy(): readonly string[] {
  const { durableStorageDecision, exportHtml } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(durableStorageDecision.visibleRecommendationWordingCount === 0, "visible recommendation wording count is 0.");
  assertTest(durableStorageDecision.visibleSelectionWordingCount === 0, "visible selection wording count is 0.");
  assertTest(durableStorageDecision.internalStatusLeakCount === 0, "internal status leak count is 0.");
  assertTest(durableStorageDecision.mojibakeMarkerCount === 0, "mojibake marker count is 0.");
  assertTest(durableStorageDecision.activeProductHistorySource === "file_backed" || exportHtml.includes("file_backed"), "export states file_backed remains active.");
  assertTest(durableStorageDecision.realDatabaseReadCount === 0 && durableStorageDecision.realDatabaseWriteCount === 0, "export states real DB counters remain 0.");
  assertTest(!exportHtml.includes("DB active"), "export does not say DB active.");

  return [
    "visible wording counters are 0",
    "export states file_backed active and DB counters 0",
    "export does not say DB active",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportDurableStorageDecisionCopy();
  console.log("coachReportDurableStorageDecisionCopy tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
