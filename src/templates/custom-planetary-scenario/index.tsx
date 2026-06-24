import React, { Fragment, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { HeadProps, Link } from "gatsby";

import Seo from "../../components/seo";
import Layout from "../../components/layout";
import { setScenario } from "../../state/creators";
import { getPendingCustomScenario } from "../../utils/custom-scenario";
import { ScenarioType } from "../../types/scenario";
import Scenario from "../planetary-scenario";

import "../../theme/theme.css";
import { customScenarioNotFound } from "./custom-planetary-scenario.module.css";

const CustomPlanetaryScenario = () => {
  const dispatch = useDispatch();
  const [customScenario, setCustomScenario] = useState<ScenarioType | null>(
    null,
  );
  const [hasResolved, setHasResolved] = useState(false);

  useEffect(() => {
    const pendingScenario = getPendingCustomScenario();

    if (pendingScenario) {
      dispatch(setScenario(pendingScenario));
      setCustomScenario(pendingScenario);
    } else {
      setCustomScenario(null);
    }

    setHasResolved(true);
  }, [dispatch]);

  if (!hasResolved) {
    return null;
  }

  if (!customScenario) {
    return (
      <Layout currentPage="scenarios">
        <p className={customScenarioNotFound}>
          No custom scenario found.{" "}
          <Link to="/scenarios/custom-scenario">Create a custom scenario</Link>{" "}
          to get started.
        </p>
      </Layout>
    );
  }

  return (
    <Fragment>
      <Scenario key={customScenario.name} originalScenario={customScenario} />
    </Fragment>
  );
};

export const Head = ({ location }: HeadProps) => {
  const pendingScenario = getPendingCustomScenario();

  return (
    <Seo
      title={pendingScenario?.name ?? "Custom Scenario"}
      description={
        pendingScenario
          ? `Explore your custom scenario "${pendingScenario.name}" — an interactive 3D Newtonian gravity simulation.`
          : "Custom scenario not found."
      }
      pathname={location.pathname}
    />
  );
};

export default CustomPlanetaryScenario;
