import { ScoringType } from "../../../models/scoring";
import { FinishingDecision, FinishingOutcome } from "./types";
import { getFinishingOutputReportLine } from "./finishingOutputTaxonomy";

function assertDoesNotContain(text: string, forbidden: readonly string[]): void {
  for (const word of forbidden) {
    if (text.toLowerCase().includes(word.toLowerCase())) {
      throw new Error(`Unexpected scoring wording "${word}" in "${text}"`);
    }
  }
}

const common = {
  goalkeeperInvolved: true,
  groundingZone: "Z8-C",
  defenderLabel: "GK (Goalkeeper / Free Safety)",
  finisherLabel: "PM (Playmaker)",
};

const goal = getFinishingOutputReportLine({
  ...common,
  decision: FinishingDecision.GoalAttempt,
  scoringType: ScoringType.Goal,
  outcome: FinishingOutcome.GoalScored,
}).reportLine;
assertDoesNotContain(goal, ["Try scored", "grounded", "conversion"]);

const tryAttempt = getFinishingOutputReportLine({
  ...common,
  decision: FinishingDecision.TryAttempt,
  scoringType: ScoringType.Try,
  outcome: FinishingOutcome.TryScored,
}).reportLine;
assertDoesNotContain(tryAttempt, ["below crossbar"]);

const drop = getFinishingOutputReportLine({
  ...common,
  decision: FinishingDecision.DropAttempt,
  scoringType: ScoringType.Drop,
  outcome: FinishingOutcome.DropScored,
}).reportLine;
assertDoesNotContain(drop, [
  "Goal scored",
  "Try scored",
]);

const conversion = getFinishingOutputReportLine({
  ...common,
  decision: FinishingDecision.GoalAttempt,
  scoringType: ScoringType.Conversion,
  outcome: FinishingOutcome.GoalScored,
}).reportLine;

if (!conversion.toLowerCase().includes("conversion")) {
  throw new Error("Conversion wording must appear for conversion attempts.");
}
