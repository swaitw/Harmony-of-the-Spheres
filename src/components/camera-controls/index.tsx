import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  ScenarioType,
  ScenarioCameraType,
  ScenarioMassesType,
} from "../../types/scenario";
import Dropdown from "../dropdown";
import { modifyScenarioProperty } from "../../state/creators";
import Tooltip from "../tooltip";
import {
  control,
  controlLabel,
  controlInput,
  controlsGrid,
} from "../../theme/controls.module.css";

const shouldSelectorNotRun = (
  prevState: { camera: ScenarioCameraType; masses: ScenarioMassesType },
  nextState: { camera: ScenarioCameraType; masses: ScenarioMassesType },
) => {
  if (
    prevState.camera.rotatingReferenceFrame !==
      nextState.camera.rotatingReferenceFrame ||
    prevState.camera.cameraFocus !== nextState.camera.cameraFocus ||
    prevState.masses.length !== nextState.masses.length
  ) {
    return false;
  }

  return true;
};

const CameraControls = () => {
  const dispatch = useDispatch();

  const { camera, masses } = useSelector((state: ScenarioType) => {
    const { camera, masses } = state;

    return { camera, masses };
  }, shouldSelectorNotRun);

  return (
    <div className={controlsGrid}>
      <h2>Camera</h2>
      <div className={control}>
        <div className={controlLabel}>
          <label>Rotating Reference Frame</label>
          <Tooltip text="The body the simulation co-rotates with. Choosing a body here makes orbital motion visible relative to that body." />
        </div>
        <div className={controlInput}>
          <Dropdown selectedOption={camera.rotatingReferenceFrame}>
            <div
              onClick={() =>
                dispatch(
                  modifyScenarioProperty({
                    key: "camera",
                    value: { ...camera, rotatingReferenceFrame: "Origo" },
                  }),
                )
              }
            >
              Origo
            </div>
            <div
              onClick={() =>
                dispatch(
                  modifyScenarioProperty({
                    key: "camera",
                    value: { ...camera, rotatingReferenceFrame: "Barycenter" },
                  }),
                )
              }
            >
              Barycenter
            </div>
            {masses.map((mass) => {
              return (
                <div
                  key={mass.name}
                  onClick={() =>
                    dispatch(
                      modifyScenarioProperty({
                        key: "camera",
                        value: { ...camera, rotatingReferenceFrame: mass.name },
                      }),
                    )
                  }
                >
                  {mass.name}
                </div>
              );
            })}
          </Dropdown>
        </div>
      </div>
      <div className={control}>
        <div className={controlLabel}>
          <label>Camera Focus</label>
          <Tooltip text="The body the camera tracks. The camera will orbit around and point toward this body." />
        </div>
        <div className={controlInput}>
          <Dropdown selectedOption={camera.cameraFocus}>
            <div
              onClick={() =>
                dispatch(
                  modifyScenarioProperty({
                    key: "camera",
                    value: { ...camera, cameraFocus: "Origo" },
                  }),
                )
              }
            >
              Origo
            </div>
            <div
              onClick={() =>
                dispatch(
                  modifyScenarioProperty({
                    key: "camera",
                    value: { ...camera, cameraFocus: "Barycenter" },
                  }),
                )
              }
            >
              Barycenter
            </div>
            {masses.map((mass) => {
              return (
                <div
                  key={mass.name}
                  onClick={() =>
                    dispatch(
                      modifyScenarioProperty({
                        key: "camera",
                        value: { ...camera, cameraFocus: mass.name },
                      }),
                    )
                  }
                >
                  {mass.name}
                </div>
              );
            })}
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default CameraControls;
