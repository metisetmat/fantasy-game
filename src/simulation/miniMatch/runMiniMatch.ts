import { resolveSequence } from "../../systems/sequences";
import type { TacticalLogLine } from "../../systems/interactions/shared";
import { createMiniMatchContext } from "./createMiniMatchContext";
import {
  createFinalSummaryLogs,
  createMiniMatchHeaderLogs,
  createScoreLog,
  createSequenceBoundaryLog,
  createSequenceHeaderLogs,
} from "./logging";
import { selectInitialSequenceContext } from "./selectInitialSequenceContext";
import { summarizeMiniMatch } from "./summarizeMiniMatch";
import type { MiniMatchInput, MiniMatchResult, MiniMatchState } from "./types";
import { updateMiniMatchState } from "./updateMiniMatchState";
import { integrateLiveTryEvents } from "./liveTryEvents";

export function runMiniMatch(input: MiniMatchInput): MiniMatchResult {
  let state: MiniMatchState = createMiniMatchContext(input);
  const sequenceLogs: TacticalLogLine[] = [];

  for (let sequenceIndex = 0; sequenceIndex < state.context.requestedSequences; sequenceIndex += 1) {
    const setup = selectInitialSequenceContext(state, sequenceIndex);
    const result = resolveSequence(setup.resolveInput);
    state = updateMiniMatchState(state, setup, result);
    sequenceLogs.push(
      ...createSequenceHeaderLogs(setup),
      ...result.logs,
      createSequenceBoundaryLog(state),
      createScoreLog(state),
      { text: "" },
    );
  }

  state = integrateLiveTryEvents(state);
  const summary = summarizeMiniMatch(state);

  return {
    state,
    summary,
    logs: [
      ...createMiniMatchHeaderLogs(state),
      ...sequenceLogs,
      ...createFinalSummaryLogs(state, summary),
    ],
  };
}
