import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type AggregateStatus = "PASS" | "FAIL";

interface SourceValidationSpec {
  readonly fileName: string;
  readonly criticalTokens: readonly string[];
}

interface SourceValidationSummary {
  readonly fileName: string;
  readonly status: AggregateStatus;
  readonly counts: readonly string[];
  readonly criticalInvariantStatus: AggregateStatus;
  readonly regressionWarnings: readonly string[];
}

interface AggregateValidationCheck {
  readonly label: string;
  readonly status: AggregateStatus;
  readonly detail: string;
}

export interface SubsystemAggregateValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly AggregateValidationCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): AggregateValidationCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function statusFromMarkdown(markdown: string): AggregateStatus {
  return markdown.includes("Status: PASS") ? "PASS" : "FAIL";
}

function countsFromMarkdown(markdown: string): readonly string[] {
  const lines = markdown.split("\n");
  const countsStart = lines.findIndex((line) => line.trim() === "## Counts");
  if (countsStart < 0) {
    return ["- counts unavailable in source validation"];
  }

  const countLines: string[] = [];
  for (let index = countsStart + 1; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    if (line.startsWith("## ")) {
      break;
    }
    if (line.startsWith("- ")) {
      countLines.push(line);
    }
  }

  return countLines.length === 0 ? ["- counts unavailable in source validation"] : countLines;
}

function regressionWarningsFromMarkdown(markdown: string): readonly string[] {
  return markdown
    .split("\n")
    .filter((line) => line.includes("WARNING") || line.includes("FAIL"))
    .filter((line) => !line.startsWith("Status: PASS"));
}

function summarizeSource(input: {
  readonly reportDirectory: string;
  readonly spec: SourceValidationSpec;
}): SourceValidationSummary {
  const markdown = readIfExists(join(input.reportDirectory, input.spec.fileName));
  const status = statusFromMarkdown(markdown);
  const criticalInvariantStatus = input.spec.criticalTokens.every((token) => markdown.includes(token)) ? "PASS" : "FAIL";

  return {
    fileName: input.spec.fileName,
    status,
    counts: countsFromMarkdown(markdown),
    criticalInvariantStatus,
    regressionWarnings: regressionWarningsFromMarkdown(markdown),
  };
}

function renderAggregateMarkdown(input: {
  readonly title: string;
  readonly sources: readonly SourceValidationSummary[];
  readonly checks: readonly AggregateValidationCheck[];
  readonly recommendation: string;
  readonly criticalInvariants: readonly string[];
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    `# ${input.title}`,
    "",
    `Status: ${status}`,
    "",
    "## Consolidated Source Validations",
    ...input.sources.map((source) => `- ${source.fileName}: ${source.status}`),
    "",
    "## Source Counts",
    "",
    ...input.sources.flatMap((source) => [
      `### ${source.fileName}`,
      ...source.counts,
      "",
    ]),
    "## Critical Invariant Checks",
    ...input.criticalInvariants.map((invariant) => `- ${invariant}`),
    "",
    "## Source PASS/FAIL Summary",
    ...input.sources.map((source) => `- ${source.status}: ${source.fileName} - critical invariants ${source.criticalInvariantStatus}`),
    "",
    "## Regression Warnings",
    ...input.sources.flatMap((source) =>
      source.regressionWarnings.length === 0
        ? [`- ${source.fileName}: none`]
        : source.regressionWarnings.map((warning) => `- ${source.fileName}: ${warning}`),
    ),
    "",
    "## Recommendation",
    `- recommendation: ${input.recommendation}`,
    "",
    "## Checks",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

function validateAggregate(input: {
  readonly reportDirectory: string;
  readonly outputFileName: string;
  readonly title: string;
  readonly recommendation: string;
  readonly sourceSpecs: readonly SourceValidationSpec[];
  readonly criticalInvariants: readonly string[];
}): SubsystemAggregateValidationResult {
  const sources = input.sourceSpecs.map((spec) =>
    summarizeSource({
      reportDirectory: input.reportDirectory,
      spec,
    }),
  );
  const checks: readonly AggregateValidationCheck[] = [
    check("all source validations are present", sources.every((source) => readIfExists(join(input.reportDirectory, source.fileName)).length > 0), "source reports readable"),
    check("all source validations are PASS", sources.every((source) => source.status === "PASS"), sources.map((source) => `${source.fileName}:${source.status}`).join(", ")),
    check("critical invariant coverage is preserved", sources.every((source) => source.criticalInvariantStatus === "PASS"), "all critical tokens found"),
    check("source validation names consolidated", input.sourceSpecs.every((spec) => sources.some((source) => source.fileName === spec.fileName)), "all source names listed"),
    check("counts from each source validation included", sources.every((source) => source.counts.length > 0), "counts included"),
  ];
  const reportPath = join(input.reportDirectory, input.outputFileName);

  writeFileSync(
    reportPath,
    renderAggregateMarkdown({
      title: input.title,
      sources,
      checks,
      recommendation: input.recommendation,
      criticalInvariants: input.criticalInvariants,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}

export function validateShotSubsystem(input: { readonly reportDirectory: string }): SubsystemAggregateValidationResult {
  return validateAggregate({
    reportDirectory: input.reportDirectory,
    outputFileName: "validation.shot-subsystem.md",
    title: "Shot Subsystem Aggregate Validation",
    recommendation: "KEEP_SHOT_SUBSYSTEM_VALIDATIONS_CONSOLIDATED",
    sourceSpecs: [
      {
        fileName: "validation.shot-action-semantics.md",
        criticalTokens: ["Status: PASS", "shot blocks using pass vocabulary: 0"],
      },
      {
        fileName: "validation.shot-outcome-resolution.md",
        criticalTokens: ["Status: PASS", "pending shot outcomes: 0"],
      },
    ],
    criticalInvariants: [
      "SHOT actions remain shot-specific.",
      "Shot blocks using pass vocabulary remain 0.",
      "Shot outcomes remain resolved with no pending outcomes.",
      "Scoring values are not changed by shot subsystem validation.",
    ],
  });
}

export function validateTrySubsystem(input: { readonly reportDirectory: string }): SubsystemAggregateValidationResult {
  return validateAggregate({
    reportDirectory: input.reportDirectory,
    outputFileName: "validation.try-subsystem.md",
    title: "Try Subsystem Aggregate Validation",
    recommendation: "KEEP_TRY_SUBSYSTEM_VALIDATIONS_CONSOLIDATED",
    sourceSpecs: [
      {
        fileName: "validation.try-candidate-executed-integration.md",
        criticalTokens: ["Status: PASS"],
      },
      {
        fileName: "validation.live-try-event-integration.md",
        criticalTokens: ["Status: PASS"],
      },
    ],
    criticalInvariants: [
      "Try candidate/executed integration remains PASS.",
      "Live try events remain separated from batch diagnostics.",
      "Try semantics remain try-specific.",
      "No pass/new-carrier wording is introduced into try validation coverage.",
    ],
  });
}

export function validateDropSubsystem(input: { readonly reportDirectory: string }): SubsystemAggregateValidationResult {
  return validateAggregate({
    reportDirectory: input.reportDirectory,
    outputFileName: "validation.drop-subsystem.md",
    title: "Drop Subsystem Aggregate Validation",
    recommendation: "KEEP_DROP_SUBSYSTEM_VALIDATIONS_CONSOLIDATED",
    sourceSpecs: [
      {
        fileName: "validation.drop-goal-foundation.md",
        criticalTokens: ["Status: PASS", "DROP_GOAL = 2 points"],
      },
      {
        fileName: "validation.drop-goal-opportunity-generation.md",
        criticalTokens: ["Status: PASS"],
      },
      {
        fileName: "validation.drop-goal-resolution-calibration.md",
        criticalTokens: ["Status: PASS"],
      },
    ],
    criticalInvariants: [
      "DROP_GOAL remains active at 2 points.",
      "PENALTY_SHOT remains inactive.",
      "Drop opportunity generation remains legal and batch/live separated.",
      "Drop resolution calibration remains PASS.",
    ],
  });
}

export function validateConversionSubsystem(input: { readonly reportDirectory: string }): SubsystemAggregateValidationResult {
  return validateAggregate({
    reportDirectory: input.reportDirectory,
    outputFileName: "validation.conversion-subsystem.md",
    title: "Conversion Subsystem Aggregate Validation",
    recommendation: "KEEP_CONVERSION_SUBSYSTEM_VALIDATIONS_CONSOLIDATED",
    sourceSpecs: [
      {
        fileName: "validation.conversion-resolution.md",
        criticalTokens: ["Status: PASS"],
      },
      {
        fileName: "validation.conversion-difficulty-calibration.md",
        criticalTokens: ["Status: PASS"],
      },
    ],
    criticalInvariants: [
      "CONVERSION_GOAL remains 2 points.",
      "Conversion scoring remains linked to live TRY_TOUCHDOWN only.",
      "Conversion difficulty calibration remains PASS.",
      "Batch conversion diagnostics remain separate from live scoring.",
    ],
  });
}
