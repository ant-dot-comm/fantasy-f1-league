import { useState } from "react";
import Modal from "./Modal";

export default function RankingsList({ scores, loggedInUser, title }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const topEntries = scores.slice(0, 5); // First 5 entries
  const hasMoreEntries = scores.length > 5; // Check if more than 5

  return (
    <div className="p-6 bg-neutral-700 rounded-2xl text-neutral-200">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <ul className="gap-2">
        {scores.length > 0 ? (
          topEntries.map((entry, index) => (
            <li
              key={`${entry.username}-${index}`}
              className={`${
                entry.username === loggedInUser
                  ? "bg-yellow-200 font-bold text-neutral-800"
                  : ""
              }`}
            >
              <div className="w-full text-left font-bold bg-neutral-200 text-neutral-800 px-2 rounded-lg flex items-center justify-between gap-4 border-b-8 border-neutral-500">
                <p className="grow leading-none">{entry.username}</p>
                <p className="shrink-0">{entry.finalResult}</p>
              </div>
            </li>
          ))
        ) : (
          <li>No rankings available.</li>
        )}
      </ul>

      {hasMoreEntries && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded w-full"
        >
          Full Rankings
        </button>
      )}

      {/* Modal for Full Rankings */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={title}>
        <ul className="gap-2">
          {scores.map((entry, index) => (
            <li
              key={`${entry.username}-${index}`}
              className={`${
                entry.username === loggedInUser
                  ? "bg-yellow-200 font-bold text-neutral-800"
                  : ""
              }`}
            >
              <div className="w-full text-left font-bold bg-neutral-200 text-neutral-800 px-2 rounded-lg flex items-center justify-between gap-4 border-b-8 border-neutral-500">
                <p className="grow leading-none">{entry.username}</p>
                <p className="shrink-0">{entry.finalResult}</p>
              </div>
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}