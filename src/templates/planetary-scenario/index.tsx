import React, {
  Fragment,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useSelector, useDispatch } from "react-redux";

import { graphql, HeadProps, Link } from "gatsby";
import Seo from "../../components/seo";
import { ScenarioType } from "../../types/scenario";
import { ScenarioStateType } from "../../state";
import store from "../../state";
import useHydrateStore from "../../hooks/useHydrateStore";
import PlanetaryScene from "../../scene/scenes/planetary-scene";
import Tabs from "../../components/tabs";
import CameraControls from "../../components/camera-controls";
import IntegratorControls from "../../components/integrator-controls";
import MassControls from "../../components/mass-controls";
import GraphicsControls from "../../components/graphics-controls";
import BarycenterControls from "../../components/barycenter-controls";
import LagrangeControls from "../../components/lagrange-controls";
import RingControls from "../../components/ring-controls";
import AddMassControls from "../../components/add-mass-controls";
import Button from "../../components/button";
import SaveScenarioModal from "../../components/save-scenario-modal";
import SavedScenarioStorageFullModal from "../../components/saved-scenario-storage-full-modal";
import { modifyScenarioProperty, setScenario } from "../../state/creators";
import { getRendererDimensions } from "../../utils/renderer-utils";
import { saveScenario } from "../../utils/saved-scenarios-storage";
import useSavedScenarios from "../../hooks/useSavedScenarios";

import "../../theme/theme.css";

import {
  scenarioBackButton,
  planetaryScenarioFooter,
  playButtonModifier,
  resetButtonModifier,
  saveButtonModifier,
  simulationControlsTabs,
  simulationControlTab,
  simulationControlsContentWrapper,
  simulationControlsContentWrapperCloseButton,
  fullScreenCanvasElement,
  webglCanvas,
  labels2dCanvas,
} from "./simulation-controls/simulation-controls.module.css";
import {
  icon,
  bars,
  play,
  pause,
  rotateLeft,
  save,
} from "../../theme/icons.module.css";

type Props = {
  data?: {
    scenariosJson: {
      scenarios: { scenario: ScenarioType }[];
    };
  };
  originalScenario?: ScenarioType | null;
  pageContext?: {
    name: string;
  };
};

const shouldSelectorNotRun = (prevState: boolean, nextState: boolean) => {
  if (prevState !== nextState) {
    return false;
  }

  return true;
};

const Scenario = ({ data, originalScenario: savedOriginalScenario }: Props) => {
  const scenario = data?.scenariosJson?.scenarios?.[0]?.scenario ?? null;

  const hydratedOriginal = useHydrateStore(scenario as ScenarioType);
  const originalScenario = savedOriginalScenario ?? hydratedOriginal;

  const webGlCanvas = useRef<HTMLCanvasElement | null>(null);
  const labelsCanvas = useRef<HTMLCanvasElement | null>(null);
  const planetaryScene = useRef<PlanetaryScene | null>(null);

  const [selectedTabIndex, setSelectedTabIndex] = useState(-1);
  const [rendererDimensions, setRendererDimensions] = useState({
    width: 0,
    height: 0,
  });

  const [showSaveNameModal, setShowSaveNameModal] = useState(false);
  const [saveModalDefaultName, setSaveModalDefaultName] = useState("");
  const [showStorageFullModal, setShowStorageFullModal] = useState(false);
  const [pendingSaveName, setPendingSaveName] = useState<string | null>(null);
  const [nameExistsError, setNameExistsError] = useState(false);

  const dispatch = useDispatch();
  const savedScenarios = useSavedScenarios();

  const playing = useSelector((state: ScenarioStateType) => {
    const { playing } = state;

    return playing;
  }, shouldSelectorNotRun);

  const resizeRenderer = useCallback(() => {
    if (planetaryScene.current) {
      const [rendererWidthPx, rendererHeightPx] =
        getRendererDimensions(selectedTabIndex);

      planetaryScene.current.resizeRenderer(rendererWidthPx, rendererHeightPx);

      setRendererDimensions({
        width: rendererWidthPx,
        height: rendererHeightPx,
      });
    }
  }, [selectedTabIndex]);

  useEffect(() => {
    if (webGlCanvas.current && labelsCanvas.current) {
      planetaryScene.current = new PlanetaryScene(
        webGlCanvas.current,
        labelsCanvas.current,
      );
    }

    return () => {
      planetaryScene.current?.reset();
      planetaryScene.current = null;
    };
  }, []);

  useEffect(() => {
    window.addEventListener("resize", resizeRenderer, false);
    window.addEventListener("orientationchange", resizeRenderer, false);

    return () => {
      window.removeEventListener("resize", resizeRenderer, false);
      window.removeEventListener("orientationchange", resizeRenderer, false);
    };
  }, [resizeRenderer]);

  useEffect(() => {
    resizeRenderer();
  }, [selectedTabIndex, resizeRenderer]);

  const handlePlayButtonClick = () => {
    dispatch(modifyScenarioProperty({ key: "playing", value: !playing }));
  };

  const handleResetButtonClick = () => {
    if (originalScenario) {
      dispatch(setScenario(originalScenario));

      planetaryScene.current?.reset();
    }
  };

  const attemptSave = useCallback((name: string) => {
    const result = saveScenario(store.getState(), name);

    if (result.success) {
      setShowSaveNameModal(false);
      setShowStorageFullModal(false);
      setPendingSaveName(null);
      setNameExistsError(false);

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
  }, []);

  const handleSaveButtonClick = () => {
    setNameExistsError(false);

    setSaveModalDefaultName(store.getState().name);
    setShowSaveNameModal(true);
  };

  const handleSaveNameModalClose = () => {
    setShowSaveNameModal(false);
    setNameExistsError(false);

    setPendingSaveName(null);
  };

  const handleSaveNameSubmit = (name: string) => {
    attemptSave(name);
  };

  const handleStorageFullModalClose = () => {
    setShowStorageFullModal(false);

    setPendingSaveName(null);
  };

  const handleScenarioDeleted = () => {
    if (pendingSaveName) {
      attemptSave(pendingSaveName);
    }
  };

  const onTabIndexChangeCallback = (tabIndex: number) => {
    setSelectedTabIndex(tabIndex);
  };

  return (
    <Fragment>
      <Link
        to="/scenarios/all"
        className={scenarioBackButton}
        aria-label="Back to scenarios"
      >
        <i className={`${icon} ${bars}`} />
      </Link>
      <canvas
        className={`${fullScreenCanvasElement} ${webglCanvas}`}
        ref={webGlCanvas}
        style={{
          width: `${rendererDimensions.width}px`,
          height: `${rendererDimensions.height}px`,
        }}
      />
      <canvas
        className={`${fullScreenCanvasElement} ${labels2dCanvas}`}
        ref={labelsCanvas}
        style={{
          width: `${rendererDimensions.width}px`,
          height: `${rendererDimensions.height}px`,
        }}
      />
      <section className={planetaryScenarioFooter}>
        <Button
          callback={handlePlayButtonClick}
          cssModifier={playButtonModifier}
        >
          <i className={`${icon} ${playing ? pause : play}`} />
        </Button>
        <Button
          callback={handleResetButtonClick}
          cssModifier={resetButtonModifier}
        >
          <i className={`${icon} ${rotateLeft}`} />
        </Button>
        <Button
          callback={handleSaveButtonClick}
          cssModifier={saveButtonModifier}
        >
          <i className={`${icon} ${save}`} />
        </Button>
        <Tabs
          contentWrapperCssClassName={simulationControlsContentWrapper}
          contentWrapperCloseButtonCssClassName={
            simulationControlsContentWrapperCloseButton
          }
          navigationMenuCssModifier={simulationControlsTabs}
          navigationMenuItemCssModifier={simulationControlTab}
          closeButton
          animate
          onTabIndexChangeCallback={onTabIndexChangeCallback}
        >
          <div data-label="Integrator" data-icon="gear">
            <IntegratorControls />
          </div>
          <div data-label="Camera" data-icon="video">
            <CameraControls />
          </div>
          <div data-label="Masses" data-icon="globe">
            <MassControls />
          </div>
          <div data-label="Graphics" data-icon="palette">
            <GraphicsControls />
          </div>
          <div data-label="Barycenter" data-icon="crosshairs">
            <BarycenterControls />
          </div>
          <div data-label="Lagrange" data-icon="atom">
            <LagrangeControls />
          </div>
          <div data-label="Add Mass" data-icon="plus">
            <AddMassControls />
          </div>
          <div data-label="Rings" data-icon="ring">
            <RingControls />
          </div>
        </Tabs>
      </section>
      {showSaveNameModal && (
        <SaveScenarioModal
          defaultName={saveModalDefaultName}
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
    </Fragment>
  );
};

type ScenarioHeadData = {
  scenariosJson: {
    scenarios: {
      scenario: {
        name: string;
        description?: string;
        category: {
          name: string;
          subCategory: string | null;
        };
      };
    }[];
  };
};

export const Head = ({ data, location }: HeadProps<ScenarioHeadData>) => {
  const { name, description, category } =
    data.scenariosJson.scenarios[0].scenario;

  const categoryLabel = [category.name, category.subCategory]
    .filter(Boolean)
    .join(" › ");

  const metaDescription =
    description ??
    `Explore ${name} — an interactive 3D Newtonian gravity simulation in the ${categoryLabel} category.`;

  return (
    <Seo
      title={name}
      description={metaDescription}
      pathname={location.pathname}
    />
  );
};

const pageQuery = graphql`
  query ($scenarioName: String) {
    scenariosJson: allScenariosJson(filter: { name: { eq: $scenarioName } }) {
      scenarios: edges {
        scenario: node {
          name
          description
          playing
          isLoaded
          elapsedTime
          collisions
          category {
            name
            subCategory
          }
          camera {
            cameraFocus
            logarithmicDepthBuffer
            rotatingReferenceFrame
            customOrigoCameraPosition {
              x
              y
              z
            }
          }
          integrator {
            name
            dt
            minDt
            maxDt
            g
            useBarnesHut
            theta
            tol
            softeningConstant
          }
          barycenter {
            display
            systemBarycenter
            barycenterMassOne
            barycenterMassTwo
          }
          graphics {
            background
            orbits
            trails
            labels
            habitableZone
          }
          lagrangePoints {
            display
            selectedMassName
          }
          masses {
            name
            type
            m
            radius
            tilt
            temperature
            atmosphere
            elements {
              a
              e
              i
              argP
              lAn
              eccAnom
            }
            position {
              x
              y
              z
            }
            velocity {
              x
              y
              z
            }
            customMassCameraPosition {
              x
              y
              z
            }
            graphics {
              orbit
              trail
              label
            }
            nonStellarProceduralManifestation
          }
          particlesConfiguration {
            max
            softening
            size
            shapes {
              primary
              type
              flatLand
              tilt
              number
              minD
              maxD
            }
          }
          massBeingModified {
            name
            unitName
            unitMassQuantity
            m
          }
          ringToBeAdded {
            primary
            a
            aInterval
            i
            lAn
            number
            size
          }
        }
      }
    }
  }
`;

export default Scenario;

export { pageQuery };
