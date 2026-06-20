import * as THREE from "three";
import Manifestation from "./manifestation";
import Star from "./star";
import NonStellarProceduralManifestation from "./non-stellar-procedural-manifestation";
import { ScenarioMassesType, ScenarioMassType } from "../../types/scenario";
import { computeCloudDensity } from "../../physics/utils/misc";

class ManifestationManager {
  private masses: ScenarioMassesType;

  private scene: THREE.Scene;
  private textureLoader: THREE.TextureLoader;
  private renderer: THREE.WebGLRenderer;
  private scale: number;

  public manifestations: Manifestation[];

  readonly paletteEpoch: number;

  constructor(
    masses: ScenarioMassesType,
    scene: THREE.Scene,
    textureLoader: THREE.TextureLoader,
    scale: number,
    renderer: THREE.WebGLRenderer,
  ) {
    this.scale = scale;
    this.masses = masses;

    this.scene = scene;
    this.textureLoader = textureLoader;
    this.renderer = renderer;

    this.manifestations = [];
    this.paletteEpoch = ManifestationManager.createPaletteEpoch();
  }

  private static createPaletteEpoch(): number {
    const buffer = new Uint32Array(2);

    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      crypto.getRandomValues(buffer);

      return buffer[0] + buffer[1] * 0x100000000;
    }

    return Math.random() * 0x100000000 + Math.random();
  }

  public createManifestation(
    mass: ScenarioMassType,
    allMasses: ScenarioMassesType,
    cloudDensity = 0,
    massIndex = 0,
  ): Manifestation {
    switch (mass.type) {
      case "star": {
        const star = new Star(mass, this.scale, this.textureLoader, massIndex);

        star.createManifestation();

        return star;
      }

      default: {
        if (mass.nonStellarProceduralManifestation) {
          const procedural = new NonStellarProceduralManifestation(
            mass,
            this.scale,
            this.textureLoader,
            this.renderer,
            allMasses,
            this.paletteEpoch,
            massIndex,
          );

          procedural.createManifestation(cloudDensity);

          return procedural;
        }

        const sphere = new Manifestation(
          mass,
          this.scale,
          this.textureLoader,
          massIndex,
        );

        sphere.createManifestation(cloudDensity);

        return sphere;
      }
    }
  }

  public addManifestations() {
    this.masses.forEach((mass, massIndex) => {
      const cloudDensity = computeCloudDensity(mass, this.masses);
      const manifestation = this.createManifestation(
        mass,
        this.masses,
        cloudDensity,
        massIndex,
      );

      this.manifestations.push(manifestation);
      this.scene.add(manifestation.object3D);
    });
  }

  public diff(updatedMasses: ScenarioMassesType) {
    let i = 0;

    while (i < this.manifestations.length) {
      const entry1 = this.manifestations[i];

      if (
        updatedMasses.some(
          (entry2: ScenarioMassType) => entry1!.mass.name === entry2.name,
        )
      ) {
        ++i;
      } else {
        const massToBeDeleted = this.scene.getObjectByName(
          this.manifestations[i].mass.name,
        ) as THREE.Object3D;

        this.scene.remove(massToBeDeleted);

        this.manifestations[i].dispose();

        this.manifestations.splice(i, 1);
      }
    }

    const updatedMassesLength = updatedMasses.length;

    for (let massIndex = 0; massIndex < updatedMassesLength; massIndex++) {
      const mass = updatedMasses[massIndex];

      if (
        !this.manifestations.some(
          (manifestation) => manifestation.mass.name === mass.name,
        )
      ) {
        const cloudDensity = computeCloudDensity(mass, updatedMasses);

        const manifestation = this.createManifestation(
          mass,
          updatedMasses,
          cloudDensity,
          massIndex,
        );

        this.scene.add(manifestation.object3D);

        this.manifestations.push(manifestation);
      }
    }
  }
}

export default ManifestationManager;
