import { useState } from "react";
import Modal from "./Modal";
import classNames from "classnames";

export default function RankingsList({ scores, loggedInUser, title, className, loading }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const topEntries = scores.slice(0, 5); // First 5 entries
  const hasMoreEntries = scores.length > 5; // Check if more than 5

  return (
    <>
    <div 
      className={classNames(
        className, 
        "px-4 pt-6 pb-3 bg-neutral-500 rounded-2xl text-neutral-200 transition-all duration-300 ", 
        hasMoreEntries ? "pb-3" : "pb-6",
        { " hover:bg-neutral-400 hover:cursor-pointer hover:px-3 ": hasMoreEntries }
      )}
      onClick={() => hasMoreEntries && setIsModalOpen(true)}
      disabled={!hasMoreEntries}
    >
      {/* {title && <h2 className="text-xl font-bold mb-2">{title}</h2>} */}
      <ul className="flex flex-col gap-2">
        {scores.length > 0 ? (
          topEntries.map((entry, index) => (
            <li key={`${entry.username}-${index}`}>
              <div className={classNames(
                "w-full text-left font-bold bg-neutral-200 rounded-lg flex items-center justify-between gap-4",
                entry.username === loggedInUser ? "shadow-raised text-cyan-800" : "text-neutral-600",
                entry.headshot_url ? "pr-2" : "py-1 px-2"
              )}>
                {entry.headshot_url && (
                  <div className="rounded-l-md shrink-0" style={{backgroundColor: `#${entry.teamColour}`}} >
                    <img src={entry.headshot_url} alt={entry.username} className="h-10 -mt-4" />
                  </div>
                )}
                <p className={classNames(
                    "grow leading-none text-sm",
                )}>{entry.username}</p>
                <p className="shrink-0">{entry.finalResult}</p>
              </div>
            </li>
          ))
        ) : (
          <div>
            {loading ? (
              <div className="animate-pulse space-y-2">
                  <div className="bg-neutral-600 h-6 w-full rounded-md" />
                  <div className="bg-neutral-600 h-6 w-full rounded-md" />
                  <div className="bg-neutral-600 h-6 w-full rounded-md" />
                  <div className="bg-neutral-600 h-6 w-full rounded-md" />
                  <div className="bg-neutral-600 h-6 w-full rounded-md" />
                  <div className="bg-neutral-600 h-6 w-full rounded-md" />
              </div>
            ) : (
              <li>No rankings available.</li>
            )}
          </div>
        )}
      </ul>

      {hasMoreEntries && (
        <button
          className="mt-2 px-4 py-2 text-white font-bold rounded-xl w-full pointer-events-none"
          disabled
        >
          Full Rankings
        </button>
      )}

    </div>
    {/* Modal for Full Rankings */}
    <Modal title={title} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={loggedInUser}>
      <ul className="flex flex-col gap-2">
        {scores.map((entry, index) => (
          <li key={`${entry.username}-${index}`}>
            <div className={classNames(
              "w-full text-left font-bold bg-neutral-200 rounded-lg flex items-center justify-between gap-4",
              entry.username === loggedInUser ? "shadow-raised text-cyan-800" : "text-neutral-600",
              entry.headshot_url ? "pr-2" : "py-1 px-2"
            )}>
              {entry.headshot_url && (
                <div className="rounded-l-md shrink-0" style={{backgroundColor: `#${entry.teamColour}`}} >
                  <img src={entry.headshot_url} alt={entry.username} className="h-10 -mt-4" />
                </div>
              )}
              <p className={classNames(
                  "grow leading-none capitalize",
              )}>{entry.username}</p>
              <p className="shrink-0">{entry.finalResult}</p>
            </div>
          </li>
        ))}
      </ul>
    </Modal>
    </>
  );
}