export function getBestPosterUrl(
  posterUrl?: string | null,
  options?: { omdbSize?: number }
): string {
  if (!posterUrl || posterUrl === "N/A") return "";

  const omdbSize = options?.omdbSize ?? 1000;
  // IMDb/OMDb: certaines URLs cassent si on réécrit entièrement le suffixe _V1_...
  // On remplace uniquement les tokens de taille quand ils existent.
  return posterUrl
    .replace(/_SX\d+/i, `_SX${omdbSize}`)
    .replace(/_SY\d+/i, `_SY${omdbSize}`)
    .replace(/_UX\d+/i, `_UX${omdbSize}`)
    .replace(/_UY\d+/i, `_UY${omdbSize}`);
}

