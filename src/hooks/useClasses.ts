import { getClassesData } from "../services/classes";
import { useCharacterStore } from "../store/character";
import { useStoreResource } from "./useStoreResource";

export function useClasses() {
  const classes = useCharacterStore((state) => state.classes);
  const subclasses = useCharacterStore((state) => state.subclasses);
  const setClassesData = useCharacterStore((state) => state.setClassesData);

  const { loading, error } = useStoreResource({
    hasData: classes.length > 0,
    fetcher: getClassesData,
    onData: setClassesData,
    errorMessage: "Failed to load classes.",
  });

  return {
    classes,
    subclasses,
    loading,
    error,
  };
}
