import type { OccupationQualityEvaluation, TeamOccupationQuality } from "./occupationQualityTypes";

export function summarizeOccupationQuality(evaluation: OccupationQualityEvaluation): string {
  const weakness = evaluation.weaknesses[0] ?? "no major weakness";
  const strength = evaluation.strengths[0] ?? "function and zone are compatible";

  return `${evaluation.roleInitials} ${evaluation.primaryFunction} at ${evaluation.selectedZone}: ${evaluation.grade} (${evaluation.qualityScore}/100) - ${strength}; ${weakness}.`;
}

export function summarizeTeamOccupationQuality(team: TeamOccupationQuality): string {
  return `${team.style} occupation quality ${team.overallScore}/100: support ${team.supportScore}, width ${team.widthScore}, rest defense ${team.restDefenseScore}, weak-side prep ${team.weakSideScore}, risk control ${team.riskControlScore}.`;
}
