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
    if (!search.trim()) return backgrounds;
    const query = search.toLowerCase();
    return backgrounds.filter(
      (bg) =>
        bg.name.toLowerCase().includes(query) ||
        bg.source.toLowerCase().includes(query),
    );
  }, [backgrounds, search]);

  return (
    <section>
      <div className="picker-header">
        <h2>Choose Your Background</h2>
        <p>
          Your background tells the story of where you came from and what you
          did before adventuring.
        </p>
      </div>

      <div className="picker-search">
        <span className="picker-search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search backgrounds..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="background-search"
        />
      </div>

      <p className="picker-count">
        {filtered.length} background{filtered.length !== 1 ? "s" : ""}{" "}
        available
        {search && ` (filtered from ${backgrounds.length})`}
      </p>

      {filtered.length > 0 ? (
        <div className="picker-grid">
          {filtered.map((background) => (
            <div
              key={background.id}
              className={`picker-card ${selectedBackgroundId === background.id ? "selected" : ""}`}
              onClick={() =>
                onSelect(
                  selectedBackgroundId === background.id
                    ? null
                    : background.id,
                )
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(
                    selectedBackgroundId === background.id
                      ? null
                      : background.id,
                  );
                }
              }}
            >
              <span className="picker-card-name">{background.name}</span>
              <span className="picker-card-source">{background.source}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="picker-empty">
          No backgrounds match "{search}". Try a different search.
        </p>
      )}
    </section>
  );
}
