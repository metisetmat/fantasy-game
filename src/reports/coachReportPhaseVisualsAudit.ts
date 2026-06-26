import type { CoachPhaseVisualModel } from "./coachReportTacticalMapCards";
import type { CoachReportPhaseVisualsTacticalMapCardsWarningCode } from "./coachReportPhaseVisualsTacticalMapCardsWarnings";

export interface CoachReportPhaseVisualsAudit {
  readonly phaseVisualCount: number;
  readonly officialPhaseVisualCount: number;
  readonly phaseVisualWithDominantZonesCount: number;
  readonly phaseVisualWithDangerZonesCount: number;
  readonly phaseVisualWithRecoveryZonesCount: number;
  readonly phaseVisualWithPressureZonesCount: number;
  readonly phaseVisualWithActionPlanLinkCount: number;
  readonly phaseVisualWithNextMatchCheckCount: number;
  readonly phaseVisualWithConfidenceCount: number;
  readonly emptyStateVisualCount: number;
  readonly unsupportedPhaseVisualCount: number;
  readonly phaseVisualsWarningCodes: readonly CoachReportPhaseVisualsTacticalMapCardsWarningCode[];
  readonly recommendation: "KEEP_PHASE_VISUALS" | "IMPROVE_PHASE_ZONE_COVERAGE" | "FIX_PHASE_VISUAL_SUPPORT";
}

export function auditCoachReportPhaseVisuals(
  phaseVisuals: readonly CoachPhaseVisualModel[],
): CoachReportPhaseVisualsAudit {
  const phaseVisualCount = phaseVisuals.length;
  const officialPhaseVisualCount = phaseVisuals.filter((visual) => visual.sourceType === "official").length;
  const phaseVisualWithDominantZonesCount = phaseVisuals.filter((visual) => visual.dominantZones.length > 0).length;
  const phaseVisualWithDangerZonesCount = phaseVisuals.filter((visual) => visual.dangerZones.length > 0).length;
  const phaseVisualWithRecoveryZonesCount = phaseVisuals.filter((visual) => visual.recoveryZones.length > 0).length;
  const phaseVisualWithPressureZonesCount = phaseVisuals.filter((visual) => visual.pressureZones.length > 0).length;
  const phaseVisualWithActionPlanLinkCount = phaseVisuals.filter((visual) => visual.actionPlanLink.length > 0).length;
  const phaseVisualWithNextMatchCheckCount = phaseVisuals.filter((visual) => visual.nextMatchCheck.length > 0).length;
  const phaseVisualWithConfidenceCount = phaseVisuals.filter((visual) => visual.confidence.length > 0).length;
  const emptyStateVisualCount = phaseVisuals.filter((visual) => visual.dominantZones.length === 0).length;
  const unsupportedPhaseVisualCount = phaseVisuals.filter((visual) =>
    visual.sourceType === "official" &&
    visual.dominantZones.length === 0 &&
    visual.limitationNote.length === 0
  ).length;
  const ready = phaseVisualCount >= 2 &&
    phaseVisualCount <= 3 &&
    officialPhaseVisualCount >= 2 &&
    phaseVisualWithActionPlanLinkCount === phaseVisualCount &&
    phaseVisualWithNextMatchCheckCount === phaseVisualCount &&
    phaseVisualWithConfidenceCount === phaseVisualCount &&
    unsupportedPhaseVisualCount === 0 &&
    (phaseVisualWithDangerZonesCount > 0 || phaseVisualWithRecoveryZonesCount > 0);
  const phaseVisualsWarningCodes: CoachReportPhaseVisualsTacticalMapCardsWarningCode[] = [
    ...(ready ? ["PHASE_VISUALS_READY" as const] : ["COACH_REPORT_PHASE_VISUALS_PARTIAL" as const]),
    ...(emptyStateVisualCount > 0 ? ["EMPTY_STATE_VISUAL_USED_CORRECTLY" as const] : []),
    ...(unsupportedPhaseVisualCount > 0 ? ["UNSUPPORTED_VISUAL_CLAIM" as const] : []),
  ];

  return {
    phaseVisualCount,
    officialPhaseVisualCount,
    phaseVisualWithDominantZonesCount,
    phaseVisualWithDangerZonesCount,
    phaseVisualWithRecoveryZonesCount,
    phaseVisualWithPressureZonesCount,
    phaseVisualWithActionPlanLinkCount,
    phaseVisualWithNextMatchCheckCount,
    phaseVisualWithConfidenceCount,
    emptyStateVisualCount,
    unsupportedPhaseVisualCount,
    phaseVisualsWarningCodes,
    recommendation: ready
      ? "KEEP_PHASE_VISUALS"
      : unsupportedPhaseVisualCount > 0
        ? "FIX_PHASE_VISUAL_SUPPORT"
        : "IMPROVE_PHASE_ZONE_COVERAGE",
  };
}
