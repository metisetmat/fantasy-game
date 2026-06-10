export const VALIDATED_FULL_MATCH_ECONOMY_ANCHOR = {
  source: "FULL_MATCH_BATCH_ECONOMY",
  matchesSimulated: 50,
  offensivePossessionsPerMatch: 30,
  dangerPhasesPerMatch: 43.5,
  scoringEventsPerMatch: 7,
  observedNilNilRate: 0.04,
  averageTotalPoints: 33,
  medianTotalPoints: 29,
  uniqueFinalScores: 38,
  metaRisks: [],
  status: "VALIDATED",
} as const;

// A single deterministic runFullMatch harness output must not invalidate this anchor.
// Only a new batch full-match economy validation with comparable or better sample size can supersede it.
