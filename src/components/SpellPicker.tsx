import { useMemo, useState } from "react";

import type { BuilderSpell } from "../types";

interface SpellPickerProps {
  spells: BuilderSpell[];
  selectedSpellIds: string[];
  onToggleSpell: (spellId: string) => void;
  onClearSpells: () => void;
}

export function SpellPicker({
  spells,
  selectedSpellIds,
  onToggleSpell,
  onClearSpells,
}: SpellPickerProps) {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");

  const sources = useMemo(() => {
    const set = new Set(spells.map((s) => s.source));
    return Array.from(set).sort();
  }, [spells]);

  const filtered = useMemo(() => {
    let result = spells;

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(query));
    }

    if (sourceFilter) {
      result = result.filter((s) => s.source === sourceFilter);
    }

    return result;
  }, [spells, search, sourceFilter]);

  const selectedSpells = useMemo(
    () => spells.filter((s) => selectedSpellIds.includes(s.id)),
    [spells, selectedSpellIds],
  );

  return (
    <section>
      <div className="picker-header">
        <h2>Choose Your Spells</h2>
        <p>Select the spells your character knows or has prepared.</p>
      </div>

      <div className="spell-picker-layout">
        {/* ── Left: Available Spells ────────────────────────── */}
        <div className="spell-picker-main">
          <div className="spell-filters">
            <label>
              Search
              <input
                type="text"
                placeholder="Search spells..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="spell-search"
              />
            </label>

            <label>
              Source
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                id="spell-source-filter"
              >
                <option value="">All Sources</option>
                {sources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p className="picker-count">
            {filtered.length} spell{filtered.length !== 1 ? "s" : ""} shown
            {(search || sourceFilter) && ` (from ${spells.length} total)`}
          </p>

          <ul className="spell-list">
            {filtered.slice(0, 100).map((spell) => {
              const isSelected = selectedSpellIds.includes(spell.id);
              return (
                <li key={spell.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSpell(spell.id)}
                    />
                    <div className="spell-info">
                      <span className="spell-title">
                        {spell.name}
                        <small>({spell.source})</small>
                      </span>
                      {spell.level !== undefined && (
                        <span className="spell-meta">
                          Level {spell.level}
                        </span>
                      )}
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>

          {filtered.length > 100 && (
            <p className="picker-count" style={{ marginTop: "0.5rem" }}>
              Showing first 100 results. Refine your search to see more.
            </p>
          )}
        </div>

        {/* ── Right: Selected Spells ───────────────────────── */}
        <div className="spell-selected-panel">
          <div className="spell-selected-title">
            <span>Selected Spells</span>
            <span className="spell-selected-count">
              {selectedSpells.length}
            </span>
          </div>

          {selectedSpells.length > 0 ? (
            <>
              <ul className="spell-selected-list">
                {selectedSpells.map((spell) => (
                  <li key={spell.id} className="spell-selected-item">
                    <span>{spell.name}</span>
                    <button
                      type="button"
                      className="spell-remove-btn"
                      onClick={() => onToggleSpell(spell.id)}
                      title={`Remove ${spell.name}`}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="button ghost"
                onClick={onClearSpells}
                style={{ marginTop: "0.5rem", alignSelf: "center" }}
              >
                Clear All
              </button>
            </>
          ) : (
            <p className="spell-selected-empty">
              No spells selected yet. Check spells from the list.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
