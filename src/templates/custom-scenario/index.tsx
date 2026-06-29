import React, { ChangeEvent, useCallback, useMemo, useState } from "react";
import { graphql, HeadProps, Link, navigate } from "gatsby";

import Seo from "../../components/seo";
import Layout from "../../components/layout";
import AdSlot from "../../components/ad-slot";
import NavigationMenu from "../../components/navigation-menu";
import NavigationMenuItem from "../../components/navigation-menu/navigation-menu-item";
import Dropdown from "../../components/dropdown";
import Slider from "../../components/slider";
import Toggle from "../../components/toggle";
import Tooltip from "../../components/tooltip";
import Button from "../../components/button";
import SaveScenarioModal from "../../components/save-scenario-modal";
import SavedScenarioStorageFullModal from "../../components/saved-scenario-storage-full-modal";
import useSavedScenarios from "../../hooks/useSavedScenarios";
import { integrators } from "../../physics/integrators";
import { getMainSequenceStarProperties } from "../../physics/utils/stellar";
import { kebabCase } from "../../utils/text-utils";
import {
  buildScenarioFromCustomForm,
  createDefaultCustomScenarioForm,
  storePendingCustomScenario,
} from "../../utils/custom-scenario";
import { saveScenario } from "../../utils/saved-scenarios-storage";
import { ScenariosCategoryTreeType } from "../../types/category";
import { CustomScenarioFormConfig } from "../../types/custom-scenario";
import {
  control,
  controlLabel,
  controlInput,
  controlsGrid,
} from "../../theme/controls.module.css";
import {
  scenariosMenuWrapper,
  navigationMenuCssModifier,
  scenariosMenuItem,
} from "../scenarios-menu/scenarios-menu.module.css";
import CollapsibleSection from "../../components/collapsible-section";
import {
  customScenarioPage,
  customScenarioIntro,
  customScenarioSectionStatic,
  customScenarioActions,
  customScenarioSaveOption,
  customScenarioSaveLabel,
  customScenarioTextInput,
  customScenarioError,
  customScenarioLoadButton,
} from "./custom-scenario.module.css";

type Props = {
  data: {
    categoryTree: ScenariosCategoryTreeType;
  };
};

const SavedScenariosNavigationItem = () => {
  const savedScenarios = useSavedScenarios();

  if (savedScenarios.length === 0) {
    return null;
  }

  return (
    <Link to="/scenarios/saved">
      <NavigationMenuItem active={false} cssModifier={scenariosMenuItem}>
        Saved Scenarios
      </NavigationMenuItem>
    </Link>
  );
};

type SectionId = "star" | "integrator" | "graphics" | "particles";

const CustomScenario = ({ data: { categoryTree } }: Props) => {
  const [formConfig, setFormConfig] = useState(createDefaultCustomScenarioForm);
  const [openSections, setOpenSections] = useState<Record<SectionId, boolean>>({
    star: false,
    integrator: false,
    graphics: false,
    particles: false,
  });
  const [saveBeforeLoad, setSaveBeforeLoad] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showSaveNameModal, setShowSaveNameModal] = useState(false);
  const [showStorageFullModal, setShowStorageFullModal] = useState(false);
  const [pendingScenario, setPendingScenario] = useState<ReturnType<
    typeof buildScenarioFromCustomForm
  > | null>(null);
  const [pendingSaveName, setPendingSaveName] = useState<string | null>(null);
  const [nameExistsError, setNameExistsError] = useState(false);

  const savedScenarios = useSavedScenarios();

  const starProperties = useMemo(() => {
    return getMainSequenceStarProperties(formConfig.star.m);
  }, [formConfig.star.m]);

  const updateFormConfig = useCallback(
    (updates: Partial<CustomScenarioFormConfig>) => {
      setFormConfig((previousConfig) => ({ ...previousConfig, ...updates }));
    },
    [],
  );

  const toggleSection = useCallback((sectionId: SectionId) => {
    setOpenSections((previousSections) => ({
      ...previousSections,
      [sectionId]: !previousSections[sectionId],
    }));
  }, []);

  const loadScenario = useCallback(
    (scenario: ReturnType<typeof buildScenarioFromCustomForm>) => {
      storePendingCustomScenario(scenario);
      navigate("/scenarios/custom-scenario/run");
    },
    [],
  );

  const attemptSave = useCallback(
    (
      scenario: ReturnType<typeof buildScenarioFromCustomForm>,
      name: string,
    ) => {
      const result = saveScenario(scenario, name);

      if (result.success) {
        setShowSaveNameModal(false);
        setShowStorageFullModal(false);
        setPendingSaveName(null);
        setNameExistsError(false);
        loadScenario({ ...scenario, name: name.trim() });

        return;
      }

      if (result.error === "NAME_EXISTS") {
        setShowStorageFullModal(false);
        setShowSaveNameModal(true);
        setNameExistsError(true);

        return;
      }

      setPendingSaveName(name);
      setShowSaveNameModal(false);
      setShowStorageFullModal(true);
    },
    [loadScenario],
  );

  const handleLoadClick = () => {
    const trimmedScenarioName = formConfig.name.trim();
    const trimmedStarName = formConfig.star.name.trim();

    if (!trimmedScenarioName) {
      setValidationError("Please enter a scenario name.");

      return;
    }

    if (!trimmedStarName) {
      setValidationError("Please enter a name for the star.");

      return;
    }

    setValidationError(null);

    const scenario = buildScenarioFromCustomForm(formConfig);

    if (saveBeforeLoad) {
      setPendingScenario(scenario);
      setNameExistsError(false);
      setShowSaveNameModal(true);

      return;
    }

    loadScenario(scenario);
  };

  const handleSaveNameSubmit = (name: string) => {
    if (pendingScenario) {
      attemptSave(pendingScenario, name);
    }
  };

  const handleSaveNameModalClose = () => {
    setShowSaveNameModal(false);
    setNameExistsError(false);
    setPendingSaveName(null);
  };

  const handleStorageFullModalClose = () => {
    setShowStorageFullModal(false);
    setPendingSaveName(null);
  };

  const handleScenarioDeleted = () => {
    if (pendingScenario && pendingSaveName) {
      attemptSave(pendingScenario, pendingSaveName);
    }
  };

  return (
    <Layout currentPage="scenarios">
      <section className={scenariosMenuWrapper}>
        <NavigationMenu cssModifier={navigationMenuCssModifier}>
          <Link to="/scenarios/all">
            <NavigationMenuItem active={false} cssModifier={scenariosMenuItem}>
              All
            </NavigationMenuItem>
          </Link>
          {categoryTree.map((categoryBranch) => (
            <Link
              key={categoryBranch.name}
              to={`/scenarios/${kebabCase(categoryBranch.name)}${
                categoryBranch.subCategories.length ? "/all" : ""
              }`}
            >
              <NavigationMenuItem
                active={false}
                cssModifier={scenariosMenuItem}
              >
                {categoryBranch.name}
              </NavigationMenuItem>
            </Link>
          ))}
          <Link to="/scenarios/custom-scenario">
            <NavigationMenuItem active cssModifier={scenariosMenuItem}>
              Create Scenario
            </NavigationMenuItem>
          </Link>
          <SavedScenariosNavigationItem />
        </NavigationMenu>
      </section>

      <AdSlot variant="banner" name="custom-scenario-top" />

      <div className={customScenarioPage}>
        <h1>Create Custom Scenario</h1>
        <p className={customScenarioIntro}>
          Configure your scenario settings and add a central star. Once loaded,
          you can add planets, moons, and particle rings from the simulation
          controls.
        </p>

        <section className={`${customScenarioSectionStatic} ${controlsGrid}`}>
          <h2>General</h2>
          <div className={control}>
            <div className={controlLabel}>
              <label htmlFor="scenario-name">Scenario Name</label>
              <Tooltip text="The display name for your scenario." />
            </div>
            <div className={controlInput}>
              <input
                id="scenario-name"
                className={customScenarioTextInput}
                type="text"
                value={formConfig.name}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  updateFormConfig({ name: event.target.value });
                }}
              />
            </div>
          </div>
        </section>

        <CollapsibleSection
          title="Star"
          isOpen={openSections.star}
          onToggle={() => {
            toggleSection("star");
          }}
          contentClassName={controlsGrid}
        >
          <div className={control}>
            <div className={controlLabel}>
              <label htmlFor="star-name">Name</label>
              <Tooltip text="The central star of your system. Its position and velocity are fixed at the origin." />
            </div>
            <div className={controlInput}>
              <input
                id="star-name"
                className={customScenarioTextInput}
                type="text"
                value={formConfig.star.name}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  updateFormConfig({
                    star: { ...formConfig.star, name: event.target.value },
                  });
                }}
              />
            </div>
          </div>
          <div className={control}>
            <div className={controlLabel}>
              <label>Mass</label>
              <Tooltip text="Mass in solar units. Radius and temperature are derived from the main-sequence mass–luminosity relation." />
            </div>
            <div className={controlInput}>
              <Slider
                min={0.01}
                max={100}
                step={0.01}
                value={formConfig.star.m}
                onChange={(event) => {
                  updateFormConfig({
                    star: {
                      ...formConfig.star,
                      m: parseFloat(event.target.value),
                    },
                  });
                }}
              />
            </div>
          </div>
          <div className={control}>
            <div className={controlLabel}>
              <label>Radius</label>
              <Tooltip text="Derived from the star's mass using a main-sequence radius relation." />
            </div>
            <div className={controlInput}>
              <span>{Math.round(starProperties.radiusDisplay)}</span>
            </div>
          </div>
          <div className={control}>
            <div className={controlLabel}>
              <label>Temperature</label>
              <Tooltip text="Derived from the star's mass via the mass–luminosity relation and Stefan–Boltzmann law." />
            </div>
            <div className={controlInput}>
              <span>{Math.round(starProperties.temperatureKelvin)} K</span>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Integrator"
          isOpen={openSections.integrator}
          onToggle={() => {
            toggleSection("integrator");
          }}
          contentClassName={controlsGrid}
        >
          <div className={control}>
            <div className={controlLabel}>
              <label>Integrator</label>
              <Tooltip text="The numerical method used to compute gravitational interactions each step." />
            </div>
            <div className={controlInput}>
              <Dropdown selectedOption={formConfig.integrator.name}>
                {integrators.map((integratorName) => (
                  <div
                    key={integratorName}
                    onClick={() => {
                      updateFormConfig({
                        integrator: {
                          ...formConfig.integrator,
                          name: integratorName,
                        },
                      });
                    }}
                  >
                    {integratorName}
                  </div>
                ))}
              </Dropdown>
            </div>
          </div>
          <div className={control}>
            <div className={controlLabel}>
              <label>Gravitational Constant</label>
              <Tooltip text="Scales the strength of gravity." />
            </div>
            <div className={controlInput}>
              <Slider
                min={-200}
                max={200}
                step={0.5}
                value={formConfig.integrator.g}
                onChange={(event) => {
                  updateFormConfig({
                    integrator: {
                      ...formConfig.integrator,
                      g: parseFloat(event.target.value),
                    },
                  });
                }}
              />
            </div>
          </div>
          <div className={control}>
            <div className={controlLabel}>
              <label>Time Step</label>
              <Tooltip text="Duration of each simulation step." />
            </div>
            <div className={controlInput}>
              <Slider
                min={formConfig.integrator.minDt}
                max={formConfig.integrator.maxDt}
                step={0.00001}
                value={formConfig.integrator.dt}
                onChange={(event) => {
                  updateFormConfig({
                    integrator: {
                      ...formConfig.integrator,
                      dt: parseFloat(event.target.value),
                    },
                  });
                }}
              />
            </div>
          </div>
          <div className={control}>
            <div className={controlLabel}>
              <label>Softening Constant</label>
              <Tooltip text="Limits gravitational force at very close distances." />
            </div>
            <div className={controlInput}>
              <Slider
                min={0}
                max={10}
                step={0.001}
                value={formConfig.integrator.softeningConstant}
                onChange={(event) => {
                  updateFormConfig({
                    integrator: {
                      ...formConfig.integrator,
                      softeningConstant: parseFloat(event.target.value),
                    },
                  });
                }}
              />
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Graphics"
          isOpen={openSections.graphics}
          onToggle={() => {
            toggleSection("graphics");
          }}
          contentClassName={controlsGrid}
        >
          {(
            [
              [
                "background",
                "Background",
                "Shows or hides the starfield backdrop.",
              ],
              ["orbits", "Orbits", "Shows predicted orbital ellipses."],
              [
                "habitableZone",
                "Habitable Zone",
                "Shows the habitable zone around stars.",
              ],
              ["trails", "Trails", "Shows motion trails behind bodies."],
              ["labels", "Labels", "Shows name labels on bodies."],
            ] as const
          ).map(([key, label, tooltipText]) => (
            <div className={control} key={key}>
              <div className={controlLabel}>
                <label htmlFor={key}>{label}</label>
                <Tooltip text={tooltipText} />
              </div>
              <div className={controlInput}>
                <Toggle
                  checked={formConfig.graphics[key]}
                  label={key}
                  callback={() => {
                    updateFormConfig({
                      graphics: {
                        ...formConfig.graphics,
                        [key]: !formConfig.graphics[key],
                      },
                    });
                  }}
                />
              </div>
            </div>
          ))}
        </CollapsibleSection>

        <CollapsibleSection
          title="Particles"
          isOpen={openSections.particles}
          onToggle={() => {
            toggleSection("particles");
          }}
          contentClassName={controlsGrid}
        >
          <div className={control}>
            <div className={controlLabel}>
              <label>Maximum Particles</label>
              <Tooltip text="Upper limit on the number of ring particles in the simulation." />
            </div>
            <div className={controlInput}>
              <Slider
                min={1000}
                max={100000}
                step={1000}
                value={formConfig.particlesConfiguration.max}
                onChange={(event) => {
                  updateFormConfig({
                    particlesConfiguration: {
                      ...formConfig.particlesConfiguration,
                      max: parseFloat(event.target.value),
                    },
                  });
                }}
              />
            </div>
          </div>
          <div className={control}>
            <div className={controlLabel}>
              <label>Softening</label>
              <Tooltip text="Softening applied to particle gravity calculations." />
            </div>
            <div className={controlInput}>
              <Slider
                min={0}
                max={10}
                step={0.001}
                value={formConfig.particlesConfiguration.softening}
                onChange={(event) => {
                  updateFormConfig({
                    particlesConfiguration: {
                      ...formConfig.particlesConfiguration,
                      softening: parseFloat(event.target.value),
                    },
                  });
                }}
              />
            </div>
          </div>
          <div className={control}>
            <div className={controlLabel}>
              <label>Particle Size</label>
              <Tooltip text="Default visual size for particles." />
            </div>
            <div className={controlInput}>
              <Slider
                min={10}
                max={200}
                step={1}
                value={formConfig.particlesConfiguration.size}
                onChange={(event) => {
                  updateFormConfig({
                    particlesConfiguration: {
                      ...formConfig.particlesConfiguration,
                      size: parseFloat(event.target.value),
                    },
                  });
                }}
              />
            </div>
          </div>
        </CollapsibleSection>

        <div className={customScenarioActions}>
          <div className={customScenarioSaveOption}>
            <span className={customScenarioSaveLabel}>
              Save scenario before loading
            </span>
            <Toggle
              checked={saveBeforeLoad}
              label="save-before-load"
              callback={() => {
                setSaveBeforeLoad((previousValue) => !previousValue);
              }}
            />
          </div>
          {validationError && (
            <p className={customScenarioError}>{validationError}</p>
          )}
          <Button
            callback={handleLoadClick}
            cssModifier={customScenarioLoadButton}
          >
            Load Scenario
          </Button>
        </div>
      </div>

      <AdSlot variant="rectangle" name="custom-scenario-bottom" />

      {showSaveNameModal && pendingScenario && (
        <SaveScenarioModal
          defaultName={pendingScenario.name}
          onClose={handleSaveNameModalClose}
          onSave={handleSaveNameSubmit}
          nameExistsError={nameExistsError}
          onClearNameExistsError={() => {
            setNameExistsError(false);
          }}
        />
      )}
      {showStorageFullModal && (
        <SavedScenarioStorageFullModal
          savedScenarios={savedScenarios}
          onClose={handleStorageFullModalClose}
          onScenarioDeleted={handleScenarioDeleted}
        />
      )}
    </Layout>
  );
};

export const Head = ({ location }: HeadProps) => {
  return (
    <Seo
      title="Create Custom Scenario"
      description="Configure and create your own gravity simulation scenario from scratch."
      pathname={location.pathname}
    />
  );
};

const pageQuery = graphql`
  {
    categoryTree {
      name
      subCategories
    }
  }
`;

export default CustomScenario;

export { pageQuery };
