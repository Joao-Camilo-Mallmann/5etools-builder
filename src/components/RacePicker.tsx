import { useMemo, useState } from "react";

import type { BuilderRace } from "../types";

interface RacePickerProps {
  races: BuilderRace[];
  selectedRaceId: string | null;
  onSelect: (raceId: string | null) => void;
}

export function RacePicker({
  races,
  selectedRaceId,
  onSelect,
}: RacePickerProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return races;
    const query = search.toLowerCase();
    return races.filter(
      (race) =>
        race.name.toLowerCase().includes(query) ||
        race.source.toLowerCase().includes(query),
    );
  }, [races, search]);

  return (
    <section>
      <div className="picker-header">
        <h2>Choose Your Race</h2>
        <p>
          Your race determines your heritage, abilities, and traits. Select one
          to continue.
        </p>
      </div>

      <div className="picker-search">
        <span className="picker-search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search races..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="race-search"
        />
      </div>

      <p className="picker-count">
        {filtered.length} race{filtered.length !== 1 ? "s" : ""} available
        {search && ` (filtered from ${races.length})`}
      </p>

      {filtered.length > 0 ? (
        <div className="picker-grid">
          {filtered.map((race) => (
            <div
              key={race.id}
              className={`picker-card ${selectedRaceId === race.id ? "selected" : ""}`}
              onClick={() =>
                onSelect(selectedRaceId === race.id ? null : race.id)
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(selectedRaceId === race.id ? null : race.id);
                }
              }}
            >
              <span className="picker-card-name">{race.name}</span>
              <span className="picker-card-source">{race.source}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="picker-empty">
          No races match "{search}". Try a different search.
        </p>
      )}
    </section>
  );
}
