# Scoring Model

## Current implementation - V1

Score unit:
- POINTS

V1 scoring rules:
- SHOT_GOAL = 3 points
- SHOT_MISSED = 0 points
- SHOT_SAVED = 0 points
- SHOT_BLOCKED = 0 points
- SHOT_OUT_OF_PLAY = 0 points

Design intent:
- A shot goal is valuable but not enough to dominate the whole scoring system.
- The ball can be played by hand and foot, but only a foot shot can currently produce a SHOT_GOAL.
- V1 focuses on making shot outcomes and score traceability reliable before adding more scoring types.

## Target model - V2

<!-- Search compatibility: Target model â€” V2 -->

Future scoring actions:
- SHOT_GOAL = 3 points
- TRY / TOUCHDOWN = 5 points
- CONVERSION = 2 points
- DROP_GOAL = 2 points
- PENALTY_SHOT = 3 points, only if fouls and penalties are implemented

Design intent:
- SHOT_GOAL rewards creating a shooting window.
- TRY / TOUCHDOWN rewards deep territorial domination and ball carrying.
- CONVERSION creates a post-try skill test.
- DROP_GOAL gives a pressure-release scoring tool, but should be less valuable than a try.
- PENALTY_SHOT should only exist when fouls and advantage are mature.

## Possible V3 extensions

Do not implement yet:
- long-range shot bonus
- zone-based point modifiers
- under-pressure bonus
- style-based score modifiers
- combo/assist bonuses

Important:
V3 modifiers should improve player/team evaluation, not necessarily the scoreboard.
Prefer awarding XP, reputation, or tactical grade bonuses rather than changing match score too much.

## Naming convention

Use:
- SHOT_GOAL for a successful foot shot at goal.
- TRY for a grounded ball behind the goal line.
- DROP_GOAL for a legal drop-style score.
- CONVERSION for post-try conversion.
- PENALTY_SHOT for a foul-based scoring attempt.

Avoid generic:
- GOAL

unless used strictly as a low-level ballOutcome value.
