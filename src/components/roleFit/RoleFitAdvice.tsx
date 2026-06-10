export type RoleFitAdviceProps = {
  readonly coachUsageAdvice: readonly string[];
  readonly developmentAdvice: readonly string[];
};

function adviceItems(values: readonly string[], fallback: string): JSX.Element {
  return (
    <ul>
      {values.length === 0 ? <li>{fallback}</li> : values.map((value) => <li key={value}>{value}</li>)}
    </ul>
  );
}

export function RoleFitAdvice({ coachUsageAdvice, developmentAdvice }: RoleFitAdviceProps): JSX.Element {
  return (
    <section className="role-fit-advice" aria-labelledby="role-fit-advice-title">
      <h3 id="role-fit-advice-title">Coach advice</h3>
      <div>
        <h4>How to use this player now</h4>
        {adviceItems(coachUsageAdvice, "No coach usage advice available yet.")}
      </div>
      <div>
        <h4>How to make this fit safer</h4>
        {adviceItems(developmentAdvice, "No development advice available yet.")}
      </div>
    </section>
  );
}
