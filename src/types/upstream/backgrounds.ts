import type { UpstreamEntry } from "./shared";

export interface UpstreamBackgroundFile {
  _meta?: Record<string, unknown>;
  background?: UpstreamBackground[];
}

export interface UpstreamBackground {
  name: string;
  source: string;
  entries?: UpstreamEntry[];
  ability?: unknown[];
  startingEquipment?: unknown[];
  [key: string]: unknown;
}
