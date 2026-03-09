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
      <PopoverContent className="bg-neutral-100 text-[10px] px-3 py-2 max-w-xs rounded-lg">
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-[11px] text-cyan-700">
            Bonus Picks • {race.bonusPoints >= 0 && "+"}{race.bonusPoints} pts
          </p>

          {!hasWorst && !hasDnfs && (
            <p className="text-[10px] text-neutral-500">No bonus picks made.</p>
          )}

          {hasWorst && (
            <div>
              <p className="font-semibold text-[10px] text-neutral-800">
                Worst Driver
              </p>
              <p>
                #{bonusPicks.worstDriver} – {race.pickedWorstDriver?.name_acronym} •{" "}
                P{race.pickedWorstDriver?.race_startPosition} →{" "}
                {race.pickedWorstDriver?.race_position === 0
                  ? "DNF"
                  : `P${race.pickedWorstDriver?.race_position}`}
              </p>
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
              <p className="font-semibold text-[10px] text-neutral-800">
                DNF Count
              </p>
              <p>
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
      </PopoverContent>
    </Popover>
  );
}

