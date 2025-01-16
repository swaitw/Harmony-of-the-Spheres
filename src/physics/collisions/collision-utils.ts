import { VectorType } from "../../types/physics";
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

export { getClosestPointOnSphere };
