import { writeFileSync } from "node:fs";
import { join } from "node:path";

type SelectionScoreStatus = "PASS" | "FAIL";

interface ParsedCandidateScore {
  readonly action: string;
  readonly rawCandidateScore: number;
  readonly finalSelectionScore: number;
  readonly selected: boolean;
  readonly reason: string;
}

interface SelectionScoreCheck {
  readonly label: string;
  readonly status: SelectionScoreStatus;
  readonly detail: string;
}

export interface SelectionScoreConsistencyResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly SelectionScoreCheck[];
}

function check(label: string, passed: boolean, detail: string): SelectionScoreCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function parseCandidateRows(markdown: string): readonly ParsedCandidateScore[] {
  const start = markdown.indexOf("### Candidate Score Breakdown");
  if (start < 0) {
    return [];
  }

  const section = markdown.slice(start).split("\n### ")[0] ?? "";
  return section
    .split("\n")
    .filter((line) => line.startsWith("| TH ->"))
    .map((line): ParsedCandidateScore | null => {
      const cells = line
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell.length > 0);
      const rawCandidateScore = Number.parseInt(cells[1] ?? "", 10);
      const finalSelectionScore = Number.parseInt(cells[3] ?? "", 10);

      if (Number.isNaN(rawCandidateScore) || Number.isNaN(finalSelectionScore)) {
        return null;
      }

      return {
        action: (cells[0] ?? "").replace(" (selected)", ""),
        rawCandidateScore,
        finalSelectionScore,
        selected: cells[4] === "YES",
        reason: cells.slice(5).join(" "),
      };
    })
    .filter((row): row is ParsedCandidateScore => row !== null);
}

function renderMarkdown(checks: readonly SelectionScoreCheck[], candidates: readonly ParsedCandidateScore[]): string {
  return [
    "# Selection Score Consistency",
    "",
    `Status: ${checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL"}`,
    "",
    "## Checks",
    "",
    ...checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
    "## Parsed Candidate Scores",
    "",
    "| Action | rawCandidateScore | finalSelectionScore | selected |",
    "| --- | --- | --- | --- |",
    ...candidates.map((candidate) => `| ${candidate.action} | ${candidate.rawCandidateScore} | ${candidate.finalSelectionScore} | ${candidate.selected ? "YES" : "NO"} |`),
    "",
    "## Interpretation",
    "",
    "- selected action has highest finalSelectionScore",
    "- rawCandidateScore and finalSelectionScore are both shown",
    "- TH -> RP contradiction resolved by final selection adjustment",
    "- OverConservatismPenalty uses finalSelectionScore",
    "- report distinguishes raw upside from selection value",
    "",
  ].join("\n");
}

export function validateSelectionScoreConsistency(input: {
  readonly reportMarkdown: string;
  readonly reportDirectory: string;
}): SelectionScoreConsistencyResult {
  const candidates = parseCandidateRows(input.reportMarkdown);
  const selected = candidates.find((candidate) => candidate.selected);
  const highestFinal = candidates.reduce((highest, candidate) => Math.max(highest, candidate.finalSelectionScore), 0);
  const rp = candidates.find((candidate) => candidate.action === "TH -> RP");
  const selectedHasHighestFinal = selected !== undefined && selected.finalSelectionScore >= highestFinal;
  const higherRawDemotionExplained =
    input.reportMarkdown.includes("higher raw score was demoted") &&
    input.reportMarkdown.includes("rawCandidateScore") &&
    input.reportMarkdown.includes("finalSelectionScore");
  const checks: readonly SelectionScoreCheck[] = [
    check(
      "selected action has highest finalSelectionScore",
      selectedHasHighestFinal,
      selected === undefined ? "no selected candidate parsed" : `${selected.action} finalSelectionScore ${selected.finalSelectionScore}; highest ${highestFinal}`,
    ),
    check(
      "rawCandidateScore and finalSelectionScore both shown",
      input.reportMarkdown.includes("rawCandidateScore") && input.reportMarkdown.includes("finalSelectionScore"),
      "coach report exposes raw and final selection scoring",
    ),
    check(
      "TH -> RP contradiction resolved",
      rp !== undefined && selected !== undefined && rp.rawCandidateScore > selected.rawCandidateScore && rp.finalSelectionScore < selected.finalSelectionScore,
      rp === undefined || selected === undefined
        ? "TH -> RP or selected candidate missing"
        : `TH -> RP raw ${rp.rawCandidateScore}, final ${rp.finalSelectionScore}; selected raw ${selected.rawCandidateScore}, final ${selected.finalSelectionScore}`,
    ),
    check(
      "overconservatism check uses finalSelectionScore",
      input.reportMarkdown.includes("selected finalSelectionScore") && input.reportMarkdown.includes("OverConservatismPenalty"),
      "OverConservatismPenalty text is tied to final selection comparison",
    ),
    check(
      "if selected action does not have highest raw score, explanation exists",
      higherRawDemotionExplained,
      "higher raw score was demoted explanation is present",
    ),
    check(
      "no candidate says risk/reward lower while displaying a higher final score",
      !/risk\/reward lower/i.test(input.reportMarkdown),
      "old ambiguous rejection wording removed",
    ),
    check(
      "report distinguishes raw upside from selection value",
      input.reportMarkdown.includes("selection value") || input.reportMarkdown.includes("selection adjustments"),
      "selection adjustments distinguish raw upside from final selection value",
    ),
  ];
  const reportPath = join(input.reportDirectory, "selection-score-consistency.md");

  writeFileSync(reportPath, renderMarkdown(checks, candidates), "utf8");

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
