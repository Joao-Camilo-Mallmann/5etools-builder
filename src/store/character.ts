import { create } from "zustand";

import {
    getSpellcastingSnapshotForClass,
    isSpellAvailableForSelection,
} from "../services/spells";
import type {
    AbilityGenerationMethod,
    AbilityScores,
    BuilderBackground,
    BuilderClass,
    BuilderRace,
    BuilderSpell,
    BuilderSubclass,
    BuilderSubrace,
    CharacterPromptExport,
    SpellFilters,
    SpellcastingSnapshot,
} from "../types";

const DEFAULT_ABILITIES: AbilityScores = {
  str: 15,
  dex: 14,
  con: 13,
  int: 12,
  wis: 10,
  cha: 8,
};

const DEFAULT_FILTERS: SpellFilters = {
  search: "",
  source: "all",
  maxLevel: "all",
};

function clampLevel(value: number): number {
  const rounded = Math.floor(value);
  if (rounded < 1) {
    return 1;
  }
  if (rounded > 20) {
    return 20;
  }
  return rounded;
}

function clampAbility(value: number): number {
  const rounded = Math.floor(value);
  if (rounded < 3) {
    return 3;
  }
  if (rounded > 20) {
    return 20;
  }
  return rounded;
}

function getModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

function rollAbilityScore(): number {
  const rolls = [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
  ].sort((a, b) => a - b);

  return rolls[1] + rolls[2] + rolls[3];
}

interface CharacterStoreState {
  currentStep: number;
  characterName: string;
  level: number;
  abilityMethod: AbilityGenerationMethod;
  abilities: AbilityScores;

  raceId: string | null;
  subraceId: string | null;
  classId: string | null;
  subclassId: string | null;
  backgroundId: string | null;

  selectedSpellIds: string[];
  spellFilters: SpellFilters;

  races: BuilderRace[];
  subraces: BuilderSubrace[];
  classes: BuilderClass[];
  subclasses: BuilderSubclass[];
  backgrounds: BuilderBackground[];
  spells: BuilderSpell[];

  setCurrentStep: (step: number) => void;
  setCharacterName: (name: string) => void;
  setLevel: (level: number) => void;
  setAbilityMethod: (method: AbilityGenerationMethod) => void;
  setAbilityScore: (ability: keyof AbilityScores, value: number) => void;
  applyStandardArray: () => void;
  randomizeRolledAbilities: () => void;

  setRace: (raceId: string | null) => void;
  setSubrace: (subraceId: string | null) => void;
  setClass: (classId: string | null) => void;
  setSubclass: (subclassId: string | null) => void;
  setBackground: (backgroundId: string | null) => void;

  toggleSpell: (spellId: string) => void;
  clearSpells: () => void;
  setSpellFilters: (filters: Partial<SpellFilters>) => void;

  setRacesData: (data: {
    races: BuilderRace[];
    subraces: BuilderSubrace[];
  }) => void;
  setClassesData: (data: {
    classes: BuilderClass[];
    subclasses: BuilderSubclass[];
  }) => void;
  setBackgrounds: (backgrounds: BuilderBackground[]) => void;
  setSpells: (spells: BuilderSpell[]) => void;

  getSelectedRace: () => BuilderRace | null;
  getSelectedSubrace: () => BuilderSubrace | null;
  getSelectedClass: () => BuilderClass | null;
  getSelectedSubclass: () => BuilderSubclass | null;
  getSelectedBackground: () => BuilderBackground | null;
  getSelectedSpells: () => BuilderSpell[];
  getAvailableSubraces: () => BuilderSubrace[];
  getAvailableSubclasses: () => BuilderSubclass[];
  getAbilityModifiers: () => AbilityScores;
  getSpellcastingSnapshot: () => SpellcastingSnapshot | null;
  exportPromptJSON: () => CharacterPromptExport | null;

  resetAll: () => void;
}

export const useCharacterStore = create<CharacterStoreState>((set, get) => ({
  currentStep: 1,
  characterName: "",
  level: 1,
  abilityMethod: "standardArray",
  abilities: { ...DEFAULT_ABILITIES },

  raceId: null,
  subraceId: null,
  classId: null,
  subclassId: null,
  backgroundId: null,

  selectedSpellIds: [],
  spellFilters: { ...DEFAULT_FILTERS },

  races: [],
  subraces: [],
  classes: [],
  subclasses: [],
  backgrounds: [],
  spells: [],

  setCurrentStep: (step) => {
    set({ currentStep: Math.max(1, Math.min(8, Math.floor(step))) });
  },

  setCharacterName: (name) => {
    set({ characterName: name });
  },

  setLevel: (level) => {
    set({ level: clampLevel(level) });
  },

  setAbilityMethod: (method) => {
    set({ abilityMethod: method });
  },

  setAbilityScore: (ability, value) => {
    set((state) => ({
      abilities: {
        ...state.abilities,
        [ability]: clampAbility(value),
      },
    }));
  },

  applyStandardArray: () => {
    set({
      abilityMethod: "standardArray",
      abilities: { ...DEFAULT_ABILITIES },
    });
  },

  randomizeRolledAbilities: () => {
    set({
      abilityMethod: "rolled",
      abilities: {
        str: rollAbilityScore(),
        dex: rollAbilityScore(),
        con: rollAbilityScore(),
        int: rollAbilityScore(),
        wis: rollAbilityScore(),
        cha: rollAbilityScore(),
      },
    });
  },

  setRace: (raceId) => {
    set((state) => {
      const availableSubraces = state.subraces.filter(
        (subrace) =>
          state.races.find((race) => race.id === raceId)?.name ===
            subrace.raceName &&
          state.races.find((race) => race.id === raceId)?.source ===
            subrace.raceSource,
      );

      const shouldKeepSubrace =
        state.subraceId !== null &&
        availableSubraces.some((subrace) => subrace.id === state.subraceId);

      return {
        raceId,
        subraceId: shouldKeepSubrace ? state.subraceId : null,
      };
    });
  },

  setSubrace: (subraceId) => {
    set((state) => {
      if (!subraceId) {
        return { subraceId: null };
      }

      const selectedSubrace = state.subraces.find(
        (subrace) => subrace.id === subraceId,
      );
      const selectedRace = state.races.find((race) => race.id === state.raceId);

      if (!selectedSubrace || !selectedRace) {
        return { subraceId: null };
      }

      const isCompatible =
        selectedSubrace.raceName === selectedRace.name &&
        selectedSubrace.raceSource === selectedRace.source;

      return {
        subraceId: isCompatible ? subraceId : null,
      };
    });
  },

  setClass: (classId) => {
    set({
      classId,
      subclassId: null,
      selectedSpellIds: [],
    });
  },

  setSubclass: (subclassId) => {
    set((state) => {
      if (!subclassId) {
        return { subclassId: null };
      }

      const selectedSubclass = state.subclasses.find(
        (subclass) => subclass.id === subclassId,
      );
      const selectedClass = state.classes.find(
        (builderClass) => builderClass.id === state.classId,
      );

      if (!selectedSubclass || !selectedClass) {
        return { subclassId: null };
      }

      const isCompatible =
        selectedSubclass.className === selectedClass.name &&
        selectedSubclass.classSource === selectedClass.source;

      return {
        subclassId: isCompatible ? subclassId : null,
      };
    });
  },

  setBackground: (backgroundId) => {
    set({ backgroundId });
  },

  toggleSpell: (spellId) => {
    set((state) => {
      const selectedClass = state.classes.find(
        (builderClass) => builderClass.id === state.classId,
      );
      const selectedSubclass = state.subclasses.find(
        (subclass) => subclass.id === state.subclassId,
      );

      const spell = state.spells.find((candidate) => candidate.id === spellId);
      if (!spell) {
        return state;
      }

      if (
        !isSpellAvailableForSelection(
          spell,
          selectedClass ?? null,
          selectedSubclass ?? null,
        )
      ) {
        return state;
      }

      if (state.selectedSpellIds.includes(spellId)) {
        return {
          selectedSpellIds: state.selectedSpellIds.filter(
            (id) => id !== spellId,
          ),
        };
      }

      return {
        selectedSpellIds: [...state.selectedSpellIds, spellId],
      };
    });
  },

  clearSpells: () => {
    set({ selectedSpellIds: [] });
  },

  setSpellFilters: (filters) => {
    set((state) => ({
      spellFilters: {
        ...state.spellFilters,
        ...filters,
      },
    }));
  },

  setRacesData: (data) => {
    set({
      races: data.races,
      subraces: data.subraces,
    });
  },

  setClassesData: (data) => {
    set({
      classes: data.classes,
      subclasses: data.subclasses,
    });
  },

  setBackgrounds: (backgrounds) => {
    set({ backgrounds });
  },

  setSpells: (spells) => {
    set({ spells });
  },

  getSelectedRace: () => {
    const state = get();
    return state.races.find((race) => race.id === state.raceId) ?? null;
  },

  getSelectedSubrace: () => {
    const state = get();
    return (
      state.subraces.find((subrace) => subrace.id === state.subraceId) ?? null
    );
  },

  getSelectedClass: () => {
    const state = get();
    return (
      state.classes.find((builderClass) => builderClass.id === state.classId) ??
      null
    );
  },

  getSelectedSubclass: () => {
    const state = get();
    return (
      state.subclasses.find((subclass) => subclass.id === state.subclassId) ??
      null
    );
  },

  getSelectedBackground: () => {
    const state = get();
    return (
      state.backgrounds.find(
        (background) => background.id === state.backgroundId,
      ) ?? null
    );
  },

  getSelectedSpells: () => {
    const state = get();
    const selectedSet = new Set(state.selectedSpellIds);
    return state.spells.filter((spell) => selectedSet.has(spell.id));
  },

  getAvailableSubraces: () => {
    const state = get();
    const selectedRace = state.races.find((race) => race.id === state.raceId);

    if (!selectedRace) {
      return [];
    }

    return state.subraces.filter(
      (subrace) =>
        subrace.raceName === selectedRace.name &&
        subrace.raceSource === selectedRace.source,
    );
  },

  getAvailableSubclasses: () => {
    const state = get();
    const selectedClass = state.classes.find(
      (builderClass) => builderClass.id === state.classId,
    );

    if (!selectedClass) {
      return [];
    }

    return state.subclasses.filter(
      (subclass) =>
        subclass.className === selectedClass.name &&
        subclass.classSource === selectedClass.source,
    );
  },

  getAbilityModifiers: () => {
    const state = get();

    return {
      str: getModifier(state.abilities.str),
      dex: getModifier(state.abilities.dex),
      con: getModifier(state.abilities.con),
      int: getModifier(state.abilities.int),
      wis: getModifier(state.abilities.wis),
      cha: getModifier(state.abilities.cha),
    };
  },

  getSpellcastingSnapshot: () => {
    const state = get();
    const selectedClass = state.classes.find(
      (builderClass) => builderClass.id === state.classId,
    );

    return getSpellcastingSnapshotForClass(
      selectedClass ?? null,
      state.level,
      state.abilities,
    );
  },

  exportPromptJSON: () => {
    const state = get();

    const selectedRace =
      state.races.find((race) => race.id === state.raceId) ?? null;
    const selectedSubrace =
      state.subraces.find((subrace) => subrace.id === state.subraceId) ?? null;
    const selectedClass =
      state.classes.find((builderClass) => builderClass.id === state.classId) ??
      null;
    const selectedSubclass =
      state.subclasses.find((subclass) => subclass.id === state.subclassId) ??
      null;
    const selectedBackground =
      state.backgrounds.find(
        (background) => background.id === state.backgroundId,
      ) ?? null;

    if (!selectedRace || !selectedClass || !selectedBackground) {
      return null;
    }

    const selectedSpells = state.spells.filter((spell) =>
      state.selectedSpellIds.includes(spell.id),
    );

    const modifiers: AbilityScores = {
      str: getModifier(state.abilities.str),
      dex: getModifier(state.abilities.dex),
      con: getModifier(state.abilities.con),
      int: getModifier(state.abilities.int),
      wis: getModifier(state.abilities.wis),
      cha: getModifier(state.abilities.cha),
    };

    return {
      meta: {
        schemaVersion: "1.0.0",
        generatedAt: new Date().toISOString(),
      },
      character: {
        name: state.characterName.trim() || "Unnamed Adventurer",
        level: state.level,
        abilities: {
          method: state.abilityMethod,
          scores: { ...state.abilities },
          modifiers,
        },
        race: selectedRace,
        subrace: selectedSubrace,
        class: selectedClass,
        subclass: selectedSubclass,
        background: selectedBackground,
        equipment: {
          class: selectedClass.startingEquipmentText,
          background: selectedBackground.startingEquipmentText,
        },
        spellcasting: getSpellcastingSnapshotForClass(
          selectedClass,
          state.level,
          state.abilities,
        ),
        spells: selectedSpells,
      },
    };
  },

  resetAll: () => {
    set({
      currentStep: 1,
      characterName: "",
      level: 1,
      abilityMethod: "standardArray",
      abilities: { ...DEFAULT_ABILITIES },
      raceId: null,
      subraceId: null,
      classId: null,
      subclassId: null,
      backgroundId: null,
      selectedSpellIds: [],
      spellFilters: { ...DEFAULT_FILTERS },
    });
  },
}));
