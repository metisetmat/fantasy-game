import type { TacticalFocus } from "./tacticalFocus";

export enum VisualIntensity {
  Primary = "PRIMARY",
  Secondary = "SECONDARY",
  Tertiary = "TERTIARY",
}

export interface FocusVisualPlan {
  readonly primaryPlayerIds: readonly string[];
  readonly secondaryPlayerIds: readonly string[];
  readonly focusZone: string;
  readonly showActionLane: boolean;
  readonly showRecovery: boolean;
  readonly showDangerCue: boolean;
  readonly showSupportCue: boolean;
  readonly maxPrimaryOverlays: number;
  readonly afterDeltaLabel: string;
}

export function buildFocusVisualPlan(focus: TacticalFocus): FocusVisualPlan {
  return {
    primaryPlayerIds: focus.primaryActors.map((actor) => actor.playerId),
    secondaryPlayerIds: focus.secondaryActors.map((actor) => actor.playerId),
    focusZone: focus.focusZone,
    showActionLane: true,
    showRecovery: focus.supportingEvidence.some((evidence) => evidence.includes("recovery")),
    showDangerCue:
      focus.category === "FINISHING_WINDOW" ||
      focus.category === "WEAK_SIDE_ATTACK" ||
      focus.category === "OVERLOAD_CREATION",
    showSupportCue: focus.category === "SUPPORT_TRIANGLE" || focus.category === "STRUCTURE_RESET",
    maxPrimaryOverlays: 3,
    afterDeltaLabel: focus.tacticalTension,
  };
}
