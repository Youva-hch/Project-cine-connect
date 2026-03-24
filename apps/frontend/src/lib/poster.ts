export function getBestPosterUrl(
  posterUrl?: string | null,
  options?: { omdbSize?: number; tmdbWidth?: 500 | 780 | 1280 }
): string {
  if (!posterUrl || posterUrl === "N/A") return "";

  const omdbSize = options?.omdbSize ?? 1000;
  const tmdbWidth = options?.tmdbWidth ?? 780;

  // TMDB: normaliser vers une taille plus nette.
  if (posterUrl.includes("image.tmdb.org/t/p/")) {
    return posterUrl.replace(/\/w\d+\//, `/w${tmdbWidth}/`);
  }

  // IMDb/OMDb: remplacer les variants SX/SY pour une image plus grande.
  if (/_V1_.*\.(jpg|jpeg|png)$/i.test(posterUrl)) {
    return posterUrl.replace(
      /_V1_.*\.(jpg|jpeg|png)$/i,
      `_V1_QL75_UX${omdbSize}_.jpg`
    );
  }

  return posterUrl
    .replace(/SX\d+/i, `SX${omdbSize}`)
    .replace(/SY\d+/i, `SY${omdbSize}`);
}

