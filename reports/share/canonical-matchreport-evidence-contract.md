# Canonical MatchReport Evidence Contract

Sprint 2P aligns the public MatchReport around canonical typed evidence instead of HTML-derived interpretation.

## What Changed
- MatchReport now exposes `evidenceFacts`, `warnings`, and `reportMeta` as typed contract fields.
- Coach insights, key moments, tactical diagnoses, and report warnings reference canonical timeline events and evidence facts.
- Full-match harness warnings remain warning-only and are represented as structured `MatchReportWarning` values.
- The coach HTML consumes typed warnings directly instead of reverse-engineering meaning from rendered copy.

## Canonical Fields
- `MatchReport.evidenceFacts`: tactical facts with category, scope, eventIds, affectedZones, confidence, and strength.
- `MatchReport.warnings`: coach-visible or internal warning objects with technical summaries and linked evidence facts.
- `MatchReport.reportMeta`: report scope, generator version, source-of-truth note, and known limitations.

## Evidence Categories
- SCORING_CONVERSION
- DANGER_CREATION
- PRESSURE_WITHOUT_CONVERSION
- POSSESSION_INSTABILITY
- TERRITORIAL_PRESSURE
- FATIGUE_LOAD
- MOMENTUM_SHIFT
- TACTICAL_PLAN_SIGNAL
- HARNESS_PLAUSIBILITY_WARNING

## Warning Scopes
- Coach-visible summaries stay readable and do not claim global scoring imbalance from a single deterministic harness run.
- Technical summaries may preserve internal scope names such as `FULL_MATCH_HARNESS_SINGLE_RUN` for validation and debugging.
- `mayInvalidateGlobalScoringEconomy` remains false for all harness warnings.

## Preserved Source Of Truth
- SHOT_GOAL = 3, TRY_TOUCHDOWN = 5, CONVERSION_GOAL = 2, DROP_GOAL = 2, PENALTY_SHOT inactive.
- Final score remains derived only from score_change consequences.
- MatchBonusEvent was not mutated.
- Batch/live separation remains preserved.

## Mandatory Diagnosis
- Are canonical evidenceFacts generated from typed timeline data? YES.
- Are warnings generated as structured MatchReportWarning values? YES.
- Does reportMeta declare the single-run harness scope? YES.
- Do key moments and warnings resolve to existing evidence facts and timeline events? YES.
- Does the HTML report consume typed warnings? YES.
- Is a single runFullMatch output warning-only for global economy? YES.
- Is the 50-match economy still protected as the global reference? YES.
- Were scoring values changed? NO.
- Were scoring events deleted or capped? NO.
- Was MatchBonusEvent mutated? NO.

## Recommendations
- CONFIRM_CANONICAL_MATCHREPORT_EVIDENCE_CONTRACT
- CONFIRM_STRUCTURED_REPORT_WARNINGS
- CONFIRM_FULL_MATCH_HARNESS_WARNING_ONLY
- KEEP_SCORING_VALUES_UNCHANGED
- KEEP_SOURCE_OF_TRUTH_GUARDRAILS
- PREPARE_NEXT_SIMULATION_SPRINT_WITH_TYPED_REPORT_EVIDENCE
