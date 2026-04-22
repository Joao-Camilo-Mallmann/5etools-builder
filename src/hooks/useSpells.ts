import { useMemo } from "react";

import { getSpells, getSpellsForClass } from "../services/spells";
import { useCharacterStore } from "../store/character";
import type { BuilderClass, BuilderSubclass } from "../types";
import { useStoreResource } from "./useStoreResource";

export function useSpells(
  selectedClass: BuilderClass | null,
  selectedSubclass: BuilderSubclass | null,
) {
  const allSpells = useCharacterStore((state) => state.spells);
  const setSpells = useCharacterStore((state) => state.setSpells);

  const { loading, error } = useStoreResource({
    hasData: allSpells.length > 0,
    fetcher: getSpells,
    onData: setSpells,
    errorMessage: "Failed to load spells.",
  });

  const spells = useMemo(
    () => getSpellsForClass(allSpells, selectedClass, selectedSubclass),
    [allSpells, selectedClass, selectedSubclass],
  );

  return {
    spells,
    allSpells,
    loading,
    error,
  };
}
