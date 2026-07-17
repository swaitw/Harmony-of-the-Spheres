import Euler from "./euler";
import Vector from "../utils/vector";
import { IntegratorConfigType, VectorType } from "../../types/physics";

class Verlet extends Euler {
  utilityVector: Vector;
  lastAcc: VectorType[];

  constructor(params: IntegratorConfigType) {
    super(params);

    this.utilityVector = new Vector();

    this.lastAcc = this.generateAccelerationVectors(
      this.getStateVectors(this.masses).positionVectors,
    );
  }

  generateVerletPositionVectors(
    stateVectors: {
      positionVectors: VectorType[];
      velocityVectors: VectorType[];
    },
    accelerationVectors: VectorType[],
    dt: number,
  ): VectorType[] {
    const positionVectors = [];
    const aLen = accelerationVectors.length;

    for (let i = 0; i < aLen; i++) {
      const aI = accelerationVectors[i];
      const vI = stateVectors.velocityVectors[i];
      const mass = this.masses[i];

      positionVectors[i] = this.positionVector
        .set(mass.position)
        .addScaledVector(dt, vI)
        .addScaledVector(
          0.5,
          this.utilityVector.set(aI).multiplyByScalar(Math.pow(dt, 2)),
        )
        .toObject();
    }

    return positionVectors;
  }

  generateVerletVelocityVectors(
    accelerationVectors1: VectorType[],
    accelerationVectors2: VectorType[],
    dt: number,
  ): VectorType[] {
    const velocityVectors = [];
    const aLen = accelerationVectors1.length;

    for (let i = 0; i < aLen; i++) {
      const aI1 = accelerationVectors1[i];
      const aI2 = accelerationVectors2[i];
      const mass = this.masses[i];

      velocityVectors[i] = this.velocityVector
        .set(mass.velocity)
        .addScaledVector(
          0.5,
          this.utilityVector.set(aI1).add(aI2).multiplyByScalar(dt),
        )
        .toObject();
    }

    return velocityVectors;
  }

  override iterate(): void {
    const stateVectors = this.getStateVectors(this.masses);

    const accelerationVectors1 = this.lastAcc;
    const positionVectors = this.generateVerletPositionVectors(
      stateVectors,
      accelerationVectors1,
      this.dt,
    );
    const accelerationVectors2 =
      this.generateAccelerationVectors(positionVectors);
    const velocityVectors = this.generateVerletVelocityVectors(
      accelerationVectors1,
      accelerationVectors2,
      this.dt,
    );

    this.lastAcc = accelerationVectors2;
    this.updateStateVectors(positionVectors, velocityVectors);

    this.incrementElapsedTime();
  }
}

export default Verlet;
