import type {
  AbilityKey,
  CasterProgression,
  UpstreamBackground,
  UpstreamClass,
  UpstreamClassTableGroup,
  UpstreamRace,
  UpstreamSpell,
  UpstreamSubclass,
  UpstreamSubrace,
} from "./upstream";

export type BuilderStepKey =
  | "race"
  | "subrace"
  | "class"
  | "subclass"
  | "background"
  | "abilities"
  | "spells"
  | "summary";

export type AbilityGenerationMethod = "standardArray" | "pointBuy" | "rolled";

export interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface SourceRef {
  name: string;
  source: string;
}

export interface BuilderRace extends SourceRef {
  id: string;
  entriesSummary: string;
  abilitySummary: string;
  sizeSummary: string;
  speedSummary: string;
  raw: UpstreamRace;
}

export interface BuilderSubrace extends SourceRef {
  id: string;
  raceName: string;
  raceSource: string;
  entriesSummary: string;
  raw: UpstreamSubrace;
}

export interface BuilderClass extends SourceRef {
  id: string;
  hitDie: number | null;
  spellcastingAbility?: AbilityKey;
  casterProgression: CasterProgression | "none";
  cantripProgression: number[];
  spellsKnownProgression: number[];
  spellsKnownProgressionFixedByLevel: Record<string, Record<string, number>>;
  preparedSpellsFormula?: string;
  classTableGroups: UpstreamClassTableGroup[];
  startingEquipmentText: string[];
  raw: UpstreamClass;
}

export interface BuilderSubclass extends SourceRef {
  id: string;
  className: string;
  classSource: string;
  shortName?: string;
  features: string[];
  raw: UpstreamSubclass;
}

export interface BuilderBackground extends SourceRef {
  id: string;
  entriesSummary: string;
  abilitySummary: string;
  startingEquipmentText: string[];
  raw: UpstreamBackground;
}

export type BuilderSpellClassRef = SourceRef;

export interface BuilderSpellSubclassRef {
  className: string;
  classSource: string;
  subclassName: string;
  subclassSource: string;
}

export interface BuilderSpellClasses {
  fromClassList: BuilderSpellClassRef[];
  fromClassListVariant: BuilderSpellClassRef[];
  fromSubclass: BuilderSpellSubclassRef[];
}

export interface BuilderSpell extends SourceRef {
  id: string;
  level: number;
  school?: string;
  entriesSummary: string;
  classes: BuilderSpellClasses;
  raw: UpstreamSpell;
}

export interface SpellcastingPactSlots {
  slots: number;
  slotLevel: number;
}

export interface SpellcastingSnapshot {
  level: number;
  progressionType: CasterProgression | "none";
  spellcastingAbility?: AbilityKey;
  cantripsKnown: number;
  spellsKnown: number | null;
  preparedFormula?: string;
  preparedEstimate: number | null;
  spellSlots: number[];
  pactSlots: SpellcastingPactSlots | null;
  fixedSpellsByLevel: Record<string, number>;
}

export interface SpellFilters {
  search: string;
  source: string;
  maxLevel: number | "all";
}

export interface CharacterPromptExport {
  meta: {
    schemaVersion: string;
    generatedAt: string;
  };
  character: {
    name: string;
    level: number;
    abilities: {
      method: AbilityGenerationMethod;
      scores: AbilityScores;
      modifiers: AbilityScores;
    };
    race: BuilderRace | null;
    subrace: BuilderSubrace | null;
    class: BuilderClass | null;
    subclass: BuilderSubclass | null;
    background: BuilderBackground | null;
    equipment: {
      class: string[];
      background: string[];
    };
    spellcasting: SpellcastingSnapshot | null;
    spells: BuilderSpell[];
  };
}
