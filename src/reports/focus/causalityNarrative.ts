import { FocusCategory } from "./focusCategories";
import type { TacticalFocus } from "./tacticalFocus";

function actorInitials(focus: TacticalFocus, index: number): string {
  return focus.primaryActors[index]?.initials ?? focus.primaryActors[0]?.initials ?? "the actor";
}

export function buildCausalityLine(focus: TacticalFocus): string {
  const first = actorInitials(focus, 0);
  const second = actorInitials(focus, 1);

  switch (focus.category) {
    case FocusCategory.WeakSideAttack:
      return `${first} draws attention near the ball, so ${second} can attack outside the defender's awareness.`;
    case FocusCategory.PressBreak:
      return `${first} escapes the first pressure line, so the defensive block has to turn and chase.`;
    case FocusCategory.OverloadCreation:
      return `${first} fixes the nearest defender, so the extra support option becomes the pressure point.`;
    case FocusCategory.DelayedRecovery:
      return `${second} is late recovering, so ${first} can keep the next lane alive.`;
    case FocusCategory.FinishingWindow:
      return `${first} carries pressure into the red zone, so the goalkeeper and last line become the key duel.`;
    case FocusCategory.DepthAttack:
      return `${first} threatens depth, so the back line has to retreat before support is fully set.`;
    case FocusCategory.ReboundPhase:
      return `${first} keeps moving after the loose ball, so the second action becomes the main contest.`;
    case FocusCategory.ChaosRecovery:
      return `${first} reacts first to disorder, so the next shape depends on recovery timing.`;
    case FocusCategory.SupportTriangle:
      return `${first} has connected support, so possession can survive pressure without forcing the lane.`;
    case FocusCategory.StructureReset:
      return `${first} slows the action, so the team can rebuild shape around the ball.`;
    case FocusCategory.CounterpressCollapse:
    case FocusCategory.GoalkeeperSweep:
    case FocusCategory.LastLineBreak:
    case FocusCategory.CentralCombination:
    case FocusCategory.TransitionEscape:
    case FocusCategory.WidthIsolation:
      return `${first} changes the point of pressure, so the next tactical window depends on the response.`;
  }
}
