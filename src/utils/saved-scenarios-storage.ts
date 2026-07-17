import { ScenarioType } from "../types/scenario";
import {
  SavedScenarioEntry,
  SaveScenarioResult,
} from "../types/saved-scenario";
import { kebabCase } from "./text-utils";

const SAVED_SCENARIOS_STORAGE_KEY = "harmony-saved-scenarios";

const SAVED_SCENARIOS_CHANGED_EVENT = "harmony-saved-scenarios-changed";

const dispatchSavedScenariosChanged = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SAVED_SCENARIOS_CHANGED_EVENT));
  }
};

const getSavedScenarios = (): SavedScenarioEntry[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawStorageValue = localStorage.getItem(SAVED_SCENARIOS_STORAGE_KEY);

    if (!rawStorageValue) {
      return [];
    }

    const parsedSavedScenarios = JSON.parse(rawStorageValue);

    return Array.isArray(parsedSavedScenarios) ? parsedSavedScenarios : [];
  } catch {
    return [];
  }
};

const getSavedScenarioById = (
  savedScenarioId: string,
): SavedScenarioEntry | null => {
  return (
    getSavedScenarios().find((savedScenarioEntry) => {
      return savedScenarioEntry.id === savedScenarioId;
    }) ?? null
  );
};

const getSavedScenarioSlug = (name: string): string => {
  return kebabCase(name.trim());
};

const getSavedScenarioPath = (name: string): string => {
  return `/scenarios/saved/${getSavedScenarioSlug(name)}`;
};

const getSavedScenarioBySlug = (slug: string): SavedScenarioEntry | null => {
  return (
    getSavedScenarios().find((savedScenarioEntry) => {
      return getSavedScenarioSlug(savedScenarioEntry.scenario.name) === slug;
    }) ?? null
  );
};

const getSavedScenarioFromUrlSegment = (
  segment: string,
): SavedScenarioEntry | null => {
  return getSavedScenarioBySlug(segment) ?? getSavedScenarioById(segment);
};

const isSavedScenarioNameTaken = (name: string): boolean => {
  const trimmedName = name.trim();

  return getSavedScenarios().some((savedScenarioEntry) => {
    return savedScenarioEntry.scenario.name.trim() === trimmedName;
  });
};

const isSavedScenarioSlugTaken = (name: string): boolean => {
  const slug = getSavedScenarioSlug(name);

  return getSavedScenarios().some((savedScenarioEntry) => {
    return getSavedScenarioSlug(savedScenarioEntry.scenario.name) === slug;
  });
};

const hasSavedScenarios = (): boolean => {
  return getSavedScenarios().length > 0;
};

const writeSavedScenarios = (entries: SavedScenarioEntry[]): void => {
  localStorage.setItem(SAVED_SCENARIOS_STORAGE_KEY, JSON.stringify(entries));

  dispatchSavedScenariosChanged();
};

const generateSavedScenarioId = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const saveScenario = (
  scenario: ScenarioType,
  name: string,
): SaveScenarioResult => {
  const trimmedName = name.trim();

  if (
    isSavedScenarioNameTaken(trimmedName) ||
    isSavedScenarioSlugTaken(trimmedName)
  ) {
    return { success: false, error: "NAME_EXISTS" };
  }

  const savedScenarioEntry: SavedScenarioEntry = {
    id: generateSavedScenarioId(),
    scenario: {
      ...(JSON.parse(JSON.stringify(scenario)) as ScenarioType),
      name: trimmedName,
    },
  };

  const updatedEntries = [...getSavedScenarios(), savedScenarioEntry];

  try {
    writeSavedScenarios(updatedEntries);

    return { success: true, id: savedScenarioEntry.id };
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" || error.code === 22)
    ) {
      return { success: false, error: "QUOTA_EXCEEDED" };
    }

    throw error;
  }
};

const deleteSavedScenario = (savedScenarioId: string): void => {
  const updatedEntries = getSavedScenarios().filter((savedScenarioEntry) => {
    return savedScenarioEntry.id !== savedScenarioId;
  });

  writeSavedScenarios(updatedEntries);
};

export {
  SAVED_SCENARIOS_STORAGE_KEY,
  SAVED_SCENARIOS_CHANGED_EVENT,
  getSavedScenarios,
  getSavedScenarioById,
  getSavedScenarioSlug,
  getSavedScenarioPath,
  getSavedScenarioBySlug,
  getSavedScenarioFromUrlSegment,
  isSavedScenarioNameTaken,
  isSavedScenarioSlugTaken,
  hasSavedScenarios,
  saveScenario,
  deleteSavedScenario,
};
