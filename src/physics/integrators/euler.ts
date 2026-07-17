import Vector from "../utils/vector";
import { ScenarioMassesType, ScenarioType } from "../../types/scenario";
import {
  BarnesHutTreeNodeType,
  IntegratorConfigType,
  VectorType,
} from "../../types/physics";

class Euler {
  g: number;
  dt: number;
  tol: number;
  maxDt: number;
  minDt: number;
  masses: ScenarioMassesType;
  elapsedTime: number;
  softening: number;
  softeningSquared: number;
  useBarnesHut: boolean;
  theta: number;
  maximumDistance: number;

  accelerationVector: Vector;
  velocityVector: Vector;
  positionVector: Vector;

  constructor(params: IntegratorConfigType) {
    this.g = params.g;
    this.dt = params.dt;
    this.tol = params.tol ?? 1e-4;
    this.maxDt = params.maxDt ?? 0.001;
    this.minDt = params.minDt ?? 1e-6;
    this.masses = params.masses;
    this.softening = params.softening ?? 0;
    this.softeningSquared = this.softening * this.softening;
    this.useBarnesHut = params.useBarnesHut ?? true;
    this.theta = params.theta ?? 0.5;
    this.maximumDistance = 1000;
    this.elapsedTime = params.elapsedTime;

    this.accelerationVector = new Vector();
    this.velocityVector = new Vector();
    this.positionVector = new Vector();
  }

  getDistanceParams(positionVector1: VectorType, positionVector2: VectorType) {
    const dx = positionVector2.x - positionVector1.x;
    const dy = positionVector2.y - positionVector1.y;
    const dz = positionVector2.z - positionVector1.z;

    return { dx, dy, dz, dSquared: dx * dx + dy * dy + dz * dz };
  }

  getStateVectors(masses: ScenarioMassesType) {
    const positionVectors = [];
    const velocityVectors = [];

    const massesLength = masses.length;

    for (let i = 0; i < massesLength; i++) {
      const massI = masses[i];

      positionVectors[i] = massI.position;
      velocityVectors[i] = massI.velocity;
    }

    return { positionVectors, velocityVectors };
  }

  updateStateVectors(p: VectorType[], v: VectorType[]) {
    const massesLength = p.length;

    for (let i = 0; i < massesLength; i++) {
      const mass = this.masses[i];

      mass.position = p[i];
      mass.velocity = v[i];
    }
  }

  generatePositionVectors(velocityVectors: VectorType[], dt: number) {
    const positionVectors = [];
    const massesLength = velocityVectors.length;

    for (let i = 0; i < massesLength; i++) {
      const velocityVectorI = velocityVectors[i];
      const mass = this.masses[i];

      positionVectors[i] = this.positionVector
        .set(mass.position)
        .addScaledVector(dt, velocityVectorI)
        .toObject();
    }

    return positionVectors;
  }

  generateAccelerationVectors(positionVectors: VectorType[]) {
    if (this.useBarnesHut) {
      const tree = this.constructBHTree(positionVectors);
      return this.BHGenerateAccelerationVectors(positionVectors, tree);
    }

    const accelerationVectors = [];
    const massesLength = positionVectors.length;

    for (let i = 0; i < massesLength; i++) {
      this.accelerationVector.set({ x: 0, y: 0, z: 0 });

      const positionVectorI = positionVectors[i];

      for (let j = 0; j < massesLength; j++) {
        if (i !== j && this.masses[j].m > 0) {
          const positionVectorJ = positionVectors[j];

          const distanceParams = this.getDistanceParams(
            positionVectorI,
            positionVectorJ,
          );

          const fact =
            (this.g * this.masses[j].m) /
            Math.pow(distanceParams.dSquared + this.softeningSquared, 1.5);

          this.accelerationVector.addScaledVector(fact, {
            x: distanceParams.dx,
            y: distanceParams.dy,
            z: distanceParams.dz,
          });
        }
      }

      accelerationVectors[i] = this.accelerationVector.toObject();
    }

    return accelerationVectors;
  }

  generateVelocityVectors(accelerationVectors: VectorType[], dt: number) {
    const velocityVectors = [];
    const massesLength = accelerationVectors.length;

    for (let i = 0; i < massesLength; i++) {
      const accelerationVectorI = accelerationVectors[i];
      const mass = this.masses[i];

      velocityVectors[i] = this.velocityVector
        .set(mass.velocity)
        .addScaledVector(dt, accelerationVectorI)
        .toObject();
    }

    return velocityVectors;
  }

  iterate() {
    const stateVectors = this.getStateVectors(this.masses);

    const accelerationVectors = this.generateAccelerationVectors(
      stateVectors.positionVectors,
    );

    const velocityVectors = this.generateVelocityVectors(
      accelerationVectors,
      this.dt,
    );

    const positionVectors = this.generatePositionVectors(
      stateVectors.velocityVectors,
      this.dt,
    );

    this.updateStateVectors(positionVectors, velocityVectors);

    this.incrementElapsedTime();
  }

  incrementElapsedTime() {
    this.elapsedTime += this.dt;
  }

  sync(
    scenario: ScenarioType,
    options?: {
      preserveAdaptiveDt?: boolean;
    },
  ) {
    this.g = scenario.integrator.g;
    this.masses = scenario.masses;
    this.tol = scenario.integrator.tol;
    if (!options?.preserveAdaptiveDt) {
      this.dt = scenario.integrator.dt;
    }
    this.minDt = scenario.integrator.minDt;
    this.maxDt = scenario.integrator.maxDt;
    this.useBarnesHut = scenario.integrator.useBarnesHut;
    this.theta = scenario.integrator.theta;
    this.softening = scenario.integrator.softeningConstant;
    this.softeningSquared = this.softening * this.softening;
  }

  isInTree(p: VectorType, tree: BarnesHutTreeNodeType): boolean {
    const a = tree.size;

    return (
      tree.position.x <= p.x &&
      p.x < tree.position.x + a &&
      tree.position.y <= p.y &&
      p.y < tree.position.y + a &&
      tree.position.z <= p.z &&
      p.z < tree.position.z + a
    );
  }

  generateChildren(tree: BarnesHutTreeNodeType): BarnesHutTreeNodeType[] {
    const a = tree.size / 2;
    const v = new Vector();
    const emptyNode = (): BarnesHutTreeNodeType => ({
      size: a,
      position: { x: 0, y: 0, z: 0 },
      CoM: { x: 0, y: 0, z: 0 },
      nMasses: 0,
      mass: 0,
      children: [],
    });

    const tree1 = { ...emptyNode(), position: tree.position };
    const tree2 = {
      ...emptyNode(),
      position: v.set(tree.position).add({ x: 0, y: a, z: 0 }).toObject(),
    };
    const tree3 = {
      ...emptyNode(),
      position: v.set(tree.position).add({ x: a, y: 0, z: 0 }).toObject(),
    };
    const tree4 = {
      ...emptyNode(),
      position: v.set(tree.position).add({ x: a, y: a, z: 0 }).toObject(),
    };
    const tree5 = {
      ...emptyNode(),
      position: v.set(tree.position).add({ x: 0, y: 0, z: a }).toObject(),
    };
    const tree6 = {
      ...emptyNode(),
      position: v.set(tree.position).add({ x: 0, y: a, z: a }).toObject(),
    };
    const tree7 = {
      ...emptyNode(),
      position: v.set(tree.position).add({ x: a, y: 0, z: a }).toObject(),
    };
    const tree8 = {
      ...emptyNode(),
      position: v.set(tree.position).add({ x: a, y: a, z: a }).toObject(),
    };

    return [tree1, tree2, tree3, tree4, tree5, tree6, tree7, tree8];
  }

  insertMassInTree(
    mass: VectorType & { m: number },
    tree: BarnesHutTreeNodeType,
  ): void {
    const nChildren = tree.children.length;

    if (nChildren === 0) {
      tree.children = [mass];
      return;
    }

    if (nChildren === 1) {
      const otherMass = tree.children[0] as VectorType & { m: number };
      tree.children = this.generateChildren(tree);
      this.insertMassInTree(mass, tree);
      this.insertMassInTree(otherMass, tree);
      return;
    }

    if (nChildren === 8) {
      for (let i = 0; i < 8; i++) {
        if (
          this.isInTree(
            { x: mass.x, y: mass.y, z: mass.z },
            tree.children[i] as BarnesHutTreeNodeType,
          )
        ) {
          const v = new Vector();
          tree.CoM = v
            .set(tree.CoM)
            .addScaledVector(mass.m, { x: mass.x, y: mass.y, z: mass.z })
            .toObject();
          tree.mass += mass.m;
          this.insertMassInTree(
            mass,
            tree.children[i] as BarnesHutTreeNodeType,
          );
        }
      }
    }
  }

  fixCoM(tree: BarnesHutTreeNodeType): void {
    const nChildren = tree.children.length;
    const v = new Vector();

    if (nChildren === 8) {
      tree.CoM = v
        .set(tree.CoM)
        .multiplyByScalar(1 / tree.mass)
        .toObject();

      for (let i = 0; i < 8; i++) {
        this.fixCoM(tree.children[i] as BarnesHutTreeNodeType);
      }
    }
  }

  constructBHTree(p: VectorType[]): BarnesHutTreeNodeType {
    const a = this.maximumDistance;
    const tree: BarnesHutTreeNodeType = {
      size: a,
      position: { x: -a / 2, y: -a / 2, z: -a / 2 },
      CoM: { x: -a / 2, y: -a / 2, z: -a / 2 },
      mass: 0,
      children: [],
    };

    const pLen = this.masses.length;

    for (let i = 0; i < pLen; i++) {
      const massNode = {
        x: p[i].x,
        y: p[i].y,
        z: p[i].z,
        m: this.masses[i].m,
      };

      this.insertMassInTree(massNode, tree);
    }

    this.fixCoM(tree);

    return tree;
  }

  BHAccelerate(p: VectorType, tree: BarnesHutTreeNodeType): VectorType | null {
    const v = new Vector();
    const nChildren = tree.children.length;

    if (nChildren === 0) {
      return { x: 0, y: 0, z: 0 };
    }

    if (nChildren === 1) {
      const other = tree.children[0] as VectorType & { m: number };
      v.set(other);
      const rVector = v.subtract(p);
      const r = rVector.getLength();

      if (r === 0) {
        return { x: 0, y: 0, z: 0 };
      }

      return rVector
        .multiplyByScalar(
          (other.m * this.g) / Math.pow(r * r + this.softeningSquared, 1.5),
        )
        .toObject();
    }

    if (nChildren === 8) {
      const rVector = v.set(tree.CoM).subtract(p);
      const r = rVector.getLength();

      if (r === 0) {
        return { x: 0, y: 0, z: 0 };
      }

      if (tree.size / r < this.theta) {
        return rVector
          .multiplyByScalar(
            (this.g * tree.mass) / Math.pow(r * r + this.softeningSquared, 1.5),
          )
          .toObject();
      }

      let totalAcc = v.set({ x: 0, y: 0, z: 0 });

      for (let i = 0; i < 8; i++) {
        const childAcc = this.BHAccelerate(
          p,
          tree.children[i] as BarnesHutTreeNodeType,
        );

        if (childAcc) {
          totalAcc = totalAcc.add(childAcc);
        }
      }

      return totalAcc.toObject();
    }

    return null;
  }

  BHGenerateAccelerationVectors(
    p: VectorType[],
    tree: BarnesHutTreeNodeType,
  ): VectorType[] {
    const nP = p.length;
    const acc = [];

    for (let i = 0; i < nP; i++) {
      acc[i] = this.BHAccelerate(p[i], tree) ?? { x: 0, y: 0, z: 0 };
    }

    return acc;
  }
}

export default Euler;
