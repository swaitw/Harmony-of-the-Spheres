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

const LagrangeControls = () => {
  const dispatch = useDispatch();

  const {
    masses,
    selectedMassName,
    displayLagrangePoints,
    hasPrimary,
    primaryName,
  } = useSelector((state: ScenarioType) => {
    const { masses, lagrangePoints } = state;

    const displayLagrangePoints = lagrangePoints?.display ?? false;

    const selectedMassName = lagrangePoints?.selectedMassName;
    const selectedMass = masses.find((mass) => mass.name === selectedMassName);
    const hasPrimary =
      selectedMass?.primary != null &&
      selectedMass.primary.name !== selectedMassName;

    let primaryName = null;

    if (hasPrimary) {
      primaryName = selectedMass!.primary.name;
    }

    return {
      masses,
      selectedMassName,
      displayLagrangePoints,
      hasPrimary,
      primaryName,
    };
  });

  return (
    <Fragment>
      <h2>Lagrange Points</h2>
      <div className={control}>
        <div className={controlLabel}>
          <label>Mass</label>
        </div>
        <div className={controlInput}>
          <Dropdown selectedOption={selectedMassName || "Select a mass"}>
            {masses.map((mass) => (
              <div
                key={mass.name}
                onClick={() =>
                  dispatch(
                    modifyScenarioProperty({
                      key: "lagrangePoints",
                      value: { selectedMassName: mass.name, display: false },
                    }),
                  )
                }>
                {mass.name}
              </div>
            ))}
          </Dropdown>
        </div>
      </div>
      {selectedMassName &&
        (hasPrimary ? (
          <Fragment>
            <div className={control}>
              <div className={controlLabel}>
                <label>Primary</label>
              </div>
              <div className={controlInput}>
                <span>{primaryName}</span>
              </div>
            </div>
            <div className={control}>
              <div className={controlLabel}>
                <label>Show Lagrange Points</label>
              </div>
              <div className={controlInput}>
                <Toggle
                  checked={displayLagrangePoints}
                  label="lagrange-points"
                  callback={() =>
                    dispatch(
                      modifyScenarioProperty({
                        key: "lagrangePoints",
                        value: {
                          selectedMassName,
                          display: !displayLagrangePoints,
                        },
                      }),
                    )
                  }
                />
              </div>
            </div>
          </Fragment>
        ) : (
          <p>
            {selectedMassName} has no primary, so it does not have any Lagrange
            points.
          </p>
        ))}
    </Fragment>
  );
};

export default LagrangeControls;
