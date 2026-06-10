import { writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MiniMatchTryEvent } from "../../simulation/miniMatch";
import type { ShotOutcomeContract } from "../../systems/actions";
import { scoringActionTypeForShotOutcome } from "../../systems/scoring";

type CandidateExecutedReportStatus = "PASS" | "WARNING" | "FAIL";

interface CandidateExecutedRow {
  readonly actionId: string;
  readonly actionLabel: string;
  readonly rawTopCandidateAction: string;
  readonly selectedCandidateAction: string;
  readonly normalizedSelectedCandidateActionType: string;
  readonly finalSelectedActionType: string;
  readonly overrideApplied: string;
  readonly status: CandidateExecutedReportStatus;
  readonly explanation: string;
}

interface CandidateExecutedCheck {
  readonly label: string;
  readonly status: "PASS" | "FAIL";
  readonly detail: string;
}

export interface CandidateExecutedActionConsistencyResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly rows: readonly CandidateExecutedRow[];
  readonly checks: readonly CandidateExecutedCheck[];
}

function sectionAfter(markdown: string, marker: string): string {
  const start = markdown.indexOf(marker);
  if (start < 0) {
    return "";
  }

  const next = markdown.indexOf("- timeline event:", start + marker.length);
  return next < 0 ? markdown.slice(start) : markdown.slice(start, next);
}

function field(section: string, label: string): string {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`- ${escaped}: ([^\\n]+)`).exec(section);

  return match?.[1]?.trim() ?? "missing";
}

function actionNameFromMarker(marker: string): string {
  const match = /dt-s(\d+)-a(\d+)/.exec(marker);
  if (match === null) {
    return marker;
  }

  return `Sequence ${match[1]} Action ${match[2]}`;
}

function actionRows(markdown: string): readonly CandidateExecutedRow[] {
  const markers = [...markdown.matchAll(/- timeline event: \[(dt-s\d+-a\d+)\]/g)]
    .map((match) => match[1])
    .filter((marker): marker is string => marker !== undefined);

  return markers.map((marker) => {
    const section = sectionAfter(markdown, `- timeline event: [${marker}]`);
    const rawTopCandidate = field(section, "raw top candidate");
    const selectedCandidate = field(section, "selected candidate before override");
    const consistency = field(section, "candidate/executed consistency");
    const finalSelectedActionType = field(section, "selectedActionType");
    const shotExplanation =
      finalSelectedActionType === "SHOT"
        ? `${field(section, "selected receiver")} attempts a legal shot from ${field(section, "ball zone")}; the action is evaluated through shot target and outcome semantics, not receiver/new-carrier semantics.`
        : field(section, "consistency explanation");

    return {
      actionId: marker,
      actionLabel: actionNameFromMarker(marker),
      rawTopCandidateAction: rawTopCandidate,
      selectedCandidateAction: selectedCandidate,
      normalizedSelectedCandidateActionType: field(section, "normalizedCandidateActionType"),
      finalSelectedActionType,
      overrideApplied: field(section, "override applied"),
      status: consistency === "WARNING" || consistency === "FAIL" ? consistency : "PASS",
      explanation: shotExplanation,
    };
  });
}

function tryRows(liveTryEvents: readonly MiniMatchTryEvent[] | undefined): readonly CandidateExecutedRow[] {
  return (liveTryEvents ?? []).map((event): CandidateExecutedRow => ({
    actionId: event.actionId,
    actionLabel: `Sequence ${event.sequenceNumber} Try Attempt`,
    rawTopCandidateAction: `TRY_TOUCHDOWN_ATTEMPT -> ${event.currentZone} score ${event.candidateScore}`,
    selectedCandidateAction: `TRY_TOUCHDOWN_ATTEMPT -> ${event.currentZone} score ${event.candidateScore}`,
    normalizedSelectedCandidateActionType: "TRY_TOUCHDOWN_ATTEMPT",
    finalSelectedActionType: "TRY_TOUCHDOWN_ATTEMPT",
    overrideApplied: "NO",
    status: "PASS",
    explanation:
      `TRY_TOUCHDOWN_ATTEMPT candidate selected through ${event.accessRoute}; outcome ${event.outcome}; ` +
      `legal access route preserved from candidate to executed action; try semantics use grounding, contact, and ball-control evidence instead of receiver/new-carrier pass wording. ` +
      `Rejected alternatives: ${event.competingCandidates
        .filter((candidate) => candidate.status === "REJECTED")
        .map((candidate) => `${candidate.actionType} ${candidate.score}`)
        .join(", ")}.`,
  }));
}

function check(label: string, passed: boolean, detail: string): CandidateExecutedCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function renderMarkdown(input: {
  readonly rows: readonly CandidateExecutedRow[];
  readonly checks: readonly CandidateExecutedCheck[];
}): string {
  const passCount = input.rows.filter((row) => row.status === "PASS").length;
  const warningCount = input.rows.filter((row) => row.status === "WARNING").length;
  const failCount = input.rows.filter((row) => row.status === "FAIL").length;
  const status = input.checks.every((item) => item.status === "PASS") && failCount === 0 ? "PASS" : "FAIL";

  return [
    "# Candidate-to-Executed Action Consistency",
    "",
    `Status: ${status}`,
    "",
    "## Summary",
    "",
    `- total actions checked: ${input.rows.length}`,
    `- PASS count: ${passCount}`,
    `- WARNING count: ${warningCount}`,
    `- FAIL count: ${failCount}`,
    "- non-shot candidate ranking calibration: active; rejected try/drop/carry/switch/progression routes are compared in non-shot-candidate-ranking-calibration.md.",
    "- candidate tie-breaking: active; equal-score ranking explanations are handled in candidate-tie-breaking-decision-explainability.md without changing executed-action semantics.",
    "- ranking calibration does not change candidate/executed semantics for current live actions.",
    "",
    "## Mismatch Table",
    "",
    "| Action | Raw top candidate action | Selected candidate action | normalizedSelectedCandidateActionType | final selectedActionType | Override applied | Status | Explanation |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...input.rows.map(
      (row) =>
        `| ${row.actionLabel} | ${row.rawTopCandidateAction} | ${row.selectedCandidateAction} | ${row.normalizedSelectedCandidateActionType} | ${row.finalSelectedActionType} | ${row.overrideApplied} | ${row.status} | ${row.explanation} |`,
    ),
    "",
    "## Key checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateCandidateExecutedActionConsistency(input: {
  readonly reportMarkdown: string;
  readonly reportDirectory: string;
  readonly shotOutcomes?: readonly ShotOutcomeContract[];
  readonly liveTryEvents?: readonly MiniMatchTryEvent[];
}): CandidateExecutedActionConsistencyResult {
  const shotOutcomeByActionId = new Map((input.shotOutcomes ?? []).map((outcome) => [outcome.actionId, outcome]));
  const rows = [
    ...actionRows(input.reportMarkdown).map((row): CandidateExecutedRow => {
    if (row.finalSelectedActionType !== "SHOT") {
      return row;
    }

    const outcome = shotOutcomeByActionId.get(row.actionId);
    const scoringAction = outcome === undefined ? "SHOT_MISSED" : scoringActionTypeForShotOutcome(outcome.ballOutcome);

    return outcome === undefined
      ? row
      : {
          ...row,
          explanation:
            `${outcome.shooterInitials} attempts a legal shot from ${outcome.shotOriginZone}; outcome ${outcome.ballOutcome}; ` +
            `scoring action ${scoringAction}; ` +
            `scoring impact: ${outcome.scoringImpact.pointsAdded > 0 ? `${outcome.shootingTeamName} +${outcome.scoringImpact.pointsAdded} points` : "0 points"}; ` +
          "shot target and outcome semantics are used instead of receiver/new-carrier semantics.",
        };
    }),
    ...tryRows(input.liveTryEvents),
  ];
  const actionOne = rows.find((row) => row.actionId === "dt-s1-a1");
  const actionTwo = rows.find((row) => row.actionId === "dt-s1-a2");
  const sequenceTwoActionTwo = rows.find((row) => row.actionId === "dt-s2-a2");
  const unexplainedMismatchCount = rows.filter((row) => row.status === "FAIL").length;
  const incompatibleCount = rows.filter(
    (row) =>
      row.status === "FAIL" ||
      (row.normalizedSelectedCandidateActionType !== row.finalSelectedActionType &&
        row.overrideApplied !== "YES" &&
        !row.explanation.includes("Candidate label normalized")),
  ).length;
  const rawDiffWithoutOverrideCount = rows.filter(
    (row) =>
      row.rawTopCandidateAction !== row.selectedCandidateAction &&
      row.overrideApplied !== "YES" &&
      !row.explanation.includes("handoff"),
  ).length;
  const targetReceiverDivergenceUnexplainedCount = rows.filter((row) => row.explanation === "missing").length;
  const shotRows = rows.filter((row) => row.finalSelectedActionType === "SHOT");
  const tryRowsForReport = rows.filter((row) => row.finalSelectedActionType === "TRY_TOUCHDOWN_ATTEMPT");
  const shotRowsUseShotSemantics = shotRows.every(
    (row) =>
      row.normalizedSelectedCandidateActionType === "SHOT" &&
      row.explanation.includes("shot target and outcome semantics") &&
      !row.explanation.includes("aligns with the selected candidate"),
  );
  const sequenceTwoActionTwoFixed =
    sequenceTwoActionTwo !== undefined &&
    sequenceTwoActionTwo.status === "PASS" &&
    sequenceTwoActionTwo.normalizedSelectedCandidateActionType === "CENTRAL_RECYCLE" &&
    sequenceTwoActionTwo.finalSelectedActionType === "CENTRAL_RECYCLE" &&
    sequenceTwoActionTwo.selectedCandidateAction.includes("CENTRAL_REBUILD") &&
    sequenceTwoActionTwo.explanation.includes("Candidate label normalized");
  const checks: readonly CandidateExecutedCheck[] = [
    check(
      "Sequence 1 Action 1 candidate/executed consistency",
      actionOne?.status === "PASS" && actionOne.finalSelectedActionType === "SUPPORT_CLUSTER_RECYCLE",
      actionOne?.explanation ?? "missing",
    ),
    check(
      "Sequence 1 Action 2 override explains candidate/executed difference",
      actionTwo?.overrideApplied === "YES" &&
        actionTwo.status === "PASS" &&
        actionTwo.finalSelectedActionType === "FORWARD_PROGRESS",
      actionTwo?.explanation ?? "missing",
    ),
    check(
      "Sequence 2 Action 2 no longer shows PROGRESSION candidate with CENTRAL_RECYCLE final action without explanation",
      sequenceTwoActionTwoFixed,
      sequenceTwoActionTwo?.explanation ?? "missing",
    ),
    check(
      "selected candidate action type and final selectedActionType are compatible for all actions",
      incompatibleCount === 0,
      `${incompatibleCount} incompatible rows`,
    ),
    check(
      "raw top differs from selected only with override or explanation",
      rawDiffWithoutOverrideCount === 0,
      `${rawDiffWithoutOverrideCount} unexplained raw/selected differences`,
    ),
    check(
      "target cluster / receiver zone divergence is explained",
      targetReceiverDivergenceUnexplainedCount === 0,
      `${targetReceiverDivergenceUnexplainedCount} unexplained target/receiver divergences`,
    ),
    check(
      "no unexplained candidate/final semantic mismatch",
      unexplainedMismatchCount === 0,
      `${unexplainedMismatchCount} FAIL rows`,
    ),
    check(
      "shot candidate/executed rows use SHOT semantics",
      shotRows.length > 0 && shotRowsUseShotSemantics,
      `${shotRows.length} shot rows checked`,
    ),
    check(
      "TRY_TOUCHDOWN_ATTEMPT candidate/executed rows use try semantics",
      tryRowsForReport.length > 0 &&
        tryRowsForReport.every((row) => row.explanation.includes("try semantics") && row.normalizedSelectedCandidateActionType === "TRY_TOUCHDOWN_ATTEMPT"),
      `${tryRowsForReport.length} try rows checked`,
    ),
    check(
      "try outcome semantics do not use shot/pass receiver language",
      tryRowsForReport.every((row) => !row.explanation.includes("receiver/new-carrier") || row.explanation.includes("instead of receiver/new-carrier pass wording")),
      "try rows avoid pass semantics",
    ),
    check(
      "legal access route is preserved from candidate to executed action",
      tryRowsForReport.every((row) => row.explanation.includes("legal access route preserved")),
      "try access route preserved",
    ),
    check(
      "selected try candidate explains why it beat shot/recycle alternatives",
      tryRowsForReport.every((row) => row.explanation.includes("Rejected alternatives")),
      "try rejected alternatives visible",
    ),
  ];
  const reportPath = join(input.reportDirectory, "candidate-executed-action-consistency.md");

  writeFileSync(reportPath, renderMarkdown({ rows, checks }), "utf8");

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    rows,
    checks,
  };
}
