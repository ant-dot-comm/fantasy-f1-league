import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";

/**
 * BonusPicksPopover – wraps the bonus points pill and shows how bonus picks
 * contributed (Worst Driver + DNF prediction).
 */
export default function BonusPicksPopover({ race, children }) {
  const bonusPicks = race.bonusPicks || {};
  const hasWorst = bonusPicks.worstDriver !== null && bonusPicks.worstDriver !== undefined;
  const hasDnfs = bonusPicks.dnfs !== null && bonusPicks.dnfs !== undefined;

  return (
    <Popover placement="bottom" showArrow>
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent className="bg-neutral-100 text-[10px] max-w-sm rounded-lg">
        <div className="flex flex-col gap-1">
          <div className="border-b-3 border-neutral-800 px-3 py-1 font-display text-xs">
              Bonus Picks
          </div>

          <div className="flex flex-col gap-3 py-1 px-3">
            {!hasWorst && !hasDnfs && (
              <p className="text-xs text-neutral-500">No bonus picks made.</p>
            )}

            {hasWorst && (
              <div>
                <p className="font-semibold text-xs text-neutral-800">
                  Worst Driver
                </p>
                <div className="flex justify-between items-center gap-1 text-neutral-400">
                  <p className="font-semibold">{race.pickedWorstDriver?.name_acronym}</p>
                  <p>P{race.pickedWorstDriver?.race_startPosition} →{" "}
                  {race.pickedWorstDriver?.race_position === 0
                    ? "DNF"
                    : `P${race.pickedWorstDriver?.race_position}`}</p>
                </div>
                <p>
                  Score:{" "}
                  <span className="font-semibold">
                    {race.pickedWorstDriver?.race_position === 0
                      ? "+1 (DNF/DNS)"
                      : (() => {
                          const delta =
                            (race.pickedWorstDriver?.race_position ?? 0) -
                            (race.pickedWorstDriver?.race_startPosition ?? 0);
                          const sign = delta >= 0 ? "+" : "";
                          return `${sign}${delta}`;
                        })()}
                  </span>
                </p>
              </div>
            )}

            {hasDnfs && (
              <div>
                <p className="font-semibold text-xs text-neutral-800">
                  DNF Count
                </p>
                <p className="text-neutral-400">
                  Predicted {bonusPicks.dnfs}, actual {race.actualDnfs}
                </p>
                <p>
                  Score:{" "}
                  <span className="font-semibold">
                    {bonusPicks.dnfs === race.actualDnfs ? "+5" : "+0"}
                  </span>
                </p>
              </div>
            )}
          </div>

          <div className="border-t-3 border-neutral-800 px-3 py-1 font-display text-cyan-700 text-sm text-center">
              {race.bonusPoints} pts
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

