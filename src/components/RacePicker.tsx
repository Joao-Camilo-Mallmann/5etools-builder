import { Leaf, Search } from "lucide-react";
import { useMemo, useState } from "react";

import type { BuilderRace } from "../types";

function getRawPage(raw: unknown): number | null {
  if (typeof raw !== "object" || raw === null) return null;
  const page = (raw as { page?: unknown }).page;
  return typeof page === "number" ? page : null;
}

function getRawSource(raw: unknown): string | null {
  if (typeof raw !== "object" || raw === null) return null;
  const source = (raw as { source?: unknown }).source;
  return typeof source === "string" ? source : null;
}

type SortKey = "name" | "source";
type SortDir = "asc" | "desc";

interface RacePickerProps {
  races: BuilderRace[];
  selectedRaceId: string | null;
  onSelect: (raceId: string | null) => void;
}

export function RacePicker({
  races,
  selectedRaceId,
  onSelect,
}: RacePickerProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const selectedRace = useMemo(
    () => races.find((r) => r.id === selectedRaceId) ?? null,
    [races, selectedRaceId],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? races.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.source.toLowerCase().includes(q),
        )
      : [...races];
    list.sort((a, b) => {
      const av = a[sortKey].toLowerCase();
      const bv = b[sortKey].toLowerCase();
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return list;
  }, [races, search, sortKey, sortDir]);

  const selectedRaceVersions = useMemo(() => {
    if (!selectedRace) return [];
    if (selectedRace.rawItems?.length) return selectedRace.rawItems;
    if (selectedRace.raw) return [selectedRace.raw];
    return [];
  }, [selectedRace]);

  const debugPayload = useMemo(() => {
    if (!selectedRace) return "";
    const racePayload = selectedRaceVersions.length
      ? selectedRaceVersions
      : selectedRace.raw
        ? [selectedRace.raw]
        : [];
    return JSON.stringify(
      {
        _meta: { internalCopies: ["race"] },
        race: racePayload,
      },
      null,
      2,
    );
  }, [selectedRace, selectedRaceVersions]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }
  const si = (k: SortKey, cur: SortKey, dir: SortDir) =>
    cur === k ? (dir === "asc" ? " ▲" : " ▼") : "";

  return (
    <section className="split-picker">
      {/* ── Left: race list ──────────────────────────────── */}
      <div className="split-picker__list-col">
        <div className="split-picker__search-bar">
          <Search size={13} className="split-picker__search-glass" />
          <input
            type="search"
            id="race-search"
            placeholder="Search races…"
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
            Name{si("name", sortKey, sortDir)}
          </button>
          <button
            className={`split-picker__sort-btn split-picker__sort-btn--grow${sortKey === "source" ? " active" : ""}`}
            onClick={() => toggleSort("source")}
          >
            Source{si("source", sortKey, sortDir)}
          </button>
        </div>

        <ul className="split-picker__list" role="listbox" aria-label="Races">
          {filtered.length === 0 ? (
            <li className="split-picker__list-empty">
              No races match "{search}"
            </li>
          ) : (
            filtered.map((race) => (
              <li
                key={race.id}
                role="option"
                aria-selected={selectedRaceId === race.id}
                className={`split-picker__list-item${selectedRaceId === race.id ? " selected" : ""}`}
                onClick={() =>
                  onSelect(selectedRaceId === race.id ? null : race.id)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(selectedRaceId === race.id ? null : race.id);
                  }
                }}
                tabIndex={0}
              >
                <span className="split-picker__item-name">{race.name}</span>
                <span className="split-picker__item-source">{race.source}</span>
              </li>
            ))
          )}
        </ul>

        <div className="split-picker__list-count">
          {filtered.length} of {races.length} race
          {races.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ── Right: detail + subraces ──────────────────────── */}
      <div className="split-picker__detail-col">
        {selectedRace ? (
          <div key={selectedRace.id}>
            {/* Race stat block */}
            <div className="split-picker__detail-block">
              <div className="split-picker__detail-header">
                <h2 className="split-picker__detail-name">
                  {selectedRace.name}
                </h2>
                <span className="split-picker__detail-source">
                  {selectedRace.source}
                </span>
              </div>
              <div className="split-picker__detail-body">
                {/* Versions / also found in */}
                {selectedRaceVersions.length > 0 && (
                  <div className="split-picker__detail-versions">
                    <span className="split-picker__detail-label">
                      Printings:
                    </span>
                    <ul className="split-picker__detail-list">
                      {selectedRaceVersions.map((rawItem, idx) => {
                        const src = getRawSource(rawItem) ?? "unknown";
                        const pg = getRawPage(rawItem);
                        return (
                          <li key={`${src}-${idx}`}>
                            {src}
                            {pg !== null ? `, p. ${pg}` : ""}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {selectedRace.sources && selectedRace.sources.length > 1 && (
                  <p className="split-picker__detail-meta">
                    <strong>Also in:</strong>{" "}
                    {selectedRace.sources.slice(1).join(", ")}
                  </p>
                )}

                {selectedRace.entriesSummary ? (
                  <p className="split-picker__detail-desc">
                    {selectedRace.entriesSummary}
                  </p>
                ) : (
                  <p className="split-picker__detail-empty">
                    No description available.
                  </p>
                )}

                {/* Raw JSON debug */}
                {debugPayload && (
                  <details className="raw-json-box">
                    <summary>Show raw race data (JSON)</summary>
                    <pre>{debugPayload}</pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="split-picker__detail-initial">
            <Leaf size={32} className="split-picker__detail-initial-icon" />
            <p>Select a race from the list to view details.</p>
          </div>
        )}
      </div>
    </section>
  );
}
