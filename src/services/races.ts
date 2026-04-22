import racesApi from "../api/races/routes";
import type { BuilderRace, BuilderSubrace } from "../types";
import type { UpstreamRace, UpstreamSubrace } from "../types/upstream";
import {
    isRecord,
    makeEntityId,
    sortByNameAndSource,
    summarizeAbility,
    summarizeEntries,
} from "./utils";

export interface RacesData {
  races: BuilderRace[];
  subraces: BuilderSubrace[];
}

function summarizeSize(size: unknown): string {
  if (!Array.isArray(size)) {
    return "Unknown";
  }

  const values = size.filter((value) => typeof value === "string");
  return values.length > 0 ? values.join(", ") : "Unknown";
}

function summarizeSpeed(speed: UpstreamRace["speed"]): string {
  if (typeof speed === "number") {
    return `${speed} ft.`;
  }

  if (!speed) {
    return "Unknown";
  }

  const chunks: string[] = [];

  if (typeof speed.walk === "number") {
    chunks.push(`walk ${speed.walk} ft.`);
  }
  if (typeof speed.fly === "number") {
    chunks.push(`fly ${speed.fly} ft.`);
  }
  if (speed.fly === true && typeof speed.walk === "number") {
    chunks.push(`fly ${speed.walk} ft.`);
  }
  if (typeof speed.swim === "number") {
    chunks.push(`swim ${speed.swim} ft.`);
  }
  if (typeof speed.climb === "number") {
    chunks.push(`climb ${speed.climb} ft.`);
  }
  if (typeof speed.burrow === "number") {
    chunks.push(`burrow ${speed.burrow} ft.`);
  }

  return chunks.length > 0 ? chunks.join(", ") : "Unknown";
}

function resolveSubraceParent(subrace: UpstreamSubrace): {
  raceName: string;
  raceSource: string;
} {
  if (
    typeof subrace.raceName === "string" &&
    typeof subrace.raceSource === "string"
  ) {
    return {
      raceName: subrace.raceName,
      raceSource: subrace.raceSource,
    };
  }

  if (isRecord(subrace._copy)) {
    const raceName =
      typeof subrace._copy.raceName === "string"
        ? subrace._copy.raceName
        : typeof subrace._copy._baseName === "string"
          ? subrace._copy._baseName
          : undefined;

    const raceSource =
      typeof subrace._copy.raceSource === "string"
        ? subrace._copy.raceSource
        : typeof subrace._copy._baseSource === "string"
          ? subrace._copy._baseSource
          : undefined;

    if (raceName && raceSource) {
      return { raceName, raceSource };
    }
  }

  return {
    raceName: "Unknown Race",
    raceSource: subrace.source,
  };
}

function normalizeRace(raw: UpstreamRace): BuilderRace {
  return {
    id: makeEntityId(raw.name, raw.source),
    name: raw.name,
    source: raw.source,
    entriesSummary: summarizeEntries(raw.entries),
    abilitySummary: summarizeAbility(raw.ability),
    sizeSummary: summarizeSize(raw.size),
    speedSummary: summarizeSpeed(raw.speed),
    raw,
  };
}

function normalizeSubrace(raw: UpstreamSubrace): BuilderSubrace {
  const parent = resolveSubraceParent(raw);

  return {
    id: makeEntityId(raw.name, raw.source),
    name: raw.name,
    source: raw.source,
    raceName: parent.raceName,
    raceSource: parent.raceSource,
    entriesSummary: summarizeEntries(raw.entries),
    raw,
  };
}

export async function getRacesData(): Promise<RacesData> {
  const payload = await racesApi.getRaces();

  const races = sortByNameAndSource(
    (payload.race ?? []).map((race) => normalizeRace(race)),
  );
  const subraces = sortByNameAndSource(
    (payload.subrace ?? []).map((subrace) => normalizeSubrace(subrace)),
  );

  return {
    races,
    subraces,
  };
}
