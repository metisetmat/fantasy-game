import type { RoleFitResult } from "../../systems/roleFit";

export type RoleFitStyleFitProps = {
  readonly styleFit: RoleFitResult["styleFit"] | undefined;
};

function styleItems(values: readonly string[], fallback: string): JSX.Element {
  return (
    <ul>
      {values.length === 0 ? <li>{fallback}</li> : values.map((value) => <li key={value}>{value}</li>)}
    </ul>
  );
}

export function RoleFitStyleFit({ styleFit }: RoleFitStyleFitProps): JSX.Element {
  if (styleFit === undefined) {
    return (
      <section className="role-fit-style" aria-label="Style fit">
        <p>Style fit not available for this result.</p>
      </section>
    );
  }

  return (
    <section className="role-fit-style" aria-labelledby="role-fit-style-title">
      <h3 id="role-fit-style-title">Best usage / style fit</h3>
      <p>{styleFit.explanation}</p>
      <div className="role-fit-style__columns">
        <div>
          <h4>Best styles</h4>
          {styleItems(styleFit.bestStyles, "No best style listed yet.")}
        </div>
        <div>
          <h4>Risky styles</h4>
          {styleItems(styleFit.riskyStyles, "No risky style listed yet.")}
        </div>
      </div>
    </section>
  );
}
