import { Search } from "lucide-react";
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
    const q = search.trim().toLowerCase();
    const list = q
      ? races.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.source.toLowerCase().includes(q),
        )
      : [...races];
    return list;
  }, [races, search]);

  return (
    <div className="card-grid-picker">
      <div className="card-grid-picker__search">
        <Search size={18} className="text-muted" />
        <input
          type="search"
          placeholder="Search races…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="button-icon" onClick={() => setSearch("")} aria-label="Clear search">
            ×
          </button>
        )}
      </div>

      <div className="card-grid-picker__grid" role="listbox" aria-label="Races">
        {filtered.length === 0 ? (
          <div className="card-grid-picker__empty">No races match "{search}"</div>
        ) : (
          filtered.map((race) => (
            <div
              key={race.id}
              role="option"
              aria-selected={selectedRaceId === race.id}
              className={`card-grid-picker__card ${selectedRaceId === race.id ? "selected" : ""}`}
              onClick={() => onSelect(selectedRaceId === race.id ? null : race.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(selectedRaceId === race.id ? null : race.id);
                }
              }}
              tabIndex={0}
            >
              <div className="card-grid-picker__card-header">
                <h3 className="card-grid-picker__card-name">{race.name}</h3>
                <span className="card-grid-picker__card-source">{race.source}</span>
              </div>
              {race.entriesSummary ? (
                <p className="card-grid-picker__card-desc">
                  {race.entriesSummary}
                </p>
              ) : (
                <p className="card-grid-picker__card-desc empty">
                  No description available.
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
