import type { TryTerminologyContract } from "./tryTerminologyTypes";

export const TRY_REPORT_TERMINOLOGY_CONTRACT: TryTerminologyContract = {
  scopes: [
    {
      scope: "CURRENT_MINI_MATCH",
      labels: [
        "current mini-match try attempts",
        "current mini-match tries scored",
        "current mini-match failed try attempts",
        "current mini-match points from tries",
      ],
    },
    {
      scope: "LIVE_EVENT_STREAM",
      labels: [
        "live try attempts",
        "live tries scored",
        "live failed try attempts",
        "live conversion geometry rows",
        "live conversion points awarded",
      ],
    },
    {
      scope: "BATCH_DIAGNOSTICS",
      labels: [
        "batch try opportunities",
        "batch try attempts",
        "batch tries scored",
        "batch try scoring rate",
        "batch points from tries",
        "batch share of points from tries",
      ],
    },
    {
      scope: "FOUNDATION_STATUS",
      labels: [
        "TRY_TOUCHDOWN foundation active: YES",
        "TRY_TOUCHDOWN active scoring rule: 5 points",
        "CONVERSION scoring active: YES",
        "DROP_GOAL scoring active: YES",
        "PENALTY_SHOT scoring active: NO",
      ],
    },
    {
      scope: "CONVERSION_GEOMETRY",
      labels: [
        "conversion geometry storage active: YES",
        "conversion geometry stored",
        "missing conversion geometry rows",
        "conversion angle difficulty",
        "recommended conversion point",
      ],
    },
    {
      scope: "CONVERSION_SCORING",
      labels: [
        "CONVERSION scoring active: YES",
        "conversion points awarded",
      ],
    },
  ],
  forbiddenPhrases: [
    "try conversion rate",
    "try/touchdown attempts: 0",
    "try/touchdowns scored: 0",
    "conversion active: YES",
    "PENALTY_SHOT scoring active: YES",
  ],
  requiredPhrases: [
    "try scoring rate",
    "CONVERSION scoring active: YES",
    "conversion geometry storage",
  ],
};
