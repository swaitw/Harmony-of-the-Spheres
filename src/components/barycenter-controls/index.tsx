import React, { Fragment } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ScenarioType } from "../../types/scenario";
import Toggle from "../toggle";
import Dropdown from "../dropdown";
import { modifyScenarioProperty } from "../../state/creators";
import {
  control,
  controlLabel,
  controlInput,
} from "../../theme/controls.module.css";

const BarycenterControls = () => {
  const dispatch = useDispatch();

  const { barycenter, masses } = useSelector((state: ScenarioType) => {
    const { barycenter, masses } = state;

    return { barycenter, masses };
  });

  return (
    <Fragment>
      <h2>Barycenter</h2>
      <div className={control}>
        <div className={controlLabel}>
          <label htmlFor="barycenter-label">Display Label</label>
        </div>
        <div className={controlInput}>
          <Toggle
            checked={barycenter.display}
            label="barycenter-label"
            callback={() =>
              dispatch(
                modifyScenarioProperty({
                  key: "barycenter",
                  value: { ...barycenter, display: !barycenter.display },
                }),
              )
            }
          />
        </div>
      </div>
      <div className={control}>
        <div className={controlLabel}>
          <label htmlFor="system-barycenter">System Barycenter</label>
        </div>
        <div className={controlInput}>
          <Toggle
            checked={barycenter.systemBarycenter}
            label="system-barycenter"
            callback={() =>
              dispatch(
                modifyScenarioProperty({
                  key: "barycenter",
                  value: {
                    ...barycenter,
                    systemBarycenter: !barycenter.systemBarycenter,
                  },
                }),
              )
            }
          />
        </div>
      </div>
      {!barycenter.systemBarycenter && (
        <Fragment>
          <div className={control}>
            <div className={controlLabel}>
              <label>Mass One</label>
            </div>
            <div className={controlInput}>
              <Dropdown selectedOption={barycenter.barycenterMassOne}>
                {masses.map((mass) => (
                  <div
                    key={mass.name}
                    onClick={() =>
                      dispatch(
                        modifyScenarioProperty({
                          key: "barycenter",
                          value: {
                            ...barycenter,
                            barycenterMassOne: mass.name,
                          },
                        }),
                      )
                    }>
                    {mass.name}
                  </div>
                ))}
              </Dropdown>
            </div>
          </div>
          <div className={control}>
            <div className={controlLabel}>
              <label>Mass Two</label>
            </div>
            <div className={controlInput}>
              <Dropdown selectedOption={barycenter.barycenterMassTwo}>
                {masses.map((mass) => (
                  <div
                    key={mass.name}
                    onClick={() =>
                      dispatch(
                        modifyScenarioProperty({
                          key: "barycenter",
                          value: {
                            ...barycenter,
                            barycenterMassTwo: mass.name,
                          },
                        }),
                      )
                    }>
                    {mass.name}
                  </div>
                ))}
              </Dropdown>
            </div>
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default BarycenterControls;
