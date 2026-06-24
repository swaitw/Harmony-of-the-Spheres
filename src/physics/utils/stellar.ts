import { MainSequenceStarProperties } from "../../types/stellar";

const SOLAR_MASS = 1;
const SOLAR_RADIUS_DISPLAY = 10270;
const SOLAR_EFFECTIVE_TEMPERATURE = 5778;

const getMainSequenceLuminositySolar = (massSolar: number): number => {
  const mass = Math.max(massSolar, 0.01);

  if (mass < 0.43) {
    return 0.23 * Math.pow(mass, 2.3);
  }

  if (mass < 2) {
    return Math.pow(mass, 4);
  }

  if (mass < 55) {
    return 1.4 * Math.pow(mass, 3.5);
  }

  return 32000 * mass;
};

const getMainSequenceRadiusSolar = (massSolar: number): number => {
  const mass = Math.max(massSolar, 0.01);

  if (mass < 0.43) {
    return Math.pow(mass, 0.8);
  }

  if (mass < 2) {
    return Math.pow(mass, 0.8);
  }

  if (mass < 55) {
    return Math.pow(mass, 0.57);
  }

  return Math.pow(mass, 0.5);
};

const getMainSequenceEffectiveTemperature = (massSolar: number): number => {
  const luminositySolar = getMainSequenceLuminositySolar(massSolar);
  const radiusSolar = getMainSequenceRadiusSolar(massSolar);

  return (
    SOLAR_EFFECTIVE_TEMPERATURE *
    Math.pow(luminositySolar / (radiusSolar * radiusSolar), 0.25)
  );
};

const getMainSequenceStarProperties = (
  massSolar: number,
): MainSequenceStarProperties => {
  const radiusSolar = getMainSequenceRadiusSolar(massSolar);
  const luminositySolar = getMainSequenceLuminositySolar(massSolar);
  const temperatureKelvin = getMainSequenceEffectiveTemperature(massSolar);

  return {
    luminositySolar,
    radiusSolar,
    temperatureKelvin,
    radiusDisplay: radiusSolar * SOLAR_RADIUS_DISPLAY,
  };
};

export {
  SOLAR_MASS,
  SOLAR_RADIUS_DISPLAY,
  SOLAR_EFFECTIVE_TEMPERATURE,
  getMainSequenceLuminositySolar,
  getMainSequenceRadiusSolar,
  getMainSequenceEffectiveTemperature,
  getMainSequenceStarProperties,
};
