import { PlayerRoleFitSection } from "../components/player";
import { createMilanPlayerRoleFitProfile } from "../features/player";

export function PlayerProfilePage(): JSX.Element {
  const profile = createMilanPlayerRoleFitProfile();
  return <PlayerRoleFitSection comparison={profile.comparison} selectedRoleResult={profile.selectedRoleResult} />;
}
