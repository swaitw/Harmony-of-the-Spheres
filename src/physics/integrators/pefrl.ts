import Euler from "./euler";
import { IntegratorConfigType, VectorType } from "../../types/physics";

class PEFRL extends Euler {
  private epsilon: number;
  private lambda: number;
  private chi: number;

  constructor(params: IntegratorConfigType) {
    super(params);

    this.epsilon = 0.1786178958448091;
    this.lambda = -0.2123418310626054;
    this.chi = -0.6626458266981849e-1;
  }

  generatePositionVectorsWithState(
    velocityVectors: VectorType[],
    dt: number,
    positionVectors: VectorType[],
  ): VectorType[] {
    const positionVectorsFinal = [];
    const vLen = velocityVectors.length;

    for (let i = 0; i < vLen; i++) {
      const vI = velocityVectors[i];
      const pI = positionVectors[i];

      positionVectorsFinal[i] = this.positionVector
        .set(pI)
        .addScaledVector(dt, vI)
        .toObject();
    }

    return positionVectorsFinal;
  }

  generateVelocityVectorsWithState(
    accelerationVectors: VectorType[],
    dt: number,
    velocityVectors: VectorType[],
  ): VectorType[] {
    const velocityVectorsFinal = [];
    const vLen = velocityVectors.length;

    for (let i = 0; i < vLen; i++) {
      const vI = velocityVectors[i];
      const aI = accelerationVectors[i];

      velocityVectorsFinal[i] = this.velocityVector
        .set(vI)
        .addScaledVector(dt, aI)
        .toObject();
    }

    return velocityVectorsFinal;
  }

  override iterate(): void {
    const a1 = this.epsilon * this.dt;
    const a2 = ((1 - 2 * this.lambda) * this.dt) / 2;
    const a3 = this.chi * this.dt;
    const a4 = this.lambda * this.dt;
    const a5 = (1 - 2 * (this.chi + this.epsilon)) * this.dt;

    const stateVectors = this.getStateVectors(this.masses);

    const pCoeffs = [a1, a3, a5, a3, a1];
    const vCoeffs = [a2, a4, a4, a2];

    let positionVectors = stateVectors.positionVectors;
    let velocityVectors = stateVectors.velocityVectors;

    const coeffsLen = vCoeffs.length;

    for (let i = 0; i < coeffsLen; i++) {
      positionVectors = this.generatePositionVectorsWithState(
        velocityVectors,
        pCoeffs[i],
        positionVectors,
      );
      velocityVectors = this.generateVelocityVectorsWithState(
        this.generateAccelerationVectors(positionVectors),
        vCoeffs[i],
        velocityVectors,
      );
    }

    positionVectors = this.generatePositionVectorsWithState(
      velocityVectors,
      pCoeffs[coeffsLen],
      positionVectors,
    );

    this.updateStateVectors(positionVectors, velocityVectors);

    this.incrementElapsedTime();
  }
}

export default PEFRL;
