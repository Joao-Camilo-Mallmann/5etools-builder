import { Search } from "lucide-react";
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
    const q = search.trim().toLowerCase();
    let list = q
      ? classes.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.source.toLowerCase().includes(q),
        )
      : [...classes];
    return list;
  }, [classes, search]);

  return (
    <div className="card-grid-picker">
      <div className="card-grid-picker__search">
        <Search size={18} className="text-muted" />
        <input
          type="search"
          placeholder="Search classes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="button-icon" onClick={() => setSearch("")} aria-label="Clear search">
            ×
          </button>
        )}
      </div>

      <div className="card-grid-picker__grid" role="listbox" aria-label="Classes">
        {filtered.length === 0 ? (
          <div className="card-grid-picker__empty">No classes match "{search}"</div>
        ) : (
          filtered.map((c) => (
            <div
              key={c.id}
              role="option"
              aria-selected={selectedClassId === c.id}
              className={`card-grid-picker__card ${selectedClassId === c.id ? "selected" : ""}`}
              onClick={() => onSelect(selectedClassId === c.id ? null : c.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(selectedClassId === c.id ? null : c.id);
                }
              }}
              tabIndex={0}
            >
              <div className="card-grid-picker__card-header">
                <h3 className="card-grid-picker__card-name">{c.name}</h3>
                <span className="card-grid-picker__card-source">{c.source}</span>
              </div>
              <p className="card-grid-picker__card-desc">
                Select this class to proceed. Additional class details (hit die, proficiencies, spellcasting) will appear here.
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
