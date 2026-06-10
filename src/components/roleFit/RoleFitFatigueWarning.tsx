import type { RoleFitResult } from "../../systems/roleFit";

export type RoleFitFatigueWarningProps = {
  readonly fatigueWarning: RoleFitResult["fatigueWarning"];
  readonly testedRole: RoleFitResult["testedRole"];
};

export function RoleFitFatigueWarning({ fatigueWarning, testedRole }: RoleFitFatigueWarningProps): JSX.Element | null {
  if (fatigueWarning === undefined) {
    return null;
  }

  const goalkeeperContext =
    testedRole === "Goalkeeper / Free Safety" &&
    /goalkeeper|concentration|rebound|positioning|catch|parry|second-save|mental/i.test(fatigueWarning.explanation);

  return (
    <section className={`role-fit-fatigue role-fit-fatigue--${fatigueWarning.level.toLowerCase()}`} aria-label={`${fatigueWarning.level} fatigue warning`}>
      <h3>Fatigue warning: {fatigueWarning.level}</h3>
      <p>{fatigueWarning.explanation}</p>
      {goalkeeperContext ? (
        <p className="role-fit-fatigue__goalkeeper-note">
          Goalkeeper fatigue is read as mental readiness, concentration, positioning, rebound control, and second-save recovery rather than simple running fatigue.
        </p>
      ) : null}
    </section>
  );
}
