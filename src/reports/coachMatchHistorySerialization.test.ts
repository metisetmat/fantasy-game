import {
  parseCoachMatchHistoryRecords,
  serializeCoachMatchHistoryRecords,
} from "./history/coachMatchHistorySerialization";
import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";
import { buildCoachMatchHistoryRecord } from "./history/buildCoachMatchHistoryRecord";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachMatchHistorySerialization(): readonly string[] {
  const { report, productHtml, exportHtml, historyView } = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const recordA = buildCoachMatchHistoryRecord({
    matchReport: report,
    productReportHtml: productHtml,
    exportReportHtml: exportHtml,
    multiMatchHistoryView: historyView,
    source: "simulated_match_history",
    runId: "serialization-a",
    generatedAtIso: "2026-06-19T00:00:01.000Z",
  });
  const recordB = buildCoachMatchHistoryRecord({
    matchReport: report,
    productReportHtml: productHtml,
    exportReportHtml: exportHtml,
    multiMatchHistoryView: historyView,
    source: "product_history_store",
    runId: "serialization-b",
    generatedAtIso: "2026-06-19T00:00:00.000Z",
  });
  const input = [recordA, recordB];
  const timelineBefore = JSON.stringify(input);
  const json = serializeCoachMatchHistoryRecords(input);
  const parsed = parseCoachMatchHistoryRecords(json);

  assertTest(json.includes('"historyRecordId"'), "records serialize to stable JSON.");
  assertTest(parsed.length === 2, "records parse from JSON.");
  assertTest(parsed[0]?.generatedAtIso === "2026-06-19T00:00:00.000Z", "record order is deterministic.");
  assertTest(JSON.stringify(input) === timelineBefore, "serialization does not mutate input records.");

  let malformedJsonHandled = false;
  try {
    parseCoachMatchHistoryRecords("{ malformed");
  } catch {
    malformedJsonHandled = true;
  }
  assertTest(malformedJsonHandled, "malformed JSON is handled safely.");

  let malformedRecordHandled = false;
  try {
    parseCoachMatchHistoryRecords('[{"historyRecordId":"broken"}]');
  } catch {
    malformedRecordHandled = true;
  }
  assertTest(malformedRecordHandled, "malformed records do not create valid history silently.");

  return [
    "records serialize to stable JSON",
    "records parse from JSON",
    "order is deterministic",
    "malformed JSON is handled safely",
    "malformed records do not create valid history silently",
    "serialization does not mutate input records",
  ];
}

if (require.main === module) {
  const checks = validateCoachMatchHistorySerialization();
  console.log("coachMatchHistorySerialization tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
