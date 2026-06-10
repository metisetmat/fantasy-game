import { sequence1Action1WorkbenchTruth } from "../grounding/fixtures/sequence1Action1.fixture";
import { createWorkbenchReplayMatchInput } from "../grounding/runWorkbenchReplaySeed";
import { workbenchToSpatialMatchContext } from "./workbenchToSpatialMatchContext";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateWorkbenchToSpatialMatchContext(): readonly string[] {
  const matchInput = createWorkbenchReplayMatchInput(sequence1Action1WorkbenchTruth);
  const before = workbenchToSpatialMatchContext({
    matchInput,
    workbench: sequence1Action1WorkbenchTruth,
    frame: "before",
  });
  const after = workbenchToSpatialMatchContext({
    matchInput,
    workbench: sequence1Action1WorkbenchTruth,
    frame: "after",
  });
  const beforeControlMl = before.home.players.find((player) => player.playerId === "control-mobile-lock");

  assertTest(before.possessionTeamId === "control", "possession team must be CONTROL.");
  assertTest(before.defendingTeamId === "blitz", "defending team must be BLITZ.");
  assertTest(before.ballCarrierId === "control-tempo-half", "before ball carrier must be CONTROL TH.");
  assertTest(before.ballZone === "Z4-HSL", "before ball zone must be Z4-HSL.");
  assertTest(beforeControlMl?.zone === "Z3-HSL", "CONTROL ML must exist at Z3-HSL before action.");
  assertTest(after.ballCarrierId === "control-mobile-lock", "after new carrier must be CONTROL ML.");
  assertTest(after.ballZone === "Z3-HSL", "after ball zone must be Z3-HSL.");

  return [
    "sequence-1-action-1 before frame becomes SpatialMatchContext",
    "possession and defending teams are preserved",
    "CONTROL ML before zone is preserved",
    "after frame new carrier and ball zone are preserved",
  ];
}

if (require.main === module) {
  const checks = validateWorkbenchToSpatialMatchContext();

  console.log("workbenchToSpatialMatchContext tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
