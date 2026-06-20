import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportDatabaseAdapterSpikeCopy(): readonly string[] {
  const { databaseAdapterSpike, exportHtml } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(databaseAdapterSpike.visibleRecommendationWordingCount === 0, "visible recommendation wording count is 0.");
  assertTest(databaseAdapterSpike.visibleSelectionWordingCount === 0, "visible selection wording count is 0.");
  assertTest(databaseAdapterSpike.internalStatusLeakCount === 0, "internal status leak count is 0.");
  assertTest(databaseAdapterSpike.mojibakeMarkerCount === 0, "mojibake marker count is 0.");
  assertTest(exportHtml.includes("Active product history source") && exportHtml.includes("file_backed"), "export states product report remains file-backed.");
  assertTest(exportHtml.includes("aucune base r&eacute;elle n&rsquo;est lue ou &eacute;crite"), "export states no real database IO.");

  return [
    "visible recommendation and selection wording counts are 0",
    "internal status and mojibake counts are 0",
    "export copy states file-backed product boundary and no real database IO",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportDatabaseAdapterSpikeCopy();
  console.log("coachReportDatabaseAdapterSpikeCopy tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
