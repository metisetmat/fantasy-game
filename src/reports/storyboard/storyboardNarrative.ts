import type { SnapshotReference } from "../visualization";
import type { StoryboardTacticalFacts } from "./tacticalStoryboard";
import { TACTICAL_STORYBOARD_CONFIG } from "./storyboardConfig";

function roleText(player: { readonly roleInitials: string; readonly zone: string } | null): string {
  return player === null ? "the carrier" : `${player.roleInitials} in ${player.zone}`;
}

function trimBullets(bullets: readonly string[], max: number): readonly string[] {
  return bullets
    .filter((bullet, index, list) => bullet.trim().length > 0 && list.indexOf(bullet) === index)
    .slice(0, max);
}

function supportVerb(supportText: string): string {
  return supportText.includes(" and ") ? "give" : "gives";
}

export function buildBeforeNarrative(input: {
  readonly snapshot: SnapshotReference;
  readonly facts: StoryboardTacticalFacts;
}): readonly string[] {
  const lane = input.snapshot.beforeMetadata.passingLaneAnalysis ?? input.snapshot.afterMetadata.passingLaneAnalysis;
  const receiverText = roleText(input.facts.receiver);
  const runnerText = roleText(input.facts.keyRunner);
  const supportText = input.facts.keySupport.map((player) => player.roleInitials).join(" and ");
  const defenderText = input.facts.keyDefenders.map((player) => player.roleInitials).join(" and ");
  const bullets = [
    `${input.snapshot.attackingTeamName} starts the action through ${roleText(input.facts.ballCarrier)}.`,
    input.facts.selectedTargetZone === null
      ? "The selected option is a controlled reset rather than a clear target-zone attack."
      : `The selected option points toward ${input.facts.selectedTargetZone}.`,
    lane === null
      ? "No clean lane dominates the frame yet."
      : `The meaningful lane is ${lane.fromZone} to ${lane.toZone}, and it is ${lane.laneState.toLowerCase().replace("_", " ")}.`,
    input.facts.receiver === null ? "" : `${receiverText} is the intended receiving reference.`,
    input.facts.keyRunner === null ? "" : `${runnerText} starts the main off-ball movement.`,
    supportText === "" ? "" : `${supportText} ${supportVerb(supportText)} the possession side a nearby support line.`,
    defenderText === "" ? "" : `${input.snapshot.defendingTeamName} answers through ${defenderText} around the pressure lane.`,
  ];

  return trimBullets(bullets, TACTICAL_STORYBOARD_CONFIG.maxBeforeBullets);
}

export function buildAfterNarrative(input: {
  readonly snapshot: SnapshotReference;
  readonly facts: StoryboardTacticalFacts;
}): readonly string[] {
  const lane = input.snapshot.afterMetadata.passingLaneAnalysis;
  const recoveringText = input.facts.keyRecovering.map((player) => player.roleInitials).join(" and ");
  const dangerText = input.facts.dangerZone === null ? "" : `Danger now gathers around ${input.facts.dangerZone}.`;
  const overloadText = input.facts.overloadZone === null ? "" : `A usable overload cue appears around ${input.facts.overloadZone}.`;
  const bullets = [
    `${input.snapshot.attackingTeamName} finishes the action with ${roleText(input.facts.ballCarrier)} as the visible ball reference.`,
    lane === null
      ? "The action settles without a dominant lane read."
      : `The lane after the action is ${lane.laneState.toLowerCase().replace("_", " ")}.`,
    recoveringText === "" ? "" : `${recoveringText} is still recovering into the new structure.`,
    dangerText,
    overloadText,
    input.snapshot.afterMetadata.blindSideClaims[0] === undefined
      ? ""
      : "Blind-side awareness remains a tactical issue for the defending shape.",
    input.snapshot.afterMetadata.supportTriangle.connected
      ? "The support triangle helps stabilize the possession."
      : "Support is present but not fully connected yet.",
  ];

  return trimBullets(bullets, TACTICAL_STORYBOARD_CONFIG.maxAfterBullets);
}

export function buildAiTacticalAnalysis(input: {
  readonly snapshot: SnapshotReference;
  readonly beforeFacts: StoryboardTacticalFacts;
  readonly afterFacts: StoryboardTacticalFacts;
}): readonly string[] {
  const lane = input.snapshot.afterMetadata.passingLaneAnalysis;
  const cause = input.afterFacts.tacticalCause;
  const risk =
    lane?.laneState === "CLOSED"
      ? "The next risk is forcing action into a closed lane."
      : lane?.laneState === "OPEN"
        ? "The next opportunity is to use the lane before the defense folds."
        : "The next risk is the timing window closing before support arrives.";
  const bullets = [
    `Why it mattered: ${cause}.`,
    `Key cause: ${input.afterFacts.pressureSummary}.`,
    input.afterFacts.overloadZone === null
      ? "Biggest structural consequence: the defense keeps enough numbers to avoid a clean break."
      : `Biggest structural consequence: pressure shifts toward ${input.afterFacts.overloadZone}.`,
    risk,
    input.snapshot.afterMetadata.recoveryVectors.length === 0
      ? "Recovery note: no major late recovery vector defines this frame."
      : "Recovery note: at least one defender is still arriving into the lane.",
    input.snapshot.afterMetadata.perceptionClaims.length === 0
      ? ""
      : "Perception note: orientation and scan freshness help explain the defensive reaction.",
  ];

  return trimBullets(bullets, TACTICAL_STORYBOARD_CONFIG.maxAnalysisBullets);
}
