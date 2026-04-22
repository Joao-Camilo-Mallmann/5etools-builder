import type { BuilderBackground } from "../types";

interface BackgroundPickerProps {
  backgrounds: BuilderBackground[];
  selectedBackgroundId: string | null;
  onSelect: (backgroundId: string | null) => void;
}

export function BackgroundPicker({
  backgrounds,
  selectedBackgroundId,
  onSelect,
}: BackgroundPickerProps) {
  const selectedBackground =
    backgrounds.find((background) => background.id === selectedBackgroundId) ??
    null;

  return (
    <section>
      <h2>Step 5: Choose Background</h2>

      <label className="field-label" htmlFor="background-select">
        Background
      </label>
      <select
        id="background-select"
        value={selectedBackgroundId ?? ""}
        onChange={(event) => onSelect(event.target.value || null)}
      >
        <option value="">Select a background</option>
        {backgrounds.map((background) => (
          <option key={background.id} value={background.id}>
            {background.name} ({background.source})
          </option>
        ))}
      </select>

      {selectedBackground ? (
        <article className="detail-card">
          <h3>
            {selectedBackground.name} <span>({selectedBackground.source})</span>
          </h3>
          <p>
            <strong>Ability:</strong> {selectedBackground.abilitySummary}
          </p>
          <p>{selectedBackground.entriesSummary}</p>
          {selectedBackground.startingEquipmentText.length > 0 ? (
            <>
              <h4>Starting Equipment</h4>
              <ul className="compact-list">
                {selectedBackground.startingEquipmentText.map((equipment) => (
                  <li key={equipment}>{equipment}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="empty-state">
              No starting equipment details available.
            </p>
          )}
        </article>
      ) : (
        <p className="empty-state">Select a background to continue.</p>
      )}
    </section>
  );
}
