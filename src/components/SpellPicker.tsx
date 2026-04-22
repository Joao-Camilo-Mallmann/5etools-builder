import type { BuilderSpell } from "../types";

interface SpellPickerProps {
  spells: BuilderSpell[];
}

export function SpellPicker({ spells }: SpellPickerProps) {
  return (
    <section>
      <h2>Step 4: Spells</h2>
      <p className="step-help">MVP mode: API list only (name + source).</p>

      <ul className="spell-list">
        {spells.map((spell) => (
          <li key={spell.id}>
            <label>
              <span className="spell-title">
                {spell.name} <small>({spell.source})</small>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
