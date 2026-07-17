import { ScenarioMassesType } from "./scenario";

export type VectorType = {
  x: number;
  y: number;
  z: number;
};

export type ElementsType = {
  a: number;
  e: number;
  i: number;
  argP: number;
  lAn: number;
  eccAnom: number;
};

export type IntegratorConfigType = {
  g: number;
  dt: number;
  tol?: number;
  minDt?: number;
  maxDt?: number;
  masses: ScenarioMassesType;
  elapsedTime: number;
  softening?: number;
  useBarnesHut?: boolean;
  theta?: number;
};

export type FixedTimeStepIntegratorConfigType = IntegratorConfigType;

export type BarnesHutMassNodeType = VectorType & { m: number };

export type BarnesHutTreeNodeType = {
  size: number;
  position: VectorType;
  CoM: VectorType;
  mass: number;
  nMasses?: number;
  children: BarnesHutTreeNodeType[] | BarnesHutMassNodeType[];
};

export type OrbitalElementsType = ElementsType & {
  trueAnom: number;
  meanAnom: number;
};

export type ParticleType = {
  lives: number;
  position: VectorType;
  velocity: VectorType;
  hsl?: [number, number, number];
  size?: number;
};

export type ParticlesType = ParticleType[];

export type ShapeType = {
  primary: string;
  type: string;
  flatLand: boolean;
  tilt: [number, number, number];
  number: number;
  minD: number;
  maxD: number;
  verticalDispersion?: number;
  hsl?: [number, number, number];
  size?: number;
};

export type ShapesType = ShapeType[];
