import raceSchedule from "../../data/raceSchedule";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { meeting_key } = req.query;

  if (!meeting_key) {
    return res.status(400).json({ error: "meeting_key is required" });
  }

  const raceInfo = raceSchedule[meeting_key];
  if (!raceInfo) {
    return res.status(404).json({ 
      error: "Race not found", 
      message: `No race found for meeting key: ${meeting_key}` 
    });
  }

  // 🎛️ Check for manual override first
  if (raceInfo.manualControl !== null && raceInfo.manualControl !== undefined) {
    const isOpen = raceInfo.manualControl === true;
    const status = isOpen ? "open" : "closed";
    const message = isOpen 
      ? `Picks for ${raceInfo.race_name} are MANUALLY OPEN` 
      : `Picks for ${raceInfo.race_name} are MANUALLY CLOSED`;
    
    return res.status(200).json({
      race_name: raceInfo.race_name,
      meeting_key,
      status,
      message,
      is_open: isOpen,
      manual_control: true,
      picks_open: raceInfo.picks_open.toISOString(),
      picks_close: raceInfo.picks_close.toISOString(),
      current_time: new Date().toISOString(),
    });
  }

  const now = new Date();
  // Treat raceSchedule times as local time (PST/CST), not UTC
  const picksOpenTime = new Date(raceInfo.picks_open.getTime() + (raceInfo.picks_open.getTimezoneOffset() * 60000));
  const picksCloseTime = new Date(raceInfo.picks_close.getTime() + (raceInfo.picks_close.getTimezoneOffset() * 60000));
  
  const isOpen = now >= picksOpenTime && now <= picksCloseTime;
  const hasNotOpened = now < picksOpenTime;
  const hasClosed = now > picksCloseTime;
  
  let status;
  let message;
  
  if (hasNotOpened) {
    status = "not_opened";
    message = `Picks for ${raceInfo.race_name} will open at ${picksOpenTime.toLocaleString()}`;
  } else if (isOpen) {
    status = "open";
    const minutesRemaining = Math.floor((picksCloseTime - now) / 1000 / 60);
    message = `Picks for ${raceInfo.race_name} are open. ${minutesRemaining} minutes remaining.`;
  } else {
    status = "closed";
    message = `Picks for ${raceInfo.race_name} closed at ${picksCloseTime.toLocaleString()}`;
  }

  res.status(200).json({
    race_name: raceInfo.race_name,
    meeting_key,
    status,
    message,
    is_open: isOpen,
    picks_open: picksOpenTime.toISOString(),
    picks_close: picksCloseTime.toISOString(),
    current_time: now.toISOString(),
    time_until_open: hasNotOpened ? Math.floor((picksOpenTime - now) / 1000 / 60) : 0, // minutes
    time_until_close: isOpen ? Math.floor((picksCloseTime - now) / 1000 / 60) : 0 // minutes
  });
} 