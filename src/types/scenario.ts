import { ShapesType, VectorType, ElementsType } from "./physics";

export type ScenarioCategoryType = {
  name: string;
  subCategory: string | null;
};

export type ScenarioCameraType = {
  cameraFocus: string;
  cameraPosition: string;
  logarithmicDepthBuffer: boolean;
  rotatingReferenceFrame: string;
  defaultCameraPositionOnScenarioStart?: boolean;
  defaultCameraPositionOnScenarioStartVector?: VectorType;
  cameraDistanceToOrigoInAu?: number;
  customOrigoCameraPosition?: VectorType;
  customBarycenterCameraPosition?: VectorType;
};

export type ScenarioIntegratorType = {
  name: string;
  g: number;
  dt: number;
  tol: number;
  maxDt: number;
  minDt: number;
  useBarnesHut: boolean;
  theta: number;
  softeningConstant: number;
};

export type ScenarioBarycenterType = {
  display: boolean;
  barycenterMassOne: string;
  barycenterMassTwo: string;
  systemBarycenter: boolean;
};

export type ScenarioGraphicsType = {
  background: boolean;
  orbits: boolean;
  habitableZone: boolean;
  trails: boolean;
  labels: boolean;
};

export type PrimaryType = {
  gm: number;
  position: VectorType;
  velocity: VectorType;
  name: string;
};

export type ScenarioMassGraphicsType = {
  orbit: boolean;
  trail: boolean;
  label: boolean;
};

export type ScenarioMassType = {
  name: string;
  type: string;
  m: number;
  radius: number;
  tilt: number;
  atmosphere: string;
  position: VectorType;
  velocity: VectorType;
  primary: PrimaryType;
  elements: ElementsType;
  rotatedPosition?: VectorType;
  temperature?: number;
  customMassCameraPosition?: VectorType;
  graphics: ScenarioMassGraphicsType;
  nonStellarProceduralManifestation?: boolean;
};

export type SOITree = {
  name: string;
  SOIradius: number;
  children: SOITree[];
  m?: number;
  x?: number;
  y?: number;
  z?: number;
};

export type ScenarioMassBeingModifiedType = {
  name: string;
  unitName: string;
  unitMassQuantity: number;
  m: number;
};

export type ScenarioMassesType = ScenarioMassType[];

export type ParticlesConfigurationType = {
  max: number;
  softening: number;
  size: number;
  shapes: ShapesType;
};

export type MassToBeAddedType = {
  name: string;
  type: string;
  primary: string;
  m: number;
  unitName: string;
  unitMassQuantity: number;
  elements: ElementsType;
  isBeingAdded: boolean;
};

export type RingToBeAddedType = {
  primary: string;
  a: number;
  aInterval: number;
  i: number;
  lAn: number;
  number: number;
  size: number;
  ringsAreBeingAdded: boolean;
};

export type ScenarioLagrangePointsType = {
  selectedMassName: string;
  display: boolean;
};

export type ScenarioType = {
  name: string;
  playing: boolean;
  isLoaded: boolean;
  elapsedTime: number;
  collisions: true;
  massBeingModified: ScenarioMassBeingModifiedType;
  category: ScenarioCategoryType;
  camera: ScenarioCameraType;
  integrator: ScenarioIntegratorType;
  barycenter: ScenarioBarycenterType;
  graphics: ScenarioGraphicsType;
  masses: ScenarioMassesType;
  particlesConfiguration?: ParticlesConfigurationType;
  lagrangePoints?: ScenarioLagrangePointsType;
  ringToBeAdded: RingToBeAddedType;
  massToBeAdded?: MassToBeAddedType;
};
