import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function CurrentPick({ season, username }) {
  const [currentRace, setCurrentRace] = useState(null);
  const [userPicks, setUserPicks] = useState([]);
  const [bottomDrivers, setBottomDrivers] = useState([]);
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

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

  useEffect(() => {
    if (!currentRace) return;

    async function fetchBottomDrivers() {
      try {
        const res = await axios.get(`/api/bottomDrivers?meeting_key=${currentRace.meeting_key}`);
        setBottomDrivers(res.data);
      } catch (error) {
        console.error("❌ Error fetching bottom 10 drivers:", error);
      }
    }

    fetchBottomDrivers();
  }, [currentRace]);

  function toggleDriverSelection(driverNumber) {
    if (selectedDrivers.includes(driverNumber)) {
      setSelectedDrivers(selectedDrivers.filter((num) => num !== driverNumber));
    } else if (selectedDrivers.length < 2) {
      setSelectedDrivers([...selectedDrivers, driverNumber]);
    }
  }

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

  const hasRaceSessionStarted = false; // ✅ Add logic later based on race start times, will have to manually create.

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">{!!currentRace ? `${season} ${currentRace.meeting_name}`: "Season has not started"}</h2>
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

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-600 p-6 rounded-lg">
            <p className="mb-4">{season} {currentRace.meeting_name}</p>
            <h3 className="font-bold mb-4">Select Two Drivers</h3>
            <ul>
              {bottomDrivers
                .sort((a, b) => a.qualifyingPosition - b.qualifyingPosition) // ✅ Sort from 11 to 20
                .map((driver) => (
                  <li key={driver.driverNumber}>
                    <button
                      className={`block text-xs w-full text-left p-2 border ${
                        selectedDrivers.includes(driver.driverNumber) ? "bg-slate-600" : ""
                      }`}
                      onClick={() => toggleDriverSelection(driver.driverNumber)}
                    >
                      <p>p{driver.qualifyingPosition} - Driver {driver.fullName} ({driver.driverNumber})</p> 
                      <p>{driver.team}</p>
                    </button>
                  </li>
                ))}
            </ul>
            <div className="mt-4 flex justify-between">
              <button className="px-4 py-2 rounded" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={submitPick} disabled={selectedDrivers.length !== 2}>
                Confirm Picks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}