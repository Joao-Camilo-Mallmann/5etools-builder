export interface BuilderEntity {
  id: string;
  name: string;
  source: string;
}

export type BuilderRace = BuilderEntity;
export type BuilderClass = BuilderEntity;
export type BuilderBackground = BuilderEntity;
export interface BuilderSpell extends BuilderEntity {
  level?: number;
}

export type AbilityGenerationMethod = "standardArray" | "pointBuy" | "rolled";

export interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface BuilderSubrace extends BuilderEntity {
  entriesSummary?: string;
  raceName?: string;
  raceSource?: string;
}

export interface BuilderSubclass extends BuilderEntity {
  className?: string;
  classSource?: string;
  features: string[];
}

export interface SpellcastingPactSlots {
  slots: number;
  slotLevel: number;
}

export interface SpellcastingSnapshot {
  progressionType: string;
  cantripsKnown: number;
  spellsKnown: number | null;
  preparedEstimate?: number | null;
  spellSlots: number[];
  pactSlots: SpellcastingPactSlots | null;
}

export interface CharacterPromptExport {
  [key: string]: unknown;
}
