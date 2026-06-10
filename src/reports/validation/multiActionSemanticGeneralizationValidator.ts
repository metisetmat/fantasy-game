import { writeFileSync } from "node:fs";
import { join } from "node:path";
import type { DebugTimelineEvent, DebugTimelineReplay } from "../../systems/debugTimeline";

type MultiActionSemanticStatus = "PASS" | "FAIL";

interface MultiActionSemanticCheck {
  readonly label: string;
  readonly status: MultiActionSemanticStatus;
  readonly detail: string;
}

export interface MultiActionSemanticGeneralizationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly MultiActionSemanticCheck[];
}

function check(label: string, passed: boolean, detail: string): MultiActionSemanticCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function countBy(values: readonly string[]): readonly [string, number][] {
  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
}

function actionLabel(event: DebugTimelineEvent | undefined): string {
  if (event?.actorModel === null || event?.actorModel === undefined) {
    return "missing";
  }

  return `${event.actorModel.primaryActorInitials} -> ${event.actorModel.receiverInitials ?? event.actorModel.primaryActorInitials}`;
}

function renderDistribution(title: string, rows: readonly [string, number][]): readonly string[] {
  return [
    `#### ${title}`,
    "",
    "| Value | Count |",
    "| --- | --- |",
    ...rows.map(([value, count]) => `| ${value} | ${count} |`),
    "",
  ];
}

function renderMarkdown(input: {
  readonly timeline: DebugTimelineReplay;
  readonly checks: readonly MultiActionSemanticCheck[];
  readonly candidateMismatchCount: number;
}): string {
  const events = input.timeline.events;
  const semanticEvents = events.filter((event) => event.actorModel?.actionSemanticContract !== undefined);
  const failures = input.checks.filter((item) => item.status === "FAIL").length;
  const status = failures === 0 ? "PASS" : "FAIL";
  const actionOne = events.find((event) => event.sequenceNumber === 1 && event.actionNumber === 1);
  const actionTwo = events.find((event) => event.sequenceNumber === 1 && event.actionNumber === 2);
  const actionOneContract = actionOne?.actorModel?.actionSemanticContract;
  const actionTwoContract = actionTwo?.actorModel?.actionSemanticContract;

  return [
    "# Multi-Action Semantic Generalization",
    "",
    `Status: ${status}`,
    "",
    "## Summary",
    "",
    `- total actions checked: ${events.length}`,
    `- semantic contracts generated: ${semanticEvents.length}`,
    `- failures: ${failures}`,
    "- warnings: 0",
    `- candidate/executed semantic mismatch count = ${input.candidateMismatchCount}`,
    "",
    "## Action Type Distribution",
    "",
    ...renderDistribution("eventType", countBy(events.map((event) => event.eventType))),
    ...renderDistribution(
      "selectedActionType",
      countBy(semanticEvents.map((event) => event.actorModel?.actionSemanticContract?.selectedActionType ?? "missing")),
    ),
    ...renderDistribution(
      "selectedActionSubtype",
      countBy(semanticEvents.map((event) => event.actorModel?.actionSemanticContract?.selectedActionSubtype ?? "none")),
    ),
    "## Sequence 1 Action 1",
    "",
    `- previous carrier: CONTROL TH`,
    `- selected receiver: CONTROL ML`,
    `- new carrier: CONTROL ML`,
    `- eventType: ${actionOneContract?.eventType ?? "missing"}`,
    `- selectedActionType: ${actionOneContract?.selectedActionType ?? "missing"}`,
    `- selectedActionSubtype: ${actionOneContract?.selectedActionSubtype ?? "missing"}`,
    `- reason: ${actionOneContract?.reason ?? "missing"}`,
    `- status: ${actionOneContract?.semanticStatus ?? "missing"}`,
    "",
    "## Sequence 1 Action 2",
    "",
    `- previous carrier: CONTROL ML`,
    `- selected receiver: CONTROL HL`,
    `- new carrier: CONTROL HL`,
    `- eventType: ${actionTwoContract?.eventType ?? actionTwo?.eventType ?? "missing"}`,
    `- selectedActionType: ${actionTwoContract?.selectedActionType ?? "missing"}`,
    `- selectedActionSubtype: ${actionTwoContract?.selectedActionSubtype ?? "missing"}`,
    `- action: ${actionLabel(actionTwo)}`,
    `- reason: ${actionTwoContract?.reason ?? "missing"}`,
    `- status: ${actionTwoContract?.semanticStatus ?? "missing"}`,
    "",
    "## Default Leakage Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateMultiActionSemanticGeneralization(input: {
  readonly timeline: DebugTimelineReplay;
  readonly reportMarkdown: string;
  readonly reportDirectory: string;
}): MultiActionSemanticGeneralizationResult {
  const semanticEvents = input.timeline.events.filter((event) => event.actorModel?.actionSemanticContract !== undefined);
  const actionTypes = semanticEvents.map((event) => event.actorModel?.actionSemanticContract?.selectedActionType ?? "missing");
  const subtypes = semanticEvents.map((event) => event.actorModel?.actionSemanticContract?.selectedActionSubtype ?? "none");
  const uniqueActionTypes = new Set(actionTypes);
  const ballSidePressureCount = subtypes.filter((subtype) => subtype === "BALL_SIDE_PRESSURE_ESCAPE").length;
  const eventTypeMismatchCount = semanticEvents.filter(
    (event) => event.actorModel?.actionSemanticContract?.eventType !== event.eventType,
  ).length;
  const actionOne = input.timeline.events.find((event) => event.sequenceNumber === 1 && event.actionNumber === 1);
  const actionTwo = input.timeline.events.find((event) => event.sequenceNumber === 1 && event.actionNumber === 2);
  const actionOneContract = actionOne?.actorModel?.actionSemanticContract;
  const actionTwoContract = actionTwo?.actorModel?.actionSemanticContract;
  const receiverMismatchCount = semanticEvents.filter((event) => {
    const contract = event.actorModel?.actionSemanticContract;

    return contract?.selectedReceiverId !== undefined && contract.newCarrierId !== contract.selectedReceiverId;
  }).length;
  const passerMismatchCount = semanticEvents.filter((event) => {
    const contract = event.actorModel?.actionSemanticContract;

    return contract?.passerId !== undefined && contract.decisionActorId !== contract.passerId;
  }).length;
  const candidateMismatchCount =
    (input.reportMarkdown.match(/candidate\/executed consistency: FAIL/g) ?? []).length;
  const checks: readonly MultiActionSemanticCheck[] = [
    check(
      "semantic contracts generated for every action",
      semanticEvents.length === input.timeline.events.length,
      `${semanticEvents.length}/${input.timeline.events.length}`,
    ),
    check(
      "not all actions have same selectedActionType",
      uniqueActionTypes.size > 1,
      `${uniqueActionTypes.size} unique action types`,
    ),
    check(
      "BALL_SIDE_PRESSURE_ESCAPE not applied globally",
      ballSidePressureCount < semanticEvents.length,
      `${ballSidePressureCount}/${semanticEvents.length}`,
    ),
    check("eventType matches actual event context", eventTypeMismatchCount === 0, `${eventTypeMismatchCount} mismatches`),
    check(
      "no dt-s1-a1 semantic leakage",
      actionOneContract?.selectedActionType === "SUPPORT_CLUSTER_RECYCLE" &&
        actionTwoContract?.selectedActionType !== "SUPPORT_CLUSTER_RECYCLE" &&
        actionTwoContract?.selectedActionSubtype !== "BALL_SIDE_PRESSURE_ESCAPE",
      `s1a1 ${actionOneContract?.selectedActionType ?? "missing"}; s1a2 ${actionTwoContract?.selectedActionType ?? "missing"}/${actionTwoContract?.selectedActionSubtype ?? "missing"}`,
    ),
    check("all pass/recycle decision actors equal passers", passerMismatchCount === 0, `${passerMismatchCount}`),
    check(
      "all successful pass/recycle new carriers equal selected receivers",
      receiverMismatchCount === 0,
      `${receiverMismatchCount}`,
    ),
    check(
      "candidate/executed semantic mismatch count = 0",
      candidateMismatchCount === 0,
      `${candidateMismatchCount}`,
    ),
  ];
  const reportPath = join(input.reportDirectory, "multi-action-semantic-generalization.md");

  writeFileSync(reportPath, renderMarkdown({ timeline: input.timeline, checks, candidateMismatchCount }), "utf8");

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
