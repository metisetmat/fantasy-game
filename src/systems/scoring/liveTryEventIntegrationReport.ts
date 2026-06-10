import type { MiniMatchResult } from "../../simulation/miniMatch";
import { scoringRuleLabel } from "./scoringRules";
import { tryTouchdownRuleLabel } from "./tryTouchdownRules";

export function createLiveTryEventIntegrationReport(result: MiniMatchResult): string {
  const events = result.summary.liveTryEvents;
  const scored = events.filter((event) => event.eventType === "TRY_TOUCHDOWN_SCORED");
  const failed = events.filter((event) => event.eventType !== "TRY_TOUCHDOWN_SCORED");
  const conversionRows = events.filter((event) => event.conversionGeometryStored).length;

  return [
    "# Live Try Event Integration",
    "",
    "## Summary",
    "- scope: current mini-match event stream",
    "- live event stream supports TRY_TOUCHDOWN_ATTEMPT: YES",
    "- live event stream supports TRY_TOUCHDOWN_SCORED: YES",
    `- live try attempts: ${events.length}`,
    `- current mini-match live tries scored: ${scored.length}`,
    `- current mini-match live failed try attempts: ${failed.length}`,
    `- current mini-match live conversion geometry rows: ${conversionRows}`,
    "- CONVERSION scoring active: YES",
    `- live conversion attempts: ${scored.length}`,
    `- live conversions made: 0`,
    "- conversion points awarded: 0",
    `- ${scoringRuleLabel("SHOT_GOAL")}`,
    `- ${tryTouchdownRuleLabel()}`,
    "- recommendation: KEEP_LIVE_TRY_EVENTS",
    "",
    "## Live Try Event Types",
    "- TRY_TOUCHDOWN_ATTEMPT",
    "- TRY_TOUCHDOWN_SCORED",
    "- TRY_HELD_UP",
    "- TRY_LOST_FORWARD",
    "- TRY_TACKLED_SHORT",
    "- TRY_INVALID_GROUNDING",
    "- TRY_INVALID_ACCESS_ROUTE",
    "- TRY_OUT_OF_PLAY",
    "",
    "## Current Mini-Match Try Events",
    "",
    "| sequence/action | event type | team | carrier | previous zone | current zone | legal access | outcome | scoring action | point value | conversion geometry stored | CONVERSION scoring active | reason |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...(events.length === 0
      ? ["| none | TRY_TOUCHDOWN_ATTEMPT | none | none | none | none | NO | none | NONE | 0 | NO | NO | no live TRY_TOUCHDOWN_ATTEMPT generated in current mini-match |"]
      : events.map(
          (event) =>
            `| Sequence ${event.sequenceNumber} Try Attempt | ${event.eventType} | ${event.teamName} | ${event.carrierRole} | ${event.previousZone} | ${event.currentZone} | ${event.legalAccess ? "YES" : "NO"} | ${event.outcome} | ${event.scoringAction} | ${event.pointValue} | ${event.conversionGeometryStored ? "YES" : "NO"} | YES | ${event.reason} |`,
        )),
    "",
    "## Live Conversion Attempts",
    scored.length === 0
      ? "- live conversion attempts: 0 because no live TRY_TOUCHDOWN was scored"
      : `- live conversion attempts: ${scored.length}; resolved in conversion-resolution.md`,
    "",
    "## Interpretation",
    "- The live mini-match can now carry try attempts separately from batch diagnostics.",
    "- Batch diagnostics are separate in try-touchdown-batch-diagnostics.md.",
    "- This report only describes the current mini-match live event stream.",
    "- Only TRY_TOUCHDOWN_SCORED events add active scoring points.",
    "- Failed live try attempts remain tactical events and do not change the score.",
    "- Conversion geometry is stored only for scored live tries; CONVERSION scoring is active after TRY_TOUCHDOWN.",
    "",
  ].join("\n");
}
