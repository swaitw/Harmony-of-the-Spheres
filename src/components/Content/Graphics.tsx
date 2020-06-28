import React, { ReactElement, Fragment } from "react";
import { modifyScenarioProperty } from "../../state/creators/scenario";
import Dropdown from "../Dropdown";
import Tooltip from "../Tooltip";
import Toggle from "../Toggle";

interface GraphicsProps {
  modifyScenarioProperty: typeof modifyScenarioProperty;
  barycenter: boolean;
  trails: boolean;
  labels: boolean;
  habitableZone: boolean;
  masses: MassType[];
  rotatingReferenceFrame: string;
  cameraFocus: string;
}

export default ({
  modifyScenarioProperty,
  barycenter,
  trails,
  labels,
  habitableZone,
  masses,
  rotatingReferenceFrame,
  cameraFocus
}: GraphicsProps): ReactElement => (
  <Fragment>
    <h2>Graphics</h2>
    <label className="top">
      Rotating Reference Frame{" "}
      <Tooltip
        position="left"
        content="Specifying a rotating reference frames allows us to observe the universe unfold relative to a fixed point, for instance Earth. While Earth orbits the Sun regardless of the reference frame being considered, in a rotating reference frame, the sun, for example, will appear to orbit the Earth, which is fixed at the center of the coordinate system."
      />
    </label>
    <Dropdown
      selectedOption={rotatingReferenceFrame}
      dropdownWrapperCssClassName="tabs-dropdown-wrapper"
      selectedOptionCssClassName="selected-option"
      optionsWrapperCssClass="options"
    >
      <div
        data-name="Barycenter"
        key="Barycenter"
        onClick={() =>
          modifyScenarioProperty({
            key: "rotatingReferenceFrame",
            value: "Barycenter"
          })
        }
      >
        Barycenter
      </div>
      {masses?.map(mass => (
        <div
          data-name={mass.name}
          key={mass.name}
          onClick={() =>
            modifyScenarioProperty({
              key: "rotatingReferenceFrame",
              value: mass.name
            })
          }
        >
          {mass.name}
        </div>
      ))}
    </Dropdown>
    <label className="top">
      Camera Focus{" "}
      <Tooltip
        position="left"
        content="Select the focus of the camera, or in other words, what the camera should be looking at."
      />
    </label>
    <Dropdown
      selectedOption={cameraFocus}
      dropdownWrapperCssClassName="tabs-dropdown-wrapper"
      selectedOptionCssClassName="selected-option"
      optionsWrapperCssClass="options"
    >
      <div
        data-name="Barycenter"
        key="Barycenter"
        onClick={() =>
          modifyScenarioProperty({
            key: "cameraFocus",
            value: "Barycenter"
          })
        }
      >
        Barycenter
      </div>
      {masses?.map(mass => (
        <div
          data-name={mass.name}
          key={mass.name}
          onClick={() =>
            modifyScenarioProperty({
              key: "cameraFocus",
              value: mass.name
            })
          }
        >
          {mass.name}
        </div>
      ))}
    </Dropdown>
    <Toggle
      label="Barycenter"
      checked={barycenter}
      callback={() =>
        modifyScenarioProperty(
          {
            key: "barycenter",
            value: !barycenter
          },
          {
            key: "cameraFocus",
            value: !barycenter ? "Barycenter" : cameraFocus
          }
        )
      }
    />
    <Toggle
      label="Trails"
      checked={trails}
      callback={() =>
        modifyScenarioProperty({
          key: "trails",
          value: !trails
        })
      }
    />
    <Toggle
      label="Labels"
      checked={labels}
      callback={() =>
        modifyScenarioProperty({
          key: "labels",
          value: !labels
        })
      }
    />
    <Toggle
      label="Habitable Zone"
      checked={habitableZone}
      callback={() =>
        modifyScenarioProperty(
          {
            key: "habitableZone",
            value: !habitableZone
          },
          {
            key: "cameraFocus",
            value: !habitableZone ? "Habitable Zone" : cameraFocus
          }
        )
      }
    />
  </Fragment>
);
