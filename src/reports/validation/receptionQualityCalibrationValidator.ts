import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type CalibrationStatus = "PASS" | "FAIL";

interface CalibrationCheck {
  readonly label: string;
  readonly status: CalibrationStatus;
  readonly detail: string;
}

export interface ReceptionQualityCalibrationResult {
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

function lineContaining(text: string, tokens: readonly string[]): string {
  return text.split("\n").find((line) => tokens.every((token) => line.includes(token))) ?? "";
}

function renderMarkdown(input: { readonly checks: readonly CalibrationCheck[] }): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Reception Quality Calibration",
    "",
    `Status: ${status}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
    "## Calibration Principle",
    "",
    "- closed lane does not automatically force NEGATIVE receiver quality",
    "- lane state, action availability, and strict-third-man validity are separate from reception quality",
    "- TH -> FL -> SH can remain a tactical concept while strict-third-man validation rejects it",
    "",
  ].join("\n");
}

export function validateReceptionQualityCalibration(input: {
  readonly reportMarkdown: string;
  readonly reportDirectory: string;
}): ReceptionQualityCalibrationResult {
  const workbenchPath = join(input.reportDirectory, "workbench", "sequence-1-action-1.html");
  const workbenchHtml = existsSync(workbenchPath) ? readFileSync(workbenchPath, "utf8") : "";
  const combined = `${input.reportMarkdown}\n${workbenchHtml}`;
  const flLine = lineContaining(input.reportMarkdown, ["| FL |", "Z5-HSL"]);
  const shLine = lineContaining(input.reportMarkdown, ["| SH |", "Z5-HSR"]);
  const flChainLine = lineContaining(input.reportMarkdown, ["TH -> FL -> SH", "REJECTED_THIRD_MAN"]);
  const checks: readonly CalibrationCheck[] = [
    check(
      "closed lane does not automatically force NEGATIVE receiver quality",
      flLine.includes("NEUTRAL") && shLine.includes("NEUTRAL"),
      `FL: ${flLine || "missing"} / SH: ${shLine || "missing"}`,
    ),
    check(
      "FL@Z5-HSL is not TRAPPED unless direct receiver pressure justifies it",
      flLine.includes("CONTACT_PLATFORM") && !flLine.includes("TRAPPED"),
      flLine || "FL row missing",
    ),
    check(
      "SH@Z5-HSR is not TRAPPED unless direct receiver pressure justifies it",
      shLine.includes("THIRD_MAN_SET") && !shLine.includes("TRAPPED"),
      shLine || "SH row missing",
    ),
    check(
      "Reception Quality table separates lane state from reception quality",
      input.reportMarkdown.includes("Lane State To Receiver") && input.reportMarkdown.includes("Action Availability"),
      "latest-mini-match.md exposes lane state and action availability columns",
    ),
    check(
      "TH -> FL -> SH remains strict-third-man rejected if conditions fail",
      flChainLine.includes("REJECTED_THIRD_MAN"),
      flChainLine || "TH -> FL -> SH rejected row missing",
    ),
    check(
      "TH -> FL -> SH still remains visible as tactical concept if chain generation finds it",
      input.reportMarkdown.includes("TH -> FL -> SH") && input.reportMarkdown.includes("chain continuation"),
      "chain remains visible without implying strict validity",
    ),
    check(
      "workbench shows lane state and strict-third-man status separately",
      workbenchHtml.includes("Lane State To Receiver") && workbenchHtml.includes("Strict Third-Man Logic"),
      "workbench separates reception, lane, and strict-third-man panels",
    ),
    check(
      "strictThirdManStatus remains displayed",
      combined.includes("strictThirdManStatus") || workbenchHtml.includes("Strict Third-Man Logic"),
      "strict third-man status is still visible",
    ),
  ];
  const reportPath = join(input.reportDirectory, "reception-quality-calibration.md");
  const valid = checks.every((item) => item.status === "PASS");

  writeFileSync(reportPath, renderMarkdown({ checks }), "utf8");

  return {
    valid,
    reportPath,
    checks,
  };
}
