import type { FitRisk } from "../../systems/roleFit";

export type RoleFitRisksListProps = {
  readonly risks: readonly FitRisk[];
};

const riskOrder: Readonly<Record<FitRisk["severity"], number>> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export function RoleFitRisksList({ risks }: RoleFitRisksListProps): JSX.Element {
  const sortedRisks = [...risks].sort((left, right) => riskOrder[left.severity] - riskOrder[right.severity]);

  return (
    <section className="role-fit-risks" aria-labelledby="role-fit-risks-title">
      <h3 id="role-fit-risks-title">Top risks</h3>
      <ul>
        {sortedRisks.length === 0 ? (
          <li>No major risk identified in the current context.</li>
        ) : (
          sortedRisks.map((risk) => (
            <li className={`role-fit-risk role-fit-risk--${risk.severity.toLowerCase()}`} key={risk.id}>
              <strong>
                {risk.severity} risk: {risk.label}
              </strong>
              <p>{risk.explanation}</p>
              <p>Affected phase: {risk.affectedPhase}.</p>
              {risk.mitigation === undefined ? null : <p className="role-fit-risk__mitigation">Mitigation: {risk.mitigation}</p>}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
