import type { CoachReportExportLengthTrendCountCleanupWarningCode } from "./coachReportExportLengthTrendCountCleanupWarnings";

export interface CoachReportNoNewNarrativeLayerAudit {
  readonly teamStyleMemoryAdded: boolean;
  readonly seasonNarrativeAdded: boolean;
  readonly seasonMemoryAdded: boolean;
  readonly newHistoryEngineAdded: boolean;
  readonly newDatabaseHistoryFeatureAdded: boolean;
  readonly newScoringFeatureAdded: boolean;
  readonly noNewNarrativeLayerPreserved: boolean;
  readonly noNewLayerWarningCodes: readonly CoachReportExportLengthTrendCountCleanupWarningCode[];
  readonly recommendation: "KEEP_NO_NEW_LAYER_BOUNDARY" | "REMOVE_PREMATURE_NARRATIVE_LAYER";
}

export function auditCoachReportNoNewNarrativeLayer(input: {
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
  readonly sourceText: string;
}): CoachReportNoNewNarrativeLayerAudit {
  const text = `${input.productReportHtml}\n${input.exportReportHtml}\n${input.sourceText}`.toLocaleLowerCase("fr-FR");
  const teamStyleMemoryAdded = /team style memory|m.moire d..quipe|memoire d.equipe/u.test(text);
  const seasonNarrativeAdded = /season narrative|narrative season|r.cit de saison|narration de saison/u.test(text);
  const seasonMemoryAdded = /season memory|m.moire de saison|memoire de saison/u.test(text);
  const newHistoryEngineAdded = /new history engine|season trend engine|moteur historique saison/u.test(text);
  const newDatabaseHistoryFeatureAdded = /new database history feature|database history activated|db confirme|sqlite prouve/u.test(text);
  const newScoringFeatureAdded = /penalty shot active|nouvelle mecanique de scoring|score cap applied|rubber.?banding/u.test(text);
  const noNewNarrativeLayerPreserved = !teamStyleMemoryAdded &&
    !seasonNarrativeAdded &&
    !seasonMemoryAdded &&
    !newHistoryEngineAdded &&
    !newDatabaseHistoryFeatureAdded &&
    !newScoringFeatureAdded;

  return {
    teamStyleMemoryAdded,
    seasonNarrativeAdded,
    seasonMemoryAdded,
    newHistoryEngineAdded,
    newDatabaseHistoryFeatureAdded,
    newScoringFeatureAdded,
    noNewNarrativeLayerPreserved,
    noNewLayerWarningCodes: [
      ...(noNewNarrativeLayerPreserved ? ["NO_NEW_NARRATIVE_LAYER" as const] : ["COACH_REPORT_EXPORT_LENGTH_CLEANUP_FAIL" as const]),
      ...(teamStyleMemoryAdded ? ["TEAM_STYLE_MEMORY_ADDED_PREMATURELY" as const] : []),
      ...(seasonNarrativeAdded || seasonMemoryAdded ? ["SEASON_NARRATIVE_ADDED_PREMATURELY" as const] : []),
      ...(newHistoryEngineAdded || newDatabaseHistoryFeatureAdded ? ["NEW_HISTORY_ENGINE_ADDED_PREMATURELY" as const] : []),
      ...(newScoringFeatureAdded ? ["SCORE_MANIPULATION_DETECTED" as const] : []),
    ],
    recommendation: noNewNarrativeLayerPreserved ? "KEEP_NO_NEW_LAYER_BOUNDARY" : "REMOVE_PREMATURE_NARRATIVE_LAYER",
  };
}
