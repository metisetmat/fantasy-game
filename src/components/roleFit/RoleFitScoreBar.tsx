import type { RoleFitLabel } from "../../systems/roleFit";

export type RoleFitScoreBarProps = {
  readonly score: number;
  readonly label: RoleFitLabel | string;
};

function displayScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function RoleFitScoreBar({ score, label }: RoleFitScoreBarProps): JSX.Element {
  const displayedScore = displayScore(score);
  const invalidScore = score < 0 || score > 100 || Number.isNaN(score);

  return (
    <div className="role-fit-score-bar" role="group" aria-label={`Role fit score ${displayedScore} out of 100, ${label}`}>
      <div className="role-fit-score-bar__track" aria-hidden="true">
        <div className="role-fit-score-bar__fill" style={{ width: `${displayedScore}%` }} />
      </div>
      <p className="role-fit-score-bar__text">
        {displayedScore}/100 - {label}
      </p>
      {invalidScore ? (
        <p className="role-fit-score-bar__warning">Invalid source score received; display clamped to {displayedScore}/100.</p>
      ) : null}
    </div>
  );
}
