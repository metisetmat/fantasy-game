import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  generateActionSemanticReason,
  validateActionSemanticReasonConsistency,
} from "../../systems/actions";
import type { DebugTimelineEvent, DebugTimelineReplay } from "../../systems/debugTimeline";

type SemanticReasonStatus = "PASS" | "FAIL";

interface SemanticReasonCheck {
  readonly label: string;
  readonly status: SemanticReasonStatus;
  readonly detail: string;
}

export interface SemanticReasonConsistencyResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly SemanticReasonCheck[];
}

function check(label: string, passed: boolean, detail: string): SemanticReasonCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function action(event: DebugTimelineEvent | undefined): string {
  if (event?.actorModel === null || event?.actorModel === undefined) {
    return "missing";
  }

  return `${event.actorModel.primaryActorInitials} -> ${event.actorModel.receiverInitials ?? event.actorModel.primaryActorInitials}`;
}

function expectedReason(event: DebugTimelineEvent): string | null {
  const contract = event.actorModel?.actionSemanticContract;
  if (contract === undefined || event.actorModel === null) {
    return null;
  }

  return generateActionSemanticReason({
    eventType: contract.eventType,
    selectedActionType: contract.selectedActionType,
    selectedActionSubtype: contract.selectedActionSubtype,
    decisionActorLabel: event.actorModel.primaryActorInitials,
    receiverLabel: event.actorModel.receiverInitials ?? undefined,
  });
}

function renderMarkdown(input: {
  readonly timeline: DebugTimelineReplay;
  readonly checks: readonly SemanticReasonCheck[];
}): string {
  const failures = input.checks.filter((item) => item.status === "FAIL").length;
  const status = failures === 0 ? "PASS" : "FAIL";
  const actionOne = input.timeline.events.find((event) => event.sequenceNumber === 1 && event.actionNumber === 1);
  const actionTwo = input.timeline.events.find((event) => event.sequenceNumber === 1 && event.actionNumber === 2);
  const actionOneContract = actionOne?.actorModel?.actionSemanticContract;
  const actionTwoContract = actionTwo?.actorModel?.actionSemanticContract;

  return [
    "# Semantic Reason Consistency",
    "",
    `Status: ${status}`,
    "",
    "## Sequence 1 Action 1",
    "",
    `- action: ${action(actionOne)}`,
    `- selectedActionType: ${actionOneContract?.selectedActionType ?? "missing"}`,
    `- selectedActionSubtype: ${actionOneContract?.selectedActionSubtype ?? "missing"}`,
    `- reason: ${actionOneContract?.reason ?? "missing"}`,
    "",
    "## Sequence 1 Action 2",
    "",
    `- action: ${action(actionTwo)}`,
    `- selectedActionType: ${actionTwoContract?.selectedActionType ?? "missing"}`,
    `- selectedActionSubtype: ${actionTwoContract?.selectedActionSubtype ?? "missing"}`,
    `- reason: ${actionTwoContract?.reason ?? "missing"}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateSemanticReasonConsistency(input: {
  readonly timeline: DebugTimelineReplay;
  readonly reportMarkdown: string;
  readonly reportDirectory: string;
}): SemanticReasonConsistencyResult {
  const semanticEvents = input.timeline.events.filter((event) => event.actorModel?.actionSemanticContract !== undefined);
  const actionOne = input.timeline.events.find((event) => event.sequenceNumber === 1 && event.actionNumber === 1);
  const actionTwo = input.timeline.events.find((event) => event.sequenceNumber === 1 && event.actionNumber === 2);
  const actionOneReason = actionOne?.actorModel?.actionSemanticContract?.reason ?? "";
  const actionTwoReason = actionTwo?.actorModel?.actionSemanticContract?.reason ?? "";
  const forbiddenFailures = semanticEvents
    .map((event) => {
      const contract = event.actorModel?.actionSemanticContract;
      if (contract === undefined) {
        return null;
      }

      const validation = validateActionSemanticReasonConsistency({
        selectedActionType: contract.selectedActionType,
        reason: contract.reason,
      });

      return validation.valid
        ? null
        : `${event.id}: ${contract.selectedActionType} contains ${validation.forbiddenTerms.join(", ")}`;
    })
    .filter((failure): failure is string => failure !== null);
  const generationMismatchCount = semanticEvents.filter((event) => {
    const contract = event.actorModel?.actionSemanticContract;
    const generated = expectedReason(event);

    return contract === undefined || generated === null || contract.reason !== generated;
  }).length;
  const staleTemplateLeakCount = semanticEvents.filter((event) => {
    const contract = event.actorModel?.actionSemanticContract;
    if (contract === undefined || event.sequenceNumber === 1 && event.actionNumber === 1) {
      return false;
    }

    return contract.selectedActionType !== "SUPPORT_CLUSTER_RECYCLE" &&
      contract.reason.toLowerCase().includes("pressure-escape recycle");
  }).length;
  const checks: readonly SemanticReasonCheck[] = [
    check(
      "Sequence 1 Action 1 reason matches SUPPORT_CLUSTER_RECYCLE",
      actionOne?.actorModel?.actionSemanticContract?.selectedActionType === "SUPPORT_CLUSTER_RECYCLE" &&
        actionOneReason.includes("pressure-escape recycle") &&
        actionOneReason.includes("support cluster"),
      actionOneReason,
    ),
    check(
      "Sequence 1 Action 2 reason matches FORWARD_PROGRESS",
      actionTwo?.actorModel?.actionSemanticContract?.selectedActionType === "FORWARD_PROGRESS" &&
        actionTwoReason.includes("advances the attacking structure") &&
        actionTwoReason.includes("next support line"),
      actionTwoReason,
    ),
    check(
      "FORWARD_PROGRESS reason does not mention pressure-escape recycle",
      !actionTwoReason.toLowerCase().includes("pressure-escape recycle"),
      actionTwoReason,
    ),
    check(
      "no selectedActionType has forbidden reason terms",
      forbiddenFailures.length === 0,
      forbiddenFailures.length === 0 ? "0 forbidden term failures" : forbiddenFailures.join(" | "),
    ),
    check(
      "all action semantic reasons generated from selectedActionType/subtype",
      generationMismatchCount === 0,
      `${generationMismatchCount} generated reason mismatches`,
    ),
    check(
      "no stale dt-s1-a1 reason template leaked into other actions",
      staleTemplateLeakCount === 0 && !input.reportMarkdown.includes("ML plays the pressure-escape recycle"),
      `${staleTemplateLeakCount} stale non-recycle reason leaks`,
    ),
  ];
  const reportPath = join(input.reportDirectory, "semantic-reason-consistency.md");

  writeFileSync(reportPath, renderMarkdown({ timeline: input.timeline, checks }), "utf8");

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
