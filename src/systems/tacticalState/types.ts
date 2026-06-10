export enum TacticalPhaseState {
  StablePossession = "STABLE_POSSESSION",
  StructuredAttackingControl = "STRUCTURED_ATTACKING_CONTROL",
  FragileAttackingControl = "FRAGILE_ATTACKING_CONTROL",
  ChaoticAttackingAdvantage = "CHAOTIC_ATTACKING_ADVANTAGE",
  DefensiveEmergency = "DEFENSIVE_EMERGENCY",
  LastLineSurvival = "LAST_LINE_SURVIVAL",
  DangerPhase = "DANGER_PHASE",
  TransitionCollapse = "TRANSITION_COLLAPSE",
  BrokenPlay = "BROKEN_PLAY",
  Settled = "SETTLED",
}

export enum TacticalChoiceQuality {
  Good = "GOOD_TACTICAL_CHOICE",
  Forced = "FORCED_TACTICAL_CHOICE",
  Poor = "POOR_TACTICAL_CHOICE",
}

export enum TechnicalExecution {
  Clean = "CLEAN_EXECUTION",
  Imperfect = "IMPERFECT_EXECUTION",
  Bad = "BAD_EXECUTION",
}

export enum EmotionalControl {
  Composed = "COMPOSED",
  Rushed = "RUSHED",
  Panicked = "PANICKED",
}

export enum StructuralSupportState {
  Connected = "SUPPORT_CONNECTED",
  Late = "SUPPORT_LATE",
  Isolated = "CARRIER_ISOLATED",
}

export interface DecisionDimensionEvaluation {
  readonly tacticalChoice: TacticalChoiceQuality;
  readonly technicalExecution: TechnicalExecution;
  readonly emotionalControl: EmotionalControl;
  readonly structuralSupport: StructuralSupportState;
  readonly reasons: readonly string[];
}

export interface TacticalPhaseEvaluation {
  readonly phase: TacticalPhaseState;
  readonly reasons: readonly string[];
  readonly effects: readonly string[];
}
