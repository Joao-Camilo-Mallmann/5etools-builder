import type {
    AbilityScores,
    BuilderBackground,
    BuilderClass,
    BuilderRace,
    BuilderSpell,
    BuilderSubclass,
    BuilderSubrace,
    SpellcastingSnapshot,
} from "../types";

interface CharacterSummaryProps {
  name: string;
  level: number;
  race: BuilderRace | null;
  subrace: BuilderSubrace | null;
  builderClass: BuilderClass | null;
  subclass: BuilderSubclass | null;
  background: BuilderBackground | null;
  abilities: AbilityScores;
  modifiers: AbilityScores;
  selectedSpells: BuilderSpell[];
  spellcastingSnapshot: SpellcastingSnapshot | null;
}

function formatModifier(value: number): string {
  return `${value >= 0 ? "+" : ""}${value}`;
}

export function CharacterSummary({
  name,
  level,
  race,
  subrace,
  builderClass,
  subclass,
  background,
  abilities,
  modifiers,
  selectedSpells,
  spellcastingSnapshot,
}: CharacterSummaryProps) {
  return (
    <section>
      <h2>Step 8: Character Summary</h2>

      <article className="detail-card">
        <h3>{name.trim() || "Unnamed Adventurer"}</h3>
        <p>
          <strong>Level:</strong> {level}
        </p>
        <p>
          <strong>Race:</strong>{" "}
          {race ? `${race.name} (${race.source})` : "Not selected"}
        </p>
        <p>
          <strong>Subrace:</strong>{" "}
          {subrace ? `${subrace.name} (${subrace.source})` : "Not selected"}
        </p>
        <p>
          <strong>Class:</strong>{" "}
          {builderClass
            ? `${builderClass.name} (${builderClass.source})`
            : "Not selected"}
        </p>
        <p>
          <strong>Subclass:</strong>{" "}
          {subclass ? `${subclass.name} (${subclass.source})` : "Not selected"}
        </p>
        <p>
          <strong>Background:</strong>{" "}
          {background
            ? `${background.name} (${background.source})`
            : "Not selected"}
        </p>
      </article>

      <article className="detail-card">
        <h3>Abilities</h3>
        <div className="ability-summary-grid">
          {Object.entries(abilities).map(([key, value]) => (
            <div key={key} className="ability-summary-row">
              <span>{key.toUpperCase()}</span>
              <span>{value}</span>
              <span>
                {formatModifier(modifiers[key as keyof AbilityScores])}
              </span>
            </div>
          ))}
        </div>
      </article>

      <article className="detail-card">
        <h3>Spellcasting</h3>
        {spellcastingSnapshot ? (
          <>
            <p>
              <strong>Progression:</strong>{" "}
              {spellcastingSnapshot.progressionType}
            </p>
            <p>
              <strong>Cantrips:</strong> {spellcastingSnapshot.cantripsKnown}
            </p>
            <p>
              <strong>Spells Known:</strong>{" "}
              {spellcastingSnapshot.spellsKnown ?? "N/A"}
            </p>
          </>
        ) : (
          <p className="empty-state">No spellcasting data available.</p>
        )}

        <h4>Selected Spells ({selectedSpells.length})</h4>
        {selectedSpells.length > 0 ? (
          <ul className="compact-list">
            {selectedSpells.map((spell) => (
              <li key={spell.id}>
                {spell.name} (L{spell.level}, {spell.source})
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">No spells selected.</p>
        )}
      </article>
    </section>
  );
}
