import { Search, Sparkles } from "lucide-react";
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

  return (
    <section className="card-grid-picker">
      <div className="picker-header">
        <h2>
          <Sparkles
            size={20}
            style={{ verticalAlign: "text-bottom", marginRight: 8 }}
          />
          Choose Your Spells
        </h2>
        <p>Select the spells your character knows or has prepared.</p>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: 4 }}>
          <p className="text-muted" style={{ fontSize: "0.85rem", margin: 0 }}>
            {selectedSpellIds.length} spell{selectedSpellIds.length !== 1 ? "s" : ""} selected.
          </p>
          {selectedSpellIds.length > 0 && (
            <button
              type="button"
              className="button ghost"
              style={{ padding: "2px 6px", minHeight: "unset", fontSize: "0.75rem" }}
              onClick={onClearSpells}
            >
              Clear Selected
            </button>
          )}
        </div>
      </div>

      <div className="card-grid-picker__search">
        <Search size={18} className="text-muted" />
        <input
          type="text"
          placeholder="Search spells..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          style={{ padding: "6px 12px", borderRadius: "4px", border: "1px solid var(--line)", background: "var(--bg-input)", color: "var(--text)" }}
        >
          <option value="">All Sources</option>
          {sources.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
        {(search || sourceFilter) && (
          <button
            type="button"
            className="button ghost"
            style={{ padding: "4px 8px", minHeight: "unset", fontSize: "0.8rem" }}
            onClick={() => {
              setSearch("");
              setSourceFilter("");
            }}
          >
            Clear
          </button>
        )}
      </div>

      {filtered.length > 0 ? (
        <ul className="card-grid-picker__grid">
          {filtered.slice(0, 100).map((spell) => {
            const isSelected = selectedSpellIds.includes(spell.id);
            return (
              <li
                key={spell.id}
                className={`card-grid-picker__card ${isSelected ? "selected" : ""}`}
                onClick={() => onToggleSpell(spell.id)}
              >
                <div className="card-grid-picker__card-header">
                  <h3 className="card-grid-picker__card-name">{spell.name}</h3>
                  <span className="card-grid-picker__card-source">
                    {spell.source}
                  </span>
                </div>
                <div className="card-grid-picker__card-desc">
                  Level: {spell.level !== undefined ? spell.level : "Cantrip"}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="card-grid-picker__empty">
          <p>No spells found matching your criteria.</p>
          <button
            type="button"
            className="button ghost"
            onClick={() => {
              setSearch("");
              setSourceFilter("");
            }}
          >
            Clear Filters
          </button>
        </div>
      )}
      
      {filtered.length > 100 && (
        <p className="text-muted" style={{ textAlign: "center", fontSize: "0.8rem", marginTop: 8 }}>
          Showing first 100 results. Refine your search to see more.
        </p>
      )}
    </section>
  );
}
