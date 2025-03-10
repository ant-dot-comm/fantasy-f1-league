import Accordion from "./Accordion";

export default function RulesAndGuide() {
    return (
        <div className="px-6 mt-12 sm:mt-32 max-w-screen-md rounded-2xl mx-3 md:mx-auto">
            <Accordion title="Rules & Scoring" initialOpen={true}>
                {/* How to Play */}
                <div>
                    <h3 className="font-bold">How to Play</h3>
                    <ul className="list-disc pl-6 text-sm">
                        <li>Each race weekend, you must select 2 drivers.</li>
                        <li>Only drivers starting 11th - 20th in qualifying are eligible.</li>
                        <li>Points are awarded based on how much your drivers improve their finishing position.</li>
                        <li>Picks lock at the start of the race.</li>
                    </ul>
                </div>

                {/* Scoring System */}
                <div className="mt-4">
                    <h3 className="font-bold ">Scoring System</h3>
                    <ul className="list-disc pl-6 text-sm ">
                        <li>+1 point for each position gained from start to finish.</li>
                        <li>-1 point for each position lost from start to finish.</li>
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
                    <li>You can select your drivers between the end of the qualifying session and the start of the race. Head to the **Current Picks** section to make your selections.</li>
                    <li>Once the race begins, picks are locked—choose wisely!</li>
                    <li>After each race weekend, check the leaderboard to see the latest standings. Click on a leaderboard entry to view a detailed breakdown of points scored from each selected driver for each race weekend throughout the season.</li>
                </ul>
            </Accordion>
        </div>
    );
}