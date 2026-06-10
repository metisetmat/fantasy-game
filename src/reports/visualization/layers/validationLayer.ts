export interface TruthAttributeInput {
  readonly layer: string;
  readonly truthType: string;
  readonly source: string;
  readonly timelineEventId: string;
  readonly playerId?: string | null | undefined;
  readonly teamId?: string | null | undefined;
  readonly zone?: string | null | undefined;
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function truthAttributes(input: TruthAttributeInput): string {
  return [
    `data-layer="${escapeAttribute(input.layer)}"`,
    `data-truth-type="${escapeAttribute(input.truthType)}"`,
    `data-source="${escapeAttribute(input.source)}"`,
    `data-timeline-event-id="${escapeAttribute(input.timelineEventId)}"`,
    ...(input.playerId === undefined || input.playerId === null ? [] : [`data-player-id="${escapeAttribute(input.playerId)}"`]),
    ...(input.teamId === undefined || input.teamId === null ? [] : [`data-team-id="${escapeAttribute(input.teamId)}"`]),
    ...(input.zone === undefined || input.zone === null ? [] : [`data-zone="${escapeAttribute(input.zone)}"`]),
  ].join(" ");
}

export const validationLayerName = "validation";
