import React from "react";
import { Link, graphql, HeadFC } from "gatsby";

import Seo from "../../components/seo";
import Layout from "../../components/layout";
import Button from "../../components/button";
import NavigationMenu from "../../components/navigation-menu";
import NavigationMenuItem from "../../components/navigation-menu/navigation-menu-item";
import useSavedScenarios from "../../hooks/useSavedScenarios";
import { kebabCase } from "../../utils/text-utils";
import {
  deleteSavedScenario,
  getSavedScenarioPath,
} from "../../utils/saved-scenarios-storage";
import { ScenariosCategoryTreeType } from "../../types/category";

import {
  scenariosMenuWrapper,
  scenariosListWrapper,
  scenariosListItem,
  navigationMenuCssModifier,
  scenariosMenuItem,
} from "../scenarios-menu/scenarios-menu.module.css";
import {
  savedScenarioCard,
  savedScenarioLink,
  savedScenarioFooter,
  savedScenarioTitle,
  savedScenarioDeleteButton,
  savedScenariosEmptyMessage,
} from "./saved-scenarios-menu.module.css";

type Props = {
  data: {
    categoryTree: ScenariosCategoryTreeType;
  };
};

const SavedScenariosMenu = ({ data: { categoryTree } }: Props) => {
  const savedScenarios = useSavedScenarios();

  return (
    <Layout currentPage="scenarios">
      <section className={scenariosMenuWrapper}>
        <NavigationMenu cssModifier={navigationMenuCssModifier}>
          <Link to="/scenarios/all">
            <NavigationMenuItem
              active={false}
              cssModifier={scenariosMenuItem}
            >
              All
            </NavigationMenuItem>
          </Link>
          {categoryTree.map((categoryBranch) => (
            <Link
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
          {savedScenarios.length > 0 && (
            <Link to="/scenarios/saved">
              <NavigationMenuItem active cssModifier={scenariosMenuItem}>
                Saved Scenarios
              </NavigationMenuItem>
            </Link>
          )}
        </NavigationMenu>
      </section>
      <section className={scenariosListWrapper}>
        {savedScenarios.length === 0 ? (
          <p className={savedScenariosEmptyMessage}>
            No saved scenarios yet. Open a scenario and use the save button to
            store your current simulation state.
          </p>
        ) : (
          savedScenarios.map(({ id: savedScenarioId, scenario }) => (
            <div
              key={savedScenarioId}
              className={`${scenariosListItem} ${savedScenarioCard}`}
            >
              <Link
                to={getSavedScenarioPath(scenario.name)}
                className={savedScenarioLink}
              />
              <div className={savedScenarioFooter}>
                <span className={savedScenarioTitle}>{scenario.name}</span>
                <Button
                  callback={() => {
                    deleteSavedScenario(savedScenarioId);
                  }}
                  cssModifier={savedScenarioDeleteButton}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </section>
    </Layout>
  );
};

export default SavedScenariosMenu;

const Head: HeadFC = ({ location }) => {
  return (
    <Seo
      title="Saved Scenarios"
      description="Browse your saved gravity simulation scenarios stored locally in your browser."
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

export { Head, pageQuery };
