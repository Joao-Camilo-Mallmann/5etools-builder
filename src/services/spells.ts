import spellcastingApi from "../api/spellcasting/routes";
import type {
  AbilityScores,
  BuilderClass,
  BuilderSpell,
  BuilderSpellClassRef,
  BuilderSpellClasses,
  BuilderSpellSubclassRef,
  BuilderSubclass,
  SpellcastingPactSlots,
  SpellcastingSnapshot,
} from "../types";
import type {
  AbilityKey,
  CasterProgression,
  UpstreamSpell,
  UpstreamSpellClasses,
  UpstreamSpellLookupEntry,
  UpstreamSpellSourceLookup,
} from "../types/upstream";
import { isRecord, makeEntityId, summarizeEntries } from "./utils";
const FULL_SPELL_SLOTS: number[][] = [
  [2],
  [3],
  [4, 2],
  [4, 3],
  [4, 3, 2],
  [4, 3, 3],
  [4, 3, 3, 1],
  [4, 3, 3, 2],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1],
];

const HALF_SPELL_SLOTS: number[][] = [
  [],
  [2],
  [3],
  [3],
  [4, 2],
  [4, 2],
  [4, 3],
  [4, 3],
  [4, 3, 2],
  [4, 3, 2],
  [4, 3, 3],
  [4, 3, 3],
  [4, 3, 3, 1],
  [4, 3, 3, 1],
  [4, 3, 3, 2],
  [4, 3, 3, 2],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2],
];

const THIRD_SPELL_SLOTS: number[][] = [
  [],
  [],
  [2],
  [3],
  [3],
  [3],
  [4, 2],
  [4, 2],
  [4, 2],
  [4, 3],
  [4, 3],
  [4, 3],
  [4, 3, 2],
  [4, 3, 2],
  [4, 3, 2],
  [4, 3, 3],
  [4, 3, 3],
  [4, 3, 3],
  [4, 3, 3, 1],
  [4, 3, 3, 1],
];

const ARTIFICER_SPELL_SLOTS: number[][] = [
  [2],
  [2],
  [3],
  [3],
  [4, 2],
  [4, 2],
  [4, 3],
  [4, 3],
  [4, 3, 2],
  [4, 3, 2],
  [4, 3, 3],
  [4, 3, 3],
  [4, 3, 3, 1],
  [4, 3, 3, 1],
  [4, 3, 3, 2],
  [4, 3, 3, 2],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2],
];

const ABILITY_KEYS: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];

function normalizeProgression(
  progression: CasterProgression | "none",
): SpellcastingSnapshot["progressionType"] {
  if (
    progression === "full" ||
    progression === "half" ||
    progression === "third" ||
    progression === "artificer" ||
    progression === "pact"
  ) {
    return progression;
  }

  return "none";
}

function padSlots(row: number[]): number[] {
  const normalized = [...row];
  while (normalized.length < 9) {
    normalized.push(0);
  }
  return normalized;
}

function toSafeLevel(value: number): number {
  const rounded = Math.floor(value);
  if (rounded < 1) {
    return 1;
  }
  if (rounded > 20) {
    return 20;
  }
  return rounded;
}

function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

function getAbilityModifierFromKey(
  abilities: AbilityScores,
  key: AbilityKey,
): number {
  return abilityModifier(abilities[key]);
}

function parseCellNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const match = value.match(/(\d+)/);
  if (!match) {
    return null;
  }

  return Number.parseInt(match[1], 10);
}

function findCantripsKnownFromTables(
  builderClass: BuilderClass,
  level: number,
): number {
  for (const group of builderClass.classTableGroups) {
    if (!Array.isArray(group.colLabels) || !Array.isArray(group.rows)) {
      continue;
    }

    const cantripsColumnIndex = group.colLabels.findIndex((label) =>
      /cantrips known/i.test(label),
    );

    if (cantripsColumnIndex === -1) {
      continue;
    }

    const row = group.rows[level - 1];
    if (!Array.isArray(row)) {
      continue;
    }

    const amount = parseCellNumber(row[cantripsColumnIndex]);
    if (typeof amount === "number") {
      return amount;
    }
  }

  return 0;
}

function findSpellsKnownFromTables(
  builderClass: BuilderClass,
  level: number,
): number | null {
  for (const group of builderClass.classTableGroups) {
    if (!Array.isArray(group.colLabels) || !Array.isArray(group.rows)) {
      continue;
    }

    const spellsKnownColumnIndex = group.colLabels.findIndex((label) =>
      /spells known/i.test(label),
    );

    if (spellsKnownColumnIndex === -1) {
      continue;
    }

    const row = group.rows[level - 1];
    if (!Array.isArray(row)) {
      continue;
    }

    const amount = parseCellNumber(row[spellsKnownColumnIndex]);
    if (typeof amount === "number") {
      return amount;
    }
  }

  return null;
}

function findSpellSlotsFromTables(
  builderClass: BuilderClass,
  level: number,
): number[] | null {
  for (const group of builderClass.classTableGroups) {
    if (!Array.isArray(group.rowsSpellProgression)) {
      continue;
    }

    const row = group.rowsSpellProgression[level - 1];
    if (!Array.isArray(row)) {
      continue;
    }

    return padSlots(row);
  }

  return null;
}

function findPactSlotsFromTables(
  builderClass: BuilderClass,
  level: number,
): SpellcastingPactSlots | null {
  for (const group of builderClass.classTableGroups) {
    if (!Array.isArray(group.colLabels) || !Array.isArray(group.rows)) {
      continue;
    }

    const spellSlotsColumnIndex = group.colLabels.findIndex((label) =>
      /spell slots/i.test(label),
    );
    const slotLevelColumnIndex = group.colLabels.findIndex((label) =>
      /slot level/i.test(label),
    );

    if (spellSlotsColumnIndex === -1 || slotLevelColumnIndex === -1) {
      continue;
    }

    const row = group.rows[level - 1];
    if (!Array.isArray(row)) {
      continue;
    }

    const slots = parseCellNumber(row[spellSlotsColumnIndex]);
    const slotLevel = parseCellNumber(row[slotLevelColumnIndex]);

    if (typeof slots === "number" && typeof slotLevel === "number") {
      return {
        slots,
        slotLevel,
      };
    }
  }

  return null;
}

function getFallbackSpellSlots(
  progression: SpellcastingSnapshot["progressionType"],
  level: number,
): number[] {
  if (progression === "full") {
    return padSlots(FULL_SPELL_SLOTS[level - 1] ?? []);
  }

  if (progression === "half") {
    return padSlots(HALF_SPELL_SLOTS[level - 1] ?? []);
  }

  if (progression === "third") {
    return padSlots(THIRD_SPELL_SLOTS[level - 1] ?? []);
  }

  if (progression === "artificer") {
    return padSlots(ARTIFICER_SPELL_SLOTS[level - 1] ?? []);
  }

  return [];
}

function applyBinaryOperation(
  left: number,
  right: number,
  operator: string,
): number | null {
  if (operator === "+") {
    return left + right;
  }

  if (operator === "-") {
    return left - right;
  }

  return null;
}

function evaluatePreparedFormula(
  formula: string,
  level: number,
  abilities: AbilityScores,
): number | null {
  let expression = formula.toLowerCase();
  expression = expression.replaceAll("<$level$>", String(level));

  for (const key of ABILITY_KEYS) {
    const placeholder = `<$${key}_mod$>`;
    expression = expression.replaceAll(
      placeholder,
      String(getAbilityModifierFromKey(abilities, key)),
    );
  }

  expression = expression.replace(/\s+/g, "");

  if (/^-?\d+$/.test(expression)) {
    return Math.max(0, Number.parseInt(expression, 10));
  }

  const binary = expression.match(/^(-?\d+)([+-])(-?\d+)$/);
  if (binary) {
    const value = applyBinaryOperation(
      Number.parseInt(binary[1], 10),
      Number.parseInt(binary[3], 10),
      binary[2],
    );
    return value === null ? null : Math.max(0, value);
  }

  const maxBinary = expression.match(/^max\((-?\d+),(-?\d+)([+-])(-?\d+)\)$/);
  if (maxBinary) {
    const computed = applyBinaryOperation(
      Number.parseInt(maxBinary[2], 10),
      Number.parseInt(maxBinary[4], 10),
      maxBinary[3],
    );

    if (computed === null) {
      return null;
    }

    return Math.max(Number.parseInt(maxBinary[1], 10), computed);
  }

  const maxSimple = expression.match(/^max\((-?\d+),(-?\d+)\)$/);
  if (maxSimple) {
    return Math.max(
      Number.parseInt(maxSimple[1], 10),
      Number.parseInt(maxSimple[2], 10),
    );
  }

  const minSimple = expression.match(/^min\((-?\d+),(-?\d+)\)$/);
  if (minSimple) {
    return Math.min(
      Number.parseInt(minSimple[1], 10),
      Number.parseInt(minSimple[2], 10),
    );
  }

  return null;
}

function normalizeFixedSpellsByLevel(
  value: Record<string, Record<string, number>>,
  level: number,
): Record<string, number> {
  const fixed: Record<string, number> = {};

  for (const [characterLevelText, perSpellLevel] of Object.entries(value)) {
    const characterLevel = Number.parseInt(characterLevelText, 10);
    if (Number.isNaN(characterLevel) || characterLevel > level) {
      continue;
    }

    for (const [spellLevelText, amount] of Object.entries(perSpellLevel)) {
      fixed[spellLevelText] = (fixed[spellLevelText] ?? 0) + amount;
    }
  }

  return fixed;
}

function normalizeClassRefList(
  values: BuilderSpellClassRef[],
  additional: BuilderSpellClassRef[],
): BuilderSpellClassRef[] {
  const map = new Map<string, BuilderSpellClassRef>();

  for (const item of [...values, ...additional]) {
    map.set(`${item.name}|${item.source}`.toLowerCase(), item);
  }

  return [...map.values()].sort((a, b) => {
    const byName = a.name.localeCompare(b.name);
    if (byName !== 0) {
      return byName;
    }
    return a.source.localeCompare(b.source);
  });
}

function normalizeSubclassRefList(
  values: BuilderSpellSubclassRef[],
  additional: BuilderSpellSubclassRef[],
): BuilderSpellSubclassRef[] {
  const map = new Map<string, BuilderSpellSubclassRef>();

  for (const item of [...values, ...additional]) {
    map.set(
      `${item.className}|${item.classSource}|${item.subclassName}|${item.subclassSource}`.toLowerCase(),
      item,
    );
  }

  return [...map.values()].sort((a, b) => {
    const classCompare = a.className.localeCompare(b.className);
    if (classCompare !== 0) {
      return classCompare;
    }

    const subclassCompare = a.subclassName.localeCompare(b.subclassName);
    if (subclassCompare !== 0) {
      return subclassCompare;
    }

    return a.subclassSource.localeCompare(b.subclassSource);
  });
}

function parseUpstreamClasses(
  classes: UpstreamSpellClasses | undefined,
): BuilderSpellClasses {
  const fromClassList: BuilderSpellClassRef[] = [];
  const fromClassListVariant: BuilderSpellClassRef[] = [];
  const fromSubclass: BuilderSpellSubclassRef[] = [];

  for (const item of classes?.fromClassList ?? []) {
    if (typeof item.name === "string" && typeof item.source === "string") {
      fromClassList.push({
        name: item.name,
        source: item.source,
      });
    }
  }

  for (const item of classes?.fromClassListVariant ?? []) {
    if (typeof item.name === "string" && typeof item.source === "string") {
      fromClassListVariant.push({
        name: item.name,
        source: item.source,
      });
    }
  }

  for (const item of classes?.fromSubclass ?? []) {
    if (
      typeof item.class?.name === "string" &&
      typeof item.class?.source === "string" &&
      typeof item.subclass?.name === "string" &&
      typeof item.subclass?.source === "string"
    ) {
      fromSubclass.push({
        className: item.class.name,
        classSource: item.class.source,
        subclassName: item.subclass.name,
        subclassSource: item.subclass.source,
      });
    }
  }

  return {
    fromClassList,
    fromClassListVariant,
    fromSubclass,
  };
}

function parseLookupClassRefs(
  lookupEntry: UpstreamSpellLookupEntry | undefined,
): BuilderSpellClassRef[] {
  const refs: BuilderSpellClassRef[] = [];

  if (!lookupEntry?.class || !isRecord(lookupEntry.class)) {
    return refs;
  }

  for (const [classSource, classMap] of Object.entries(lookupEntry.class)) {
    if (!isRecord(classMap)) {
      continue;
    }

    for (const [className, enabled] of Object.entries(classMap)) {
      if (enabled === true) {
        refs.push({
          name: className,
          source: classSource,
        });
      }
    }
  }

  return refs;
}

function parseLookupSubclassRefs(
  lookupEntry: UpstreamSpellLookupEntry | undefined,
): BuilderSpellSubclassRef[] {
  const refs: BuilderSpellSubclassRef[] = [];

  if (!lookupEntry?.subclass || !isRecord(lookupEntry.subclass)) {
    return refs;
  }

  for (const [classSource, classMap] of Object.entries(lookupEntry.subclass)) {
    if (!isRecord(classMap)) {
      continue;
    }

    for (const [className, subclassSourceMap] of Object.entries(classMap)) {
      if (!isRecord(subclassSourceMap)) {
        continue;
      }

      for (const [subclassSource, subclassMap] of Object.entries(
        subclassSourceMap,
      )) {
        if (!isRecord(subclassMap)) {
          continue;
        }

        for (const subclassName of Object.keys(subclassMap)) {
          refs.push({
            className,
            classSource,
            subclassName,
            subclassSource,
          });
        }
      }
    }
  }

  return refs;
}

function normalizeSpell(
  spell: UpstreamSpell,
  lookup: UpstreamSpellSourceLookup,
): BuilderSpell {
  const upstreamClasses = parseUpstreamClasses(spell.classes);

  const sourceKey = spell.source.toLowerCase();
  const spellKey = spell.name.toLowerCase();
  const lookupEntry = lookup[sourceKey]?.[spellKey];

  const fromLookupClasses = parseLookupClassRefs(lookupEntry);
  const fromLookupSubclasses = parseLookupSubclassRefs(lookupEntry);

  return {
    id: makeEntityId(spell.name, spell.source),
    name: spell.name,
    source: spell.source,
    level: spell.level,
    school: spell.school,
    entriesSummary: summarizeEntries(spell.entries),
    classes: {
      fromClassList: normalizeClassRefList(
        upstreamClasses.fromClassList,
        fromLookupClasses,
      ),
      fromClassListVariant: normalizeClassRefList(
        upstreamClasses.fromClassListVariant,
        [],
      ),
      fromSubclass: normalizeSubclassRefList(
        upstreamClasses.fromSubclass,
        fromLookupSubclasses,
      ),
    },
    raw: spell,
  };
}

function sortSpells(values: BuilderSpell[]): BuilderSpell[] {
  return values.sort((a, b) => {
    const byLevel = a.level - b.level;
    if (byLevel !== 0) {
      return byLevel;
    }

    const byName = a.name.localeCompare(b.name);
    if (byName !== 0) {
      return byName;
    }

    return a.source.localeCompare(b.source);
  });
}

export async function getSpells(): Promise<BuilderSpell[]> {
  const [index, lookup] = await Promise.all([
    spellcastingApi.getIndex(),
    spellcastingApi.getSourceLookup(),
  ]);

  const spellFileNames = [...new Set(Object.values(index))];
  const files = await Promise.all(
    spellFileNames.map((fileName) => spellcastingApi.getSpellFile(fileName)),
  );

  const map = new Map<string, BuilderSpell>();

  for (const file of files) {
    for (const spell of file.spell ?? []) {
      const normalized = normalizeSpell(spell, lookup);
      map.set(normalized.id, normalized);
    }
  }

  return sortSpells([...map.values()]);
}

function matchesClass(
  classRef: BuilderSpellClassRef,
  selectedClass: BuilderClass,
): boolean {
  return (
    classRef.name.toLowerCase() === selectedClass.name.toLowerCase() &&
    classRef.source.toLowerCase() === selectedClass.source.toLowerCase()
  );
}

function matchesSubclass(
  subclassRef: BuilderSpellSubclassRef,
  selectedSubclass: BuilderSubclass,
): boolean {
  return (
    subclassRef.className.toLowerCase() ===
      selectedSubclass.className.toLowerCase() &&
    subclassRef.classSource.toLowerCase() ===
      selectedSubclass.classSource.toLowerCase() &&
    subclassRef.subclassName.toLowerCase() ===
      selectedSubclass.name.toLowerCase() &&
    subclassRef.subclassSource.toLowerCase() ===
      selectedSubclass.source.toLowerCase()
  );
}

export function isSpellAvailableForSelection(
  spell: BuilderSpell,
  selectedClass: BuilderClass | null,
  selectedSubclass: BuilderSubclass | null,
): boolean {
  if (!selectedClass) {
    return false;
  }

  const fromClass =
    spell.classes.fromClassList.some((ref) =>
      matchesClass(ref, selectedClass),
    ) ||
    spell.classes.fromClassListVariant.some((ref) =>
      matchesClass(ref, selectedClass),
    );

  if (fromClass) {
    return true;
  }

  if (!selectedSubclass) {
    return false;
  }

  return spell.classes.fromSubclass.some((ref) =>
    matchesSubclass(ref, selectedSubclass),
  );
}

export function getSpellsForClass(
  spells: BuilderSpell[],
  selectedClass: BuilderClass | null,
  selectedSubclass: BuilderSubclass | null,
): BuilderSpell[] {
  if (!selectedClass) {
    return [];
  }

  return spells.filter((spell) =>
    isSpellAvailableForSelection(spell, selectedClass, selectedSubclass),
  );
}

export function getSpellcastingSnapshotForClass(
  selectedClass: BuilderClass | null,
  levelInput: number,
  abilities: AbilityScores,
): SpellcastingSnapshot | null {
  if (!selectedClass) {
    return null;
  }

  const level = toSafeLevel(levelInput);
  const progressionType = normalizeProgression(selectedClass.casterProgression);

  const cantripsKnown =
    selectedClass.cantripProgression[level - 1] ??
    findCantripsKnownFromTables(selectedClass, level);

  const spellsKnownFromProgression =
    selectedClass.spellsKnownProgression[level - 1];
  const spellsKnownFromTable = findSpellsKnownFromTables(selectedClass, level);
  const spellsKnown =
    typeof spellsKnownFromProgression === "number"
      ? spellsKnownFromProgression
      : spellsKnownFromTable;

  const preparedEstimate = selectedClass.preparedSpellsFormula
    ? evaluatePreparedFormula(
        selectedClass.preparedSpellsFormula,
        level,
        abilities,
      )
    : null;

  const fixedSpellsByLevel = normalizeFixedSpellsByLevel(
    selectedClass.spellsKnownProgressionFixedByLevel,
    level,
  );

  if (progressionType === "pact") {
    return {
      level,
      progressionType,
      spellcastingAbility: selectedClass.spellcastingAbility,
      cantripsKnown,
      spellsKnown: spellsKnown ?? null,
      preparedFormula: selectedClass.preparedSpellsFormula,
      preparedEstimate,
      spellSlots: [],
      pactSlots: findPactSlotsFromTables(selectedClass, level),
      fixedSpellsByLevel,
    };
  }

  const spellSlots =
    findSpellSlotsFromTables(selectedClass, level) ??
    getFallbackSpellSlots(progressionType, level);

  return {
    level,
    progressionType,
    spellcastingAbility: selectedClass.spellcastingAbility,
    cantripsKnown,
    spellsKnown: spellsKnown ?? null,
    preparedFormula: selectedClass.preparedSpellsFormula,
    preparedEstimate,
    spellSlots,
    pactSlots: null,
    fixedSpellsByLevel,
  };
}
