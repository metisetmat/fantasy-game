export type TrueRole =
  | "Tempo Half"
  | "Hook Link"
  | "Forward Leader"
  | "Goalkeeper / Free Safety"
  | "Mobile Lock"
  | "Space Hunter"
  | "Playmaker"
  | "Pivot"
  | "Left Piston"
  | "Right Piston";

export type RoleFitLabel =
  | "Natural Fit"
  | "Strong Fit"
  | "Usable Fit"
  | "Risky Fit"
  | "Poor Fit";

export type FitSignalType =
  | "ATTRIBUTE_STRENGTH"
  | "ATTRIBUTE_WEAKNESS"
  | "SKILL_STRENGTH"
  | "SKILL_GAP"
  | "DERIVED_STRENGTH"
  | "DERIVED_RISK"
  | "STYLE_BOOST"
  | "STYLE_PENALTY"
  | "FATIGUE_RISK"
  | "ROSTER_CONTEXT_BOOST"
  | "ROSTER_CONTEXT_RISK"
  | "GOALKEEPER_SPECIFIC_SIGNAL";

export type RoleFitInput = {
  playerId: string;
  playerName: string;
  testedRole: TrueRole;
  visibleAttributes: {
    speed: number;
    power: number;
    endurance: number;
    handPlay: number;
    footPlay: number;
    ballCarrying: number;
    vision: number;
    composure: number;
    creativity: number;
  };
  inferredSkills?: Record<string, number>;
  derivedAttributes?: Record<string, number>;
  teamStyle?: string;
  teamIdentity?: string;
  fatigueState?: {
    currentFatigue: number;
    mentalFatigue?: number;
    lateMatchReliability?: number;
  };
  roleContext?: string;
  rosterContext?: {
    missingRoles: TrueRole[];
    overloadedRoles: TrueRole[];
    supportQuality: number;
    defensiveCoverQuality: number;
  };
};

export type FitReason = {
  id: string;
  type: FitSignalType;
  label: string;
  explanation: string;
  impact: number;
  evidence: string[];
};

export type FitRisk = {
  id: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  label: string;
  explanation: string;
  affectedPhase:
    | "in_possession"
    | "out_of_possession"
    | "transition_attack"
    | "transition_defense"
    | "chaos"
    | "late_match"
    | "goalkeeper";
  mitigation?: string;
};

export type FitBoost = {
  id: string;
  source:
    | "attribute"
    | "skill"
    | "derived_attribute"
    | "style"
    | "team_identity"
    | "roster_context";
  label: string;
  impact: number;
  explanation: string;
};

export type FitPenalty = {
  id: string;
  source:
    | "attribute"
    | "skill"
    | "derived_attribute"
    | "fatigue"
    | "style"
    | "team_identity"
    | "roster_context";
  label: string;
  impact: number;
  explanation: string;
  canBeMitigated: boolean;
};

export type RoleFitResult = {
  playerId: string;
  playerName: string;
  testedRole: TrueRole;
  score: number;
  label: RoleFitLabel;
  summary: string;
  topReasons: FitReason[];
  topRisks: FitRisk[];
  boosts: FitBoost[];
  penalties: FitPenalty[];
  bestPairings: TrueRole[];
  styleFit: {
    bestStyles: string[];
    riskyStyles: string[];
    explanation: string;
  };
  fatigueWarning?: {
    level: "NONE" | "WATCH" | "RISK" | "CRITICAL";
    explanation: string;
  };
  developmentAdvice: string[];
  coachUsageAdvice: string[];
  debug?: {
    baseRoleScore: number;
    attributeContribution: number;
    skillContribution: number;
    derivedContribution: number;
    styleAdjustment: number;
    fatigueAdjustment: number;
    rosterContextAdjustment: number;
  };
};

export type RoleComparisonResult = {
  playerId: string;
  playerName: string;
  testedRoles: RoleFitResult[];
  bestRole: TrueRole;
  safestRole: TrueRole;
  highestUpsideRole: TrueRole;
  riskiestRole: TrueRole;
  summary: string;
  coachRecommendation: string;
};
