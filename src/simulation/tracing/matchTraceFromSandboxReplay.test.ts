import { matchTraceCannotDriveProduction, matchTraceCannotMutateOfficialState } from "./matchTraceEvent";
import { matchTraceFromSandboxReplay, type SandboxReplayEventLike } from "./matchTraceFromSandboxReplay";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateMatchTraceFromSandboxReplay(): readonly string[] {
  const event: SandboxReplayEventLike = {
    sandboxEventId: "sandbox-event-1",
    sandboxIndex: 1,
    sandboxMinuteOffset: 2,
    eventType: "sandbox_goalkeeper_response",
    sourceStepId: "step-1",
    sourceStepType: "shot_resolution",
    actorId: "blitz-gk",
    teamCandidate: "blitz",
    targetZone: "Z3-HSR",
    outcome: "save_made",
    confidence: 72,
    createsOfficialMatchEvent: false,
    insertedIntoOfficialTimeline: false,
    mutatesOfficialTimeline: false,
    mutatesOfficialPossession: false,
    mutatesOfficialScore: false,
    mutatesOfficialScoringEvents: false,
    createsProductionScoringEvent: false,
    mutatesProductionRouteResolution: false,
    reasons: ["goalkeeper positioned well"],
    tags: ["sandbox_fixture"],
    warnings: [],
  };
  const trace = matchTraceFromSandboxReplay({
    event,
    matchId: "match-1",
    minute: 33,
    sequenceId: "sandbox-sequence-1",
    teamId: "control",
    opponentTeamId: "blitz",
  });

  assertTest(trace.source === "sandbox_event", "sandbox source must be preserved.");
  assertTest(!trace.officialTruth, "sandbox trace must not be official truth.");
  assertTest(trace.actionType === "GOALKEEPER_SAVE", "sandbox goalkeeper response must map to save action.");
  assertTest(trace.outcome === "SAVE_MADE", "sandbox save outcome must be preserved.");
  assertTest(matchTraceCannotMutateOfficialState(trace), "sandbox trace cannot mutate official state.");
  assertTest(matchTraceCannotDriveProduction(trace), "sandbox trace cannot drive live or production selection.");
  assertTest(!trace.canClaimGlobalEconomy, "sandbox trace cannot claim global economy.");

  return [
    "sandbox event converts to non-official trace",
    "sandbox trace cannot mutate timeline, score, possession, or scoring events",
    "sandbox trace cannot drive live selection, production route resolution, or global economy",
  ];
}

if (require.main === module) {
  const checks = validateMatchTraceFromSandboxReplay();

  console.log("matchTraceFromSandboxReplay tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
