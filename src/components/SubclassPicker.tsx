import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import type { BuilderSubclass } from "../types";

interface SubclassPickerProps {
  subclasses: BuilderSubclass[];
  selectedSubclassId: string | null;
  hasSelectedClass: boolean;
  className: string | null;
  onSelect: (subclassId: string | null) => void;
}

export function SubclassPicker({
  subclasses,
  selectedSubclassId,
  hasSelectedClass,
  className,
  onSelect,
}: SubclassPickerProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = q
      ? subclasses.filter(
          (sc) =>
            sc.name.toLowerCase().includes(q) ||
            sc.source.toLowerCase().includes(q),
        )
      : [...subclasses];
    return list;
  }, [subclasses, search]);

  if (!hasSelectedClass) {
    return (
      <div className="card-grid-picker">
        <div className="card-grid-picker__empty">
          <p>Pick a class first to see its subclasses.</p>
        </div>
      </div>
    );
  }

  if (subclasses.length === 0) {
    return (
      <div className="card-grid-picker">
        <div className="card-grid-picker__empty">
          <p>
            <strong>{className}</strong> has no explicit subclass options. You
            can proceed to the next step.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-grid-picker">
      <div className="card-grid-picker__search">
        <Search size={18} className="text-muted" />
        <input
          type="search"
          placeholder={`Search subclasses for ${className}…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="button-icon" onClick={() => setSearch("")} aria-label="Clear search">
            ×
          </button>
        )}
      </div>

      <div className="card-grid-picker__grid" role="listbox" aria-label="Subclasses">
        {filtered.length === 0 ? (
          <div className="card-grid-picker__empty">No subclasses match "{search}"</div>
        ) : (
          filtered.map((sc) => (
            <div
              key={sc.id}
              role="option"
              aria-selected={selectedSubclassId === sc.id}
              className={`card-grid-picker__card ${selectedSubclassId === sc.id ? "selected" : ""}`}
              onClick={() => onSelect(selectedSubclassId === sc.id ? null : sc.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(selectedSubclassId === sc.id ? null : sc.id);
                }
              }}
              tabIndex={0}
            >
              <div className="card-grid-picker__card-header">
                <h3 className="card-grid-picker__card-name">{sc.name}</h3>
                <span className="card-grid-picker__card-source">{sc.source}</span>
              </div>
              {sc.features.length > 0 ? (
                <p className="card-grid-picker__card-desc">
                  <strong>Features:</strong> {sc.features.slice(0, 3).join(", ")}
                  {sc.features.length > 3 && "..."}
                </p>
              ) : (
                <p className="card-grid-picker__card-desc empty">
                  No features available.
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
