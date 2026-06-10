import { readFileSync } from "node:fs";
import { join } from "node:path";

interface RoleComparisonPanelUiCheck {
  readonly name: string;
  readonly passed: boolean;
  readonly detail: string;
}

function source(file: string): string {
  return readFileSync(join(__dirname, file), "utf8");
}

function check(name: string, passed: boolean, detail: string): RoleComparisonPanelUiCheck {
  return { name, passed, detail };
}

const comparisonSource = source("RoleComparisonPanel.tsx");

export const roleComparisonPanelUiContractChecks: readonly RoleComparisonPanelUiCheck[] = [
  check("component renders JSX, not HTML strings", comparisonSource.includes("return (") && !comparisonSource.includes("`<"), "JSX return visible"),
  check("dangerouslySetInnerHTML is absent", !comparisonSource.includes("dangerouslySetInnerHTML"), "no unsafe HTML injection"),
  check("playerName is displayed", comparisonSource.includes("comparison.playerName"), "player name visible"),
  check("tested roles table is displayed", comparisonSource.includes("<table") && comparisonSource.includes("<caption>"), "table visible"),
  check("bestRole is displayed", comparisonSource.includes("comparison.bestRole") && comparisonSource.includes("Best role"), "bestRole visible"),
  check("safestRole is displayed", comparisonSource.includes("comparison.safestRole") && comparisonSource.includes("Safest role"), "safestRole visible"),
  check("highestUpsideRole is displayed", comparisonSource.includes("comparison.highestUpsideRole") && comparisonSource.includes("Highest upside role"), "highestUpsideRole visible"),
  check("riskiestRole is displayed as warning", comparisonSource.includes("comparison.riskiestRole") && comparisonSource.includes("not as a recommendation"), "riskiestRole warning visible"),
  check("summary is displayed", comparisonSource.includes("comparison.summary"), "summary visible"),
  check("coachRecommendation is displayed", comparisonSource.includes("comparison.coachRecommendation"), "coachRecommendation visible"),
  check("testedRoles use testedRole not legacy role key", comparisonSource.includes("result.testedRole") && !comparisonSource.includes("result.role"), "testedRole rows visible"),
  check("UI does not recalculate score", comparisonSource.includes("RoleFitScoreBar") && !comparisonSource.includes("computeRoleFit"), "source scores visible"),
];

const failedRoleComparisonPanelChecks = roleComparisonPanelUiContractChecks.filter((item) => !item.passed);

if (failedRoleComparisonPanelChecks.length > 0) {
  throw new Error(
    `RoleComparisonPanel UI contract failed: ${failedRoleComparisonPanelChecks.map((item) => `${item.name}: ${item.detail}`).join("; ")}`,
  );
}
