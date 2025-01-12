import * as THREE from "three";
import SceneBase from ".";
import ManifestationManager from "../manifestations";
import background from "../misc/background";
import getIntegrator from "../../physics/integrators";
import { drawMassLabel, drawBarycenterLabel } from "../labels/labelCallbacks";
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
import { getBarycenter } from "../../physics/utils/misc";

class PlanetaryScene extends SceneBase {
  manifestationManager: ManifestationManager;
  scale: number;
  integrator: ReturnType<typeof getIntegrator>;
  particleIntegrator: ParticleIntegrator;
  previous: {
    cameraFocus: string | undefined;
    rotatingReferenceFrame: string | undefined;
    integrator: string;
  };
  utilVector: H3;
  threeUtilVector: THREE.Vector3;
  clock: THREE.Clock;
  particles: Particles | undefined;

  constructor(webGlCanvas: HTMLCanvasElement, labelsCanvas: HTMLCanvasElement) {
    super(webGlCanvas, labelsCanvas);
    this.clock = new THREE.Clock();
    this.scale = 2100000;

    this.scene.add(background(this.textureLoader));

    this.manifestationManager = new ManifestationManager(
      this.scenario.masses,
      this.scene,
      this.textureLoader,
      this.scale,
    );
    this.manifestationManager.addManifestations();

    this.utilVector = new H3();
    this.threeUtilVector = new THREE.Vector3();

    this.integrator = getIntegrator(this.scenario.integrator.name, {
      g: this.scenario.integrator.g,
      dt: this.scenario.integrator.dt,
      masses: this.scenario.masses,
      elapsedTime: this.scenario.elapsedTime,
    });

    this.particleIntegrator = new ParticleIntegrator(this.scale);

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
      );

      this.particles.createParticleSystem();

      this.scene.add(this.particles.mesh);
    }

    this.previous = {
      cameraFocus: undefined,
      rotatingReferenceFrame: undefined,
      integrator: this.scenario.integrator.name,
    };

    this.controls.noPan = true;
  }

  iterate = () => {
    const delta = this.clock.getDelta();

    this.scenario = JSON.parse(JSON.stringify(this.store.getState()));

    this.integrator.sync(this.scenario);

    const scale = this.scale;

    if (this.scenario.integrator.name !== this.previous.integrator) {
      this.integrator = getIntegrator(this.scenario.integrator.name, {
        g: this.scenario.integrator.g,
        dt: this.scenario.integrator.dt,
        masses: this.scenario.masses,
        elapsedTime: this.scenario.elapsedTime,
      });

      this.previous.integrator = this.scenario.integrator.name;
    }

    if (this.scenario.playing) {
      if (this.scenario.collisions) {
        collisionsCheck(this.integrator.masses, scale);
      }

      this.integrator.iterate();
    }

    const soiTree = constructSOITree(this.integrator.masses);

    this.manifestationManager.diff(this.integrator.masses);

    const { cameraFocus } = this.scenario.camera;

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
          this.scenario.graphics.orbits &&
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

        const trail = manifestation.trail;

        if (
          (!this.scenario.graphics.trails && trail) ||
          (trail &&
            this.scenario.camera.rotatingReferenceFrame !==
              this.previous.rotatingReferenceFrame)
        ) {
          manifestation.removeTrail();
        }

        if (this.scenario.graphics.trails) {
          if (!trail) {
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

      if (this.scenario.graphics.labels) {
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

    if (
      this.scenario.camera.rotatingReferenceFrame !==
      this.previous.rotatingReferenceFrame
    ) {
      this.previous.rotatingReferenceFrame =
        this.scenario.camera.rotatingReferenceFrame;
    }

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
}

export default PlanetaryScene;
