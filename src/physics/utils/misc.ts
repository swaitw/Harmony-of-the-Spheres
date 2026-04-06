import { ScenarioMassType, ScenarioMassesType } from "../../types/scenario";
import H3 from "../../physics/utils/vector";
import { VectorType } from "../../types/physics";

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

export {
  degreesToRadians,
  getRandomNumberInRange,
  getRandomRadian,
  getVelocityMagnitude,
  getFocusOfEllipse,
  getSemiMinorAxis,
  getEllipse,
  radiansToDegrees,
  clamp,
  temperatureToRGB,
  getBarycenter,
  getLagrangePoints,
};
