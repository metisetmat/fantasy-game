import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type DecisionNarrativeStatus = "PASS" | "FAIL";

interface DecisionNarrativeCheck {
  readonly label: string;
  readonly status: DecisionNarrativeStatus;
  readonly detail: string;
}

export interface DecisionNarrativeUnificationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly DecisionNarrativeCheck[];
}

function check(label: string, passed: boolean, detail: string): DecisionNarrativeCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function sectionAfter(markdown: string, marker: string): string {
  const start = markdown.indexOf(marker);
  if (start < 0) {
    return "";
  }

  const next = markdown.indexOf("- timeline event:", start + marker.length);
  return next < 0 ? markdown.slice(start) : markdown.slice(start, next);
}

function renderMarkdown(checks: readonly DecisionNarrativeCheck[]): string {
  const status = checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Decision Narrative Unification",
    "",
    `Status: ${status}`,
    "",
    "## Checks",
    "",
    ...checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateDecisionNarrativeUnification(input: {
  readonly reportMarkdown: string;
  readonly debugReportMarkdown: string;
  readonly reportDirectory: string;
}): DecisionNarrativeUnificationResult {
  const workbench = readIfExists(join(input.reportDirectory, "workbench", "sequence-1-action-1.html"));
  const actionOneSection = sectionAfter(input.reportMarkdown, "- timeline event: [dt-s1-a1]");
  const actionTwoSection = sectionAfter(input.reportMarkdown, "- timeline event: [dt-s1-a2]");
  const compactCandidates = (input.reportMarkdown.match(/compact candidate:/g) ?? []).length;
  const rankedCandidateMentions = (input.reportMarkdown.match(/Ranked target candidates/g) ?? []).length;
  const checks: readonly DecisionNarrativeCheck[] = [
    check(
      "Decision Reasoning section exists in latest-mini-match.md",
      input.reportMarkdown.includes("### Decision Reasoning"),
      "coach report includes unified decision narrative",
    ),
    check(
      "raw top candidate displayed",
      input.reportMarkdown.includes("raw top candidate:"),
      "raw ranking is explicitly labelled as pre-selection evidence",
    ),
    check(
      "final executed action displayed",
      input.reportMarkdown.includes("final executed action:"),
      "final action is separated from raw ranking",
    ),
    check("selectedActionType displayed", input.reportMarkdown.includes("selectedActionType:"), "contract field visible"),
    check("targetType displayed", input.reportMarkdown.includes("targetType:"), "target semantic field visible"),
    check("actual reception zone displayed", input.reportMarkdown.includes("actual reception zone:"), "reception zone visible"),
    check(
      "Sequence 1 Action 1 no override is clear",
      actionOneSection.includes("override applied: NO") &&
        actionOneSection.includes("CONTROL chooses the safest first pressure-escape recycle"),
      "Action 1 summary says no override was required",
    ),
    check(
      "Sequence 1 Action 2 override is explained",
      actionTwoSection.includes("override applied: YES") &&
        actionTwoSection.includes("structured progression rule promoted the forward structure-advancement lane"),
      "Action 2 explains tactical override from raw ranking to final execution",
    ),
    check(
      "Sequence 1 Action 2 raw top lateral candidate does not look like final action",
      actionTwoSection.includes("raw top candidate: Z3-HSL -> Z3-C LATERAL") &&
        actionTwoSection.includes("final executed action: ML -> HL") &&
        actionTwoSection.includes("selectedActionType: FORWARD_PROGRESS"),
      "raw lateral candidate is distinct from final FORWARD_PROGRESS execution",
    ),
    check(
      "Sequence 1 Action 2 final executed action aligns with Action Semantic Contract",
      actionTwoSection.includes("final executed action: ML -> HL") &&
        actionTwoSection.includes("targetType: STRUCTURE_ADVANCEMENT_TARGET") &&
        actionTwoSection.includes("actual reception zone: Z4-CL"),
      "final action fields match semantic and ball-state contracts",
    ),
    check(
      "full old candidate table moved to debug or shortened in coach report",
      input.debugReportMarkdown.includes("### Candidate Ranking Debug") &&
        rankedCandidateMentions === 0 &&
        compactCandidates > 0,
      `coach Ranked target candidates mentions=${rankedCandidateMentions}; compact candidate mentions=${compactCandidates}`,
    ),
    check(
      "no contradiction between Candidate Ranking and Final Executed Action",
      !input.reportMarkdown.includes("### CONTROL Attacking Team Reasoning") &&
        actionTwoSection.includes("raw top candidate") &&
        actionTwoSection.includes("final executed action"),
      "legacy reasoning heading removed from coach report",
    ),
    check(
      "workbench includes compact Decision Reasoning",
      workbench.includes("Decision Reasoning") &&
        workbench.includes("raw top candidate") &&
        workbench.includes("final executed action"),
      "sequence-1-action-1 workbench includes compact decision reasoning",
    ),
  ];
  const reportPath = join(input.reportDirectory, "decision-narrative-unification.md");

  writeFileSync(reportPath, renderMarkdown(checks), "utf8");

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
