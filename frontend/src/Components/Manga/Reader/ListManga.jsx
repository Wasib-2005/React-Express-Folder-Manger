import { useMemo, useState } from "react";

const ListManga = ({ manga }) => {
  const [matchWords, setMatchWords] = useState(3);
  const [groupEnabled, setGroupEnabled] = useState(true);

  function groupManga(mangaList, matchWords) {
    const groups = [];

    const normalize = (name) =>
      name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/);

    for (const mangaItem of mangaList) {
      const words = normalize(mangaItem.name);

      let foundGroup = null;

      for (const group of groups) {
        const groupWords = normalize(group.name);
        const matched = words.filter((w) => groupWords.includes(w));

        if (matched.length >= matchWords) {
          foundGroup = group;
          break;
        }
      }

      if (foundGroup) {
        foundGroup.episodes.push(mangaItem);
      } else {
        groups.push({
          name: mangaItem.name,
          episodes: [mangaItem],
        });
      }
    }

    return groups;
  }

  const groupedManga = useMemo(() => {
    if (!groupEnabled) {
      return (manga || []).map((m) => ({
        name: m.name,
        episodes: [m],
      }));
    }

    return groupManga(manga || [], matchWords);
  }, [manga, matchWords, groupEnabled]);

  const getCover = (title) => {
    const seed = title.replace(/\s+/g, "-");
    return `https://picsum.photos/seed/${seed}/300/420`;
  };

  return (
    <div className="space-y-6">

      {/* Control Panel */}
      <div className="flex flex-wrap items-center gap-4 bg-base-200 p-4 rounded-xl">

        <button
          className={`btn btn-sm ${groupEnabled ? "btn-primary" : "btn-outline"}`}
          onClick={() => setGroupEnabled((prev) => !prev)}
        >
          {groupEnabled ? "Grouping ON" : "Grouping OFF"}
        </button>

        <span className="font-semibold">Match Words</span>

        <input
          type="range"
          min="1"
          max="5"
          value={matchWords}
          disabled={!groupEnabled}
          onChange={(e) => setMatchWords(Number(e.target.value))}
          className="range range-primary w-40"
        />

        <span className="badge badge-primary">{matchWords}</span>
      </div>

      {/* Manga Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {groupedManga.map((group, i) => (
          <div
            key={i}
            className="bg-base-100 border border-base-300 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition"
          >

            {/* Cover */}
            <img
              src={getCover(group.name)}
              alt={group.name}
              className="w-full h-56 object-cover"
            />

            <div className="p-4">

              <div className="flex justify-between items-start mb-3">
                <h2 className="font-semibold text-sm line-clamp-2">
                  {group.name}
                </h2>

                <span className="badge badge-outline text-xs">
                  {group.episodes.length}
                </span>
              </div>

              <select className="select select-bordered select-sm w-full">
                {group.episodes
                  .sort((a, b) => Number(a.ep) - Number(b.ep))
                  .map((ep, j) => (
                    <option key={j} value={ep.ep}>
                      Episode {ep.ep}
                    </option>
                  ))}
              </select>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListManga;