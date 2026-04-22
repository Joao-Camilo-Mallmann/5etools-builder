import { useMemo, useState } from "react";

import type { BuilderSubrace } from "../types";

interface SubracePickerProps {
  subraces: BuilderSubrace[];
  selectedSubraceId: string | null;
  hasSelectedRace: boolean;
  raceName: string | null;
  onSelect: (subraceId: string | null) => void;
}

export function SubracePicker({
  subraces,
  selectedSubraceId,
  hasSelectedRace,
  raceName,
  onSelect,
}: SubracePickerProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return subraces;
    const query = search.toLowerCase();
    return subraces.filter(
      (sr) =>
        sr.name.toLowerCase().includes(query) ||
        sr.source.toLowerCase().includes(query),
    );
  }, [subraces, search]);

  if (!hasSelectedRace) {
    return (
      <section>
        <div className="picker-header">
          <h2>Choose Subrace</h2>
        </div>
        <p className="picker-empty">Pick a race first to see subraces.</p>
      </section>
    );
  }

  if (subraces.length === 0) {
    return (
      <section>
        <div className="picker-header">
          <h2>Choose Subrace</h2>
        </div>
        {raceName && (
          <span className="picker-context">
            ⚔ Subraces for: <strong>{raceName}</strong>
          </span>
        )}
        <p className="picker-empty">
          This race has no subrace options. You can proceed to the next step.
        </p>
      </section>
    );
  }

  return (
    <section>
      <div className="picker-header">
        <h2>Choose Your Subrace</h2>
        <p>Each subrace offers unique traits and abilities.</p>
      </div>

      {raceName && (
        <span className="picker-context">
          ⚔ Subraces for: <strong>{raceName}</strong>
        </span>
      )}

      <div className="picker-search">
        <span className="picker-search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search subraces..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="subrace-search"
        />
      </div>

      <p className="picker-count">
        {filtered.length} subrace{filtered.length !== 1 ? "s" : ""} available
      </p>

      {filtered.length > 0 ? (
        <div className="picker-grid">
          {filtered.map((subrace) => (
            <div
              key={subrace.id}
              className={`picker-card ${selectedSubraceId === subrace.id ? "selected" : ""}`}
              onClick={() =>
                onSelect(
                  selectedSubraceId === subrace.id ? null : subrace.id,
                )
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(
                    selectedSubraceId === subrace.id ? null : subrace.id,
                  );
                }
              }}
            >
              <span className="picker-card-name">{subrace.name}</span>
              <span className="picker-card-source">{subrace.source}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="picker-empty">No subraces match your search.</p>
      )}

      {selectedSubraceId && (() => {
        const selected = subraces.find((sr) => sr.id === selectedSubraceId);
        if (!selected || !selected.entriesSummary) return null;
        return (
          <article className="detail-card">
            <h3>
              {selected.name} <span>({selected.source})</span>
            </h3>
            <p>{selected.entriesSummary}</p>
          </article>
        );
      })()}
    </section>
  );
}
