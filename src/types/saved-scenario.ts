import { ScenarioType } from "./scenario";

type SavedScenarioEntry = {
  id: string;
  scenario: ScenarioType;
};

type SaveScenarioResult =
  | { success: true; id: string }
  | { success: false; error: "QUOTA_EXCEEDED" | "NAME_EXISTS" };

export type { SavedScenarioEntry, SaveScenarioResult };
