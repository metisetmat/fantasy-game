import { readFileSync } from "node:fs";
import { join } from "node:path";

interface PlayerRoleFitSectionCheck {
  readonly name: string;
  readonly passed: boolean;
  readonly detail: string;
}

function source(file: string): string {
  return readFileSync(join(__dirname, file), "utf8");
}

function check(name: string, passed: boolean, detail: string): PlayerRoleFitSectionCheck {
  return { name, passed, detail };
}

const sectionSource = source("PlayerRoleFitSection.tsx");
const bestRolesSource = source("PlayerBestRolesPanel.tsx");
const developmentSource = source("PlayerRoleDevelopmentPanel.tsx");
const selectorSource = readFileSync(join(__dirname, "..", "..", "features", "player", "playerRoleFitSelectors.ts"), "utf8");
const combinedSource = [sectionSource, bestRolesSource, developmentSource, selectorSource].join("\n");

export const playerProfileFixtureScenariosUnderTest = [
  "Milan multi-role comparison",
  "Sacha Goalkeeper mental fatigue",
  "Ilyes Space Hunter guardrail",
  "Noa Right Piston fatigue sensitivity",
  "Rayan Tempo Half low Vision cap",
  "Oren Mobile Lock risky fit",
] as const;

export const playerRoleFitSectionContractChecks: readonly PlayerRoleFitSectionCheck[] = [
  check("PlayerRoleFitSection exists and returns JSX", sectionSource.includes("export function PlayerRoleFitSection") && sectionSource.includes("return ("), "section JSX visible"),
  check("PlayerBestRolesPanel exists", bestRolesSource.includes("export function PlayerBestRolesPanel"), "best roles panel visible"),
  check("PlayerRoleDevelopmentPanel exists", developmentSource.includes("export function PlayerRoleDevelopmentPanel"), "development panel visible"),
  check("RoleFitCard reused", sectionSource.includes("RoleFitCard") && sectionSource.includes("<RoleFitCard"), "RoleFitCard reused"),
  check("RoleComparisonPanel reused", sectionSource.includes("RoleComparisonPanel") && sectionSource.includes("<RoleComparisonPanel"), "RoleComparisonPanel reused"),
  check("RoleComparisonResult used as source of truth", sectionSource.includes("comparison: RoleComparisonResult") && selectorSource.includes("compareRoleFits"), "comparison source of truth"),
  check("selected RoleFitResult displayed", sectionSource.includes("selectedRoleResult") && sectionSource.includes("selectedResult"), "selected result visible"),
  check("bestRole / safestRole / highestUpsideRole / riskiestRole displayed", ["bestRole", "safestRole", "highestUpsideRole", "riskiestRole"].every((term) => bestRolesSource.includes(term)), "role summary visible"),
  check("development advice displayed", developmentSource.includes("developmentAdvice"), "development advice visible"),
  check("coach usage advice displayed", developmentSource.includes("coachUsageAdvice"), "coach usage advice visible"),
  check("fatigue warning displayed", developmentSource.includes("RoleFitFatigueWarning"), "fatigue warning visible"),
  check("GK mental fatigue wording protected", selectorSource.includes("createGoalkeeperPlayerRoleFitProfile") && developmentSource.includes("second-save recovery"), "GK profile and wording visible"),
  check("Space Hunter guardrail preserved", selectorSource.includes("createSpaceHunterPlayerRoleFitProfile") && !combinedSource.includes("defensive_midfielder_requirement"), "Space Hunter guardrail visible"),
  check("no score recalculation", !sectionSource.includes("computeRoleFit") && !bestRolesSource.includes("computeRoleFit") && !developmentSource.includes("computeRoleFit"), "visual components do not compute"),
  check("no scoring/match mutation imports", !/systems[\\/](scoring|match|simulation)|ScoringEvent|MatchBonusEvent|liveScore|scoreAfter/.test(combinedSource), "scoring isolated"),
];

const failedPlayerRoleFitSectionChecks = playerRoleFitSectionContractChecks.filter((item) => !item.passed);

if (failedPlayerRoleFitSectionChecks.length > 0) {
  throw new Error(
    `PlayerRoleFitSection contract failed: ${failedPlayerRoleFitSectionChecks.map((item) => `${item.name}: ${item.detail}`).join("; ")}`,
  );
}
