import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { SnapshotReference } from "../visualization";
import type { DebugTimelineReplay } from "../../systems/debugTimeline";

type BallStateContractStatus = "PASS" | "FAIL";

interface BallStateContractCheck {
  readonly label: string;
  readonly status: BallStateContractStatus;
  readonly detail: string;
}

export interface BallStateZoneContractValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly BallStateContractCheck[];
}

function check(label: string, passed: boolean, detail: string): BallStateContractCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function renderMarkdown(input: {
  readonly checks: readonly BallStateContractCheck[];
  readonly sequenceOne: SnapshotReference | undefined;
  readonly timeline: DebugTimelineReplay;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";
  const contract = input.sequenceOne?.afterMetadata.ballZoneContract;
  const event = input.timeline.events.find((candidate) => candidate.sequenceNumber === 1 && candidate.actionNumber === 1);

  return [
    "# Ball State Zone Contract",
    "",
    `Status: ${status}`,
    "",
    "## Contract Definitions",
    "",
    "- tacticalTargetCluster: tactical area the action is trying to access; may differ from receiver zone.",
    "- selectedReceiverId: player selected to receive the action.",
    "- carrierResolvedZone: resolved current zone of the player carrying the ball.",
    "- actualReceptionZone: zone where the receiver actually receives the ball.",
    "- actualBallZone: true zone of the ball after the action.",
    "- worldStateBallZone: internal world-state ball zone; must represent actualBallZone.",
    "- selectedTargetZone: deprecated/debug alias mapped to tacticalTargetCluster unless semantics say otherwise.",
    "",
    "## Sequence 1 Action 1",
    "",
    `- tacticalTargetCluster: ${contract?.tacticalTargetCluster ?? "missing"}`,
    `- tactical target cluster: ${contract?.tacticalTargetCluster ?? "missing"}`,
    `- selectedReceiver: ${event?.actorModel?.receiverInitials ?? contract?.selectedReceiverId ?? "missing"}`,
    `- receiverResolvedZone: ${contract?.receiverResolvedZone ?? "missing"}`,
    `- actualReceptionZone: ${contract?.actualReceptionZone ?? "missing"}`,
    `- actualBallZone: ${contract?.actualBallZone ?? "missing"}`,
    `- actual ball zone after action: ${contract?.actualBallZone ?? "missing"}`,
    `- worldStateBallZone: ${contract?.worldStateBallZone ?? "missing"}`,
    `- world state ball zone after action: ${contract?.worldStateBallZone ?? "missing"}`,
    `- selectedTargetZoneSemantics: ${contract?.selectedTargetZoneSemantics ?? "missing"}`,
    `- ballZoneAfterSemantics: ${contract?.ballZoneAfterSemantics ?? "missing"}`,
    `- status: ${contract?.consistencyStatus ?? "missing"}`,
    `- reason: ${contract?.reason ?? "missing"}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateBallStateZoneContract(input: {
  readonly snapshots: readonly SnapshotReference[];
  readonly timeline: DebugTimelineReplay;
  readonly reportDirectory: string;
}): BallStateZoneContractValidationResult {
  const sequenceOne = input.snapshots.find((snapshot) => snapshot.sequenceNumber === 1 && snapshot.actionNumber === 1);
  const contract = sequenceOne?.afterMetadata.ballZoneContract;
  const event = input.timeline.events.find((candidate) => candidate.sequenceNumber === 1 && candidate.actionNumber === 1);
  const afterSvgPath =
    sequenceOne === undefined ? "" : join(input.reportDirectory, sequenceOne.afterPath.replace(/\//g, "\\"));
  const afterSvg = afterSvgPath.length > 0 && existsSync(afterSvgPath) ? readFileSync(afterSvgPath, "utf8") : "";
  const checks: readonly BallStateContractCheck[] = [
    check(
      "tactical target cluster separated from actual ball zone",
      contract?.tacticalTargetCluster === "Z3-C" && contract.actualBallZone === "Z3-HSL",
      `${contract?.tacticalTargetCluster ?? "missing"} vs ${contract?.actualBallZone ?? "missing"}`,
    ),
    check(
      "actualBallZone equals actualReceptionZone for completed pass/recycle",
      contract?.actualBallZone === contract?.actualReceptionZone,
      `${contract?.actualBallZone ?? "missing"} / ${contract?.actualReceptionZone ?? "missing"}`,
    ),
    check(
      "worldStateBallZone equals actualBallZone",
      contract?.worldStateBallZone === contract?.actualBallZone,
      `${contract?.worldStateBallZone ?? "missing"} / ${contract?.actualBallZone ?? "missing"}`,
    ),
    check(
      "carrierResolvedZone equals actualBallZone after transfer",
      contract?.carrierResolvedZone === contract?.actualBallZone,
      `${contract?.carrierResolvedZone ?? "missing"} / ${contract?.actualBallZone ?? "missing"}`,
    ),
    check(
      "selectedTargetZone is not used as actual ball zone unless semantics allow it",
      event?.actorModel?.selectedTargetZoneSemantics === "TACTICAL_TARGET_CLUSTER" &&
        event.actorModel.ballZoneAfterSemantics === "ACTUAL_BALL_ZONE" &&
        event.actorModel.ballZoneAfter === "Z3-HSL",
      `${event?.actorModel?.selectedTargetZoneSemantics ?? "missing"} / ${event?.actorModel?.ballZoneAfter ?? "missing"}`,
    ),
    check(
      "snapshot target highlight uses tacticalTargetCluster",
      afterSvg.includes("selected-target-Z3-C"),
      "selected target highlight remains on Z3-C",
    ),
    check(
      "snapshot ball marker uses actualBallZone",
      sequenceOne?.afterTruthContract.ballZone === "Z3-HSL",
      `${sequenceOne?.afterTruthContract.ballZone ?? "missing"}`,
    ),
    check(
      "timeline exposes both target and actual ball-zone semantics",
      event?.actorModel?.tacticalTargetCluster === "Z3-C" &&
        event.actorModel.actualBallZoneAfter === "Z3-HSL" &&
        event.actorModel.selectedTargetZoneSemantics === "TACTICAL_TARGET_CLUSTER" &&
        event.actorModel.ballZoneAfterSemantics === "ACTUAL_BALL_ZONE",
      "actorModel exposes tacticalTargetCluster, actualBallZoneAfter, selectedTargetZoneSemantics, ballZoneAfterSemantics",
    ),
  ];
  const reportPath = join(input.reportDirectory, "ball-state-zone-contract.md");

  writeFileSync(reportPath, renderMarkdown({ checks, sequenceOne, timeline: input.timeline }), "utf8");

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
