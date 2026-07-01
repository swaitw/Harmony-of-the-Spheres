import { VectorType } from "../types/physics";
import {
  ScenarioMassesType,
  ScenarioMassType,
  SOITree,
} from "../types/scenario";
import { constructSOITree } from "../physics/utils/elements";
import { getBarycenter } from "../physics/utils/misc";

const SCENE_SCALE = 2100000;
const CAMERA_FOV_RADIANS = (45 * Math.PI) / 180;
const DEFAULT_ASPECT = 16 / 9;
const VIEW_PADDING = 1.15;
const DISTANCE_MULTIPLIER = 4;

const findSOINode = (tree: SOITree, name: string): SOITree | null => {
  if (tree.name === name) {
    return tree;
  }

  const childrenLength = tree.children.length;

  for (let i = 0; i < childrenLength; i++) {
    const found = findSOINode(tree.children[i], name);

    if (found) {
      return found;
    }
  }

  return null;
};

const collectSOIDescendantNames = (node: SOITree): string[] => {
  const names: string[] = [];

  const walk = (currentNode: SOITree): void => {
    const childrenLength = currentNode.children.length;

    for (let i = 0; i < childrenLength; i++) {
      const child = currentNode.children[i];
      names.push(child.name);
      walk(child);
    }
  };

  walk(node);

  return names;
};

const getMassesInSOI = (
  masses: ScenarioMassesType,
  focusMass: ScenarioMassType,
  focusNode: SOITree,
): ScenarioMassType[] => {
  const descendantNames = collectSOIDescendantNames(focusNode);

  return masses.filter(
    (mass) =>
      mass.name === focusMass.name || descendantNames.includes(mass.name),
  );
};

const computeYFromBoundingBox = (
  minX: number,
  maxX: number,
  minZ: number,
  maxZ: number,
  minDistance: number,
): number => {
  const tanHalfFov = Math.tan(CAMERA_FOV_RADIANS / 2);
  const boxWidth = maxX - minX;
  const boxDepth = maxZ - minZ;
  const yForHeight = boxDepth / 2 / tanHalfFov;
  const yForWidth = boxWidth / 2 / (tanHalfFov * DEFAULT_ASPECT);

  return (
    Math.max(yForHeight, yForWidth, minDistance) *
    VIEW_PADDING *
    DISTANCE_MULTIPLIER
  );
};

const expandBoundingBoxForMass = (
  minX: number,
  maxX: number,
  minZ: number,
  maxZ: number,
  dx: number,
  dz: number,
  radius: number,
): { minX: number; maxX: number; minZ: number; maxZ: number } => {
  return {
    minX: Math.min(minX, dx - radius),
    maxX: Math.max(maxX, dx + radius),
    minZ: Math.min(minZ, dz - radius),
    maxZ: Math.max(maxZ, dz + radius),
  };
};

const computeMassFocusDefaultCameraPosition = (
  masses: ScenarioMassesType,
  cameraFocus: string,
): VectorType | null => {
  const focusMass = masses.find((mass) => mass.name === cameraFocus);

  if (!focusMass) {
    return null;
  }

  const soiTree = constructSOITree(masses);
  const focusNode = findSOINode(soiTree, cameraFocus);

  if (!focusNode) {
    return null;
  }

  const massesInSOI = getMassesInSOI(masses, focusMass, focusNode);

  let minX = -focusMass.radius;
  let maxX = focusMass.radius;
  let minZ = -focusMass.radius;
  let maxZ = focusMass.radius;

  const massesInSOILength = massesInSOI.length;

  for (let i = 0; i < massesInSOILength; i++) {
    const mass = massesInSOI[i];
    const dx = (mass.position.x - focusMass.position.x) * SCENE_SCALE;
    const dz = (mass.position.z - focusMass.position.z) * SCENE_SCALE;
    ({ minX, maxX, minZ, maxZ } = expandBoundingBoxForMass(
      minX,
      maxX,
      minZ,
      maxZ,
      dx,
      dz,
      mass.radius,
    ));
  }

  const y = computeYFromBoundingBox(
    minX,
    maxX,
    minZ,
    maxZ,
    focusMass.radius * 10,
  );

  return { x: 0, y, z: 0 };
};

const computeBarycenterDefaultCameraPosition = (
  masses: ScenarioMassesType,
): VectorType | null => {
  if (masses.length === 0) {
    return null;
  }

  const barycenterPosition = getBarycenter(masses);

  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  let maxRadius = 0;

  const massesLength = masses.length;

  for (let i = 0; i < massesLength; i++) {
    const mass = masses[i];
    const dx = (mass.position.x - barycenterPosition.x) * SCENE_SCALE;
    const dz = (mass.position.z - barycenterPosition.z) * SCENE_SCALE;

    minX = Math.min(minX, dx - mass.radius);
    maxX = Math.max(maxX, dx + mass.radius);
    minZ = Math.min(minZ, dz - mass.radius);
    maxZ = Math.max(maxZ, dz + mass.radius);
    maxRadius = Math.max(maxRadius, mass.radius);
  }

  const y = computeYFromBoundingBox(
    minX,
    maxX,
    minZ,
    maxZ,
    maxRadius * 10,
  );

  return { x: 0, y, z: 0 };
};

const computeTwoBodyBarycenterDefaultCameraPosition = (
  masses: ScenarioMassesType,
  barycenterMassOne: string,
  barycenterMassTwo: string,
): VectorType | null => {
  const barycenterMasses = masses.filter(
    (mass) =>
      mass.name === barycenterMassOne || mass.name === barycenterMassTwo,
  );

  return computeBarycenterDefaultCameraPosition(barycenterMasses);
};

const computeDefaultCameraPositionOnScenarioStartVector = (
  masses: ScenarioMassesType,
  cameraFocus: string,
  systemBarycenter: boolean,
  barycenterMassOne: string,
  barycenterMassTwo: string,
): VectorType | null => {
  if (cameraFocus === "Origo") {
    return null;
  }

  if (cameraFocus === "Barycenter") {
    if (systemBarycenter) {
      return computeBarycenterDefaultCameraPosition(masses);
    }

    return computeTwoBodyBarycenterDefaultCameraPosition(
      masses,
      barycenterMassOne,
      barycenterMassTwo,
    );
  }

  return computeMassFocusDefaultCameraPosition(masses, cameraFocus);
};

export { computeDefaultCameraPositionOnScenarioStartVector };
