import type { RoleComparisonResult, RoleFitResult, TrueRole } from "../../systems/roleFit";
import { RoleFitBadge, RoleFitScoreBar } from "../roleFit";

export type PlayerBestRolesPanelProps = {
  readonly comparison: RoleComparisonResult;
};

function fitForRole(comparison: RoleComparisonResult, role: TrueRole): RoleFitResult | undefined {
  return comparison.testedRoles.find((result) => result.testedRole === role);
}

function reason(result: RoleFitResult | undefined): string {
  return result?.topReasons[0]?.label ?? "No major strength signal available yet.";
}

function risk(result: RoleFitResult | undefined): string {
  return result?.topRisks[0] === undefined ? "No major risk identified in the current context." : `${result.topRisks[0].severity}: ${result.topRisks[0].label}`;
}

function roleSummary(label: string, role: TrueRole, result: RoleFitResult | undefined): JSX.Element {
  return (
    <article className="player-best-role-card" aria-label={`${label}: ${role}`}>
      <h3>{label}: {role}</h3>
      {result === undefined ? (
        <p>Role fit result not available for this role.</p>
      ) : (
        <>
          <RoleFitScoreBar score={result.score} label={result.label} />
          <RoleFitBadge label={result.label} />
          <p>Reason: {reason(result)}</p>
          <p>Risk: {risk(result)}</p>
        </>
      )}
    </article>
  );
}

export function PlayerBestRolesPanel({ comparison }: PlayerBestRolesPanelProps): JSX.Element {
  return (
    <section className="player-best-roles-panel" aria-labelledby="player-best-roles-panel-title">
      <h2 id="player-best-roles-panel-title">Role snapshot</h2>
      <div className="player-best-roles-panel__grid">
        {roleSummary("Best role", comparison.bestRole, fitForRole(comparison, comparison.bestRole))}
        {roleSummary("Safest role", comparison.safestRole, fitForRole(comparison, comparison.safestRole))}
        {roleSummary("Highest upside role", comparison.highestUpsideRole, fitForRole(comparison, comparison.highestUpsideRole))}
        {roleSummary("Riskiest role", comparison.riskiestRole, fitForRole(comparison, comparison.riskiestRole))}
      </div>
    </section>
  );
}
