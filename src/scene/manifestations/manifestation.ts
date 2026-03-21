import * as THREE from "three";
import EllipseCurve from "../misc/ellipse-curve";
import { getEllipse } from "../../physics/utils/misc";
import { ScenarioMassType } from "../../types/scenario";
import { VectorType } from "../../types/physics";

class Manifestation {
  public mass: ScenarioMassType;
  protected scale: number;
  protected textureLoader: THREE.TextureLoader;
  protected trailVertices: number;
  public object3D: THREE.Object3D;
  public sphere: THREE.Mesh | undefined;
  public orbit: EllipseCurve | undefined;
  public trail: THREE.Line | undefined;
  public atmosphere: THREE.Mesh | undefined;
  public ongoingImpacts: number;
  public materialShader: THREE.Shader | undefined;

  constructor(
    mass: ScenarioMassType,
    scale: number,
    textureLoader: THREE.TextureLoader,
  ) {
    this.mass = mass;
    this.scale = scale;

    this.textureLoader = textureLoader;

    this.object3D = new THREE.Object3D();
    this.object3D.name = this.mass.name;

    this.sphere = undefined;
    this.orbit = undefined;
    this.trail = undefined;
    this.atmosphere = undefined;

    this.ongoingImpacts = 0;
    this.materialShader = undefined;

    this.trailVertices = 3000;
  }

  public createManifestation(): void {
    const segments = 40;

    const geometry = new THREE.SphereGeometry(
      this.mass.radius,
      segments,
      segments,
    );

    const material = new THREE.MeshStandardMaterial({
      map: this.textureLoader.load(`/textures/maps/${this.mass.name}.jpg`),
    });

    if (this.mass.type === "terrestial planet" || this.mass.type === "moon") {
      material.bumpMap = this.textureLoader.load(
        `/textures/bump-maps/${this.mass.name}Bump.jpg`,
      );
      material.bumpScale = 2;
    }

    material.onBeforeCompile = (shader: THREE.Shader) => {
      this.ongoingImpacts = 0;

      const impacts = [];

      const maxImpactAmount = 7;

      for (let i = 0; i < maxImpactAmount; i++) {
        impacts.push({
          impactPoint: new THREE.Vector3(0, 0, 0), //The point on the sphere where the impact takes place.
          //This point is the origin from which the shockwave radiates outwards
          impactRadius: 0, //The radius of the impact
          impactRatio: 0.25, //How far the impact shockwave has propagated outwards
        });
      }

      shader.uniforms["impacts"] = { value: impacts };

      shader.vertexShader = `varying vec3 vPosition;
        ${shader.vertexShader}`;

      shader.vertexShader = shader.vertexShader.replace(
        "#include <worldpos_vertex>",
        `#include <worldpos_vertex>
        vPosition = transformed.xyz;`,
      );

      shader.fragmentShader = `struct impact {
            vec3 impactPoint;
            float impactRadius;
            float impactRatio;
          };

         uniform impact impacts[${maxImpactAmount}];

         varying vec3 vPosition;
        ${shader.fragmentShader}`;

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
          float finalStep = 0.0;
          for (int i = 0; i < ${maxImpactAmount};i++){
            
            float dist = distance(vPosition, impacts[i].impactPoint);
            float currentRadius = impacts[i].impactRadius * impacts[i].impactRatio;
            float increment = smoothstep(0., currentRadius, dist) - smoothstep(currentRadius - ( 0.25 * impacts[i].impactRatio ), currentRadius, dist);
            increment *= 1. - impacts[i].impactRatio;
            finalStep += increment;   
    
          }
          finalStep = 1. - clamp(finalStep, 0., 1.);      
    
          vec3 color = mix(vec3(1., 0.5, 0.0625), vec3(1.,0.125, 0.0625), finalStep);
          gl_FragColor = vec4( mix( color, gl_FragColor.rgb, finalStep), diffuseColor.a );`,
      );

      this.materialShader = shader;
    };

    const sphere = new THREE.Mesh(geometry, material);

    sphere.name = "sphere";

    this.object3D.add(sphere);

    this.sphere = sphere;

    if (this.mass.atmosphere) {
      this.addAtmosphere();
    }
  }

  public addOrbit(): void {
    const orbit = new EllipseCurve(
      0,
      0,
      0,
      0,
      0,
      2 * Math.PI,
      false,
      0,
      500,
      "green",
    );

    if (orbit.object3D) {
      this.object3D.add(orbit.object3D);
    }

    this.orbit = orbit;
  }

  public removeOrbit(): void {
    let orbit = this.orbit;

    if (orbit) {
      orbit.dispose();

      this.object3D.remove(orbit.object3D);

      this.orbit = undefined;
    }
  }

  public updateOrbit(
    rotatingReferenceFrame: VectorType,
    primaryPosition: VectorType,
    scale: number,
  ): void {
    if (!this.orbit) {
      return;
    }

    const elements = this.mass.elements;

    const a = elements.a;
    const e = elements.e;
    const w = elements.argP * (180 / Math.PI);
    const i = elements.i * (180 / Math.PI);
    const o = elements.lAn * (180 / Math.PI);

    const ellipse = getEllipse(a, e);

    const orbit = this.orbit.ellipse;

    if (orbit) {
      orbit.position.z = (rotatingReferenceFrame.z - primaryPosition.z) * scale;
    }

    this.orbit.update(
      (rotatingReferenceFrame.x - primaryPosition.x + ellipse.focus) * scale,
      (rotatingReferenceFrame.y - primaryPosition.y) * scale,
      ellipse.xRadius * scale,
      ellipse.yRadius * scale,
      0,
      2 * Math.PI,
      false,
      0,
      { x: i, y: o, z: w - 180 },
    );
  }

  private addAtmosphere(): void {
    const atmosphereGeometry = new THREE.SphereGeometry(
      this.mass.radius * 1.05,
      40,
      40,
    );

    const atmosphereShader = {
      vertex: `
        varying vec3 vPosition;
        varying vec3 vNormal;
    
        void main() {
          vNormal = normalize( normalMatrix * normal );
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
          vPosition = gl_Position.xyz;
        }
        `,
      fragment: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        uniform vec3 lightPosition;
        uniform vec3 colour;
        uniform float intensityConstant;
    
        void main() {
          vec3 lightDirection = normalize(lightPosition - vPosition);
          float dotNL = clamp(dot(lightDirection, vNormal), 0.0, 1.0);
          float intensity = pow( intensityConstant - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), 8.0 );
          gl_FragColor = vec4( colour, 1.0 ) * intensity * dotNL;
        }
        `,
    };

    const atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        lightPosition: { value: new THREE.Vector3() },
        colour: {
          value: new THREE.Color(this.mass.atmosphere),
        },
        intensityConstant: { value: 1 },
      },
      vertexShader: atmosphereShader.vertex,
      fragmentShader: atmosphereShader.fragment,
      side: THREE.BackSide,
      transparent: true,
    });

    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);

    atmosphere.name = "atmosphere";

    this.atmosphere = atmosphere;

    this.object3D.add(atmosphere);
  }

  public addTrail(): void {
    const sphere = this.sphere;

    if (!sphere) {
      return;
    }

    const spherePosition = sphere.position;

    const verticesLength = this.trailVertices;

    const points = [];

    for (let i = 0; i < verticesLength; i++) {
      points.push(spherePosition);
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({
      color: "red",
      depthWrite: false,
    });

    const trail = new THREE.Line(geometry, material);

    trail.name = "trail";

    trail.frustumCulled = false;

    this.object3D.add(trail);

    this.trail = trail;
  }

  public removeTrail(): void {
    let trail = this.trail;

    if (!trail) {
      return;
    }

    let geometry = trail.geometry;

    geometry.dispose();

    this.object3D.remove(trail);

    this.trail = undefined;
  }

  public drawTrail(): void {
    const trail = this.trail;
    const massRotatedPosition = this.mass.rotatedPosition;

    if (!trail || !massRotatedPosition) {
      return;
    }

    const geometry = trail.geometry;
    const positions = geometry.attributes["position"].array;

    for (let i = positions.length - 1; i > 2; i--) {
      positions[i] = positions[i - 3];
    }

    const { x, y, z } = massRotatedPosition;

    positions[0] = x;
    positions[1] = y;
    positions[2] = z;

    geometry.getAttribute("position").needsUpdate = true;
  }

  public setPosition(): void {
    const massRotatedPosition = this.mass.rotatedPosition;

    if (!massRotatedPosition) {
      return;
    }

    const { x, y, z } = massRotatedPosition;

    const sphere = this.sphere;

    if (sphere) {
      sphere.position.set(x, y, z);
    }

    const atmosphere = this.atmosphere;

    if (atmosphere) {
      atmosphere.position.set(x, y, z);
    }
  }

  public dispose(): void {
    this.removeOrbit();

    this.removeTrail();

    let sphere = this.sphere;

    if (!sphere) {
      return;
    }

    sphere.geometry.dispose();

    const material = sphere.material as THREE.MeshStandardMaterial;

    if (material.map) {
      material.map.dispose();
    }

    if (material.bumpMap) {
      material.bumpMap.dispose();
    }

    material.dispose();

    this.object3D.remove(sphere);

    this.sphere = undefined;

    const atmosphere = this.atmosphere;

    if (atmosphere) {
      atmosphere.geometry.dispose();

      const material = atmosphere.material as THREE.ShaderMaterial;

      material.dispose();

      this.object3D.remove(atmosphere);
    }
  }
}

export default Manifestation;
