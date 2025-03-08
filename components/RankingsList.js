import { useState } from "react";
import Modal from "./Modal";
import classNames from "classnames";

export default function RankingsList({ scores, loggedInUser, title, className }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const topEntries = scores.slice(0, 5); // First 5 entries
  const hasMoreEntries = scores.length > 5; // Check if more than 5

  return (
    <div className={classNames(className, "px-4 pt-6 pb-3 bg-neutral-500 rounded-2xl text-neutral-200", hasMoreEntries ? "pb-3" : "pb-6")}>
      {/* {title && <h2 className="text-xl font-bold mb-2">{title}</h2>} */}
      <ul className="flex flex-col gap-2">
        {scores.length > 0 ? (
          topEntries.map((entry, index) => (
            <li key={`${entry.username}-${index}`}>
              <div className={classNames(
                "w-full text-left font-bold bg-neutral-200 px-2 py-1 rounded-lg flex items-center justify-between gap-4",
                entry.username === loggedInUser ? "shadow-lg text-cyan-800" : "text-neutral-600"
            )}>
                <p className={classNames(
                    "grow leading-none",
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
          className="mt-2 px-4 py-2 text-white font-bold rounded-xl w-full"
        >
          Full Rankings
        </button>
      )}

      {/* Modal for Full Rankings */}
      <Modal title={title} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={loggedInUser}>
        <ul className="flex flex-col gap-2">
          {scores.map((entry, index) => (
            <li key={`${entry.username}-${index}`}>
              <div 
                className={classNames(
                    "w-full text-left font-bold bg-neutral-200 px-2 py-1 rounded-lg flex items-center justify-between gap-4",
                    entry.username === loggedInUser ? "shadow-lg text-cyan-800" : "text-neutral-600"
                )}>
                <p className={classNames(
                    "grow leading-none",
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