export default function RulesAndScoring() {
    return (
        <div className="px-6 py-10  bg-neutral-800 text-neutral-200 mt-12 sm:mt-32 max-w-screen-md rounded-2xl mx-3 md:mx-auto">
            <h2 className="text-2xl font-display mb-6">Rules & Scoring</h2>

            <div className="space-y-6">
                {/* How to Play */}
                <div>
                    <h3 className="text-xl font-bold text-neutral-400">How to Play</h3>
                    <ul className="list-disc pl-6 text-sm text-neutral-300">
                        <li>Each race weekend, you must select 2 drivers.</li>
                        <li>Only drivers starting 11th - 20th in qualifying are eligible.</li>
                        <li>Points are awarded based on how much your drivers improve their finishing position.</li>
                        <li>Picks lock at the start of the race.</li>
                    </ul>
                </div>

                {/* Scoring System */}
                <div>
                    <h3 className="text-xl font-bold text-neutral-400">Scoring System</h3>
                    <ul className="list-disc pl-6 text-sm text-neutral-300">
                        <li>+1 point for each position gained from start to finish.</li>
                        <li>-1 point for each position lost from start to finish.</li>
                        <li>+3 bonus points if starting 19th or 20th and finishing 10th or higher.</li>
                        <li>+5 bonus points if starting 19th or 20th and finishing 5th or higher.</li>
                        {/* <li>No points deducted for losing positions.</li> */}
                    </ul>
                </div>

                {/* League Standings */}
                <div>
                    <h3 className="text-xl font-bold text-neutral-400">League Standings</h3>
                    <ul className="list-disc pl-6 text-sm text-neutral-300">
                        <li>Players are ranked by total points scored across the season.</li>
                        <li>The leaderboard updates after each race weekend.</li>
                        <li>Additional rankings track best single-race performances and highest average score per weekend. More to come.</li>
                    </ul>
                </div>

                {/* Extra Fun */}
                <div>
                    <h3 className="text-xl font-bold text-neutral-400">Extra Fun & Strategy</h3>
                    <ul className="list-disc pl-6 text-sm text-neutral-300">
                        <li>Tracking which drivers get picked the most</li>
                        <li>See which drivers gain or lose the most positions across the season</li>
                        <li>More insights to come.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}