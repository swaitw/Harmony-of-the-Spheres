import React, { Fragment, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { HeadFC } from "gatsby";

import Seo from "../../components/seo";
import { getSavedScenarioFromUrlSegment } from "../../utils/saved-scenarios-storage";
import { SavedScenarioEntry } from "../../types/saved-scenario";
import { setScenario } from "../../state/creators";
import Scenario from "../planetary-scenario";
import Layout from "../../components/layout";

import "../../theme/theme.css";
import { savedScenarioNotFound } from "./saved-planetary-scenario.module.css";

type Props = {
  params?: {
    slug?: string;
    "*"?: string;
  };
  location: {
    pathname: string;
  };
};

const getSavedScenarioSlugFromPath = (
  routeParameters: Props["params"],
  pathname: string,
): string | null => {
  if (routeParameters?.slug) {
    return routeParameters.slug;
  }

  if (routeParameters?.["*"]) {
    const slug = routeParameters["*"].replace(/\/$/, "");

    if (slug && slug !== "view") {
      return slug;
    }
  }

  const pathMatch = pathname.match(/^\/scenarios\/saved\/([^/]+)\/?$/);

  if (!pathMatch || pathMatch[1] === "view") {
    return null;
  }

  return pathMatch[1];
};

const SavedPlanetaryScenario = ({
  params: routeParameters,
  location,
}: Props) => {
  const dispatch = useDispatch();
  const slug = getSavedScenarioSlugFromPath(routeParameters, location.pathname);
  const [savedScenario, setSavedScenario] = useState<SavedScenarioEntry | null>(
    null,
  );
  const [hasResolved, setHasResolved] = useState(false);

  useEffect(() => {
    setHasResolved(false);

    if (!slug) {
      setSavedScenario(null);
      setHasResolved(true);

      return;
    }

    const savedScenarioEntry = getSavedScenarioFromUrlSegment(slug);

    if (savedScenarioEntry) {
      dispatch(setScenario(savedScenarioEntry.scenario));
      setSavedScenario(savedScenarioEntry);
    } else {
      setSavedScenario(null);
    }

    setHasResolved(true);
  }, [slug, dispatch]);

  if (!hasResolved) {
    return null;
  }

  if (!slug || !savedScenario) {
    return (
      <Layout currentPage="scenarios">
        <p className={savedScenarioNotFound}>Saved scenario not found.</p>
      </Layout>
    );
  }

  return (
    <Fragment>
      <Scenario
        key={savedScenario.id}
        originalScenario={savedScenario.scenario}
      />
    </Fragment>
  );
};

export default SavedPlanetaryScenario;

const Head: HeadFC = ({ location }) => {
  const slug = getSavedScenarioSlugFromPath(undefined, location.pathname);
  const savedScenario = slug ? getSavedScenarioFromUrlSegment(slug) : null;

  return (
    <Seo
      title={savedScenario?.scenario.name ?? "Saved Scenario"}
      description={
        savedScenario
          ? `Explore your saved scenario "${savedScenario.scenario.name}" — an interactive 3D Newtonian gravity simulation.`
          : "Saved scenario not found."
      }
      pathname={location.pathname}
    />
  );
};

export { Head };
