import { useEffect, useMemo, useState } from "react";

import "./App.css";
import backgroundsApi from "./api/backgrounds";
import classesApi from "./api/classes";
import racesApi from "./api/races";
import spellcastingApi from "./api/spellcasting";
import { BackgroundPicker } from "./components/BackgroundPicker";
import { ClassPicker } from "./components/ClassPicker";
import { RacePicker } from "./components/RacePicker";
import { SpellPicker } from "./components/SpellPicker";
import { StepWizard, type WizardStep } from "./components/StepWizard";
import type {
    BuilderBackground,
    BuilderClass,
    BuilderRace,
    BuilderSpell,
} from "./types";

function makeId(name: string, source: string): string {
  return `${name}|${source}`.toLowerCase();
}

function toEntity(value: unknown, fallbackName: string): BuilderRace {
  const record = typeof value === "object" && value !== null ? value : {};
  const name =
    typeof (record as { name?: unknown }).name === "string"
      ? ((record as { name: string }).name as string)
      : fallbackName;
  const source =
    typeof (record as { source?: unknown }).source === "string"
      ? ((record as { source: string }).source as string)
      : "unknown";

  return {
    id: makeId(name, source),
    name,
    source,
  };
}

function App() {
  const [currentStep, setCurrentStep] = useState(1);

  const [races, setRaces] = useState<BuilderRace[]>([]);
  const [classes, setClasses] = useState<BuilderClass[]>([]);
  const [backgrounds, setBackgrounds] = useState<BuilderBackground[]>([]);
  const [spells, setSpells] = useState<BuilderSpell[]>([]);

  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedBackgroundId, setSelectedBackgroundId] = useState<
    string | null
  >(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAll(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const [
          racesPayload,
          classIndexPayload,
          backgroundsPayload,
          spellIndex,
        ] = await Promise.all([
          racesApi.getRaces(),
          classesApi.getIndex(),
          backgroundsApi.get(),
          spellcastingApi.getIndex(),
        ]);

        const raceValues = Array.isArray(
          (racesPayload as { race?: unknown }).race,
        )
          ? ((racesPayload as { race: unknown[] }).race as unknown[])
          : [];

        const classFiles = [
          ...new Set(
            Object.values(
              (classIndexPayload as Record<string, unknown>) ?? {},
            ).filter((value): value is string => typeof value === "string"),
          ),
        ];

        const spellFiles = [
          ...new Set(
            Object.values((spellIndex as Record<string, unknown>) ?? {}).filter(
              (value): value is string => typeof value === "string",
            ),
          ),
        ];

        const [classPayloads, spellPayloads] = await Promise.all([
          Promise.all(
            classFiles.map((fileName) => classesApi.getClassFile(fileName)),
          ),
          Promise.all(
            spellFiles.map((fileName) =>
              spellcastingApi.getSpellFile(fileName),
            ),
          ),
        ]);

        const classValues: unknown[] = [];
        for (const payload of classPayloads) {
          const entries = (payload as { class?: unknown }).class;
          if (Array.isArray(entries)) {
            classValues.push(...entries);
          }
        }

        const spellValues: unknown[] = [];
        for (const payload of spellPayloads) {
          const entries = (payload as { spell?: unknown }).spell;
          if (Array.isArray(entries)) {
            spellValues.push(...entries);
          }
        }

        const backgroundValues = Array.isArray(
          (backgroundsPayload as { background?: unknown }).background,
        )
          ? ((backgroundsPayload as { background: unknown[] })
              .background as unknown[])
          : [];

        const normalizedRaces = raceValues.map((value) =>
          toEntity(value, "Unknown Race"),
        );
        const normalizedClasses = classValues.map((value) =>
          toEntity(value, "Unknown Class"),
        );
        const normalizedBackgrounds = backgroundValues.map((value) =>
          toEntity(value, "Unknown Background"),
        );
        const normalizedSpells = spellValues.map((value) =>
          toEntity(value, "Unknown Spell"),
        );

        setRaces(normalizedRaces);
        setClasses(normalizedClasses);
        setBackgrounds(normalizedBackgrounds);
        setSpells(normalizedSpells);
      } catch (caughtError) {
        if (caughtError instanceof Error) {
          setError(caughtError.message);
        } else {
          setError("Failed to load API data.");
        }
      } finally {
        setLoading(false);
      }
    }

    void loadAll();
  }, []);

  const steps: WizardStep[] = useMemo(
    () => [
      {
        id: 1,
        title: "Races",
        description: "List from API",
        isComplete: true,
        isLocked: false,
        content: (
          <RacePicker
            races={races}
            selectedRaceId={selectedRaceId}
            onSelect={setSelectedRaceId}
          />
        ),
      },
      {
        id: 2,
        title: "Classes",
        description: "List from API",
        isComplete: true,
        isLocked: false,
        content: (
          <ClassPicker
            classes={classes}
            selectedClassId={selectedClassId}
            onSelect={setSelectedClassId}
          />
        ),
      },
      {
        id: 3,
        title: "Backgrounds",
        description: "List from API",
        isComplete: true,
        isLocked: false,
        content: (
          <BackgroundPicker
            backgrounds={backgrounds}
            selectedBackgroundId={selectedBackgroundId}
            onSelect={setSelectedBackgroundId}
          />
        ),
      },
      {
        id: 4,
        title: "Spells",
        description: "List from API",
        isComplete: true,
        isLocked: false,
        content: <SpellPicker spells={spells} />,
      },
    ],
    [
      backgrounds,
      classes,
      races,
      selectedBackgroundId,
      selectedClassId,
      selectedRaceId,
      spells,
    ],
  );

  return (
    <main className="app-shell">
      {loading ? <p className="status-banner">Loading API data...</p> : null}
      {error ? (
        <div className="error-banner" role="alert">
          <strong>Data loading issue:</strong> {error}
        </div>
      ) : null}

      <StepWizard
        steps={steps}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        onNext={() =>
          setCurrentStep((prev) => Math.min(prev + 1, steps.length))
        }
        onPrevious={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
      />
    </main>
  );
}

export default App;
