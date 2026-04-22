import type { AbilityKey, CasterProgression, TableCell } from "./shared";

export interface UpstreamClassTableGroup {
  title?: string;
  colLabels?: string[];
  rows?: TableCell[][];
  rowsSpellProgression?: number[][];
  [key: string]: unknown;
}

export interface UpstreamClassStartingEquipment {
  additionalFromBackground?: boolean;
  default?: string[];
  defaultData?: unknown[];
  goldAlternative?: string;
  [key: string]: unknown;
}

export interface UpstreamClass {
  name: string;
  source: string;
  hd?: {
    number?: number;
    faces?: number;
  };
  spellcastingAbility?: AbilityKey;
  casterProgression?: CasterProgression;
  cantripProgression?: number[];
  spellsKnownProgression?: number[];
  spellsKnownProgressionFixedByLevel?: Record<string, Record<string, number>>;
  preparedSpells?: string;
  classTableGroups?: UpstreamClassTableGroup[];
  startingEquipment?: UpstreamClassStartingEquipment | Record<string, unknown>;
  [key: string]: unknown;
}

export interface UpstreamSubclass {
  name: string;
  shortName?: string;
  source: string;
  className: string;
  classSource: string;
  subclassFeatures?: string[];
  additionalSpells?: unknown[];
  [key: string]: unknown;
}

export interface UpstreamClassFile {
  _meta?: Record<string, unknown>;
  class?: UpstreamClass[];
  subclass?: UpstreamSubclass[];
}
