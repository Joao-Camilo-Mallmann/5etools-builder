import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import type { BuilderBackground } from "../types";

interface BackgroundPickerProps {
  backgrounds: BuilderBackground[];
  selectedBackgroundId: string | null;
  onSelect: (backgroundId: string | null) => void;
}

export function BackgroundPicker({
  backgrounds,
  selectedBackgroundId,
  onSelect,
}: BackgroundPickerProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = q
      ? backgrounds.filter(
          (bg) =>
            bg.name.toLowerCase().includes(q) ||
            bg.source.toLowerCase().includes(q),
        )
      : [...backgrounds];
    return list;
  }, [backgrounds, search]);

  return (
    <div className="card-grid-picker">
      <div className="card-grid-picker__search">
        <Search size={18} className="text-muted" />
        <input
          type="search"
          placeholder="Search backgrounds…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="button-icon" onClick={() => setSearch("")} aria-label="Clear search">
            ×
          </button>
        )}
      </div>

      <div className="card-grid-picker__grid" role="listbox" aria-label="Backgrounds">
        {filtered.length === 0 ? (
          <div className="card-grid-picker__empty">No backgrounds match "{search}"</div>
        ) : (
          filtered.map((bg) => (
            <div
              key={bg.id}
              role="option"
              aria-selected={selectedBackgroundId === bg.id}
              className={`card-grid-picker__card ${selectedBackgroundId === bg.id ? "selected" : ""}`}
              onClick={() => onSelect(selectedBackgroundId === bg.id ? null : bg.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(selectedBackgroundId === bg.id ? null : bg.id);
                }
              }}
              tabIndex={0}
            >
              <div className="card-grid-picker__card-header">
                <h3 className="card-grid-picker__card-name">{bg.name}</h3>
                <span className="card-grid-picker__card-source">{bg.source}</span>
              </div>
              <p className="card-grid-picker__card-desc">
                Select this background to proceed. Skills, languages, and starting equipment are determined by your background.
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
