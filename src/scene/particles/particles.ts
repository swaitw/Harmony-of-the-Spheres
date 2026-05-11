import * as THREE from "three";
import { ParticlesType, VectorType } from "../../types/physics";

class Particles {
  particles: ParticlesType;
  scale: number;
  textureLoader: THREE.TextureLoader;
  mesh: THREE.Points;
  max: number;
  defaultSize: number;

  constructor(
    particles: ParticlesType,
    scale: number,
    textureLoader: THREE.TextureLoader,
    max: number = 10000,
    defaultSize: number = 40,
  ) {
    this.particles = particles;

    this.scale = scale;

    this.textureLoader = textureLoader;

    this.max = max;

    this.defaultSize = defaultSize;

    this.mesh = this.createParticleSystem();
  }

  public createParticleSystem() {
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(this.max * 3);
    const colours = new Float32Array(this.max * 3);
    const sizes = new Float32Array(this.max);

    const particlesLength = this.particles.length;

    const scale = this.scale;
    const particles = this.particles;

    const defaultColour = new THREE.Color("skyblue");
    const temporaryColour = new THREE.Color();

    for (let i = 0; i < particlesLength; i++) {
      const particle = particles[i];
      const particlePosition = particle.position;

      positions[i * 3] = particlePosition.x * scale;
      positions[i * 3 + 1] = particlePosition.y * scale;
      positions[i * 3 + 2] = particlePosition.z * scale;

      const hsl = particle.hsl;
      const colour = hsl
        ? temporaryColour.setHSL(hsl[0] / 360, hsl[1] / 100, hsl[2] / 100)
        : defaultColour;
      colours[i * 3] = colour.r;
      colours[i * 3 + 1] = colour.g;
      colours[i * 3 + 2] = colour.b;

      sizes[i] = particle.size ?? this.defaultSize;
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );

    geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colours, 3),
    );

    geometry.setAttribute("aSize", new THREE.Float32BufferAttribute(sizes, 1));

    geometry.setDrawRange(0, particlesLength);

    const particleTexture = this.textureLoader.load("/textures/particle.png");

    const material = new THREE.PointsMaterial({
      size: 1,
      map: particleTexture,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      transparent: true,
      vertexColors: true,
      sizeAttenuation: true,
    });

    material.onBeforeCompile = (shader) => {
      shader.vertexShader = `attribute float aSize;\n` + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        `gl_PointSize = size;`,
        `gl_PointSize = size * aSize;`,
      );
    };

    const mesh = new THREE.Points(geometry, material);
    mesh.name = "particles";

    return mesh;
  }

  public setPositions(
    particles: ParticlesType,
    rotatingReferenceFrame: VectorType,
  ) {
    const particlesLength = particles.length;

    const geometry = this.mesh.geometry;
    geometry.setDrawRange(0, particlesLength);

    const positions = geometry.attributes["position"].array;
    const colours = geometry.attributes["color"].array;
    const sizes = geometry.attributes["aSize"].array as Float32Array;

    let j = 0;

    const scale = this.scale;
    const defaultColour = new THREE.Color("skyblue");
    const temporaryColour = new THREE.Color();

    for (let i = 0; i < particlesLength; i++) {
      const particle = particles[i];

      let x = (rotatingReferenceFrame.x - particle.position.x) * scale;
      let y = (rotatingReferenceFrame.y - particle.position.y) * scale;
      let z = (rotatingReferenceFrame.z - particle.position.z) * scale;

      positions[j] = x;
      positions[j + 1] = y;
      positions[j + 2] = z;

      const hsl = particle.hsl;
      const colour = hsl
        ? temporaryColour.setHSL(hsl[0] / 360, hsl[1] / 100, hsl[2] / 100)
        : defaultColour;
      colours[j] = colour.r;
      colours[j + 1] = colour.g;
      colours[j + 2] = colour.b;

      sizes[i] = particle.size ?? this.defaultSize;

      j += 3;
    }

    geometry.getAttribute("position").needsUpdate = true;
    geometry.getAttribute("color").needsUpdate = true;
    geometry.getAttribute("aSize").needsUpdate = true;
  }
}

export default Particles;
