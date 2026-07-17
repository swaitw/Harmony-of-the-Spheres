import { ScenarioMassesType, ScenarioMassType } from "../../types/scenario";
import H3 from "../utils/vector";

const collisionsCheck = (
  masses: ScenarioMassesType,
  scale: number,
  callback: (looser: ScenarioMassType, survivor: ScenarioMassType) => void,
) => {
  const vector = new H3();
  let massesLength = masses.length;

  for (let i = 0; i < massesLength; i++) {
    const massI = masses[i];

    for (let j = 0; j < massesLength; j++) {
      if (i !== j) {
        const massJ = masses[j];

        vector.set(massI.position);

        const distance = vector.getDistanceParameters(massJ.position).d;

        const distanceScaled = distance * scale;

        if (distanceScaled < massI.radius + massJ.radius) {
          let survivor;
          let looser;
          let looserIndex;

          if (massI.m > massJ.m || massI.m === massJ.m) {
            survivor = massI;
            looser = massJ;
            looserIndex = j;
          } else {
            survivor = massJ;
            looser = massI;
            looserIndex = i;
          }

          survivor.m = massI.m + massJ.m;

          masses.splice(looserIndex, 1);

          callback(looser, survivor);

          massesLength--;

          looserIndex--;
        }
      }
    }
  }
};

export default collisionsCheck;
