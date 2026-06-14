import { useEffect, useState } from "react";
import {
  getSavedScenarios,
  SAVED_SCENARIOS_CHANGED_EVENT,
} from "../utils/saved-scenarios-storage";
import { SavedScenarioEntry } from "../types/saved-scenario";

const useSavedScenarios = (): SavedScenarioEntry[] => {
  const [savedScenarios, setSavedScenarios] = useState<SavedScenarioEntry[]>(
    [],
  );

  useEffect(() => {
    const syncSavedScenarios = () => {
      setSavedScenarios(getSavedScenarios());
    };

    syncSavedScenarios();

    window.addEventListener(SAVED_SCENARIOS_CHANGED_EVENT, syncSavedScenarios);

    return () => {
      window.removeEventListener(
        SAVED_SCENARIOS_CHANGED_EVENT,
        syncSavedScenarios,
      );
    };
  }, []);

  return savedScenarios;
};

export default useSavedScenarios;
