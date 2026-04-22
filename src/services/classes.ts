import classesApi from "../api/classes/routes";
import type { BuilderClass, BuilderSubclass } from "../types";
import type {
  UpstreamClass,
  UpstreamClassStartingEquipment,
  UpstreamSubclass,
} from "../types/upstream";
import {
  extractEquipmentText,
  isRecord,
  makeEntityId,
  sortByNameAndSource,
} from "./utils";

export interface ClassesData {
  classes: BuilderClass[];
  subclasses: BuilderSubclass[];
}

function normalizeFixedSpellsByLevel(
  value: UpstreamClass["spellsKnownProgressionFixedByLevel"],
): Record<string, Record<string, number>> {
  if (!value || !isRecord(value)) {
    return {};
  }

  const output: Record<string, Record<string, number>> = {};
  for (const [characterLevel, slotMap] of Object.entries(value)) {
    if (!isRecord(slotMap)) {
      continue;
    }

    const normalizedSlotMap: Record<string, number> = {};
    for (const [spellLevel, amount] of Object.entries(slotMap)) {
      if (typeof amount === "number") {
        normalizedSlotMap[spellLevel] = amount;
      }
    }

    output[characterLevel] = normalizedSlotMap;
  }

  return output;
}

function normalizeStartingEquipment(
  raw: UpstreamClassStartingEquipment | Record<string, unknown> | undefined,
): string[] {
  if (!raw) {
    return [];
  }

  if (isRecord(raw) && Array.isArray(raw.default)) {
    return extractEquipmentText(raw.default);
  }

  return extractEquipmentText(raw);
}

function normalizeClass(raw: UpstreamClass): BuilderClass {
  const hitDie = typeof raw.hd?.faces === "number" ? raw.hd.faces : null;

  return {
    id: makeEntityId(raw.name, raw.source),
    name: raw.name,
    source: raw.source,
    hitDie,
    spellcastingAbility: raw.spellcastingAbility,
    casterProgression: raw.casterProgression ?? "none",
    cantripProgression: raw.cantripProgression ?? [],
    spellsKnownProgression: raw.spellsKnownProgression ?? [],
    spellsKnownProgressionFixedByLevel: normalizeFixedSpellsByLevel(
      raw.spellsKnownProgressionFixedByLevel,
    ),
    preparedSpellsFormula:
      typeof raw.preparedSpells === "string" ? raw.preparedSpells : undefined,
    classTableGroups: raw.classTableGroups ?? [],
    startingEquipmentText: normalizeStartingEquipment(raw.startingEquipment),
    raw,
  };
}

function normalizeSubclass(raw: UpstreamSubclass): BuilderSubclass {
  return {
    id: makeEntityId(raw.name, raw.source),
    name: raw.name,
    source: raw.source,
    className: raw.className,
    classSource: raw.classSource,
    shortName: raw.shortName,
    features: (raw.subclassFeatures ?? []).filter(
      (feature): feature is string => typeof feature === "string",
    ),
    raw,
  };
}

export async function getClassesData(): Promise<ClassesData> {
  const index = await classesApi.getIndex();
  const classFileNames = [...new Set(Object.values(index))];

  const files = await Promise.all(
    classFileNames.map((fileName) => classesApi.getClassFile(fileName)),
  );

  const classesMap = new Map<string, BuilderClass>();
  const subclassesMap = new Map<string, BuilderSubclass>();

  for (const file of files) {
    for (const classItem of file.class ?? []) {
      const normalizedClass = normalizeClass(classItem);
      classesMap.set(normalizedClass.id, normalizedClass);
    }

    for (const subclassItem of file.subclass ?? []) {
      const normalizedSubclass = normalizeSubclass(subclassItem);
      subclassesMap.set(normalizedSubclass.id, normalizedSubclass);
    }
  }

  return {
    classes: sortByNameAndSource([...classesMap.values()]),
    subclasses: sortByNameAndSource([...subclassesMap.values()]),
  };
}
