import type { TacticalWorkbenchFrame } from "./tacticalWorkbenchTypes";

export type WorkbenchChainId = string;

export type WorkbenchChainStep = {
  readonly stepIndex: number;
  readonly frame: TacticalWorkbenchFrame;
  readonly expectedActorId: string;
  readonly expectedReceiverId?: string;
  readonly expectedNewCarrierId?: string;
  readonly expectedBallZoneBefore: string;
  readonly expectedBallZoneAfter?: string;
  readonly expectedActionType: string;
};

export type WorkbenchChain = {
  readonly chainId: WorkbenchChainId;
  readonly description: string;
  readonly steps: readonly WorkbenchChainStep[];
  readonly expectedPossessionTeamId: string;
  readonly expectedDefendingTeamId: string;
  readonly initialBallCarrierId: string;
  readonly initialBallZone: string;
  readonly finalExpectedBallCarrierId?: string;
  readonly finalExpectedBallZone?: string;
};

export type WorkbenchChainReplayMode =
  | "diagnostic_only"
  | "controlled_minimatch"
  | "fullmatch_warning_only";
