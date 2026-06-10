import type { RoleFitLabel } from "../../systems/roleFit";

export type RoleFitBadgeProps = {
  readonly label: RoleFitLabel | string;
};

function labelTone(label: RoleFitLabel | string): string {
  switch (label) {
    case "Natural Fit":
      return "very positive";
    case "Strong Fit":
      return "positive";
    case "Usable Fit":
      return "playable";
    case "Risky Fit":
      return "warning";
    case "Poor Fit":
      return "danger";
    default:
      return "unknown";
  }
}

export function RoleFitBadge({ label }: RoleFitBadgeProps): JSX.Element {
  const tone = labelTone(label);
  const readableLabel = tone === "unknown" ? `Unknown fit label: ${label}` : `${label}: ${tone} role fit`;

  return (
    <span className={`role-fit-badge role-fit-badge--${tone}`} aria-label={readableLabel}>
      {label} <span className="role-fit-badge__meaning">({tone})</span>
    </span>
  );
}
