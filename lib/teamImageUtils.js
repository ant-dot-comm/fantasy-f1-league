/**
 * Exact asset filenames (no extension) for car images. Used so production
 * (case-sensitive filesystem) always requests the correct casing; locally
 * (macOS) would resolve anyway.
 */
const CANONICAL_SLUGS = {
  alpine: "Alpine",
  apline: "Apline",
  aston_martin: "Aston_Martin",
  audi: "Audi",
  cadillac: "Cadillac",
  f1nsight: "F1Nsight",
  ferrari: "Ferrari",
  haas_f1_team: "Haas_F1_Team",
  mclaren: "McLaren",
  mercedes: "Mercedes",
  racing_bulls: "Racing_Bulls",
  rb: "rb",
  red_bull: "Red_Bull",
  red_bull_racing: "Red_Bull_Racing",
  williams: "Williams",
};

/**
 * Convert a team display name to the car image filename (no extension).
 * Replaces spaces with underscores and normalizes to asset casing so it
 * works on case-sensitive production servers (e.g. Williams, Audi, Cadillac).
 *
 * @param {string} teamName - Team name as stored in data (e.g. "Racing Bulls", "Cadillac")
 * @returns {string} Slug suitable for /cars/{year}/cars/{slug}.png
 */
export function teamNameToImageSlug(teamName) {
  if (!teamName || typeof teamName !== "string") return "";
  const slug = teamName.trim().replace(/\s+/g, "_");
  const normalized = slug.toLowerCase();
  return CANONICAL_SLUGS[normalized] ?? slug;
}
