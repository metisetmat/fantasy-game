import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type MissingDataStatus = "PASS" | "FAIL";

interface MissingDataCheck {
  readonly label: string;
  readonly status: MissingDataStatus;
  readonly detail: string;
}

export interface TacticalEvidenceMissingDataResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly MissingDataCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function countToken(markdown: string, token: string): number {
  return (markdown.match(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length;
}

function sectionAfter(markdown: string, marker: string): string {
  const start = markdown.indexOf(marker);
  if (start < 0) {
    return "";
  }

  const next = markdown.indexOf("### Action", start + marker.length);
  const nextSequence = markdown.indexOf("## Sequence", start + marker.length);
  const stops = [next, nextSequence].filter((value) => value >= 0);
  const end = stops.length === 0 ? markdown.length : Math.min(...stops);

  return markdown.slice(start, end);
}

function lineCount(markdown: string, token: string): number {
  return markdown.split("\n").filter((line) => line.includes(token)).length;
}

function fullActionBlocks(markdown: string): readonly string[] {
  const actionHeading = /^### Action \d+ - .+$/gm;
  const starts = [...markdown.matchAll(actionHeading)].map((match) => match.index ?? 0);

  return starts.map((start, index) => {
    const nextAction = starts[index + 1] ?? -1;
    const nextSequence = markdown.indexOf("\n## Sequence", start + 1);
    const stops = [nextAction, nextSequence].filter((value) => value >= 0);
    const end = stops.length === 0 ? markdown.length : Math.min(...stops);

    return markdown.slice(start, end);
  });
}

function check(label: string, passed: boolean, detail: string): MissingDataCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function renderMarkdown(input: {
  readonly checks: readonly MissingDataCheck[];
  readonly missingDataCount: number;
  readonly unknownPressureCount: number;
  readonly inferredUnknownCount: number;
  readonly actionBlocksChecked: number;
  readonly pressureLevelsPopulated: number;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Tactical Evidence Missing Data",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- MISSING_DATA count: ${input.missingDataCount}`,
    `- unknown pressure count: ${input.unknownPressureCount}`,
    `- INFERRED_UNKNOWN count: ${input.inferredUnknownCount}`,
    `- action blocks checked: ${input.actionBlocksChecked}`,
    `- pressure levels populated: ${input.pressureLevelsPopulated}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateTacticalEvidenceMissingData(input: {
  readonly reportDirectory: string;
}): TacticalEvidenceMissingDataResult {
  const evidence = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const coach = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const latest = readIfExists(join(input.reportDirectory, "latest-mini-match.md"));
  const missingDataCount = countToken(evidence, "MISSING_DATA");
  const unknownPressureCount = lineCount(evidence, "pressure level: unknown") + lineCount(evidence, "pressure state: unknown");
  const inferredUnknownCount = countToken(evidence, "INFERRED_UNKNOWN");
  const actionBlocks = fullActionBlocks(evidence);
  const actionBlocksChecked = actionBlocks.length;
  const pressureLevelsPopulated = actionBlocks.filter((block) => block.includes("pressure level:")).length;
  const pressureSourcesPopulated = actionBlocks.filter((block) => block.includes("pressure source:")).length;
  const actionOne = sectionAfter(evidence, "### Action 1 - TH -> ML");
  const actionTwo = sectionAfter(evidence, "### Action 2 - ML -> HL");
  const shotBlocks = actionBlocks.filter((block) => block.includes("selectedActionType: SHOT"));
  const shotPressureValid = shotBlocks.every(
    (block) => block.includes("pressure level: INFERRED_FINISHING_PRESSURE") || block.includes("pressure level: FINISHING_PRESSURE"),
  );
  const checks: readonly MissingDataCheck[] = [
    check("tactical-evidence.latest.md exists", evidence.length > 0, "published tactical evidence report exists"),
    check("tactical evidence contains no MISSING_DATA markers", missingDataCount === 0, `${missingDataCount}`),
    check("tactical evidence contains no unknown pressure level", unknownPressureCount === 0, `${unknownPressureCount}`),
    check("every full action block has pressure level", pressureLevelsPopulated === actionBlocksChecked, `${pressureLevelsPopulated}/${actionBlocksChecked}`),
    check("every full action block has pressure source", pressureSourcesPopulated === actionBlocksChecked, `${pressureSourcesPopulated}/${actionBlocksChecked}`),
    check(
      "Sequence 1 Action 1 pressure level is INFERRED_HIGH or HIGH",
      actionOne.includes("pressure level: INFERRED_HIGH") || actionOne.includes("pressure level: HIGH"),
      "Sequence 1 Action 1 pressure level",
    ),
    check(
      "Sequence 1 Action 2 pressure level is INFERRED_MEDIUM or MEDIUM",
      actionTwo.includes("pressure level: INFERRED_MEDIUM") || actionTwo.includes("pressure level: MEDIUM"),
      "Sequence 1 Action 2 pressure level",
    ),
    check(
      "shot actions use FINISHING_PRESSURE or INFERRED_FINISHING_PRESSURE",
      shotBlocks.length > 0 && shotPressureValid,
      `${shotBlocks.length} shot blocks checked`,
    ),
    check("fallback INFERRED_UNKNOWN count = 0", inferredUnknownCount === 0, `${inferredUnknownCount}`),
    check("coach-summary.latest.md still contains no unknown placeholders", !coach.includes("unknown"), "unknown absent"),
    check("latest-mini-match.md still contains no unknown placeholders", !latest.includes("unknown"), "unknown absent"),
  ];
  const reportPath = join(input.reportDirectory, "validation.tactical-evidence-missing-data.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      missingDataCount,
      unknownPressureCount,
      inferredUnknownCount,
      actionBlocksChecked,
      pressureLevelsPopulated,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
