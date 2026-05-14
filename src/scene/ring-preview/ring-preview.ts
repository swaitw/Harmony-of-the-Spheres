import * as THREE from "three";
import { VectorType } from "../../types/physics";

class RingPreview {
  mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;
  private cachedInnerR: number;
  private cachedOuterR: number;

  constructor() {
    this.cachedInnerR = -1;
    this.cachedOuterR = -1;

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uOpacity: { value: 0.55 },
      },
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float uOpacity;

        void main() {
          float t = vUv.y;

          float edgeFraction = 0.18;
          float innerFade = smoothstep(0.0, edgeFraction, t);
          float outerFade = smoothstep(1.0, 1.0 - edgeFraction, t);
          float radialAlpha = innerFade * outerFade;

          float midGlow = smoothstep(0.0, 0.5, t) * smoothstep(1.0, 0.5, t);

          float shimmer = 0.78 + 0.22 * sin(vUv.x * 94.25);

          vec3 edgeColour = vec3(0.38, 0.70, 1.00);
          vec3 midColour  = vec3(0.80, 0.93, 1.00);
          vec3 colour = mix(edgeColour, midColour, midGlow);

          float alpha = radialAlpha * shimmer * uOpacity;

          gl_FragColor = vec4(colour, alpha);
        }
    `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const geometry = new THREE.RingGeometry(0.5, 1.0, 128, 4);

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.name = "ringPreview";
    this.mesh.visible = false;
    this.mesh.renderOrder = 1;
  }

  update(
    primaryRotatedPosition: VectorType,
    a: number,
    aInterval: number,
    inclination: number,
    lAn: number,
    scale: number,
  ) {
    if (a <= 0) {
      this.mesh.visible = false;
      return;
    }

    this.mesh.visible = true;

    const halfWidth = Math.max(aInterval, a * 0.03);
    const innerR = Math.max(0, a - halfWidth) * scale;
    const outerR = (a + halfWidth) * scale;

    if (
      Math.abs(innerR - this.cachedInnerR) > innerR * 0.001 + 0.01 ||
      Math.abs(outerR - this.cachedOuterR) > outerR * 0.001 + 0.01
    ) {
      this.mesh.geometry.dispose();
      this.mesh.geometry = new THREE.RingGeometry(innerR, outerR, 128, 4);
      this.cachedInnerR = innerR;
      this.cachedOuterR = outerR;
    }

    this.mesh.position.set(
      primaryRotatedPosition.x,
      primaryRotatedPosition.y,
      primaryRotatedPosition.z,
    );

    const DEG = Math.PI / 180;

    this.mesh.rotation.set(0, 0, 0);
    this.mesh.rotateX(inclination * DEG);
    this.mesh.rotateZ(lAn * DEG);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}

export default RingPreview;
