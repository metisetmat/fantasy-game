import type { SnapshotReference } from "../visualization";
import { FocusCategory } from "./focusCategories";
import { buildCausalityLine } from "./causalityNarrative";
import type { TacticalFocus } from "./tacticalFocus";

function trimBullets(bullets: readonly string[], max: number): readonly string[] {
  return bullets.filter((bullet) => bullet.trim().length > 0).slice(0, max);
}

function actor(focus: TacticalFocus, index: number): string {
  const focusActor = focus.primaryActors[index] ?? focus.primaryActors[0];

  return focusActor === undefined ? "the key player" : `${focusActor.initials} in ${focusActor.zone}`;
}

function actorFromSnapshot(input: {
  readonly snapshot: SnapshotReference;
  readonly focus: TacticalFocus;
  readonly index: number;
  readonly frame: "before" | "after";
}): string {
  const focusActor = input.focus.primaryActors[input.index] ?? input.focus.primaryActors[0];
  if (focusActor === undefined) {
    return "the key player";
  }

  const metadata = input.frame === "before" ? input.snapshot.beforeMetadata : input.snapshot.afterMetadata;
  const player = metadata.playerStates.find((candidate) => candidate.playerId === focusActor.playerId);

  return `${focusActor.initials} in ${player?.zone ?? focusActor.zone}`;
}

function secondary(focus: TacticalFocus, index: number): string {
  const focusActor = focus.secondaryActors[index];

  return focusActor === undefined ? "" : `${focusActor.initials} in ${focusActor.zone}`;
}

function secondaryFromSnapshot(input: {
  readonly snapshot: SnapshotReference;
  readonly focus: TacticalFocus;
  readonly index: number;
  readonly frame: "before" | "after";
}): string {
  const focusActor = input.focus.secondaryActors[input.index];
  if (focusActor === undefined) {
    return "";
  }

  const metadata = input.frame === "before" ? input.snapshot.beforeMetadata : input.snapshot.afterMetadata;
  const player = metadata.playerStates.find((candidate) => candidate.playerId === focusActor.playerId);

  return `${focusActor.initials} in ${player?.zone ?? focusActor.zone}`;
}

function laneText(focus: TacticalFocus): string {
  return focus.focusLane === null ? `the lane around ${focus.focusZone}` : focus.focusLane.replace("->", " to ");
}

export function buildFocusBeforeNarrative(input: {
  readonly snapshot: SnapshotReference;
  readonly focus: TacticalFocus;
}): readonly string[] {
  const support = secondaryFromSnapshot({ snapshot: input.snapshot, focus: input.focus, index: 0, frame: "before" });
  const bullets = [
    `${input.focus.attackingTeam} frames this action as ${input.focus.category.toLowerCase().replace(/_/g, " ")}.`,
    `${actorFromSnapshot({ snapshot: input.snapshot, focus: input.focus, index: 0, frame: "before" })} is the first visual reference.`,
    `${input.focus.tacticalTension}`,
    `The key space is ${input.focus.focusZone}, with ${laneText(input.focus)} as the lane to watch.`,
    support === "" ? "" : `${support} is the nearest support piece in the story.`,
    input.focus.supportingEvidence[0] === undefined ? "" : `Visible cue: ${input.focus.supportingEvidence[0]}.`,
  ];

  return trimBullets(bullets, 6);
}

export function buildFocusAfterNarrative(input: {
  readonly snapshot: SnapshotReference;
  readonly focus: TacticalFocus;
}): readonly string[] {
  const second = actorFromSnapshot({ snapshot: input.snapshot, focus: input.focus, index: 1, frame: "after" });
  const lane = input.snapshot.afterMetadata.passingLaneAnalysis;
  const laneConsequence =
    lane === null
      ? `The action changes the shape around ${input.focus.focusZone}.`
      : `The lane is now ${lane.laneState.toLowerCase().replace("_", " ")}, so the next touch has to respect pressure.`;
  const categoryLine =
    input.focus.category === FocusCategory.WeakSideAttack
      ? `${second} is the player the defense must locate after the action.`
      : input.focus.category === FocusCategory.DelayedRecovery
        ? `${second} defines the recovery race after the action.`
        : input.focus.category === FocusCategory.FinishingWindow
          ? `${second} becomes part of the last-line problem.`
          : `${second} is the second reference in the consequence.`;
  const bullets = [
    buildCausalityLine(input.focus),
    laneConsequence,
    categoryLine,
    input.focus.supportingEvidence[1] === undefined
      ? `The visual change pulls attention back toward ${input.focus.focusZone}.`
      : `The visible change is ${input.focus.supportingEvidence[1]}.`,
  ];

  return trimBullets(bullets, 6);
}

export function buildFocusTacticalAnalysis(input: {
  readonly snapshot: SnapshotReference;
  readonly focus: TacticalFocus;
}): readonly string[] {
  const lane = input.snapshot.afterMetadata.passingLaneAnalysis;
  const consequence =
    lane?.laneState === "OPEN"
      ? "The next opportunity is immediate because the lane is still open."
      : lane?.laneState === "CLOSED"
        ? "The next risk is forcing the same lane after recovery has arrived."
        : "The next decision depends on whether support arrives before pressure.";

  return trimBullets(
    [
      `Why it matters: ${input.focus.focusReason}.`,
      `Cause to effect: ${buildCausalityLine(input.focus)}`,
      `Main tension: ${input.focus.tacticalTension}`,
      `Biggest consequence: the action redirects attention to ${input.focus.focusZone}.`,
      consequence,
      `Suppressed noise: ${input.focus.suppressions.slice(0, 2).join(" and ")}.`,
    ],
    6,
  );
}
