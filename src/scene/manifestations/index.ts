import * as THREE from "three";
import Manifestation from "./manifestation";
import Star from "./star";
import { ScenarioMassesType, ScenarioMassType } from "../../types/scenario";
import { computeCloudDensity } from "../../physics/utils/misc";

class ManifestationManager {
  private masses: ScenarioMassesType;

  private scene: THREE.Scene;
  private textureLoader: THREE.TextureLoader;
  private scale: number;

  public manifestations: Manifestation[];

  constructor(
    masses: ScenarioMassesType,
    scene: THREE.Scene,
    textureLoader: THREE.TextureLoader,
    scale: number,
  ) {
    this.scale = scale;
    this.masses = masses;

    this.scene = scene;
    this.textureLoader = textureLoader;

    this.manifestations = [];
  }

  public createManifestation(
    mass: ScenarioMassType,
    cloudDensity = 0,
  ): Manifestation {
    switch (mass.type) {
      case "star":
        const star = new Star(mass, this.scale, this.textureLoader);

        star.createManifestation();

        return star;

      default:
        const sphere = new Manifestation(mass, this.scale, this.textureLoader);

        sphere.createManifestation(cloudDensity);

        return sphere;
    }
  }

  public addManifestations() {
    this.masses.forEach((mass) => {
      const cloudDensity = computeCloudDensity(mass, this.masses);
      const manifestation = this.createManifestation(mass, cloudDensity);

      this.manifestations.push(manifestation);
      this.scene.add(manifestation.object3D);
    });
  }

  public diff(updatedMasses: ScenarioMassesType) {
    let i = 0;

    while (i < this.manifestations.length) {
      let entry1 = this.manifestations[i];

      if (
        updatedMasses.some(
          (entry2: ScenarioMassType) => entry1!.mass.name === entry2.name,
        )
      )
        ++i;
      else {
        const massToBeDeleted = this.scene.getObjectByName(
          this.manifestations[i].mass.name,
        ) as THREE.Object3D;

        this.scene.remove(massToBeDeleted);

        this.manifestations[i].dispose();

        this.manifestations.splice(i, 1);
      }
    }

    for (const mass of updatedMasses) {
      if (!this.manifestations.some((m) => m.mass.name === mass.name)) {
        const cloudDensity = computeCloudDensity(mass, updatedMasses);
        const manifestation = this.createManifestation(mass, cloudDensity);

        this.scene.add(manifestation.object3D);

        this.manifestations.push(manifestation);
      }
    }
  }
}

export default ManifestationManager;
