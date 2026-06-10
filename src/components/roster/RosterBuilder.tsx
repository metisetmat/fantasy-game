import type { RosterRoleFitModel } from "../../features/roster";
import { PlayerRoleFitDrawer } from "./PlayerRoleFitDrawer";
import { RoleCoveragePanel } from "./RoleCoveragePanel";
import { RosterRoleAssignmentTable } from "./RosterRoleAssignmentTable";

export type RosterBuilderProps = {
  readonly model: RosterRoleFitModel;
};

function recommendedAssignment(model: RosterRoleFitModel) {
  return model.assignments.find((assignment) => assignment.playerId === model.recommendedInspectionPlayerId) ?? model.assignments[0];
}

export function RosterBuilder({ model }: RosterBuilderProps): JSX.Element {
  const inspected = recommendedAssignment(model);

  return (
    <main className="roster-builder" aria-labelledby="roster-builder-title">
      <header>
        <h1 id="roster-builder-title">{model.teamName} roster builder</h1>
        <p>{model.styleContext.explanation}</p>
      </header>
      <section aria-labelledby="roster-builder-questions-title">
        <h2 id="roster-builder-questions-title">Coach questions</h2>
        <ul>
          <li>Who should play which role?</li>
          <li>Which roles are well covered, thin, risky, or missing?</li>
          <li>Which assignments are fatigue-sensitive?</li>
          <li>Which player should be inspected next?</li>
        </ul>
      </section>
      <section aria-labelledby="roster-builder-warnings-title">
        <h2 id="roster-builder-warnings-title">Roster warnings</h2>
        <ul>
          {model.warnings.map((warning) => <li key={warning}>{warning}</li>)}
        </ul>
      </section>
      <RoleCoveragePanel coverage={model.coverage} warnings={model.warnings} />
      <RosterRoleAssignmentTable assignments={model.assignments} />
      {inspected === undefined ? null : <PlayerRoleFitDrawer assignment={inspected} />}
    </main>
  );
}
