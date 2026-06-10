import type { RoleComparisonResult, RoleFitResult, TrueRole } from "../../systems/roleFit";
import { RoleComparisonPanel, RoleFitCard } from "../roleFit";
import { PlayerBestRolesPanel } from "./PlayerBestRolesPanel";
import { PlayerRoleDevelopmentPanel } from "./PlayerRoleDevelopmentPanel";

export type PlayerRoleFitSectionProps = {
  readonly comparison: RoleComparisonResult;
  readonly selectedRoleResult?: RoleFitResult;
};

function selectedResult(comparison: RoleComparisonResult, selectedRoleResult: RoleFitResult | undefined): RoleFitResult | undefined {
  return selectedRoleResult ?? comparison.testedRoles.find((result) => result.testedRole === comparison.bestRole) ?? comparison.testedRoles[0];
}

export function PlayerRoleFitSection({ comparison, selectedRoleResult }: PlayerRoleFitSectionProps): JSX.Element {
  const result = selectedResult(comparison, selectedRoleResult);
  const selectedRole = result?.testedRole ?? comparison.bestRole;

  return (
    <section className="player-role-fit-section" aria-labelledby={`player-role-fit-section-${comparison.playerId}-title`}>
      <header>
        <h1 id={`player-role-fit-section-${comparison.playerId}-title`}>{comparison.playerName} role fit</h1>
        <p>Selection changes the displayed result only; scores come from the existing comparison.testedRoles results.</p>
      </header>
      <PlayerBestRolesPanel comparison={comparison} />
      <label htmlFor={`player-role-fit-selector-${comparison.playerId}`}>Selected role</label>
      <select id={`player-role-fit-selector-${comparison.playerId}`} name="selectedRole" defaultValue={selectedRole}>
        {comparison.testedRoles.map((testedRole) => (
          <option key={testedRole.testedRole} value={testedRole.testedRole}>
            {testedRole.testedRole}
          </option>
        ))}
      </select>
      {result === undefined ? <p>No selected role fit available yet.</p> : <RoleFitCard result={result} />}
      {result === undefined ? null : <PlayerRoleDevelopmentPanel result={result} />}
      <RoleComparisonPanel comparison={comparison} />
    </section>
  );
}

export function roleResultForSelection(comparison: RoleComparisonResult, selectedRole: TrueRole): RoleFitResult | undefined {
  return comparison.testedRoles.find((result) => result.testedRole === selectedRole);
}
