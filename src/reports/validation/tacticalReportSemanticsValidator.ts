import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type SemanticsStatus = "PASS" | "FAIL";

interface SemanticsCheck {
  readonly label: string;
  readonly status: SemanticsStatus;
  readonly detail: string;
}

export interface TacticalReportSemanticsResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly SemanticsCheck[];
}

function check(label: string, passed: boolean, detail: string): SemanticsCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function renderMarkdown(input: { readonly checks: readonly SemanticsCheck[] }): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Tactical Report Semantics Cleanup",
    "",
    `Status: ${status}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
    "## Language Contract",
    "",
    "- selected target is never ambiguous",
    "- Reception Quality means the receiver can use the ball if reached",
    "- Lane State means the pass lane state now",
    "- Action Availability means whether the action can be played now",
    "- Strict Third-Man Status means the formal third-man progression result",
    "- Best follow-up role describes the next role without implying strict-third-man validity",
    "",
  ].join("\n");
}

function fileTextOrFallback(path: string, fallback: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : fallback;
}

export function validateTacticalReportSemantics(input: {
  readonly reportMarkdown: string;
  readonly debugReportMarkdown: string;
  readonly reportDirectory: string;
}): TacticalReportSemanticsResult {
  const workbenchPath = join(input.reportDirectory, "workbench", "sequence-1-action-1.html");
  const coachReportPath = join(input.reportDirectory, "tactical-evidence.latest.md");
  const debugReportPath = join(input.reportDirectory, "latest-debug-mini-match.md");
  const workbenchHtml = existsSync(workbenchPath) ? readFileSync(workbenchPath, "utf8") : "";
  const coachReportMarkdown = fileTextOrFallback(coachReportPath, input.reportMarkdown);
  const debugReportMarkdown = fileTextOrFallback(debugReportPath, input.debugReportMarkdown);
  const coachCombined = `${coachReportMarkdown}\n${workbenchHtml}`;
  const checks: readonly SemanticsCheck[] = [
    check(
      "selected target is never ambiguous",
      !/^Selected target:/m.test(coachReportMarkdown) && coachReportMarkdown.includes("### Decision Target"),
      "coach report uses Decision Target fields instead of standalone Selected target lines",
    ),
    check(
      "targetType exists for selected action",
      coachCombined.includes("targetType"),
      "targetType appears in coach report/workbench",
    ),
    check(
      "tacticalTargetZone and receiverResolvedZone are both shown if different",
      coachCombined.includes("tactical target cluster") && coachCombined.includes("receiver resolved zone"),
      "target cluster and resolved receiver zone are both visible",
    ),
    check(
      "Ball Transfer Result uses selectedReceiver/newCarrier consistently",
      coachReportMarkdown.includes("selectedReceiver") && coachReportMarkdown.includes("newCarrier") && !coachReportMarkdown.includes("receiver: TH at Z3-C"),
      "ball transfer uses selectedReceiver/newCarrier language",
    ),
    check(
      "Best continuation no longer appears in coach-facing report",
      !coachCombined.includes("Best continuation"),
      "renamed to Best follow-up role",
    ),
    check(
      "third-man continuation no longer appears unless strictThirdManStatus is VALID_THIRD_MAN_PROGRESSION",
      !coachCombined.includes("third-man continuation"),
      "coach-facing copy uses chain continuation value",
    ),
    check(
      "latest-mini-match.md contains no DEBUG_FULL lines",
      !coachReportMarkdown.includes("DEBUG_FULL"),
      "actual generated coach report contains no DEBUG_FULL lines",
    ),
    check(
      "latest-mini-match.md contains no legacy spatial source",
      !coachReportMarkdown.includes("legacy spatial source"),
      "actual generated coach report contains no legacy spatial source lines",
    ),
    check(
      "latest-mini-match.md contains no not coach-facing marker",
      !coachReportMarkdown.includes("not coach-facing"),
      "actual generated coach report contains no not-coach-facing labels",
    ),
    check(
      "latest-debug-mini-match.md contains DEBUG_FULL content",
      debugReportMarkdown.includes("DEBUG_FULL"),
      "debug report preserves raw labelled internals",
    ),
    check(
      "latest-debug-mini-match.md contains legacy spatial source debug content",
      debugReportMarkdown.includes("legacy spatial source"),
      "debug report preserves legacy spatial source internals when debug data exists",
    ),
    check(
      "workbench uses Best follow-up role instead of Best continuation",
      workbenchHtml.includes("Best follow-up role") && !workbenchHtml.includes("Best continuation"),
      "workbench terminology updated",
    ),
    check(
      "workbench has Decision Target section",
      workbenchHtml.includes("Decision Target"),
      "Decision Target panel rendered",
    ),
  ];
  const reportPath = join(input.reportDirectory, "tactical-report-semantics-cleanup.md");
  const valid = checks.every((item) => item.status === "PASS");

  writeFileSync(reportPath, renderMarkdown({ checks }), "utf8");

  return {
    valid,
    reportPath,
    checks,
  };
}
