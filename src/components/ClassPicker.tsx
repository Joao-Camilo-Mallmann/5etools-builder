import { useMemo, useState } from "react";

import type { BuilderClass } from "../types";

interface ClassPickerProps {
  classes: BuilderClass[];
  selectedClassId: string | null;
  onSelect: (classId: string | null) => void;
}

export function ClassPicker({
  classes,
  selectedClassId,
  onSelect,
}: ClassPickerProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return classes;
    const query = search.toLowerCase();
    return classes.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.source.toLowerCase().includes(query),
    );
  }, [classes, search]);

  return (
    <section>
      <div className="picker-header">
        <h2>Choose Your Class</h2>
        <p>
          Your class defines your combat style, abilities, and role in the
          party.
        </p>
      </div>

      <div className="picker-search">
        <span className="picker-search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search classes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="class-search"
        />
      </div>

      <p className="picker-count">
        {filtered.length} class{filtered.length !== 1 ? "es" : ""} available
        {search && ` (filtered from ${classes.length})`}
      </p>

      {filtered.length > 0 ? (
        <div className="picker-grid">
          {filtered.map((builderClass) => (
            <div
              key={builderClass.id}
              className={`picker-card ${selectedClassId === builderClass.id ? "selected" : ""}`}
              onClick={() =>
                onSelect(
                  selectedClassId === builderClass.id ? null : builderClass.id,
                )
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(
                    selectedClassId === builderClass.id
                      ? null
                      : builderClass.id,
                  );
                }
              }}
            >
              <span className="picker-card-name">{builderClass.name}</span>
              <span className="picker-card-source">{builderClass.source}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="picker-empty">
          No classes match "{search}". Try a different search.
        </p>
      )}
    </section>
  );
}
