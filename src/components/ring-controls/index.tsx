import React, { ChangeEvent, Fragment, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  ScenarioType,
  ScenarioCameraType,
  ScenarioMassesType,
  RingToBeAddedType,
  ParticlesConfigurationType,
} from "../../types/scenario";
import Dropdown from "../dropdown";
import Slider from "../slider";
import Button from "../button";
import { modifyScenarioProperty } from "../../state/creators";
import {
  control,
  controlLabel,
  controlInput,
} from "../../theme/controls.module.css";

const SCENE_SCALE = 2100000;

const DEFAULT_RING: RingToBeAddedType = {
  primary: "",
  a: 0,
  aInterval: 0,
  i: 0,
  lAn: 0,
  number: 1000,
  size: 0,
  ringsAreBeingAdded: false,
};

const shouldSelectorNotRun = (
  prevState: {
    camera: ScenarioCameraType;
    masses: ScenarioMassesType;
    ringToBeAdded: RingToBeAddedType;
  },
  nextState: {
    camera: ScenarioCameraType;
    masses: ScenarioMassesType;
    ringToBeAdded: RingToBeAddedType;
  },
) => {
  if (
    prevState.camera.cameraFocus !== nextState.camera.cameraFocus ||
    prevState.camera.cameraDistanceToOrigoInAu !==
      nextState.camera.cameraDistanceToOrigoInAu ||
    prevState.masses.length !== nextState.masses.length ||
    prevState.ringToBeAdded !== nextState.ringToBeAdded
  ) {
    return false;
  }

  return true;
};

const RingControls = () => {
  const dispatch = useDispatch();

  const {
    camera,
    masses,
    ringToBeAdded: ringToBeAddedRaw,
    particlesConfiguration,
  } = useSelector((state: ScenarioType) => {
    const { camera, masses, ringToBeAdded, particlesConfiguration } = state;

    return { camera, masses, ringToBeAdded, particlesConfiguration };
  }, shouldSelectorNotRun);

  const ringToBeAdded: RingToBeAddedType = ringToBeAddedRaw ?? {
    ...DEFAULT_RING,
    primary: camera.cameraFocus,
  };

  const ringToBeAddedRef = useRef(ringToBeAdded);
  ringToBeAddedRef.current = ringToBeAdded;

  useEffect(() => {
    dispatch(
      modifyScenarioProperty({
        key: "ringToBeAdded",
        value: { ...ringToBeAddedRef.current, ringsAreBeingAdded: true },
      }),
    );
    return () => {
      dispatch(
        modifyScenarioProperty({
          key: "ringToBeAdded",
          value: { ...ringToBeAddedRef.current, ringsAreBeingAdded: false },
        }),
      );
    };
  }, []);

  const primaryMass = masses.find((m) => m.name === camera.cameraFocus);
  const minA = primaryMass ? (1.1 * primaryMass.radius) / SCENE_SCALE : 0;
  const maxA = 0.5 * (camera.cameraDistanceToOrigoInAu ?? 0);
  const clampedMaxA = Math.max(minA, maxA);
  const aStep = clampedMaxA / 200 || 0.000001;

  const minSize = primaryMass ? primaryMass.radius / 50 : 0;
  const maxSize = primaryMass ? primaryMass.radius / 5 : 0;
  const sizeStep = (maxSize - minSize) / 200 || 0.001;
  const defaultSize = primaryMass ? primaryMass.radius / 15 : 0;
  const effectiveSize =
    ringToBeAdded.size === 0 ? defaultSize : ringToBeAdded.size;

  const clampedA = Math.max(minA, Math.min(clampedMaxA, ringToBeAdded.a));
  const maxInterval = Math.max(
    0,
    Math.min(clampedA - minA, clampedMaxA - clampedA),
  );
  const intervalStep = maxInterval / 200 || 0.0000001;

  const updateRing = (updates: Partial<RingToBeAddedType>) =>
    dispatch(
      modifyScenarioProperty({
        key: "ringToBeAdded",
        value: { ...ringToBeAdded, ...updates },
      }),
    );

  const onPrimaryChange = (name: string) => {
    dispatch(
      modifyScenarioProperty({
        key: "camera",
        value: { ...camera, cameraFocus: name },
      }),
    );
    updateRing({ primary: name });
  };

  const onAddRing = () => {
    const clampedInterval = Math.min(ringToBeAdded.aInterval, maxInterval);
    const minD = Math.max(minA, clampedA - clampedInterval);
    const maxD = Math.min(clampedMaxA, clampedA + clampedInterval);

    const newShape = {
      primary: ringToBeAdded.primary,
      type: "getRingParticle",
      flatLand: true,
      tilt: [ringToBeAdded.i, 0, ringToBeAdded.lAn] as [number, number, number],
      number: ringToBeAdded.number,
      minD,
      maxD,
      size: ringToBeAdded.size === 0 ? defaultSize : ringToBeAdded.size,
    };

    const existingConfig: ParticlesConfigurationType =
      particlesConfiguration ?? {
        max: 50000,
        softening: 0,
        size: 80,
        shapes: [],
      };

    dispatch(
      modifyScenarioProperty({
        key: "particlesConfiguration",
        value: {
          ...existingConfig,
          shapes: [...existingConfig.shapes, newShape],
        },
      }),
    );

    dispatch(
      modifyScenarioProperty({
        key: "ringToBeAdded",
        value: {
          ...DEFAULT_RING,
          primary: ringToBeAdded.primary,
        },
      }),
    );
  };

  return (
    <Fragment>
      <h2>Rings</h2>
      <div className={control}>
        <div className={controlLabel}>
          <label>Primary</label>
        </div>
        <div className={controlInput}>
          <Dropdown selectedOption={camera.cameraFocus}>
            {masses.map((mass) => (
              <div key={mass.name} onClick={() => onPrimaryChange(mass.name)}>
                {mass.name}
              </div>
            ))}
          </Dropdown>
        </div>
      </div>
      <div className={control}>
        <div className={controlLabel}>
          <label>Semi-major Axis</label>
        </div>
        <div className={controlInput}>
          <Slider
            min={minA}
            max={clampedMaxA}
            step={aStep}
            value={clampedA}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updateRing({ a: parseFloat(e.target.value) })
            }
          />
        </div>
      </div>
      <div className={control}>
        <div className={controlLabel}>
          <label>Semi-major Axis Interval</label>
        </div>
        <div className={controlInput}>
          <Slider
            min={0}
            max={maxInterval}
            step={intervalStep}
            value={Math.min(ringToBeAdded.aInterval, maxInterval)}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updateRing({ aInterval: parseFloat(e.target.value) })
            }
          />
        </div>
      </div>
      <div className={control}>
        <div className={controlLabel}>
          <label>Inclination</label>
        </div>
        <div className={controlInput}>
          <Slider
            min={0}
            max={180}
            step={0.1}
            value={ringToBeAdded.i}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updateRing({ i: parseFloat(e.target.value) })
            }
          />
        </div>
      </div>
      <div className={control}>
        <div className={controlLabel}>
          <label>Longitude of Ascending Node</label>
        </div>
        <div className={controlInput}>
          <Slider
            min={0}
            max={360}
            step={1}
            value={ringToBeAdded.lAn}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updateRing({ lAn: parseFloat(e.target.value) })
            }
          />
        </div>
      </div>
      <div className={control}>
        <div className={controlLabel}>
          <label>Particle Size</label>
        </div>
        <div className={controlInput}>
          <Slider
            min={minSize}
            max={maxSize}
            step={sizeStep}
            value={effectiveSize}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updateRing({ size: parseFloat(e.target.value) })
            }
          />
        </div>
      </div>
      <div className={control}>
        <div className={controlLabel}>
          <label>Number of Particles</label>
        </div>
        <div className={controlInput}>
          <Slider
            min={100}
            max={10000}
            step={100}
            value={ringToBeAdded.number}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updateRing({ number: parseInt(e.target.value, 10) })
            }
          />
        </div>
      </div>
      <Button callback={onAddRing}>Add Ring</Button>
    </Fragment>
  );
};

export default RingControls;
