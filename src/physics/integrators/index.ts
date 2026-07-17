import Euler from "./euler";
import RK4 from "./rk4";
import Verlet from "./verlet";
import PEFRL from "./pefrl";
import Nystrom3 from "./nystrom3";
import Nystrom4 from "./nystrom4";
import Nystrom5 from "./nystrom5";
import Nystrom6 from "./nystrom6";
import RKN64 from "./rkn64";
import RKN12 from "./rkn12";
import Yoshida6 from "./yoshida6";
import KahanLi8 from "./kahan-li8";
import Sofspa10 from "./sofspa10";
import OrbitalElementsIntegrator from "./orbital-elements-integrator";
import { IntegratorConfigType } from "../../types/physics";
import { ScenarioIntegratorType, ScenarioType } from "../../types/scenario";

const integrators = [
  "RK4",
  "Euler",
  "Verlet",
  "PEFRL",
  "Nystrom3",
  "Nystrom4",
  "Nystrom5",
  "Nystrom6",
  "RKN64",
  "RKN12",
  "Yoshida6",
  "KahanLi8",
  "Sofspa10",
  "Orbital Elements",
] as const;

const adaptiveIntegrators = ["RKN64", "RKN12"] as const;

const getIntegratorConfigFromScenario = (
  scenario: ScenarioType,
): IntegratorConfigType => ({
  g: scenario.integrator.g,
  dt: scenario.integrator.dt,
  tol: scenario.integrator.tol,
  minDt: scenario.integrator.minDt,
  maxDt: scenario.integrator.maxDt,
  masses: scenario.masses,
  elapsedTime: scenario.elapsedTime,
  softening: scenario.integrator.softeningConstant,
  useBarnesHut: scenario.integrator.useBarnesHut,
  theta: scenario.integrator.theta,
});

const getIntegrator = (integrator: string, config: IntegratorConfigType) => {
  switch (integrator) {
    case "Euler":
      return new Euler(config);

    case "RK4":
      return new RK4(config);

    case "Verlet":
      return new Verlet(config);

    case "PEFRL":
      return new PEFRL(config);

    case "Nystrom3":
      return new Nystrom3(config);

    case "Nystrom4":
      return new Nystrom4(config);

    case "Nystrom5":
      return new Nystrom5(config);

    case "Nystrom6":
      return new Nystrom6(config);

    case "RKN64":
      return new RKN64(config);

    case "RKN12":
      return new RKN12(config);

    case "Yoshida6":
      return new Yoshida6(config);

    case "KahanLi8":
      return new KahanLi8(config);

    case "Sofspa10":
      return new Sofspa10(config);

    case "Orbital Elements":
      return new OrbitalElementsIntegrator(config);

    default:
      return new RK4(config);
  }
};

export default getIntegrator;

type IntegratorName = (typeof integrators)[number];

const defaultIntegratorSettings: Pick<
  ScenarioIntegratorType,
  "tol" | "maxDt" | "minDt"
> = {
  tol: 0.0001,
  maxDt: 0.001,
  minDt: 0.000001,
};

export {
  integrators,
  adaptiveIntegrators,
  getIntegratorConfigFromScenario,
  defaultIntegratorSettings,
};

export type { IntegratorName };
