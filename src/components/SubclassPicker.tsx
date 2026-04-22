import type { BuilderSubclass } from "../types";

interface SubclassPickerProps {
  subclasses: BuilderSubclass[];
  selectedSubclassId: string | null;
  hasSelectedClass: boolean;
  onSelect: (subclassId: string | null) => void;
}

export function SubclassPicker({
  subclasses,
  selectedSubclassId,
  hasSelectedClass,
  onSelect,
}: SubclassPickerProps) {
  const selectedSubclass =
    subclasses.find((subclass) => subclass.id === selectedSubclassId) ?? null;

  if (!hasSelectedClass) {
    return (
      <section>
        <h2>Step 4: Choose Subclass</h2>
        <p className="empty-state">Pick a class first.</p>
      </section>
    );
  }

  if (subclasses.length === 0) {
    return (
      <section>
        <h2>Step 4: Choose Subclass</h2>
        <p className="empty-state">
          This class has no explicit subclass options.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2>Step 4: Choose Subclass</h2>

      <label className="field-label" htmlFor="subclass-select">
        Subclass
      </label>
      <select
        id="subclass-select"
        value={selectedSubclassId ?? ""}
        onChange={(event) => onSelect(event.target.value || null)}
      >
        <option value="">Select a subclass</option>
        {subclasses.map((subclass) => (
          <option key={subclass.id} value={subclass.id}>
            {subclass.name} ({subclass.source})
          </option>
        ))}
      </select>

      {selectedSubclass ? (
        <article className="detail-card">
          <h3>
            {selectedSubclass.name} <span>({selectedSubclass.source})</span>
          </h3>
          <p>
            <strong>Class:</strong> {selectedSubclass.className} (
            {selectedSubclass.classSource})
          </p>
          {selectedSubclass.features.length > 0 ? (
            <ul className="compact-list">
              {selectedSubclass.features.slice(0, 6).map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">No subclass feature list available.</p>
          )}
        </article>
      ) : (
        <p className="empty-state">Select a subclass to continue.</p>
      )}
    </section>
  );
}
