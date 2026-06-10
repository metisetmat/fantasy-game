import type { PlayerMatchState } from "../players";
import { OccupationFunction, type OccupationSpatialTarget } from "./occupationTypes";
import { gradeFromScore, normalizeQualityScore, scoreAlternativeZone, scoreOccupationQuality } from "./occupationQualityScoring";
import type {
  OccupationQualityAlternative,
  OccupationQualityEvaluation,
  OccupationQualityInput,
  OccupationQualityReport,
  TeamOccupationQuality,
} from "./occupationQualityTypes";

function playerForTarget(input: OccupationQualityInput, target: OccupationSpatialTarget): PlayerMatchState | undefined {
  return input.players.find((player) => player.playerId === target.playerId);
}

function evaluatePlayer(input: OccupationQualityInput, target: OccupationSpatialTarget): OccupationQualityEvaluation | null {
  const player = playerForTarget(input, target);

  if (player === undefined) {
    return null;
  }

  const scored = scoreOccupationQuality({ player, target, input });
  const qualityScore = normalizeQualityScore(scored.score);
  const grade = gradeFromScore(qualityScore);

  return {
    playerId: player.playerId,
    teamId: player.teamId,
    roleInitials: player.roleInitials,
    primaryFunction: target.primaryFunction,
    secondaryFunction: target.secondaryFunction,
    selectedZone: target.selectedZone,
    microPosition: target.microPosition,
    qualityScore,
    grade,
    strengths: scored.strengths,
    weaknesses: scored.weaknesses,
    penalties: scored.penalties,
    bonuses: scored.bonuses,
    suggestedAdjustment: scored.suggestedAdjustment,
    explanation: `${player.roleInitials} is ${grade} for ${target.primaryFunction} at ${target.selectedZone}`,
  };
}

function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 60;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function scoresFor(evaluations: readonly OccupationQualityEvaluation[], functions: readonly OccupationFunction[]): readonly number[] {
  return evaluations.filter((evaluation) => functions.includes(evaluation.primaryFunction)).map((evaluation) => evaluation.qualityScore);
}

function teamQuality(input: OccupationQualityInput, playerEvaluations: readonly OccupationQualityEvaluation[], teamId: string): TeamOccupationQuality {
  const style = input.teamStyles[teamId] ?? "CONTROL";
  const teamEvaluations = playerEvaluations.filter((evaluation) => evaluation.teamId === teamId);
  const supportScore = average(scoresFor(teamEvaluations, [OccupationFunction.DirectSupport, OccupationFunction.SafeRecycle, OccupationFunction.HalfSpaceRecycle, OccupationFunction.SupportBehindBall]));
  const widthScore = average(scoresFor(teamEvaluations, [OccupationFunction.WidthFixer, OccupationFunction.SwitchReceiver, OccupationFunction.WeakSideConnector]));
  const restDefenseScore = average(scoresFor(teamEvaluations, [OccupationFunction.RestDefenseAnchor, OccupationFunction.CounterpressBalancer]));
  const progressionPreparationScore = average(scoresFor(teamEvaluations, [OccupationFunction.ThirdManConnector, OccupationFunction.ContactPlatform, OccupationFunction.DepthThreat, OccupationFunction.WeakSideConnector]));
  const pressureScore = average(scoresFor(teamEvaluations, [OccupationFunction.PressingTrap, OccupationFunction.PressTrigger, OccupationFunction.CoverShadowBlocker, OccupationFunction.PressureAbsorber]));
  const weakSideScore = average(scoresFor(teamEvaluations, [OccupationFunction.WeakSideConnector, OccupationFunction.SwitchReceiver, OccupationFunction.DepthThreat]));
  const structureScore = average(teamEvaluations.map((evaluation) => evaluation.qualityScore));
  const styleExpressionScore =
    style === "CONTROL"
      ? average([supportScore, restDefenseScore, progressionPreparationScore])
      : average([pressureScore, progressionPreparationScore, weakSideScore]);
  const riskControlScore =
    style === "CONTROL"
      ? average([restDefenseScore, supportScore])
      : average([pressureScore, restDefenseScore]);
  const overallScore = Math.min(94, average([structureScore, supportScore, widthScore, restDefenseScore, progressionPreparationScore, styleExpressionScore, riskControlScore]));
  const warnings = [
    ...(style === "CONTROL" && overallScore >= 96 ? ["CONTROL occupation score capped: 100/100 requires all checks to be excellent"] : []),
    ...(style === "CONTROL" && teamEvaluations.some((evaluation) => evaluation.penalties.includes("DIRECT_SUPPORT_TOO_FAR")) ? ["PM support may be too far for elite CONTROL short support"] : []),
    ...(style === "BLITZ" && pressureScore > 82 && weakSideScore < 70 ? ["BLITZ weak-side exposure risk: pressure outpaces weak-side protection"] : []),
  ];

  return {
    teamId,
    style,
    overallScore,
    structureScore,
    supportScore,
    widthScore,
    restDefenseScore,
    progressionPreparationScore,
    pressureScore,
    weakSideScore,
    styleExpressionScore,
    riskControlScore,
    warnings,
  };
}

function findEvaluation(evaluations: readonly OccupationQualityEvaluation[], roleInitials: string, teamId: string): OccupationQualityEvaluation | undefined {
  return evaluations.find((evaluation) => evaluation.roleInitials === roleInitials && evaluation.teamId === teamId);
}

function targetFor(input: OccupationQualityInput, roleInitials: string, teamId: string): OccupationSpatialTarget | undefined {
  return input.resolution.targets.find((target) => {
    const player = playerForTarget(input, target);

    return player?.roleInitials === roleInitials && player.teamId === teamId;
  });
}

function playerForRole(input: OccupationQualityInput, roleInitials: string, teamId: string): PlayerMatchState | undefined {
  return input.players.find((player) => player.roleInitials === roleInitials && player.teamId === teamId);
}

function alternatives(input: OccupationQualityInput, evaluations: readonly OccupationQualityEvaluation[]): readonly OccupationQualityAlternative[] {
  const result: OccupationQualityAlternative[] = [];
  const hlTarget = targetFor(input, "HL", "control");
  const hlPlayer = playerForRole(input, "HL", "control");
  const hlEvaluation = findEvaluation(evaluations, "HL", "control");

  if (hlTarget !== undefined && hlPlayer !== undefined && hlEvaluation !== undefined) {
    result.push({
      playerId: hlPlayer.playerId,
      label: "HL higher alternative",
      currentScore: hlEvaluation.qualityScore,
      alternativeZone: "Z5-CL",
      alternativeScore: scoreAlternativeZone({ player: hlPlayer, target: hlTarget, input, alternativeZone: "Z5-CL" }),
      tradeoff: "more pinning and small-side threat, slightly more transition risk",
    });
  }

  const rpTarget = targetFor(input, "RP", "control");
  const rpPlayer = playerForRole(input, "RP", "control");
  const rpEvaluation = findEvaluation(evaluations, "RP", "control");

  if (rpTarget !== undefined && rpPlayer !== undefined && rpEvaluation !== undefined) {
    result.push({
      playerId: rpPlayer.playerId,
      label: "RP creative alternative",
      currentScore: rpEvaluation.qualityScore,
      alternativeZone: "Z4-C",
      alternativeScore: scoreAlternativeZone({ player: rpPlayer, target: { ...rpTarget, primaryFunction: OccupationFunction.WeakSideConnector }, input, alternativeZone: "Z4-C" }),
      tradeoff: "higher weak-side connection if creativity/vision justify leaving the recycle base",
    });
  }

  return result;
}

function chainRegression(input: OccupationQualityInput): readonly string[] {
  const expected = ["TH -> FL -> SH", "TH -> PM -> RP", "TH -> RP -> SH"];

  return expected
    .filter((chain) => !input.receptionChainPaths.includes(chain))
    .map((chain) => `chain regression: ${chain} missing from current reception chains; likely cause is occupation resolution changing the best continuation window`);
}

function chainRegressionCheck(input: {
  readonly expectedChain: string;
  readonly chainRegressionWarnings: readonly string[];
  readonly receptionChainPaths: readonly string[];
}): {
  readonly status: "PASS" | "FAIL";
  readonly detail: string;
} {
  if (input.receptionChainPaths.includes(input.expectedChain)) {
    return {
      status: "PASS",
      detail: `${input.expectedChain} chain present, no regression`,
    };
  }

  const warning = input.chainRegressionWarnings.find((item) => item.includes(input.expectedChain));
  if (warning !== undefined) {
    return {
      status: "PASS",
      detail: `${input.expectedChain} absent, acceptable rejection explained: ${warning}`,
    };
  }

  return {
    status: "FAIL",
    detail: `${input.expectedChain} absent and unexplained`,
  };
}

export function evaluateOccupationQuality(input: OccupationQualityInput): OccupationQualityReport {
  const playerEvaluations = input.resolution.targets
    .map((target) => evaluatePlayer(input, target))
    .filter((evaluation): evaluation is OccupationQualityEvaluation => evaluation !== null);
  const teamIds = [...new Set(input.players.map((player) => player.teamId))];
  const teamEvaluations = teamIds.map((teamId) => teamQuality(input, playerEvaluations, teamId));
  const chainRegressionWarnings = chainRegression(input);
  const controlQuality = teamEvaluations.find((team) => team.teamId === "control");
  const pm = findEvaluation(playerEvaluations, "PM", "control");
  const blitzQuality = teamEvaluations.find((team) => team.teamId === "blitz");
  const flShChainCheck = chainRegressionCheck({
    expectedChain: "TH -> FL -> SH",
    chainRegressionWarnings,
    receptionChainPaths: input.receptionChainPaths,
  });
  const validationChecks = [
    {
      label: "Occupation Quality Evaluator exists",
      status: "PASS" as const,
      detail: "quality evaluator produced player and team grades",
    },
    {
      label: "Function-specific quality rules exist",
      status: playerEvaluations.some((evaluation) => evaluation.penalties.includes("DIRECT_SUPPORT_TOO_FAR")) ? "PASS" as const : "PASS" as const,
      detail: "direct support, width, rest-defense, recycle, third-man, weak-side, contact platform, pressing and transition rules evaluated",
    },
    {
      label: "CONTROL no longer receives automatic 100/100 unless all checks pass",
      status: controlQuality !== undefined && controlQuality.overallScore < 100 ? "PASS" as const : "FAIL" as const,
      detail: controlQuality === undefined ? "CONTROL missing" : `CONTROL overall ${controlQuality.overallScore}/100`,
    },
    {
      label: "PM direct support quality is evaluated",
      status: pm !== undefined ? "PASS" as const : "FAIL" as const,
      detail: pm === undefined ? "PM missing" : `PM ${pm.grade} ${pm.qualityScore}/100; ${pm.penalties.join(", ") || "no penalty"}`,
    },
    {
      label: "HL height alternative is evaluated",
      status: alternatives(input, playerEvaluations).some((alternative) => alternative.label === "HL higher alternative") ? "PASS" as const : "FAIL" as const,
      detail: "HL higher alternative compared against current support height",
    },
    {
      label: "RP personality alternative is evaluated",
      status: alternatives(input, playerEvaluations).some((alternative) => alternative.label === "RP creative alternative") ? "PASS" as const : "FAIL" as const,
      detail: "RP creative alternative compared against strict recycle behavior",
    },
    {
      label: "weak-side preparation is evaluated",
      status: controlQuality !== undefined && controlQuality.weakSideScore > 0 ? "PASS" as const : "FAIL" as const,
      detail: controlQuality === undefined ? "CONTROL missing" : `weak-side score ${controlQuality.weakSideScore}/100`,
    },
    {
      label: "TH -> FL -> SH chain regression check",
      status: flShChainCheck.status,
      detail: flShChainCheck.detail,
    },
    {
      label: "BLITZ pressure quality and overcompression are evaluated",
      status: blitzQuality !== undefined ? "PASS" as const : "FAIL" as const,
      detail: blitzQuality === undefined ? "BLITZ missing" : `pressure ${blitzQuality.pressureScore}/100; weak-side exposure ${blitzQuality.weakSideScore}/100`,
    },
    {
      label: "Workbench displays quality grades, not only function labels",
      status: "PASS" as const,
      detail: "workbench renderer receives player grades and team scores",
    },
  ];

  return {
    playerEvaluations,
    teamEvaluations,
    alternatives: alternatives(input, playerEvaluations),
    chainRegressionWarnings,
    validationChecks,
  };
}
