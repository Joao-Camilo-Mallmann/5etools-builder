import { CheckCircle, Leaf, Search, Sword } from "lucide-react";
import { useMemo, useState } from "react";

import type { BuilderSubrace } from "../types";

type SortKey = "name" | "source";
type SortDir = "asc" | "desc";

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
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const selectedSubrace =
    subraces.find((sr) => sr.id === selectedSubraceId) ?? null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = q
      ? subraces.filter(
          (sr) =>
            sr.name.toLowerCase().includes(q) ||
            sr.source.toLowerCase().includes(q),
        )
      : [...subraces];
    list.sort((a, b) => {
      const av = a[sortKey].toLowerCase();
      const bv = b[sortKey].toLowerCase();
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return list;
  }, [subraces, search, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }
  const si = (k: SortKey) =>
    sortKey === k ? (sortDir === "asc" ? " ▲" : " ▼") : "";

  if (!hasSelectedRace) {
    return (
      <section className="split-picker">
        <div className="split-picker__detail-initial split-picker__detail-initial--full">
          <Leaf size={32} className="split-picker__detail-initial-icon" />
          <p>Pick a race first to see its subraces.</p>
        </div>
      </section>
    );
  }

  if (subraces.length === 0) {
    return (
      <section className="split-picker">
        <div className="split-picker__detail-initial split-picker__detail-initial--full">
          <CheckCircle
            size={32}
            className="split-picker__detail-initial-icon"
          />
          <p>
            {raceName ? (
              <>
                <strong>{raceName}</strong> has no subrace options.
              </>
            ) : (
              "This race has no subrace options."
            )}{" "}
            You can proceed to the next step.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="split-picker">
      {/* ── Left: list panel ──────────────────────────────── */}
      <div className="split-picker__list-col">
        {raceName && (
          <div className="split-picker__context-badge">
            <Sword size={12} /> Subraces for: <strong>{raceName}</strong>
          </div>
        )}

        <div className="split-picker__search-bar">
          <Search size={13} className="split-picker__search-glass" />
          <input
            type="search"
            id="subrace-search"
            placeholder="Search subraces…"
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

        <ul className="split-picker__list" role="listbox" aria-label="Subraces">
          {filtered.length === 0 ? (
            <li className="split-picker__list-empty">
              No subraces match "{search}"
            </li>
          ) : (
            filtered.map((sr) => (
              <li
                key={sr.id}
                role="option"
                aria-selected={selectedSubraceId === sr.id}
                className={`split-picker__list-item${selectedSubraceId === sr.id ? " selected" : ""}`}
                onClick={() =>
                  onSelect(selectedSubraceId === sr.id ? null : sr.id)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(selectedSubraceId === sr.id ? null : sr.id);
                  }
                }}
                tabIndex={0}
              >
                <span className="split-picker__item-name">{sr.name}</span>
                <span className="split-picker__item-source">{sr.source}</span>
              </li>
            ))
          )}
        </ul>

        <div className="split-picker__list-count">
          {filtered.length} of {subraces.length} subrace
          {subraces.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ── Right: detail panel ───────────────────────────── */}
      <div className="split-picker__detail-col">
        {selectedSubrace ? (
          <div className="split-picker__detail-block" key={selectedSubrace.id}>
            <div className="split-picker__detail-header">
              <h2 className="split-picker__detail-name">
                {selectedSubrace.name}
              </h2>
              <span className="split-picker__detail-source">
                {selectedSubrace.source}
              </span>
            </div>
            <div className="split-picker__detail-body">
              {selectedSubrace.entriesSummary ? (
                <p className="split-picker__detail-desc">
                  {selectedSubrace.entriesSummary}
                </p>
              ) : (
                <p className="split-picker__detail-empty">
                  No subrace description available.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="split-picker__detail-initial">
            <Leaf size={32} className="split-picker__detail-initial-icon" />
            <p>Select a subrace from the list to view details.</p>
          </div>
        )}
      </div>
    </section>
  );
}
