import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { ScenarioType } from "../../types/scenario";
import Dropdown from "../dropdown";
import { modifyScenarioProperty } from "../../state/creators";
import { adaptiveIntegrators, integrators } from "../../physics/integrators";
import Slider from "../slider";
import Tooltip from "../tooltip";
import Toggle from "../toggle";
import {
  control,
  controlLabel,
  controlInput,
  controlsGrid,
} from "../../theme/controls.module.css";

const isAdaptiveIntegrator = (name: string) =>
  adaptiveIntegrators.includes(name as (typeof adaptiveIntegrators)[number]);

const formatTimeStep = (dt: number) => {
  if (dt === 0) {
    return "0";
  }

  if (Math.abs(dt) >= 1) {
    return dt.toFixed(4);
  }

  if (Math.abs(dt) >= 0.0001) {
    return dt.toFixed(6);
  }

  return dt.toExponential(2);
};

const IntegratorControls = () => {
  const dispatch = useDispatch();

  const integrator = useSelector((state: ScenarioType) => state.integrator);

  const adaptive = isAdaptiveIntegrator(integrator.name);

  return (
    <div className={controlsGrid}>
      <h2>Integrator</h2>
      <div className={control}>
        <div className={controlLabel}>
          <label>Integrator</label>
          <Tooltip text="The numerical method used to compute gravitational interactions each step. RK4 and PEFRL are more accurate but slower; Euler is faster on low-end devices. Changing integrators mid-simulation reduces accuracy." />
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
          <label>Use Barnes-Hut</label>
          <Tooltip text="Approximates distant masses as a single body to reduce computation. Higher theta values trade accuracy for speed." />
        </div>
        <div className={controlInput}>
          <Toggle
            label="Use Barnes-Hut"
            checked={integrator.useBarnesHut}
            callback={() =>
              dispatch(
                modifyScenarioProperty({
                  key: "integrator",
                  value: {
                    ...integrator,
                    useBarnesHut: !integrator.useBarnesHut,
                  },
                }),
              )
            }
          />
        </div>
      </div>
      {integrator.useBarnesHut && (
        <div className={control}>
          <div className={controlLabel}>
            <label>Barnes-Hut Theta</label>
            <Tooltip text="A value of zero compares every mass directly. Higher values group distant masses together, which is a reasonable approximation when they are far away." />
          </div>
          <div className={controlInput}>
            <Slider
              min={0}
              max={5}
              step={0.1}
              value={integrator.theta}
              onChange={(event) =>
                dispatch(
                  modifyScenarioProperty({
                    key: "integrator",
                    value: {
                      ...integrator,
                      theta: parseFloat(event.target.value),
                    },
                  }),
                )
              }
            />
          </div>
        </div>
      )}
      {!adaptive && (
        <div className={control}>
          <div className={controlLabel}>
            <label>Time Step</label>
            <Tooltip text="Duration of each simulation step. Smaller steps increase accuracy at the cost of simulation speed." />
          </div>
          <div className={controlInput}>
            <Slider
              min={integrator.minDt}
              max={integrator.maxDt}
              step={integrator.dt / 1000 || 0.00001}
              value={integrator.dt}
              onChange={(event) =>
                dispatch(
                  modifyScenarioProperty({
                    key: "integrator",
                    value: {
                      ...integrator,
                      dt: parseFloat(event.target.value),
                    },
                  }),
                )
              }
            />
          </div>
        </div>
      )}
      {adaptive && (
        <>
          <div className={control}>
            <div className={controlLabel}>
              <label>Current Time Step</label>
              <Tooltip text="Step size chosen by the adaptive integrator. It shrinks when accelerations spike (e.g. near periapsis) and grows again in calmer parts of the orbit." />
            </div>
            <div className={controlInput}>
              <span>
                {formatTimeStep(integrator.dt)} (range{" "}
                {formatTimeStep(integrator.minDt)} –{" "}
                {formatTimeStep(integrator.maxDt)})
              </span>
            </div>
          </div>
          <div className={control}>
            <div className={controlLabel}>
              <label>Error Tolerance</label>
              <Tooltip text="Target positional error per adaptive step. Lower values increase accuracy at the cost of smaller time steps." />
            </div>
            <div className={controlInput}>
              <Slider
                min={1e-9}
                max={0.1}
                step={1e-9}
                value={integrator.tol}
                onChange={(event) =>
                  dispatch(
                    modifyScenarioProperty({
                      key: "integrator",
                      value: {
                        ...integrator,
                        tol: parseFloat(event.target.value),
                      },
                    }),
                  )
                }
              />
            </div>
          </div>
          <div className={control}>
            <div className={controlLabel}>
              <label>Minimum Time Step</label>
              <Tooltip text="Smallest allowed adaptive time step." />
            </div>
            <div className={controlInput}>
              <Slider
                min={1e-12}
                max={integrator.maxDt}
                step={1e-12}
                value={integrator.minDt}
                onChange={(event) =>
                  dispatch(
                    modifyScenarioProperty({
                      key: "integrator",
                      value: {
                        ...integrator,
                        minDt: parseFloat(event.target.value),
                      },
                    }),
                  )
                }
              />
            </div>
          </div>
          <div className={control}>
            <div className={controlLabel}>
              <label>Maximum Time Step</label>
              <Tooltip text="Largest allowed adaptive time step." />
            </div>
            <div className={controlInput}>
              <Slider
                min={integrator.minDt}
                max={1}
                step={1e-9}
                value={integrator.maxDt}
                onChange={(event) =>
                  dispatch(
                    modifyScenarioProperty({
                      key: "integrator",
                      value: {
                        ...integrator,
                        maxDt: parseFloat(event.target.value),
                      },
                    }),
                  )
                }
              />
            </div>
          </div>
        </>
      )}
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
