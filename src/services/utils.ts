import type { AbilityKey, UpstreamEntry } from "../types/upstream";

const ABILITY_KEYS: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];

export function makeEntityId(name: string, source: string): string {
  return `${name}|${source}`.toLowerCase();
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringifyEquipmentValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (!isRecord(value)) {
    return "";
  }

  if (typeof value.item === "string") {
    const quantity =
      typeof value.quantity === "number" ? ` x${value.quantity}` : "";
    return `${value.item}${quantity}`;
  }

  if (typeof value.special === "string") {
    const quantity =
      typeof value.quantity === "number" ? ` x${value.quantity}` : "";
    return `${value.special}${quantity}`;
  }

  if (typeof value.equipmentType === "string") {
    return `equipment type: ${value.equipmentType}`;
  }

  if (typeof value.value === "number") {
    return `${value.value / 100} gp`;
  }

  if (typeof value.containsValue === "number") {
    return `${value.containsValue / 100} gp`;
  }

  if (typeof value.displayName === "string") {
    return value.displayName;
  }

  return "";
}

export function extractEquipmentText(input: unknown): string[] {
  if (!Array.isArray(input)) {
    if (!isRecord(input)) {
      return [];
    }

    if (Array.isArray(input.default)) {
      return extractEquipmentText(input.default);
    }

    return [];
  }

  const values = new Set<string>();

  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      for (const item of node) {
        walk(item);
      }
      return;
    }

    const text = stringifyEquipmentValue(node).trim();
    if (text) {
      values.add(text);
    }

    if (!isRecord(node)) {
      return;
    }

    for (const [key, value] of Object.entries(node)) {
      if (key === "item" || key === "displayName" || key === "special") {
        continue;
      }
      walk(value);
    }
  };

  walk(input);
  return [...values];
}

function summarizeEntryNode(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => summarizeEntryNode(item))
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  if (!isRecord(value)) {
    return "";
  }

  const fragments: string[] = [];

  if (typeof value.name === "string") {
    fragments.push(value.name);
  }

  if ("entry" in value) {
    fragments.push(summarizeEntryNode(value.entry));
  }

  if ("entries" in value) {
    fragments.push(summarizeEntryNode(value.entries));
  }

  if ("items" in value) {
    fragments.push(summarizeEntryNode(value.items));
  }

  return fragments.join(" ").trim();
}

export function summarizeEntries(entries: UpstreamEntry[] | undefined): string {
  if (!entries || entries.length === 0) {
    return "No textual description available.";
  }

  const text = entries
    .map((entry) => summarizeEntryNode(entry))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) {
    return "No textual description available.";
  }

  return text.length > 320 ? `${text.slice(0, 317)}...` : text;
}

function summarizeAbilityEntry(entry: unknown): string {
  if (!isRecord(entry)) {
    return "";
  }

  const parts: string[] = [];

  for (const key of ABILITY_KEYS) {
    const value = entry[key];
    if (typeof value === "number") {
      parts.push(`${key.toUpperCase()} ${value >= 0 ? "+" : ""}${value}`);
    }
  }

  if (parts.length > 0) {
    return parts.join(", ");
  }

  if ("choose" in entry) {
    return "Choice-based ability adjustment";
  }

  return "";
}

export function summarizeAbility(ability: unknown): string {
  if (!Array.isArray(ability) || ability.length === 0) {
    return "No explicit ability adjustment";
  }

  const values = ability
    .map((entry) => summarizeAbilityEntry(entry))
    .filter((value) => value.length > 0);

  if (values.length === 0) {
    return "No explicit ability adjustment";
  }

  return values.join(" / ");
}

export function sortByNameAndSource<T extends { name: string; source: string }>(
  values: T[],
): T[] {
  return values.sort((a, b) => {
    const nameCompare = a.name.localeCompare(b.name);
    if (nameCompare !== 0) {
      return nameCompare;
    }
    return a.source.localeCompare(b.source);
  });
}
