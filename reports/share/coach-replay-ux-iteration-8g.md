# Coach Replay UX Iteration 8G

Status: PASS

## Summary
- scope: COACH_REPLAY_UX_ITERATION
- version: COACH_REPLAY_UX_ITERATION_8G
- baselineVersion: REPLAY_ACTOR_MAPPING_NATURAL_MATCH_NARRATIVE_FIX_8F
- matchId: contract-fixture-001
- officialScore: 12 - 7
- recommendation: KEEP_REPLAY_UX_ITERATION
- nextSprintRecommendation: 8H - Coach Report Story-First Product Recomposition

## Baseline Preservation
| Metric | Value |
| --- | --- |
| baseline8FPreserved | true |
| baseline8EPreserved | true |
| baseline8DPreserved | true |
| baseline8CPreserved | true |
| baseline8BPreserved | true |
| baseline8APreserved | true |
| baseline7HPreserved | true |
| baseline6XPreserved | true |

## Replay UX Hierarchy
| Metric | Value |
| --- | --- |
| replayUXSectionExists | true |
| priorityBlockExists | true |
| priorityMomentCount | 3 |
| allReplayMomentCount | 6 |
| timelineRailExists | true |
| timelineRailMomentCount | 6 |
| productReplayMomentCardCount | 6 |
| exportReplayMomentCardCount | 3 |
| priorityMomentsBeforeSecondaryMoments | true |
| sourceOfTruthNoteVisible | true |
| proofDetailsCollapsedByDefault | true |

## Priority Moments
| Minute | Score | Title | Reason | Actor / role | Zone | Proof |
| --- | --- | --- | --- | --- | --- | --- |
| 2-2' | 0 - 0 -> 3 - 0 | CONTROL frappe le premier | first_score | le Space Hunter de CONTROL / Space Hunter | axe central | Preuve officielle: 0 - 0 vers 3 - 0. |
| 19-19' | 6 - 0 -> 6 - 5 | BLITZ revient | opponent_response | le gardien-libero de BLITZ / Gardien-libero | axe central | Preuve officielle: 6 - 0 vers 6 - 5. |
| 33-33' | 9 - 7 -> 12 - 7 | CONTROL verrouille le 12-7 | final_lock | le Left Piston hybride de CONTROL / Left Piston | axe central | Preuve officielle: 9 - 7 vers 12 - 7. |

## Timeline Rail
| Minute | Score | Title | State |
| --- | --- | --- | --- |
| 2-2' | 0 - 0 -> 3 - 0 | CONTROL frappe le premier | score_change |
| 3-3' | 3 - 0 -> 3 - 0 | Fatigue visible chez BLITZ | fatigue_context |
| 15-15' | 3 - 0 -> 6 - 0 | CONTROL creuse l'ecart | response |
| 19-19' | 6 - 0 -> 6 - 5 | BLITZ revient | response |
| 25-25' | 6 - 7 -> 9 - 7 | CONTROL repasse devant | response |
| 33-33' | 9 - 7 -> 12 - 7 | CONTROL verrouille le 12-7 | final_lock |

## Evidence Disclosure
| Metric | Value |
| --- | --- |
| globalSourceOfTruthNoteVisible | true |
| replayProofNoteCount | 6 |
| proofDetailsAvailableCount | 6 |
| proofDetailsCollapsedCount | 6 |
| proofInMainTextTooLongCount | 0 |
| rawEventIdInMainTextCount | 0 |
| rawEventIdInDetailsCount | 5 |
| sourceOfTruthRepeatedSentenceCount | 1 |

## Mobile / Print Audit
| Metric | Value |
| --- | --- |
| productMobileNoHorizontalOverflow | true |
| replayCardsStackOnMobile | true |
| timelineRailMobileReadable | true |
| proofDetailsUsableOnMobile | true |
| printBreakInsideAvoided | true |
| exportPrintReady | true |
| exportUnder900Seconds | true |
| exportUnder800Seconds | true |

## Wording UX Audit
| Metric | Value |
| --- | --- |
| naturalReplayTextPreserved | true |
| actorRoleTextPreserved | true |
| technicalIdInMainTextCount | 0 |
| rawPlayerIdInMainTextCount | 0 |
| rawEventIdInMainTextCount | 0 |
| rawEffectLabelInMainTextCount | 0 |
| repeatedMomentWhyPhraseCount | 0 |
| mechanicalUXPhraseCount | 0 |
| coachReadableMomentCount | 6 |
| coachReadabilityScore | 100 |

## Source-Of-Truth Regression
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
| actorMappingStillVisible | true |
| naturalReplayStillVisible | false |
| exportReadTimeSecondsBefore8G | 740 |
| exportReadTimeSecondsAfter8G | 777 |
| exportReadTimeDelta | 37 |
| exportUnder900Seconds | true |
| exportUnder800Seconds | true |

## Product / Export Excerpts
- product 2 minutes: CONTROL frappe le premier | BLITZ revient | CONTROL verrouille le 12-7
- export 60 secondes: Trois moments structurent le match : le premier score de CONTROL, la reponse de BLITZ, puis le verrouillage final de CONTROL.

## Match Economy Preservation
| Metric | Value |
| --- | --- |
| matchEconomyBaselinePreserved | true |
| routeFamilyDiversityPreserved | true |
| guardrailsPreserved | true |
| productBaselineReady | true |

## Warnings
- REPLAY_UX_READY
- REPLAY_PRIORITY_READY
- REPLAY_TIMELINE_READY
- REPLAY_MOMENT_CARDS_READY
- REPLAY_EVIDENCE_DISCLOSURE_READY
- REPLAY_MOBILE_READY
- REPLAY_PRINT_READY
- REPLAY_EXPORT_READY
- NATURAL_NARRATIVE_PRESERVED
- SOURCE_OF_TRUTH_PRESERVED
- REPLAY_NO_NEW_TRUTH_LAYER
- COACH_REPLAY_UX_ITERATION_FAIL
- ACTOR_MAPPING_PRESERVED
- MATCH_ECONOMY_BASELINE_PRESERVED
- PRODUCT_BASELINE_READY
- COACH_REPLAY_UX_ITERATION_COMPLETE
