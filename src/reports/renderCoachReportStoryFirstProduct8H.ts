import type { CoachProductReportViewModel } from "./coachProductReportView";
import { renderCoachProductReport } from "./renderCoachProductReport";

export function renderCoachReportStoryFirstProduct8H(model: CoachProductReportViewModel): string {
  return renderCoachProductReport(model);
}
