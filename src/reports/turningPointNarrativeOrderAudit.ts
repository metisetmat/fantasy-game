import type { OfficialMatchStorySpineModel } from "./officialMatchStorySpineTypes";

export interface TurningPointNarrativeOrderAudit {
  readonly turningPointCount: number;
  readonly turningPointChronologicalOrderReady: boolean;
  readonly firstScoreTurningPointPresent: boolean;
  readonly firstRealDangerTitleValid: boolean;
  readonly firstRealDangerAfterScoreCount: number;
  readonly invalidFirstDangerLabelCount: number;
  readonly turningPointWithLinkedEventCount: number;
  readonly turningPointWithCoachMeaningCount: number;
  readonly turningPointGenericTitleCount: number;
  readonly turningPointGenericWhyItTurnedCount: number;
  readonly turningPointOrderWarningCodes: readonly string[];
  readonly recommendation: string;
}

function isGenericTitle(title: string): boolean {
  return /Premier vrai danger officiel$|Score decisif du recit officiel$|Stabilisation defensive$/iu.test(title.trim());
}

function isGenericReason(reason: string): boolean {
  return /Ce tournant aide a comprendre le match|La sequence en .+ pese sur le rythme du match/iu.test(reason);
}

export function auditTurningPointNarrativeOrder(model: OfficialMatchStorySpineModel): TurningPointNarrativeOrderAudit {
  const turningPointChronologicalOrderReady = model.turningPoints.every((point, index) =>
    index === 0 || point.minute >= (model.turningPoints[index - 1]?.minute ?? point.minute),
  );
  const firstScoreTurningPointPresent = model.turningPoints.some((point) => point.turningPointType === "first_score");
  const firstRealDangerAfterScoreCount = model.turningPoints.filter((point) =>
    point.isFirstDangerCandidate && point.previousScoreChangeCount > 0,
  ).length;
  const invalidFirstDangerLabelCount = model.turningPoints.filter((point) =>
    point.isFirstDangerCandidate &&
    point.previousScoreChangeCount > 0 &&
    /Premier vrai danger officiel/iu.test(point.title),
  ).length;
  const firstRealDangerTitleValid = invalidFirstDangerLabelCount === 0;
  const turningPointWithLinkedEventCount = model.turningPoints.filter((point) => point.linkedOfficialEventIds.length > 0).length;
  const turningPointWithCoachMeaningCount = model.turningPoints.filter((point) => point.coachMeaning.trim().length > 0).length;
  const turningPointGenericTitleCount = model.turningPoints.filter((point) => isGenericTitle(point.title)).length;
  const turningPointGenericWhyItTurnedCount = model.turningPoints.filter((point) => isGenericReason(point.whyItTurned)).length;
  const turningPointOrderWarningCodes = [
    ...(turningPointChronologicalOrderReady ? [] : ["TURNING_POINTS_NOT_CHRONOLOGICAL"]),
    ...(firstScoreTurningPointPresent ? [] : ["FIRST_SCORE_TURNING_POINT_MISSING"]),
    ...(firstRealDangerTitleValid ? [] : ["INVALID_FIRST_DANGER_LABEL"]),
    ...(turningPointGenericTitleCount === 0 ? [] : ["GENERIC_TURNING_POINT_TITLE"]),
    ...(turningPointGenericWhyItTurnedCount === 0 ? [] : ["GENERIC_TURNING_POINT_REASON"]),
  ];

  return {
    turningPointCount: model.turningPoints.length,
    turningPointChronologicalOrderReady,
    firstScoreTurningPointPresent,
    firstRealDangerTitleValid,
    firstRealDangerAfterScoreCount,
    invalidFirstDangerLabelCount,
    turningPointWithLinkedEventCount,
    turningPointWithCoachMeaningCount,
    turningPointGenericTitleCount,
    turningPointGenericWhyItTurnedCount,
    turningPointOrderWarningCodes,
    recommendation: turningPointOrderWarningCodes.length === 0 ? "KEEP_TURNING_POINT_ORDER" : "FIX_TURNING_POINT_ORDER",
  };
}

