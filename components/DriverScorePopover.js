import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";

/**
 * DriverScorePopover – wraps driver card and shows scoring breakdown.
 *
 * Expects a `driver` from leaderboard race results with:
 * - race_startPosition
 * - race_position
 * - points
 * - bonusTitle (optional)
 */
export default function DriverScorePopover({ driver, children }) {
  const start = driver.race_startPosition;
  const finish = driver.race_position;
  const totalPoints = driver.points ?? 0;
  const bonusTitle = driver.bonusTitle || null;

  // If we do not have valid positions (or DNF), just render children without popover.
  if (
    typeof start !== "number" ||
    typeof finish !== "number" ||
    finish === 0
  ) {
    return children;
  }

  const positionsGained = start - finish;
  const isFrontBand = start >= 11 && start <= 16;
  const isBackBand = start >= 17 && start <= 22;

  let multiplier = 1;
  let bandLabel = "Standard band";

  if (isFrontBand) {
    multiplier = 1.5;
    bandLabel = "Middle of the grid starter (P11–P16)";
  } else if (isBackBand) {
    multiplier = 0.75;
    bandLabel = "Back of the grid starter (P17–P22)";
  }

  const basePoints = Math.round(positionsGained * multiplier);
  const winnerBonus = finish === 1 ? 3 : 0;
  const moverBonus =
    bonusTitle && typeof totalPoints === "number"
      ? totalPoints - (basePoints + winnerBonus)
      : 0;

  return (
    <Popover placement="bottom" showArrow>
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent className="bg-neutral-100 text-[10px] max-w-xs rounded-lg">
        <div className="flex flex-col gap-1">
          <div className="border-b-3 border-neutral-800 px-3 py-1">
            <div className="flex justify-between">
              <p className="font-semibold text-sm font-display leading-none">
                {driver.name_acronym}
              </p>
              <p>
                 P{start} → {finish === 0 ? "DNF" : `P${finish}`}
              </p>
            </div>
          </div>
          <div className="flex flex-col py-1 px-3">
            <p className="text-neutral-400">{bandLabel}</p>
            <p>
              Base:{" "}
              <span className="font-semibold">
                {multiplier.toString().replace(".5", "½")} × {positionsGained} ={" "}
                {basePoints}
              </span>
            </p>
            {winnerBonus !== 0 && (
              <p>
                Race winner bonus: <span className="font-semibold">+3</span>
              </p>
            )}
            {bonusTitle && (
              <p>
                Driver bonus:{" "}
                  <span className="font-semibold">
                    {bonusTitle}
                    {/* {moverBonus ? `${moverBonus >= 0 ? "+" : ""}${moverBonus}` : ""} */}
                  </span>
              </p>
            )}
          </div>
          <div className="border-t-3 border-neutral-800 px-3 pt-1 text-cyan-700 text-sm font-display text-center">
            {totalPoints} pts
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

