import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type CoachSummaryDataBindingStatus = "PASS" | "FAIL";

interface CoachSummaryDataBindingCheck {
  readonly label: string;
  readonly status: CoachSummaryDataBindingStatus;
  readonly detail: string;
}

export interface CoachSummaryDataBindingResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly CoachSummaryDataBindingCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function countToken(markdown: string, token: string): number {
  return (markdown.match(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length;
}

function placeholderCount(markdown: string): number {
  return ["unknown", "undefined", "null", "NaN", "[object Object]"].reduce(
    (total, token) => total + countToken(markdown, token),
    0,
  );
}

function lineCount(markdown: string): number {
  return markdown.length === 0 ? 0 : markdown.split("\n").length;
}

function check(label: string, passed: boolean, detail: string): CoachSummaryDataBindingCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function renderMarkdown(input: {
  readonly checks: readonly CoachSummaryDataBindingCheck[];
  readonly coachLineCount: number;
  readonly unknownPlaceholderCount: number;
  readonly missingDataMarkerCount: number;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Coach Summary Data Binding",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- coach summary line count: ${input.coachLineCount}`,
    `- unknown placeholder count: ${input.unknownPlaceholderCount}`,
    `- missing data marker count: ${input.missingDataMarkerCount}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateCoachSummaryDataBinding(input: { readonly reportDirectory: string }): CoachSummaryDataBindingResult {
  const coachPath = join(input.reportDirectory, "coach-summary.latest.md");
  const latestPath = join(input.reportDirectory, "latest-mini-match.md");
  const coach = readIfExists(coachPath);
  const latest = readIfExists(latestPath);
  const coachLineCount = lineCount(coach);
  const unknownCount = placeholderCount(`${coach}\n${latest}`);
  const missingDataMarkerCount = countToken(`${coach}\n${latest}`, "MISSING_DATA");
  const checks: readonly CoachSummaryDataBindingCheck[] = [
    check("coach-summary.latest.md exists", coach.length > 0, coachPath),
    check("latest-mini-match.md exists", latest.length > 0, latestPath),
    check("Sequence 1 Action 1 title is TH -> ML", coach.includes("### Sequence 1 Action 1 - TH -> ML"), "Action 1 title"),
    check("Sequence 1 Action 1 selected action is TH -> ML", coach.includes("- selected action: TH -> ML"), "Action 1 selected action"),
    check(
      "Sequence 1 Action 1 selectedActionType is SUPPORT_CLUSTER_RECYCLE",
      coach.includes("CONTROL selects TH -> ML as SUPPORT_CLUSTER_RECYCLE"),
      "Action 1 selectedActionType",
    ),
    check(
      "Sequence 1 Action 1 why selected is populated",
      coach.includes("ML gives the cleanest pressure-escape outlet, with reception in Z3-HSL."),
      "Action 1 why selected",
    ),
    check(
      "Sequence 1 Action 1 candidate/executed consistency is PASS",
      coach.includes("- candidate/executed consistency: PASS"),
      "Action 1 consistency",
    ),
    check("Sequence 1 Action 2 title is ML -> HL", coach.includes("### Sequence 1 Action 2 - ML -> HL"), "Action 2 title"),
    check("Sequence 1 Action 2 selected action is ML -> HL", coach.includes("- selected action: ML -> HL"), "Action 2 selected action"),
    check(
      "Sequence 1 Action 2 selectedActionType is FORWARD_PROGRESS",
      coach.includes("CONTROL selects ML -> HL as FORWARD_PROGRESS"),
      "Action 2 selectedActionType",
    ),
    check(
      "Sequence 1 Action 2 why selected is populated",
      coach.includes("HL is available as the next support line, so Z4-HSL becomes a structure-advancement target and the ball is received in Z4-CL."),
      "Action 2 why selected",
    ),
    check(
      "Sequence 1 Action 2 candidate/executed consistency is PASS",
      (coach.match(/candidate\/executed consistency: PASS/g) ?? []).length >= 2,
      "Action 2 consistency",
    ),
    check("coach summary contains no unknown placeholder", placeholderCount(coach) === 0, `${placeholderCount(coach)}`),
    check("coach summary contains no undefined placeholder", !coach.includes("undefined"), "undefined absent"),
    check("latest-mini-match contains no unknown placeholder", placeholderCount(latest) === 0, `${placeholderCount(latest)}`),
    check("latest-mini-match contains no undefined placeholder", !latest.includes("undefined"), "undefined absent"),
    check("coach summary has no missing data markers", missingDataMarkerCount === 0, `${missingDataMarkerCount}`),
    check("coach summary still below 120 lines", coachLineCount < 120, `${coachLineCount}`),
    check(
      "coach summary links to tactical evidence, debug full, and workbench",
      coach.includes("tactical-evidence.latest.md") &&
        coach.includes("debug-full.latest.md") &&
        coach.includes("workbench/sequence-1-action-1.html"),
      "links present",
    ),
  ];
  const reportPath = join(input.reportDirectory, "validation.coach-summary-data-binding.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      coachLineCount,
      unknownPlaceholderCount: unknownCount,
      missingDataMarkerCount,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
