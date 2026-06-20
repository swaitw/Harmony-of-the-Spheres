import { ScenarioMassType, ScenarioMassesType } from "../../types/scenario";
import H3 from "../../physics/utils/vector";
import { VectorType } from "../../types/physics";
import {
  NearestStarInfoType,
  PlanetCategory,
  SudarskiClassType,
} from "../../types/planet";

const degreesToRadians = (degrees: number) => (Math.PI / 180) * degrees;

const radiansToDegrees = (radians: number) => radians * 57.295779513;

const getRandomNumberInRange = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const getRandomRadian = () => Math.PI * 2 * Math.random();

const getVelocityMagnitude = (
  g: number,
  primary: ScenarioMassType,
  d: number,
  a = d,
) => Math.sqrt(Math.abs(g * primary.m * (2 / d - 1 / a)));

const getFocusOfEllipse = (a: number, b: number) => {
  return Math.sqrt(a * a - b * b);
};

const getSemiMinorAxis = (a: number, e: number) => {
  return a * Math.sqrt(1 - e * e);
};

const getEllipse = (a: number, e: number) => {
  const b = getSemiMinorAxis(a, e);

  return {
    focus: getFocusOfEllipse(a, b),
    xRadius: a,
    yRadius: b,
  };
};

const getConicSection = (a: number, e: number) => {
  if (e < 1) {
    const b = getSemiMinorAxis(a, e);

    return {
      focus: getFocusOfEllipse(a, b),
      xRadius: a,
      yRadius: b,
    };
  }

  const b = a * Math.sqrt(e * e - 1);

  return {
    focus: -(a * e),
    xRadius: a,
    yRadius: b,
  };
};

const clamp = (x: number, min: number, max: number): number => {
  if (x < min) {
    return min;
  }
  if (x > max) {
    return max;
  }

  return x;
};

const temperatureToRGB = (
  kelvin: number,
): { r: number; g: number; b: number } => {
  var temp = kelvin / 100;

  var red, green, blue;

  if (temp <= 66) {
    red = 255;

    green = temp;
    green = 99.4708025861 * Math.log(green) - 161.1195681661;

    if (temp <= 19) {
      blue = 0;
    } else {
      blue = temp - 10;
      blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
    }
  } else {
    red = temp - 60;
    red = 329.698727446 * Math.pow(red, -0.1332047592);

    green = temp - 60;
    green = 288.1221695283 * Math.pow(green, -0.0755148492);

    blue = 255;
  }

  return {
    r: clamp(red, 0, 255),
    g: clamp(green, 0, 255),
    b: clamp(blue, 0, 255),
  };
};

const getBarycenter = (
  masses: ScenarioMassesType,
  position = new H3(),
  velocity = new H3(),
) => {
  const massesLen = masses.length;
  let systemMass = 0;

  position.set({ x: 0, y: 0, z: 0 });
  velocity.set({ x: 0, y: 0, z: 0 });

  const massPosition = new H3();
  const massVelocity = new H3();

  for (let i = 0; i < massesLen; i++) {
    const mass = masses[i];

    position.add(
      massPosition
        .set({ x: mass.position.x, y: mass.position.y, z: mass.position.z })
        .multiplyByScalar(mass.m),
    );

    velocity.add(
      massVelocity
        .set({ x: mass.velocity.x, y: mass.velocity.y, z: mass.velocity.z })
        .multiplyByScalar(mass.m),
    );

    systemMass += mass.m;
  }

  position.divideByScalar(systemMass);
  velocity.divideByScalar(systemMass);

  return {
    m: systemMass,
    x: position.x,
    y: position.y,
    z: position.z,
    vx: velocity.x,
    vy: velocity.y,
    vz: velocity.z,
  };
};

const getLagrangePoints = (
  p1: VectorType,
  m1: number,
  p2: VectorType,
  m2: number,
  normalInput?: VectorType,
): {
  L1: VectorType;
  L2: VectorType;
  L3: VectorType;
  L4: VectorType;
  L5: VectorType;
} => {
  const mu = m2 / (m1 + m2);
  const hillFactor = Math.cbrt(mu / 3);

  const axis = new H3().set(p2).subtract(p1);
  const distance = axis.getLength();
  const unitVector = new H3().set(axis).normalise();

  const L1 = new H3()
    .set(p1)
    .addScaledVector(distance * (1 - hillFactor), unitVector)
    .toObject();
  const L2 = new H3()
    .set(p1)
    .addScaledVector(distance * (1 + hillFactor), unitVector)
    .toObject();
  const L3 = new H3()
    .set(p1)
    .subtractScaledVector(distance * (1 + (5 * mu) / 12), unitVector)
    .toObject();

  const normal = new H3();
  if (normalInput) {
    normal.set(normalInput).normalise();
  } else {
    normal.set(
      Math.abs(unitVector.z) < 0.9
        ? { x: 0, y: 0, z: 1 }
        : { x: 0, y: 1, z: 0 },
    );
  }

  const perpendicular = new H3().set(normal).cross(unitVector).normalise();
  const triangleHeight = (Math.sqrt(3) / 2) * distance;
  const midpoint = new H3().set(p1).add(p2).multiplyByScalar(0.5);

  const L4 = new H3()
    .set(midpoint)
    .addScaledVector(triangleHeight, perpendicular)
    .toObject();
  const L5 = new H3()
    .set(midpoint)
    .subtractScaledVector(triangleHeight, perpendicular)
    .toObject();

  return { L1, L2, L3, L4, L5 };
};

const EARTH_MASS_SOLAR = 3.003e-6;

const ICE_GIANT_THRESHOLD = 10 * EARTH_MASS_SOLAR;
const GAS_GIANT_THRESHOLD = 60 * EARTH_MASS_SOLAR;
const LAVA_LIMIT_SOLAR = 0.48;
const INNER_HZ_SOLAR = 0.95;
const OUTER_HZ_SOLAR = 1.67;
const SUBSTANTIAL_ATMO_MASS = 0.5 * EARTH_MASS_SOLAR;
const THIN_ATMO_MASS = 0.07 * EARTH_MASS_SOLAR;
const SOLAR_RADIUS_DISPLAY = 10270;

const snowLineAU = (starMass: number): number => {
  return 2.7 * Math.pow(starMass, 1.75);
};

const MIN_CLOUD_MASS = 0.2 * EARTH_MASS_SOLAR;

const computeCloudDensity = (
  mass: ScenarioMassType,
  allMasses: ScenarioMassesType,
): number => {
  if (
    (mass.type !== "terrestial planet" && mass.type !== "moon") ||
    !mass.atmosphere ||
    mass.m < MIN_CLOUD_MASS
  ) {
    return 0;
  }

  const stars = allMasses.filter(
    (scenarioMass) => scenarioMass.type === "star",
  );

  if (stars.length === 0) {
    return 0;
  }

  let minDSq = Infinity;
  let nearestStar: ScenarioMassType | undefined;
  const h3 = new H3();
  const starsLength = stars.length;

  for (let i = 0; i < starsLength; i++) {
    const star = stars[i];
    const { dSquared } = h3
      .set(mass.position)
      .getDistanceParameters(star.position);

    if (dSquared < minDSq) {
      minDSq = dSquared;
      nearestStar = star;
    }
  }

  if (!nearestStar) {
    return 0;
  }

  const dist = Math.sqrt(minDSq);
  const snowLine = snowLineAU(nearestStar.m);

  if (dist >= snowLine) {
    return 0;
  }

  const massRatio = mass.m / EARTH_MASS_SOLAR;
  return Math.min(1.0, Math.max(0.1, Math.pow(massRatio, 0.7)));
};

const getNearestStarInfo = (
  mass: ScenarioMassType,
  allMasses: ScenarioMassesType,
): NearestStarInfoType => {
  const stars = allMasses.filter(
    (scenarioMass) => scenarioMass.type === "star",
  );

  if (!stars.length) {
    return { star: null, distAU: Infinity };
  }

  let minDist = Infinity;
  let nearest: ScenarioMassType | null = null;
  const starsLength = stars.length;

  for (let i = 0; i < starsLength; i++) {
    const star = stars[i];
    const deltaX = mass.position.x - star.position.x;
    const deltaY = mass.position.y - star.position.y;
    const deltaZ = mass.position.z - star.position.z;
    const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);

    if (dist < minDist) {
      minDist = dist;
      nearest = star;
    }
  }

  return { star: nearest, distAU: minDist };
};

const getEquilibriumTemp = (distAU: number, starMass: number): number => {
  if (distAU <= 0) {
    return 10000;
  }

  return 255 * starMass * Math.sqrt(1.0 / distAU);
};

const getSudarskiClass = (
  distAU: number,
  starMass: number,
): SudarskiClassType => {
  const temperature = getEquilibriumTemp(distAU, starMass);

  if (temperature < 150) {
    return 1;
  }

  if (temperature < 250) {
    return 2;
  }

  if (temperature < 800) {
    return 3;
  }

  if (temperature < 1400) {
    return 4;
  }

  return 5;
};

const classifyPlanet = (
  mass: ScenarioMassType,
  allMasses: ScenarioMassesType,
): PlanetCategory => {
  const planetMass = mass.m;

  if (planetMass >= GAS_GIANT_THRESHOLD) {
    return "gas-giant";
  }

  if (planetMass >= ICE_GIANT_THRESHOLD) {
    return "ice-giant";
  }

  const { star, distAU } = getNearestStarInfo(mass, allMasses);

  if (!star) {
    return "barren-light";
  }

  const radiusSolar =
    star.radius && star.radius > 0 ? star.radius / SOLAR_RADIUS_DISPLAY : 1.0;
  const temperatureStar =
    star.temperature && star.temperature > 0 ? star.temperature : 5778;
  const temperatureRatio = temperatureStar / 5778;
  const luminosity =
    radiusSolar *
    radiusSolar *
    temperatureRatio *
    temperatureRatio *
    temperatureRatio *
    temperatureRatio;

  const sqrtLuminosity = Math.sqrt(luminosity);
  const lavaLimit = LAVA_LIMIT_SOLAR * sqrtLuminosity;
  const innerHZ = INNER_HZ_SOLAR * sqrtLuminosity;
  const outerHZ = OUTER_HZ_SOLAR * sqrtLuminosity;
  const snowLine = snowLineAU(star.m);

  const isMDwarf = temperatureStar < 3700;

  if (distAU < lavaLimit) {
    return "lava";
  }

  if (distAU >= snowLine) {
    return "ice-world";
  }

  if (
    !isMDwarf &&
    distAU >= innerHZ &&
    distAU <= outerHZ &&
    planetMass >= SUBSTANTIAL_ATMO_MASS
  ) {
    return "habitable";
  }

  if (planetMass < THIN_ATMO_MASS) {
    return "barren-light";
  }

  if (planetMass >= SUBSTANTIAL_ATMO_MASS) {
    return "barren-heavy";
  }

  return "desert";
};

export {
  degreesToRadians,
  getRandomNumberInRange,
  getRandomRadian,
  getVelocityMagnitude,
  getFocusOfEllipse,
  getSemiMinorAxis,
  getEllipse,
  getConicSection,
  radiansToDegrees,
  clamp,
  temperatureToRGB,
  getBarycenter,
  getLagrangePoints,
  snowLineAU,
  computeCloudDensity,
  EARTH_MASS_SOLAR,
  getNearestStarInfo,
  getEquilibriumTemp,
  getSudarskiClass,
  classifyPlanet,
};
