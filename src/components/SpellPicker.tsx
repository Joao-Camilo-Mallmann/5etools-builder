import { useMemo } from "react";

import type {
    BuilderSpell,
    SpellFilters,
    SpellcastingSnapshot,
} from "../types";

interface SpellPickerProps {
  spells: BuilderSpell[];
  selectedSpellIds: string[];
  filters: SpellFilters;
  spellcastingSnapshot: SpellcastingSnapshot | null;
  onToggleSpell: (spellId: string) => void;
  onFilterChange: (filters: Partial<SpellFilters>) => void;
  onClearSelection: () => void;
}

function formatSpellSlots(snapshot: SpellcastingSnapshot): string {
  if (snapshot.progressionType === "pact") {
    if (!snapshot.pactSlots) {
      return "No pact slots available at this level.";
    }
    return `${snapshot.pactSlots.slots} slots at level ${snapshot.pactSlots.slotLevel}`;
  }

  const chunks = snapshot.spellSlots
    .map((value, index) => ({
      spellLevel: index + 1,
      slots: value,
    }))
    .filter((item) => item.slots > 0)
    .map((item) => `L${item.spellLevel}: ${item.slots}`);

  return chunks.length > 0
    ? chunks.join(" | ")
    : "No spell slots at this level.";
}

export function SpellPicker({
  spells,
  selectedSpellIds,
  filters,
  spellcastingSnapshot,
  onToggleSpell,
  onFilterChange,
  onClearSelection,
}: SpellPickerProps) {
  const sources = useMemo(() => {
    return [...new Set(spells.map((spell) => spell.source))].sort((a, b) =>
      a.localeCompare(b),
    );
  }, [spells]);

  const filteredSpells = useMemo(() => {
    return spells.filter((spell) => {
      if (filters.source !== "all" && spell.source !== filters.source) {
        return false;
      }

      if (filters.maxLevel !== "all" && spell.level > filters.maxLevel) {
        return false;
      }

      if (!filters.search.trim()) {
        return true;
      }

      const query = filters.search.toLowerCase();
      return (
        spell.name.toLowerCase().includes(query) ||
        spell.entriesSummary.toLowerCase().includes(query)
      );
    });
  }, [filters.maxLevel, filters.search, filters.source, spells]);

  return (
    <section>
      <h2>Step 7: Spell Selection</h2>

      {spellcastingSnapshot ? (
        <article className="detail-card">
          <h3>Spellcasting Snapshot</h3>
          <p>
            <strong>Progression:</strong> {spellcastingSnapshot.progressionType}
          </p>
          <p>
            <strong>Cantrips Known:</strong>{" "}
            {spellcastingSnapshot.cantripsKnown}
          </p>
          <p>
            <strong>Spells Known:</strong>{" "}
            {spellcastingSnapshot.spellsKnown ?? "N/A"}
          </p>
          <p>
            <strong>Prepared Estimate:</strong>{" "}
            {spellcastingSnapshot.preparedEstimate ?? "N/A"}
          </p>
          <p>
            <strong>Slots:</strong> {formatSpellSlots(spellcastingSnapshot)}
          </p>
        </article>
      ) : (
        <p className="empty-state">
          Pick a spellcasting class first if you want to configure spells.
        </p>
      )}

      <div className="spell-filters">
        <label>
          Search
          <input
            type="search"
            value={filters.search}
            onChange={(event) => onFilterChange({ search: event.target.value })}
            placeholder="Find by name or text"
          />
        </label>

        <label>
          Source
          <select
            value={filters.source}
            onChange={(event) => onFilterChange({ source: event.target.value })}
          >
            <option value="all">All sources</option>
            {sources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </label>

        <label>
          Max level
          <select
            value={String(filters.maxLevel)}
            onChange={(event) => {
              const value = event.target.value;
              onFilterChange({
                maxLevel: value === "all" ? "all" : Number.parseInt(value, 10),
              });
            }}
          >
            <option value="all">All levels</option>
            <option value="0">Cantrips only</option>
            {Array.from({ length: 9 }).map((_, index) => (
              <option key={index + 1} value={index + 1}>
                Up to level {index + 1}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="button secondary"
          onClick={onClearSelection}
        >
          Clear selected spells
        </button>
      </div>

      <p className="step-help">
        Showing {filteredSpells.length} spells | Selected{" "}
        {selectedSpellIds.length}
      </p>

      <ul className="spell-list">
        {filteredSpells.map((spell) => {
          const checked = selectedSpellIds.includes(spell.id);

          return (
            <li key={spell.id}>
              <label>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleSpell(spell.id)}
                />
                <span className="spell-title">
                  {spell.name}{" "}
                  <small>
                    (L{spell.level}, {spell.source})
                  </small>
                </span>
                <span className="spell-summary">{spell.entriesSummary}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
