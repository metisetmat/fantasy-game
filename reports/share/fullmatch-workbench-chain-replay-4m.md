# FullMatch Workbench Chain Replay 4M

Sprint 4M turns Selection Preview into concrete coach-readable profile cards. The cards name role families, useful attributes, expected benefits, tactical risks, and next-match signals while staying non-applied and non-official.

## Default Mode
- default runFullMatch remains segment_harness.
- default coach report hides Selection Preview profile cards.

## Experimental Mode
- experimental mode remains opt-in.
- Selection Preview Coach Copy status: available.
- Selection Preview Profile View status: available.
- evidence category: WORKBENCH_CHAIN_SELECTION_PREVIEW_PROFILE_VIEW.
- profile card count: 3.

## Profile Cards
- support_near_z4_hsr_profile: soutien proche autour des zones de danger.
- second_ball_presence_profile: présence sur second ballon.
- strong_goalkeeper_response_profile: réponse face à un gardien fort.
- role family count: 11.
- useful attribute count: 13.
- expected benefit count: 9.
- tactical risk count: 9.
- next-match signal count: 9.

## Visible Copy
- visible role families use French labels.
- visible useful attributes use French labels.
- internal status leak count: 0.
- internal role id leak count: 0.
- internal attribute id leak count: 0.
- forbidden official selection wording count: 0.

## Guardrails
- officially-confirmed count: 0.
- confidence upgrade count: 0.
- preview applied count: 0.
- diagnostic aggregates kept separate.
- sandbox aggregates kept separate.
- official aggregates used as support only.
- timeline mutation count: 0.
- score mutation count: 0.
- possession mutation count: 0.
- production scoring event creation count: 0.
- global economy claim count: 0.
- scoring constants unchanged.
- source-of-truth unchanged.
- FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.

## Profile Context
- validation profile count: 6
- profile variation detected: YES
- report variation detected: YES

## Test Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share
