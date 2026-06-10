export type TacticalWorkbenchPlayerPosition = {
  readonly playerId: string;
  readonly teamId: string;
  readonly role: string;
  readonly initials: string;
  readonly realZone: string;
  readonly renderedZone?: string;
  readonly projectedZone?: string;
  readonly isBallCarrier?: boolean;
};

export type TacticalWorkbenchTeamShapeIntent = {
  readonly teamId: string;
  readonly frame: "before" | "after";
  readonly intent: string;
  readonly evidence: readonly string[];
};

export type TacticalWorkbenchSelectedAction = {
  readonly actorId: string;
  readonly receiverId?: string;
  readonly newCarrierId?: string;
  readonly fromZone: string;
  readonly targetZone: string;
  readonly actualReceptionZone?: string;
  readonly actionType: string;
  readonly actionSubtype?: string;
  readonly transferType?: string;
  readonly possessionResult?: string;
};

export type TacticalWorkbenchRankedOption = {
  readonly rank: number;
  readonly actionType: string;
  readonly receiverId?: string;
  readonly targetZone: string;
  readonly laneState?: string;
  readonly risk?: string;
  readonly score?: number;
  readonly finalSelectionScore?: number;
  readonly selected: boolean;
};

export type TacticalWorkbenchAfterState = {
  readonly newCarrierId: string;
  readonly ballZone: string;
  readonly possessionResult: string;
};

export type TacticalWorkbenchFrame = {
  readonly frameId: string;
  readonly sequenceId: string;
  readonly actionId: string;
  readonly phase: string;
  readonly possessionTeamId: string;
  readonly defendingTeamId: string;
  readonly ballCarrierId: string;
  readonly ballZone: string;
  readonly attackingDirection: string;
  readonly playerPositions: readonly TacticalWorkbenchPlayerPosition[];
  readonly afterPlayerPositions?: readonly TacticalWorkbenchPlayerPosition[];
  readonly teamShapeIntents: readonly TacticalWorkbenchTeamShapeIntent[];
  readonly selectedAction: TacticalWorkbenchSelectedAction;
  readonly rankedOptions: readonly TacticalWorkbenchRankedOption[];
  readonly afterState?: TacticalWorkbenchAfterState;
};
