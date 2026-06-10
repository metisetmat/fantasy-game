import {
  ROLE_FIT_ENGINE_COMPARISON_INPUTS,
  ROLE_FIT_ENGINE_FIXTURE_INPUTS,
  validateRoleFitEngineFixtures,
} from "./roleFitFixtures";

export const visibleRoleFitFixtureIdsUnderTest = [
  "RF_FIX_01",
  "RF_FIX_02",
  "RF_FIX_03",
  "RF_FIX_05",
  "RF_FIX_06",
  "RF_FIX_07",
  "RF_FIX_08",
  "RF_FIX_09",
  "RF_FIX_10",
  "RF_FIX_11",
  "RF_FIX_12",
  "RF_FIX_13",
] as const;

export const visibleRoleComparisonFixtureIdsUnderTest = ["RF_FIX_04"] as const;

export const visibleRoleFitFixtureAssertionsUnderTest = [
  "all 13 role-fit fixtures",
  "multi-role comparison fixture",
  "score ranges",
  "exact labels",
  "expectedTopReasonIds",
  "expectedTopRiskIds",
  "expected caps / penalties",
  "expected fatigueWarning level",
  "mustNotContain terms",
  "RoleFitInput testedRole public contract",
  "RoleFitResult public contract",
  "RoleFitResult contains testedRole and no public role key",
  "RoleComparisonResult public contract",
  "RoleComparisonResult testedRoles contain testedRole and no public role key",
  "computeRoleFit does not create ScoringEvents",
  "compareRoleFits does not create ScoringEvents",
  "computeRoleFit does not mutate MatchBonusEvent",
  "computeRoleFit does not mutate live score",
  "computeRoleFit does not alter scoring constants",
  "computeRoleFit does not read/write match result state",
] as const;

export const roleFitEngineFixtureTestResult = validateRoleFitEngineFixtures();

const fixtureIds = ROLE_FIT_ENGINE_FIXTURE_INPUTS.map((fixture) => fixture.id);
const comparisonFixtureIds = ROLE_FIT_ENGINE_COMPARISON_INPUTS.map((fixture) => fixture.id);

const allVisibleFixturesPresent =
  visibleRoleFitFixtureIdsUnderTest.every((fixtureId) => fixtureIds.includes(fixtureId)) &&
  visibleRoleComparisonFixtureIdsUnderTest.every((fixtureId) => comparisonFixtureIds.includes(fixtureId));

const allFixtureExpectationsRemainStrict = ROLE_FIT_ENGINE_FIXTURE_INPUTS.every(
  (fixture) =>
    fixture.expectation.scoreRange.length === 2 &&
    fixture.expectation.label.length > 0 &&
    ((fixture.expectation.requiredReasonIds?.length ?? 0) > 0 ||
      (fixture.expectation.requiredRiskIds?.length ?? 0) > 0 ||
      (fixture.expectation.requiredPenaltyIds?.length ?? 0) > 0),
);

if (!allVisibleFixturesPresent) {
  throw new Error(`Role fit fixture test coverage is incomplete: ${fixtureIds.join(", ")} / ${comparisonFixtureIds.join(", ")}`);
}

if (!allFixtureExpectationsRemainStrict) {
  throw new Error("Role fit fixture expectations were weakened or left underspecified.");
}

if (!roleFitEngineFixtureTestResult.passed) {
  throw new Error(
    `Role fit engine fixture validation failed: ${roleFitEngineFixtureTestResult.checks
      .filter((item) => !item.passed)
      .map((item) => `${item.fixtureId} ${item.detail}`)
      .join("; ")}`,
  );
}
