import React, { Fragment, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ScenarioType } from "../../types/scenario";
import Toggle from "../toggle";
import Dropdown from "../dropdown";
import Tooltip from "../tooltip";
import {
  modifyScenarioProperty,
  modifyScenarioMassProperty,
} from "../../state/creators";
import {
  control,
  controlLabel,
  controlInput,
} from "../../theme/controls.module.css";

const GraphicsControls = () => {
  const dispatch = useDispatch();
  const [selectedMass, setSelectedMass] = useState("All");

  const { graphics, masses } = useSelector((state: ScenarioType) => {
    const { graphics, masses } = state;

    return { graphics, masses };
  });

  const currentMass = masses.find((mass) => mass.name === selectedMass);

  return (
    <Fragment>
      <h2>Graphics</h2>
      <div className={control}>
        <div className={controlLabel}>
          <label htmlFor="background">Background</label>
          <Tooltip text="Shows or hides the starfield backdrop." />
        </div>
        <div className={controlInput}>
          <Toggle
            checked={graphics.background}
            label="background"
            callback={() => {
              dispatch(
                modifyScenarioProperty({
                  key: "graphics",
                  value: { ...graphics, background: !graphics.background },
                }),
              );
            }}
          />
        </div>
      </div>
      <div className={control}>
        <div className={controlLabel}>
          <label>Mass</label>
          <Tooltip text="Target a specific body to configure its graphics individually, or choose 'All' to apply settings to every body." />
        </div>
        <div className={controlInput}>
          <Dropdown selectedOption={selectedMass}>
            <div onClick={() => setSelectedMass("All")}>All</div>
            {masses.map((mass) => {
              return (
                <div key={mass.name} onClick={() => setSelectedMass(mass.name)}>
                  {mass.name}
                </div>
              );
            })}
          </Dropdown>
        </div>
      </div>
      <div className={control}>
        <div className={controlLabel}>
          <label htmlFor="orbits">Orbits</label>
          <Tooltip text="Shows or hides the predicted orbital ellipses for bodies in the simulation." />
        </div>
        <div className={controlInput}>
          <Toggle
            checked={
              selectedMass === "All"
                ? graphics.orbits
                : currentMass?.graphics.orbit ?? false
            }
            label="orbits"
            callback={() => {
              if (selectedMass === "All") {
                const updatedMasses = masses.map((mass) => ({
                  ...mass,
                  graphics: { ...mass.graphics, orbit: !graphics.orbits },
                }));

                dispatch(
                  modifyScenarioProperty({
                    key: "masses",
                    value: updatedMasses,
                  }),
                );

                dispatch(
                  modifyScenarioProperty({
                    key: "graphics",
                    value: { ...graphics, orbits: !graphics.orbits },
                  }),
                );
              } else if (currentMass) {
                dispatch(
                  modifyScenarioMassProperty({
                    name: selectedMass,
                    key: "graphics",
                    value: {
                      ...currentMass.graphics,
                      orbit: !currentMass.graphics.orbit,
                    },
                  }),
                );
              }
            }}
          />
        </div>
      </div>
      <div className={control}>
        <div className={controlLabel}>
          <label htmlFor="trails">Trails</label>
          <Tooltip text="Shows or hides the motion trails that trace each body's recent path through space." />
        </div>
        <div className={controlInput}>
          <Toggle
            checked={
              selectedMass === "All"
                ? graphics.trails
                : currentMass?.graphics.trail ?? false
            }
            label="trails"
            callback={() => {
              if (selectedMass === "All") {
                const updatedMasses = masses.map((mass) => ({
                  ...mass,
                  graphics: { ...mass.graphics, trail: !graphics.trails },
                }));

                dispatch(
                  modifyScenarioProperty({
                    key: "masses",
                    value: updatedMasses,
                  }),
                );

                dispatch(
                  modifyScenarioProperty({
                    key: "graphics",
                    value: { ...graphics, trails: !graphics.trails },
                  }),
                );
              } else if (currentMass) {
                dispatch(
                  modifyScenarioMassProperty({
                    name: selectedMass,
                    key: "graphics",
                    value: {
                      ...currentMass.graphics,
                      trail: !currentMass.graphics.trail,
                    },
                  }),
                );
              }
            }}
          />
        </div>
      </div>
      <div className={control}>
        <div className={controlLabel}>
          <label htmlFor="labels">Labels</label>
          <Tooltip text="Shows or hides the name labels displayed next to each body." />
        </div>
        <div className={controlInput}>
          <Toggle
            checked={
              selectedMass === "All"
                ? graphics.labels
                : currentMass?.graphics.label ?? false
            }
            label="labels"
            callback={() => {
              if (selectedMass === "All") {
                const updatedMasses = masses.map((mass) => ({
                  ...mass,
                  graphics: { ...mass.graphics, label: !graphics.labels },
                }));

                dispatch(
                  modifyScenarioProperty({
                    key: "masses",
                    value: updatedMasses,
                  }),
                );

                dispatch(
                  modifyScenarioProperty({
                    key: "graphics",
                    value: { ...graphics, labels: !graphics.labels },
                  }),
                );
              } else if (currentMass) {
                dispatch(
                  modifyScenarioMassProperty({
                    name: selectedMass,
                    key: "graphics",
                    value: {
                      ...currentMass.graphics,
                      label: !currentMass.graphics.label,
                    },
                  }),
                );
              }
            }}
          />
        </div>
      </div>
    </Fragment>
  );
};

export default GraphicsControls;
