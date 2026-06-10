import type { TacticalFocus } from "./tacticalFocus";

export function formatFocusDebug(focus: TacticalFocus): readonly string[] {
  return [
    `focus ${focus.focusId}: ${focus.category}`,
    `zone ${focus.focusZone}`,
    `lane ${focus.focusLane ?? "none"}`,
    `primary ${focus.primaryActors.map((actor) => actor.initials).join(", ") || "none"}`,
    `secondary ${focus.secondaryActors.map((actor) => actor.initials).join(", ") || "none"}`,
    `priority ${focus.storyboardPriority}`,
  ];
}
