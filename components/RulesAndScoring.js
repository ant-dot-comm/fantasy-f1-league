import Accordion from "./Accordion";

export default function RulesAndGuide() {
    return (
        <div className="px-6 mt-12 sm:mt-32 max-w-screen-md rounded-2xl mx-3 md:mx-auto" id="rules-and-guide">
            <Accordion title="Rules & Scoring" initialOpen={true}>
                {/* How to Play */}
                <div>
                    <h3 className="font-bold">How to Play</h3>
                    <ul className="list-disc pl-6 text-sm">
                        <li>Each race weekend, you must select 2 drivers.</li>
                        <li>Only drivers starting 11th - 20th in qualifying are eligible.</li>
                        <li>Points are awarded based on how much your drivers improve their finishing position.</li>
                        <li>Picks lock at the start of the race.</li>
                        <li>Picks are auto-generated to ensure every participant has a selection for the weekend. You can adjust your picks after qualifying and before the race starts.</li>
                    </ul>
                </div>

                {/* Scoring System */}
                <div className="mt-4">
                    <h3 className="font-bold ">Scoring System</h3>
                    <ul className="list-disc pl-6 text-sm ">
                        <li>+1 point for each position gained from start to finish.</li>
                        <li>-1 point for each position lost from start to finish.</li>
                        <li>0 points if driver did not finish race</li>
                        <li>+3 bonus points if starting 19th or 20th and finishing 10th or higher.</li>
                        <li>+5 bonus points if starting 19th or 20th and finishing 5th or higher.</li>
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