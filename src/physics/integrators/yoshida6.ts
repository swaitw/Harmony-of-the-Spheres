import Euler from "./euler";
import { VectorType } from "../../types/physics";

class Yoshida6 extends Euler {
  generatePositionVectorsWithState(
    velocityVectors: VectorType[],
    dt: number,
    positionVectors: VectorType[],
  ): VectorType[] {
    const positionVectorsFinal = [];
    const vLen = velocityVectors.length;

    for (let i = 0; i < vLen; i++) {
      positionVectorsFinal[i] = this.positionVector
        .set(positionVectors[i])
        .addScaledVector(dt, velocityVectors[i])
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
      velocityVectorsFinal[i] = this.velocityVector
        .set(velocityVectors[i])
        .addScaledVector(dt, accelerationVectors[i])
        .toObject();
    }

    return velocityVectorsFinal;
  }

  override iterate(): void {
    const stateVectors = this.getStateVectors(this.masses);

    const pCoeffs = [
      0.74409614601461, -0.425227929490565, 0.2762016693478,
      -0.0029155067911599275, -1.4465510537023341, 1.4478689195210459,
      1.4451324786403945, -1.5386047235397915, -1.5386047235397915,
      1.4451324786403945, 1.4478689195210459, -1.4465510537023341,
      -0.0029155067911599275, 0.2762016693478, -0.425227929490565,
      0.74409614601461,
    ];
    const vCoeffs = [
      1.48819229202922, -2.33864815101035, 2.89105148970595, -2.89688250328827,
      0.00378039588360192, 2.89195744315849, -0.00169248587770116,
      -3.075516961201882, -0.00169248587770116, 2.89195744315849,
      0.00378039588360192, -2.89688250328827, 2.89105148970595,
      -2.33864815101035, 1.48819229202922,
    ];

    let positionVectors = stateVectors.positionVectors;
    let velocityVectors = stateVectors.velocityVectors;

    const coeffsLen = vCoeffs.length;

    for (let i = 0; i < coeffsLen; i++) {
      positionVectors = this.generatePositionVectorsWithState(
        velocityVectors,
        this.dt * pCoeffs[i],
        positionVectors,
      );
      velocityVectors = this.generateVelocityVectorsWithState(
        this.generateAccelerationVectors(positionVectors),
        this.dt * vCoeffs[i],
        velocityVectors,
      );
    }

    positionVectors = this.generatePositionVectorsWithState(
      velocityVectors,
      this.dt * pCoeffs[coeffsLen],
      positionVectors,
    );

    this.updateStateVectors(positionVectors, velocityVectors);

    this.incrementElapsedTime();
  }
}

export default Yoshida6;
