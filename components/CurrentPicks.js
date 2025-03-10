import { useEffect, useState } from "react";
import classNames from "classnames";
import axios from "axios";
import { useRouter } from "next/router";
import Modal from "@/components/Modal";
import raceSchedule from "../data/raceSchedule";

export default function CurrentPick({ season, username }) {
    const [currentRace, setCurrentRace] = useState(null);
    const [userPicks, setUserPicks] = useState([]);
    const [bottomDrivers, setBottomDrivers] = useState([]);
    const [selectedDrivers, setSelectedDrivers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [picksOpen, setPicksOpen] = useState(false);
    const [pickStatusMessage, setPickStatusMessage] = useState("");
    const router = useRouter();

    // console.log({pickStatusMessage});

    // ✅ Fetch current race details
    useEffect(() => {
        async function fetchRace() {
            try {
                const res = await axios.get(
                    `/api/currentRace?season=${season}`
                );
                setCurrentRace(res.data);
            } catch (error) {
                console.error("❌ Error fetching current race:", error);
            }
        }

        fetchRace();
    }, [season]);

    // ✅ Check if picks should be locked on load
    useEffect(() => {
      if (!currentRace) return;

      const now = new Date();

      if (season < 2025) {
        // 🔴 Disable picks for past seasons
        setPicksOpen(false);
        if (userPicks.length > 0) {
            setPickStatusMessage(`Your race picks for`);
        } else {
            setPickStatusMessage(`No picks made for`);
        }
        } else if (schedule) {
            // 🔄 Use dynamic scheduling for 2025+
            const schedule = raceSchedule[currentRace.meeting_key]; // Fetch race schedule
            const picksOpen = new Date(schedule.picks_open);
            const picksClose = new Date(schedule.picks_close);

            if (now < picksClose) {
                setPickStatusMessage(`Race picks open at ${picksOpen.toLocaleString()} and close at ${picksClose.toLocaleString()}.`);
            } else {
                if (userPicks.length > 0) {
                    setPickStatusMessage(`Your race picks for`);
                } else {
                    setPickStatusMessage(`No picks made for`);
                }
            }
            setPicksOpen(
                now >= picksOpen && now <= picksClose
            );
        } else {
        // 🚨 Default fallback if no schedule is found
        setPicksOpen(false);
    }
  }, [currentRace, userPicks]);

    // ✅ Fetch user's picks for the current race
    useEffect(() => {
        if (!currentRace) return;

        async function fetchPicks() {
            try {
                const res = await axios.get(
                    `/api/userPicks?username=${username}&meeting_key=${currentRace.meeting_key}&season=${season}`
                );
                setUserPicks(res.data.picks || []);
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
                // console.log(res.data);
            } catch (error) {
                console.error("❌ Error fetching bottom 10 drivers:", error);
            }
        }

        fetchBottomDrivers();
    }, [currentRace]);

    // ✅ Handle driver selection logic (allows 2 picks)
    function toggleDriverSelection(driverNumber) {
        setSelectedDrivers((prevSelected) =>
            prevSelected.includes(driverNumber)
                ? prevSelected.filter((num) => num !== driverNumber)
                : prevSelected.length < 2
                ? [...prevSelected, driverNumber]
                : prevSelected
        );
    }

    // ✅ Submit user picks to the API
    async function submitPick() {
        try {
            await axios.post("/api/submitPicks", {
                username,
                season,
                meeting_key: currentRace.meeting_key,
                driverNumbers: selectedDrivers, // ✅ Send both selected drivers
            });

            setUserPicks(selectedDrivers);
            setIsModalOpen(false);
            router.reload();
        } catch (error) {
            console.error("❌ Error submitting pick:", error);
        }
    }
    const continaerClasses =
        "flex flex-col items-center bg-neutral-700 text-neutral-300 mb-20 pt-16 relative";

    if (!currentRace && season === new Date().getFullYear())
        return (
            <div className={continaerClasses}>
                <p className="absolute left-1/2 top-3/5 -translate-x-1/2 -translate-y-1/2 w-full text-center">
                    {season} Season has not started
                </p>
            </div>
        );
    if (!currentRace)
        return (
            <div className={continaerClasses}>
                <p className="absolute left-1/2 top-3/5 -translate-x-1/2 -translate-y-1/2w -full text-center ">
                    Loading {season} current race...
                </p>
            </div>
        );

    return (
        <div className={continaerClasses}>
            {currentRace && (
                <p className="leading-none text-sm">
                    {pickStatusMessage}
                </p>
            )}
            <h2 className="text-xl font-display">
                {currentRace
                    ? `${season} ${currentRace.meeting_name}`
                    : "Season has not started yet"}
            </h2>
            <div className="flex flex-row items-center">
                {userPicks.map((driver, index) => (
                    <div
                        key={driver.driverNumber}
                        className={classNames(
                            "flex items-end mt-2",
                            index === 0 ? "flex-row-reverse" : ""
                        )}
                    >
                        <img
                            src={driver.headshot_url}
                            alt={driver.fullName}
                            className="h-16"
                        />
                        <p className="text-2xl font-display leading-none -mb-1">
                            {driver.name_acronym}
                        </p>
                    </div>
                ))}
            </div>
            <div className="divider-glow-dark !w-4/5 sm:!w-1/2 mx-auto" />

            <button
                onClick={() => setIsModalOpen(true)}
                className={classNames(
                "-mb-4 px-4 py-2 mt-6 rounded-lg text-neutral-100",
                !picksOpen ? "bg-neutral-600" : "bg-cyan-800",
                )}
                disabled={!picksOpen}
            >
                {!picksOpen ? "Picks Locked" : userPicks.length > 0 ? "Update Locked" : "Make Picks"}
            </button>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={username}
                title="Race Picks"
            >
                <p className="font-bold leading-none">
                    {season} {currentRace.meeting_name}
                </p>
                <h3 className="mb-6 text-sm text-neutral-400">
                    Select two drivers
                </h3>
                <ul className="flex flex-col gap-2">
                    {bottomDrivers
                        .sort(
                            (a, b) =>
                                a.qualifyingPosition - b.qualifyingPosition
                        ) // ✅ Sort by start position (11-20)
                        .map((driver) => (
                            <li key={driver.driverNumber}>
                                <button
                                    className={classNames(
                                        "flex flex-row items-center text-xs w-full text-left rounded-lg shadow-2xl",
                                        selectedDrivers.includes(
                                            driver.driverNumber
                                        )
                                            ? "bg-neutral-600 text-neutral-200 shadow-lg"
                                            : "bg-neutral-200 text-neutral-700",
                                        driver.headshot_url ? "pr-2" : "px-1"
                                    )}
                                    onClick={() =>
                                        toggleDriverSelection(
                                            driver.driverNumber
                                        )
                                    }
                                >
                                    <div
                                        className="rounded-l-md"
                                        style={{
                                            backgroundColor: `#${driver.teamColour}`,
                                        }}
                                    >
                                        <img
                                            src={driver.headshot_url}
                                            alt={driver.fullName}
                                            className="h-12 -mt-4"
                                        />
                                    </div>
                                    <div className="mx-2 flex flex-row items-center">
                                        <span
                                            className={classNames(
                                                "mr-2 font-display",
                                                selectedDrivers.includes(
                                                    driver.driverNumber
                                                )
                                                    ? "text-neutral-300"
                                                    : " text-neutral-500"
                                            )}
                                        >
                                            P{driver.qualifyingPosition}
                                        </span>
                                        <span className="text-[16px] font-bold">
                                            {driver.fullName}
                                        </span>
                                    </div>
                                </button>
                            </li>
                        ))}
                </ul>
                <button
                    className="px-4 py-2 mt-4 w-full bg-cyan-800 text-white rounded-lg font-bold"
                    onClick={submitPick}
                    disabled={selectedDrivers.length !== 2}
                >
                    Confirm Picks
                </button>
            </Modal>
        </div>
    );
}
