import Euler from "./euler";
import { VectorType } from "../../types/physics";

class Sofspa10 extends Euler {
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

    const vCoeffs = [
      0.07879572252168641926390768, 0.31309610341510852776481247,
      0.02791838323507806610952027, -0.2295928415939070941512134,
      0.13096206107716486317465686, -0.26973340565451071434460973,
      0.07497334315589143566613711, 0.11199342399981020488957508,
      0.36613344954622675119314812, -0.39910563013603589787862981,
      0.10308739852747107731580277, 0.41143087395589023782070412,
      -0.00486636058313526176219566, -0.39203335370863990644808194,
      0.0519425029624496470371829, 0.05066509075992449633587434,
      0.0496743706397298790545688, 0.04931773575959453791768001,
      0.0496743706397298790545688, 0.05066509075992449633587434,
      0.0519425029624496470371829, -0.39203335370863990644808194,
      -0.00486636058313526176219566, 0.41143087395589023782070412,
      0.10308739852747107731580277, -0.39910563013603589787862981,
      0.36613344954622675119314812, 0.11199342399981020488957508,
      0.07497334315589143566613711, -0.26973340565451071434460973,
      0.13096206107716486317465686, -0.2295928415939070941512134,
      0.02791838323507806610952027, 0.31309610341510852776481247,
      0.07879572252168641926390768,
    ];

    const pCoeffs = [
      vCoeffs[0] / 2,
      (vCoeffs[0] + vCoeffs[1]) / 2,
      (vCoeffs[1] + vCoeffs[2]) / 2,
      (vCoeffs[2] + vCoeffs[3]) / 2,
      (vCoeffs[3] + vCoeffs[4]) / 2,
      (vCoeffs[4] + vCoeffs[5]) / 2,
      (vCoeffs[5] + vCoeffs[6]) / 2,
      (vCoeffs[6] + vCoeffs[7]) / 2,
      (vCoeffs[7] + vCoeffs[8]) / 2,
      (vCoeffs[8] + vCoeffs[9]) / 2,
      (vCoeffs[9] + vCoeffs[10]) / 2,
      (vCoeffs[10] + vCoeffs[11]) / 2,
      (vCoeffs[11] + vCoeffs[12]) / 2,
      (vCoeffs[12] + vCoeffs[13]) / 2,
      (vCoeffs[13] + vCoeffs[14]) / 2,
      (vCoeffs[14] + vCoeffs[15]) / 2,
      (vCoeffs[15] + vCoeffs[16]) / 2,
      (vCoeffs[16] + vCoeffs[17]) / 2,
      (vCoeffs[16] + vCoeffs[17]) / 2,
      (vCoeffs[15] + vCoeffs[16]) / 2,
      (vCoeffs[14] + vCoeffs[15]) / 2,
      (vCoeffs[13] + vCoeffs[14]) / 2,
      (vCoeffs[12] + vCoeffs[13]) / 2,
      (vCoeffs[11] + vCoeffs[12]) / 2,
      (vCoeffs[10] + vCoeffs[11]) / 2,
      (vCoeffs[9] + vCoeffs[10]) / 2,
      (vCoeffs[8] + vCoeffs[9]) / 2,
      (vCoeffs[7] + vCoeffs[8]) / 2,
      (vCoeffs[6] + vCoeffs[7]) / 2,
      (vCoeffs[5] + vCoeffs[6]) / 2,
      (vCoeffs[4] + vCoeffs[5]) / 2,
      (vCoeffs[3] + vCoeffs[4]) / 2,
      (vCoeffs[2] + vCoeffs[3]) / 2,
      (vCoeffs[1] + vCoeffs[2]) / 2,
      (vCoeffs[0] + vCoeffs[1]) / 2,
      vCoeffs[0] / 2,
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

export default Sofspa10;
