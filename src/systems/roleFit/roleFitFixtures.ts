import {
  compareRoleFits,
  computeRoleFit,
} from "./roleFitEngine";
import { ACTIVE_SCORING_ACTION_REGISTRY, scoringRegistryEntry } from "../scoring/scoringActionRegistry";
import { V1_SCORING_RULES, pointValueForScoringActionType } from "../scoring/scoringRules";
import { CONVERSION_POINT_VALUE, TRY_TOUCHDOWN_POINT_VALUE } from "../scoring/tryTouchdownRules";
import { DROP_GOAL_POINT_VALUE } from "../scoring/dropGoalRules";
import type { RoleComparisonResult, RoleFitInput, RoleFitLabel, RoleFitResult, TrueRole } from "./roleFitTypes";

export interface FixtureExpectation {
  readonly scoreRange: readonly [number, number];
  readonly label: RoleFitLabel;
  readonly requiredReasonIds?: readonly string[];
  readonly requiredRiskIds?: readonly string[];
  readonly requiredPenaltyIds?: readonly string[];
  readonly requiredFatigueWarning?: "RISK" | "CRITICAL";
  readonly mustNotContain?: readonly string[];
}

export interface RoleFitFixture {
  readonly id: string;
  readonly input: RoleFitInput;
  readonly expectation: FixtureExpectation;
}

export interface RoleComparisonFixture {
  readonly id: string;
  readonly inputs: readonly RoleFitInput[];
  readonly expectedBestRole: TrueRole;
  readonly expectedSafestRole: TrueRole;
  readonly expectedUsableRole: TrueRole;
  readonly testedRoleThatMustNotBePrimary: TrueRole;
}

export interface RoleFitFixtureCheck {
  readonly fixtureId: string;
  readonly passed: boolean;
  readonly detail: string;
}

export interface RoleFitFixtureValidationResult {
  readonly passed: boolean;
  readonly checks: readonly RoleFitFixtureCheck[];
  readonly fixtureCount: number;
  readonly comparisonFixtureCount: number;
  readonly recommendations: readonly string[];
}

const baseAttrs = {
  speed: 62,
  power: 62,
  endurance: 62,
  handPlay: 62,
  footPlay: 62,
  ballCarrying: 62,
  vision: 62,
  composure: 62,
  creativity: 62,
};

const fixtures: readonly RoleFitFixture[] = [
  {
    id: "RF_FIX_01",
    input: {
      playerId: "elias",
      playerName: "Elias",
      testedRole: "Tempo Half",
      teamStyle: "CONTROL_PATIENT",
      visibleAttributes: { ...baseAttrs, vision: 96, composure: 93, handPlay: 91, creativity: 88, footPlay: 82, endurance: 82 },
      inferredSkills: { tempoControl: 94, pressureEscape: 92, phaseStability: 91 },
      derivedAttributes: { pressureReading: 92, supportAngle: 89, tacticalDiscipline: 90 },
    },
    expectation: {
      scoreRange: [90, 100],
      label: "Natural Fit",
      requiredReasonIds: ["vision_supports_tempo_control", "composure_supports_pressure_escape", "hand_play_supports_phase_stability"],
    },
  },
  {
    id: "RF_FIX_02",
    input: {
      playerId: "rayan",
      playerName: "Rayan",
      testedRole: "Tempo Half",
      teamStyle: "CONTROL_PATIENT",
      visibleAttributes: { ...baseAttrs, vision: 40, composure: 88, handPlay: 86, creativity: 84 },
      inferredSkills: { tempoControl: 82, pressureEscape: 86, phaseStability: 83 },
      derivedAttributes: { pressureReading: 71, supportAngle: 74, tacticalDiscipline: 70 },
    },
    expectation: {
      scoreRange: [45, 59],
      label: "Risky Fit",
      requiredRiskIds: ["low_vision_breaks_tempo_control"],
      requiredPenaltyIds: ["tempo_half_low_vision_cap_59"],
    },
  },
  {
    id: "RF_FIX_03",
    input: {
      playerId: "bruno",
      playerName: "Bruno",
      testedRole: "Pivot",
      teamStyle: "CONTROL_PATIENT",
      visibleAttributes: { ...baseAttrs, vision: 76, composure: 39, handPlay: 80, power: 72, endurance: 73 },
      inferredSkills: { centralBalance: 62, restDefenseTiming: 38, rebuildTiming: 66 },
      derivedAttributes: { tacticalDiscipline: 34, restDefenseTiming: 38, defensiveCoverQuality: 42 },
    },
    expectation: {
      scoreRange: [45, 59],
      label: "Risky Fit",
      requiredPenaltyIds: ["pivot_low_composure_cap_59"],
      requiredRiskIds: ["poor_central_discipline", "rest_defense_risk"],
    },
  },
  {
    id: "RF_FIX_05",
    input: {
      playerId: "noa",
      playerName: "Noa",
      testedRole: "Right Piston",
      teamStyle: "MOBILE_WIDE",
      visibleAttributes: { ...baseAttrs, speed: 82, endurance: 76, handPlay: 70, ballCarrying: 76, power: 64, composure: 64 },
      inferredSkills: { widthSupport: 78, recoveryRun: 74, flankConnection: 72 },
      derivedAttributes: { defensiveCoverQuality: 61, supportAngle: 74, weakSideTiming: 75 },
      fatigueState: { currentFatigue: 84, lateMatchReliability: 42 },
    },
    expectation: {
      scoreRange: [45, 74],
      label: "Usable Fit",
      requiredRiskIds: ["repeated_sprint_fatigue", "late_recovery_dropoff"],
      requiredFatigueWarning: "RISK",
    },
  },
  {
    id: "RF_FIX_06",
    input: {
      playerId: "sacha",
      playerName: "Sacha",
      testedRole: "Goalkeeper / Free Safety",
      teamStyle: "CONTROL_BALANCED",
      visibleAttributes: { ...baseAttrs, composure: 82, handPlay: 76, vision: 77, footPlay: 78, power: 70 },
      inferredSkills: { reboundControl: 72, positioning: 78, communication: 77 },
      derivedAttributes: { goalkeeperResponse: 74, secondSaveRecovery: 70, defensiveOrganization: 76 },
      fatigueState: { currentFatigue: 35, mentalFatigue: 82, lateMatchReliability: 58 },
    },
    expectation: {
      scoreRange: [60, 89],
      label: "Usable Fit",
      requiredRiskIds: ["gk_mental_fatigue", "rebound_control_under_load"],
      requiredFatigueWarning: "RISK",
      mustNotContain: ["outfield running fatigue", "repeated sprint load is the primary goalkeeper issue"],
    },
  },
  {
    id: "RF_FIX_07",
    input: {
      playerId: "lino",
      playerName: "Lino",
      testedRole: "Goalkeeper / Free Safety",
      teamStyle: "BLITZ_BALANCED",
      visibleAttributes: { ...baseAttrs, composure: 71, handPlay: 38, vision: 72, footPlay: 90 },
      inferredSkills: { reboundControl: 37, positioning: 69, communication: 64 },
      derivedAttributes: { goalkeeperResponse: 66, secondSaveRecovery: 58, defensiveOrganization: 62 },
    },
    expectation: {
      scoreRange: [45, 59],
      label: "Risky Fit",
      requiredPenaltyIds: ["gk_low_hand_play_rebound_cap_59"],
      requiredRiskIds: ["rebound_control_under_load", "weak_rebound_control"],
    },
  },
  {
    id: "RF_FIX_08",
    input: {
      playerId: "ilyes",
      playerName: "Ilyes",
      testedRole: "Space Hunter",
      teamStyle: "MOBILE_WIDE",
      visibleAttributes: { ...baseAttrs, speed: 88, ballCarrying: 83, composure: 70, creativity: 74, endurance: 78, footPlay: 71 },
      inferredSkills: { depthThreat: 86, ruptureCarry: 82, pressingEffort: 79 },
      derivedAttributes: { supportAngle: 70, weakSideTiming: 84, frontPressure: 78 },
    },
    expectation: {
      scoreRange: [75, 89],
      label: "Strong Fit",
      requiredReasonIds: ["speed_supports_depth_threat", "ball_carrying_supports_rupture", "pressing_effort_supports_front_pressure"],
      mustNotContain: ["defensive_midfielder_requirement", "defensive_midfielder_penalty", "Kante", "Maldini", "famous player analogy"],
    },
  },
  {
    id: "RF_FIX_09",
    input: {
      playerId: "sami",
      playerName: "Sami",
      testedRole: "Space Hunter",
      teamStyle: "MOBILE_WIDE",
      visibleAttributes: { ...baseAttrs, speed: 93, ballCarrying: 38, composure: 64, creativity: 70, endurance: 75 },
      inferredSkills: { depthThreat: 88, ruptureCarry: 36, pressingEffort: 71 },
      derivedAttributes: { supportAngle: 65, weakSideTiming: 80, frontPressure: 70 },
    },
    expectation: {
      scoreRange: [45, 74],
      label: "Usable Fit",
      requiredRiskIds: ["low_ball_carrying_limits_rupture"],
      requiredPenaltyIds: ["space_hunter_low_ball_carrying_cap_74"],
    },
  },
  {
    id: "RF_FIX_10",
    input: {
      playerId: "nadir",
      playerName: "Nadir",
      testedRole: "Playmaker",
      teamStyle: "CONTROL_PATIENT",
      visibleAttributes: { ...baseAttrs, creativity: 91, vision: 74, composure: 38, footPlay: 76, handPlay: 69, ballCarrying: 73 },
      inferredSkills: { routeCreation: 88, riskManagement: 38, tempoControl: 67 },
      derivedAttributes: { pressureReading: 61, supportAngle: 72, nextActionPotential: 83 },
    },
    expectation: {
      scoreRange: [45, 59],
      label: "Risky Fit",
      requiredRiskIds: ["forced_imagination_errors", "pressure_decision_instability"],
      requiredPenaltyIds: ["playmaker_low_composure_cap_59"],
    },
  },
  {
    id: "RF_FIX_11",
    input: {
      playerId: "malo",
      playerName: "Malo",
      testedRole: "Forward Leader",
      teamStyle: "POWER_DIRECT",
      visibleAttributes: { ...baseAttrs, power: 44, composure: 70, endurance: 73, handPlay: 76, vision: 68, ballCarrying: 69 },
      inferredSkills: { contactAuthority: 39, centralCommand: 70, collisionLoad: 64 },
      derivedAttributes: { lineLeadership: 68, defensiveOrganization: 66, contactBalance: 41 },
    },
    expectation: {
      scoreRange: [45, 59],
      label: "Risky Fit",
      requiredPenaltyIds: ["forward_leader_low_power_cap_59"],
      requiredRiskIds: ["weak_contact_authority", "central_collision_failure"],
    },
  },
  {
    id: "RF_FIX_12",
    input: {
      playerId: "theo",
      playerName: "Theo",
      testedRole: "Left Piston",
      teamStyle: "BLITZ_AGGRESSIVE",
      visibleAttributes: { ...baseAttrs, speed: 79, endurance: 55, handPlay: 68, ballCarrying: 77, power: 60, composure: 61 },
      inferredSkills: { widthSupport: 78, recoveryRun: 52, flankConnection: 73 },
      derivedAttributes: { defensiveCoverQuality: 39, supportAngle: 72, weakSideTiming: 76 },
    },
    expectation: {
      scoreRange: [60, 89],
      label: "Usable Fit",
      requiredRiskIds: ["transition_recovery_risk"],
      mustNotContain: ["pure winger recommendation"],
    },
  },
  {
    id: "RF_FIX_13",
    input: {
      playerId: "oren",
      playerName: "Oren",
      testedRole: "Mobile Lock",
      teamStyle: "BLITZ_AGGRESSIVE",
      visibleAttributes: { ...baseAttrs, speed: 42, endurance: 43, power: 39, composure: 73, vision: 75, ballCarrying: 79 },
      inferredSkills: { recoveryRun: 39, transitionStop: 42, centralDuel: 38 },
      derivedAttributes: { defensiveCoverQuality: 40, restDefenseTiming: 44, contactBalance: 38 },
    },
    expectation: {
      scoreRange: [45, 59],
      label: "Risky Fit",
      requiredPenaltyIds: ["mobile_lock_low_speed_cap_59"],
      requiredRiskIds: ["emergency_repair_speed_risk", "repeated_recovery_risk", "central_duel_risk"],
      mustNotContain: ["pure creator"],
    },
  },
];

const milanInputs: readonly RoleFitInput[] = [
  {
    playerId: "milan",
    playerName: "Milan",
    testedRole: "Hook Link",
    teamStyle: "CONTROL_BALANCED",
    visibleAttributes: { ...baseAttrs, handPlay: 83, composure: 78, ballCarrying: 78, power: 66, vision: 69, endurance: 72 },
    inferredSkills: { contactSurvival: 82, supportTiming: 84, outletSecurity: 80 },
    derivedAttributes: { supportAngle: 82, pressureReading: 78, contactBalance: 79 },
  },
  {
    playerId: "milan",
    playerName: "Milan",
    testedRole: "Pivot",
    teamStyle: "CONTROL_BALANCED",
    visibleAttributes: { ...baseAttrs, handPlay: 83, composure: 78, vision: 66, power: 66, endurance: 72, ballCarrying: 78 },
    inferredSkills: { centralBalance: 66, restDefenseTiming: 65, rebuildTiming: 70 },
    derivedAttributes: { tacticalDiscipline: 66, restDefenseTiming: 65, defensiveCoverQuality: 62 },
  },
  {
    playerId: "milan",
    playerName: "Milan",
    testedRole: "Tempo Half",
    teamStyle: "CONTROL_BALANCED",
    visibleAttributes: { ...baseAttrs, handPlay: 83, composure: 78, vision: 52, creativity: 62, footPlay: 58, endurance: 72 },
    inferredSkills: { tempoControl: 55, pressureEscape: 78, phaseStability: 75 },
    derivedAttributes: { pressureReading: 62, supportAngle: 76, tacticalDiscipline: 65 },
  },
];

const comparisonFixtures: readonly RoleComparisonFixture[] = [
  {
    id: "RF_FIX_04",
    inputs: milanInputs,
    expectedBestRole: "Hook Link",
    expectedSafestRole: "Hook Link",
    expectedUsableRole: "Pivot",
    testedRoleThatMustNotBePrimary: "Tempo Half",
  },
];

function containsAll(ids: readonly string[] | undefined, actual: readonly string[]): boolean {
  return (ids ?? []).every((id) => actual.includes(id));
}

function renderedResult(result: RoleFitResult): string {
  return [
    result.playerName,
    result.testedRole,
    result.label,
    result.summary,
    result.topReasons.map((item) => `${item.id}:${item.explanation}`).join(" "),
    result.topRisks.map((item) => `${item.id}:${item.explanation}`).join(" "),
    result.penalties.map((item) => `${item.id}:${item.explanation}`).join(" "),
    result.developmentAdvice.join(" "),
    result.coachUsageAdvice.join(" "),
    result.fatigueWarning?.explanation ?? "",
  ].join(" ");
}

function validateResultContract(fixtureId: string, input: RoleFitInput, result: RoleFitResult): readonly RoleFitFixtureCheck[] {
  return [
    {
      fixtureId,
      passed: !("role" in result) && result.testedRole === input.testedRole,
      detail: "RoleFitResult exposes testedRole and no public role key",
    },
    {
      fixtureId,
      passed:
        result.testedRole.length > 0 &&
        result.summary.length > 0 &&
        result.bestPairings.length > 0 &&
        result.styleFit.bestStyles.length > 0 &&
        result.styleFit.riskyStyles.length > 0 &&
        result.styleFit.explanation.length > 0,
      detail: "RoleFitResult public shape has testedRole, summary, bestPairings, and styleFit",
    },
    {
      fixtureId,
      passed: Array.isArray(result.developmentAdvice) && Array.isArray(result.coachUsageAdvice),
      detail: "developmentAdvice and coachUsageAdvice are arrays",
    },
    {
      fixtureId,
      passed:
        result.debug !== undefined &&
        typeof result.debug.baseRoleScore === "number" &&
        typeof result.debug.attributeContribution === "number" &&
        typeof result.debug.skillContribution === "number" &&
        typeof result.debug.derivedContribution === "number" &&
        typeof result.debug.styleAdjustment === "number" &&
        typeof result.debug.fatigueAdjustment === "number" &&
        typeof result.debug.rosterContextAdjustment === "number",
      detail: "debug fields match documented contract",
    },
  ];
}

function validateFixture(fixture: RoleFitFixture): readonly RoleFitFixtureCheck[] {
  const result = computeRoleFit(fixture.input);
  const reasonIds = result.topReasons.map((item) => item.id);
  const riskIds = result.topRisks.map((item) => item.id);
  const penaltyIds = result.penalties.map((item) => item.id);
  const [minScore, maxScore] = fixture.expectation.scoreRange;
  const text = renderedResult(result);

  return [
    ...validateResultContract(fixture.id, fixture.input, result),
    {
      fixtureId: fixture.id,
      passed: result.score >= minScore && result.score <= maxScore,
      detail: `score ${result.score} expected ${minScore}-${maxScore}`,
    },
    {
      fixtureId: fixture.id,
      passed: result.label === fixture.expectation.label,
      detail: `label ${result.label} expected ${fixture.expectation.label}`,
    },
    {
      fixtureId: fixture.id,
      passed: containsAll(fixture.expectation.requiredReasonIds, reasonIds),
      detail: `reasons ${reasonIds.join(", ") || "none"}`,
    },
    {
      fixtureId: fixture.id,
      passed: containsAll(fixture.expectation.requiredRiskIds, riskIds),
      detail: `risks ${riskIds.join(", ") || "none"}`,
    },
    {
      fixtureId: fixture.id,
      passed: containsAll(fixture.expectation.requiredPenaltyIds, penaltyIds),
      detail: `penalties ${penaltyIds.join(", ") || "none"}`,
    },
    {
      fixtureId: fixture.id,
      passed:
        fixture.expectation.requiredFatigueWarning === undefined ||
        result.fatigueWarning?.level === fixture.expectation.requiredFatigueWarning,
      detail: `fatigue warning ${result.fatigueWarning?.level ?? "NONE"}`,
    },
    {
      fixtureId: fixture.id,
      passed: (fixture.expectation.mustNotContain ?? []).every((term) => !text.includes(term)),
      detail: "forbidden wording absent",
    },
  ];
}

function validateComparison(fixture: RoleComparisonFixture): readonly RoleFitFixtureCheck[] {
  const comparison: RoleComparisonResult = compareRoleFits(fixture.inputs);
  const usableRole = comparison.testedRoles.find((item) => item.testedRole === fixture.expectedUsableRole);
  return [
    {
      fixtureId: fixture.id,
      passed:
        comparison.testedRoles.length === fixture.inputs.length &&
        comparison.testedRoles.every((item, index) => !("role" in item) && item.testedRole === fixture.inputs[index]?.testedRole) &&
        comparison.bestRole.length > 0 &&
        comparison.safestRole.length > 0 &&
        comparison.highestUpsideRole.length > 0 &&
        comparison.riskiestRole.length > 0 &&
        comparison.summary.length > 0 &&
        comparison.coachRecommendation.length > 0 &&
        comparison.playerId.length > 0 &&
        comparison.playerName.length > 0,
      detail: "RoleComparisonResult public shape complete",
    },
    {
      fixtureId: fixture.id,
      passed: comparison.bestRole === fixture.expectedBestRole,
      detail: `bestRole ${comparison.bestRole}`,
    },
    {
      fixtureId: fixture.id,
      passed: comparison.safestRole === fixture.expectedSafestRole,
      detail: `safestRole ${comparison.safestRole}`,
    },
    {
      fixtureId: fixture.id,
      passed: usableRole !== undefined && usableRole.score >= 60,
      detail: `${fixture.expectedUsableRole} score ${usableRole?.score ?? "missing"}`,
    },
    {
      fixtureId: fixture.id,
      passed: comparison.bestRole !== fixture.testedRoleThatMustNotBePrimary,
      detail: `${fixture.testedRoleThatMustNotBePrimary} is not primary`,
    },
  ];
}

function validateScoringIsolation(): readonly RoleFitFixtureCheck[] {
  const firstFixture = fixtures[0];
  if (firstFixture === undefined) {
    throw new Error("Role fit scoring isolation check requires at least one fixture");
  }
  const before = JSON.stringify({ registry: ACTIVE_SCORING_ACTION_REGISTRY, rules: V1_SCORING_RULES });
  const roleFitResult = computeRoleFit(firstFixture.input);
  const comparisonResult = compareRoleFits(milanInputs);
  const after = JSON.stringify({ registry: ACTIVE_SCORING_ACTION_REGISTRY, rules: V1_SCORING_RULES });
  const serializedRoleFit = JSON.stringify({ roleFitResult, comparisonResult });

  return [
    {
      fixtureId: "ROLE_FIT_SCORING_CONSTANTS",
      passed:
        pointValueForScoringActionType("SHOT_GOAL") === 3 &&
        TRY_TOUCHDOWN_POINT_VALUE === 5 &&
        CONVERSION_POINT_VALUE === 2 &&
        DROP_GOAL_POINT_VALUE === 2 &&
        scoringRegistryEntry("PENALTY_SHOT").active === false,
      detail: "SHOT_GOAL=3, TRY_TOUCHDOWN=5, CONVERSION_GOAL=2, DROP_GOAL=2, PENALTY_SHOT inactive",
    },
    {
      fixtureId: "ROLE_FIT_ISOLATION",
      passed: before === after,
      detail: "computeRoleFit and compareRoleFits do not mutate scoring rule or scoring action registry state.",
    },
    {
      fixtureId: "ROLE_FIT_NO_SCORING_EVENTS",
      passed:
        !serializedRoleFit.includes("ScoringEvent") &&
        !serializedRoleFit.includes("MatchBonusEvent") &&
        !serializedRoleFit.includes("liveScore") &&
        !serializedRoleFit.includes("scoreAfter"),
      detail: "Role Fit results contain no ScoringEvent, MatchBonusEvent, live score, or match result fields.",
    },
  ];
}

export function validateRoleFitEngineFixtures(): RoleFitFixtureValidationResult {
  const checks = [
    ...fixtures.flatMap(validateFixture),
    ...comparisonFixtures.flatMap(validateComparison),
    ...validateScoringIsolation(),
  ];

  return {
    passed: checks.every((item) => item.passed),
    checks,
    fixtureCount: fixtures.length,
    comparisonFixtureCount: comparisonFixtures.length,
    recommendations: [
      "CONFIRM_ROLE_FIT_ENGINE_CONTRACT_ALIGNMENT",
      "CONFIRM_NO_LEGACY_ROLE_FIELD",
      "CONFIRM_ROLE_FIT_ENGINE_SOURCE_ALIGNED",
      "CONFIRM_ROLE_FIT_SOURCE_READY_FOR_UI",
      "CONFIRM_ROLE_FIT_ENGINE_READY_FOR_UI",
      "PREPARE_ROLE_FIT_UI_IMPLEMENTATION",
      "KEEP_TRUE_ROLE_ARCHETYPES",
      "KEEP_SKILLS_SEPARATE_FROM_ROLES",
    ],
  };
}

export const ROLE_FIT_ENGINE_FIXTURE_INPUTS: readonly RoleFitFixture[] = fixtures;
export const ROLE_FIT_ENGINE_COMPARISON_INPUTS: readonly RoleComparisonFixture[] = comparisonFixtures;
