import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type ContractStatus = "PASS" | "FAIL";

interface ContractCheck {
  readonly label: string;
  readonly status: ContractStatus;
  readonly detail: string;
}

export interface ValidationContractCleanupResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly ContractCheck[];
}

function readReport(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function countToken(text: string, token: string): number {
  if (token.length === 0) {
    return 0;
  }

  return text.split(token).length - 1;
}

function check(label: string, passed: boolean, detail: string): ContractCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function renderMarkdown(input: {
  readonly checks: readonly ContractCheck[];
  readonly paths: {
    readonly coachReportPath: string;
    readonly debugReportPath: string;
  };
  readonly counts: {
    readonly coachDebugFull: number;
    readonly coachLegacy: number;
    readonly coachNotCoachFacing: number;
    readonly debugDebugFull: number;
    readonly debugLegacy: number;
  };
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Validation Contract Cleanup",
    "",
    `Status: ${status}`,
    "",
    "## Report Mode Contract",
    "",
    `- COACH_REPORT path: ${input.paths.coachReportPath}`,
    `- DEBUG_REPORT path: ${input.paths.debugReportPath}`,
    "- coach forbidden tokens: DEBUG_FULL, legacy spatial source, not coach-facing",
    "- debug expected tokens: DEBUG_FULL, legacy spatial source",
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
    "## Counts",
    "",
    `- coach report DEBUG_FULL count = ${input.counts.coachDebugFull}`,
    `- coach report legacy spatial source count = ${input.counts.coachLegacy}`,
    `- coach report not-coach-facing count = ${input.counts.coachNotCoachFacing}`,
    `- debug report DEBUG_FULL count = ${input.counts.debugDebugFull}`,
    `- debug report legacy spatial source count = ${input.counts.debugLegacy}`,
    "",
  ].join("\n");
}

export function validateValidationContractCleanup(input: {
  readonly reportDirectory: string;
}): ValidationContractCleanupResult {
  const coachReportPath = join(input.reportDirectory, "latest-mini-match.md");
  const debugReportPath = join(input.reportDirectory, "latest-debug-mini-match.md");
  const occupationQualityPath = join(input.reportDirectory, "occupation-quality-evaluation.md");
  const tacticalSemanticsPath = join(input.reportDirectory, "tactical-report-semantics-cleanup.md");
  const coachReport = readReport(coachReportPath);
  const debugReport = readReport(debugReportPath);
  const occupationQuality = readReport(occupationQualityPath);
  const tacticalSemantics = readReport(tacticalSemanticsPath);
  const counts = {
    coachDebugFull: countToken(coachReport, "DEBUG_FULL"),
    coachLegacy: countToken(coachReport, "legacy spatial source"),
    coachNotCoachFacing: countToken(coachReport, "not coach-facing"),
    debugDebugFull: countToken(debugReport, "DEBUG_FULL"),
    debugLegacy: countToken(debugReport, "legacy spatial source"),
  };
  const checks: readonly ContractCheck[] = [
    check(
      "occupation quality status corrected",
      occupationQuality.includes("Status: PASS") && occupationQuality.includes("TH -> FL -> SH chain present, no regression"),
      "occupation-quality-evaluation.md passes when TH -> FL -> SH is present",
    ),
    check("coach report DEBUG_FULL count = 0", counts.coachDebugFull === 0, `${counts.coachDebugFull}`),
    check("coach report legacy spatial source count = 0", counts.coachLegacy === 0, `${counts.coachLegacy}`),
    check("coach report not-coach-facing count = 0", counts.coachNotCoachFacing === 0, `${counts.coachNotCoachFacing}`),
    check("debug report DEBUG_FULL count > 0", counts.debugDebugFull > 0, `${counts.debugDebugFull}`),
    check("debug report legacy spatial source count > 0", counts.debugLegacy > 0, `${counts.debugLegacy}`),
    check(
      "tactical semantics validator scans current file",
      tacticalSemantics.includes("actual generated coach report contains no DEBUG_FULL lines") &&
        tacticalSemantics.includes("actual generated coach report contains no legacy spatial source lines"),
      "tactical-report-semantics-cleanup.md describes actual generated report checks",
    ),
    check(
      "no stale validation pass",
      tacticalSemantics.includes("Status: PASS") && counts.coachDebugFull === 0 && counts.coachLegacy === 0,
      "semantics pass matches actual coach report cleanliness",
    ),
  ];
  const reportPath = join(input.reportDirectory, "validation-contract-cleanup.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      paths: { coachReportPath, debugReportPath },
      counts,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
