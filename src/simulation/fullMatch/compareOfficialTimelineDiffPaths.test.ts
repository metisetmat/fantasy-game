import { compareOfficialTimelineDiffPaths } from "./compareOfficialTimelineDiffPaths";
import {
  emptyOfficialTimelineDiffPath,
  type OfficialTimelineDiffPath,
} from "./officialTimelineDiffView";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function path(input: Partial<OfficialTimelineDiffPath> & Pick<OfficialTimelineDiffPath, "pathId">): OfficialTimelineDiffPath {
  return {
    ...emptyOfficialTimelineDiffPath({ pathId: input.pathId, status: "available" }),
    ...input,
  };
}

export function validateCompareOfficialTimelineDiffPaths(): readonly string[] {
  const comparison = compareOfficialTimelineDiffPaths({
    baseline: path({
      pathId: "baseline",
      finalSandboxOutcome: "none",
    }),
    override: path({
      pathId: "override",
      finalSandboxOutcome: "secured_by_goalkeeper_team",
      finalSandboxTeamCandidate: "goalkeeper_team",
      finalSandboxZoneCandidate: "Z3-HSR",
    }),
  });

  assertTest(comparison.sandboxOutcomeDivergenceObserved, "sandbox outcome divergence must be visible.");
  assertTest(comparison.sandboxFinalTeamDivergenceObserved, "sandbox team divergence must be visible.");
  assertTest(comparison.sandboxFinalZoneDivergenceObserved, "sandbox zone divergence must be visible.");
  assertTest(!comparison.officialTimelineDivergenceObserved, "official timeline divergence must remain false.");
  assertTest(!comparison.officialScoreDivergenceObserved, "official score divergence must remain false.");

  return [
    "sandbox path divergences are detected",
    "official timeline and scoring divergences remain false",
  ];
}

if (require.main === module) {
  const checks = validateCompareOfficialTimelineDiffPaths();

  console.log("compareOfficialTimelineDiffPaths tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
