import type { BuilderClass } from "../types";

interface ClassPickerProps {
  classes: BuilderClass[];
  selectedClassId: string | null;
  onSelect: (classId: string | null) => void;
}

export function ClassPicker({
  classes,
  selectedClassId,
  onSelect,
}: ClassPickerProps) {
  const selectedClass =
    classes.find((builderClass) => builderClass.id === selectedClassId) ?? null;

  return (
    <section>
      <h2>Step 3: Choose Class</h2>

      <label className="field-label" htmlFor="class-select">
        Class
      </label>
      <select
        id="class-select"
        value={selectedClassId ?? ""}
        onChange={(event) => onSelect(event.target.value || null)}
      >
        <option value="">Select a class</option>
        {classes.map((builderClass) => (
          <option key={builderClass.id} value={builderClass.id}>
            {builderClass.name} ({builderClass.source})
          </option>
        ))}
      </select>

      {selectedClass ? (
        <article className="detail-card">
          <h3>
            {selectedClass.name} <span>({selectedClass.source})</span>
          </h3>
          <p>
            <strong>Hit Die:</strong>{" "}
            {selectedClass.hitDie ? `d${selectedClass.hitDie}` : "Unknown"}
          </p>
          <p>
            <strong>Spellcasting:</strong> {selectedClass.casterProgression}
          </p>
          <p>
            <strong>Spellcasting Ability:</strong>{" "}
            {selectedClass.spellcastingAbility ?? "N/A"}
          </p>
        </article>
      ) : (
        <p className="empty-state">Select a class to continue.</p>
      )}
    </section>
  );
}
