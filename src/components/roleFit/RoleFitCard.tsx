import type { RoleFitResult } from "../../systems/roleFit";
import { RoleFitAdvice } from "./RoleFitAdvice";
import { RoleFitBadge } from "./RoleFitBadge";
import { RoleFitFatigueWarning } from "./RoleFitFatigueWarning";
import { RoleFitReasonsList } from "./RoleFitReasonsList";
import { RoleFitRisksList } from "./RoleFitRisksList";
import { RoleFitScoreBar } from "./RoleFitScoreBar";
import { RoleFitStyleFit } from "./RoleFitStyleFit";

export type RoleFitCardProps = {
  readonly result: RoleFitResult;
};

function pairings(result: RoleFitResult): JSX.Element {
  return (
    <ul>
      {result.bestPairings.length === 0 ? <li>No pairing guidance available yet.</li> : result.bestPairings.map((role) => <li key={role}>{role}</li>)}
    </ul>
  );
}

export function RoleFitCard({ result }: RoleFitCardProps): JSX.Element {
  return (
    <article className="role-fit-card" aria-label={`Role fit for ${result.playerName} as ${result.testedRole}`}>
      <header className="role-fit-card__header">
        <div>
          <h2>{result.playerName}</h2>
          <p className="role-fit-card__role">Tested role: {result.testedRole}</p>
        </div>
        <RoleFitBadge label={result.label} />
      </header>
      <RoleFitScoreBar score={result.score} label={result.label} />
      <section className="role-fit-card__summary" aria-label="Role fit summary">
        <p>{result.summary.trim().length === 0 ? "No role fit summary available yet." : result.summary}</p>
      </section>
      <RoleFitReasonsList reasons={result.topReasons} />
      <RoleFitRisksList risks={result.topRisks} />
      <RoleFitFatigueWarning fatigueWarning={result.fatigueWarning} testedRole={result.testedRole} />
      <RoleFitStyleFit styleFit={result.styleFit} />
      <section className="role-fit-card__pairings" aria-labelledby={`role-fit-pairings-title-${result.playerId}`}>
        <h3 id={`role-fit-pairings-title-${result.playerId}`}>Best pairings</h3>
        {pairings(result)}
      </section>
      <RoleFitAdvice coachUsageAdvice={result.coachUsageAdvice} developmentAdvice={result.developmentAdvice} />
    </article>
  );
}
