import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Modal from "@/components/Modal";
import classNames from "classnames";

export default function CurrentPick({ season, username }) {
  const [currentRace, setCurrentRace] = useState(null);
  const [userPicks, setUserPicks] = useState([]);
  const [bottomDrivers, setBottomDrivers] = useState([]);
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  // ✅ Fetch current race details
  useEffect(() => {
    async function fetchRace() {
      try {
        const res = await axios.get(`/api/currentRace?season=${season}`);
        setCurrentRace(res.data);
      } catch (error) {
        console.error("❌ Error fetching current race:", error);
      }
    }

    fetchRace();
  }, [season]);

  // ✅ Fetch user's picks for the current race
  useEffect(() => {
    if (!currentRace) return;

    async function fetchPicks() {
      try {
        const res = await axios.get(`/api/userPicks?username=${username}&meeting_key=${currentRace.meeting_key}&season=${season}`);
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
        const res = await axios.get(`/api/bottomDrivers?meeting_key=${currentRace.meeting_key}&season=${season}`);
        setBottomDrivers(res.data);
        console.log(res.data);
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

  if (!currentRace && season === new Date().getFullYear()) return <p>{season} Season has not started</p>;
  if (!currentRace) return <p>Loading {season} current race...</p>;

  const hasRaceSessionStarted = false; // ✅ Placeholder for future logic

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">{currentRace ? `${season} ${currentRace.meeting_name}` : "Season has not started"}</h2>
      {userPicks.length > 0 && (
        <p className="mt-2">
          <strong>Your Picks:</strong> Driver {userPicks.join(", ")}
        </p>
      )}

      {!hasRaceSessionStarted && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          {userPicks.length > 0 ? "Update Picks" : "Make Picks"}
        </button>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={username} title="Race Picks">
        <p className="font-bold leading-none">{season} {currentRace.meeting_name}</p>
        <h3 className="mb-4 text-sm text-neutral-500">Select two drivers</h3>
        <ul className="flex flex-col gap-2">
          {bottomDrivers
            .sort((a, b) => a.qualifyingPosition - b.qualifyingPosition) // ✅ Sort by start position (11-20)
            .map((driver) => (
              <li key={driver.driverNumber}>
                <button
                  className={`flex flex-row items-center text-xs w-full text-left rounded-lg shadow-2xl px-1 ${
                    selectedDrivers.includes(driver.driverNumber) ? "bg-slate-600 text-neutral-200" : "bg-neutral-200 text-neutral-800"
                  }`}
                  onClick={() => toggleDriverSelection(driver.driverNumber)}
                >
                  <div className="rounded-l-md" style={{backgroundColor: `#${driver.teamColour}`}} >
                    <img src={driver.headshot} alt={driver.fullName} className="h-10 -mt-4" />
                  </div>
                  <div className="mx-2 flex flex-row items-center font-display">
                    <span className={classNames("mr-2", selectedDrivers.includes(driver.driverNumber) ? "text-neutral-300" : " text-neutral-800")}>P{driver.qualifyingPosition}</span>
                    <span className="text-lg">{driver.fullName}</span>
                  </div>
                </button>
              </li>
            ))}
        </ul>
        <button className="px-4 py-2 mt-4 w-full bg-blue-500 text-white rounded-lg font-bold" onClick={submitPick} disabled={selectedDrivers.length !== 2}>
            Confirm Picks
          </button>
      </Modal>
    </div>
  );
}