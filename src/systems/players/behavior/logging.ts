import { createLogLine, type TacticalLogLine } from "../../interactions/shared";
import { getRoleArchetype } from "../roleArchetypes";
import { getRoleBehaviorProfile } from "./roleBehaviorProfiles";
import type { PlayerRole } from "../../../models/player";
import type { TacticalStyle } from "../../../models/tactics";

function formatRisk(value: number): string {
  if (value >= 70) {
    return "HIGH";
  }

  if (value >= 50) {
    return "MEDIUM";
  }

  return "LOW";
}

export function createRoleBehaviorProfileLogs(input: {
  readonly title: string;
  readonly roles: readonly PlayerRole[];
  readonly tacticalStyle?: TacticalStyle;
}): readonly TacticalLogLine[] {
  return [
    createLogLine(input.title),
    ...input.roles.map((role) => {
      const profile = getRoleBehaviorProfile(role, input.tacticalStyle);
      const archetype = getRoleArchetype(role);
      return createLogLine(
        `- ${archetype.displayName}: source ${profile.source}; ${profile.normalBehavior}; transition: ${profile.transitionBehavior}; chaos: ${profile.chaosBehavior}; risk ${formatRisk(profile.riskTolerance)} (${profile.riskTolerance}/100).`,
      );
    }),
  ];
}
