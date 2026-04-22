import type { UpstreamEntry } from "./shared";

export interface UpstreamRaceFile {
  _meta?: Record<string, unknown>;
  race?: UpstreamRace[];
  subrace?: UpstreamSubrace[];
}

export interface UpstreamRace {
  name: string;
  source: string;
  entries?: UpstreamEntry[];
  ability?: unknown[];
  size?: string[];
  speed?:
    | number
    | {
        walk?: number;
        fly?: number | boolean;
        swim?: number;
        climb?: number;
        burrow?: number;
      };
  [key: string]: unknown;
}

export interface UpstreamSubrace {
  name: string;
  source: string;
  raceName?: string;
  raceSource?: string;
  entries?: UpstreamEntry[];
  [key: string]: unknown;
}
