import Euler from "./euler";
import { VectorType } from "../../types/physics";

class KahanLi8 extends Euler {
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
      0.3708351821753065, 0.16628476927529068, -0.1091730577518966,
      -0.19155388040992194, -0.13739914490621316, 0.31684454977447707,
      0.3249590053210324, -0.24079742347807487, -0.24079742347807487,
      0.3249590053210324, 0.31684454977447707, -0.13739914490621316,
      -0.19155388040992194, -0.1091730577518966, 0.16628476927529068,
      0.3708351821753065,
    ];
    const vCoeffs = [
      0.741670364350613, -0.4091008258000316, 0.1907547102962384,
      -0.5738624711160822, 0.2990641813036559, 0.33462491824529816,
      0.3152930923967666, -0.7968879393529164, 0.3152930923967666,
      0.33462491824529816, 0.2990641813036559, -0.5738624711160822,
      0.1907547102962384, -0.4091008258000316, 0.741670364350613,
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

export default KahanLi8;
