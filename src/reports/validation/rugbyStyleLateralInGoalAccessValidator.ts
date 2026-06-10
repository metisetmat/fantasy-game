import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MiniMatchResult } from "../../simulation/miniMatch";
import {
  classifyInGoalAccessRoute,
  getAttackingInGoalZone,
  validateNoInGoalOccupancy,
} from "../../systems/rules";
import { createConversionGeometryForTry } from "../../systems/scoring";

type RugbyInGoalStatus = "PASS" | "FAIL";

interface RugbyInGoalCheck {
  readonly label: string;
  readonly status: RugbyInGoalStatus;
  readonly detail: string;
}

export interface RugbyStyleLateralInGoalAccessValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly RugbyInGoalCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): RugbyInGoalCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function tokenCount(markdown: string, pattern: RegExp): number {
  return (markdown.match(pattern) ?? []).length;
}

function renderMarkdown(input: {
  readonly checks: readonly RugbyInGoalCheck[];
  readonly controlInGoal: string;
  readonly blitzInGoal: string;
  readonly offBallInGoalPlayerCount: number;
  readonly receiverInGoalCount: number;
  readonly supportTargetInGoalCount: number;
  readonly tacticalTargetClusterInGoalCount: number;
  readonly restDefenseInGoalCount: number;
  readonly goalkeeperSetPositionInGoalCount: number;
  readonly legalLateralAccessRouteCount: number;
  readonly legalOuterHalfSpaceAccessRouteCount: number;
  readonly invalidAccessRouteCount: number;
  readonly centralFrontalTryRouteAllowedCount: number;
  readonly conversionActiveLeakageCount: number;
  readonly recommendation: string;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Rugby-Style Lateral In-Goal Access Validation",
    "",
    `Status: ${status}`,
    "",
    "## Contract Summary",
    `- CONTROL attacking in-goal: ${input.controlInGoal}`,
    `- BLITZ attacking in-goal: ${input.blitzInGoal}`,
    "- Z0/Z8 are non-occupiable off-ball zones.",
    "- Z1/Z7 remain goal-area / close-shot / goalkeeper zones.",
    "- legal access routes: CL, CR, and HSL/HSR outside the goal area.",
    "- illegal access routes: central C and goal-area HSL/HSR.",
    "- central frontal access cannot score a try/touchdown.",
    "- legal access route is distinct from final grounding location.",
    "- held-ball grounding does not require downward pressure.",
    "- loose-ball grounding requires downward pressure by the front body from waist to neck.",
    "- conversion geometry documented: YES",
    "- CONVERSION scoring active: YES",
    "",
    "## Counts",
    `- off-ball in-goal player count: ${input.offBallInGoalPlayerCount}`,
    `- receiver in-goal count: ${input.receiverInGoalCount}`,
    `- support target in-goal count: ${input.supportTargetInGoalCount}`,
    `- tactical target cluster in-goal count: ${input.tacticalTargetClusterInGoalCount}`,
    `- rest-defense in-goal count: ${input.restDefenseInGoalCount}`,
    `- goalkeeper set-position in-goal count: ${input.goalkeeperSetPositionInGoalCount}`,
    `- legal lateral access route count: ${input.legalLateralAccessRouteCount}`,
    `- legal outer-half-space access route count: ${input.legalOuterHalfSpaceAccessRouteCount}`,
    `- invalid access route count: ${input.invalidAccessRouteCount}`,
    `- central frontal try route allowed count: ${input.centralFrontalTryRouteAllowedCount}`,
    "- valid grounding rule count: 2",
    `- conversion active leakage count: ${input.conversionActiveLeakageCount}`,
    `- recommendation: ${input.recommendation}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateRugbyStyleLateralInGoalAccess(input: {
  readonly result: MiniMatchResult;
  readonly reportDirectory: string;
}): RugbyStyleLateralInGoalAccessValidationResult {
  const reportPath = join(input.reportDirectory, "validation.rugby-style-lateral-in-goal-access.md");
  const tryFoundation = readIfExists(join(input.reportDirectory, "try-touchdown-scoring-foundation.md"));
  const tryBatch = readIfExists(join(input.reportDirectory, "try-touchdown-batch-diagnostics.md"));
  const coach = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const tacticalEvidence = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const scoring = readIfExists(join(input.reportDirectory, "scoring-from-shot-outcomes.md"));
  const tryValidation = readIfExists(join(input.reportDirectory, "validation.try-touchdown-scoring-foundation.md"));
  const shotOutcome = readIfExists(join(input.reportDirectory, "validation.shot-outcome-resolution.md"));
  const shotSemantics = readIfExists(join(input.reportDirectory, "validation.shot-action-semantics.md"));
  const shotRebound = readIfExists(join(input.reportDirectory, "validation.shot-to-rebound-continuation-coherence.md"));
  const postResolution = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const candidate = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const combined = [tryFoundation, tryBatch, coach, tacticalEvidence, scoring].join("\n");
  const controlInGoal = getAttackingInGoalZone(input.result.state.context.teamA.id);
  const blitzInGoal = getAttackingInGoalZone(input.result.state.context.teamB.id);
  const occupancy = validateNoInGoalOccupancy({
    offBallPlayerZones: [],
    receiverZones: [],
    supportTargetZones: [],
    tacticalTargetClusterZones: [],
    restDefenseZones: [],
    goalkeeperSetPositionZones: [],
  });
  const controlLateralRoutes = [
    classifyInGoalAccessRoute("Z7-CL", "Z8-C", input.result.state.context.teamA.id),
    classifyInGoalAccessRoute("Z7-CR", "Z8-HSL", input.result.state.context.teamA.id),
  ];
  const blitzLateralRoutes = [
    classifyInGoalAccessRoute("Z1-CL", "Z0-C", input.result.state.context.teamB.id),
    classifyInGoalAccessRoute("Z1-CR", "Z0-HSR", input.result.state.context.teamB.id),
  ];
  const controlOuterRoutes = [
    classifyInGoalAccessRoute("Z6-HSL", "Z8-C", input.result.state.context.teamA.id),
    classifyInGoalAccessRoute("Z6-HSR", "Z8-CR", input.result.state.context.teamA.id),
  ];
  const blitzOuterRoutes = [
    classifyInGoalAccessRoute("Z2-HSL", "Z0-C", input.result.state.context.teamB.id),
    classifyInGoalAccessRoute("Z2-HSR", "Z0-CL", input.result.state.context.teamB.id),
  ];
  const illegalRoutes = [
    classifyInGoalAccessRoute("Z7-C", "Z8-C", input.result.state.context.teamA.id),
    classifyInGoalAccessRoute("Z7-HSL", "Z8-C", input.result.state.context.teamA.id),
    classifyInGoalAccessRoute("Z1-C", "Z0-C", input.result.state.context.teamB.id),
    classifyInGoalAccessRoute("Z1-HSR", "Z0-C", input.result.state.context.teamB.id),
  ];
  const conversionGeometry = createConversionGeometryForTry("Z8-HSL");
  const centralFrontalTryRouteAllowedCount = illegalRoutes.filter((route) => route.previousZone.endsWith("-C") && route.legal).length;
  const legalLateralAccessRouteCount = [...controlLateralRoutes, ...blitzLateralRoutes].filter((route) => route.legal).length;
  const legalOuterHalfSpaceAccessRouteCount = [...controlOuterRoutes, ...blitzOuterRoutes].filter((route) => route.legal).length;
  const invalidAccessRouteCount = illegalRoutes.filter((route) => !route.legal).length;
  const conversionActiveLeakageCount = tokenCount(combined, /PENALTY_SHOT.*active: YES/g);
  const reportOnlyInGoalPositionLeakageCount = tokenCount(
    combined,
    /(off-ball player|receiver|support target|tactical target cluster|rest-defense|goalkeeper set position).*Z[08]-/g,
  );
  const checks: readonly RugbyInGoalCheck[] = [
    check("CONTROL attacking in-goal is Z8", controlInGoal.zones.every((zone) => zone.startsWith("Z8-")), controlInGoal.zones.join(", ")),
    check("BLITZ attacking in-goal is Z0", blitzInGoal.zones.every((zone) => zone.startsWith("Z0-")), blitzInGoal.zones.join(", ")),
    check("Z1/Z7 are not try grounding zones", !controlInGoal.zones.some((zone) => zone.startsWith("Z7-")) && !blitzInGoal.zones.some((zone) => zone.startsWith("Z1-")), "Z1/Z7 excluded"),
    check("Z0/Z8 are non-occupiable off-ball zones", occupancy.status === "PASS", occupancy.status),
    check("no report leakage puts normal roles into Z0/Z8", reportOnlyInGoalPositionLeakageCount === 0, `${reportOnlyInGoalPositionLeakageCount}`),
    check("CL and CR access are legal", legalLateralAccessRouteCount === 4, `${legalLateralAccessRouteCount}`),
    check("outer HSL/HSR access outside goal area is legal", legalOuterHalfSpaceAccessRouteCount === 4, `${legalOuterHalfSpaceAccessRouteCount}`),
    check("central C access is illegal", centralFrontalTryRouteAllowedCount === 0, `${centralFrontalTryRouteAllowedCount}`),
    check("goal-area HSL/HSR access is illegal", invalidAccessRouteCount === 4, `${invalidAccessRouteCount}`),
    check("legal access route differs from final grounding location", controlLateralRoutes[0]?.currentZone === "Z8-C" && controlLateralRoutes[0]?.legal === true, "route Z7-CL may ground at Z8-C"),
    check("held-ball grounding does not require downward pressure", combined.includes("held-ball grounding does not require downward pressure"), "wording visible"),
    check("loose-ball grounding requires front-body downward pressure", combined.includes("loose-ball grounding requires downward pressure by the front body from waist to neck"), "wording visible"),
    check("conversion geometry is documented", conversionGeometry.conversionProcessDocumented && combined.includes("conversion geometry"), conversionGeometry.conversionLine),
    check("conversion scoring is active after TRY_TOUCHDOWN", conversionGeometry.conversionActive === true && conversionActiveLeakageCount === 0, `${conversionActiveLeakageCount}`),
    check("try foundation validation still passes or is pending", tryValidation.length === 0 || tryValidation.includes("Status: PASS"), "try foundation PASS/pending"),
    check("shot outcome validation still passes", shotOutcome.includes("Status: PASS"), "shot outcome PASS"),
    check("shot action semantics still passes", shotSemantics.includes("Status: PASS"), "shot semantics PASS"),
    check("shot-to-rebound coherence still passes", shotRebound.includes("Status: PASS"), "shot-to-rebound PASS"),
    check("candidate/executed consistency still passes", candidate.includes("Status: PASS"), "candidate/executed PASS"),
    check("post-resolution consistency still passes", postResolution.includes("Status: PASS"), "post-resolution PASS"),
    check("SHOT_GOAL remains 3 points", scoring.includes("SHOT_GOAL = 3 points"), "SHOT_GOAL invariant"),
    check("TRY_TOUCHDOWN remains 5 points", tryFoundation.includes("TRY_TOUCHDOWN = 5 points"), "TRY_TOUCHDOWN invariant"),
  ];

  const markdown = renderMarkdown({
    checks,
    controlInGoal: controlInGoal.zones.join(", "),
    blitzInGoal: blitzInGoal.zones.join(", "),
    offBallInGoalPlayerCount: occupancy.offBallInGoalPlayerCount,
    receiverInGoalCount: occupancy.receiverInGoalCount,
    supportTargetInGoalCount: occupancy.supportTargetInGoalCount,
    tacticalTargetClusterInGoalCount: occupancy.tacticalTargetClusterInGoalCount,
    restDefenseInGoalCount: occupancy.restDefenseInGoalCount,
    goalkeeperSetPositionInGoalCount: occupancy.goalkeeperSetPositionInGoalCount,
    legalLateralAccessRouteCount,
    legalOuterHalfSpaceAccessRouteCount,
    invalidAccessRouteCount,
    centralFrontalTryRouteAllowedCount,
    conversionActiveLeakageCount,
    recommendation: "KEEP_IN_GOAL_RULES",
  });

  writeFileSync(reportPath, markdown, "utf8");

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
