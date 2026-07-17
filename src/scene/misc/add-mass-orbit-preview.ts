import * as THREE from "three";
import ConicSection from "./conic-section";
import { keplerToState, stateToKepler } from "../../physics/utils/elements";
import { getConicSection } from "../../physics/utils/misc";
import { ElementsType, VectorType } from "../../types/physics";

class AddMassOrbitPreview {
  private orbit: ConicSection;
  private sphere: THREE.Mesh;
  public object3D: THREE.Object3D;

  constructor() {
    this.object3D = new THREE.Object3D();

    this.orbit = new ConicSection(
      0,
      0,
      0,
      0,
      0,
      2 * Math.PI,
      false,
      0,
      256,
      "cyan",
      0,
    );

    const orbitMaterial = this.orbit.conicSection
      .material as THREE.LineBasicMaterial;
    orbitMaterial.transparent = true;
    orbitMaterial.opacity = 0.7;

    this.object3D.add(this.orbit.object3D);

    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    this.sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1, 16, 16),
      sphereMaterial,
    );
    this.sphere.renderOrder = 1;
    this.object3D.add(this.sphere);
  }

  public update(
    elements: ElementsType,
    primaryPosition: VectorType,
    rotatingReferenceFrame: VectorType,
    gm: number,
    scale: number,
  ): VectorType {
    const e = elements.e;

    const { posRel: posRelJson, velRel: velRelJson } = keplerToState(
      elements,
      gm,
    );

    const posRelSim: VectorType = {
      x: -posRelJson.x,
      y: -posRelJson.z,
      z: posRelJson.y,
    };

    const velRelSim: VectorType = {
      x: -velRelJson.x,
      y: -velRelJson.z,
      z: velRelJson.y,
    };

    const simElements = stateToKepler(posRelSim, velRelSim, gm);

    const w = simElements.argP * (180 / Math.PI);
    const i = simElements.i * (180 / Math.PI);
    const o = simElements.lAn * (180 / Math.PI);

    const conicSection = getConicSection(elements.a, e);

    const aStartAngle = e < 1 ? 0 : -4;
    const aEndAngle = e < 1 ? 2 * Math.PI : 4;
    const zRotation = e < 1 ? w - 180 : w;

    this.orbit.conicSection.position.z =
      (rotatingReferenceFrame.z - primaryPosition.z) * scale;

    this.orbit.update(
      (rotatingReferenceFrame.x - primaryPosition.x + conicSection.focus) *
        scale,
      (rotatingReferenceFrame.y - primaryPosition.y) * scale,
      conicSection.xRadius * scale,
      conicSection.yRadius * scale,
      aStartAngle,
      aEndAngle,
      false,
      0,
      e,
      { x: i, y: o, z: zRotation },
    );

    const rotatedPosition: VectorType = {
      x: (-posRelJson.x + primaryPosition.x - rotatingReferenceFrame.x) * scale,
      y: (-posRelJson.z + primaryPosition.y - rotatingReferenceFrame.y) * scale,
      z: (posRelJson.y + primaryPosition.z - rotatingReferenceFrame.z) * scale,
    };

    const sphereRadius = Math.max(elements.a * scale * 0.015, 0.01);
    this.sphere.scale.setScalar(sphereRadius);
    this.sphere.position.set(
      rotatedPosition.x,
      rotatedPosition.y,
      rotatedPosition.z,
    );

    return rotatedPosition;
  }

  public dispose(): void {
    this.orbit.dispose();
    this.object3D.remove(this.orbit.object3D);

    this.object3D.remove(this.sphere);
    this.sphere.geometry.dispose();
    (this.sphere.material as THREE.MeshBasicMaterial).dispose();
  }
}

export default AddMassOrbitPreview;
