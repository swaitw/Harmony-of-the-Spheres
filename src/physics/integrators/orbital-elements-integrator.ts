import Euler from "./euler";
import {
  constructSOITree,
  propagateOrbitalElements,
  keplerToState,
  stateToKepler,
} from "../utils/elements";
import { ScenarioMassType, SOITree } from "../../types/scenario";
import { VectorType } from "../../types/physics";

const getObjFromArrByKeyValuePair = (
  arr: ScenarioMassType[],
  key: keyof ScenarioMassType,
  val: string,
): ScenarioMassType => {
  const obj = arr.find((entry) => entry[key] === val);

  return obj ?? arr[0];
};

class OrbitalElementsIntegrator extends Euler {
  recursiveMove(
    tree: SOITree,
    parent: ScenarioMassType,
    newParentPos: VectorType,
    newParentVel: VectorType,
  ): void {
    const nChildren = tree.children.length;
    const gm = this.g * parent.m;
    const body = getObjFromArrByKeyValuePair(this.masses, "name", tree.name);
    const relPos = {
      x: body.position.x - parent.position.x,
      y: body.position.y - parent.position.y,
      z: body.position.z - parent.position.z,
    };
    const relVel = {
      x: body.velocity.x - parent.velocity.x,
      y: body.velocity.y - parent.velocity.y,
      z: body.velocity.z - parent.velocity.z,
    };

    const orbElem1 = stateToKepler(relPos, relVel, gm);
    const orbElem2 = propagateOrbitalElements(orbElem1, this.dt, gm);
    const newStateVectors = keplerToState(orbElem2, gm);
    const newRelPos = newStateVectors.posRel;
    const newRelVel = newStateVectors.velRel;
    const newPos = {
      x: newParentPos.x + newRelPos.x,
      y: newParentPos.y + newRelPos.y,
      z: newParentPos.z + newRelPos.z,
    };
    const newVel = {
      x: newParentVel.x + newRelVel.x,
      y: newParentVel.y + newRelVel.y,
      z: newParentVel.z + newRelVel.z,
    };

    if (nChildren === 0) {
      body.position = newPos;
      body.velocity = newVel;
      return;
    }

    for (let i = 0; i < nChildren; i++) {
      this.recursiveMove(tree.children[i], body, newPos, newVel);
    }

    body.position = newPos;
    body.velocity = newVel;
  }

  override iterate(): void {
    const tree = constructSOITree(this.masses);
    const sun = getObjFromArrByKeyValuePair(this.masses, "name", tree.name);
    const sunPos = { ...sun.position };
    const sunVel = { ...sun.velocity };
    const nChildren = tree.children.length;

    for (let i = 0; i < nChildren; i++) {
      this.recursiveMove(tree.children[i], sun, sunPos, sunVel);
    }

    this.incrementElapsedTime();
  }
}

export default OrbitalElementsIntegrator;
