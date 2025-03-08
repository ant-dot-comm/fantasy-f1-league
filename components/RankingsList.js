import { useState } from "react";
import Modal from "./Modal";
import classNames from "classnames";

export default function RankingsList({ scores, loggedInUser, title, className }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const topEntries = scores.slice(0, 5); // First 5 entries
  const hasMoreEntries = scores.length > 5; // Check if more than 5

  return (
    <div className={classNames(className, "p-6 bg-neutral-700 rounded-2xl text-neutral-200")}>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <ul className="flex flex-col gap-2">
        {scores.length > 0 ? (
          topEntries.map((entry, index) => (
            <li key={`${entry.username}-${index}`}>
              <div className={classNames(
                "w-full text-left font-bold bg-neutral-200 text-neutral-800 px-2 rounded-lg flex items-center justify-between gap-4",
                entry.username === loggedInUser ? "border-b-8 border-slate-600" : "border-b-8 border-neutral-500"
            )}>
                <p className={classNames(
                    "grow leading-none",
                    entry.username === loggedInUser && "text-slate-600"
                )}>{entry.username}</p>
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
        <ul className="flex flex-col gap-2">
          {scores.map((entry, index) => (
            <li key={`${entry.username}-${index}`}>
              <div 
                className={classNames(
                    "w-full text-left font-bold bg-neutral-200 text-neutral-800 px-2 rounded-lg flex items-center justify-between gap-4",
                    entry.username === loggedInUser ? "border-b-8 border-slate-600" : "border-b-8 border-neutral-500"
                )}>
                <p className={classNames(
                    "grow leading-none",
                    entry.username === loggedInUser && "text-slate-600"
                )}>{entry.username}</p>
                <p className="shrink-0">{entry.finalResult}</p>
              </div>
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}