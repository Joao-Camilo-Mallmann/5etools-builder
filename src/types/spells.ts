import type { UpstreamEntry } from "./shared";

export interface UpstreamSpellClassRef {
  name: string;
  source: string;
  [key: string]: unknown;
}

export interface UpstreamSpellSubclassRef {
  class: UpstreamSpellClassRef;
  subclass: UpstreamSpellClassRef;
  [key: string]: unknown;
}

export interface UpstreamSpellClasses {
  fromClassList?: UpstreamSpellClassRef[];
  fromClassListVariant?: UpstreamSpellClassRef[];
  fromSubclass?: UpstreamSpellSubclassRef[];
  [key: string]: unknown;
}

export interface UpstreamSpell {
  name: string;
  source: string;
  level: number;
  school?: string;
  entries?: UpstreamEntry[];
  classes?: UpstreamSpellClasses;
  [key: string]: unknown;
}

export interface UpstreamSpellFile {
  _meta?: Record<string, unknown>;
  spell?: UpstreamSpell[];
}

export interface UpstreamSpellLookupSubclassMeta {
  name?: string;
  [key: string]: unknown;
}

export interface UpstreamSpellLookupEntry {
  class?: Record<string, Record<string, boolean>>;
  subclass?: Record<
    string,
    Record<
      string,
      Record<string, Record<string, UpstreamSpellLookupSubclassMeta>>
    >
  >;
  [key: string]: unknown;
}

export type UpstreamSpellSourceLookup = Record<
  string,
  Record<string, UpstreamSpellLookupEntry>
>;
