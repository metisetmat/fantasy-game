# Replay Actor Mapping & Natural Match Narrative Fix 8F

Status: PASS

## Summary
- scope: REPLAY_ACTOR_MAPPING_NATURAL_MATCH_NARRATIVE_FIX
- version: REPLAY_ACTOR_MAPPING_NATURAL_MATCH_NARRATIVE_FIX_8F
- baselineVersion: MATCH_STORYLINE_IMMERSION_COACH_REPLAY_VIEW_8E
- matchId: contract-fixture-001
- officialScore: 12 - 7
- recommendation: KEEP_REPLAY_ACTOR_MAPPING_NATURAL_NARRATIVE_FIX
- nextSprintRecommendation: 8G - Coach Replay UX Iteration

## Baseline Preservation
| Baseline | Preserved |
| --- | --- |
| 8E replay/source-of-truth | true |
| 8D player-role sequence causality | true |
| 8C official causality | true |
| 8B chronology | true |
| 8A story spine | true |
| 7H export cleanup | true |
| 6X match economy | true |

## Actor Mapping Fix Table
| Moment | Sequence | Before actor | Before role | After actor | After role | Source | Fallback |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 8e-moment-1 | full-match-segment-1-2 | le gardien-libero de CONTROL | Gardien-libero | le Space Hunter de CONTROL | Space Hunter | sequence_actor_contribution_8d | blocked |
| 8e-moment-2 | full-match-segment-1-3 | le gardien-libero de BLITZ | Gardien-libero | le gardien-libero de BLITZ | Gardien-libero | sequence_actor_contribution_8d | allowed |
| 8e-moment-3 | full-match-segment-2-5 | le gardien-libero de CONTROL | Gardien-libero | le Playmaker createur de CONTROL | Playmaker | sequence_actor_contribution_8d | blocked |
| 8e-moment-4 | full-match-segment-2-route-family | le gardien-libero de BLITZ | Gardien-libero | le gardien-libero de BLITZ | Gardien-libero | sequence_actor_contribution_8d | allowed |
| 8e-moment-5 | full-match-segment-3-5 | le gardien-libero de CONTROL | Gardien-libero | le Hook Link mobile de CONTROL | Hook Link | sequence_actor_contribution_8d | blocked |
| 8e-moment-6 | full-match-segment-4-3 | le gardien-libero de CONTROL | Gardien-libero | le Left Piston hybride de CONTROL | Left Piston | sequence_actor_contribution_8d | blocked |

## Natural Replay Narrative Excerpts
- 2-2' | 0 - 0 -> 3 - 0 | CONTROL frappe le premier grace au Space Hunter de CONTROL dans axe central. La sequence fait passer le score de 0 - 0 a 3 - 0.
- 3-3' | 3 - 0 -> 3 - 0 | La fatigue apparait dans une sequence de BLITZ, mais son effet reste a confirmer. Le moment sert surtout a relire la stabilite et le soutien.
- 15-15' | 3 - 0 -> 6 - 0 | Le Playmaker createur de CONTROL transforme une sequence dans axe central en points: 3 - 0 devient 6 - 0.
- 19-19' | 6 - 0 -> 6 - 5 | BLITZ reste dans le match avec le gardien-libero de BLITZ dans axe central: 6 - 0 devient 6 - 5.
- 25-25' | 6 - 7 -> 9 - 7 | Le Hook Link mobile de CONTROL transforme une sequence dans axe central en points: 6 - 7 devient 9 - 7.
- 33-33' | 9 - 7 -> 12 - 7 | Le Left Piston hybride de CONTROL conclut la derniere sequence de score dans axe central et fixe le 12 - 7.

## Replay Proof Notes
- 8e-moment-1: Preuve: score_change officiel 0 - 0 vers 3 - 0. Events: contract-fixture-001-segment-1-score-1
- 8e-moment-2: Preuve: aucun score_change dans ce moment; lecture contextuelle. Events: contract-fixture-001-segment-1-sequence-3
- 8e-moment-3: Preuve: score_change officiel 3 - 0 vers 6 - 0. Events: contract-fixture-001-segment-2-score-1
- 8e-moment-4: Preuve: score_change officiel 6 - 0 vers 6 - 5. Events: segment-2-route-family-try_touchdown-blitz
- 8e-moment-5: Preuve: score_change officiel 6 - 7 vers 9 - 7. Events: contract-fixture-001-segment-3-score-1
- 8e-moment-6: Preuve: score_change officiel 9 - 7 vers 12 - 7. Events: contract-fixture-001-segment-4-score-1

## Actor Mapping Audit
| Metric | Value |
| --- | --- |
| replayMomentCount | 6 |
| actorMappingFixCount | 4 |
| actorMappingPreservedFrom8DCount | 6 |
| suspiciousGoalkeeperFallbackBeforeCount | 4 |
| suspiciousGoalkeeperFallbackAfterCount | 0 |
| goalkeeperFallbackAllowedCount | 2 |
| goalkeeperFallbackBlockedCount | 4 |
| actorMismatchWith8DCount | 0 |
| roleMismatchWith8DCount | 0 |
| roleDiversityCount | 5 |
| roleDiversityRestored | true |

## Natural Replay Narrative Audit
| Metric | Value |
| --- | --- |
| naturalReplayLineCount | 6 |
| technicalIdInMainTextCount | 0 |
| rawPlayerIdInMainTextCount | 0 |
| rawEventIdInMainTextCount | 0 |
| rawEffectLabelInMainTextCount | 0 |
| repeatedGuardrailPhraseCount | 0 |
| mechanicalPhraseCount | 0 |
| actionVerbsCount | 11 |
| coachReadableMomentCount | 6 |
| narrativeFlowScore | 96 |
| immersionScore | 94 |
| coachReadabilityScore | 98 |

## Replay Proof Compaction Audit
| Metric | Value |
| --- | --- |
| globalSourceOfTruthNoteVisible | true |
| proofNoteCount | 6 |
| proofNoteLinkedToOfficialEventCount | 6 |
| proofInMainTextTooLongCount | 0 |
| repeatedSourceOfTruthSentenceCount | 0 |
| sourceOfTruthCompacted | true |

## Replay Score Source-Of-Truth Regression Audit
| Metric | Value |
| --- | --- |
| replayScoreMatchesOfficialScore | true |
| allReplayScoreClaimsBackedByScoreChange | true |
| scoreChangeEventsCoveredByReplayCount | 6 |
| scoreChangeEventCount | 6 |
| sandboxReplayMomentInOfficialTimelineCount | 0 |
| inventedReplayMomentCount | 0 |
| unsupportedTruthClaimCount | 0 |
| noScoreMutation | true |
| noEventDeletion | true |

## Report Integration Budget
| Metric | Value |
| --- | --- |
| productReplaySectionVisible | true |
| exportReplaySectionVisible | true |
| productStoryStillVisible | true |
| exportStoryStillVisible | true |
| actionPlanStillVisible | true |
| tacticalMapCardsStillVisible | true |
| trendsStillVisible | true |
| sequenceCausalityStillVisible | true |
| exportReadTimeSecondsBefore8F | 703 |
| exportReadTimeSecondsAfter8F | 746 |
| exportUnder900Seconds | true |
| exportUnder800Seconds | true |
| productReplayMomentCardCount | 6 |
| exportReplayMomentCardCount | 3 |

## Guardrails
| Guardrail | Status |
| --- | --- |
| scoring constants unchanged | true |
| MatchBonusEvent unchanged | true |
| batch/live separation preserved | true |
| match economy baseline preserved | true |
| guardrails preserved | true |
| product baseline ready | true |

## Warnings
- ACTOR_MAPPING_FIXED
- ROLE_DIVERSITY_RESTORED
- GOALKEEPER_FALLBACK_CONTROLLED
- NATURAL_REPLAY_NARRATIVE_READY
- SOURCE_OF_TRUTH_NOTE_COMPACTED
- REPLAY_PROOF_COMPACTION_READY
- SOURCE_OF_TRUTH_PRESERVED
- PRODUCT_REPLAY_SECTION_UPDATED
- EXPORT_REPLAY_SECTION_UPDATED
- EXPORT_LENGTH_PRESERVED
- MATCH_ECONOMY_BASELINE_PRESERVED
- PRODUCT_BASELINE_READY
- REPLAY_ACTOR_MAPPING_NATURAL_NARRATIVE_FIX_COMPLETE
