import { RoleFitBadge, RoleFitScoreBar } from "../roleFit";
import type { RosterRoleAssignment } from "../../features/roster";

export type RosterRoleAssignmentTableProps = {
  readonly assignments: readonly RosterRoleAssignment[];
};

function assignmentWarning(assignment: RosterRoleAssignment): string {
  const warnings: string[] = [];
  if (assignment.assignedDiffersFromBest) warnings.push(`Better as ${assignment.bestRole} in this roster context.`);
  if (assignment.riskyAssignment) warnings.push("Risky fit for this role; explain the protection plan before using it.");
  if (assignment.fatigueWarningLevel === "RISK" || assignment.fatigueWarningLevel === "CRITICAL") {
    warnings.push("Useful upside, but monitor fatigue.");
  }
  return warnings.length === 0 ? "Assignment is coherent in the current context." : warnings.join(" ");
}

export function RosterRoleAssignmentTable({ assignments }: RosterRoleAssignmentTableProps): JSX.Element {
  return (
    <section className="roster-role-assignment-table" aria-labelledby="roster-role-assignment-table-title">
      <h2 id="roster-role-assignment-table-title">Role assignment table</h2>
      <table>
        <caption>Assigned roles, best role fit, risk, fatigue, and inspection actions</caption>
        <thead>
          <tr>
            <th scope="col">Player</th>
            <th scope="col">Assigned role</th>
            <th scope="col">Best role</th>
            <th scope="col">Assigned score</th>
            <th scope="col">Assigned label</th>
            <th scope="col">Top reason</th>
            <th scope="col">Top risk</th>
            <th scope="col">Fatigue</th>
            <th scope="col">Coach note</th>
            <th scope="col">Details</th>
            <th scope="col">Compare</th>
          </tr>
        </thead>
        <tbody>
          {assignments.length === 0 ? (
            <tr>
              <td colSpan={11}>No roster players available yet.</td>
            </tr>
          ) : (
            assignments.map((assignment) => (
              <tr key={assignment.playerId}>
                <th scope="row">{assignment.playerName}</th>
                <td>{assignment.assignedRole}</td>
                <td>{assignment.bestRole}</td>
                <td>
                  <RoleFitScoreBar score={assignment.assignedRoleFit.score} label={assignment.assignedRoleFit.label} />
                </td>
                <td>
                  <RoleFitBadge label={assignment.assignedRoleFit.label} />
                </td>
                <td>{assignment.topReason}</td>
                <td>{assignment.topRisk}</td>
                <td>{assignment.fatigueWarningLevel}</td>
                <td>{assignmentWarning(assignment)}</td>
                <td>
                  <button type="button" data-player-id={assignment.playerId} data-action="view-role-fit-details">View details</button>
                </td>
                <td>
                  <button type="button" data-player-id={assignment.playerId} data-action="compare-role-fits">Compare roles</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}
