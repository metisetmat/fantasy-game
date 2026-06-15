export type ScoreSourceKind =
  | "full_match_report"
  | "official_report_events"
  | "live_scoring_events_sample"
  | "batch_diagnostic";

export interface ScoreSourceLabel {
  readonly kind: ScoreSourceKind;
  readonly label: string;
  readonly compactNote: string;
  readonly separatesBatchAndLive: true;
  readonly canMutateScore: false;
}

export function scoreSourceLabel(kind: ScoreSourceKind): ScoreSourceLabel {
  switch (kind) {
    case "full_match_report":
      return {
        kind,
        label: "Score du rapport full-match",
        compactNote:
          "Le score affiché correspond au rapport full-match généré pour ce run. Les diagnostics batch et les échantillons de scoring-events restent séparés et ne remplacent pas ce score.",
        separatesBatchAndLive: true,
        canMutateScore: false,
      };
    case "official_report_events":
      return {
        kind,
        label: "Score issu des événements officiels du rapport",
        compactNote:
          "Ce score est dérivé des conséquences score_change du rapport courant; il ne lit pas les diagnostics batch comme un score officiel.",
        separatesBatchAndLive: true,
        canMutateScore: false,
      };
    case "live_scoring_events_sample":
      return {
        kind,
        label: "Échantillon live scoring-events",
        compactNote:
          "Ce fichier décrit le flux live ScoringEvents de référence. Il reste distinct du score affiché par le rapport full-match si les deux échantillons ne représentent pas le même run.",
        separatesBatchAndLive: true,
        canMutateScore: false,
      };
    case "batch_diagnostic":
      return {
        kind,
        label: "Diagnostic batch séparé",
        compactNote:
          "Les diagnostics batch surveillent l'économie globale et ne remplacent jamais le score d'un rapport full-match unique.",
        separatesBatchAndLive: true,
        canMutateScore: false,
      };
  }
}
