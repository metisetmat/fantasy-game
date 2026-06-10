import type { RoleCoverageRow } from "../../features/roster";
import { TRUE_ROLES } from "../../features/roster";

export type RoleCoveragePanelProps = {
  readonly coverage: readonly RoleCoverageRow[];
  readonly warnings: readonly string[];
};

function coverageFor(rows: readonly RoleCoverageRow[], trueRole: string): RoleCoverageRow | undefined {
  return rows.find((row) => row.trueRole === trueRole);
}

export function RoleCoveragePanel({ coverage, warnings }: RoleCoveragePanelProps): JSX.Element {
  return (
    <section className="role-coverage-panel" aria-labelledby="role-coverage-panel-title">
      <h2 id="role-coverage-panel-title">Role coverage</h2>
      <ul className="role-coverage-panel__warnings">
        {warnings.map((warning) => <li key={warning}>{warning}</li>)}
      </ul>
      <table>
        <caption>Coverage for the 10 true roles</caption>
        <thead>
          <tr>
            <th scope="col">True role</th>
            <th scope="col">Assigned player</th>
            <th scope="col">Best available candidate</th>
            <th scope="col">Best fit score</th>
            <th scope="col">Viable candidates</th>
            <th scope="col">Coverage status</th>
            <th scope="col">Explanation</th>
          </tr>
        </thead>
        <tbody>
          {TRUE_ROLES.map((trueRole) => {
            const row = coverageFor(coverage, trueRole);
            return row === undefined ? (
              <tr key={trueRole}>
                <th scope="row">{trueRole}</th>
                <td colSpan={6}>Missing coverage data.</td>
              </tr>
            ) : (
              <tr className={`role-coverage role-coverage--${row.status.toLowerCase()}`} key={trueRole}>
                <th scope="row">{row.trueRole}</th>
                <td>{row.assignedPlayerName ?? "Unassigned"}</td>
                <td>{row.bestAvailableCandidateName ?? "No candidate"}</td>
                <td>{row.bestFitScore}/100</td>
                <td>{row.viableCandidateCount}</td>
                <td>{row.status}</td>
                <td>{row.explanation}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
