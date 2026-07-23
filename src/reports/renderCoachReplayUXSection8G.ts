import type { EventId } from "../core/ids";
import type { OfficialMatchReplayTimeline } from "./matchStorylineImmersionTypes";
import { buildCoachReplayUXViewFromTimeline } from "./buildCoachReplayUXIteration8G";
import type { CoachReplayMomentCardUX, CoachReplayUXIterationView8G } from "./coachReplayUXIterationTypes8G";
import { escapeHtml } from "./htmlCoachReport";

function fallbackScoreChangeEventIds(replay: OfficialMatchReplayTimeline): readonly EventId[] {
  return replay.replayMoments
    .filter((moment) => moment.scoreBefore !== moment.scoreAfter)
    .flatMap((moment) => moment.evidenceEventIds);
}

function sourceBadgeLabel(card: CoachReplayMomentCardUX): string {
  if (card.sourceBadge === "official_score_change") return "Score officiel";
  if (card.sourceBadge === "official_with_limitation") return "Source officielle limitee";
  return "Contexte officiel";
}

function renderPriorityCard(card: CoachReplayMomentCardUX): string {
  return `
        <article class="product-card replay-priority-card replay-card replay-card--${escapeHtml(card.visualState)}" data-replay-priority="true">
          <div class="badge-row">
            <span class="badge">${escapeHtml(card.minuteLabel)}</span>
            <span class="badge">${escapeHtml(card.scoreLabel)}</span>
            <span class="badge">${escapeHtml(sourceBadgeLabel(card))}</span>
          </div>
          <h3>${escapeHtml(card.title)}</h3>
          <p><strong>Lecture coach :</strong> ${escapeHtml(card.coachReadLine)}</p>
          <p><strong>Acteur / r&ocirc;le :</strong> ${escapeHtml(card.actorRoleLine)}</p>
          <p><strong>Zone :</strong> ${escapeHtml(card.zoneLine)}</p>
          <p><strong>Pourquoi :</strong> ${escapeHtml(card.whyItMattersLine)}</p>
          <details class="appendix replay-proof-details">
            <summary>Preuve officielle</summary>
            <p>${escapeHtml(card.compactProofLine)}</p>
          </details>
        </article>`;
}

function renderReplayCard(card: CoachReplayMomentCardUX): string {
  return `
        <article class="product-card replay-card replay-card--${escapeHtml(card.visualState)}">
          <div class="badge-row">
            <span class="badge">#${card.displayIndex}</span>
            <span class="badge">${escapeHtml(card.minuteLabel)}</span>
            <span class="badge">${escapeHtml(card.teamBadge)}</span>
            <span class="badge">${escapeHtml(sourceBadgeLabel(card))}</span>
          </div>
          <h3>${escapeHtml(card.title)}</h3>
          <p><strong>Score :</strong> ${escapeHtml(card.scoreLabel)}</p>
          <p><strong>Rep&egrave;re :</strong> ${escapeHtml(card.actorRoleLine)}, ${escapeHtml(card.zoneLine)}.</p>
          <details class="appendix replay-proof-details">
            <summary>Preuves repliees</summary>
            <p>${escapeHtml(card.compactProofLine)}</p>
          </details>
        </article>`;
}

function renderTimelineRail(view: CoachReplayUXIterationView8G): string {
  return `
    <div class="replay-timeline-rail" aria-label="Rail chronologique du replay">
${view.timelineRail.moments.map((moment) => `
        <div class="replay-rail-point replay-rail-point--${escapeHtml(moment.visualState)}">
          <strong>${escapeHtml(moment.minuteLabel)}</strong>
          <span>${escapeHtml(moment.scoreLabel)}</span>
          <em>${escapeHtml(moment.title)}</em>
        </div>`).join("")}
    </div>`;
}

function cleanExtractedHtmlText(text: string): string {
  return text
    .replace(/<[^>]*>/gu, "")
    .replace(/&amp;gt;/gu, ">")
    .replace(/&gt;/gu, ">")
    .replace(/&amp;nbsp;/gu, " ")
    .replace(/&nbsp;/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

export function renderCoachReplayUXProductSection8G(input: {
  readonly replay: OfficialMatchReplayTimeline;
  readonly officialScoreChangeEventIds?: readonly EventId[];
}): string {
  const view = buildCoachReplayUXViewFromTimeline({
    replay: input.replay,
    officialScoreChangeEventIds: input.officialScoreChangeEventIds ?? fallbackScoreChangeEventIds(input.replay),
  });
  const priorityCards = view.momentCards.filter((card) => card.priorityLevel === "primary").slice(0, 3);

  return `
  <section id="coach-replay-8e" class="product-section coach-replay-8e coach-replay-ux-8g" aria-label="Revivez le match" data-replay-ux-version="8G">
    <div class="story-head">
      <div>
        <p class="card-kicker">Replay coach officiel</p>
        <h2>Revivez le match</h2>
        <p class="muted">${escapeHtml(view.productIntroLine)}</p>
      </div>
      <div class="badge-row">
        <span class="badge">Score officiel : ${escapeHtml(view.officialScore)}</span>
        <span class="badge">${view.momentCards.length} moments</span>
      </div>
    </div>
    <p class="guard">${escapeHtml(view.globalSourceOfTruthNote)}</p>
    <div class="replay-priority-block" aria-label="2 minutes pour comprendre">
      <div class="story-head">
        <div>
          <p class="card-kicker">2 minutes pour comprendre</p>
          <h3>Les 3 moments qui structurent le match</h3>
        </div>
      </div>
      <div class="cards replay-priority-grid">
${priorityCards.map(renderPriorityCard).join("")}
      </div>
    </div>
${renderTimelineRail(view)}
    <div class="story-head">
      <div>
        <p class="card-kicker">Tous les moments replay</p>
        <h3>Les 6 points de lecture disponibles</h3>
      </div>
    </div>
    <div class="cards replay-all-moments">
${view.momentCards.map(renderReplayCard).join("")}
    </div>
    <p class="guard">${escapeHtml(view.timelineRail.timelineNarrative)}</p>
  </section>`;
}

export function renderCoachReplayUXExportSection8GFromProductHtml(html: string): string {
  const bodyStart = html.indexOf('data-replay-ux-version="8G"');
  if (bodyStart < 0) return "";
  const sectionStart = html.lastIndexOf("<section", bodyStart);
  const sectionEnd = html.indexOf("</section>", bodyStart);
  const section = sectionStart >= 0 && sectionEnd >= 0 ? html.slice(sectionStart, sectionEnd + "</section>".length) : "";
  const priorityCards = [...section.matchAll(/<article\b[^>]*data-replay-priority="true"[\s\S]*?<\/article>/giu)]
    .map((match) => match[0])
    .slice(0, 3)
    .map((card) => {
      const title = card.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/u)?.[1] ?? "";
      const score = card.match(/<span class="badge">([^<]*?(?:-&gt;|->|&rarr;)[^<]*?)<\/span>/u)?.[1] ?? "";
      const actorRole = card.match(/<p><strong>Acteur \/ r&ocirc;le\s*:<\/strong>\s*([\s\S]*?)<\/p>/u)?.[1] ?? "";
      const proof = card.match(/<p>(Preuve [\s\S]*?)<\/p>/u)?.[1] ?? "Lecture issue des evenements officiels.";
      return { title, score, actorRole, proof };
    });

  return `
  <section id="coach-replay-8e" class="premium-section coach-replay-export-8g" data-source-product-sections="coach-replay-8e" data-replay-ux-version="8G">
    <div class="report-section-divider">Replay coach</div>
    <div class="report-section-header">
      <div>
        <h2>Replay coach en 60 secondes</h2>
        <p>Trois moments structurent le match : premier score, r&eacute;ponse, verrouillage final.</p>
      </div>
    </div>
    <article class="report-table-card">
      <ol>${priorityCards.map((item) => `
        <li><strong>${escapeHtml(cleanExtractedHtmlText(item.title))}</strong> - ${escapeHtml(cleanExtractedHtmlText(item.score))}; ${escapeHtml(cleanExtractedHtmlText(item.actorRole))}. <span class="muted">${escapeHtml(cleanExtractedHtmlText(item.proof))}</span></li>`).join("")}</ol>
      <p class="guard">Lecture issue des &eacute;v&eacute;nements officiels ; d&eacute;tails en annexe.</p>
    </article>
  </section>`;
}
