import { compareRoleFits, computeRoleFit } from "../../systems/roleFit";
import { ROLE_FIT_ENGINE_FIXTURE_INPUTS, ROLE_FIT_ENGINE_COMPARISON_INPUTS } from "../../systems/roleFit/roleFitFixtures";
import type { RoleComparisonResult, RoleFitInput, RoleFitLabel, RoleFitResult, TrueRole } from "../../systems/roleFit";

export const TRUE_ROLES: readonly TrueRole[] = [
  "Tempo Half",
  "Hook Link",
  "Forward Leader",
  "Goalkeeper / Free Safety",
  "Mobile Lock",
  "Space Hunter",
  "Playmaker",
  "Pivot",
  "Left Piston",
  "Right Piston",
];

export type CoverageStatus = "Covered" | "Thin" | "Risky" | "Missing";

export interface RosterPlayerRoleSeed {
  readonly playerId: string;
  readonly playerName: string;
  readonly assignedRole: TrueRole;
  readonly roleFitInput: RoleFitInput;
  readonly candidateRoles?: readonly TrueRole[];
}

export interface RosterRoleAssignment {
  readonly playerId: string;
  readonly playerName: string;
  readonly assignedRole: TrueRole;
  readonly assignedRoleFit: RoleFitResult;
  readonly comparison: RoleComparisonResult;
  readonly bestRole: TrueRole;
  readonly assignedDiffersFromBest: boolean;
  readonly riskyAssignment: boolean;
  readonly topReason: string;
  readonly topRisk: string;
  readonly fatigueWarningLevel: string;
}

export interface RoleCoverageRow {
  readonly trueRole: TrueRole;
  readonly assignedPlayerName?: string;
  readonly bestAvailableCandidateName?: string;
  readonly bestFitScore: number;
  readonly viableCandidateCount: number;
  readonly status: CoverageStatus;
  readonly explanation: string;
}

export interface RosterRoleFitModel {
  readonly teamName: string;
  readonly styleContext: {
    readonly selectedStyle?: string;
    readonly explanation: string;
  };
  readonly assignments: readonly RosterRoleAssignment[];
  readonly coverage: readonly RoleCoverageRow[];
  readonly warnings: readonly string[];
  readonly recommendedInspectionPlayerId: string;
}

function fixtureInput(id: string): RoleFitInput {
  const fixture = ROLE_FIT_ENGINE_FIXTURE_INPUTS.find((item) => item.id === id);
  if (fixture === undefined) {
    throw new Error(`Missing role fit fixture ${id}`);
  }
  return fixture.input;
}

function comparisonInputs(id: string): readonly RoleFitInput[] {
  const fixture = ROLE_FIT_ENGINE_COMPARISON_INPUTS.find((item) => item.id === id);
  if (fixture === undefined) {
    throw new Error(`Missing comparison fixture ${id}`);
  }
  return fixture.inputs;
}

function inputForRole(seed: RosterPlayerRoleSeed, testedRole: TrueRole): RoleFitInput {
  return {
    ...seed.roleFitInput,
    testedRole,
    playerId: seed.playerId,
    playerName: seed.playerName,
  };
}

function candidateInputs(seed: RosterPlayerRoleSeed): readonly RoleFitInput[] {
  return (seed.candidateRoles ?? TRUE_ROLES).map((testedRole) => inputForRole(seed, testedRole));
}

function assignedResult(comparison: RoleComparisonResult, assignedRole: TrueRole): RoleFitResult {
  const result = comparison.testedRoles.find((item) => item.testedRole === assignedRole);
  if (result === undefined) {
    throw new Error(`Assigned role ${assignedRole} was not included in role comparison`);
  }
  return result;
}

function isRiskyLabel(label: RoleFitLabel): boolean {
  return label === "Risky Fit" || label === "Poor Fit";
}

function hasHighRisk(result: RoleFitResult): boolean {
  return result.topRisks.some((risk) => risk.severity === "HIGH" || risk.severity === "CRITICAL");
}

function topReason(result: RoleFitResult): string {
  return result.topReasons[0]?.label ?? "No major strength signal available yet.";
}

function topRisk(result: RoleFitResult): string {
  return result.topRisks[0] === undefined
    ? "No major risk identified in the current context."
    : `${result.topRisks[0].severity}: ${result.topRisks[0].label}`;
}

function assignmentFromSeed(seed: RosterPlayerRoleSeed): RosterRoleAssignment {
  const comparison = compareRoleFits(candidateInputs(seed));
  const fit = assignedResult(comparison, seed.assignedRole);
  return {
    playerId: seed.playerId,
    playerName: seed.playerName,
    assignedRole: seed.assignedRole,
    assignedRoleFit: fit,
    comparison,
    bestRole: comparison.bestRole,
    assignedDiffersFromBest: comparison.bestRole !== seed.assignedRole,
    riskyAssignment: isRiskyLabel(fit.label) || hasHighRisk(fit),
    topReason: topReason(fit),
    topRisk: topRisk(fit),
    fatigueWarningLevel: fit.fatigueWarning?.level ?? "NONE",
  };
}

function allResults(assignments: readonly RosterRoleAssignment[]): readonly RoleFitResult[] {
  return assignments.flatMap((assignment) => assignment.comparison.testedRoles);
}

function coverageStatus(roleResults: readonly RoleFitResult[], assigned: RosterRoleAssignment | undefined): CoverageStatus {
  const strongCandidate = roleResults.some((result) => result.label === "Strong Fit" || result.label === "Natural Fit");
  const viableCandidates = roleResults.filter((result) => result.label !== "Poor Fit");
  const fatigueSensitive = roleResults.some((result) => result.fatigueWarning?.level === "RISK" || result.fatigueWarning?.level === "CRITICAL");

  if (strongCandidate || (assigned !== undefined && !isRiskyLabel(assigned.assignedRoleFit.label))) {
    return viableCandidates.length <= 1 || fatigueSensitive ? "Thin" : "Covered";
  }
  if (viableCandidates.length > 0) {
    return "Risky";
  }
  return "Missing";
}

function coverageRows(assignments: readonly RosterRoleAssignment[]): readonly RoleCoverageRow[] {
  const results = allResults(assignments);
  return TRUE_ROLES.map((trueRole) => {
    const roleResults = results.filter((result) => result.testedRole === trueRole);
    const assigned = assignments.find((assignment) => assignment.assignedRole === trueRole);
    const bestCandidate = [...roleResults].sort((left, right) => right.score - left.score)[0];
    const viableCandidateCount = roleResults.filter((result) => result.label !== "Poor Fit").length;
    const status = coverageStatus(roleResults, assigned);
    const assignedText = assigned === undefined ? "no assigned player" : `${assigned.playerName} assigned`;
    const candidateText = bestCandidate === undefined ? "no candidate" : `${bestCandidate.playerName} ${bestCandidate.score}/100`;

    return {
      trueRole,
      ...(assigned === undefined ? {} : { assignedPlayerName: assigned.playerName }),
      ...(bestCandidate === undefined ? {} : { bestAvailableCandidateName: bestCandidate.playerName }),
      bestFitScore: bestCandidate?.score ?? 0,
      viableCandidateCount,
      status,
      explanation: `${assignedText}; best available candidate ${candidateText}.`,
    };
  });
}

function warningSummary(assignments: readonly RosterRoleAssignment[], coverage: readonly RoleCoverageRow[]): readonly string[] {
  const warnings: string[] = [];
  const missingRoles = coverage.filter((row) => row.status === "Missing").map((row) => row.trueRole);
  const riskyAssignments = assignments.filter((assignment) => assignment.riskyAssignment);
  const fatigueSensitiveWidth = assignments.filter(
    (assignment) =>
      (assignment.assignedRole === "Left Piston" || assignment.assignedRole === "Right Piston") &&
      (assignment.assignedRoleFit.fatigueWarning?.level === "RISK" || assignment.assignedRoleFit.fatigueWarning?.level === "CRITICAL"),
  );
  const goalkeeperCoverage = coverage.find((row) => row.trueRole === "Goalkeeper / Free Safety");
  const tempoCoverage = coverage.find((row) => row.trueRole === "Tempo Half");
  const repairCoverage = coverage.find((row) => row.trueRole === "Mobile Lock");
  const spaceHunterAssignment = assignments.find((assignment) => assignment.assignedRole === "Space Hunter");

  if (missingRoles.length > 0) warnings.push(`Missing key role coverage: ${missingRoles.join(", ")}.`);
  if (riskyAssignments.length >= 3) warnings.push(`Too many risky assignments: ${riskyAssignments.map((assignment) => assignment.playerName).join(", ")} need protection.`);
  if (fatigueSensitiveWidth.length > 0) warnings.push(`Too much fatigue-sensitive width: ${fatigueSensitiveWidth.map((assignment) => assignment.playerName).join(", ")} needs late-match cover.`);
  if (goalkeeperCoverage?.status === "Missing" || goalkeeperCoverage?.status === "Risky") {
    warnings.push("Goalkeeper / Free Safety coverage is risky. You may concede more rebounds, cold-start errors, or second-save failures.");
  }
  if (tempoCoverage?.status === "Missing" || tempoCoverage?.status === "Risky") warnings.push("No reliable tempo organizer is clearly covered.");
  if (repairCoverage?.status === "Missing" || repairCoverage?.status === "Risky") warnings.push("No central repair role is clearly covered.");
  if (spaceHunterAssignment !== undefined && spaceHunterAssignment.assignedRoleFit.topRisks.some((risk) => risk.id === "isolation_if_support_late")) {
    warnings.push("Weak support around Space Hunter may isolate the rupture runner.");
  }
  if (coverage.filter((row) => row.status === "Covered").length < 4) warnings.push("Low route diversity risk: too few roles are strongly covered.");

  return warnings.length === 0 ? ["Roster role coverage is playable; continue monitoring fatigue and contextual risks."] : warnings;
}

export function buildRosterRoleFitModel(input: {
  readonly teamName: string;
  readonly players: readonly RosterPlayerRoleSeed[];
  readonly selectedStyle?: string;
}): RosterRoleFitModel {
  const assignments = input.players.map(assignmentFromSeed);
  const coverage = coverageRows(assignments);
  const warnings = warningSummary(assignments, coverage);
  const recommendedInspection =
    assignments.find((assignment) => assignment.riskyAssignment) ??
    assignments.find((assignment) => assignment.assignedDiffersFromBest) ??
    assignments[0];

  if (recommendedInspection === undefined) {
    throw new Error("Roster builder requires at least one player");
  }

  return {
    teamName: input.teamName,
    styleContext: input.selectedStyle === undefined
      ? {
          explanation: "Current style: not selected. Role fit is shown without additional hidden UI style modifiers.",
        }
      : {
          selectedStyle: input.selectedStyle,
          explanation: `Current style: ${input.selectedStyle}. Style effects come from RoleFitResult.styleFit, not roster UI boosts.`,
        },
    assignments,
    coverage,
    warnings,
    recommendedInspectionPlayerId: recommendedInspection.playerId,
  };
}

export function createFixtureRosterRoleFitModel(): RosterRoleFitModel {
  const milan = comparisonInputs("RF_FIX_04")[0];
  if (milan === undefined) {
    throw new Error("Milan comparison input missing");
  }

  return buildRosterRoleFitModel({
    teamName: "CONTROL review roster",
    players: [
      { playerId: "elias", playerName: "Elias", assignedRole: "Tempo Half", roleFitInput: fixtureInput("RF_FIX_01") },
      { playerId: "milan", playerName: "Milan", assignedRole: "Hook Link", roleFitInput: milan },
      { playerId: "sacha", playerName: "Sacha", assignedRole: "Goalkeeper / Free Safety", roleFitInput: fixtureInput("RF_FIX_06") },
      { playerId: "ilyes", playerName: "Ilyes", assignedRole: "Space Hunter", roleFitInput: fixtureInput("RF_FIX_08") },
      { playerId: "noa", playerName: "Noa", assignedRole: "Right Piston", roleFitInput: fixtureInput("RF_FIX_05") },
      { playerId: "rayan", playerName: "Rayan", assignedRole: "Tempo Half", roleFitInput: fixtureInput("RF_FIX_02") },
      { playerId: "oren", playerName: "Oren", assignedRole: "Mobile Lock", roleFitInput: fixtureInput("RF_FIX_13") },
      { playerId: "malo", playerName: "Malo", assignedRole: "Forward Leader", roleFitInput: fixtureInput("RF_FIX_11") },
    ],
  });
}

export function createNoViableGoalkeeperRosterRoleFitModel(): RosterRoleFitModel {
  return buildRosterRoleFitModel({
    teamName: "No viable goalkeeper coverage scenario",
    players: [
      { playerId: "rayan", playerName: "Rayan", assignedRole: "Tempo Half", roleFitInput: fixtureInput("RF_FIX_02"), candidateRoles: ["Tempo Half", "Pivot", "Playmaker"] },
      { playerId: "oren", playerName: "Oren", assignedRole: "Mobile Lock", roleFitInput: fixtureInput("RF_FIX_13"), candidateRoles: ["Mobile Lock", "Forward Leader", "Left Piston"] },
      { playerId: "sami", playerName: "Sami", assignedRole: "Space Hunter", roleFitInput: fixtureInput("RF_FIX_09"), candidateRoles: ["Space Hunter", "Right Piston", "Playmaker"] },
    ],
  });
}
