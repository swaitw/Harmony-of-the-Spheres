import RknBase from "./rkn-base";
import { IntegratorConfigType } from "../../types/physics";

class Nystrom5 extends RknBase {
  constructor(params: IntegratorConfigType) {
    super(params);

    this.coefficients = [
      [1 / 8],
      [1 / 18, 0],
      [1 / 9, 0, 1 / 9],
      [0, -8 / 11, 9 / 11, 9 / 22],
    ];
    this.delta = [1 / 2, 1 / 3, 2 / 3, 1];
    this.alpha = [11 / 120, -4 / 15, 9 / 20, 9 / 40, 0];
    this.beta = [11 / 120, -8 / 15, 27 / 40, 27 / 40, 11 / 120];
  }
}

export default Nystrom5;
