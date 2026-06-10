import { readFileSync } from "node:fs";
import { join } from "node:path";

interface RoleFitCardUiCheck {
  readonly name: string;
  readonly passed: boolean;
  readonly detail: string;
}

function source(file: string): string {
  return readFileSync(join(__dirname, file), "utf8");
}

function check(name: string, passed: boolean, detail: string): RoleFitCardUiCheck {
  return { name, passed, detail };
}

const cardSource = source("RoleFitCard.tsx");
const badgeSource = source("RoleFitBadge.tsx");
const scoreSource = source("RoleFitScoreBar.tsx");
const reasonsSource = source("RoleFitReasonsList.tsx");
const risksSource = source("RoleFitRisksList.tsx");
const fatigueSource = source("RoleFitFatigueWarning.tsx");
const styleSource = source("RoleFitStyleFit.tsx");
const adviceSource = source("RoleFitAdvice.tsx");
const combinedSource = [cardSource, badgeSource, scoreSource, reasonsSource, risksSource, fatigueSource, styleSource, adviceSource].join("\n");

export const roleFitCardUiContractChecks: readonly RoleFitCardUiCheck[] = [
  check("components render JSX, not HTML strings", cardSource.includes("return (") && !combinedSource.includes("`<"), "JSX return visible"),
  check("dangerouslySetInnerHTML is absent", !combinedSource.includes("dangerouslySetInnerHTML"), "no unsafe HTML injection"),
  check("testedRole is displayed", cardSource.includes("result.testedRole"), "testedRole visible"),
  check("score and label are displayed", cardSource.includes("RoleFitScoreBar") && cardSource.includes("RoleFitBadge"), "score and label components visible"),
  check("summary is displayed", cardSource.includes("result.summary"), "summary visible"),
  check("top reasons are displayed", cardSource.includes("RoleFitReasonsList") && reasonsSource.includes("reason.explanation"), "reasons visible"),
  check("top risks are displayed", cardSource.includes("RoleFitRisksList") && risksSource.includes("affectedPhase"), "risks visible"),
  check("fatigue warning is displayed when present", cardSource.includes("RoleFitFatigueWarning") && fatigueSource.includes("mental readiness"), "fatigue warning visible"),
  check("bestPairings are displayed", cardSource.includes("bestPairings"), "best pairings visible"),
  check("styleFit is displayed", cardSource.includes("RoleFitStyleFit") && styleSource.includes("bestStyles") && styleSource.includes("riskyStyles"), "style fit visible"),
  check("developmentAdvice and coachUsageAdvice are displayed", adviceSource.includes("developmentAdvice") && adviceSource.includes("coachUsageAdvice"), "advice visible"),
  check("UI does not display a legacy public role field", !combinedSource.includes(".role") && !combinedSource.includes("result.role"), "testedRole-only public UI"),
  check("UI does not recalculate score", scoreSource.includes("score") && !combinedSource.includes("computeRoleFit"), "source score displayed"),
  check("Space Hunter offensive off-ball guardrail remains supported", !combinedSource.includes("defensive_midfielder_requirement"), "no defensive midfielder requirement"),
  check("Goalkeeper fatigue is not outfield running fatigue", fatigueSource.includes("mental readiness") && fatigueSource.includes("rebound control") && fatigueSource.includes("second-save recovery"), "GK fatigue wording protected"),
];

const failedRoleFitCardChecks = roleFitCardUiContractChecks.filter((item) => !item.passed);

if (failedRoleFitCardChecks.length > 0) {
  throw new Error(`RoleFitCard UI contract failed: ${failedRoleFitCardChecks.map((item) => `${item.name}: ${item.detail}`).join("; ")}`);
}
