import { Scroll, Search } from "lucide-react";
import { useMemo, useState } from "react";

import type { BuilderBackground } from "../types";

type SortKey = "name" | "source";
type SortDir = "asc" | "desc";

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
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const selectedBackground =
    backgrounds.find((bg) => bg.id === selectedBackgroundId) ?? null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = q
      ? backgrounds.filter(
          (bg) =>
            bg.name.toLowerCase().includes(q) ||
            bg.source.toLowerCase().includes(q),
        )
      : [...backgrounds];
    list.sort((a, b) => {
      const av = a[sortKey].toLowerCase();
      const bv = b[sortKey].toLowerCase();
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return list;
  }, [backgrounds, search, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }
  const si = (k: SortKey) =>
    sortKey === k ? (sortDir === "asc" ? " ▲" : " ▼") : "";

  return (
    <section className="split-picker">
      {/* ── Left: list panel ──────────────────────────────── */}
      <div className="split-picker__list-col">
        <div className="split-picker__search-bar">
          <Search size={13} className="split-picker__search-glass" />
          <input
            type="search"
            id="background-search"
            placeholder="Search backgrounds…"
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
            Name{si("name")}
          </button>
          <button
            className={`split-picker__sort-btn split-picker__sort-btn--grow${sortKey === "source" ? " active" : ""}`}
            onClick={() => toggleSort("source")}
          >
            Source{si("source")}
          </button>
        </div>

        <ul
          className="split-picker__list"
          role="listbox"
          aria-label="Backgrounds"
        >
          {filtered.length === 0 ? (
            <li className="split-picker__list-empty">
              No backgrounds match "{search}"
            </li>
          ) : (
            filtered.map((bg) => (
              <li
                key={bg.id}
                role="option"
                aria-selected={selectedBackgroundId === bg.id}
                className={`split-picker__list-item${selectedBackgroundId === bg.id ? " selected" : ""}`}
                onClick={() =>
                  onSelect(selectedBackgroundId === bg.id ? null : bg.id)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(selectedBackgroundId === bg.id ? null : bg.id);
                  }
                }}
                tabIndex={0}
              >
                <span className="split-picker__item-name">{bg.name}</span>
                <span className="split-picker__item-source">{bg.source}</span>
              </li>
            ))
          )}
        </ul>

        <div className="split-picker__list-count">
          {filtered.length} of {backgrounds.length} background
          {backgrounds.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ── Right: detail panel ───────────────────────────── */}
      <div className="split-picker__detail-col">
        {selectedBackground ? (
          <div
            className="split-picker__detail-block"
            key={selectedBackground.id}
          >
            <div className="split-picker__detail-header">
              <h2 className="split-picker__detail-name">
                {selectedBackground.name}
              </h2>
              <span className="split-picker__detail-source">
                {selectedBackground.source}
              </span>
            </div>
            <div className="split-picker__detail-body">
              <p className="split-picker__detail-placeholder">
                Background details will appear here. Skills, languages, and
                starting equipment are determined by your background.
              </p>
            </div>
          </div>
        ) : (
          <div className="split-picker__detail-initial">
            <Scroll size={32} className="split-picker__detail-initial-icon" />
            <p>Select a background from the list to view details.</p>
          </div>
        )}
      </div>
    </section>
  );
}
