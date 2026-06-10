import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { DebugTimelineReplay } from "../../systems/debugTimeline";

type ActionIntentSemanticStatus = "PASS" | "FAIL";

interface ActionIntentSemanticCheck {
  readonly label: string;
  readonly status: ActionIntentSemanticStatus;
  readonly detail: string;
}

export interface ActionIntentSemanticContractValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly ActionIntentSemanticCheck[];
}

function check(label: string, passed: boolean, detail: string): ActionIntentSemanticCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function renderMarkdown(input: {
  readonly checks: readonly ActionIntentSemanticCheck[];
  readonly event: DebugTimelineReplay["events"][number] | undefined;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";
  const contract = input.event?.actorModel?.actionSemanticContract;

  return [
    "# Action / Intent Semantic Contract",
    "",
    `Status: ${status}`,
    "",
    "## Contract Definitions",
    "",
    "- decisionActor: player who makes and executes the action decision.",
    "- selectedReceiver: player selected to receive the action.",
    "- newCarrier: player carrying the ball after the action.",
    "- postActionPrimaryActor: player likely to become the next decision actor after the action.",
    "- selectedActionType: precise tactical action type, not the broad event family.",
    "- eventType: broad narrative event family.",
    "- intentRole: phase-qualified intent label such as DECISION_ACTOR_INTENT or RECEIVER_INTENT.",
    "",
    "## Sequence 1 Action 1",
    "",
    `- eventType: ${contract?.eventType ?? "missing"}`,
    `- selectedActionType: ${contract?.selectedActionType ?? "missing"}`,
    `- selectedActionSubtype: ${contract?.selectedActionSubtype ?? "missing"}`,
    `- decisionActor: CONTROL TH`,
    `- passer: CONTROL TH`,
    `- selectedReceiver: CONTROL ML`,
    `- receiver: CONTROL ML`,
    `- newCarrier: CONTROL ML`,
    `- postActionPrimaryActor: CONTROL ML`,
    `- decisionActorIntent: ${contract?.decisionActorIntent ?? input.event?.decisionActorIntent ?? "missing"}`,
    `- selectedReceiverIntent: ${contract?.selectedReceiverIntent ?? input.event?.selectedReceiverIntent ?? "missing"}`,
    `- semantic status: ${contract?.semanticStatus ?? "missing"}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateActionIntentSemanticContract(input: {
  readonly timeline: DebugTimelineReplay;
  readonly reportDirectory: string;
}): ActionIntentSemanticContractValidationResult {
  const reportPath = join(input.reportDirectory, "action-intent-semantic-contract.md");
  const coachReport = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const workbench = readIfExists(join(input.reportDirectory, "workbench", "sequence-1-action-1.html"));
  const event = input.timeline.events.find((candidate) => candidate.sequenceNumber === 1 && candidate.actionNumber === 1);
  const actorModel = event?.actorModel;
  const contract = actorModel?.actionSemanticContract;
  const combined = `${coachReport}\n${workbench}`;
  const checks: readonly ActionIntentSemanticCheck[] = [
    check(
      "decision actor equals passer",
      actorModel?.decisionActorId === actorModel?.passerId && actorModel?.decisionActorId === "control-tempo-half",
      `${actorModel?.decisionActorId ?? "missing"} / ${actorModel?.passerId ?? "missing"}`,
    ),
    check(
      "selectedReceiver equals receiver",
      actorModel?.selectedReceiverId === actorModel?.receiverId && actorModel?.receiverId === "control-mobile-lock",
      `${actorModel?.selectedReceiverId ?? "missing"} / ${actorModel?.receiverId ?? "missing"}`,
    ),
    check(
      "newCarrier equals selectedReceiver after successful recycle",
      actorModel?.newCarrierId === actorModel?.selectedReceiverId && actorModel?.newCarrierId === "control-mobile-lock",
      `${actorModel?.newCarrierId ?? "missing"} / ${actorModel?.selectedReceiverId ?? "missing"}`,
    ),
    check(
      "postActionPrimaryActor equals newCarrier",
      actorModel?.postActionPrimaryActorId === actorModel?.newCarrierId,
      `${actorModel?.postActionPrimaryActorId ?? "missing"} / ${actorModel?.newCarrierId ?? "missing"}`,
    ),
    check(
      "selectedActionType is not generic PROGRESSION for safe recycle",
      actorModel?.selectedActionType === "SUPPORT_CLUSTER_RECYCLE" && !coachReport.includes("selectedActionType: PROGRESSION"),
      `${actorModel?.selectedActionType ?? "missing"}`,
    ),
    check(
      "ML is not labelled primary actor without phase qualification",
      !coachReport.includes("primary actor: ML - RECOVER_STRUCTURE") &&
        coachReport.includes("post-action primary actor: CONTROL ML"),
      "coach report phase-qualifies ML as post-action primary actor",
    ),
    check(
      "Player Intent Trace distinguishes decision actor intent from receiver intent",
      coachReport.includes("decision actor intent:") && coachReport.includes("selected receiver intent:"),
      "intent trace uses phase-specific actor labels",
    ),
    check(
      "report exposes action semantic contract",
      coachReport.includes("### Action Semantic Contract") && workbench.includes("Action Semantic Contract"),
      "coach report and workbench include action semantic contract",
    ),
    check(
      "timeline exposes action semantic contract",
      contract?.selectedActionType === "SUPPORT_CLUSTER_RECYCLE" &&
        contract.selectedActionSubtype === "BALL_SIDE_PRESSURE_ESCAPE" &&
        actorModel?.actionSemanticStatus === "PASS",
      "debug timeline actorModel includes semantic fields and nested contract",
    ),
  ];

  writeFileSync(reportPath, renderMarkdown({ checks, event }), "utf8");

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
