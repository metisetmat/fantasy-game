import { RoleComparisonPanel, RoleFitCard } from "../roleFit";
import type { RosterRoleAssignment } from "../../features/roster";

export type PlayerRoleFitDrawerProps = {
  readonly assignment: RosterRoleAssignment;
};

export function PlayerRoleFitDrawer({ assignment }: PlayerRoleFitDrawerProps): JSX.Element {
  const protectionNote = assignment.riskyAssignment
    ? "Risky fit for this role. Needs protection from nearby roles, and the coach can choose the upside knowingly."
    : "This recommendation is contextual, not an absolute truth.";

  return (
    <aside className="player-role-fit-drawer" aria-labelledby={`player-role-fit-drawer-${assignment.playerId}-title`}>
      <h2 id={`player-role-fit-drawer-${assignment.playerId}-title`}>{assignment.playerName} role fit details</h2>
      <p>{protectionNote} Risks are tactical and contextual; they are not a judgment that the player is bad.</p>
      <RoleFitCard result={assignment.assignedRoleFit} />
      <RoleComparisonPanel comparison={assignment.comparison} />
    </aside>
  );
}
