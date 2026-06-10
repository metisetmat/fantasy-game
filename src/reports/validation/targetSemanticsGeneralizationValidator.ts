import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { BallTargetType } from "../../systems/ball";
import type { DebugTimelineEvent, DebugTimelineReplay } from "../../systems/debugTimeline";
import {
  describeTargetSemantics,
  targetTypeForActionType,
  validateTargetSemanticReason,
} from "../../systems/targets";

type TargetSemanticsStatus = "PASS" | "FAIL";

interface TargetSemanticsCheck {
  readonly label: string;
  readonly status: TargetSemanticsStatus;
  readonly detail: string;
}

export interface TargetSemanticsGeneralizationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly TargetSemanticsCheck[];
}

function check(label: string, passed: boolean, detail: string): TargetSemanticsCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function targetDescription(event: DebugTimelineEvent | undefined): {
  readonly targetType: string;
  readonly reason: string;
  readonly whyTargetDiffersFromReceiverZone: string;
} {
  const contract = event?.actorModel?.ballZoneContract;
  if (contract === undefined) {
    return {
      targetType: "missing",
      reason: "missing",
      whyTargetDiffersFromReceiverZone: "missing",
    };
  }

  const description = describeTargetSemantics({
    targetType: contract.targetType,
    tacticalTargetCluster: contract.tacticalTargetCluster,
    receiverLabel: event?.actorModel?.receiverInitials ?? undefined,
    receiverResolvedZone: contract.receiverResolvedZone,
    actualReceptionZone: contract.actualReceptionZone,
  });

  return {
    targetType: contract.targetType,
    reason: contract.reason,
    whyTargetDiffersFromReceiverZone: description.whyTargetDiffersFromReceiverZone,
  };
}

function renderMarkdown(input: {
  readonly timeline: DebugTimelineReplay;
  readonly checks: readonly TargetSemanticsCheck[];
}): string {
  const failures = input.checks.filter((item) => item.status === "FAIL").length;
  const status = failures === 0 ? "PASS" : "FAIL";
  const actionOne = input.timeline.events.find((event) => event.sequenceNumber === 1 && event.actionNumber === 1);
  const actionTwo = input.timeline.events.find((event) => event.sequenceNumber === 1 && event.actionNumber === 2);
  const actionOneTarget = targetDescription(actionOne);
  const actionTwoTarget = targetDescription(actionTwo);

  return [
    "# Target Semantics Generalization",
    "",
    `Status: ${status}`,
    "",
    "## Sequence 1 Action 1",
    "",
    `- selectedActionType: ${actionOne?.actorModel?.actionSemanticContract?.selectedActionType ?? "missing"}`,
    `- targetType: ${actionOneTarget.targetType}`,
    `- reason: ${actionOneTarget.reason}`,
    `- whyTargetDiffersFromReceiverZone: ${actionOneTarget.whyTargetDiffersFromReceiverZone}`,
    "",
    "## Sequence 1 Action 2",
    "",
    `- selectedActionType: ${actionTwo?.actorModel?.actionSemanticContract?.selectedActionType ?? "missing"}`,
    `- targetType: ${actionTwoTarget.targetType}`,
    `- reason: ${actionTwoTarget.reason}`,
    `- whyTargetDiffersFromReceiverZone: ${actionTwoTarget.whyTargetDiffersFromReceiverZone}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateTargetSemanticsGeneralization(input: {
  readonly timeline: DebugTimelineReplay;
  readonly reportMarkdown: string;
  readonly reportDirectory: string;
}): TargetSemanticsGeneralizationResult {
  const semanticEvents = input.timeline.events.filter((event) => event.actorModel?.actionSemanticContract !== undefined);
  const actionOne = input.timeline.events.find((event) => event.sequenceNumber === 1 && event.actionNumber === 1);
  const actionTwo = input.timeline.events.find((event) => event.sequenceNumber === 1 && event.actionNumber === 2);
  const actionOneContract = actionOne?.actorModel?.ballZoneContract;
  const actionTwoContract = actionTwo?.actorModel?.ballZoneContract;
  const actionTwoDescription = targetDescription(actionTwo);
  const supportClusterCount = semanticEvents.filter(
    (event) => event.actorModel?.ballZoneContract?.targetType === BallTargetType.SupportCluster,
  ).length;
  const forbiddenReasonFailures = semanticEvents
    .map((event) => {
      const contract = event.actorModel?.ballZoneContract;
      if (contract === undefined) {
        return null;
      }

      const description = targetDescription(event);
      const validation = validateTargetSemanticReason({
        targetType: contract.targetType,
        reason: contract.reason,
        whyTargetDiffersFromReceiverZone: description.whyTargetDiffersFromReceiverZone,
      });

      return validation.valid
        ? null
        : `${event.id}: ${contract.targetType} contains ${validation.forbiddenTerms.join(", ")}`;
    })
    .filter((failure): failure is string => failure !== null);
  const mappingMismatches = semanticEvents.filter((event) => {
    const actionType = event.actorModel?.actionSemanticContract?.selectedActionType;
    const targetType = event.actorModel?.ballZoneContract?.targetType;

    return actionType !== undefined &&
      targetType !== undefined &&
      targetType !== BallTargetType.PlayerTarget &&
      targetType !== targetTypeForActionType(actionType);
  }).length;
  const supportClusterMisuseCount = semanticEvents.filter((event) => {
    const actionType = event.actorModel?.actionSemanticContract?.selectedActionType;
    const targetType = event.actorModel?.ballZoneContract?.targetType;

    return targetType === BallTargetType.SupportCluster && actionType !== "SUPPORT_CLUSTER_RECYCLE";
  }).length;
  const staleTargetTemplateLeakCount = semanticEvents.filter((event) => {
    const actionType = event.actorModel?.actionSemanticContract?.selectedActionType;
    const description = targetDescription(event);

    return actionType !== "SUPPORT_CLUSTER_RECYCLE" &&
      `${description.reason} ${description.whyTargetDiffersFromReceiverZone}`.toLowerCase().includes("safe recycle cluster");
  }).length;
  const candidateMismatchCount =
    (input.reportMarkdown.match(/candidate\/executed consistency: FAIL/g) ?? []).length;
  const checks: readonly TargetSemanticsCheck[] = [
    check(
      "Sequence 1 Action 1 target semantics match SUPPORT_CLUSTER_RECYCLE",
      actionOne?.actorModel?.actionSemanticContract?.selectedActionType === "SUPPORT_CLUSTER_RECYCLE" &&
        actionOneContract?.targetType === BallTargetType.SupportCluster &&
        actionOneContract.reason.includes("pressure escape cluster"),
      `${actionOneContract?.targetType ?? "missing"} / ${actionOneContract?.reason ?? "missing"}`,
    ),
    check(
      "Sequence 1 Action 2 target semantics match FORWARD_PROGRESS",
      actionTwo?.actorModel?.actionSemanticContract?.selectedActionType === "FORWARD_PROGRESS" &&
        actionTwoContract?.targetType === BallTargetType.StructureAdvancementTarget &&
        actionTwoContract.reason.includes("structure-advancement target cluster"),
      `${actionTwoContract?.targetType ?? "missing"} / ${actionTwoContract?.reason ?? "missing"}`,
    ),
    check(
      "FORWARD_PROGRESS target reason does not mention safe recycle cluster",
      !`${actionTwoDescription.reason} ${actionTwoDescription.whyTargetDiffersFromReceiverZone}`
        .toLowerCase()
        .includes("safe recycle cluster"),
      actionTwoDescription.reason,
    ),
    check(
      "SUPPORT_CLUSTER target reason is only used for recycle/support-cluster actions",
      supportClusterMisuseCount === 0,
      `${supportClusterMisuseCount} non-recycle support-cluster target uses`,
    ),
    check(
      "targetType is not SUPPORT_CLUSTER for every action",
      supportClusterCount < semanticEvents.length,
      `${supportClusterCount}/${semanticEvents.length}`,
    ),
    check(
      "no dt-s1-a1 target reason template leaked into non-recycle actions",
      staleTargetTemplateLeakCount === 0,
      `${staleTargetTemplateLeakCount} stale target reason leaks`,
    ),
    check(
      "Ball State Zone Contract reason matches selectedActionType",
      mappingMismatches === 0 && forbiddenReasonFailures.length === 0,
      mappingMismatches === 0 ? "0 mapping mismatches" : `${mappingMismatches} mapping mismatches`,
    ),
    check(
      "whyTargetDiffersFromReceiverZone matches selectedActionType",
      input.reportMarkdown.includes("Z4-HSL is the intended structure-advancement lane; HL receives from the adjacent support lane Z4-CL") &&
        !input.reportMarkdown.includes("Z4-HSL is the safe recycle cluster"),
      "coach report uses structure-advancement wording for Sequence 1 Action 2",
    ),
    check(
      "candidate/executed semantic mismatch count = 0",
      candidateMismatchCount === 0,
      `${candidateMismatchCount}`,
    ),
  ];
  const reportPath = join(input.reportDirectory, "target-semantics-generalization.md");

  writeFileSync(reportPath, renderMarkdown({ timeline: input.timeline, checks }), "utf8");

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
