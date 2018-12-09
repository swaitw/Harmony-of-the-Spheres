import jovianSystem from './jovianSystem';
import solarSystem from './solarSystem';
import threeBodyCoreography from './threeBodyCoreography';
import earthMoonSystem from './earthMoonSystem';
import oumuamua from './oumuamua';
import tess from './tess';
import martianSystem from './martianSystem';
import newHorizons from './newHorizons';
import cruithne from './cruithne';
import planetNine from './planetNine';
import rh120 from './rh120';
import ulysses from './ulysses';
import venusPentagram from './venusPentagram';
import lunarFreeReturn from './lunarFreeReturn';
import masses from '../masses';
import { getRandomColor } from '../../utils';

const processScenario = scenario => ({
  ...scenario,
  playing: false,
  integrator: 'RK4',
  elapsedTime: 0,
  trails: true,
  labels: true,
  scale: 2100000,
  masses: scenario.masses.map(mass => {
    const template = masses.filter(
      entry => entry.name.indexOf(mass.name) > -1
    )[0];

    return {
      ...mass,
      m:
        template === undefined
          ? mass.m === undefined ? 0 : mass.m
          : template.m,
      radius:
        template === undefined
          ? mass.radius === undefined ? 1.2 : mass.radius
          : template.radius,
      tilt: template === undefined ? false : template.tilt,
      atmosphere: template === undefined ? false : template.atmosphere,
      clouds: template === undefined ? false : template.clouds,
      type:
        (template === undefined && mass.type === 'asteroid') ||
        (template === undefined && mass.type === 'star')
          ? mass.type
          : template.type,
      texture: template === undefined ? null : template.name,
      bump: template === undefined ? null : template.bump,
      color:
        template === undefined
          ? mass.color === undefined ? getRandomColor() : mass.color
          : template.color
    };
  })
});

export const scenarios = [
  jovianSystem,
  solarSystem,
  threeBodyCoreography,
  lunarFreeReturn,
  venusPentagram,
  oumuamua,
  earthMoonSystem,
  tess,
  martianSystem,
  newHorizons,
  cruithne,
  planetNine,
  rh120,
  ulysses
];

export default function(scenario) {
  const selectedScenario = scenarios.filter(
    entry => entry.name.indexOf(scenario) > -1
  );

  return processScenario(JSON.parse(JSON.stringify(selectedScenario[0])));
}
