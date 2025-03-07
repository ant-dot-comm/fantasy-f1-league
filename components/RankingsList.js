export default function RankingsList({ scores, loggedInUser }) {
    return (
      <div className="p-6 bg-neutral-700 rounded-2xl text-neutral-200">
        <ul className="gap-2">
          {scores.length > 0 ? (
            scores.map((entry, index) => (
              <li
                key={`${entry.username}-${index}`}
                className={`${entry.username === loggedInUser ? "bg-yellow-200 font-bold text-neutral-800" : ""}`}
              >
                <div className="w-full text-left font-bold bg-neutral-200 text-neutral-800 px-2 rounded-lg flex items-center justify-between gap-4 border-b-8 border-neutral-500">
                  <p className="grow leading-none">{entry.username}</p>
                  <p className="shrink-0">{entry.finalResult}</p>
                </div>
              </li>
            ))
          ) : (
            <li>No race scores available.</li>
          )}
        </ul>
      </div>
    );
  }