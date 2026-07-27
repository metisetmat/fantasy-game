export function cleanupReplayExportWording8K(exportHtml: string): string {
  return exportHtml
    .replace(
      /CONTROL frappe le premier CONTROL frappe le premier grace au Space Hunter de CONTROL dans axe central\. La sequence fait passer le score de 0 - 0 a 3 - 0\./gu,
      "CONTROL frappe le premier grace au Space Hunter dans l'axe central : 0-0 vers 3-0.",
    )
    .replace(
      /BLITZ repond BLITZ reste dans le match avec le gardien-libero de BLITZ dans axe central: 6 - 0 devient 6 - 5\./gu,
      "BLITZ repond grace a une sequence liee au gardien-libero : 6-0 vers 6-5.",
    )
    .replace(
      /CONTROL verrouille le 12 - 7 Le Left Piston hybride de CONTROL conclut la derniere sequence de score dans axe central et fixe le 12 - 7\./gu,
      "CONTROL verrouille le 12-7 avec le Left Piston hybride dans l'axe central.",
    )
    .replace(/CONTROL verrouille le 12 - 7/gu, "CONTROL verrouille le 12-7")
    .replace(/>\s{3,}</gu, ">\n<");
}
