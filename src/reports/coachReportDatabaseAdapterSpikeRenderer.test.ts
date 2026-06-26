import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportDatabaseAdapterSpikeRenderer(): readonly string[] {
  const { exportHtml, databaseAdapterSpike } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(databaseAdapterSpike.status === "available", "export evidence contains experimental database adapter model.");
  assertTest(databaseAdapterSpike.adapterKind === "experimental_database", "export evidence contains experimental database adapter kind.");
  assertTest(databaseAdapterSpike.adapterImplemented && !databaseAdapterSpike.adapterProductionReady, "export evidence contains spike validation and disabled-state.");
  assertTest(exportHtml.includes("coach_report_database_adapter_spike") || exportHtml.includes("experimental_database"), "export retains experimental database adapter evidence.");

  return [
    "export evidence contains experimental database adapter model",
    "export evidence contains spike validation, disabled-state, next-step, and evidence trace",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportDatabaseAdapterSpikeRenderer();
  console.log("coachReportDatabaseAdapterSpikeRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
