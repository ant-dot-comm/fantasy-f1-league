import { useEffect, useState } from "react";
import classNames from "classnames";
import axios from "axios";
import { useRouter } from "next/router";
import Modal from "@/components/Modal";
import raceSchedule from "../data/raceSchedule";
import { Top3Players } from "./Top3Players";

export default function CurrentPick({ season, username }) {
    const [currentRace, setCurrentRace] = useState(null);
    const [nextRace, setNextRace] = useState({});
    const [prevRace, setPrevRace] = useState({});
    const [userPicks, setUserPicks] = useState([]);
    const [autoPicked, setAutoPicked] = useState(false);
    const [bottomDrivers, setBottomDrivers] = useState([]);
    const [selectedDrivers, setSelectedDrivers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [picksOpen, setPicksOpen] = useState(false);
    const [pickStatusMessage, setPickStatusMessage] = useState("");
    const [isCurrentRaceLoading, setIsCurrentRaceLoading] = useState(true);
    const [showFinalResults, setShowFinalResults] = useState(false);
    const router = useRouter();

    // console.log('here', { currentRace, selectedDrivers, userPicks, bottomDrivers });

    // ✅ Fetch current race details
    useEffect(() => {
        setIsCurrentRaceLoading(true);
        async function fetchRace() {
            try {
                const res = await axios.get(`/api/currentRace?season=${season}`);
                setCurrentRace(res.data);
                setSelectedDrivers([]);
                setUserPicks([]);
                setIsCurrentRaceLoading(false);
            } catch (error) {
                console.error("❌ Error fetching current race:", error);
            }
        }

        fetchRace();
    }, [season]);

    // console.log('currentRace', currentRace);

     // ✅ Check if picks should be locked on load
     useEffect(() => {
        if (!currentRace) return;
        const now = new Date();

        if (season < 2025) {
            // 🔴 Disable picks for past seasons
            setPicksOpen(false);
            setShowFinalResults(true);
        } else {
            const schedule = raceSchedule[currentRace.meeting_key]; // Fetch race schedule once season starts
            // const schedule = raceSchedule['1254'];

            const picksClose = schedule && new Date(schedule.picks_close);
            
            // const manualPickOpen = false; // ✅ Enable manual picks
            // const racePicksOpen = manualPickOpen && now <= picksClose; // referesh page at time to see if this hits
            const racePicksOpen = now <= picksClose; // referesh page at time to see if this hits, if works set up countdown timer
            
            const nextScheduleSessionId = Number(currentRace.meeting_key) + 1; // Fetch race schedule once season starts
            const prevScheduleSessionId =  now <= picksClose ? Number(currentRace.meeting_key) - 1 : Number(currentRace.meeting_key);
            const nextSchedule = raceSchedule[Number(nextScheduleSessionId).toString()]; // Fetch race schedule once season starts
            const prevSchedule = raceSchedule[Number(prevScheduleSessionId).toString()]; 
            nextSchedule && setNextRace(nextSchedule)
            prevSchedule && setPrevRace(prevSchedule)


            if (!picksOpen) {
                setPickStatusMessage(
                    "Your race picks from"// need a message for picks open but processing data
                );
            } else {
                if (userPicks.length > 0) {
                    setPickStatusMessage(`Your race picks for`);
                } else {
                    setPickStatusMessage(`No picks made for`);
                }
            }
            setPicksOpen(racePicksOpen);
            setShowFinalResults(false);
        }
    }, [currentRace, userPicks, season]);

    // ✅ Fetch user's picks for the current race
    useEffect(() => {
        if (!currentRace) return;
    
        async function fetchPicks() {
            try {
                const res = await axios.get(
                    `/api/userPicks?username=${username}&meeting_key=${currentRace.meeting_key}&season=${season}`
                );
                // console.log('res', res.data, 'here');
                // ✅ Store both picks and autopick flag
                setUserPicks(res.data.picks || []);
                setAutoPicked(res.data.autopick);
                setSelectedDrivers(res.data.picks.map(p => p.driverNumber) || []);
            } catch (error) {
                console.error("❌ Error fetching user pick:", error);
            }
        }
    
        fetchPicks();
    }, [currentRace, username]);

    // ✅ Fetch bottom 10 qualifying drivers
    useEffect(() => {
        if (!currentRace) return;

        async function fetchBottomDrivers() {
            try {
                const res = await axios.get(
                    `/api/bottomDrivers?meeting_key=${currentRace.meeting_key}&season=${season}`
                );
                setBottomDrivers(res.data);
            } catch (error) {
                console.error("❌ Error fetching bottom 10 drivers:", error);
            }
        }

        fetchBottomDrivers();
    }, [currentRace]);

    // ✅ Handle driver selection logic (only 2 picks)
    function toggleDriverSelection(driverNumber) {
        setSelectedDrivers((prevSelected) =>
            prevSelected.includes(driverNumber)
                ? prevSelected.filter((num) => num !== driverNumber)
                : prevSelected.length < 2
                ? [...prevSelected, driverNumber]
                : prevSelected
        );
        setAutoPicked(false);
    }

    // ✅ Submit user picks and remove autopick flag
    async function submitPick() {
        try {
            await axios.post("/api/submitPicks", {
                username,
                season,
                meeting_key: currentRace.meeting_key,
                driverNumbers: selectedDrivers, // ✅ Send both selected drivers
            });

            setUserPicks(selectedDrivers);
            // setAutoPicked(false);
            setIsModalOpen(false);
            router.reload();
        } catch (error) {
            console.error("❌ Error submitting pick:", error);
        }
    }

    // ✅ Display current picks with autopick indicator
    return (
        <>
        <div id="current-picks" className={classNames(
            "flex flex-col items-center mb-12 pt-16 relative text-neutral-300",
            userPicks.length > 0 || showFinalResults ? `bg-radial-[at_50%_75%] ${picksOpen ? "from-cyan-900" : "from-neutral-600"} to-neutral-700 to-80%` : "bg-neutral-700"
        )}>
            {showFinalResults ? (
                <Top3Players season={season} />
            ) : (
                <>
                    {currentRace && (
                        <p className="leading-none text-sm">{pickStatusMessage}</p>
                    )}
                    <h2 className="text-xl font-display">
                        {currentRace ? `${season} ${currentRace?.meeting_name}` : "Season has not started yet"}
                    </h2>
                    {/* ✅ Display selected picks */}
                    <div className="flex flex-row items-center">
                        {userPicks.map((driver, index) => (
                            <div key={driver.driverNumber} className={classNames(
                                "flex items-end mt-2",
                                index === 0 ? "flex-row-reverse" : ""
                            )}>
                                <img src={driver.headshot_url} alt={driver.fullName} className="h-24 sm:h-32"/>
                                <p className="text-2xl font-display leading-none -mb-1">{driver.name_acronym}</p>
                            </div>
                        ))}
                    </div>
                    <div className="divider-glow-medium !w-4/5 sm:!w-1/2 mx-auto" />
                    
                    {(autoPicked && userPicks.length > 0) && <span className="text-xs text-neutral-300">(Auto-Picked)</span>}

                    {/* ✅ Pick Button */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className={classNames(
                            "-mb-6 px-6 py-4 mt-4 rounded-lg text-neutral-100 shadow-md z-10",
                            !picksOpen ? "bg-neutral-500" : "bg-cyan-800"
                        )}
                        disabled={!picksOpen}
                    >
                        {!picksOpen ? "Picks Locked" : userPicks.length > 0 ? "Update Picks" : "Make Picks"}
                    </button>
                </>
            )}
            

            {/* ✅ Modal for selecting picks */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={username} title="Race Picks">
                <p className="font-bold leading-none">{season} {currentRace?.meeting_name}</p>
                <h3 className="mb-2 text-sm text-neutral-400">Select two drivers</h3>

                {/* ✅ Submit Button */}
                <button
                    className="px-4 py-1 mb-4 w-full bg-cyan-800 text-white rounded-lg font-bold"
                    onClick={submitPick}
                    disabled={selectedDrivers.length !== 2}
                >
                    Confirm Picks
                </button>

                {/* ✅ Display Bottom 10 Drivers */}
                <ul className="flex flex-col gap-2">
                    {bottomDrivers.sort((a, b) => a.qualifyingPosition - b.qualifyingPosition)
                        .map(driver => (
                            <li key={driver.driverNumber}>
                                <button
                                    className={classNames(
                                        "flex flex-row items-center text-xs w-full text-left rounded-lg shadow-2xl",
                                        selectedDrivers.includes(driver.driverNumber)
                                            ? "bg-neutral-600 text-neutral-200 shadow-md"
                                            : "bg-neutral-200 text-neutral-700",
                                        driver.headshot_url ? "pr-2" : "px-1"
                                    )}
                                    onClick={() => toggleDriverSelection(driver.driverNumber)}
                                >
                                    <div className="rounded-l-md" style={{ backgroundColor: `#${driver.teamColour}` }}>
                                        <img src={driver.headshot_url} alt={driver.fullName} className="h-12 -mt-4"/>
                                    </div>
                                    <div className="mx-2 flex flex-row items-center">
                                        <span className={classNames(
                                            "mr-2 font-display leading-none",
                                            selectedDrivers.includes(driver.driverNumber) ? "text-neutral-300" : "text-neutral-500"
                                        )}>
                                            P{driver.qualifyingPosition}
                                        </span>
                                        <div className="text-[16px] font-bold">
                                            <div className="text-[16px] font-bold leading-none">{driver.fullName} {selectedDrivers.includes(driver.driverNumber) && <span className="text-[8px] font-thin"> ( Unselect ) </span>}</div>
                                            {(autoPicked && selectedDrivers.includes(driver.driverNumber)) && (<div className="text-neutral-400 text-[10px] leading-none">Auto-picked</div>)}
                                        </div>
                                    </div>
                                </button>
                            </li>
                        ))}
                </ul>

                {/* ✅ Submit Button */}
                <button
                    className="p-2 mt-4 w-full bg-cyan-800 text-white rounded-lg font-bold"
                    onClick={submitPick}
                    disabled={selectedDrivers.length !== 2}
                >
                    Confirm Picks
                </button>
            </Modal>
        </div>

        {!picksOpen && (
            <div className="flex flex-col sm:flex-row items-stretch max-w-screen-md px-2 gap-2 mx-auto mb-8 text-center text-cyan-800">
                {/* <a className="bg-cyan-600 text-neutral-100 mx-auto p-2 rounded-lg" href="https://docs.google.com/forms/d/e/1FAIpQLSf5U06Vaz4K73KLOUkm7VUF8G_ImhaoFptLswQkO-oZRHvy0A/viewform?usp=dialog">Oops! messed up scores from first race 😇 This weeks picks are open and unaffected. If you haven't already, click here to submit your drivers or scores for the first race.</a> */}
                <a 
                    href={`https://f1nsight.com/#/race-results`} 
                    target="_blank" 
                    className="w-full sm:w-1/2 flex flex-col items-center justify-center bg-neutral-300 relative text-center p-6 rounded-xl group overflow-hidden text-neutral-500"
                >
                    <p className="text-sm font-bold leading-none">
                        {`Dive into F1nsight.com for all the in-depth details and stats from the ${season} ${prevRace?.race_name}`} 
                    </p>
                    <div className="absolute top-full w-full h-full group-hover:top-0 transition-all group-hover:bg-gradient-to-b group-hover:from-purple-950 group-hover:to-neutral-800 flex items-center justify-center">
                        <div className="bg-purple-900 shadow-md rounded-xl px-4 py-2 w-fit text-white">F1nsight.com</div>
                    </div>
                </a>
                {nextRace.picks_open && (
                    <div className="text-center text-neutral-100 p-6 bg-neutral-800 rounded-xl w-full sm:w-1/2">
                        <p className="text-xs">Next Race</p>
                        <p className="text-sm font-display">
                            {nextRace.race_name}
                        </p>
                        <p className="text-xs">
                            Picks open as soon ASAP after qualifying. Keep checking back or message Antoni to hurry up and run the data script 😅
                        </p>
                    </div>
                )}
            </div>
        )}
        </>
    );
}