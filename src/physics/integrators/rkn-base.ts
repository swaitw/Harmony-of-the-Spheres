import Euler from "./euler";
import Vector from "../utils/vector";
import { IntegratorConfigType, VectorType } from "../../types/physics";

class RknBase extends Euler {
  coefficients: number[][] = [];
  delta: number[] = [];
  alpha: number[] = [];
  beta: number[] = [];

  tempSumA: Vector;
  tempSumB: Vector;

  constructor(params: IntegratorConfigType) {
    super(params);

    this.tempSumA = new Vector();
    this.tempSumB = new Vector();
  }

  getK(stateVectors: {
    positionVectors: VectorType[];
    velocityVectors: VectorType[];
  }): VectorType[][] {
    const positionVectors = stateVectors.positionVectors;
    const velocityVectors = stateVectors.velocityVectors;

    const k: VectorType[][] = [];
    k[0] = this.generateAccelerationVectors(positionVectors);

    const coeffsLen = this.coefficients.length;
    const mLen = this.masses.length;

    for (let i = 0; i < coeffsLen; i++) {
      const tempPos = [];
      const cLen = this.coefficients[i].length;

      for (let n = 0; n < mLen; n++) {
        this.tempSumA.set({ x: 0, y: 0, z: 0 });

        for (let j = 0; j < cLen; j++) {
          this.tempSumA.addScaledVector(this.coefficients[i][j], k[j][n]);
        }

        tempPos[n] = this.positionVector
          .set(positionVectors[n])
          .addScaledVector(this.delta[i] * this.dt, velocityVectors[n])
          .addScaledVector(this.dt * this.dt, this.tempSumA)
          .toObject();
      }

      k[cLen] = this.generateAccelerationVectors(tempPos);
    }

    return k;
  }

  generateVectors(
    stateVectors: {
      positionVectors: VectorType[];
      velocityVectors: VectorType[];
    },
    k: VectorType[][],
  ): [VectorType[], VectorType[]] {
    const positionVectors = [];
    const velocityVectors = [];
    const cLen = this.alpha.length;
    const mLen = this.masses.length;

    for (let n = 0; n < mLen; n++) {
      this.tempSumA.set({ x: 0, y: 0, z: 0 });
      this.tempSumB.set({ x: 0, y: 0, z: 0 });

      for (let j = 0; j < cLen; j++) {
        this.tempSumA.addScaledVector(this.alpha[j], k[j][n]);
        this.tempSumB.addScaledVector(this.beta[j], k[j][n]);
      }

      positionVectors[n] = this.positionVector
        .set(stateVectors.positionVectors[n])
        .addScaledVector(this.dt, stateVectors.velocityVectors[n])
        .addScaledVector(this.dt * this.dt, this.tempSumA)
        .toObject();

      velocityVectors[n] = this.velocityVector
        .set(stateVectors.velocityVectors[n])
        .addScaledVector(this.dt, this.tempSumB)
        .toObject();
    }

    return [positionVectors, velocityVectors];
  }

  override iterate(): void {
    const stateVectors = this.getStateVectors(this.masses);

    const k = this.getK(stateVectors);

    const [positionVectors, velocityVectors] = this.generateVectors(
      stateVectors,
      k,
    );

    this.updateStateVectors(positionVectors, velocityVectors);
    this.incrementElapsedTime();
  }
}

export default RknBase;
