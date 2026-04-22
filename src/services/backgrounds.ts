import backgroundsApi from "../api/backgrounds/routes";
import type { BuilderBackground } from "../types";
import type { UpstreamBackground } from "../types/upstream";
import {
  extractEquipmentText,
  makeEntityId,
  sortByNameAndSource,
  summarizeAbility,
  summarizeEntries,
} from "./utils";

function normalizeBackground(raw: UpstreamBackground): BuilderBackground {
  return {
    id: makeEntityId(raw.name, raw.source),
    name: raw.name,
    source: raw.source,
    entriesSummary: summarizeEntries(raw.entries),
    abilitySummary: summarizeAbility(raw.ability),
    startingEquipmentText: extractEquipmentText(raw.startingEquipment ?? []),
    raw,
  };
}

export async function getBackgrounds(): Promise<BuilderBackground[]> {
  const payload = await backgroundsApi.get();
  return sortByNameAndSource(
    (payload.background ?? []).map((background) =>
      normalizeBackground(background),
    ),
  );
}
