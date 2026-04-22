import { getRacesData } from "../services/races";
import { useCharacterStore } from "../store/character";
import { useStoreResource } from "./useStoreResource";

export function useRaces() {
  const races = useCharacterStore((state) => state.races);
  const subraces = useCharacterStore((state) => state.subraces);
  const setRacesData = useCharacterStore((state) => state.setRacesData);

  const { loading, error } = useStoreResource({
    hasData: races.length > 0,
    fetcher: getRacesData,
    onData: setRacesData,
    errorMessage: "Failed to load races.",
  });

  return {
    races,
    subraces,
    loading,
    error,
  };
}
