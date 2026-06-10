import { compareRoleFits } from "../../systems/roleFit";
import { ROLE_FIT_ENGINE_COMPARISON_INPUTS, ROLE_FIT_ENGINE_FIXTURE_INPUTS } from "../../systems/roleFit/roleFitFixtures";
import type { RoleComparisonResult, RoleFitInput, RoleFitResult, TrueRole } from "../../systems/roleFit";
import { TRUE_ROLES } from "../roster";

export interface PlayerRoleFitProfileModel {
  readonly comparison: RoleComparisonResult;
  readonly selectedRoleResult: RoleFitResult;
  readonly selectedRole: TrueRole;
}

function fixtureInput(id: string): RoleFitInput {
  const fixture = ROLE_FIT_ENGINE_FIXTURE_INPUTS.find((item) => item.id === id);
  if (fixture === undefined) {
    throw new Error(`Missing role fit fixture ${id}`);
  }
  return fixture.input;
}

function comparisonInputs(id: string): readonly RoleFitInput[] {
  const fixture = ROLE_FIT_ENGINE_COMPARISON_INPUTS.find((item) => item.id === id);
  if (fixture === undefined) {
    throw new Error(`Missing comparison fixture ${id}`);
  }
  return fixture.inputs;
}

export function buildPlayerRoleFitProfile(input: {
  readonly baseInput: RoleFitInput;
  readonly selectedRole?: TrueRole;
  readonly candidateRoles?: readonly TrueRole[];
}): PlayerRoleFitProfileModel {
  const candidateRoles = input.candidateRoles ?? TRUE_ROLES;
  const comparison = compareRoleFits(candidateRoles.map((testedRole) => ({ ...input.baseInput, testedRole })));
  const selectedRole = input.selectedRole ?? comparison.bestRole;
  const selectedRoleResult =
    comparison.testedRoles.find((result) => result.testedRole === selectedRole) ??
    comparison.testedRoles.find((result) => result.testedRole === comparison.bestRole);

  if (selectedRoleResult === undefined) {
    throw new Error("Player profile role fit requires at least one tested role result");
  }

  return {
    comparison,
    selectedRole: selectedRoleResult.testedRole,
    selectedRoleResult,
  };
}

export function bestRoleResult(comparison: RoleComparisonResult): RoleFitResult {
  const result = comparison.testedRoles.find((item) => item.testedRole === comparison.bestRole);
  if (result === undefined) {
    throw new Error(`Best role ${comparison.bestRole} is missing from testedRoles`);
  }
  return result;
}

export function createMilanPlayerRoleFitProfile(): PlayerRoleFitProfileModel {
  const first = comparisonInputs("RF_FIX_04")[0];
  if (first === undefined) {
    throw new Error("Milan comparison fixture is missing");
  }

  return buildPlayerRoleFitProfile({
    baseInput: first,
    candidateRoles: comparisonInputs("RF_FIX_04").map((item) => item.testedRole),
  });
}

export function createGoalkeeperPlayerRoleFitProfile(): PlayerRoleFitProfileModel {
  return buildPlayerRoleFitProfile({
    baseInput: fixtureInput("RF_FIX_06"),
    selectedRole: "Goalkeeper / Free Safety",
    candidateRoles: ["Goalkeeper / Free Safety", "Pivot", "Forward Leader"],
  });
}

export function createSpaceHunterPlayerRoleFitProfile(): PlayerRoleFitProfileModel {
  return buildPlayerRoleFitProfile({
    baseInput: fixtureInput("RF_FIX_08"),
    selectedRole: "Space Hunter",
    candidateRoles: ["Space Hunter", "Right Piston", "Playmaker"],
  });
}
