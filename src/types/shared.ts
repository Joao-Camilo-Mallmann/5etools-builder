export type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

export type UpstreamEntry = string | Record<string, unknown>;
export type UpstreamIndexFile = Record<string, string>;

export type CasterProgression =
  | "full"
  | "half"
  | "third"
  | "artificer"
  | "pact"
  | string;

export type TableCell = number | string | null;
