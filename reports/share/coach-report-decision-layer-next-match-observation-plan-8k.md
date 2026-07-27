# Coach Report Decision Layer & Next-Match Observation Plan 8K

Status: PASS

## Summary
| Metric | Value |
| --- | --- |
| scope | COACH_REPORT_DECISION_LAYER_NEXT_MATCH_OBSERVATION_PLAN |
| version | COACH_REPORT_DECISION_LAYER_NEXT_MATCH_OBSERVATION_PLAN_8K |
| baselineVersion | STORY_FIRST_EXPORT_BUDGET_VALIDATION_THRESHOLD_FIX_8I |
| matchId | contract-fixture-001 |
| officialScore | 12 - 7 |
| recommendation | KEEP_DECISION_LAYER_OBSERVATIONAL |
| nextSprintRecommendation | 8L - Coach Report Seasonless Learning Loop & Observation Outcome Tracker |

## Baseline 8J / 8I Summary
| Metric | Value |
| --- | --- |
| baseline8J preserved | false |
| baseline8I preserved | true |
| exportReadTimeSecondsAfter8I | 309 |
| exportActionPlanCardCount | 3 |
| numericThresholdGuardPreserved | true |

## Baseline Preservation 8H To 6X
| Metric | Value |
| --- | --- |
| baseline8H preserved | true |
| baseline8G preserved | true |
| baseline8F preserved | true |
| baseline8E preserved | true |
| baseline8D preserved | true |
| baseline8C preserved | true |
| baseline8B preserved | true |
| baseline8A preserved | true |
| baseline7H preserved | true |
| baseline6X match economy preserved | true |

## Decision Layer Summary
| Metric | Value |
| --- | --- |
| decisionLayerReady | true |
| nextMatchObservationPlanReady | true |
| confirmationCriteriaReady | true |
| disconfirmationCriteriaReady | true |
| coachDecisionBoundariesReady | true |
| decisionWordingClean | true |
| productRawIdCleanupReady | true |
| exportReplayWordingCleanupReady | true |

## Decision Cards
| Priority | Title | Question | Confirm | Disconfirm | Risk | Boundary |
| --- | --- | --- | --- | --- | --- | --- |
| primary | Securiser la premiere sortie apres recuperation | La premiere sortie apres recuperation devient-elle plus propre ? | Moins de pertes immediates apres recuperation et une possession qui reste controlee. | Recuperation suivie d'une perte, d'un tir isole ou d'une sortie sous pression sans relais. | Soutien trop proche qui ralentit la projection ou expose la rest-defense. | Piste issue du replay et des cartes tactiques ; elle n'impose ni joueur, ni composition, ni systeme. |
| secondary | Transformer les zones de danger en continuite | Les entrees en zone dangereuse produisent-elles une deuxieme action controlee ? | Progression + soutien + seconde action controlee dans la meme phase. | Action coupee, tir precipite ou recuperation adverse avant le relais. | Ralentir l'attaque ou perdre la profondeur en cherchant trop de securite. | Observation officielle limitee au match courant, completee par tendances prudentes non decisives. |
| watch | Garder une structure apres pression, tir ou arret | L'equipe reste-t-elle organisee apres une action neutralisee ? | Second ballon protege ou rest-defense stabilisee apres l'action neutralisee. | Rebond central adverse, transition encaissee ou desorganisation visible. | Sur-engagement et fatigue si trop de joueurs chassent le meme ballon. | Signal d'observation ; le sandbox et les diagnostics restent exclus du recit officiel. |

## Next-Match Observation Items
| Item | When | Where | Positive signal | Negative signal | Minimum evidence |
| --- | --- | --- | --- | --- | --- |
| Apres recuperation | after_recovery | Zone de recuperation et premier relais proche. | Recuperation suivie d'une passe simple ou d'un porteur stabilise. | Perte immediate, tir isole ou soutien en retard. | Au moins trois recuperations comparables dans le prochain match. |
| Apres entree en zone dangereuse | after_danger_entry | Couloir d'entree, axe central et soutien de second ballon. | Progression, soutien, puis nouvelle action controlee. | Action coupee ou recuperation adverse avant le relais. | Plusieurs entrees dangereuses avec contexte de pression similaire. |
| Apres pression, tir ou arret | after_pressure | Autour du second ballon et de l'axe central. | Second ballon protege ou bloc reorganise. | Rebond central adverse ou transition encaissee. | Au moins deux actions neutralisees sous pression comparable. |

## Confirmation / Disconfirmation Matrix
| Decision | Confirmation | Disconfirmation |
| --- | --- | --- |
| Securiser la premiere sortie apres recuperation | Moins de pertes immediates apres recuperation et une possession qui reste controlee. | Recuperation suivie d'une perte, d'un tir isole ou d'une sortie sous pression sans relais. |
| Transformer les zones de danger en continuite | Progression + soutien + seconde action controlee dans la meme phase. | Action coupee, tir precipite ou recuperation adverse avant le relais. |
| Garder une structure apres pression, tir ou arret | Second ballon protege ou rest-defense stabilisee apres l'action neutralisee. | Rebond central adverse, transition encaissee ou desorganisation visible. |

## Replay / Action / Tactical Links
| Decision | Replay | Action plan | Tactical map / trend |
| --- | --- | --- | --- |
| Securiser la premiere sortie apres recuperation | coach-replay-8e | coach-action-plan | tactical-map-cards, multi-match-trend-signals |
| Transformer les zones de danger en continuite | coach-replay-8e | coach-action-plan | tactical-map-cards, multi-match-trend-signals |
| Garder une structure apres pression, tir ou arret | coach-replay-8e | coach-action-plan | tactical-map-cards, multi-match-trend-signals |

## Decision Boundary Audit
| Metric | Value |
| --- | --- |
| selectionImpositionCount | 0 |
| tacticalPlanImpositionCount | 0 |
| automaticLineupRecommendationCount | 0 |
| sandboxPromotionCount | 0 |
| diagnosticPromotionCount | 0 |
| batchPromotionCount | 0 |
| overclaimCount | 0 |
| boundaryNotesVisible | true |

## Wording Cleanup Audit
| Metric | Value |
| --- | --- |
| replayExportDuplicateTitleCount | 0 |
| replayExportTruncatedSentenceCount | 0 |
| replayExportMechanicalPhraseCount | 0 |
| productRawIdMainTextCountBefore8K | 0 |
| productRawIdMainTextCountAfter8K | 0 |
| rawEventIdInProductMainTextCount | 0 |
| rawPlayerIdInProductMainTextCount | 0 |
| rawEffectLabelInProductMainTextCount | 0 |
| decisionLayerCoachReadabilityScore | 96 |

## Export Budget
| Metric | Value |
| --- | --- |
| exportReadTimeSecondsBefore8K | 323 |
| exportReadTimeSecondsAfter8K | 323 |
| exportReadTimeDelta | 0 |
| exportUnder900Seconds | true |
| exportUnder800Seconds | true |
| exportUnder900BooleanCorrect | true |
| exportUnder800BooleanCorrect | true |
| exportedObservationItemsCount | 3 |

## Source-Of-Truth Regression
| Metric | Value |
| --- | --- |
| reportUsesOfficialTimelineOnlyForOfficialStory | true |
| reportUsesOfficialScoreOnlyForOfficialScore | true |
| reportScoreMatchesOfficialScore | true |
| allStoryScoreClaimsBackedByScoreChange | true |
| allReplayScoreClaimsBackedByScoreChange | true |
| decisionLayerScoreClaimsBackedByScoreChange | true |
| sandboxDecisionPromotionCount | 0 |
| diagnosticDecisionPromotionCount | 0 |
| batchDecisionPromotionCount | 0 |
| noScoreMutation | true |
| noEventDeletion | true |

## Integration Budget
| Metric | Value |
| --- | --- |
| productDecisionLayerVisible | true |
| exportDecisionLayerVisible | true |
| productStoryFirstSectionVisible | true |
| exportStoryFirstSectionVisible | true |
| productReplaySectionVisible | true |
| exportReplaySectionVisible | true |
| productActionPlanVisible | true |
| exportActionPlanVisible | true |
| tacticalMapCardsStillVisible | true |
| sourceOfTruthNoteVisible | true |
| exportCompactPreserved | true |

## Match Economy Preservation
| Metric | Value |
| --- | --- |
| averageTotalPointsAfter | 22.2 |
| scoringEventsPerMatchAfter | 7.2 |
| scoringOpportunitiesPerMatchAfter | 16.3 |
| closeGameRateAfter | 50 |
| competitiveGameRateAfter | 78 |
| blowoutRateAfter | 14 |
| severeBlowoutRateAfter | 0 |
| routeFamilyDiversityPreserved | true |
| guardrailsPreserved | true |

## Product / Export Excerpts
- Product decision layer: "premium-section coach-decision-layer-8k" data-decision-layer-version="8K"> <h2>Decider quoi observer au prochain match</h2> <p>Le rapport ne propose pas une composition automatique. Il transforme le match en trois hypotheses d'observation pour le prochain match.</p> <h3>Priorites d'observation</h3> <div class="product-card-grid"><article class="product-card coach-decision-card-8k" data-decision-card-id="decision-first-exit-after-recovery-8k" data-priority="primary"><p class="eyebrow">Priorite principale</p><h3>Securiser la première sortie après récupération</h3><p><strong>Question coach :</st
- Export observation layer: m-section coach-decision-layer-export-8k" data-decision-layer-version="8K"> <h2>A observer au prochain match</h2> <div class="grid"> <article class="card observation-export-card-8k" data-decision-card-id="decision-first-exit-after-recovery-8k"><h3>Securiser la première sortie après récupération</h3><p>Observer les deux premières secondes après récupération : soutien disponible, passe simple, orientation du porteur.</p><p><strong>Confirme si :</strong> Moins de pertes immediates après récupération et une possession qui reste controlee.</p><p><strong>Infirme si :</strong> Recuperation suivie d&#
- Cleaned replay export: class="premium-section coach-replay-export-8g" data-replay-ux-version="8G"> <h2>Replay coach en 60 secondes</h2> <ul class="compact-list"><li>CONTROL frappe le premier grace au Space Hunter dans l'axe central : 0-0 vers 3-0. Acteur / role: le Space Hunter de CONTROL / Space Hunter. Preuve officielle: 0 - 0 vers 3 - 0.</li><li>BLITZ repond grace a une sequence liee au gardien-libero : 6-0 vers 6-5. Acteur / role: le gardien-libero de BLITZ / Gardien-libero. Preuve officielle: 6 - 0 vers 6 - 5.</li><li>CONTROL verrouille le 12-7 avec le Left Piston hybride dans l'axe central. Acteur / role: le L

## Warnings
- SOURCE_OF_TRUTH_PRESERVED
- DECISION_LAYER_READY
- NEXT_MATCH_OBSERVATION_PLAN_READY
- CONFIRMATION_CRITERIA_READY
- DISCONFIRMATION_CRITERIA_READY
- COACH_DECISION_BOUNDARIES_READY
- REPLAY_DECISION_LINKS_READY
- TACTICAL_MAP_DECISION_LINKS_READY
- ACTION_PLAN_DECISION_LINKS_READY
- DECISION_WORDING_CLEAN
- PRODUCT_RAW_ID_CLEANUP_READY
- EXPORT_REPLAY_WORDING_CLEANUP_READY
- PRODUCT_STORY_FIRST_PRESERVED
- EXPORT_COMPACT_PRESERVED
- EXPORT_UNDER_900_READY
- EXPORT_UNDER_800_READY
- NUMERIC_THRESHOLD_GUARD_PRESERVED
- MATCH_ECONOMY_BASELINE_PRESERVED
- PRODUCT_BASELINE_READY
- COACH_REPORT_DECISION_LAYER_NEXT_MATCH_OBSERVATION_PLAN_COMPLETE

## Exhaustive Validation Command
npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share

## Recommendation
- KEEP_DECISION_LAYER_OBSERVATIONAL
- 8L - Coach Report Seasonless Learning Loop & Observation Outcome Tracker