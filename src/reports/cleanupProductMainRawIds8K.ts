function readableRoleLabel8K(roleId: string): string {
  return roleId
    .split("_")
    .filter((part) => part.length > 0)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function cleanupProductMainRawIds8K(productHtml: string): string {
  return productHtml
    .replace(/<span class="badge">Match : contract-fixture-001<\/span>/gu, '<span class="badge">Match officiel</span>')
    .replace(
      /<p class="guard">Score officiel 12 - 7; Sequence de score officielle: rc-second-ball-chaser \(space_hunter\) pese sur score_created en Z3-C, avec preuve officielle preuve officielle repliee\.<\/p>/gu,
      '<p class="guard">Score officiel 12 - 7; la premiere bascule vient d\'une sequence officielle du Space Hunter dans l\'axe central, avec preuve repliee.</p>',
    )
    .replace(/pese sur score_created/gu, "contribue au score officiel")
    .replace(/\brc-[a-z0-9_-]+\s*\/\s*([a-z][a-z0-9_]+)\b/giu, (_match, roleId: string) => readableRoleLabel8K(roleId))
    .replace(/rc-second-ball-chaser\s*\/\s*space_hunter/gu, "Space Hunter")
    .replace(/rc-second-ball-chaser \(space_hunter\)/gu, "Space Hunter")
    .replace(/\brc-[a-z0-9_-]+\b/giu, "acteur officiel")
    .replace(/\bspace_hunter\b/gu, "Space Hunter")
    .replace(/\bscore_created\b/gu, "score officiel cree");
}
