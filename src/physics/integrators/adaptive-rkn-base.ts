import RknBase from "./rkn-base";
import Vector from "../utils/vector";
import { IntegratorConfigType, VectorType } from "../../types/physics";

class AdaptiveRknBase extends RknBase {
  errorOrder!: number;
  alphaHat: number[] = [];

  tempSumHat: Vector;
  pHat: Vector;

  constructor(params: IntegratorConfigType) {
    super(params);

    this.tempSumHat = new Vector();
    this.pHat = new Vector();
  }

  calculateError(p1: VectorType[], p2: VectorType[]) {
    let error = 0;
    const pLen = p1.length;

    for (let i = 0; i < pLen; i++) {
      error += Math.sqrt(
        Math.pow(p1[i].x - p2[i].x, 2) +
          Math.pow(p1[i].y - p2[i].y, 2) +
          Math.pow(p1[i].z - p2[i].z, 2),
      );
    }

    return error;
  }

  generateAdaptiveVectors(
    stateVectors: {
      positionVectors: VectorType[];
      velocityVectors: VectorType[];
    },
    k: VectorType[][],
  ): [VectorType[], VectorType[], VectorType[]] {
    const positionVectors = [];
    const positionVectorsHat = [];
    const velocityVectors = [];
    const cLen = this.alpha.length;
    const mLen = this.masses.length;

    for (let n = 0; n < mLen; n++) {
      this.tempSumA.set({ x: 0, y: 0, z: 0 });
      this.tempSumB.set({ x: 0, y: 0, z: 0 });
      this.tempSumHat.set({ x: 0, y: 0, z: 0 });

      for (let j = 0; j < cLen; j++) {
        this.tempSumA.addScaledVector(this.alpha[j], k[j][n]);
        this.tempSumHat.addScaledVector(this.alphaHat[j], k[j][n]);
        this.tempSumB.addScaledVector(this.beta[j], k[j][n]);
      }

      positionVectors[n] = this.positionVector
        .set(stateVectors.positionVectors[n])
        .addScaledVector(this.dt, stateVectors.velocityVectors[n])
        .addScaledVector(this.dt * this.dt, this.tempSumA)
        .toObject();

      positionVectorsHat[n] = this.pHat
        .set(stateVectors.positionVectors[n])
        .addScaledVector(this.dt, stateVectors.velocityVectors[n])
        .addScaledVector(this.dt * this.dt, this.tempSumHat)
        .toObject();

      velocityVectors[n] = this.velocityVector
        .set(stateVectors.velocityVectors[n])
        .addScaledVector(this.dt, this.tempSumB)
        .toObject();
    }

    return [positionVectors, velocityVectors, positionVectorsHat];
  }

  override iterate() {
    const stateVectors = this.getStateVectors(this.masses);
    const tolerance = this.tol ?? 1e-4;
    const minDt = this.minDt ?? 1e-12;
    const maxDt = this.maxDt ?? 0.01;

    let error = 1e10;
    let positionVectors: VectorType[] = [];
    let velocityVectors: VectorType[] = [];
    let iterations = 0;
    const maxIterations = 1000;

    while (error > tolerance && iterations < maxIterations) {
      iterations += 1;

      const k = this.getK(stateVectors);

      const [p, v, pHat] = this.generateAdaptiveVectors(stateVectors, k);

      positionVectors = p;
      velocityVectors = v;
      error = this.calculateError(p, pHat);

      const temp = Math.pow((2 * error) / tolerance, 1 / this.errorOrder);

      if (temp > 0.2) {
        this.dt = this.dt / temp;
      } else {
        this.dt = 5 * this.dt;
      }

      if (this.dt < minDt) {
        this.dt = minDt;
      } else if (this.dt > maxDt) {
        this.dt = maxDt;
      }

      if (this.dt <= minDt && error > tolerance) {
        break;
      }
    }

    const acceptedError = error;
    const temp = Math.pow((2 * acceptedError) / tolerance, 1 / this.errorOrder);

    if (temp <= 0.2) {
      this.dt = Math.min(maxDt, this.dt * 5);
    } else if (temp > 1) {
      this.dt = Math.max(minDt, (this.dt / temp) * 0.9);
    }

    if (this.dt < minDt) {
      this.dt = minDt;
    } else if (this.dt > maxDt) {
      this.dt = maxDt;
    }

    this.updateStateVectors(positionVectors, velocityVectors);
    this.incrementElapsedTime();
  }
}

export default AdaptiveRknBase;
