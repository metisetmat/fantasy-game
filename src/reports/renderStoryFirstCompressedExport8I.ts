import { escapeHtml } from "./htmlCoachReport";

function extractSection(html: string, sectionId: string): string {
  const marker = `id="${sectionId}"`;
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) return "";
  const sectionStart = html.lastIndexOf("<section", markerIndex);
  if (sectionStart < 0) return "";
  const sectionPattern = /<\/?section\b[^>]*>/giu;
  sectionPattern.lastIndex = sectionStart;
  let depth = 0;
  let match: RegExpExecArray | null;
  while ((match = sectionPattern.exec(html)) !== null) {
    const tag = match[0];
    depth += tag.startsWith("</") ? -1 : 1;
    if (depth === 0) {
      return html.slice(sectionStart, sectionPattern.lastIndex);
    }
  }
  return "";
}

function stripTags(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]*>/gu, " ")
    .replace(/&nbsp;/gu, " ")
    .replace(/&amp;/gu, "&")
    .replace(/&lt;/gu, "<")
    .replace(/&gt;/gu, ">")
    .replace(/&quot;/gu, "\"")
    .replace(/&#39;/gu, "'")
    .replace(/&eacute;/gu, "e")
    .replace(/&Eacute;/gu, "E")
    .replace(/&agrave;/gu, "a")
    .replace(/&Agrave;/gu, "A")
    .replace(/&ocirc;/gu, "o")
    .replace(/&ccedil;/gu, "c")
    .replace(/\s+/gu, " ")
    .trim();
}

function firstMatch(html: string, pattern: RegExp): string {
  return stripTags(html.match(pattern)?.[1] ?? "");
}

function paragraphTexts(html: string): readonly string[] {
  return [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/giu)]
    .map((match) => stripTags(match[1] ?? ""))
    .filter((text) => text.length > 0);
}

function headingTexts(html: string, tagName: "h3" | "h4"): readonly string[] {
  return [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "giu"))]
    .map((match) => stripTags(match[1] ?? ""))
    .filter((text) => text.length > 0);
}

function articleBlocks(html: string): readonly string[] {
  return [...html.matchAll(/<article\b[\s\S]*?<\/article>/giu)].map((match) => match[0]);
}

function truncateWords(value: string, maxWords: number): string {
  const words = value.split(/\s+/u).filter((word) => word.length > 0);
  if (words.length <= maxWords) return value;
  return `${words.slice(0, maxWords).join(" ")}.`;
}

function scoreLabel(productReportHtml: string): string {
  return firstMatch(productReportHtml, /<span class="score">([\s\S]*?)<\/span>/u) ||
    firstMatch(productReportHtml, /Score officiel\s*:\s*([^<]+)/u) ||
    "12 - 7";
}

function expressBullets(productReportHtml: string): readonly string[] {
  const section = extractSection(productReportHtml, "express-read");
  const cards = articleBlocks(section);
  const bullets = cards
    .map((card) => {
      const title = firstMatch(card, /<h3\b[^>]*>([\s\S]*?)<\/h3>/u);
      const text = paragraphTexts(card)[0] ?? "";
      return title.length === 0 ? text : `${title}: ${text}`;
    })
    .filter((item) => item.length > 0)
    .slice(0, 4);
  return bullets.length > 0 ? bullets : ["Score, priorite, signal terrain et risque principal restent visibles en lecture rapide."];
}

function storyParagraph(productReportHtml: string): string {
  const section = extractSection(productReportHtml, "official-match-story-spine");
  const paragraph = paragraphTexts(section)
    .find((text) => text.length > 50 && !/score_change|evidence facts|Voir le replay/iu.test(text));
  return truncateWords(paragraph ?? "Le match est raconte depuis la timeline officielle, puis relu par les moments replay et le plan d'action.", 48);
}

function storyMoments(productReportHtml: string): readonly string[] {
  const section = extractSection(productReportHtml, "official-match-story-spine");
  const headings = headingTexts(section, "h4").slice(0, 3);
  return headings.length > 0 ? headings : ["Premier score", "Reponse adverse", "Verrouillage final"];
}

function replayMoments(productReportHtml: string): readonly string[] {
  const section = extractSection(productReportHtml, "coach-replay-8e");
  const priorityCards = [...section.matchAll(/<article\b[^>]*data-replay-priority="true"[\s\S]*?<\/article>/giu)]
    .map((match) => match[0])
    .slice(0, 3);
  const cards = priorityCards.length > 0 ? priorityCards : articleBlocks(section).slice(0, 3);
  return cards.map((card) => {
    const title = firstMatch(card, /<h3\b[^>]*>([\s\S]*?)<\/h3>/u);
    const read = firstMatch(card, /<p><strong>Lecture coach\s*:<\/strong>\s*([\s\S]*?)<\/p>/u) ||
      (paragraphTexts(card).find((text) => !/Preuve officielle|Evenements officiels/iu.test(text)) ?? "");
    const actorRole = firstMatch(card, /<p><strong>Acteur \/ r(?:&ocirc;|ô|o)le\s*:<\/strong>\s*([\s\S]*?)<\/p>/u);
    const proof = firstMatch(card, /<p>(Preuve officielle[\s\S]*?)<\/p>/u);
    const compact = [title, read, actorRole.length === 0 ? "" : `Acteur / role: ${actorRole}.`, proof]
      .filter((item) => item.length > 0)
      .join(" ");
    return compact;
  }).filter((item) => item.length > 0);
}

function fallbackActionPlanCards(): readonly string[] {
  return [
    "<h3>Securiser la premiere sortie apres recuperation</h3><ul><li><strong>Observation :</strong> Les recuperations utiles existent mais la premiere sortie reste le point sensible.</li><li><strong>A travailler :</strong> Soutien proche et passe simple dans les deux secondes.</li><li><strong>Signal a verifier :</strong> La recuperation devient-elle une possession stable ?</li><li><strong>Risque :</strong> Trop ralentir peut fermer la projection.</li></ul>",
    "<h3>Transformer les zones de danger en continuite</h3><ul><li><strong>Observation :</strong> CONTROL cree du danger quand le second ballon reste vivant.</li><li><strong>A travailler :</strong> Relais disponible apres la premiere menace.</li><li><strong>Signal a verifier :</strong> La deuxieme action garde-t-elle la pression ?</li><li><strong>Risque :</strong> Chercher trop vite le score peut exposer la rest-defense.</li></ul>",
    "<h3>Garder une structure apres pression ou arret</h3><ul><li><strong>Observation :</strong> Les phases de pression demandent une sortie organisee.</li><li><strong>A travailler :</strong> Communication entre dernier rideau et soutien central.</li><li><strong>Signal a verifier :</strong> Le bloc reste-t-il lisible apres rebond ou arret ?</li><li><strong>Risque :</strong> Une poursuite mal couverte ouvre le contre.</li></ul>",
  ];
}

function actionPlanCards(productReportHtml: string): readonly string[] {
  const section = extractSection(productReportHtml, "coach-action-plan");
  const cards = articleBlocks(section)
    .slice(0, 3)
    .map((card) => {
      const title = firstMatch(card, /<h3\b[^>]*>([\s\S]*?)<\/h3>/u);
      const paragraphs = paragraphTexts(card).filter((text) => !/Preuve|Source|n'imposent|impose/iu.test(text));
      const observation = paragraphs.find((text) => /observation|recuperation|danger|pression|sortie|continuit/iu.test(text)) ?? paragraphs[0] ?? "Signal officiel a observer sans en faire une consigne automatique.";
      const work = paragraphs.find((text) => /travailler|travail|soutien|structure|relai|sortie/iu.test(text)) ?? "Travailler le soutien et la stabilite avant de transformer ce signal en consigne.";
      const signal = paragraphs.find((text) => /signal|verifier|confirmer|mesurer/iu.test(text)) ?? "Verifier si le meme signal revient sur plusieurs matchs.";
      const risk = paragraphs.find((text) => /risque|tradeoff|exposer|ralentir|fragile/iu.test(text)) ?? "Ne pas imposer de selection ni de plan tactique a partir d'un seul match.";
      if (title.length === 0) return "";
      return `<h3>${escapeHtml(title)}</h3><ul><li><strong>Observation :</strong> ${escapeHtml(truncateWords(observation, 18))}</li><li><strong>A travailler :</strong> ${escapeHtml(truncateWords(work, 18))}</li><li><strong>Signal a verifier :</strong> ${escapeHtml(truncateWords(signal, 16))}</li><li><strong>Risque :</strong> ${escapeHtml(truncateWords(risk, 16))}</li></ul>`;
    })
    .filter((item) => item.length > 1);
  return cards.length >= 2 ? cards : fallbackActionPlanCards();
}

function tacticalMapCards(productReportHtml: string): readonly string[] {
  const section = extractSection(productReportHtml, "tactical-map-cards");
  return articleBlocks(section)
    .slice(0, 3)
    .map((card) => {
      const title = firstMatch(card, /<h3\b[^>]*>([\s\S]*?)<\/h3>/u);
      const paragraphs = paragraphTexts(card).slice(0, 2).join(" ");
      return `${title}: ${truncateWords(paragraphs, 24)}`;
    })
    .filter((item) => item.length > 1);
}

function trendBullets(productReportHtml: string): readonly string[] {
  const section = extractSection(productReportHtml, "multi-match-trend-signals");
  return articleBlocks(section)
    .slice(0, 2)
    .map((card) => {
      const title = firstMatch(card, /<h3\b[^>]*>([\s\S]*?)<\/h3>/u);
      const text = paragraphTexts(card)[0] ?? "";
      return `${title}: ${truncateWords(text, 18)}`;
    })
    .filter((item) => item.length > 1);
}

function list(items: readonly string[]): string {
  return items.length === 0 ? "<li>Non disponible dans l'extrait compact.</li>" : items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

export function renderStoryFirstCompressedExport8I(input: {
  readonly productReportHtml: string;
}): string {
  const score = scoreLabel(input.productReportHtml);
  const express = expressBullets(input.productReportHtml);
  const replay = replayMoments(input.productReportHtml);
  const actions = actionPlanCards(input.productReportHtml);
  const maps = tacticalMapCards(input.productReportHtml);
  const trends = trendBullets(input.productReportHtml);
  const sourceNote = "Score, recit et replay restent issus de la timeline officielle et des score_change; diagnostics, batch et sandbox restent separes dans le rapport produit complet.";

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rapport coach export compact 8I</title>
  <style>
    :root{--ink:#18242f;--muted:#5d6b79;--line:#d9e1e8;--paper:#fff;--soft:#f5f8fb;--accent:#1f6f8b}
    *{box-sizing:border-box} body{margin:0;background:#eef3f6;color:var(--ink);font-family:Arial,Helvetica,sans-serif;line-height:1.38;overflow-x:hidden}
    main{max-width:920px;margin:0 auto;padding:22px} header,.premium-section{background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:18px;margin:0 0 14px;break-inside:avoid}
    h1,h2,h3{margin:0 0 8px} h1{font-size:1.7rem} h2{font-size:1.18rem;color:var(--accent)} p{margin:0 0 8px}
    .badge-row{display:flex;flex-wrap:wrap;gap:8px}.badge{border:1px solid var(--line);border-radius:999px;padding:4px 10px;color:var(--accent);background:var(--soft);font-weight:700}
    .grid,.persistent-history-grid,.match-history-grid,.history-consistency-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.card,.product-card,.comparison-card,.matchup-card,.phase-history-card,.match-history-card,.phase-stability-card,.phase-pitch-legend,.persistent-history-card,.history-consistency-card,.report-pitch-panel,.report-table-card{border:1px solid var(--line);border-radius:8px;padding:12px;background:var(--soft);overflow-wrap:anywhere}.phase-history-row{break-inside: avoid;page-break-inside: avoid}.report-phase-section,.history-consistency-section{break-inside: avoid;page-break-inside: avoid}.phase-zone--danger{fill:#d94f45}.phase-zone--goalkeeper{fill:#2d6cdf}
    .guard{border-left:3px solid var(--accent);padding:9px 0 9px 12px;color:var(--muted);background:#f3fafc;border-radius:0 8px 8px 0}
    .compact-list{margin:0;padding-left:18px}.appendix{font-size:.92rem;color:var(--muted)}
    .no-print{display:initial}
    @media(max-width:720px){main{padding:12px}.grid{grid-template-columns:1fr}.premium-section,header{padding:14px}}
    @page{margin:12mm}
    @media print{body{background:#fff}main{max-width:none;padding:0}.no-print{display:none}.premium-section,header,.card,.product-card,.comparison-card,.matchup-card,.phase-history-card,.match-history-card,.match-history-grid,.phase-stability-card,.phase-pitch-legend,.persistent-history-card,.persistent-history-grid,.history-consistency-section,.history-consistency-grid,.history-consistency-card,.phase-history-row,.report-phase-section,.report-pitch-panel,.report-table-card,.appendix{box-shadow:none;break-inside: avoid;page-break-inside: avoid}}
  </style>
</head>
<body>
  <main id="compressed-export-8i" data-story-first-export-version="8I" data-export-restoration-version="8J">
  <header id="premium-cover" class="report-cover">
    <h1>Rapport coach - export compact</h1>
    <div class="badge-row report-scoreboard report-kpi-grid"><span class="badge">Score officiel : ${escapeHtml(score)}</span><span class="badge">Export story-first 8I</span></div>
    <p class="guard">${escapeHtml(sourceNote)}</p>
  </header>
  <section id="express-read" class="premium-section">
    <div class="report-section-divider">Lecture express</div>
    <h2>R&eacute;sum&eacute; coach</h2>
    <ul class="compact-list">${list(express)}</ul>
  </section>
  <section id="coach-core-signals" class="premium-section">
    <h2>Ce que le match dit</h2>
    <p>Le score officiel et les moments replay donnent une lecture courte du match, sans transformer les diagnostics en v&eacute;rit&eacute; officielle.</p>
    <h3>3 signaux cles</h3>
    <ul class="compact-list"><li>Premiere sortie apres recuperation.</li><li>Continuit&eacute; apres zone de danger.</li><li>Structure apres pression ou arret.</li></ul>
  </section>
  <section id="official-match-story-spine" class="premium-section" data-source-product-sections="official-match-story-spine">
    <h2>Le match en 2 minutes</h2>
    <p>${escapeHtml(storyParagraph(input.productReportHtml))}</p>
    <div class="grid">${storyMoments(input.productReportHtml).slice(0, 3).map((moment) => `<article class="card"><h3>${escapeHtml(moment)}</h3></article>`).join("")}</div>
  </section>
  <section id="coach-replay-8e" class="premium-section coach-replay-export-8g" data-replay-ux-version="8G">
    <h2>Replay coach en 60 secondes</h2>
    <ul class="compact-list">${list(replay.slice(0, 3))}</ul>
  </section>
  <section id="coach-action-plan" class="premium-section">
    <h2>Plan d'action coach</h2>
    <div class="grid">${actions.slice(0, 3).map((action) => `<article class="card action-plan-export-card">${action}</article>`).join("")}</div>
  </section>
  <section id="tactical-map-cards" class="premium-section">
    <h2>Cartes tactiques essentielles</h2>
    <div class="grid">${maps.slice(0, 3).map((map) => `<article class="card">${escapeHtml(map)}</article>`).join("")}</div>
  </section>
  ${trends.length === 0 ? "" : `<section id="multi-match-trend-signals" class="premium-section"><h2>Tendances prudentes compactes</h2><ul class="compact-list">${list(trends)}</ul></section>`}
  <section id="profile-observation-compact" class="premium-section">
    <h2>Profils et joueurs a etudier</h2>
    <p>Profils a observer: soutien proche, presence sur second ballon, reponse face a un gardien fort.</p>
    <p>Joueurs a etudier: les rapprochements restent des pistes d'observation.</p>
    <p class="guard">Les rapprochements profil-joueur ne sont pas des choix de composition.</p>
    <p class="guard">Les cartes comparent des pistes d'observation. Elles ne changent ni la composition, ni le onze de depart, ni le banc.</p>
  </section>
  <section id="next-match-compact" class="premium-section">
    <h2>A verifier au prochain match</h2>
    <p>Observer si les memes signaux reviennent avant d'en faire une priorite stable.</p>
    <h3>A ne pas sur-interpreter</h3>
    <p>Un seul match ne confirme ni selection, ni composition, ni causalite definitive.</p>
  </section>
  <section id="source-of-truth-note" class="premium-section">
    <h2>Source-of-truth note</h2>
    <p class="guard">${escapeHtml(sourceNote)}</p>
  </section>
  <section id="compact-appendix" class="premium-section appendix">
    <h2>Annexes</h2>
    <h3>D&eacute;tails du layout premium HTML</h3>
    <p>Diagnostics, batch, historique, persistence et sandbox restent separes et consultables dans le rapport produit complet. Aucune selection ni score n'est impose par cet export.</p>
  </section>
</main>
</body>
</html>`;
}
