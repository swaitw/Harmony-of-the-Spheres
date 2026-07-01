import {
  ScenarioCameraType,
  ScenarioMassType,
  ScenarioType,
} from "../types/scenario";
import { VectorType } from "../types/physics";
import {
  CustomScenarioFormConfig,
  CustomScenarioStarConfig,
} from "../types/custom-scenario";
import { getMainSequenceStarProperties } from "../physics/utils/stellar";

const CUSTOM_SCENARIO_SESSION_KEY = "harmony-pending-custom-scenario";

const ZERO_VECTOR: VectorType = { x: 0, y: 0, z: 0 };

const DEFAULT_STAR: CustomScenarioStarConfig = {
  name: "Star",
  m: 1,
};

const createDefaultCustomScenarioForm = (): CustomScenarioFormConfig => {
  return {
    name: "Custom Scenario",
    integrator: {
      name: "RK4",
      g: 39.5,
      dt: 0.0001,
      tol: 0.001,
      maxDt: 0.0001,
      minDt: 0.00001,
      useBarnesHut: false,
      theta: 0.5,
      softeningConstant: 0,
    },
    graphics: {
      background: true,
      orbits: true,
      habitableZone: false,
      trails: true,
      labels: true,
    },
    particlesConfiguration: {
      max: 50000,
      softening: 0,
      size: 80,
    },
    star: { ...DEFAULT_STAR },
  };
};

const buildStarMass = (
  star: CustomScenarioStarConfig,
  gravitationalConstant: number,
): ScenarioMassType => {
  const starName = star.name.trim();
  const { radiusDisplay, temperatureKelvin } = getMainSequenceStarProperties(
    star.m,
  );

  return {
    name: starName,
    type: "star",
    m: star.m,
    radius: radiusDisplay,
    tilt: 0,
    atmosphere: "",
    temperature: temperatureKelvin,
    position: { ...ZERO_VECTOR },
    velocity: { ...ZERO_VECTOR },
    primary: {
      name: starName,
      gm: gravitationalConstant * star.m,
      position: { ...ZERO_VECTOR },
      velocity: { ...ZERO_VECTOR },
    },
    elements: {
      a: 0,
      e: 0,
      i: 0,
      argP: 0,
      lAn: 0,
      eccAnom: 0,
    },
    graphics: {
      orbit: true,
      trail: true,
      label: true,
    },
    nonStellarProceduralManifestation: false,
  };
};

const buildScenarioFromCustomForm = (
  config: CustomScenarioFormConfig,
): ScenarioType => {
  const starName = config.star.name.trim();
  const camera: ScenarioCameraType = {
    cameraFocus: starName,
    cameraPosition: starName,
    logarithmicDepthBuffer: false,
    rotatingReferenceFrame: starName,
    defaultCameraPositionOnScenarioStart: true,
  };

  return {
    name: config.name.trim(),
    playing: false,
    isLoaded: false,
    elapsedTime: 0,
    collisions: true,
    massBeingModified: {
      name: starName,
      unitName: "Solar Units",
      unitMassQuantity: config.star.m,
      m: config.star.m,
    },
    category: {
      name: "Custom",
      subCategory: null,
    },
    camera,
    integrator: { ...config.integrator },
    barycenter: {
      display: false,
      barycenterMassOne: starName,
      barycenterMassTwo: starName,
      systemBarycenter: true,
    },
    graphics: { ...config.graphics },
    masses: [buildStarMass(config.star, config.integrator.g)],
    particlesConfiguration: {
      ...config.particlesConfiguration,
      shapes: [],
    },
    lagrangePoints: {
      selectedMassName: starName,
      display: false,
    },
    ringToBeAdded: {
      primary: starName,
      a: 0,
      aInterval: 0,
      i: 0,
      lAn: 0,
      number: 1000,
      size: 0,
      ringsAreBeingAdded: false,
    },
  };
};

const storePendingCustomScenario = (scenario: ScenarioType): void => {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(CUSTOM_SCENARIO_SESSION_KEY, JSON.stringify(scenario));
};

const getPendingCustomScenario = (): ScenarioType | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = sessionStorage.getItem(CUSTOM_SCENARIO_SESSION_KEY);

    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue) as ScenarioType;
  } catch {
    return null;
  }
};

export {
  CUSTOM_SCENARIO_SESSION_KEY,
  createDefaultCustomScenarioForm,
  buildScenarioFromCustomForm,
  storePendingCustomScenario,
  getPendingCustomScenario,
};
