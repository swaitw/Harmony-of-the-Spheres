import {
  ParticlesConfigurationType,
  ScenarioGraphicsType,
  ScenarioIntegratorType,
} from "./scenario";

type CustomScenarioStarConfig = {
  name: string;
  m: number;
};

type CustomScenarioFormConfig = {
  name: string;
  integrator: ScenarioIntegratorType;
  graphics: ScenarioGraphicsType;
  particlesConfiguration: Omit<ParticlesConfigurationType, "shapes">;
  star: CustomScenarioStarConfig;
};

export type { CustomScenarioFormConfig, CustomScenarioStarConfig };
