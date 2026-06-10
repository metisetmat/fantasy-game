import type { FitReason } from "../../systems/roleFit";

export type RoleFitReasonsListProps = {
  readonly reasons: readonly FitReason[];
};

export function RoleFitReasonsList({ reasons }: RoleFitReasonsListProps): JSX.Element {
  return (
    <section className="role-fit-reasons" aria-labelledby="role-fit-reasons-title">
      <h3 id="role-fit-reasons-title">Top strengths</h3>
      <ul>
        {reasons.length === 0 ? (
          <li>No major strength signal available yet.</li>
        ) : (
          reasons.map((reason) => (
            <li className="role-fit-reason" key={reason.id}>
              <strong>{reason.label}</strong>
              <p>{reason.explanation}</p>
              <p>
                Signal: {reason.type}. Impact: {reason.impact}.
              </p>
              {reason.evidence.length > 0 ? <p className="role-fit-reason__evidence">Evidence: {reason.evidence.join("; ")}</p> : null}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
