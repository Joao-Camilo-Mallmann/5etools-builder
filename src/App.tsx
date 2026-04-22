import { useCallback, useEffect, useMemo, useState } from "react";

import "./App.css";
import backgroundsApi from "./api/backgrounds";
import classesApi from "./api/classes";
import racesApi from "./api/races";
import spellcastingApi from "./api/spellcasting";
import { BackgroundPicker } from "./components/BackgroundPicker";
import { ClassPicker } from "./components/ClassPicker";
import { FinalSummary } from "./components/FinalSummary";
import { RacePicker } from "./components/RacePicker";
import { SelectionsSidebar } from "./components/SelectionsSidebar";
import { SpellPicker } from "./components/SpellPicker";
import { StepWizard, type WizardStep } from "./components/StepWizard";
import { SubclassPicker } from "./components/SubclassPicker";
import type {
    BuilderBackground,
    BuilderClass,
    BuilderRace,
    BuilderSpell,
    BuilderSubclass,
    BuilderSubrace,
} from "./types";
import type { UpstreamSubclass } from "./types/classes";
import type { UpstreamRace, UpstreamSubrace } from "./types/races";

function makeId(name: string, source: string): string {
  return `${name}|${source}`.toLowerCase();
}

function getEntryText(entry: unknown): string | null {
  if (typeof entry === "string") return entry.trim() || null;
  if (typeof entry !== "object" || entry === null) return null;

  const record = entry as {
    entries?: unknown;
    entry?: unknown;
    name?: unknown;
  };
  if (typeof record.entry === "string" && record.entry.trim()) {
    return record.entry.trim();
  }

  if (Array.isArray(record.entries)) {
    for (const child of record.entries) {
      const found = getEntryText(child);
      if (found) return found;
    }
  }

  if (typeof record.name === "string" && record.name.trim()) {
    return record.name.trim();
  }

  return null;
}

function getEntriesSummary(entries: unknown): string | undefined {
  if (!Array.isArray(entries)) return undefined;
  for (const entry of entries) {
    const text = getEntryText(entry);
    if (text) return text;
  }
  return undefined;
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

function toBuilderRace(value: unknown): BuilderRace {
  const record = typeof value === "object" && value !== null ? value : {};
  const raw = record as UpstreamRace;

  const name = typeof raw.name === "string" ? raw.name : "Unknown Race";
  const source = typeof raw.source === "string" ? raw.source : "unknown";

  return {
    id: makeId(name, source),
    name,
    source,
    sources: [source],
    entriesSummary: getEntriesSummary(raw.entries),
    raw: record as Record<string, unknown>,
    rawItems: [record as Record<string, unknown>],
  };
}

function mergeRacesByName(raceItems: BuilderRace[]): BuilderRace[] {
  const grouped = new Map<string, BuilderRace>();

  for (const race of raceItems) {
    const key = race.name.trim().toLowerCase();
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(key, {
        ...race,
        id: key,
        sources: race.sources?.length ? race.sources : [race.source],
        rawItems: race.rawItems?.length
          ? race.rawItems
          : race.raw
            ? [race.raw]
            : [],
      });
      continue;
    }

    const mergedSources = new Set<string>([
      ...(existing.sources?.length ? existing.sources : [existing.source]),
      ...(race.sources?.length ? race.sources : [race.source]),
    ]);

    existing.sources = [...mergedSources];
    existing.source = existing.sources.join(", ");

    if (!existing.entriesSummary && race.entriesSummary) {
      existing.entriesSummary = race.entriesSummary;
    }

    const incomingRawItems = race.rawItems?.length
      ? race.rawItems
      : race.raw
        ? [race.raw]
        : [];

    if (incomingRawItems.length) {
      existing.rawItems = [...(existing.rawItems ?? []), ...incomingRawItems];
    }
  }

  return [...grouped.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function toBuilderSubclass(value: unknown): BuilderSubclass | null {
  const record = typeof value === "object" && value !== null ? value : null;
  if (!record) return null;

  const raw = record as UpstreamSubclass;
  if (typeof raw.name !== "string" || typeof raw.source !== "string") {
    return null;
  }

  const features = Array.isArray(raw.subclassFeatures)
    ? raw.subclassFeatures.filter(
        (feature): feature is string => typeof feature === "string",
      )
    : [];

  return {
    id: makeId(raw.name, raw.source),
    name: raw.name,
    source: raw.source,
    className: typeof raw.className === "string" ? raw.className : undefined,
    classSource:
      typeof raw.classSource === "string" ? raw.classSource : undefined,
    features,
  };
}

function toBuilderSubrace(value: unknown): BuilderSubrace | null {
  const record = typeof value === "object" && value !== null ? value : null;
  if (!record) return null;

  const raw = record as UpstreamSubrace;
  if (typeof raw.name !== "string" || typeof raw.source !== "string") {
    return null;
  }

  return {
    id: makeId(raw.name, raw.source),
    name: raw.name,
    source: raw.source,
    raceName: typeof raw.raceName === "string" ? raw.raceName : undefined,
    raceSource: typeof raw.raceSource === "string" ? raw.raceSource : undefined,
    entriesSummary: getEntriesSummary(raw.entries),
    raw: record as Record<string, unknown>,
  };
}

function App() {
  const [currentStep, setCurrentStep] = useState(1);

  // ── Data from API ──────────────────────────────────────────
  const [races, setRaces] = useState<BuilderRace[]>([]);
  const [subraces, setSubraces] = useState<BuilderSubrace[]>([]);
  const [classes, setClasses] = useState<BuilderClass[]>([]);
  const [subclasses, setSubclasses] = useState<BuilderSubclass[]>([]);
  const [backgrounds, setBackgrounds] = useState<BuilderBackground[]>([]);
  const [spells, setSpells] = useState<BuilderSpell[]>([]);

  // ── User selections ────────────────────────────────────────
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const [selectedSubraceId, setSelectedSubraceId] = useState<string | null>(
    null,
  );
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSubclassId, setSelectedSubclassId] = useState<string | null>(
    null,
  );
  const [selectedBackgroundId, setSelectedBackgroundId] = useState<
    string | null
  >(null);
  const [selectedSpellIds, setSelectedSpellIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Load data ──────────────────────────────────────────────
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

        // Races + subraces
        const raceValues = Array.isArray(
          (racesPayload as { race?: unknown }).race,
        )
          ? ((racesPayload as { race: unknown[] }).race as unknown[])
          : [];

        const subraceValues = Array.isArray(
          (racesPayload as { subrace?: unknown }).subrace,
        )
          ? ((racesPayload as { subrace: unknown[] }).subrace as unknown[])
          : [];

        // Classes
        const classFiles = [
          ...new Set(
            Object.values(
              (classIndexPayload as Record<string, unknown>) ?? {},
            ).filter((value): value is string => typeof value === "string"),
          ),
        ];

        // Spells
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
        const subclassValues: unknown[] = [];
        for (const payload of classPayloads) {
          const entries = (payload as { class?: unknown }).class;
          if (Array.isArray(entries)) {
            classValues.push(...entries);
          }
          const subclassEntries = (payload as { subclass?: unknown }).subclass;
          if (Array.isArray(subclassEntries)) {
            subclassValues.push(...subclassEntries);
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

        setRaces(mergeRacesByName(raceValues.map((v) => toBuilderRace(v))));
        setSubraces(
          subraceValues
            .map((v) => toBuilderSubrace(v))
            .filter((v): v is BuilderSubrace => v !== null),
        );
        setClasses(classValues.map((v) => toEntity(v, "Unknown Class")));
        setSubclasses(
          subclassValues
            .map((v) => toBuilderSubclass(v))
            .filter((v): v is BuilderSubclass => v !== null),
        );
        setBackgrounds(
          backgroundValues.map((v) => toEntity(v, "Unknown Background")),
        );
        setSpells(spellValues.map((v) => toEntity(v, "Unknown Spell")));
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

  // ── Derived data ───────────────────────────────────────────
  const selectedRace = useMemo(
    () => races.find((r) => r.id === selectedRaceId) ?? null,
    [races, selectedRaceId],
  );

  const selectedSubrace = useMemo(
    () => subraces.find((sr) => sr.id === selectedSubraceId) ?? null,
    [subraces, selectedSubraceId],
  );

  const selectedClass = useMemo(
    () => classes.find((c) => c.id === selectedClassId) ?? null,
    [classes, selectedClassId],
  );

  const selectedSubclass = useMemo(
    () => subclasses.find((sc) => sc.id === selectedSubclassId) ?? null,
    [subclasses, selectedSubclassId],
  );

  const selectedBackground = useMemo(
    () => backgrounds.find((bg) => bg.id === selectedBackgroundId) ?? null,
    [backgrounds, selectedBackgroundId],
  );

  const selectedSpellsList = useMemo(
    () => spells.filter((s) => selectedSpellIds.includes(s.id)),
    [spells, selectedSpellIds],
  );

  const filteredSubraces = useMemo(() => {
    if (!selectedRace) return [];

    const allowedSources = new Set(
      selectedRace.sources?.length
        ? selectedRace.sources
        : [selectedRace.source],
    );

    return subraces.filter((sr) => {
      if (sr.raceName !== selectedRace.name) return false;
      if (!sr.raceSource) return true;
      return allowedSources.has(sr.raceSource);
    });
  }, [selectedRace, subraces]);

  const filteredSubclasses = useMemo(() => {
    if (!selectedClass) return [];
    return subclasses.filter(
      (sc) =>
        sc.className === selectedClass.name &&
        sc.classSource === selectedClass.source,
    );
  }, [selectedClass, subclasses]);

  // ── Handlers ───────────────────────────────────────────────
  const handleRaceSelect = (raceId: string | null) => {
    setSelectedRaceId(raceId);
    setSelectedSubraceId(null);
  };

  const handleClassSelect = (classId: string | null) => {
    setSelectedClassId(classId);
    setSelectedSubclassId(null);
  };

  const handleToggleSpell = useCallback((spellId: string) => {
    setSelectedSpellIds((prev) =>
      prev.includes(spellId)
        ? prev.filter((id) => id !== spellId)
        : [...prev, spellId],
    );
  }, []);

  const handleClearSpells = useCallback(() => {
    setSelectedSpellIds([]);
  }, []);

  const handleStartOver = () => {
    setCurrentStep(1);
    setSelectedRaceId(null);
    setSelectedSubraceId(null);
    setSelectedClassId(null);
    setSelectedSubclassId(null);
    setSelectedBackgroundId(null);
    setSelectedSpellIds([]);
  };

  // ── Steps definition ──────────────────────────────────────
  // Step completion: require selection except for optional steps
  const ancestryComplete =
    selectedRaceId !== null &&
    (filteredSubraces.length === 0 || selectedSubraceId !== null);
  const classComplete = selectedClassId !== null;
  const subclassComplete =
    filteredSubclasses.length === 0 || selectedSubclassId !== null;
  const backgroundComplete = selectedBackgroundId !== null;
  const spellsComplete = true; // Spells are optional
  const summaryComplete = true;

  const steps: WizardStep[] = useMemo(
    () => [
      {
        id: 1,
        title: "Race",
        isComplete: ancestryComplete,
        isLocked: false,
        content: (
          <RacePicker
            races={races}
            selectedRaceId={selectedRaceId}
            subraces={filteredSubraces}
            selectedSubraceId={selectedSubraceId}
            onSelect={handleRaceSelect}
            onSelectSubrace={setSelectedSubraceId}
          />
        ),
      },
      {
        id: 2,
        title: "Class",
        isComplete: classComplete,
        isLocked: !ancestryComplete,
        content: (
          <ClassPicker
            classes={classes}
            selectedClassId={selectedClassId}
            onSelect={handleClassSelect}
          />
        ),
      },
      {
        id: 3,
        title: "Subclass",
        isComplete: subclassComplete,
        isLocked: !classComplete,
        content: (
          <SubclassPicker
            subclasses={filteredSubclasses}
            selectedSubclassId={selectedSubclassId}
            hasSelectedClass={classComplete}
            className={selectedClass?.name ?? null}
            onSelect={setSelectedSubclassId}
          />
        ),
      },
      {
        id: 4,
        title: "Background",
        isComplete: backgroundComplete,
        isLocked: !classComplete || !subclassComplete,
        content: (
          <BackgroundPicker
            backgrounds={backgrounds}
            selectedBackgroundId={selectedBackgroundId}
            onSelect={setSelectedBackgroundId}
          />
        ),
      },
      {
        id: 5,
        title: "Spells",
        isComplete: spellsComplete,
        isLocked: !backgroundComplete,
        content: (
          <SpellPicker
            spells={spells}
            selectedSpellIds={selectedSpellIds}
            onToggleSpell={handleToggleSpell}
            onClearSpells={handleClearSpells}
          />
        ),
      },
      {
        id: 6,
        title: "Summary",
        isComplete: summaryComplete,
        isLocked: !backgroundComplete,
        content: (
          <FinalSummary
            race={selectedRace}
            subrace={selectedSubrace}
            builderClass={selectedClass}
            subclass={selectedSubclass}
            background={selectedBackground}
            selectedSpells={selectedSpellsList}
            onStartOver={handleStartOver}
          />
        ),
      },
    ],
    [
      races,
      classes,
      backgrounds,
      spells,
      filteredSubraces,
      filteredSubclasses,
      selectedRaceId,
      selectedSubraceId,
      selectedClassId,
      selectedSubclassId,
      selectedBackgroundId,
      selectedSpellIds,
      selectedRace,
      selectedSubrace,
      selectedClass,
      selectedSubclass,
      selectedBackground,
      selectedSpellsList,
      ancestryComplete,
      classComplete,
      subclassComplete,
      backgroundComplete,
      spellsComplete,
      summaryComplete,
      handleToggleSpell,
      handleClearSpells,
    ],
  );

  // ── Navigation guards ─────────────────────────────────────
  const handleNext = () => {
    const active = steps.find((s) => s.id === currentStep);
    if (active?.isComplete) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStepChange = (stepId: number) => {
    const target = steps.find((s) => s.id === stepId);
    if (target && !target.isLocked) {
      setCurrentStep(stepId);
    }
  };

  // ── Sidebar data ───────────────────────────────────────────
  const sidebarItems = useMemo(
    () => [
      { icon: "🧬", label: "Race", value: selectedRace?.name ?? null },
      { icon: "🌿", label: "Subrace", value: selectedSubrace?.name ?? null },
      { icon: "⚔", label: "Class", value: selectedClass?.name ?? null },
      { icon: "🛡", label: "Subclass", value: selectedSubclass?.name ?? null },
      {
        icon: "📜",
        label: "Background",
        value: selectedBackground?.name ?? null,
      },
      {
        icon: "🔮",
        label: "Spells",
        value:
          selectedSpellIds.length > 0
            ? `${selectedSpellIds.length} selected`
            : null,
      },
    ],
    [
      selectedRace,
      selectedSubrace,
      selectedClass,
      selectedSubclass,
      selectedBackground,
      selectedSpellIds,
    ],
  );

  return (
    <main className="app-shell">
      {loading ? (
        <p className="status-banner">⏳ Loading data from 5etools API...</p>
      ) : null}
      {error ? (
        <div className="error-banner" role="alert">
          <strong>Data loading issue:</strong> {error}
        </div>
      ) : null}

      {!loading && !error && (
        <StepWizard
          steps={steps}
          currentStep={currentStep}
          sidebar={<SelectionsSidebar items={sidebarItems} />}
          onStepChange={handleStepChange}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      )}
    </main>
  );
}

export default App;
