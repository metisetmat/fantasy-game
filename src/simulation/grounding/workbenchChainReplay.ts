import type { MatchInput } from "../../contracts/engineToCoach";
import { PROTOTYPE_TEAMS, PrototypeTeamId } from "../../data/prototypeTeams";
import type { PrototypeTeamDefinition } from "../../data/prototypeTeams";
import { scoringRegistryEntry } from "../../systems/scoring";
import { runFullMatch } from "../runFullMatch";
import { runMiniMatch } from "../miniMatch";
import { workbenchToSpatialMatchContext } from "../spatialContext";
import { applyWorkbenchChainStep, createInitialWorkbenchChainState, type WorkbenchChainRuntimeState } from "./workbenchChainState";
import type { WorkbenchChain, WorkbenchChainReplayMode } from "./workbenchChainTypes";

export type WorkbenchChainStepReplayResult = {
  readonly stepIndex: number;
  readonly frameId: string;
  readonly routeSelectionSource: string;
  readonly selectedActionType?: string;
  readonly selectedActorId?: string;
  readonly selectedReceiverId?: string;
  readonly selectedBy?: string;
  readonly guardValid: boolean;
  readonly blockedReasons: readonly string[];
  readonly stateBefore: WorkbenchChainRuntimeState;
  readonly stateAfter: WorkbenchChainRuntimeState;
  readonly preservedExpectedAction: boolean;
  readonly warnings: readonly string[];
};

export type WorkbenchChainReplayResult = {
  readonly chainId: string;
  readonly mode: WorkbenchChainReplayMode;
  readonly status: "PASS" | "PARTIAL" | "FAIL";
  readonly steps: readonly WorkbenchChainStepReplayResult[];
  readonly finalState: WorkbenchChainRuntimeState;
  readonly prototypeFallbackUsed: boolean;
  readonly spatialSelectionUsed: boolean;
  readonly scoringEventsCreated: 0;
  readonly scoringEventsDeletedOrCapped: 0;
  readonly recommendations: readonly string[];
};

function prototypeForTeam(id: string): PrototypeTeamDefinition {
  const prototypeId = id === "control" ? PrototypeTeamId.Control : PrototypeTeamId.Blitz;
  const prototype = PROTOTYPE_TEAMS.find((team) => team.id === prototypeId);

  if (prototype === undefined) {
    throw new Error(`Missing prototype team ${prototypeId}.`);
  }

  return prototype;
}

function scoreFromConsequences(report: ReturnType<typeof runFullMatch>): number {
  return report.timeline
    .flatMap((event) => event.consequences)
    .filter((consequence) => consequence.type === "score_change")
    .reduce((total, consequence) => total + (consequence.value ?? 0), 0);
}

function replayControlledStep(input: {
  readonly matchInput: MatchInput;
  readonly stateBefore: WorkbenchChainRuntimeState;
  readonly stateAfter: WorkbenchChainRuntimeState;
  readonly step: WorkbenchChain["steps"][number];
  readonly mode: WorkbenchChainReplayMode;
}): WorkbenchChainStepReplayResult {
  if (input.mode !== "controlled_minimatch") {
    return {
      stepIndex: input.step.stepIndex,
      frameId: input.step.frame.frameId,
      routeSelectionSource: input.mode,
      guardValid: true,
      blockedReasons: [],
      stateBefore: input.stateBefore,
      stateAfter: input.stateAfter,
      preservedExpectedAction: input.stateAfter.stateWarnings.length === input.stateBefore.stateWarnings.length,
      warnings: input.stateAfter.stateWarnings.slice(input.stateBefore.stateWarnings.length),
    };
  }

  const spatialContext = workbenchToSpatialMatchContext({
    matchInput: input.matchInput,
    workbench: input.step.frame,
    frame: "before",
  });
  const miniMatch = runMiniMatch({
    teamA: prototypeForTeam(input.matchInput.homeTeam.teamId),
    teamB: prototypeForTeam(input.matchInput.awayTeam.teamId),
    numberOfSequences: 1,
    seed: 202,
    spatialContext,
    routeRankingAttributeMode: "candidate_modifier",
    routeSelectionSource: "spatial_candidate_modifier",
    routeSelectionWorkbench: input.step.frame,
  });
  const routeSelection = miniMatch.state.records[0]?.setup.routeSelectionResult;
  const preservedExpectedAction =
    routeSelection?.selectedActionType === input.step.expectedActionType &&
    routeSelection.selectedActorId === input.step.expectedActorId &&
    routeSelection.selectedReceiverId === input.step.expectedReceiverId;

  return {
    stepIndex: input.step.stepIndex,
    frameId: input.step.frame.frameId,
    routeSelectionSource: routeSelection?.selectionSource ?? "spatial_candidate_modifier",
    ...(routeSelection?.selectedActionType === undefined ? {} : { selectedActionType: routeSelection.selectedActionType }),
    ...(routeSelection?.selectedActorId === undefined ? {} : { selectedActorId: routeSelection.selectedActorId }),
    ...(routeSelection?.selectedReceiverId === undefined ? {} : { selectedReceiverId: routeSelection.selectedReceiverId }),
    ...(routeSelection?.selectedBy === undefined ? {} : { selectedBy: routeSelection.selectedBy }),
    guardValid: routeSelection?.guardValid ?? false,
    blockedReasons: routeSelection?.blockedReasons ?? ["ROUTE_SELECTION_RESULT_MISSING"],
    stateBefore: input.stateBefore,
    stateAfter: input.stateAfter,
    preservedExpectedAction,
    warnings: input.stateAfter.stateWarnings.slice(input.stateBefore.stateWarnings.length),
  };
}

function statusFor(input: {
  readonly mode: WorkbenchChainReplayMode;
  readonly steps: readonly WorkbenchChainStepReplayResult[];
  readonly finalState: WorkbenchChainRuntimeState;
}): WorkbenchChainReplayResult["status"] {
  if (input.steps.some((step) => !step.guardValid)) {
    return "FAIL";
  }

  if (input.mode === "controlled_minimatch" && input.steps.some((step) => !step.preservedExpectedAction)) {
    return "FAIL";
  }

  if (input.finalState.stateWarnings.length > 0) {
    return "PARTIAL";
  }

  return input.mode === "controlled_minimatch" ? "PARTIAL" : "PASS";
}

export function replayWorkbenchChain(input: {
  readonly matchInput: MatchInput;
  readonly chain: WorkbenchChain;
  readonly mode: WorkbenchChainReplayMode;
}): WorkbenchChainReplayResult {
  if (input.mode === "fullmatch_warning_only") {
    const report = runFullMatch(input.matchInput);
    const totalPoints = scoreFromConsequences(report);
    const initialState = createInitialWorkbenchChainState(input.chain);

    return {
      chainId: input.chain.chainId,
      mode: input.mode,
      status: "PARTIAL",
      steps: [],
      finalState: {
        ...initialState,
        stateWarnings: [`FULLMATCH_STILL_USES_SEGMENT_HARNESS: observed ${totalPoints} consequence-derived point(s) without consuming chain ${input.chain.chainId}.`],
      },
      prototypeFallbackUsed: true,
      spatialSelectionUsed: false,
      scoringEventsCreated: 0,
      scoringEventsDeletedOrCapped: 0,
      recommendations: [
        "CONFIRM_NORMAL_FULLMATCH_NOT_CHAIN_DRIVEN",
        "KEEP_50_MATCH_ECONOMY_REFERENCE",
        "PREPARE_MULTI_ACTION_WORKBENCH_CHAIN",
      ],
    };
  }

  let runtimeState = createInitialWorkbenchChainState(input.chain);
  const steps: WorkbenchChainStepReplayResult[] = [];

  for (const step of input.chain.steps) {
    const stateBefore = runtimeState;
    const stateAfter = applyWorkbenchChainStep({ state: stateBefore, step });
    steps.push(replayControlledStep({
      matchInput: input.matchInput,
      stateBefore,
      stateAfter,
      step,
      mode: input.mode,
    }));
    runtimeState = stateAfter;
  }

  const spatialSelectionUsed = steps.some((step) => step.routeSelectionSource === "spatial_candidate_modifier" && step.guardValid);
  const prototypeFallbackUsed = steps.some((step) => step.selectedBy === "prototype" || step.selectedBy === "fallback") || input.mode === "diagnostic_only";

  return {
    chainId: input.chain.chainId,
    mode: input.mode,
    status: statusFor({ mode: input.mode, steps, finalState: runtimeState }),
    steps,
    finalState: runtimeState,
    prototypeFallbackUsed,
    spatialSelectionUsed,
    scoringEventsCreated: 0,
    scoringEventsDeletedOrCapped: 0,
    recommendations: [
      "CONFIRM_WORKBENCH_CHAIN_REPLAY_V0",
      "CONFIRM_CHAIN_STATE_PROPAGATION",
      ...(input.mode === "controlled_minimatch" ? ["CONFIRM_CONTROLLED_MINIMATCH_CHAIN_REPLAY"] : []),
      "CONFIRM_PROTOTYPE_FALLBACK_STILL_ENABLED",
      "KEEP_SCORING_VALUES_UNCHANGED",
      "KEEP_50_MATCH_ECONOMY_REFERENCE",
      "PREPARE_MULTI_ACTION_WORKBENCH_CHAIN",
      "PREPARE_NORMAL_FULLMATCH_SPATIAL_SELECTION_FLAG",
    ],
  };
}

export function validateWorkbenchChainScoringConstants(): readonly string[] {
  return [
    `SHOT_GOAL=${scoringRegistryEntry("SHOT_GOAL").points}`,
    `TRY_TOUCHDOWN=${scoringRegistryEntry("TRY_TOUCHDOWN").points}`,
    `CONVERSION_GOAL=${scoringRegistryEntry("CONVERSION_GOAL").points}`,
    `DROP_GOAL=${scoringRegistryEntry("DROP_GOAL").points}`,
    `PENALTY_SHOT_ACTIVE=${scoringRegistryEntry("PENALTY_SHOT").active ? "YES" : "NO"}`,
  ];
}
