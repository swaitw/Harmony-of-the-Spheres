import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { ScenarioCameraType, ScenarioType } from "../types/scenario";
import { setScenario } from "../state/creators";
import { computeDefaultCameraPositionOnScenarioStartVector } from "../utils/default-camera-position";

const useHydrateStore = (scenario: ScenarioType): ScenarioType | null => {
  const dispatch = useDispatch();

  return useMemo(() => {
    if (scenario) {
      const processedMasses = scenario.masses.map((mass) => {
        return {
          ...mass,
          position: {
            ...mass.position,
            x: -mass.position.x,
            y: -mass.position.z,
            z: mass.position.y,
          },
          velocity: {
            ...mass.velocity,
            x: -mass.velocity.x,
            y: -mass.velocity.z,
            z: mass.velocity.y,
          },
        };
      });

      const defaultCameraPositionOnScenarioStart =
        scenario.camera.defaultCameraPositionOnScenarioStart ?? true;

      let camera: ScenarioCameraType = {
        ...scenario.camera,
        defaultCameraPositionOnScenarioStart,
      };

      if (defaultCameraPositionOnScenarioStart) {
        const defaultCameraPositionOnScenarioStartVector =
          computeDefaultCameraPositionOnScenarioStartVector(
            processedMasses,
            scenario.camera.cameraFocus,
            scenario.barycenter.systemBarycenter,
            scenario.barycenter.barycenterMassOne,
            scenario.barycenter.barycenterMassTwo,
          );

        if (defaultCameraPositionOnScenarioStartVector) {
          camera = {
            ...camera,
            defaultCameraPositionOnScenarioStartVector,
          };
        }
      }

      const processedScenario = {
        ...scenario,
        camera,
        masses: processedMasses,
      };

      dispatch(setScenario(processedScenario));
      return processedScenario;
    }

    return null;
  }, [dispatch]);
};

export default useHydrateStore;
