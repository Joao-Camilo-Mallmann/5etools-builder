import type { BuilderSubrace } from "../types";

interface SubracePickerProps {
  subraces: BuilderSubrace[];
  selectedSubraceId: string | null;
  hasSelectedRace: boolean;
  onSelect: (subraceId: string | null) => void;
}

export function SubracePicker({
  subraces,
  selectedSubraceId,
  hasSelectedRace,
  onSelect,
}: SubracePickerProps) {
  const selectedSubrace =
    subraces.find((subrace) => subrace.id === selectedSubraceId) ?? null;

  if (!hasSelectedRace) {
    return (
      <section>
        <h2>Step 2: Choose Subrace</h2>
        <p className="empty-state">Pick a race first.</p>
      </section>
    );
  }

  if (subraces.length === 0) {
    return (
      <section>
        <h2>Step 2: Choose Subrace</h2>
        <p className="empty-state">
          This race has no explicit subrace options.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2>Step 2: Choose Subrace</h2>

      <label className="field-label" htmlFor="subrace-select">
        Subrace
      </label>
      <select
        id="subrace-select"
        value={selectedSubraceId ?? ""}
        onChange={(event) => onSelect(event.target.value || null)}
      >
        <option value="">Select a subrace</option>
        {subraces.map((subrace) => (
          <option key={subrace.id} value={subrace.id}>
            {subrace.name} ({subrace.source})
          </option>
        ))}
      </select>

      {selectedSubrace ? (
        <article className="detail-card">
          <h3>
            {selectedSubrace.name} <span>({selectedSubrace.source})</span>
          </h3>
          <p>{selectedSubrace.entriesSummary}</p>
        </article>
      ) : (
        <p className="empty-state">Select a subrace to continue.</p>
      )}
    </section>
  );
}
