import type { RoleFitResult } from "../../systems/roleFit";
import { RoleFitFatigueWarning } from "../roleFit";

export type PlayerRoleDevelopmentPanelProps = {
  readonly result: RoleFitResult;
};

export function PlayerRoleDevelopmentPanel({ result }: PlayerRoleDevelopmentPanelProps): JSX.Element {
  const isSpaceHunter = result.testedRole === "Space Hunter";

  return (
    <section className="player-role-development-panel" aria-labelledby="player-role-development-title">
      <h2 id="player-role-development-title">Development priorities for {result.testedRole}</h2>
      <p>Risky fit for this role means contextual protection is needed; it does not mean bad player or wrong player.</p>
      {isSpaceHunter ? (
        <p>
          Space Hunter guardrail: this offensive rupture role values front-pressure effort, depth timing, and ball carrying;
          it does not require a defensive-midfielder profile.
        </p>
      ) : null}
      <div>
        <h3>Development advice</h3>
        <ul>
          {result.developmentAdvice.length === 0 ? (
            <li>No development advice available yet.</li>
          ) : (
            result.developmentAdvice.map((item) => <li key={item}>Development priority: {item}</li>)
          )}
        </ul>
      </div>
      <div>
        <h3>Role risks to protect</h3>
        <ul>
          {result.topRisks.length === 0 ? (
            <li>No major risk identified in the current context.</li>
          ) : (
            result.topRisks.map((risk) => <li key={risk.id}>{risk.severity}: {risk.explanation}</li>)
          )}
        </ul>
      </div>
      <div>
        <h3>Penalties / caps</h3>
        <ul>
          {result.penalties.length === 0 ? (
            <li>No cap or penalty is active for this role fit.</li>
          ) : (
            result.penalties.map((penalty) => <li key={penalty.id}>{penalty.label}: {penalty.explanation}</li>)
          )}
        </ul>
      </div>
      <div>
        <h3>Safest short-term usage</h3>
        <ul>
          {result.coachUsageAdvice.length === 0 ? (
            <li>No coach usage advice available yet.</li>
          ) : (
            result.coachUsageAdvice.map((item) => <li key={item}>Needs protection: {item}</li>)
          )}
        </ul>
      </div>
      <RoleFitFatigueWarning fatigueWarning={result.fatigueWarning} testedRole={result.testedRole} />
    </section>
  );
}
