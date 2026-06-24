import React from "react";
import { graphql, Link, HeadProps } from "gatsby";
import Seo from "../../components/seo";
import Layout from "../../components/layout";
import NavigationMenu from "../../components/navigation-menu";
import NavigationMenuItem from "../../components/navigation-menu/navigation-menu-item";
import { kebabCase } from "../../utils/text-utils";
import {
  buildScenariosPaginationBasePath,
  getPaginationRange,
  scenariosPaginationPagePath,
} from "../../utils/pagination-utils";
import useSavedScenarios from "../../hooks/useSavedScenarios";
import { ScenariosCategoryTreeType } from "../../types/category";
import { ScenarioCategoryType } from "../../types/scenario";

import {
  scenariosMenuWrapper,
  navigationMenuCssModifier,
  scenariosMenuItem,
  scenariosListWrapper,
  scenariosListItem,
  scenariosListItemTitle,
} from "./scenarios-menu.module.css";

type ScenarioMenuPageContext = {
  category: string;
  subCategory: string;
  currentPage: number;
  numPages: number;
};

type Props = {
  data: {
    scenariosJson: {
      scenarios: {
        scenario: {
          name: string;
          category: ScenarioCategoryType;
        };
      }[];
    };
    categoryTree: ScenariosCategoryTreeType;
  };
  pageContext: {
    category: string;
    subCategory: string;
    currentPage: number;
    numPages: number;
  };
};

type SavedScenariosNavigationItemProps = {
  active?: boolean;
};

const SavedScenariosNavigationItem = ({
  active = false,
}: SavedScenariosNavigationItemProps) => {
  const savedScenarios = useSavedScenarios();

  if (savedScenarios.length === 0) {
    return null;
  }

  return (
    <Link to="/scenarios/saved">
      <NavigationMenuItem active={active} cssModifier={scenariosMenuItem}>
        Saved Scenarios
      </NavigationMenuItem>
    </Link>
  );
};

const ScenarioMenu = ({
  data: { categoryTree, scenariosJson },
  pageContext: { category, subCategory, currentPage, numPages },
}: Props) => {
  const subCategories = categoryTree?.find(({ name: categoryName }) => {
    return categoryName === category;
  })?.subCategories;

  const basePath = buildScenariosPaginationBasePath(category, subCategory);
  const pageNumbers = getPaginationRange(currentPage, numPages);

  return (
    <Layout currentPage="scenarios">
      <section className={scenariosMenuWrapper}>
        <NavigationMenu cssModifier={navigationMenuCssModifier}>
          <Link to="/scenarios/all">
            <NavigationMenuItem
              active={category === "all"}
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
                active={category === categoryBranch.name}
                cssModifier={scenariosMenuItem}
              >
                {categoryBranch.name}
              </NavigationMenuItem>
            </Link>
          ))}
          <Link to="/scenarios/custom-scenario">
            <NavigationMenuItem
              active={category === "custom"}
              cssModifier={scenariosMenuItem}
            >
              Create Scenario
            </NavigationMenuItem>
          </Link>
          <SavedScenariosNavigationItem active={category === "saved"} />
        </NavigationMenu>{" "}
        {subCategories?.length ? (
          <NavigationMenu cssModifier={navigationMenuCssModifier}>
            <Link to={`/scenarios/${kebabCase(category)}/all`}>
              <NavigationMenuItem
                active={subCategory === "all"}
                cssModifier={scenariosMenuItem}
              >
                All
              </NavigationMenuItem>
            </Link>
            {subCategories.map((subCategoryEntry) => (
              <Link
                to={`/scenarios/${kebabCase(category)}/${kebabCase(
                  subCategoryEntry,
                )}`}
              >
                <NavigationMenuItem
                  active={subCategory === subCategoryEntry}
                  cssModifier={scenariosMenuItem}
                >
                  {subCategoryEntry}
                </NavigationMenuItem>
              </Link>
            ))}
          </NavigationMenu>
        ) : null}
        {numPages > 1 && (
          <NavigationMenu cssModifier={navigationMenuCssModifier}>
            <Link to={basePath}>
              <NavigationMenuItem
                active={false}
                cssModifier={scenariosMenuItem}
              >
                First
              </NavigationMenuItem>
            </Link>
            {pageNumbers.map((pageNumber) => (
              <Link
                key={pageNumber}
                to={scenariosPaginationPagePath(basePath, pageNumber)}
              >
                <NavigationMenuItem
                  active={currentPage === pageNumber}
                  cssModifier={scenariosMenuItem}
                >
                  {pageNumber}
                </NavigationMenuItem>
              </Link>
            ))}
            <Link to={`${basePath}/${numPages}`}>
              <NavigationMenuItem
                active={false}
                cssModifier={scenariosMenuItem}
              >
                Last
              </NavigationMenuItem>
            </Link>
          </NavigationMenu>
        )}
      </section>
      <section className={scenariosListWrapper}>
        {scenariosJson.scenarios.map(({ scenario }) => (
          <Link
            to={`/scenarios/${kebabCase(scenario.category.name)}${
              scenario.category.subCategory
                ? `/${kebabCase(scenario.category.subCategory)}/${kebabCase(
                    scenario.name,
                  )}`
                : `/${kebabCase(scenario.name)}`
            }`}
          >
            <div className={scenariosListItem}>
              <span className={scenariosListItemTitle}>{scenario.name}</span>
            </div>
          </Link>
        ))}
      </section>
    </Layout>
  );
};

export const Head = ({
  pageContext,
  location,
}: HeadProps<object, ScenarioMenuPageContext>) => {
  const { category, subCategory } = pageContext;
  const isAll = category === "all";
  const hasSubCategory = subCategory && subCategory !== "all";

  const title = isAll
    ? "All Scenarios"
    : hasSubCategory
    ? `${category} – ${subCategory} Scenarios`
    : `${category} Scenarios`;

  const description = isAll
    ? "Browse all interactive 3D gravity simulations – from the Solar System to colliding galaxies. Powered by Newtonian physics."
    : `Explore ${category}${
        hasSubCategory ? ` – ${subCategory}` : ""
      } gravity simulations. Interactive 3D Newtonian orbital mechanics at your fingertips.`;

  return (
    <Seo title={title} description={description} pathname={location.pathname} />
  );
};

const pageQuery = graphql`
  query (
    $categoryRegex: String = "//g"
    $subCategoryRegex: String = "//g"
    $skip: Int = 0
    $limit: Int = 12
  ) {
    scenariosJson: allScenariosJson(
      filter: {
        category: {
          name: { regex: $categoryRegex }
          subCategory: { regex: $subCategoryRegex }
        }
      }
      limit: $limit
      skip: $skip
      sort: { name: ASC }
    ) {
      scenarios: edges {
        scenario: node {
          name
          category {
            name
            subCategory
          }
        }
      }
    }

    categoryTree {
      name
      subCategories
    }
  }
`;

export default ScenarioMenu;

export { pageQuery };
