import { scoringRegistryEntry } from "../../systems/scoring";
import { adaptMatchInputToMiniMatch } from "../adapters/matchInputToMiniMatch";
import { sequence1Action1WorkbenchTruth } from "../grounding/fixtures/sequence1Action1.fixture";
import { createWorkbenchReplayMatchInput } from "../grounding/runWorkbenchReplaySeed";
import { workbenchToSpatialMatchContext } from "../spatialContext";
import { runMiniMatch } from "./runMiniMatch";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateMiniMatchSpatialSelection(): readonly string[] {
  const replayInput = createWorkbenchReplayMatchInput(sequence1Action1WorkbenchTruth);
  const adapter = adaptMatchInputToMiniMatch(replayInput);
  const replaySpatialContext = workbenchToSpatialMatchContext({
    matchInput: replayInput,
    workbench: sequence1Action1WorkbenchTruth,
    frame: "before",
  });
  const baseline = runMiniMatch({
    ...adapter.miniMatchInput,
    numberOfSequences: 1,
  });
  const controlled = runMiniMatch({
    ...adapter.miniMatchInput,
    numberOfSequences: 1,
    spatialContext: replaySpatialContext,
    routeRankingAttributeMode: "candidate_modifier",
    routeSelectionSource: "spatial_candidate_modifier",
    routeSelectionWorkbench: sequence1Action1WorkbenchTruth,
  });
  const stalePossessionContext = {
    ...replaySpatialContext,
    possessionTeamId: replaySpatialContext.defendingTeamId,
    defendingTeamId: replaySpatialContext.possessionTeamId,
  };
  const stalePossessionControlled = runMiniMatch({
    ...adapter.miniMatchInput,
    numberOfSequences: 1,
    spatialContext: stalePossessionContext,
    routeRankingAttributeMode: "candidate_modifier",
    routeSelectionSource: "spatial_candidate_modifier",
    routeSelectionWorkbench: sequence1Action1WorkbenchTruth,
  });
  const selection = controlled.state.records[0]?.setup.routeSelectionResult;
  const staleSelection = stalePossessionControlled.state.records[0]?.setup.routeSelectionResult;
  const baselineScoringEvents = baseline.state.scoringEvents.length;
  const controlledScoringEvents = controlled.state.scoringEvents.length;

  assertTest(selection !== undefined, "controlled mini-match must expose route selection result.");
  if (selection !== undefined) {
    assertTest(selection.selectionSource === "spatial_candidate_modifier", "selection source must be spatial_candidate_modifier.");
    assertTest(selection.guardValid, "controlled route selection guard must be valid.");
    assertTest(selection.selectedActionType.length > 0, "selected action type must be populated.");
    assertTest(
      selection.selectedActorId === sequence1Action1WorkbenchTruth.selectedAction.actorId,
      "TH actor must remain preserved in replay context.",
    );
    assertTest(
      selection.selectedReceiverId === sequence1Action1WorkbenchTruth.selectedAction.receiverId,
      "TH -> ML receiver must remain preserved in replay context.",
    );
  }
  assertTest(
    controlled.logs.some((log) => log.text.includes("Route selection metadata: route_selection_active")),
    "controlled mini-match logs must expose route selection metadata.",
  );
  assertTest(
    controlledScoringEvents === baselineScoringEvents,
    "route selection metadata must not add scoring events by itself.",
  );
  assertTest(staleSelection !== undefined, "stale spatial possession context must still expose route selection metadata.");
  if (staleSelection !== undefined) {
    assertTest(
      staleSelection.selectedBy === "prototype",
      "stale spatial possession context must preserve prototype route selection.",
    );
    assertTest(
      staleSelection.routeRankingUsesRealAttributes === "NO",
      "stale spatial possession context must not apply attribute-adjusted route selection.",
    );
    assertTest(
      staleSelection.notes.some((note) => note.includes("possession team did not match current mini-match possession")),
      "stale spatial possession context must explain why spatial route generation was skipped.",
    );
  }
  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");

  return [
    "controlled mini-match exposes route selection result",
    "selection source is spatial_candidate_modifier",
    "route selection guard is valid",
    "TH -> ML remains preserved",
    "stale spatial possession context falls back to prototype selection",
    "route selection does not add scoring events by itself",
    "scoring constants remain unchanged",
  ];
}

if (require.main === module) {
  const checks = validateMiniMatchSpatialSelection();

  console.log("miniMatchSpatialSelection tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
