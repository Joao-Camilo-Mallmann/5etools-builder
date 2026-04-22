import { useMemo, useState } from "react";

import type { BuilderRace, BuilderSubrace } from "../types";

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

interface RacePickerProps {
  races: BuilderRace[];
  selectedRaceId: string | null;
  subraces: BuilderSubrace[];
  selectedSubraceId: string | null;
  onSelect: (raceId: string | null) => void;
  onSelectSubrace: (subraceId: string | null) => void;
}

export function RacePicker({
  races,
  selectedRaceId,
  subraces,
  selectedSubraceId,
  onSelect,
  onSelectSubrace,
}: RacePickerProps) {
  const [search, setSearch] = useState("");
  const [subraceSearch, setSubraceSearch] = useState("");

  const selectedRace = useMemo(
    () => races.find((race) => race.id === selectedRaceId) ?? null,
    [races, selectedRaceId],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return races;
    const query = search.toLowerCase();
    return races.filter(
      (race) =>
        race.name.toLowerCase().includes(query) ||
        race.source.toLowerCase().includes(query),
    );
  }, [races, search]);

  const filteredSubraces = useMemo(() => {
    if (!subraceSearch.trim()) return subraces;
    const query = subraceSearch.toLowerCase();
    return subraces.filter(
      (subrace) =>
        subrace.name.toLowerCase().includes(query) ||
        subrace.source.toLowerCase().includes(query),
    );
  }, [subraces, subraceSearch]);

  const selectedSubrace = useMemo(
    () => subraces.find((subrace) => subrace.id === selectedSubraceId) ?? null,
    [subraces, selectedSubraceId],
  );

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

    const subracePayload = filteredSubraces
      .map((subrace) => subrace.raw)
      .filter((raw): raw is Record<string, unknown> => raw !== undefined);

    return JSON.stringify(
      {
        _meta: {
          internalCopies: ["race", "subrace"],
        },
        race: racePayload,
        subrace: subracePayload,
      },
      null,
      2,
    );
  }, [filteredSubraces, selectedRace, selectedRaceVersions]);

  return (
    <section>
      <div className="picker-header">
        <h2>Choose Your Race</h2>
        <p>
          Your race determines your heritage, abilities, and traits. Select one
          to continue.
        </p>
      </div>

      <div className="picker-search">
        <span className="picker-search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search races..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="race-search"
        />
      </div>

      <p className="picker-count">
        {filtered.length} race{filtered.length !== 1 ? "s" : ""} available
        {search && ` (filtered from ${races.length})`}
      </p>

      {filtered.length > 0 ? (
        <div className="picker-grid">
          {filtered.map((race) => (
            <div
              key={race.id}
              className={`picker-card ${selectedRaceId === race.id ? "selected" : ""}`}
              onClick={() =>
                onSelect(selectedRaceId === race.id ? null : race.id)
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(selectedRaceId === race.id ? null : race.id);
                }
              }}
            >
              <span className="picker-card-name">{race.name}</span>
              <span className="picker-card-source">{race.source}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="picker-empty">
          No races match "{search}". Try a different search.
        </p>
      )}

      {selectedRace ? (
        <article className="detail-card">
          <h3>
            {selectedRace.name} <span>({selectedRace.source})</span>
          </h3>

          <p>
            <strong>Book:</strong> {selectedRace.source}
          </p>

          {selectedRaceVersions.length > 0 ? (
            <ul className="compact-list">
              {selectedRaceVersions.map((rawItem, index) => {
                const source = getRawSource(rawItem) ?? "unknown";
                const page = getRawPage(rawItem);
                return (
                  <li key={`${source}-${page ?? "np"}-${index}`}>
                    {source}
                    {page !== null ? `, page ${page}` : ""}
                  </li>
                );
              })}
            </ul>
          ) : null}

          {selectedRace.sources && selectedRace.sources.length > 1 ? (
            <p>
              <strong>Also found in:</strong> {selectedRace.sources.join(", ")}
            </p>
          ) : null}

          {selectedRace.entriesSummary ? (
            <p>{selectedRace.entriesSummary}</p>
          ) : (
            <p className="picker-empty">No race description available.</p>
          )}

          <div className="picker-header" style={{ marginTop: "1rem" }}>
            <h2>Choose Your Subrace</h2>
            <p>Subraces for {selectedRace.name}.</p>
          </div>

          {subraces.length > 0 ? (
            <>
              <div className="picker-search">
                <span className="picker-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search subraces..."
                  value={subraceSearch}
                  onChange={(e) => setSubraceSearch(e.target.value)}
                  id="subrace-search"
                />
              </div>

              <p className="picker-count">
                {filteredSubraces.length} subrace
                {filteredSubraces.length !== 1 ? "s" : ""} available
              </p>

              {filteredSubraces.length > 0 ? (
                <div className="picker-grid">
                  {filteredSubraces.map((subrace) => (
                    <div
                      key={subrace.id}
                      className={`picker-card ${selectedSubraceId === subrace.id ? "selected" : ""}`}
                      onClick={() =>
                        onSelectSubrace(
                          selectedSubraceId === subrace.id ? null : subrace.id,
                        )
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onSelectSubrace(
                            selectedSubraceId === subrace.id
                              ? null
                              : subrace.id,
                          );
                        }
                      }}
                    >
                      <span className="picker-card-name">{subrace.name}</span>
                      <span className="picker-card-source">
                        {subrace.source}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="picker-empty">No subraces match your search.</p>
              )}

              {selectedSubrace ? (
                <article
                  className="detail-card"
                  style={{ marginTop: "0.8rem" }}
                >
                  <h3>
                    {selectedSubrace.name}{" "}
                    <span>({selectedSubrace.source})</span>
                  </h3>

                  {selectedSubrace.entriesSummary ? (
                    <p>{selectedSubrace.entriesSummary}</p>
                  ) : (
                    <p className="picker-empty">
                      No subrace description available.
                    </p>
                  )}
                </article>
              ) : null}
            </>
          ) : (
            <p className="picker-empty">
              This race has no subrace options. You can continue to the next
              step.
            </p>
          )}

          {debugPayload ? (
            <details className="raw-json-box">
              <summary>Show raw race/subrace data (JSON)</summary>
              <pre>{debugPayload}</pre>
            </details>
          ) : null}
        </article>
      ) : null}
    </section>
  );
}
