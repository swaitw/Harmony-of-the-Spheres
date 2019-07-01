import rknBase from './rknBase';
import { IntegratorType } from '../types';

export default class extends rknBase {
  constructor({ g, dt, masses, elapsedTime }: IntegratorType) {
    super({ g, dt, masses, elapsedTime });

    this.coefficients = [
      [0.5675576359e-2],
      [0.0756743515e-1, 0.1513487029e-1],
      [0.1400361674, -0.254478057, 0.2900721177],
      [-1.0216436141, 2.6539701073, -1.486159095, 0.2733606017],
      [
        -20.4083294915,
        50.3143181086,
        -32.3044178724,
        2.9494960939,
        -0.0786748385
      ]
    ];
    this.delta = [0.1065417886, 0.2130835772, 0.5926723008, 0.916, 0.972];
    this.alpha = [
      0.0627170177,
      0,
      0.2596874616,
      0.1587555586,
      0.0191237845,
      -0.0002838224
    ];
    this.beta = [
      0.0627170177,
      0,
      0.3300064074,
      0.3897489881,
      0.2276641014,
      -0.0101365146
    ];
  }
}
