import type { RoleComparisonResult, RoleFitResult } from "../../systems/roleFit";
import { RoleFitBadge } from "./RoleFitBadge";
import { RoleFitScoreBar } from "./RoleFitScoreBar";

export type RoleComparisonPanelProps = {
  readonly comparison: RoleComparisonResult;
};

function topReason(result: RoleFitResult): string {
  return result.topReasons[0]?.label ?? "No major strength signal available yet.";
}

function topRisk(result: RoleFitResult): string {
  return result.topRisks[0] === undefined
    ? "No major risk identified in the current context."
    : `${result.topRisks[0].severity}: ${result.topRisks[0].label}`;
}

function fatigueText(result: RoleFitResult): string {
  return result.fatigueWarning === undefined ? "No fatigue warning" : `${result.fatigueWarning.level}: ${result.fatigueWarning.explanation}`;
}

export function RoleComparisonPanel({ comparison }: RoleComparisonPanelProps): JSX.Element {
  return (
    <section className="role-comparison-panel" aria-labelledby={`role-comparison-${comparison.playerId}-title`}>
      <header>
        <h2 id={`role-comparison-${comparison.playerId}-title`}>{comparison.playerName} role comparison</h2>
        <p>{comparison.summary.trim().length === 0 ? "No comparison summary available yet." : comparison.summary}</p>
      </header>
      <dl className="role-comparison-panel__decision-map">
        <div>
          <dt>Best role</dt>
          <dd>{comparison.bestRole}. Best role balances score and risk, so it is not always the highest raw score.</dd>
        </div>
        <div>
          <dt>Safest role</dt>
          <dd>{comparison.safestRole}. Safest role favors reliability and lower risk load.</dd>
        </div>
        <div>
          <dt>Highest upside role</dt>
          <dd>{comparison.highestUpsideRole}. Upside can tolerate more risk when the reward is clear.</dd>
        </div>
        <div>
          <dt>Riskiest role</dt>
          <dd>
            <strong>Warning:</strong> {comparison.riskiestRole} is shown for roster awareness, not as a recommendation.
          </dd>
        </div>
      </dl>
      <table className="role-comparison-panel__table">
        <caption>Tested roles, scores, reasons, risks, and fatigue warnings</caption>
        <thead>
          <tr>
            <th scope="col">Role</th>
            <th scope="col">Score</th>
            <th scope="col">Label</th>
            <th scope="col">Top reason</th>
            <th scope="col">Top risk</th>
            <th scope="col">Fatigue warning</th>
          </tr>
        </thead>
        <tbody>
          {comparison.testedRoles.length === 0 ? (
            <tr>
              <td colSpan={6}>No tested roles available for this player yet.</td>
            </tr>
          ) : (
            comparison.testedRoles.map((result) => (
              <tr key={result.testedRole}>
                <th scope="row">{result.testedRole}</th>
                <td>
                  <RoleFitScoreBar score={result.score} label={result.label} />
                </td>
                <td>
                  <RoleFitBadge label={result.label} />
                </td>
                <td>{topReason(result)}</td>
                <td>{topRisk(result)}</td>
                <td>{fatigueText(result)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <section aria-label="Coach recommendation">
        <h3>Coach recommendation</h3>
        <p>{comparison.coachRecommendation.trim().length === 0 ? "No coach recommendation available yet." : comparison.coachRecommendation}</p>
      </section>
    </section>
  );
}
