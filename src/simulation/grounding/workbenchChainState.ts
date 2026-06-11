import type { WorkbenchChain, WorkbenchChainStep } from "./workbenchChainTypes";

export type WorkbenchChainRuntimeState = {
  readonly stepIndex: number;
  readonly possessionTeamId: string;
  readonly defendingTeamId: string;
  readonly ballCarrierId: string;
  readonly ballZone: string;
  readonly previousActionType?: string;
  readonly appliedSteps: readonly string[];
  readonly stateWarnings: readonly string[];
};

export type WorkbenchChainStateWarning =
  | "WORKBENCH_CHAIN_BALL_CARRIER_MISMATCH"
  | "WORKBENCH_CHAIN_BALL_ZONE_MISMATCH"
  | "WORKBENCH_CHAIN_MISSING_AFTER_STATE"
  | "WORKBENCH_CHAIN_STATE_PROPAGATION_PARTIAL";

export function createInitialWorkbenchChainState(chain: WorkbenchChain): WorkbenchChainRuntimeState {
  return {
    stepIndex: 0,
    possessionTeamId: chain.expectedPossessionTeamId,
    defendingTeamId: chain.expectedDefendingTeamId,
    ballCarrierId: chain.initialBallCarrierId,
    ballZone: chain.initialBallZone,
    appliedSteps: [],
    stateWarnings: [],
  };
}

function warning(input: {
  readonly code: WorkbenchChainStateWarning;
  readonly stepIndex: number;
  readonly expected: string;
  readonly actual: string;
}): string {
  return `${input.code}: step ${input.stepIndex} expected ${input.expected}, got ${input.actual}.`;
}

export function applyWorkbenchChainStep(input: {
  readonly state: WorkbenchChainRuntimeState;
  readonly step: WorkbenchChainStep;
}): WorkbenchChainRuntimeState {
  const warnings: string[] = [];

  if (input.state.ballCarrierId !== input.step.expectedActorId) {
    warnings.push(warning({
      code: "WORKBENCH_CHAIN_BALL_CARRIER_MISMATCH",
      stepIndex: input.step.stepIndex,
      expected: input.step.expectedActorId,
      actual: input.state.ballCarrierId,
    }));
  }

  if (input.state.ballZone !== input.step.expectedBallZoneBefore) {
    warnings.push(warning({
      code: "WORKBENCH_CHAIN_BALL_ZONE_MISMATCH",
      stepIndex: input.step.stepIndex,
      expected: input.step.expectedBallZoneBefore,
      actual: input.state.ballZone,
    }));
  }

  if (input.step.expectedNewCarrierId === undefined || input.step.expectedBallZoneAfter === undefined) {
    warnings.push(`WORKBENCH_CHAIN_MISSING_AFTER_STATE: step ${input.step.stepIndex} cannot fully update chain state.`);
  }

  if (warnings.length > 0) {
    warnings.push(`WORKBENCH_CHAIN_STATE_PROPAGATION_PARTIAL: step ${input.step.stepIndex} propagated with warnings.`);
  }

  return {
    ...input.state,
    stepIndex: input.step.stepIndex + 1,
    ballCarrierId: input.step.expectedNewCarrierId ?? input.state.ballCarrierId,
    ballZone: input.step.expectedBallZoneAfter ?? input.state.ballZone,
    previousActionType: input.step.expectedActionType,
    appliedSteps: [...input.state.appliedSteps, input.step.frame.frameId],
    stateWarnings: [...input.state.stateWarnings, ...warnings],
  };
}
