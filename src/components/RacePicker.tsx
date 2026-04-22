import type { BuilderRace } from "../types";

interface RacePickerProps {
  races: BuilderRace[];
  selectedRaceId: string | null;
  onSelect: (raceId: string | null) => void;
}

export function RacePicker({
  races,
  selectedRaceId,
  onSelect,
}: RacePickerProps) {
  const selectedRace = races.find((race) => race.id === selectedRaceId) ?? null;

  return (
    <section>
      <h2>Step 1: Choose Race</h2>
      <p className="step-help">All sources are listed by default.</p>

      <label className="field-label" htmlFor="race-select">
        Race
      </label>
      <select
        id="race-select"
        value={selectedRaceId ?? ""}
        onChange={(event) => onSelect(event.target.value || null)}
      >
        <option value="">Select a race</option>
        {races.map((race) => (
          <option key={race.id} value={race.id}>
            {race.name} ({race.source})
          </option>
        ))}
      </select>

      {selectedRace ? (
        <article className="detail-card">
          <h3>
            {selectedRace.name} <span>({selectedRace.source})</span>
          </h3>
          <p>
            <strong>Size:</strong> {selectedRace.sizeSummary}
          </p>
          <p>
            <strong>Speed:</strong> {selectedRace.speedSummary}
          </p>
          <p>
            <strong>Ability:</strong> {selectedRace.abilitySummary}
          </p>
          <p>{selectedRace.entriesSummary}</p>
        </article>
      ) : (
        <p className="empty-state">Select a race to continue.</p>
      )}
    </section>
  );
}
