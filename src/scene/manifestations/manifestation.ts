import * as THREE from "three";
import ConicSection from "../misc/conic-section";
import { getConicSection } from "../../physics/utils/misc";
import { ScenarioMassType } from "../../types/scenario";
import { VectorType } from "../../types/physics";
import { getMassOrbitTrailColor } from "../utils/mass-orbit-trail-color";

class Manifestation {
  public mass: ScenarioMassType;
  protected scale: number;
  protected textureLoader: THREE.TextureLoader;
  protected trailVertices: number;
  public object3D: THREE.Object3D;
  public sphere: THREE.Mesh | undefined;
  public orbit: ConicSection | undefined;
  public trail: THREE.Line | undefined;
  public atmosphere: THREE.Mesh | undefined;
  public ongoingImpacts: number;
  public materialShader: THREE.Shader | undefined;
  protected readonly orbitTrailColor: string;

  constructor(
    mass: ScenarioMassType,
    scale: number,
    textureLoader: THREE.TextureLoader,
    massIndex = 0,
  ) {
    this.mass = mass;
    this.scale = scale;

    this.textureLoader = textureLoader;
    this.orbitTrailColor = getMassOrbitTrailColor(mass.name, massIndex);

    this.object3D = new THREE.Object3D();
    this.object3D.name = this.mass.name;

    this.sphere = undefined;
    this.orbit = undefined;
    this.trail = undefined;
    this.atmosphere = undefined;

    this.ongoingImpacts = 0;
    this.materialShader = undefined;

    this.trailVertices = mass.graphics?.numberOfTrailVertices ?? 3000;
  }

  public getNumberOfTrailVertices(): number {
    return this.trailVertices;
  }

  public setNumberOfTrailVertices(count: number): void {
    this.trailVertices = count;
  }

  public createManifestation(cloudDensity = 0): void {
    const isSmallBody =
      this.mass.type === "comet" || this.mass.type === "asteroid";
    const segments = isSmallBody ? 3 : 40;
    const heightSegments = isSmallBody ? 2 : segments;

    const geometry = new THREE.SphereGeometry(
      this.mass.radius,
      segments,
      heightSegments,
    );

    const material = isSmallBody
      ? new THREE.MeshStandardMaterial({
          color: this.mass.type === "comet" ? 0xb8c4b8 : 0x8b7355,
          flatShading: true,
          roughness: 1.0,
          metalness: 0.0,
        })
      : new THREE.MeshStandardMaterial({
          map: this.textureLoader.load(`/textures/maps/${this.mass.name}.jpg`),
        });

    if (this.mass.type === "terrestial planet" || this.mass.type === "moon") {
      material.bumpMap = this.textureLoader.load(
        `/textures/bump-maps/${this.mass.name}Bump.jpg`,
      );
      material.bumpScale = 10;
    }

    material.customProgramCacheKey = () =>
      `manifestation-clouds-${cloudDensity.toFixed(4)}`;

    material.onBeforeCompile = (shader: THREE.Shader) => {
      this.ongoingImpacts = 0;

      const impacts = [];

      const maxImpactAmount = 7;

      for (let i = 0; i < maxImpactAmount; i++) {
        impacts.push({
          impactPoint: new THREE.Vector3(0, 0, 0),
          impactRadius: 0,
          impactRatio: 0.25,
        });
      }

      shader.uniforms["impacts"] = { value: impacts };

      if (cloudDensity > 0) {
        shader.uniforms["cloudDensity"] = { value: cloudDensity };
      }

      shader.vertexShader = `varying vec3 vPosition;
        ${shader.vertexShader}`;

      shader.vertexShader = shader.vertexShader.replace(
        "#include <worldpos_vertex>",
        `#include <worldpos_vertex>
        vPosition = transformed.xyz;`,
      );

      const clouds =
        cloudDensity > 0
          ? `
        uniform float cloudDensity;

        vec4 permute(vec4 x) {
          return mod(((x * 34.0) + 1.0) * x, 289.0);
        }

        vec4 taylorInvSqrt(vec4 r) {
          return 1.79284291400159 - 0.85373472095314 * r;
        }

        float simplexNoise(vec3 v) {
          const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);

          vec3 g  = step(x0.yzx, x0.xyz);
          vec3 l  = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);

          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;

          i = mod(i, 289.0);
          vec4 p = permute(
            permute(
              permute(i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0)
            ) + i.x + vec4(0.0, i1.x, i2.x, 1.0)
          );

          float skewFactor = 1.0 / 7.0;
          vec3  ns         = skewFactor * D.wyz - D.xzx;

          vec4 j  = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x  = x_ * ns.x + ns.yyyy;
          vec4 y  = y_ * ns.x + ns.yyyy;
          vec4 h  = 1.0 - abs(x) - abs(y);

          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0) * 2.0 + 1.0;
          vec4 s1 = floor(b1) * 2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));

          vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

          vec3 grad0 = vec3(a0.xy, h.x);
          vec3 grad1 = vec3(a0.zw, h.y);
          vec3 grad2 = vec3(a1.xy, h.z);
          vec3 grad3 = vec3(a1.zw, h.w);

          vec4 norm = taylorInvSqrt(vec4(
            dot(grad0, grad0),
            dot(grad1, grad1),
            dot(grad2, grad2),
            dot(grad3, grad3)
          ));

          grad0 *= norm.x;
          grad1 *= norm.y;
          grad2 *= norm.z;
          grad3 *= norm.w;

          vec4 m = max(0.6 - vec4(
            dot(x0, x0),
            dot(x1, x1),
            dot(x2, x2),
            dot(x3, x3)
          ), 0.0);
          m = m * m;

          return 42.0 * dot(m * m, vec4(
            dot(grad0, x0),
            dot(grad1, x1),
            dot(grad2, x2),
            dot(grad3, x3)
          ));
        }

        float fbm(vec3 position) {
          float value     = 0.0;
          float amplitude = 0.5;
          float frequency = 1.0;
          float maxValue  = 0.0;

          for (int i = 0; i < 6; i++) {
            value     += amplitude * (simplexNoise(position * frequency) * 0.5 + 0.5);
            maxValue  += amplitude;
            amplitude *= 0.5;
            frequency *= 2.1;
          }

          return value / maxValue;
        }
      `
          : "";

      shader.fragmentShader = `struct impact {
            vec3 impactPoint;
            float impactRadius;
            float impactRatio;
          };

         uniform impact impacts[${maxImpactAmount}];

         ${clouds}

         varying vec3 vPosition;
        ${shader.fragmentShader}`;

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
          float ringIntensity = 0.0;
          vec3 ringAccumColor = vec3(0.0);
          for (int i = 0; i < ${maxImpactAmount}; i++) {
            float impRad = impacts[i].impactRadius;
            float impRatio = impacts[i].impactRatio;

            if (impRad > 0.001 && impRatio > 0.001) {
              float dist = distance(vPosition, impacts[i].impactPoint);
              float currentRadius = impRad * impRatio;

              vec3 dir = normalize(vPosition - impacts[i].impactPoint + vec3(0.0001));

              float n1 = fract(sin(dot(dir.xy, vec2(127.1, 311.7))) * 43758.5453);
              float n2 = fract(sin(dot(dir.yz, vec2(269.5, 183.3))) * 31415.9265);
              float n3 = fract(sin(dot(dir.xz, vec2(419.2, 127.6))) * 27836.6349);
              float jag = ((n1 + n2 + n3) / 3.0 * 2.0 - 1.0) * impRad * 0.06;

              float ringWidth = impRad * 0.035;
              float soft = max(ringWidth * 0.25, impRad * 0.001);
              float innerR = currentRadius - ringWidth * 0.5 + jag;
              float outerR = currentRadius + ringWidth * 0.5 + jag;

              float ring = smoothstep(innerR - soft, innerR + soft, dist)
                         * (1.0 - smoothstep(outerR - soft, outerR + soft, dist));

              ring *= 1.0 - impRatio;

              float ringPos = 1.0 - clamp(abs(dist - currentRadius) / (ringWidth * 0.5 + soft), 0.0, 1.0);
              float heat = clamp((ringPos + n1 * 0.25) * (1.0 - impRatio * 0.5), 0.0, 1.0);

              vec3 lavaHot  = vec3(1.0,  1.0,  0.80);
              vec3 lavaMid  = vec3(1.0,  0.55, 0.05);
              vec3 lavaCool = vec3(0.80, 0.10, 0.00);
              vec3 c = mix(lavaCool, lavaMid, clamp(heat * 2.0, 0.0, 1.0));
              c      = mix(c, lavaHot,        clamp(heat * 2.0 - 1.0, 0.0, 1.0));
              c     *= 1.35;

              ringIntensity += ring;
              ringAccumColor += c * ring;
            }
          }
          ringIntensity = clamp(ringIntensity, 0.0, 1.0);
          if (ringIntensity > 0.0) {
            vec3 finalRingColor = ringAccumColor / ringIntensity;
            gl_FragColor = vec4(mix(gl_FragColor.rgb, finalRingColor, ringIntensity), gl_FragColor.a);
          }
          ${
            cloudDensity > 0
              ? `
          float cloudFrequency = mix(4.0, 2.0, cloudDensity);
          vec3  cloudPos       = normalize(vPosition) * cloudFrequency;
          float cloudNoise     = fbm(cloudPos);
          float cloudThreshold = mix(0.72, 0.46, cloudDensity);
          float cloudEdge      = mix(0.06, 0.20, cloudDensity);
          float cloudAlpha     = smoothstep(cloudThreshold, cloudThreshold + cloudEdge, cloudNoise) * mix(0.35, 0.92, cloudDensity);
          float litFactor      = smoothstep(0.0, 0.15, dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114)));
          cloudAlpha          *= litFactor;
          gl_FragColor.rgb     = mix(gl_FragColor.rgb, vec3(1.0), cloudAlpha);
          `
              : ""
          }`,
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
    const orbit = new ConicSection(
      0,
      0,
      0,
      0,
      0,
      2 * Math.PI,
      false,
      0,
      500,
      this.orbitTrailColor,
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

    const conicSection = getConicSection(a, e);

    const aStartAngle = e < 1 ? 0 : -4;
    const aEndAngle = e < 1 ? 2 * Math.PI : 4;

    const orbit = this.orbit.conicSection;

    if (orbit) {
      orbit.position.z = (rotatingReferenceFrame.z - primaryPosition.z) * scale;
    }

    const zRotation = e < 1 ? w - 180 : w;

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
  }

  protected addAtmosphere(colour?: THREE.ColorRepresentation): void {
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
          value: new THREE.Color(colour ?? this.mass.atmosphere),
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
      color: this.orbitTrailColor,
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

    trail.geometry.dispose();
    (trail.material as THREE.LineBasicMaterial).dispose();

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
    const positionsLength = positions.length;

    for (let i = positionsLength - 1; i > 2; i--) {
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
