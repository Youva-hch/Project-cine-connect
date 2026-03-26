export function getBestPosterUrl(
  posterUrl?: string | null,
  options?: { omdbSize?: number }
): string {
  if (!posterUrl || posterUrl === "N/A") return "";

  const omdbSize = options?.omdbSize ?? 1000;

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

