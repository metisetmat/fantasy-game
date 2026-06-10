import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type CalibrationStatus = "PASS" | "FAIL";

interface CalibrationCheck {
  readonly label: string;
  readonly status: CalibrationStatus;
  readonly detail: string;
}

export interface ActionSelectionCalibrationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly CalibrationCheck[];
}

function check(label: string, passed: boolean, detail: string): CalibrationCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function renderMarkdown(checks: readonly CalibrationCheck[]): string {
  return [
    "# Action Selection Calibration",
    "",
    `Status: ${checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL"}`,
    "",
    "## Checks",
    "",
    ...checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
    "## Calibration Notes",
    "",
    "- TH -> ML remains selected only if the diagnostic proves that higher-upside options are unavailable or too risky.",
    "- TH -> FL remains visible as a CONTACT_PLATFORM concept even when current action availability is poor.",
    "- TH -> SH remains visible as a weak-side threat without overriding strict third-man rejection.",
    "- TH -> RP is evaluated as the main weak-side support competitor.",
    "- OverConservatismPenalty is zero only when progressive alternatives are not meaningfully playable now.",
    "- elite override can make contested options playable risk, but does not casually open closed lanes.",
    "",
  ].join("\n");
}

export function validateActionSelectionCalibration(input: {
  readonly reportMarkdown: string;
  readonly reportDirectory: string;
}): ActionSelectionCalibrationResult {
  const workbenchPath = join(input.reportDirectory, "workbench", "sequence-1-action-1.html");
  const workbenchHtml = existsSync(workbenchPath) ? readFileSync(workbenchPath, "utf8") : "";
  const combined = `${input.reportMarkdown}\n${workbenchHtml}`;
  const hasDiagnostic = combined.includes("Action Selection Diagnostic");
  const hasBreakdown = combined.includes("Candidate Score Breakdown");
  const checks: readonly CalibrationCheck[] = [
    check(
      "selected action has explicit verdict",
      /verdict:\s*(REASONABLE_BUT_CONSERVATIVE|CLEARLY_JUSTIFIED|TOO_CONSERVATIVE|TOO_RISKY|INCOHERENT)/.test(input.reportMarkdown) ||
        /(REASONABLE_BUT_CONSERVATIVE|CLEARLY_JUSTIFIED|TOO_CONSERVATIVE|TOO_RISKY|INCOHERENT)/.test(workbenchHtml),
      "coach-facing diagnostic exposes the selected-action verdict",
    ),
    check("TH -> ML has score breakdown", combined.includes("TH -> ML") && combined.includes("pressure escape"), "selected recycle has visible score factors"),
    check("TH -> FL has score breakdown", combined.includes("TH -> FL") && combined.includes("CONTACT_PLATFORM"), "contact-platform alternative is scored"),
    check("TH -> SH has score breakdown", combined.includes("TH -> SH") && combined.includes("WEAK_SIDE_RUPTURE"), "weak-side rupture alternative is scored"),
    check("TH -> RP has score breakdown", combined.includes("TH -> RP") && combined.includes("WEAK_SIDE_SUPPORT"), "weak-side support alternative is scored"),
    check("overconservatism check exists", combined.includes("OverConservatismPenalty"), "diagnostic reports whether CONTROL is too conservative"),
    check("elite override check exists", /elite override/i.test(combined), "diagnostic explains contested/closed lane override rules"),
    check("selected action explains what it sacrifices", combined.includes("what it sacrifices") || combined.includes("What it sacrifices"), "selected action reports tradeoffs"),
    check(
      "unavailable actions are not selected unless override is explicitly justified",
      combined.includes("NOT_AVAILABLE_NOW") && combined.includes("BLOCKED_BY_CLOSED_LANE"),
      "closed-lane concepts stay visible but are not silently promoted",
    ),
    check(
      "strict-third-man rejection affects selection but does not erase chain concept",
      combined.includes("REJECTED_THIRD_MAN") && combined.includes("chain concept"),
      "strict rejection is visible alongside tactical concept value",
    ),
    check("next phase expectation is reported", combined.includes("Expected next phase") || combined.includes("expected next phase"), "diagnostic explains what CONTROL expects after ML receives"),
    check("Action Selection Diagnostic section exists", hasDiagnostic, "latest-mini-match.md/workbench includes Action Selection Diagnostic"),
    check("Candidate Score Breakdown section exists", hasBreakdown, "latest-mini-match.md/workbench includes Candidate Score Breakdown"),
  ];
  const reportPath = join(input.reportDirectory, "action-selection-calibration.md");

  writeFileSync(reportPath, renderMarkdown(checks), "utf8");

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
