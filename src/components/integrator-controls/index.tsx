import React, { memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ScenarioType } from "../../types/scenario";
import Dropdown from "../dropdown";
import { modifyScenarioProperty } from "../../state/creators";
import { integrators } from "../../physics/integrators";
import Slider from "../slider";
import Tooltip from "../tooltip";
import {
  control,
  controlLabel,
  controlInput,
  controlsGrid,
} from "../../theme/controls.module.css";

const IntegratorControls = () => {
  const dispatch = useDispatch();

  const { integrator } = useSelector((state: ScenarioType) => {
    const { integrator } = state;

    return { integrator };
  });

  return (
    <div className={controlsGrid}>
      <h2>Integrator</h2>
      <div className={control}>
        <div className={controlLabel}>
          <label>Integrator</label>
          <Tooltip text="The numerical method used to compute gravitational interactions each step. Different integrators trade accuracy for performance." />
        </div>
        <div className={controlInput}>
          <Dropdown selectedOption={integrator.name}>
            {integrators.map((integratorName) => {
              return (
                <div
                  key={integratorName}
                  onClick={() =>
                    dispatch(
                      modifyScenarioProperty({
                        key: "integrator",
                        value: { ...integrator, name: integratorName },
                      }),
                    )
                  }
                >
                  {integratorName}
                </div>
              );
            })}
          </Dropdown>
        </div>
      </div>
      <div className={control}>
        <div className={controlLabel}>
          <label>Gravitational Constant</label>
          <Tooltip text="Scales the strength of gravity. Negative values invert gravitational attraction into repulsion." />
        </div>
        <div className={controlInput}>
          <Slider
            min={-200}
            max={200}
            step={0.5}
            value={integrator.g}
            onChange={(event) =>
              dispatch(
                modifyScenarioProperty({
                  key: "integrator",
                  value: { ...integrator, g: parseFloat(event.target.value) },
                }),
              )
            }
          />
        </div>
      </div>
      <div className={control}>
        <div className={controlLabel}>
          <label>Time Step</label>
          <Tooltip text="Duration of each simulation step. Smaller steps increase accuracy at the cost of simulation speed." />
        </div>
        <div className={controlInput}>
          <Slider
            min={integrator.minDt}
            max={integrator.maxDt}
            step={0.00001}
            value={integrator.dt}
            onChange={(event) =>
              dispatch(
                modifyScenarioProperty({
                  key: "integrator",
                  value: { ...integrator, dt: parseFloat(event.target.value) },
                }),
              )
            }
          />
        </div>
      </div>
      <div className={control}>
        <div className={controlLabel}>
          <label>Softening Constant</label>
          <Tooltip text="Limits gravitational force at very close distances to prevent numerical instability when bodies pass near each other." />
        </div>
        <div className={controlInput}>
          <Slider
            min={0}
            max={10}
            step={0.001}
            value={integrator.softeningConstant}
            onChange={(event) =>
              dispatch(
                modifyScenarioProperty({
                  key: "integrator",
                  value: {
                    ...integrator,
                    softeningConstant: parseFloat(event.target.value),
                  },
                }),
              )
            }
          />
        </div>
      </div>
    </div>
  );
};

export default IntegratorControls;
