import React, {
  Fragment,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useSelector, useDispatch } from "react-redux";

import { graphql } from "gatsby";
import { ScenarioType } from "../../types/scenario";
import { ScenarioStateType } from "../../state";
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
import Button from "../../components/button";
import { modifyScenarioProperty, setScenario } from "../../state/creators";
import { getRendererDimensions } from "../../utils/renderer-utils";

import {
  planetaryScenarioFooter,
  playButtonModifier,
  resetButtonModifier,
  simulationControlsTabs,
  simulationControlTab,
  simulationControlsContentWrapper,
  simulationControlsContentWrapperCloseButton,
  fullScreenCanvasElement,
  webglCanvas,
  labels2dCanvas,
} from "./simulation-controls/simulation-controls.module.css";

import "../../theme/theme.css";
import "../../assets/fontawesome/css/fontawesome.min.css";
import "../../assets/fontawesome/css/regular.min.css";
import "../../assets/fontawesome/css/solid.min.css";

type Props = {
  data: {
    scenariosJson: {
      scenarios: { scenario: ScenarioType }[];
    };
  };
  pageContext: {
    name: string;
  };
};

const shouldSelectorNotRun = (prevState: boolean, nextState: boolean) => {
  if (prevState !== nextState) {
    return false;
  }

  return true;
};

const Scenario = ({
  data: {
    scenariosJson: { scenarios },
  },
}: Props) => {
  const webGlCanvas = useRef<HTMLCanvasElement | null>(null);
  const labelsCanvas = useRef<HTMLCanvasElement | null>(null);

  const planetaryScene = useRef<PlanetaryScene | null>(null);

  const [selectedTabIndex, setSelectedTabIndex] = useState(-1);
  const [rendererDimensions, setRendererDimensions] = useState({
    width: 0,
    height: 0,
  });

  const scenario = scenarios[0].scenario;

  const originalScenario = useHydrateStore(scenario);
  const dispatch = useDispatch();

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
  }, []);

  useEffect(() => {
    window.addEventListener("resize", resizeRenderer, false);

    window.addEventListener("orientationchange", resizeRenderer, false);

    return () => {
      window.removeEventListener("resize", resizeRenderer, false);

      window.removeEventListener("orientationchange", resizeRenderer, false);
    };
  }, [selectedTabIndex]);

  const handlePlayButtonClick = () =>
    dispatch(modifyScenarioProperty({ key: "playing", value: !playing }));

  const handleResetButtonClick = () => {
    if (originalScenario) {
      dispatch(setScenario(originalScenario));

      planetaryScene.current?.reset();
    }
  };

  const onTabIndexChangeCallback = (selectedTabIndex: number) => {
    setSelectedTabIndex(selectedTabIndex);
  };

  useEffect(() => {
    resizeRenderer();
  }, [selectedTabIndex]);

  return (
    <Fragment>
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
          <i className={`fa-solid fa-${playing ? "pause" : "play"}`} />
        </Button>
        <Button
          callback={handleResetButtonClick}
          cssModifier={resetButtonModifier}
        >
          <i className="fa-solid fa-rotate-left" />
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
          <div data-label="Integrator" data-icon="fa-solid fa-gear">
            <IntegratorControls />
          </div>
          <div data-label="Camera" data-icon="fa-solid fa-video">
            <CameraControls />
          </div>
          <div data-label="Masses" data-icon="fa-solid fa-globe">
            <MassControls />
          </div>
          <div data-label="Graphics" data-icon="fa-solid fa-palette">
            <GraphicsControls />
          </div>
          <div data-label="Barycenter" data-icon="fa-solid fa-crosshairs">
            <BarycenterControls />
          </div>
          <div data-label="Lagrange" data-icon="fa-solid fa-atom">
            <LagrangeControls />
          </div>
          <div data-label="Add Mass" data-icon="fa-solid fa-plus"></div>
          <div data-label="Rings" data-icon="fa-solid fa-ring">
            <RingControls />
          </div>
        </Tabs>
      </section>
    </Fragment>
  );
};

export default Scenario;

export const pageQuery = graphql`
  query ($scenarioName: String) {
    scenariosJson: allScenariosJson(filter: { name: { eq: $scenarioName } }) {
      scenarios: edges {
        scenario: node {
          name
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
