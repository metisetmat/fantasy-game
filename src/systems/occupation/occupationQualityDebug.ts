import type { OccupationQualityReport } from "./occupationQualityTypes";
import { summarizeOccupationQuality, summarizeTeamOccupationQuality } from "./occupationQualityNarrative";

export function formatOccupationQualityDebug(report: OccupationQualityReport): string {
  const playerLines = report.playerEvaluations.map((evaluation) => `- ${summarizeOccupationQuality(evaluation)}`);
  const teamLines = report.teamEvaluations.map((evaluation) => `- ${summarizeTeamOccupationQuality(evaluation)}`);
  const warningLines = report.chainRegressionWarnings.map((warning) => `- ${warning}`);

  return [
    "### Occupation Quality Evaluation",
    ...playerLines,
    "",
    "### Team Occupation Quality",
    ...teamLines,
    "",
    "### Occupation Quality Warnings",
    ...(warningLines.length === 0 ? ["- none"] : warningLines),
  ].join("\n");
}
