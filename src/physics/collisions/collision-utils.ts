import { ParticleType, VectorType } from "../../types/physics";
import { ScenarioMassType } from "../../types/scenario";
import H3 from "../utils/vector";

const getClosestPointOnSphere = (
  point: H3,
  radius: number,
  rotation: VectorType,
): H3 => {
  return point
    .normalise()
    .multiplyByScalar(radius)
    .rotate({ x: 1, y: 0, z: 0 }, -rotation.x)
    .rotate({ x: 0, y: 1, z: 0 }, -rotation.y)
    .rotate({ x: 0, y: 0, z: 1 }, -rotation.z);
};

const generateImpactParticles = (
  looser: ScenarioMassType,
  survivor: ScenarioMassType,
  g: number,
  scale: number,
  count: number,
): ParticleType[] => {
  const particles: ParticleType[] = [];

  const normal = new H3()
    .set({
      x: looser.position.x - survivor.position.x,
      y: looser.position.y - survivor.position.y,
      z: looser.position.z - survivor.position.z,
    })
    .normalise();

  const arbitrary: VectorType =
    Math.abs(normal.x) < 0.9 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 1, z: 0 };

  const tangentU = new H3().set(arbitrary).cross(normal).normalise();
  const tangentV = new H3().set(normal).cross(tangentU).normalise();

  const survivorRadiusAU = survivor.radius / scale;

  const escapeVelocity = Math.sqrt((2 * g * survivor.m) / survivorRadiusAU);

  const coneHalfAngle = Math.PI / 3;

  const boundCount = Math.floor(count * 0.75);

  for (let i = 0; i < count; i++) {
    const jitter = 1 + Math.random() * 0.02;
    const positionX =
      survivor.position.x + normal.x * survivorRadiusAU * jitter;
    const positionY =
      survivor.position.y + normal.y * survivorRadiusAU * jitter;
    const positionZ =
      survivor.position.z + normal.z * survivorRadiusAU * jitter;

    const cosMax = Math.cos(coneHalfAngle);
    const cosTheta = cosMax + Math.random() * (1 - cosMax);
    const phi = Math.random() * Math.PI * 2;
    const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);
    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);

    const dx =
      normal.x * cosTheta +
      tangentU.x * sinTheta * cosPhi +
      tangentV.x * sinTheta * sinPhi;
    const dy =
      normal.y * cosTheta +
      tangentU.y * sinTheta * cosPhi +
      tangentV.y * sinTheta * sinPhi;
    const dz =
      normal.z * cosTheta +
      tangentU.z * sinTheta * cosPhi +
      tangentV.z * sinTheta * sinPhi;

    const velocity =
      i < boundCount
        ? (0.1 + Math.random() * 0.9) * escapeVelocity
        : (1.0 + Math.random() * 1.5) * escapeVelocity;

    const hue = 15 + Math.random() * 30;
    const lightness = 55 + (velocity / escapeVelocity) * 20;

    particles.push({
      position: { x: positionX, y: positionY, z: positionZ },
      velocity: {
        x: survivor.velocity.x + dx * velocity,
        y: survivor.velocity.y + dy * velocity,
        z: survivor.velocity.z + dz * velocity,
      },
      hsl: [hue, 100, Math.min(lightness, 90)],
      lives: 10,
      size: survivor.radius / 15,
    });
  }

  return particles;
};

export { getClosestPointOnSphere, generateImpactParticles };
