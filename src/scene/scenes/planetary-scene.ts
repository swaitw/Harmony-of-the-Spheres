import * as THREE from "three";
import SceneBase from ".";
import ManifestationManager from "../manifestations";
import createBackground from "../misc/background";
import getIntegrator, {
  adaptiveIntegrators,
  getIntegratorConfigFromScenario,
} from "../../physics/integrators";
import {
  drawMassLabel,
  drawBarycenterLabel,
  drawLagrangeLabel,
} from "../labels/labelCallbacks";
import addParticleSystems from "../../physics/particles/particle-system";
import ParticleIntegrator from "../../physics/particles/particles-integrator";
import collisionsCheck from "../../physics/collisions/collisions-check";
import Particles from "../particles/particles";
import {
  stateToKepler,
  constructSOITree,
  findCurrentSOI,
} from "../../physics/utils/elements";
import H3 from "../../physics/utils/vector";
import { modifyScenarioProperty } from "../../state/creators";
import {
  getBarycenter,
  getLagrangePoints,
  radiansToDegrees,
} from "../../physics/utils/misc";
import {
  getClosestPointOnSphere,
  generateImpactParticles,
} from "../../physics/collisions/collision-utils";
import { ScenarioMassType } from "../../types/scenario";
import RingPreview from "../ring-preview/ring-preview";
import AddMassOrbitPreview from "../misc/add-mass-orbit-preview";
import * as TWEEN from "@tweenjs/tween.js";

class PlanetaryScene extends SceneBase {
  manifestationManager!: ManifestationManager;
  scale: number;
  integrator!: ReturnType<typeof getIntegrator>;
  particleIntegrator!: ParticleIntegrator;
  previous!: {
    cameraFocus: string | undefined;
    rotatingReferenceFrame: string | undefined;
    integrator: string;
    background: boolean;
    particlesShapesCount: number;
  };
  utilVector!: H3;
  threeUtilVector!: THREE.Vector3;
  clock!: THREE.Clock;
  particles!: Particles | undefined;
  backgroundMesh!: THREE.Mesh | null;
  ringPreview!: RingPreview | null;
  addMassOrbitPreview!: AddMassOrbitPreview | null;

  constructor(webGlCanvas: HTMLCanvasElement, labelsCanvas: HTMLCanvasElement) {
    super(webGlCanvas, labelsCanvas);

    this.scale = 2100000;

    this.init();
  }

  private init(): void {
    this.utilVector = new H3();
    this.threeUtilVector = new THREE.Vector3();
    this.controls.noPan = true;
    this.particleIntegrator = new ParticleIntegrator(this.scale);
    this.ringPreview = null;
    this.addMassOrbitPreview = null;

    if (this.scenario.graphics.background) {
      this.backgroundMesh = createBackground(this.textureLoader);
      this.scene.add(this.backgroundMesh);
    } else {
      this.backgroundMesh = null;
    }

    this.manifestationManager = new ManifestationManager(
      this.scenario.masses,
      this.scene,
      this.textureLoader,
      this.scale,
      this.renderer,
    );
    this.manifestationManager.addManifestations();

    this.integrator = getIntegrator(
      this.scenario.integrator.name,
      getIntegratorConfigFromScenario(this.scenario),
    );

    this.particles = undefined;

    if (this.scenario?.particlesConfiguration?.shapes) {
      addParticleSystems(
        this.scenario.particlesConfiguration.shapes,
        this.scenario.masses,
        this.scenario.integrator.g,
        this.particleIntegrator.particles,
      );

      this.particles = new Particles(
        this.particleIntegrator.particles,
        this.scale,
        this.textureLoader,
        this.scenario.particlesConfiguration.max,
      );

      this.scene.add(this.particles.mesh);
    }

    this.previous = {
      cameraFocus: undefined,
      rotatingReferenceFrame: undefined,
      integrator: this.scenario.integrator.name,
      background: this.scenario.graphics.background,
      particlesShapesCount:
        this.scenario.particlesConfiguration?.shapes?.length ?? 0,
    };

    this.setInitialCameraPosition();

    this.clock = new THREE.Clock();

    this.iterate();
  }

  private getCameraFrameContext(): {
    rotatingReferenceFrame: { x: number; y: number; z: number };
    barycenterPosition: ReturnType<typeof getBarycenter>;
  } {
    const rotatingReferenceFrameMass = this.integrator.masses.find(
      (mass) => this.scenario.camera.rotatingReferenceFrame === mass.name,
    );

    let barycenterMasses;

    if (this.scenario.barycenter.systemBarycenter) {
      barycenterMasses = this.integrator.masses;
    } else {
      barycenterMasses = this.integrator.masses.filter(
        (mass) =>
          mass.name === this.scenario.barycenter.barycenterMassOne ||
          mass.name === this.scenario.barycenter.barycenterMassTwo,
      );
    }

    const barycenterPosition = getBarycenter(barycenterMasses);

    let rotatingReferenceFrame = { x: 0, y: 0, z: 0 };

    if (rotatingReferenceFrameMass) {
      rotatingReferenceFrame = rotatingReferenceFrameMass.position;
    }

    if (this.scenario.camera.rotatingReferenceFrame === "Barycenter") {
      rotatingReferenceFrame = barycenterPosition;
    }

    return { rotatingReferenceFrame, barycenterPosition };
  }

  private setInitialCameraPosition(): void {
    const defaultCameraPositionOnScenarioStartVector =
      this.scenario.camera.defaultCameraPositionOnScenarioStartVector;

    if (!defaultCameraPositionOnScenarioStartVector) {
      return;
    }

    const { cameraFocus } = this.scenario.camera;
    const { rotatingReferenceFrame, barycenterPosition } =
      this.getCameraFrameContext();
    const scale = this.scale;

    if (cameraFocus === "Barycenter") {
      const rotatedBarycenter = this.utilVector
        .set({
          x: barycenterPosition.x,
          y: barycenterPosition.y,
          z: barycenterPosition.z,
        })
        .subtractFrom(rotatingReferenceFrame)
        .multiplyByScalar(scale)
        .toObject();

      this.camera.position.set(
        rotatedBarycenter.x + defaultCameraPositionOnScenarioStartVector.x,
        rotatedBarycenter.y + defaultCameraPositionOnScenarioStartVector.y,
        rotatedBarycenter.z + defaultCameraPositionOnScenarioStartVector.z,
      );

      this.controls.target.set(
        rotatedBarycenter.x,
        rotatedBarycenter.y,
        rotatedBarycenter.z,
      );

      this.previous.cameraFocus = cameraFocus;

      return;
    }

    const focusMass = this.integrator.masses.find(
      (mass) => mass.name === cameraFocus,
    );

    if (!focusMass) {
      return;
    }

    const rotatedPosition = this.utilVector
      .set(focusMass.position)
      .subtractFrom(rotatingReferenceFrame)
      .multiplyByScalar(scale)
      .toObject();

    this.camera.position.set(
      rotatedPosition.x + defaultCameraPositionOnScenarioStartVector.x,
      rotatedPosition.y + defaultCameraPositionOnScenarioStartVector.y,
      rotatedPosition.z + defaultCameraPositionOnScenarioStartVector.z,
    );

    this.controls.target.copy(rotatedPosition);
    this.previous.cameraFocus = cameraFocus;
  }

  collisionCallback = (
    looser: ScenarioMassType,
    survivor: ScenarioMassType,
  ): void => {
    const survivingManifestation =
      this.manifestationManager.manifestations.find(
        (manifestation) => manifestation.mass.name === survivor.name,
      );

    if (survivingManifestation && survivingManifestation.materialShader) {
      if (survivingManifestation.sphere) {
        const survivingManifestationRotation =
          survivingManifestation.sphere.rotation;

        const hitPoint = getClosestPointOnSphere(
          new H3().set({
            x:
              looser.position.x -
              survivor.position.x -
              looser.velocity.x * this.scenario.integrator.dt,
            y:
              looser.position.y -
              survivor.position.y -
              looser.velocity.y * this.scenario.integrator.dt,
            z:
              looser.position.z -
              survivor.position.z -
              looser.velocity.z * this.scenario.integrator.dt,
          }),
          survivor.radius,
          {
            x: radiansToDegrees(survivingManifestationRotation.x),
            y: radiansToDegrees(survivingManifestationRotation.y),
            z: radiansToDegrees(survivingManifestationRotation.z),
          },
        );

        const impactIndex = survivingManifestation.ongoingImpacts + 1;

        survivingManifestation.ongoingImpacts++;

        const uniforms = survivingManifestation.materialShader.uniforms;

        uniforms["impacts"].value[impactIndex].impactPoint.set(
          -hitPoint.x,
          -hitPoint.y,
          -hitPoint.z,
        );

        uniforms["impacts"].value[impactIndex].impactRadius =
          looser.m === 0
            ? survivor.radius * 2
            : Math.min(Math.max(looser.radius * 10, 300), survivor.radius * 2);

        new TWEEN.Tween({ value: 0 })
          .to({ value: 1 }, 0.001 / this.scenario.integrator.dt)
          .onUpdate(({ value }: { value: number }) => {
            uniforms["impacts"].value[impactIndex].impactRatio = value;
          })
          .onComplete(() => {
            survivingManifestation.ongoingImpacts > 0 &&
              survivingManifestation.ongoingImpacts--;
          })
          .start();
      }
    }

    const impactParticleCount = 1000;
    const defaultParticleMax = 10000;

    const impactParticles = generateImpactParticles(
      looser,
      survivor,
      this.scenario.integrator.g,
      this.scale,
      impactParticleCount,
    );

    const impactParticlesLength = impactParticles.length;

    if (!this.particles) {
      for (let i = 0; i < impactParticlesLength; i++) {
        this.particleIntegrator.particles.push(impactParticles[i]);
      }

      this.particles = new Particles(
        this.particleIntegrator.particles,
        this.scale,
        this.textureLoader,
        defaultParticleMax,
      );

      this.scene.add(this.particles.mesh);
    } else {
      const excess =
        this.particleIntegrator.particles.length +
        impactParticleCount -
        this.particles.max;

      if (excess > 0) {
        this.particleIntegrator.particles.splice(0, excess);
      }

      for (let i = 0; i < impactParticlesLength; i++) {
        this.particleIntegrator.particles.push(impactParticles[i]);
      }
    }
  };

  iterate = () => {
    const delta = this.clock.getDelta();

    this.scenario = JSON.parse(JSON.stringify(this.store.getState()));

    const isAdaptiveIntegrator = adaptiveIntegrators.includes(
      this.scenario.integrator.name as (typeof adaptiveIntegrators)[number],
    );

    this.integrator.sync(this.scenario, {
      preserveAdaptiveDt: isAdaptiveIntegrator && this.scenario.playing,
    });

    const scale = this.scale;

    if (this.scenario.integrator.name !== this.previous.integrator) {
      this.integrator = getIntegrator(
        this.scenario.integrator.name,
        getIntegratorConfigFromScenario(this.scenario),
      );

      this.previous.integrator = this.scenario.integrator.name;
    }

    if (this.scenario.graphics.background !== this.previous.background) {
      if (this.scenario.graphics.background) {
        this.backgroundMesh = createBackground(this.textureLoader);
        this.scene.add(this.backgroundMesh);
      } else if (this.backgroundMesh) {
        this.scene.remove(this.backgroundMesh);
        this.backgroundMesh.geometry.dispose();
        (
          this.backgroundMesh.material as THREE.MeshBasicMaterial
        ).map?.dispose();
        (this.backgroundMesh.material as THREE.MeshBasicMaterial).dispose();
        this.backgroundMesh = null;
      }
      this.previous.background = this.scenario.graphics.background;
    }

    if (this.scenario.playing) {
      if (this.scenario.collisions) {
        collisionsCheck(this.integrator.masses, scale, this.collisionCallback);
      }

      this.integrator.iterate();
    }

    const soiTree = constructSOITree(this.integrator.masses);

    this.manifestationManager.diff(this.integrator.masses);

    const { cameraFocus } = this.scenario.camera;

    const { rotatingReferenceFrame, barycenterPosition } =
      this.getCameraFrameContext();

    const currentShapesCount =
      this.scenario.particlesConfiguration?.shapes?.length ?? 0;

    if (currentShapesCount > this.previous.particlesShapesCount) {
      const newShapes = this.scenario.particlesConfiguration!.shapes.slice(
        this.previous.particlesShapesCount,
      );

      addParticleSystems(
        newShapes,
        this.integrator.masses,
        this.integrator.g,
        this.particleIntegrator.particles,
      );

      if (!this.particles) {
        this.particles = new Particles(
          this.particleIntegrator.particles,
          this.scale,
          this.textureLoader,
          this.scenario.particlesConfiguration!.max,
        );

        this.scene.add(this.particles.mesh);
      }

      this.previous.particlesShapesCount = currentShapesCount;
    }

    if (this.particles) {
      if (this.scenario.playing) {
        this.particleIntegrator.iterate(
          this.integrator.masses,
          this.integrator.g,
          this.integrator.dt,
          0,
        );
      }

      this.particles.setPositions(
        this.particleIntegrator.particles,
        rotatingReferenceFrame,
      );
    }

    this.labels.clear();

    const manifestations = this.manifestationManager.manifestations;

    if (this.previous.cameraFocus !== cameraFocus && cameraFocus === "Origo") {
      this.previous.cameraFocus = cameraFocus;

      const rotatedOrigo = this.utilVector
        .set({
          x: 0,
          y: 0,
          z: 0,
        })
        .subtractFrom(rotatingReferenceFrame)
        .multiplyByScalar(this.scale)
        .toObject();

      let cameraPosition = {
        x: rotatedOrigo.x,
        y: rotatedOrigo.y + 100000,
        z: rotatedOrigo.z,
      };

      const customOrigoCameraPosition =
        this.scenario.camera.customOrigoCameraPosition;

      if (customOrigoCameraPosition) {
        cameraPosition = {
          x: rotatedOrigo.x + customOrigoCameraPosition.x,
          y: rotatedOrigo.y + customOrigoCameraPosition.y,
          z: rotatedOrigo.z + customOrigoCameraPosition.z,
        };
      }

      this.camera.position.set(
        cameraPosition.x,
        cameraPosition.y,
        cameraPosition.z,
      );

      this.controls.target.set(rotatedOrigo.x, rotatedOrigo.y, rotatedOrigo.z);
    }

    if (cameraFocus === "Origo") {
      const rotatedOrigo = this.utilVector
        .set({
          x: 0,
          y: 0,
          z: 0,
        })
        .subtractFrom(rotatingReferenceFrame)
        .multiplyByScalar(this.scale)
        .toObject();

      this.controls._panOffset.add(
        new THREE.Vector3(rotatedOrigo.x, rotatedOrigo.y, rotatedOrigo.z)
          .clone()
          .sub(this.controls.target),
      );

      this.controls.update();
    }

    if (
      this.previous.cameraFocus !== cameraFocus &&
      cameraFocus === "Barycenter"
    ) {
      this.previous.cameraFocus = cameraFocus;

      const rotatedBarycenter = this.utilVector
        .set({
          x: barycenterPosition.x,
          y: barycenterPosition.y,
          z: barycenterPosition.z,
        })
        .subtractFrom(rotatingReferenceFrame)
        .multiplyByScalar(this.scale)
        .toObject();

      let cameraPosition = {
        x: rotatedBarycenter.x,
        y: rotatedBarycenter.y + 100000,
        z: rotatedBarycenter.z,
      };

      const customBarycenterCameraPosition =
        this.scenario.camera.customBarycenterCameraPosition;

      if (customBarycenterCameraPosition) {
        cameraPosition = {
          x: rotatedBarycenter.x + customBarycenterCameraPosition.x,
          y: rotatedBarycenter.y + customBarycenterCameraPosition.y,
          z: rotatedBarycenter.z + customBarycenterCameraPosition.z,
        };
      }

      this.camera.position.set(
        cameraPosition.x,
        cameraPosition.y,
        cameraPosition.z,
      );

      this.controls.target.set(
        rotatedBarycenter.x,
        rotatedBarycenter.y,
        rotatedBarycenter.z,
      );
    }

    if (cameraFocus === "Barycenter") {
      const rotatedBarycenter = this.utilVector
        .set({
          x: barycenterPosition.x,
          y: barycenterPosition.y,
          z: barycenterPosition.z,
        })
        .subtractFrom(rotatingReferenceFrame)
        .multiplyByScalar(this.scale)
        .toObject();

      this.controls._panOffset.add(
        new THREE.Vector3(
          rotatedBarycenter.x,
          rotatedBarycenter.y,
          rotatedBarycenter.z,
        )
          .clone()
          .sub(this.controls.target),
      );

      this.controls.update();
    }

    let massesLength = this.integrator.masses.length;

    for (let i = 0; i < massesLength; i++) {
      const mass = this.integrator.masses[i];
      const { name } = mass;

      const currentSOI = findCurrentSOI(mass, soiTree, this.integrator.masses);

      const elements = stateToKepler(
        {
          x: currentSOI.position.x - mass.position.x,
          y: currentSOI.position.y - mass.position.y,
          z: currentSOI.position.z - mass.position.z,
        },
        {
          x: currentSOI.velocity.x - mass.velocity.x,
          y: currentSOI.velocity.y - mass.velocity.y,
          z: currentSOI.velocity.z - mass.velocity.z,
        },
        this.integrator.g * currentSOI.m,
      );

      mass.elements = elements;

      mass.primary = {
        position: currentSOI.position,
        velocity: currentSOI.velocity,
        gm: this.integrator.g * currentSOI.m,
        name: currentSOI.name,
      };

      const rotatedPosition = this.utilVector
        .set(mass.position)
        .subtractFrom(rotatingReferenceFrame)
        .multiplyByScalar(scale)
        .toObject();

      mass.rotatedPosition = rotatedPosition;

      const manifestation = manifestations[i];

      if (!manifestation) {
        continue;
      }

      const manifestationObject3D = manifestation.object3D;

      manifestation.mass = mass;

      if (manifestationObject3D) {
        if (mass.type === "star") {
          const starSphere = manifestation.sphere;

          if (starSphere) {
            const starMaterial = starSphere.material as THREE.ShaderMaterial;

            starMaterial.uniforms["time"].value += 0.007 * delta;
          }
        }

        manifestation.setPosition();

        const orbit = manifestation.orbit;

        if (
          mass.graphics.orbit &&
          this.scenario.camera.rotatingReferenceFrame !== mass.name &&
          currentSOI.name === this.scenario.camera.rotatingReferenceFrame
        ) {
          if (!orbit) {
            manifestation.addOrbit();
          }

          manifestation.updateOrbit(
            rotatingReferenceFrame,
            currentSOI.position,
            scale,
          );
        } else if (orbit) {
          manifestation.removeOrbit();
        }

        const numberOfTrailVertices =
          mass.graphics?.numberOfTrailVertices ??
          this.scenario.graphics?.numberOfTrailVertices ??
          3000;

        if (
          manifestation.getNumberOfTrailVertices() !== numberOfTrailVertices
        ) {
          manifestation.setNumberOfTrailVertices(numberOfTrailVertices);

          if (manifestation.trail) {
            manifestation.removeTrail();
          }
        }

        const trail = manifestation.trail;

        if (
          (!mass.graphics.trail && trail) ||
          (trail &&
            this.scenario.camera.rotatingReferenceFrame !==
              this.previous.rotatingReferenceFrame)
        ) {
          manifestation.removeTrail();
        }

        if (mass.graphics.trail) {
          if (!manifestation.trail) {
            manifestation.addTrail();
          }

          if (this.scenario.playing) {
            manifestation.drawTrail();
          }
        }

        const atmosphere = manifestation.atmosphere;

        if (atmosphere) {
          const distanceFromMassToCamera = this.camera.position.distanceTo(
            atmosphere.position,
          );

          if (distanceFromMassToCamera > mass.radius * 45) {
            atmosphere.visible = false;
          } else {
            atmosphere.visible = true;

            const atmosphereMaterial =
              atmosphere.material as THREE.ShaderMaterial;

            atmosphereMaterial.uniforms["lightPosition"].value
              .copy(
                this.manifestationManager.manifestations
                  .find((manifestation) => manifestation.mass.type === "star")
                  ?.object3D.getObjectByName("sphere")?.position,
              )
              .applyMatrix4(this.camera.matrixWorldInverse);

            atmosphereMaterial.uniforms["intensityConstant"].value =
              1 + (1 / distanceFromMassToCamera) * mass.radius;
          }
        }

        if (mass.type === "terrestial planet" || mass.type === "moon") {
          const sphere = manifestation.sphere;

          if (sphere) {
            const sphereMaterial =
              sphere.material as THREE.MeshStandardMaterial;

            if (sphereMaterial.bumpMap) {
              const distToCamera = this.camera.position.distanceTo(
                sphere.position,
              );

              sphereMaterial.bumpScale = Math.min(
                10,
                Math.max(0.1, (20 * mass.radius) / distToCamera),
              );
            }
          }
        }
      }

      if (this.previous.cameraFocus !== cameraFocus && cameraFocus === name) {
        this.previous.cameraFocus = cameraFocus;

        let cameraPosition = {
          x: rotatedPosition.x,
          y: rotatedPosition.y + mass.radius * 10,
          z: rotatedPosition.z,
        };

        const customMassCameraPosition = mass.customMassCameraPosition;

        if (customMassCameraPosition) {
          cameraPosition = {
            x: rotatedPosition.x + customMassCameraPosition.x,
            y: rotatedPosition.y + customMassCameraPosition.y,
            z: rotatedPosition.z + customMassCameraPosition.z,
          };
        }

        this.camera.position.set(
          cameraPosition.x,
          cameraPosition.y + mass.radius * 10,
          cameraPosition.z,
        );

        this.controls.target.copy(rotatedPosition);
      }

      if (cameraFocus === name) {
        this.controls._panOffset.add(
          new THREE.Vector3(
            rotatedPosition.x,
            rotatedPosition.y,
            rotatedPosition.z,
          )
            .clone()
            .sub(this.controls.target),
        );

        this.controls.update();
      }

      if (mass.graphics.label) {
        this.labels.drawLabel(
          mass.name,
          this.threeUtilVector.set(
            rotatedPosition.x,
            rotatedPosition.y,
            rotatedPosition.z,
          ),
          this.camera,
          this.scenario.camera.cameraFocus === mass.name ? true : false,
          "right",
          "white",
          drawMassLabel,
        );
      }
    }

    const ringToBeAdded = this.scenario.ringToBeAdded;
    if (ringToBeAdded?.ringsAreBeingAdded) {
      if (!this.ringPreview) {
        this.ringPreview = new RingPreview();
        this.scene.add(this.ringPreview.mesh);
      }
      const ringPrimary = this.integrator.masses.find(
        (m) => m.name === ringToBeAdded.primary,
      );
      const ringPrimaryRotatedPos = ringPrimary?.rotatedPosition ?? {
        x: 0,
        y: 0,
        z: 0,
      };
      this.ringPreview.update(
        ringPrimaryRotatedPos,
        ringToBeAdded.a,
        ringToBeAdded.aInterval,
        ringToBeAdded.i,
        ringToBeAdded.lAn,
        this.scale,
      );
    } else if (this.ringPreview) {
      this.scene.remove(this.ringPreview.mesh);
      this.ringPreview.dispose();
      this.ringPreview = null;
    }

    const massToBeAdded = this.scenario.massToBeAdded;
    if (massToBeAdded?.isBeingAdded) {
      const addPrimary = this.integrator.masses.find(
        (m) => m.name === massToBeAdded.primary,
      );

      if (addPrimary) {
        if (!this.addMassOrbitPreview) {
          this.addMassOrbitPreview = new AddMassOrbitPreview();
          this.scene.add(this.addMassOrbitPreview.object3D);
        }

        const gm = this.integrator.g * addPrimary.m;

        const massRotatedPos = this.addMassOrbitPreview.update(
          massToBeAdded.elements,
          addPrimary.position,
          rotatingReferenceFrame,
          gm,
          scale,
        );

        this.labels.drawLabel(
          massToBeAdded.type === "star" ? "New Star" : "New Mass",
          this.threeUtilVector.set(
            massRotatedPos.x,
            massRotatedPos.y,
            massRotatedPos.z,
          ),
          this.camera,
          false,
          "right",
          "cyan",
          drawMassLabel,
        );
      }
    } else if (this.addMassOrbitPreview) {
      this.scene.remove(this.addMassOrbitPreview.object3D);
      this.addMassOrbitPreview.dispose();
      this.addMassOrbitPreview = null;
    }

    if (this.scenario.barycenter.display) {
      const rotatedBarycenter = this.utilVector
        .set({
          x: barycenterPosition.x,
          y: barycenterPosition.y,
          z: barycenterPosition.z,
        })
        .subtractFrom(rotatingReferenceFrame)
        .multiplyByScalar(this.scale)
        .toObject();

      this.labels.drawLabel(
        "Barycenter",
        this.threeUtilVector.set(
          rotatedBarycenter.x,
          rotatedBarycenter.y,
          rotatedBarycenter.z,
        ),
        this.camera,
        false,
        "left",
        "limegreen",
        drawBarycenterLabel,
      );
    }

    if (this.scenario.lagrangePoints?.display) {
      const selectedMassName = this.scenario.lagrangePoints.selectedMassName;

      const secondary = this.integrator.masses.find(
        (mass) => mass.name === selectedMassName,
      );

      let primary;

      if (secondary) {
        if (secondary.primary.name !== selectedMassName) {
          primary = this.integrator.masses.find(
            (mass) => mass.name === secondary.primary.name,
          );
        }
      }

      if (secondary && primary) {
        const relativePosition = this.utilVector
          .set(secondary.position)
          .subtract(primary.position)
          .toObject();

        const relativeVelocity = this.utilVector
          .set(secondary.velocity)
          .subtract(primary.velocity)
          .toObject();

        const normal = this.utilVector
          .set(relativePosition)
          .cross(relativeVelocity)
          .toObject();

        const lagrangePoints = getLagrangePoints(
          primary.position,
          primary.m,
          secondary.position,
          secondary.m,
          normal,
        );

        const lagrangePointEntries = [
          { name: "L1", position: lagrangePoints.L1 },
          { name: "L2", position: lagrangePoints.L2 },
          { name: "L3", position: lagrangePoints.L3 },
          { name: "L4", position: lagrangePoints.L4 },
          { name: "L5", position: lagrangePoints.L5 },
        ];

        const lagrangePointEntriesLength = lagrangePointEntries.length;

        for (let i = 0; i < lagrangePointEntriesLength; i++) {
          const lagrangePoint = lagrangePointEntries[i];
          const rotatedLagrangePointPosition = this.utilVector
            .set(lagrangePoint.position)
            .subtractFrom(rotatingReferenceFrame)
            .multiplyByScalar(scale)
            .toObject();

          this.labels.drawLabel(
            lagrangePoint.name,
            this.threeUtilVector.set(
              rotatedLagrangePointPosition.x,
              rotatedLagrangePointPosition.y,
              rotatedLagrangePointPosition.z,
            ),
            this.camera,
            false,
            "right",
            "yellow",
            drawLagrangeLabel,
          );
        }
      }
    }

    if (
      this.scenario.camera.rotatingReferenceFrame !==
      this.previous.rotatingReferenceFrame
    ) {
      this.previous.rotatingReferenceFrame =
        this.scenario.camera.rotatingReferenceFrame;
    }

    TWEEN.update();

    this.store.dispatch(
      modifyScenarioProperty({ key: "masses", value: this.integrator.masses }),
    );

    this.store.dispatch(
      modifyScenarioProperty({
        key: "camera",
        value: {
          ...this.scenario.camera,
          cameraDistanceToOrigoInAu:
            this.camera.position.distanceTo(new THREE.Vector3(0, 0, 0)) /
            this.scale,
        },
      }),
    );

    this.renderer.render(this.scene, this.camera);

    this.requestAnimationFrameId = requestAnimationFrame(this.iterate);
  };

  private stopAnimation(): void {
    if (this.requestAnimationFrameId !== null) {
      cancelAnimationFrame(this.requestAnimationFrameId);
      this.requestAnimationFrameId = null;
    }
  }

  private disposeSceneContents(): void {
    const manifestations = this.manifestationManager.manifestations;
    const manifestationsLength = manifestations.length;

    for (let i = 0; i < manifestationsLength; i++) {
      const manifestation = manifestations[i];

      this.scene.remove(manifestation.object3D);
      manifestation.dispose();
    }

    this.manifestationManager.manifestations = [];

    if (this.backgroundMesh) {
      this.scene.remove(this.backgroundMesh);
      this.backgroundMesh.geometry.dispose();
      (this.backgroundMesh.material as THREE.MeshBasicMaterial).map?.dispose();
      (this.backgroundMesh.material as THREE.MeshBasicMaterial).dispose();
      this.backgroundMesh = null;
    }

    if (this.particles) {
      this.scene.remove(this.particles.mesh);
      this.particles.dispose();
      this.particles = undefined;
    }

    if (this.ringPreview) {
      this.scene.remove(this.ringPreview.mesh);
      this.ringPreview.dispose();
      this.ringPreview = null;
    }

    if (this.addMassOrbitPreview) {
      this.scene.remove(this.addMassOrbitPreview.object3D);
      this.addMassOrbitPreview.dispose();
      this.addMassOrbitPreview = null;
    }

    this.scene.traverse((object) => {
      const node = object as THREE.Mesh | THREE.Line | THREE.Points;

      if ("geometry" in node && node.geometry) {
        node.geometry.dispose();
      }

      if ("material" in node && node.material) {
        const materials = Array.isArray(node.material)
          ? node.material
          : [node.material];

        const materialsLength = materials.length;

        for (let i = 0; i < materialsLength; i++) {
          const material = materials[i];

          if (!material) continue;

          const keys = Object.keys(material);
          const keysLength = keys.length;

          for (let j = 0; j < keysLength; j++) {
            const key = keys[j];
            const value = (material as unknown as Record<string, unknown>)[key];

            if (value instanceof THREE.Texture) {
              value.dispose();
            }
          }

          material.dispose();
        }
      }
    });

    this.scene.clear();
  }

  public destroy(): void {
    this.stopAnimation();
    this.disposeSceneContents();
    TWEEN.removeAll();
    this.controls.dispose();
    this.renderer.dispose();
  }

  public reset(): void {
    this.stopAnimation();
    this.disposeSceneContents();
    TWEEN.removeAll();

    this.scenario = JSON.parse(JSON.stringify(this.store.getState()));

    this.init();
  }
}

export default PlanetaryScene;
