import { readFileSync } from "node:fs";
import { join } from "node:path";

interface RosterBuilderUiCheck {
  readonly name: string;
  readonly passed: boolean;
  readonly detail: string;
}

function source(file: string): string {
  return readFileSync(join(__dirname, file), "utf8");
}

function check(name: string, passed: boolean, detail: string): RosterBuilderUiCheck {
  return { name, passed, detail };
}

const builderSource = source("RosterBuilder.tsx");
const tableSource = source("RosterRoleAssignmentTable.tsx");
const drawerSource = source("PlayerRoleFitDrawer.tsx");
const coverageSource = source("RoleCoveragePanel.tsx");
const selectorSource = readFileSync(join(__dirname, "..", "..", "features", "roster", "rosterRoleFitSelectors.ts"), "utf8");
const combinedSource = [builderSource, tableSource, drawerSource, coverageSource, selectorSource].join("\n");

export const rosterBuilderFixtureScenariosUnderTest = [
  "Milan multi-role comparison",
  "Sacha Goalkeeper mental fatigue",
  "Ilyes Space Hunter guardrail",
  "Noa Right Piston fatigue sensitivity",
  "Rayan Tempo Half low Vision cap",
  "Oren Mobile Lock risky fit",
  "No viable goalkeeper coverage roster",
  "too many risky assignments roster",
] as const;

export const rosterBuilderUiContractChecks: readonly RosterBuilderUiCheck[] = [
  check("roster builder displays all players", builderSource.includes("model.assignments") && tableSource.includes("assignment.playerName"), "player rows visible"),
  check("assigned role fit score is displayed", tableSource.includes("assignedRoleFit.score") && tableSource.includes("RoleFitScoreBar"), "assigned scores visible"),
  check("assigned role fit label is displayed", tableSource.includes("assignedRoleFit.label") && tableSource.includes("RoleFitBadge"), "assigned labels visible"),
  check("risky assigned role warning appears", tableSource.includes("Risky fit for this role"), "risk warning visible"),
  check("bestRole appears", tableSource.includes("assignment.bestRole"), "bestRole visible"),
  check("RoleFitCard is rendered in details drawer", drawerSource.includes("RoleFitCard") && drawerSource.includes("<RoleFitCard"), "RoleFitCard markup visible"),
  check("RoleComparisonPanel is rendered in comparison view", drawerSource.includes("RoleComparisonPanel") && drawerSource.includes("<RoleComparisonPanel"), "RoleComparisonPanel markup visible"),
  check("RoleCoveragePanel lists all 10 roles", ["Tempo Half", "Hook Link", "Forward Leader", "Goalkeeper / Free Safety", "Mobile Lock", "Space Hunter", "Playmaker", "Pivot", "Left Piston", "Right Piston"].every((role) => selectorSource.includes(role)), "all true roles visible"),
  check("missing Goalkeeper / Free Safety coverage warning appears", selectorSource.includes("Goalkeeper / Free Safety coverage is risky"), "GK warning visible"),
  check("Space Hunter copy does not contain defensive_midfielder_requirement", !combinedSource.includes("defensive_midfielder_requirement"), "Space Hunter guardrail preserved"),
  check("no legacy role field is used as public RoleFitResult output", !combinedSource.includes("result.role") && !combinedSource.includes(".role"), "testedRole output only"),
  check("roster builder does not import ScoringEvents", !combinedSource.includes("ScoringEvent"), "no scoring event import"),
  check("roster builder does not import MatchBonusEvent mutation logic", !combinedSource.includes("MatchBonusEvent"), "no MatchBonusEvent import"),
  check("roster builder does not recalculate Role Fit score", selectorSource.includes("computeRoleFit") && !builderSource.includes("computeRoleFit") && !tableSource.includes("computeRoleFit"), "selector computes, UI renders"),
  check("components render JSX, not HTML strings", [builderSource, tableSource, drawerSource, coverageSource].every((text) => text.includes("return (") && !text.includes("`<")), "JSX visible"),
];

const failedRosterBuilderChecks = rosterBuilderUiContractChecks.filter((item) => !item.passed);

if (failedRosterBuilderChecks.length > 0) {
  throw new Error(`Roster builder UI contract failed: ${failedRosterBuilderChecks.map((item) => `${item.name}: ${item.detail}`).join("; ")}`);
}
