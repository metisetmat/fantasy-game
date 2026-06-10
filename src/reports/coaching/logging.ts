import type { TacticalLogLine } from "../../systems/interactions/shared";
import type { CoachingFeedbackReport, CoachingTeamFeedback } from "./types";

function line(text: string): TacticalLogLine {
  return { text };
}

function createTeamFeedbackLogs(feedback: CoachingTeamFeedback): readonly TacticalLogLine[] {
  return [
    line(`${feedback.teamName} Tactical Feedback`),
    line("Observed identity:"),
    ...feedback.observedIdentity.map((item) => line(`- ${item}`)),
    line("What worked:"),
    ...feedback.worked.map((item) => line(`- ${item}`)),
    line("What failed:"),
    ...feedback.failed.map((item) => line(`- ${item}`)),
    line("Why:"),
    ...feedback.why.map((item) => line(`- ${item}`)),
    line("Levers to test next:"),
    ...feedback.levers.map((item) => line(`- ${item}`)),
  ];
}

export function createCoachingFeedbackLogs(report: CoachingFeedbackReport): readonly TacticalLogLine[] {
  return [
    line(""),
    line("Coaching Feedback"),
    ...report.teams.flatMap((feedback, index) => [
      ...(index === 0 ? [] : [line("")]),
      ...createTeamFeedbackLogs(feedback),
    ]),
  ];
}
