import { useMemo } from "react";

import "./App.css";
import { AbilityScoresEditor } from "./components/AbilityScores";
import { BackgroundPicker } from "./components/BackgroundPicker";
import { CharacterSummary } from "./components/CharacterSummary";
import { ClassPicker } from "./components/ClassPicker";
import { PromptExporter } from "./components/PromptExporter";
import { RacePicker } from "./components/RacePicker";
import { SpellPicker } from "./components/SpellPicker";
import { StepWizard, type WizardStep } from "./components/StepWizard";
import { SubclassPicker } from "./components/SubclassPicker";
import { SubracePicker } from "./components/SubracePicker";
import { useBackgrounds } from "./hooks/useBackgrounds";
import { useClasses } from "./hooks/useClasses";
import { useRaces } from "./hooks/useRaces";
import { useSpells } from "./hooks/useSpells";
import { useCharacterStore } from "./store/character";

function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

function App() {
  const currentStep = useCharacterStore((state) => state.currentStep);
  const characterName = useCharacterStore((state) => state.characterName);
  const level = useCharacterStore((state) => state.level);
  const abilityMethod = useCharacterStore((state) => state.abilityMethod);
  const abilities = useCharacterStore((state) => state.abilities);

  const raceId = useCharacterStore((state) => state.raceId);
  const subraceId = useCharacterStore((state) => state.subraceId);
  const classId = useCharacterStore((state) => state.classId);
  const subclassId = useCharacterStore((state) => state.subclassId);
  const backgroundId = useCharacterStore((state) => state.backgroundId);

  const selectedSpellIds = useCharacterStore((state) => state.selectedSpellIds);
  const spellFilters = useCharacterStore((state) => state.spellFilters);

  const setCurrentStep = useCharacterStore((state) => state.setCurrentStep);
  const setCharacterName = useCharacterStore((state) => state.setCharacterName);
  const setLevel = useCharacterStore((state) => state.setLevel);
  const setAbilityMethod = useCharacterStore((state) => state.setAbilityMethod);
  const setAbilityScore = useCharacterStore((state) => state.setAbilityScore);
  const applyStandardArray = useCharacterStore(
    (state) => state.applyStandardArray,
  );
  const randomizeRolledAbilities = useCharacterStore(
    (state) => state.randomizeRolledAbilities,
  );

  const setRace = useCharacterStore((state) => state.setRace);
  const setSubrace = useCharacterStore((state) => state.setSubrace);
  const setClass = useCharacterStore((state) => state.setClass);
  const setSubclass = useCharacterStore((state) => state.setSubclass);
  const setBackground = useCharacterStore((state) => state.setBackground);

  const toggleSpell = useCharacterStore((state) => state.toggleSpell);
  const clearSpells = useCharacterStore((state) => state.clearSpells);
  const setSpellFilters = useCharacterStore((state) => state.setSpellFilters);
  const exportPromptJSON = useCharacterStore((state) => state.exportPromptJSON);

  const {
    races,
    subraces,
    loading: racesLoading,
    error: racesError,
  } = useRaces();
  const {
    classes,
    subclasses,
    loading: classesLoading,
    error: classesError,
  } = useClasses();
  const {
    backgrounds,
    loading: backgroundsLoading,
    error: backgroundsError,
  } = useBackgrounds();

  const selectedRace = useMemo(
    () => races.find((race) => race.id === raceId) ?? null,
    [races, raceId],
  );
  const selectedClass = useMemo(
    () => classes.find((builderClass) => builderClass.id === classId) ?? null,
    [classes, classId],
  );
  const selectedSubclass = useMemo(
    () => subclasses.find((subclass) => subclass.id === subclassId) ?? null,
    [subclasses, subclassId],
  );

  const {
    spells,
    loading: spellsLoading,
    error: spellsError,
  } = useSpells(selectedClass, selectedSubclass);

  const selectedSubrace = useMemo(
    () => subraces.find((subrace) => subrace.id === subraceId) ?? null,
    [subraces, subraceId],
  );
  const selectedBackground = useMemo(
    () =>
      backgrounds.find((background) => background.id === backgroundId) ?? null,
    [backgrounds, backgroundId],
  );
  const selectedSpells = useMemo(
    () => spells.filter((spell) => selectedSpellIds.includes(spell.id)),
    [selectedSpellIds, spells],
  );

  const availableSubraces = useMemo(() => {
    if (!selectedRace) {
      return [];
    }

    return subraces.filter(
      (subrace) =>
        subrace.raceName === selectedRace.name &&
        subrace.raceSource === selectedRace.source,
    );
  }, [selectedRace, subraces]);

  const availableSubclasses = useMemo(() => {
    if (!selectedClass) {
      return [];
    }

    return subclasses.filter(
      (subclass) =>
        subclass.className === selectedClass.name &&
        subclass.classSource === selectedClass.source,
    );
  }, [selectedClass, subclasses]);

  const spellcastingSnapshot = useCharacterStore
    .getState()
    .getSpellcastingSnapshot();

  const modifiers = useMemo(
    () => ({
      str: getAbilityModifier(abilities.str),
      dex: getAbilityModifier(abilities.dex),
      con: getAbilityModifier(abilities.con),
      int: getAbilityModifier(abilities.int),
      wis: getAbilityModifier(abilities.wis),
      cha: getAbilityModifier(abilities.cha),
    }),
    [abilities],
  );

  const raceComplete = selectedRace !== null;
  const subraceComplete =
    selectedRace !== null &&
    (availableSubraces.length === 0 || selectedSubrace !== null);
  const classComplete = selectedClass !== null;
  const subclassComplete =
    selectedClass !== null &&
    (availableSubclasses.length === 0 || selectedSubclass !== null);
  const backgroundComplete = selectedBackground !== null;
  const abilitiesComplete = Object.values(abilities).every(
    (score) => score >= 3 && score <= 20,
  );
  const spellsComplete = selectedClass !== null;
  const summaryComplete =
    raceComplete && classComplete && backgroundComplete && abilitiesComplete;

  const maxUnlockedStep = useMemo(() => {
    const completionList = [
      raceComplete,
      subraceComplete,
      classComplete,
      subclassComplete,
      backgroundComplete,
      abilitiesComplete,
      spellsComplete,
      summaryComplete,
    ];

    let unlocked = 1;
    for (let index = 0; index < completionList.length - 1; index += 1) {
      if (completionList[index]) {
        unlocked = index + 2;
      } else {
        break;
      }
    }
    return Math.min(unlocked, 8);
  }, [
    raceComplete,
    subraceComplete,
    classComplete,
    subclassComplete,
    backgroundComplete,
    abilitiesComplete,
    spellsComplete,
    summaryComplete,
  ]);

  const errors = [
    racesError,
    classesError,
    backgroundsError,
    spellsError,
  ].filter((value): value is string => Boolean(value));

  const isLoading =
    racesLoading || classesLoading || backgroundsLoading || spellsLoading;

  const steps: WizardStep[] = [
    {
      id: 1,
      title: "Race",
      description: "Pick base ancestry.",
      isComplete: raceComplete,
      isLocked: false,
      content: (
        <RacePicker races={races} selectedRaceId={raceId} onSelect={setRace} />
      ),
    },
    {
      id: 2,
      title: "Subrace",
      description: "Refine ancestry details.",
      isComplete: subraceComplete,
      isLocked: maxUnlockedStep < 2,
      content: (
        <SubracePicker
          subraces={availableSubraces}
          selectedSubraceId={subraceId}
          hasSelectedRace={selectedRace !== null}
          onSelect={setSubrace}
        />
      ),
    },
    {
      id: 3,
      title: "Class",
      description: "Pick the main class.",
      isComplete: classComplete,
      isLocked: maxUnlockedStep < 3,
      content: (
        <ClassPicker
          classes={classes}
          selectedClassId={classId}
          onSelect={setClass}
        />
      ),
    },
    {
      id: 4,
      title: "Subclass",
      description: "Pick specialization.",
      isComplete: subclassComplete,
      isLocked: maxUnlockedStep < 4,
      content: (
        <SubclassPicker
          subclasses={availableSubclasses}
          selectedSubclassId={subclassId}
          hasSelectedClass={selectedClass !== null}
          onSelect={setSubclass}
        />
      ),
    },
    {
      id: 5,
      title: "Background",
      description: "Define origin and gear.",
      isComplete: backgroundComplete,
      isLocked: maxUnlockedStep < 5,
      content: (
        <BackgroundPicker
          backgrounds={backgrounds}
          selectedBackgroundId={backgroundId}
          onSelect={setBackground}
        />
      ),
    },
    {
      id: 6,
      title: "Abilities",
      description: "Assign ability scores.",
      isComplete: abilitiesComplete,
      isLocked: maxUnlockedStep < 6,
      content: (
        <AbilityScoresEditor
          method={abilityMethod}
          scores={abilities}
          modifiers={modifiers}
          onMethodChange={setAbilityMethod}
          onScoreChange={setAbilityScore}
          onApplyStandard={applyStandardArray}
          onRollRandom={randomizeRolledAbilities}
        />
      ),
    },
    {
      id: 7,
      title: "Spells",
      description: "Select available spells.",
      isComplete: spellsComplete,
      isLocked: maxUnlockedStep < 7,
      content: (
        <SpellPicker
          spells={spells}
          selectedSpellIds={selectedSpellIds}
          filters={spellFilters}
          spellcastingSnapshot={spellcastingSnapshot}
          onToggleSpell={toggleSpell}
          onFilterChange={setSpellFilters}
          onClearSelection={clearSpells}
        />
      ),
    },
    {
      id: 8,
      title: "Summary",
      description: "Review and export JSON.",
      isComplete: summaryComplete,
      isLocked: maxUnlockedStep < 8,
      content: (
        <div className="summary-export-grid">
          <CharacterSummary
            name={characterName}
            level={level}
            race={selectedRace}
            subrace={selectedSubrace}
            builderClass={selectedClass}
            subclass={selectedSubclass}
            background={selectedBackground}
            abilities={abilities}
            modifiers={modifiers}
            selectedSpells={selectedSpells}
            spellcastingSnapshot={spellcastingSnapshot}
          />
          <PromptExporter onExport={exportPromptJSON} />
        </div>
      ),
    },
  ];

  const handleNext = () => {
    const current = steps.find((step) => step.id === currentStep);
    if (!current || !current.isComplete) {
      return;
    }

    const nextStep = Math.min(currentStep + 1, steps.length);
    if (nextStep <= maxUnlockedStep) {
      setCurrentStep(nextStep);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  return (
    <main className="app-shell">
      <section className="character-basics">
        <div className="field-group">
          <label htmlFor="character-name">Character Name</label>
          <input
            id="character-name"
            value={characterName}
            onChange={(event) => setCharacterName(event.target.value)}
            placeholder="Type a name"
          />
        </div>

        <div className="field-group">
          <label htmlFor="character-level">Character Level</label>
          <select
            id="character-level"
            value={level}
            onChange={(event) =>
              setLevel(Number.parseInt(event.target.value, 10))
            }
          >
            {Array.from({ length: 20 }).map((_, index) => {
              const value = index + 1;
              return (
                <option key={value} value={value}>
                  Level {value}
                </option>
              );
            })}
          </select>
        </div>
      </section>

      {isLoading ? (
        <p className="status-banner">Loading upstream data...</p>
      ) : null}
      {errors.length > 0 ? (
        <div className="error-banner" role="alert">
          <strong>Data loading issue:</strong>
          <ul>
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <StepWizard
        steps={steps}
        currentStep={currentStep}
        onStepChange={(step) => {
          if (step <= maxUnlockedStep) {
            setCurrentStep(step);
          }
        }}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </main>
  );
}

export default App;
