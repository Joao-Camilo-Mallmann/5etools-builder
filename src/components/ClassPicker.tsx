import { Search, Sword } from "lucide-react";
import { useMemo, useState } from "react";

import type { BuilderClass } from "../types";

type SortKey = "name" | "source";
type SortDir = "asc" | "desc";

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
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const selectedClass = useMemo(
    () => classes.find((c) => c.id === selectedClassId) ?? null,
    [classes, selectedClassId],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = q
      ? classes.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.source.toLowerCase().includes(q),
        )
      : [...classes];

    list.sort((a, b) => {
      const av = a[sortKey].toLowerCase();
      const bv = b[sortKey].toLowerCase();
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return list;
  }, [classes, search, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? " ▲" : " ▼") : "";

  return (
    <section className="split-picker">
      {/* ── Left: list panel ──────────────────────────────── */}
      <div className="split-picker__list-col">
        <div className="split-picker__search-bar">
          <Search size={13} className="split-picker__search-glass" />
          <input
            type="search"
            id="class-search"
            placeholder="Search classes…"
            autoComplete="off"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="split-picker__search-input"
          />
          {search && (
            <button
              className="split-picker__search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="split-picker__sort-bar">
          <button
            className={`split-picker__sort-btn${sortKey === "name" ? " active" : ""}`}
            onClick={() => toggleSort("name")}
          >
            Name{sortIndicator("name")}
          </button>
          <button
            className={`split-picker__sort-btn split-picker__sort-btn--grow${sortKey === "source" ? " active" : ""}`}
            onClick={() => toggleSort("source")}
          >
            Source{sortIndicator("source")}
          </button>
        </div>

        <ul className="split-picker__list" role="listbox" aria-label="Classes">
          {filtered.length === 0 ? (
            <li className="split-picker__list-empty">
              No classes match "{search}"
            </li>
          ) : (
            filtered.map((c) => (
              <li
                key={c.id}
                role="option"
                aria-selected={selectedClassId === c.id}
                className={`split-picker__list-item${selectedClassId === c.id ? " selected" : ""}`}
                onClick={() => onSelect(selectedClassId === c.id ? null : c.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(selectedClassId === c.id ? null : c.id);
                  }
                }}
                tabIndex={0}
              >
                <span className="split-picker__item-name">{c.name}</span>
                <span className="split-picker__item-source">{c.source}</span>
              </li>
            ))
          )}
        </ul>

        <div className="split-picker__list-count">
          {filtered.length} of {classes.length} class
          {classes.length !== 1 ? "es" : ""}
        </div>
      </div>

      {/* ── Right: detail panel ───────────────────────────── */}
      <div className="split-picker__detail-col">
        {selectedClass ? (
          <div className="split-picker__detail-block" key={selectedClass.id}>
            <div className="split-picker__detail-header">
              <h2 className="split-picker__detail-name">
                {selectedClass.name}
              </h2>
              <span className="split-picker__detail-source">
                {selectedClass.source}
              </span>
            </div>
            <div className="split-picker__detail-body">
              <p className="split-picker__detail-placeholder">
                Select this class to proceed. Additional class details (hit die,
                proficiencies, spellcasting) will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="split-picker__detail-initial">
            <Sword size={32} className="split-picker__detail-initial-icon" />
            <p>Select a class from the list to view details.</p>
          </div>
        )}
      </div>
    </section>
  );
}
