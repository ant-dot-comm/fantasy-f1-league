/**
 * Current time from a single shared source so local dev and production
 * always agree on when picks open/close (no server clock drift).
 */
export async function getNowUTC() {
  try {
    const res = await fetch("https://worldtimeapi.org/api/timezone/Etc/UTC");
    const data = await res.json();
    if (data.datetime) return new Date(data.datetime);
  } catch (e) {
    // fallback to server time if network fails
  }
  return new Date();
}
