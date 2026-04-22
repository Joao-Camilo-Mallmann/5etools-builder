import { getBackgrounds } from "../services/backgrounds";
import { useCharacterStore } from "../store/character";
import { useStoreResource } from "./useStoreResource";

export function useBackgrounds() {
  const backgrounds = useCharacterStore((state) => state.backgrounds);
  const setBackgrounds = useCharacterStore((state) => state.setBackgrounds);

  const { loading, error } = useStoreResource({
    hasData: backgrounds.length > 0,
    fetcher: getBackgrounds,
    onData: setBackgrounds,
    errorMessage: "Failed to load backgrounds.",
  });

  return {
    backgrounds,
    loading,
    error,
  };
}
