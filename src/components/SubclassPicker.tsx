import { CheckCircle, Scroll, Search, Sword } from "lucide-react";
import { useMemo, useState } from "react";

import type { BuilderSubclass } from "../types";

type SortKey = "name" | "source";
type SortDir = "asc" | "desc";

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
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const selectedSubclass =
    subclasses.find((sc) => sc.id === selectedSubclassId) ?? null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = q
      ? subclasses.filter(
          (sc) =>
            sc.name.toLowerCase().includes(q) ||
            sc.source.toLowerCase().includes(q),
        )
      : [...subclasses];

    list.sort((a, b) => {
      const av = a[sortKey].toLowerCase();
      const bv = b[sortKey].toLowerCase();
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return list;
  }, [subclasses, search, sortKey, sortDir]);

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

  if (!hasSelectedClass) {
    return (
      <section className="split-picker">
        <div className="split-picker__detail-initial split-picker__detail-initial--full">
          <Scroll size={32} className="split-picker__detail-initial-icon" />
          <p>Pick a class first to see its subclasses.</p>
        </div>
      </section>
    );
  }

  if (subclasses.length === 0) {
    return (
      <section className="split-picker">
        <div className="split-picker__detail-initial split-picker__detail-initial--full">
          <CheckCircle
            size={32}
            className="split-picker__detail-initial-icon"
          />
          <p>
            <strong>{className}</strong> has no explicit subclass options. You
            can proceed to the next step.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="split-picker">
      {/* ── Left: list panel ──────────────────────────────── */}
      <div className="split-picker__list-col">
        {className && (
          <div className="split-picker__context-badge">
            <Sword size={12} /> Subclasses for: <strong>{className}</strong>
          </div>
        )}

        <div className="split-picker__search-bar">
          <Search size={13} className="split-picker__search-glass" />
          <input
            type="search"
            id="subclass-search"
            placeholder="Search subclasses…"
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

        <ul
          className="split-picker__list"
          role="listbox"
          aria-label="Subclasses"
        >
          {filtered.length === 0 ? (
            <li className="split-picker__list-empty">
              No subclasses match "{search}"
            </li>
          ) : (
            filtered.map((sc) => (
              <li
                key={sc.id}
                role="option"
                aria-selected={selectedSubclassId === sc.id}
                className={`split-picker__list-item${selectedSubclassId === sc.id ? " selected" : ""}`}
                onClick={() =>
                  onSelect(selectedSubclassId === sc.id ? null : sc.id)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(selectedSubclassId === sc.id ? null : sc.id);
                  }
                }}
                tabIndex={0}
              >
                <span className="split-picker__item-name">{sc.name}</span>
                <span className="split-picker__item-source">{sc.source}</span>
              </li>
            ))
          )}
        </ul>

        <div className="split-picker__list-count">
          {filtered.length} of {subclasses.length} subclass
          {subclasses.length !== 1 ? "es" : ""}
        </div>
      </div>

      {/* ── Right: detail panel ───────────────────────────── */}
      <div className="split-picker__detail-col">
        {selectedSubclass ? (
          <div className="split-picker__detail-block" key={selectedSubclass.id}>
            <div className="split-picker__detail-header">
              <h2 className="split-picker__detail-name">
                {selectedSubclass.name}
              </h2>
              <span className="split-picker__detail-source">
                {selectedSubclass.source}
              </span>
            </div>
            <div className="split-picker__detail-body">
              {selectedSubclass.className && (
                <p className="split-picker__detail-meta">
                  <strong>Class:</strong> {selectedSubclass.className}
                  {selectedSubclass.classSource
                    ? ` (${selectedSubclass.classSource})`
                    : ""}
                </p>
              )}
              {selectedSubclass.features.length > 0 && (
                <>
                  <p className="split-picker__detail-meta">
                    <strong>Features:</strong>
                  </p>
                  <ul className="split-picker__detail-list">
                    {selectedSubclass.features.slice(0, 8).map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                    {selectedSubclass.features.length > 8 && (
                      <li className="split-picker__detail-more">
                        +{selectedSubclass.features.length - 8} more…
                      </li>
                    )}
                  </ul>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="split-picker__detail-initial">
            <Scroll size={32} className="split-picker__detail-initial-icon" />
            <p>Select a subclass from the list to view details.</p>
          </div>
        )}
      </div>
    </section>
  );
}
