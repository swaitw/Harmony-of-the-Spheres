import { ScenarioMassType } from "../../types/scenario";

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
};
