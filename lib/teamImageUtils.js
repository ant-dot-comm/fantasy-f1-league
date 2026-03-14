/**
 * Convert a team display name to the car image filename (no extension).
 * Image files use underscores for spaces, e.g. "Haas F1 Team" -> "Haas_F1_Team".
 *
 * @param {string} teamName - Team name as stored in data (e.g. "Racing Bulls", "Aston Martin")
 * @returns {string} Slug suitable for /cars/{year}/cars/{slug}.png
 */
export function teamNameToImageSlug(teamName) {
  if (!teamName || typeof teamName !== "string") return "";
  return teamName.trim().replace(/\s+/g, "_");
}
