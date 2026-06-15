import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  ChangeEvent,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import Dropdown from "../dropdown";
import Slider from "../slider";
import Button from "../button";
import Tooltip from "../tooltip";
import Tabs from "../tabs";
import Toggle from "../toggle";
import { modifyScenarioProperty } from "../../state/creators";
import {
  control,
  controlLabel,
  controlInput,
  controlsGrid,
  controlFullWidth,
} from "../../theme/controls.module.css";
import {
  addMassControlTabsMenuModifier,
  addMassControlTabsMenuItemModifier,
  typeOption,
  typeOptionSelected,
  typeSelector,
} from "./add-mass-controls.module.css";
import { ScenarioStateType } from "../../state/index";
import massesData from "../../physics/masses";
import massTemplates from "../../physics/mass-templates";
import { keplerToState } from "../../physics/utils/elements";
import { degreesToRadians, radiansToDegrees } from "../../physics/utils/misc";
import { MassToBeAddedType } from "../../types/scenario";
import { ElementsType } from "../../types/physics";

const DEFAULT_ELEMENTS: ElementsType = {
  a: 1,
  e: 0,
  i: 0,
  argP: 0,
  lAn: 0,
  eccAnom: 0,
};

const DEFAULT_MASS_TO_BE_ADDED: MassToBeAddedType = {
  name: "",
  type: "other",
  primary: "",
  m: 1,
  unitName: "Earth Units",
  unitMassQuantity: 3.003e-6,
  elements: DEFAULT_ELEMENTS,
  isBeingAdded: false,
};

const resolveUniqueName = (
  desiredName: string,
  existingNames: string[],
): string => {
  const base = desiredName.trim() || "Custom Mass";

  if (!existingNames.includes(base)) {
    return base;
  }

  let counter = 1;

  while (existingNames.includes(`${base} ${counter}`)) {
    counter++;
  }

  return `${base} ${counter}`;
};

const AddMassControls = () => {
  const dispatch = useDispatch();

  const [useTemplate, setUseTemplate] = useState(false);
  const [templateCategoryName, setTemplateCategoryName] = useState(
    massTemplates[1].name,
  );
  const [templateName, setTemplateName] = useState(
    massTemplates[1].templates[2].name,
  );

  const selectedTemplateCategory = massTemplates.find(
    (category) => category.name === templateCategoryName,
  )!;
  const selectedTemplate =
    selectedTemplateCategory.templates.find(
      (template) => template.name === templateName,
    ) ?? selectedTemplateCategory.templates[0];

  const {
    camera,
    masses,
    integrator,
    massToBeAdded: massToBeAddedRaw,
  } = useSelector((state: ScenarioStateType) => {
    const { camera, masses, integrator, massToBeAdded } = state;

    return { camera, masses, integrator, massToBeAdded };
  });

  const defaultPrimary =
    masses.find((mass) => mass.name === camera.cameraFocus)?.name ??
    masses[0]?.name ??
    "";

  const massToBeAdded: MassToBeAddedType = massToBeAddedRaw ?? {
    ...DEFAULT_MASS_TO_BE_ADDED,
    primary: defaultPrimary,
    elements: {
      ...DEFAULT_ELEMENTS,
      a: (camera.cameraDistanceToOrigoInAu ?? 2) / 2,
    },
  };

  const massToBeAddedRef = useRef(massToBeAdded);
  massToBeAddedRef.current = massToBeAdded;

  useEffect(() => {
    dispatch(
      modifyScenarioProperty({
        key: "massToBeAdded",
        value: { ...massToBeAddedRef.current, isBeingAdded: true },
      }),
    );

    return () => {
      dispatch(
        modifyScenarioProperty({
          key: "massToBeAdded",
          value: { ...massToBeAddedRef.current, isBeingAdded: false },
        }),
      );
    };
  }, []);

  const primaryMass = masses.find(
    (mass) => mass.name === massToBeAdded.primary,
  );
  const gm = integrator.g * (primaryMass?.m ?? 1);

  const onElementChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>, elementName: keyof ElementsType) => {
      let value: number;

      switch (elementName) {
        case "eccAnom":
        case "argP":
        case "i":
        case "lAn":
          value = degreesToRadians(parseFloat(event.target.value));
          break;
        default:
          value = parseFloat(event.target.value);
      }

      dispatch(
        modifyScenarioProperty({
          key: "massToBeAdded",
          value: {
            ...massToBeAddedRef.current,
            elements: {
              ...massToBeAddedRef.current.elements,
              [elementName]: value,
            },
          },
        }),
      );
    },
    [],
  );

  const addMassCallback = useCallback(() => {
    if (!primaryMass) {
      return;
    }

    const elements = massToBeAdded.elements;
    const stateVectors = keplerToState(elements, gm);

    const posRel = {
      x: -stateVectors.posRel.x,
      y: -stateVectors.posRel.z,
      z: stateVectors.posRel.y,
    };
    const velRel = {
      x: -stateVectors.velRel.x,
      y: -stateVectors.velRel.z,
      z: stateVectors.velRel.y,
    };

    const newName = resolveUniqueName(
      massToBeAdded.name,
      masses.map((mass) => mass.name),
    );

    let massProps: Record<string, unknown>;

    if (useTemplate) {
      massProps = {
        type: selectedTemplate.type,
        m: selectedTemplate.m,
        radius: selectedTemplate.radius,
        tilt: selectedTemplate.tilt,
        atmosphere: selectedTemplate.atmosphere ?? "",
        ...(selectedTemplate.temperature !== undefined
          ? { temperature: selectedTemplate.temperature }
          : {}),
        ...(selectedTemplate.nonStellarProceduralManifestation !== undefined
          ? {
              nonStellarProceduralManifestation:
                selectedTemplate.nonStellarProceduralManifestation,
            }
          : {}),
      };
    } else {
      const isstar = massToBeAdded.type === "star";
      massProps = {
        type: isstar ? "star" : "planet",
        m: massToBeAdded.m * massToBeAdded.unitMassQuantity,
        radius: isstar ? 10270 : 50,
        tilt: 0,
        atmosphere: "",
        ...(isstar ? { temperature: 5778 } : {}),
      };
    }

    const newMass = {
      name: newName,
      ...massProps,
      position: {
        x: primaryMass.position.x - posRel.x,
        y: primaryMass.position.y - posRel.y,
        z: primaryMass.position.z - posRel.z,
      },
      velocity: {
        x: primaryMass.velocity.x - velRel.x,
        y: primaryMass.velocity.y - velRel.y,
        z: primaryMass.velocity.z - velRel.z,
      },
      primary: {
        name: primaryMass.name,
        gm,
        position: primaryMass.position,
        velocity: primaryMass.velocity,
      },
      elements,
      graphics: {
        orbit: true,
        trail: false,
        label: true,
      },
    };

    dispatch(
      modifyScenarioProperty({
        key: "masses",
        value: [...masses, newMass],
      }),
    );
  }, [masses, massToBeAdded, primaryMass, gm, useTemplate, selectedTemplate]);

  if (!masses.length) {
    return (
      <div className={controlsGrid}>
        <h2>Add Mass</h2>
        <p>There are no masses to orbit.</p>
      </div>
    );
  }

  return (
    <div className={controlsGrid}>
      <h2>Add Mass</h2>

      <div className={control}>
        <div className={controlLabel}>
          <label>Name</label>
          <Tooltip text="Name for the new mass. Defaults to 'Custom Mass' if left blank." />
        </div>
        <div className={controlInput}>
          <input
            type="text"
            placeholder="Custom Mass"
            value={massToBeAdded.name}
            onChange={(event) => {
              dispatch(
                modifyScenarioProperty({
                  key: "massToBeAdded",
                  value: { ...massToBeAdded, name: event.target.value },
                }),
              );
            }}
          />
        </div>
      </div>

      <div className={control}>
        <div className={controlLabel}>
          <label>Primary</label>
          <Tooltip text="The body this new mass will orbit." />
        </div>
        <div className={controlInput}>
          <Dropdown selectedOption={massToBeAdded.primary}>
            {masses.map((mass) => (
              <div
                key={mass.name}
                onClick={() => {
                  dispatch(
                    modifyScenarioProperty({
                      key: "massToBeAdded",
                      value: { ...massToBeAdded, primary: mass.name },
                    }),
                  );
                }}
              >
                {mass.name}
              </div>
            ))}
          </Dropdown>
        </div>
      </div>

      <div className={control}>
        <div className={controlLabel}>
          <label htmlFor="use-mass-template">Use a Template</label>
          <Tooltip text="Use a preset template to automatically set the mass, radius, and other properties of the new body." />
        </div>
        <div className={controlInput}>
          <Toggle
            checked={useTemplate}
            label="use-mass-template"
            callback={(e) => {
              setUseTemplate(e.target.checked);
            }}
          />
        </div>
      </div>

      <Tabs
        navigationMenuCssModifier={addMassControlTabsMenuModifier}
        navigationMenuItemCssModifier={addMassControlTabsMenuItemModifier}
        onOpenTabIndex={0}
      >
        <div data-label="Mass">
          {useTemplate ? (
            <>
              <div className={control}>
                <div className={controlLabel}>
                  <label>Category</label>
                  <Tooltip text="The category of mass template to choose from." />
                </div>
                <div className={controlInput}>
                  <Dropdown selectedOption={templateCategoryName}>
                    {massTemplates.map((category) => (
                      <div
                        key={category.name}
                        onClick={() => {
                          setTemplateCategoryName(category.name);
                          setTemplateName(category.templates[0].name);
                        }}
                      >
                        {category.name}
                      </div>
                    ))}
                  </Dropdown>
                </div>
              </div>

              <div className={control}>
                <div className={controlLabel}>
                  <label>Template</label>
                  <Tooltip text="The specific body whose properties will be applied to the new mass." />
                </div>
                <div className={controlInput}>
                  <Dropdown selectedOption={selectedTemplate.name}>
                    {selectedTemplateCategory.templates.map((template) => (
                      <div
                        key={template.name}
                        onClick={() => {
                          setTemplateName(template.name);
                        }}
                      >
                        {template.name}
                      </div>
                    ))}
                  </Dropdown>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={control}>
                <div className={controlLabel}>
                  <label>Type</label>
                  <Tooltip text="Whether the new body is a star or another type of mass." />
                </div>
                <div className={`${controlInput} ${typeSelector}`}>
                  <button
                    className={`${typeOption} ${
                      massToBeAdded.type === "other" ? typeOptionSelected : ""
                    }`}
                    onClick={() => {
                      dispatch(
                        modifyScenarioProperty({
                          key: "massToBeAdded",
                          value: { ...massToBeAdded, type: "other" },
                        }),
                      );
                    }}
                  >
                    Other
                  </button>
                  <button
                    className={`${typeOption} ${
                      massToBeAdded.type === "star" ? typeOptionSelected : ""
                    }`}
                    onClick={() => {
                      dispatch(
                        modifyScenarioProperty({
                          key: "massToBeAdded",
                          value: { ...massToBeAdded, type: "star" },
                        }),
                      );
                    }}
                  >
                    Star
                  </button>
                </div>
              </div>

              <div className={control}>
                <div className={controlLabel}>
                  <label>Mass Units</label>
                  <Tooltip text="Reference body used to express the mass value." />
                </div>
                <div className={controlInput}>
                  <Dropdown selectedOption={massToBeAdded.unitName}>
                    {massesData.map((massData) => (
                      <div
                        key={massData.unitName}
                        onClick={() => {
                          dispatch(
                            modifyScenarioProperty({
                              key: "massToBeAdded",
                              value: {
                                ...massToBeAdded,
                                unitMassQuantity: massData.m,
                                unitName: massData.unitName,
                              },
                            }),
                          );
                        }}
                      >
                        {massData.unitName}
                      </div>
                    ))}
                  </Dropdown>
                </div>
              </div>
              <div className={control}>
                <div className={controlLabel}>
                  <label>Mass</label>
                  <Tooltip text="Mass of the new body in multiples of the chosen reference body." />
                </div>
                <div className={controlInput}>
                  <Slider
                    min={0.1}
                    max={10}
                    step={0.1}
                    value={massToBeAdded.m}
                    onChange={(event) => {
                      dispatch(
                        modifyScenarioProperty({
                          key: "massToBeAdded",
                          value: {
                            ...massToBeAdded,
                            m: parseFloat(event.target.value),
                          },
                        }),
                      );
                    }}
                  />
                </div>
              </div>
            </>
          )}
          <div className={`${control} ${controlFullWidth}`}>
            <Button callback={addMassCallback}>Add Mass</Button>
          </div>
        </div>

        <div data-label="Orbital Elements">
          <div className={control}>
            <div className={controlLabel}>
              <label>Semi-major Axis</label>
              <Tooltip text="Average orbital distance from the primary, in AU." />
            </div>
            <div className={controlInput}>
              <Slider
                min={0}
                max={camera.cameraDistanceToOrigoInAu ?? 10}
                step={(camera.cameraDistanceToOrigoInAu ?? 10) / 200}
                value={massToBeAdded.elements.a}
                onChange={(event) => {
                  onElementChange(event, "a");
                }}
              />
            </div>
          </div>
          <div className={control}>
            <div className={controlLabel}>
              <label>Eccentricity</label>
              <Tooltip text="Shape of the orbit: 0 is a circle, values approaching 1 produce a highly elongated ellipse." />
            </div>
            <div className={controlInput}>
              <Slider
                min={0}
                max={5}
                step={0.001}
                value={massToBeAdded.elements.e}
                onChange={(event) => {
                  onElementChange(event, "e");
                }}
              />
            </div>
          </div>
          <div className={control}>
            <div className={controlLabel}>
              <label>Inclination</label>
              <Tooltip text="Tilt of the orbital plane relative to the reference plane, in degrees." />
            </div>
            <div className={controlInput}>
              <Slider
                min={0}
                max={180}
                step={0.1}
                value={radiansToDegrees(massToBeAdded.elements.i)}
                onChange={(event) => {
                  onElementChange(event, "i");
                }}
              />
            </div>
          </div>
          <div className={control}>
            <div className={controlLabel}>
              <label>Ascending Node</label>
              <Tooltip text="Longitude of the ascending node, in degrees." />
            </div>
            <div className={controlInput}>
              <Slider
                min={0}
                max={360}
                step={0.1}
                value={radiansToDegrees(massToBeAdded.elements.lAn)}
                onChange={(event) => {
                  onElementChange(event, "lAn");
                }}
              />
            </div>
          </div>
          <div className={control}>
            <div className={controlLabel}>
              <label>Argument of Periapsis</label>
              <Tooltip text="Angle between the ascending node and the orbit's closest point to the primary, in degrees." />
            </div>
            <div className={controlInput}>
              <Slider
                min={0}
                max={360}
                step={0.1}
                value={radiansToDegrees(massToBeAdded.elements.argP)}
                onChange={(event) => {
                  onElementChange(event, "argP");
                }}
              />
            </div>
          </div>
          <div className={control}>
            <div className={controlLabel}>
              <label>Eccentric Anomaly</label>
              <Tooltip text="Position of the body along its orbit, measured from periapsis, in degrees." />
            </div>
            <div className={controlInput}>
              <Slider
                min={-180}
                max={180}
                step={0.1}
                value={radiansToDegrees(massToBeAdded.elements.eccAnom)}
                onChange={(event) => {
                  onElementChange(event, "eccAnom");
                }}
              />
            </div>
          </div>
          <div className={`${control} ${controlFullWidth}`}>
            <Button callback={addMassCallback}>Add Mass</Button>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default AddMassControls;
