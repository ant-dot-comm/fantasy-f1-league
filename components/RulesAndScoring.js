import Accordion from "./Accordion";

export default function RulesAndGuide() {
    return (
        <div className="px-3 mt-12 sm:mt-32 max-w-screen-md rounded-2xl md:mx-auto" id="rules-and-guide">
            <Accordion title="Rules & Scoring" initialOpen={true}>
                {/* How to Play */}
                <div>
                    <h3 className="font-bold mb-4">How to Play</h3>
                    <ul className="list-disc pl-6 text-sm">
                        <li>Each race weekend, you must select 2 drivers.</li>
                        <li>Only drivers starting 11th - 22nd in qualifying are eligible.</li>
                        <li>Points are awarded based on how much your drivers improve (or lose) positions from start to finish.</li>
                        <li>Picks lock at the start of the race.</li>
                        <li>Picks are auto-generated to ensure every participant has a selection for the weekend. You can adjust your picks after qualifying and before the race starts.</li>
                    </ul>
                </div>

                {/* Scoring System */}
                <div className="mt-4">
                    <h3 className="font-bold mb-4">Scoring System</h3>
                    Base Scoring
                    <ul className="list-disc pl-6 text-sm mb-4">
                        <li>For each driver we compare <span className="font-bold">qualifying position vs. race finish</span>.</li>
                        <li>If the driver does not finish (DNF/DNS/DSQ), they score <span className="font-bold">-1 point</span>.</li>
                        <li>If the driver starts <span className="font-bold">P11–P16</span>, they get <span className="font-bold">1.5 points per position gained</span> (and lose 1.5 per position lost).</li>
                        <li>If the driver starts <span className="font-bold">P17–P22</span>, they get <span className="font-bold">0.75 points per position gained</span> (and lose 0.75 per position lost).</li>
                    </ul>
                    Front / Back Position Gain Bonuses
                    <ul className="list-disc pl-6 text-sm mb-4">
                        <li>
                            If a driver starts <span className="font-bold">P11–P16</span> and gains:
                            <ul className="list-disc pl-6 mt-1">
                                <li>10–12 positions: <span className="font-bold">+2 bonus points</span> (Front Overtake Artist)</li>
                                <li>13–14 positions: <span className="font-bold">+3 bonus points</span> (Front Grid Charger)</li>
                                <li>15+ positions: <span className="font-bold">+4 bonus points</span> (Front Midfield Mauler)</li>
                            </ul>
                        </li>
                        <li className="mt-2">
                            If a driver starts <span className="font-bold">P17–P22</span> and gains:
                            <ul className="list-disc pl-6 mt-1">
                                <li>10–14 positions: <span className="font-bold">+1 bonus point</span> (Back Apex Assassin)</li>
                                <li>15–18 positions: <span className="font-bold">+2 bonus points</span> (Back Track Titan)</li>
                                <li>19+ positions: <span className="font-bold">+3 bonus points</span> (Back Zero to Hero)</li>
                            </ul>
                        </li>
                    </ul>
                    Race Winner Bonus
                    <ul className="list-disc pl-6 text-sm mb-4">
                        <li>In addition to position gained bonuses, <span className="font-bold">+3 bonus points</span> if you select the race winner</li>
                    </ul>
                    Bonus Picks
                    <ul className="list-disc pl-6 text-sm mb-4">
                        <li>
                            Worst Driver Scoring: pick a “worst driver” from your eligible grid.
                            <ul className="list-disc pl-6 mt-1">
                                <li>+1 point for each position they <span className="font-bold">lose</span> (falling backwards)</li>
                                <li>-1 point for each position they <span className="font-bold">gain</span> (if they outperform expectations)</li>
                                <li>+1 point if they DNF</li>
                            </ul>
                        </li>
                        <li className="mt-2">
                            DNFs Prediction Scoring: <span className="font-bold">+5 points</span> if you guess the exact number of DNFs in the race, <span className="font-bold">0 points</span> otherwise.
                        </li>
                    </ul>  
                </div>
            </Accordion>

            <Accordion title="Guide">
                <p className="text-sm">
                    Here's a quick guide to making your picks and navigating the site.
                </p>
                <ul className="list-disc pl-6 text-sm mt-2">
                    <li>You can select your drivers between the end of the qualifying session and the start of the race. Head to the <a href="#current-picks" className="font-bold text-sm hover:text-neutral-500 mt-4 underline">current picks</a> section to make your selections.</li>
                    <li>Once the race begins, picks are locked—choose wisely!</li>
                    <li>See how your competition is picking... After each race weekend, check the leaderboard to see the latest standings. Click on a player entry to view a detailed breakdown of points scored from their selected drivers for each race weekend throughout the season.</li>
                </ul>
            </Accordion>
        </div>
    );
}