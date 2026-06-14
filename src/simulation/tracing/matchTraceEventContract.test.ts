import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { matchTraceFromMatchEvent } from "./matchTraceFromMatchEvent";
import {
  matchTraceCannotDriveProduction,
  matchTraceCannotMutateOfficialState,
  validateMatchTraceEvent,
} from "./matchTraceEvent";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateMatchTraceEventContract(): readonly string[] {
  const trace = matchTraceFromMatchEvent({
    event: engineToCoachPublicContractFixtures.eventFixture,
  });

  assertTest(trace.source === "official_match_event", "trace event must have source.");
  assertTest(trace.phase !== undefined, "trace event must have phase.");
  assertTest(trace.zone.length > 0, "trace event must have zone.");
  assertTest(trace.actionType !== undefined, "trace event must have action type.");
  assertTest(trace.outcome !== undefined, "trace event must have outcome.");
  assertTest(trace.causeTags.length > 0, "trace event must have cause tags.");
  assertTest(trace.impactTags.length > 0, "trace event must have impact tags.");
  assertTest(trace.diagnosticWeight >= 0, "trace event must have diagnostic weight.");
  assertTest(trace.officialTruth, "trace event must expose officialTruth.");
  assertTest(matchTraceCannotMutateOfficialState(trace), "trace cannot mutate official state.");
  assertTest(matchTraceCannotDriveProduction(trace), "trace cannot drive production.");
  assertTest(validateMatchTraceEvent(trace).length === 0, "trace validation must pass.");

  return [
    "trace event has source, phase, zone, action type, outcome, cause tags, impact tags, diagnosticWeight, and officialTruth",
    "trace cannot mutate timeline, score, possession, or scoring events",
    "trace cannot drive coach instruction, live selection, production route resolution, or global economy",
  ];
}

if (require.main === module) {
  const checks = validateMatchTraceEventContract();

  console.log("matchTraceEventContract tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
