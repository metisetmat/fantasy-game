import { createFixtureRosterRoleFitModel } from "../features/roster";
import { RosterBuilder } from "../components/roster";

export function RosterBuilderPage(): JSX.Element {
  return <RosterBuilder model={createFixtureRosterRoleFitModel()} />;
}
