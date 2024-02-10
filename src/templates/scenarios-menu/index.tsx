import React from "react";
import { graphql, Link } from "gatsby";
import Layout from "../../components/layout";
import NavigationMenu from "../../components/navigation-menu";
import NavigationMenuItem from "../../components/navigation-menu/navigation-menu-item";
import { kebabCase } from "../../utils/text-utils";
import { ScenariosCategoryTreeType } from "../../types/category";
import { ScenarioCategoryType } from "../../types/scenario";

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
  };
};

const ScenarioMenu = ({
  data: { categoryTree, scenariosJson },
  pageContext: { category, subCategory },
}: Props) => {
  const subCategories = categoryTree?.find(({ name }) => name === category)
    ?.subCategories;

  return (
    <Layout currentPage="scenarios">
      <section className="scenarios-navigation-menu-wrapper">
        <NavigationMenu cssClassName="navigation-menu">
          <NavigationMenuItem
            cssClassName="navigation-menu-item"
            active={category === "all"}
            activeCssClassName="navigation-menu-item-active"
          >
            <Link to={`/scenarios/all`}>All</Link>
          </NavigationMenuItem>

          {categoryTree.map((categoryBranch) => (
            <NavigationMenuItem
              cssClassName="navigation-menu-item"
              active={category === categoryBranch.name}
              activeCssClassName="navigation-menu-item-active"
            >
              <Link
                to={`/scenarios/${kebabCase(categoryBranch.name)}${
                  categoryBranch.subCategories.length ? "/all" : ""
                }`}
              >
                {categoryBranch.name}
              </Link>
            </NavigationMenuItem>
          ))}
        </NavigationMenu>{" "}
        {subCategories?.length ? (
          <NavigationMenu cssClassName="navigation-menu">
            <NavigationMenuItem
              cssClassName="navigation-menu-item"
              active={subCategory === "all"}
              activeCssClassName="navigation-menu-item-active"
            >
              <Link to={`/scenarios/${kebabCase(category)}/all`}>All</Link>
            </NavigationMenuItem>
            {subCategories.map((subCategoryEntry) => (
              <NavigationMenuItem
                cssClassName="navigation-menu-item"
                active={subCategory === subCategoryEntry}
                activeCssClassName="navigation-menu-item-active"
              >
                <Link
                  to={`/scenarios/${kebabCase(category)}/${kebabCase(
                    subCategoryEntry,
                  )}`}
                >
                  {subCategoryEntry}
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenu>
        ) : null}
      </section>
      <section className="scenarios-list">
        {scenariosJson.scenarios.map(({ scenario }) => (
          <Link
            to={`/scenarios/${kebabCase(category)}${
              scenario.category.subCategory
                ? `/${kebabCase(scenario.category.subCategory)}/${kebabCase(
                    scenario.name,
                  )}`
                : `/${kebabCase(scenario.name)}`
            }`}
          >
            <div className="scenarios-list__scenarios-list-item">
              <span className="scenarios-list__scenarios-list-item-name">
                {scenario.name}
              </span>
            </div>
          </Link>
        ))}
      </section>
    </Layout>
  );
};

export const pageQuery = graphql`
  query ($categoryRegex: String = "//g", $subCategoryRegex: String = "//g") {
    scenariosJson: allScenariosJson(
      filter: {
        category: {
          name: { regex: $categoryRegex }
          subCategory: { regex: $subCategoryRegex }
        }
      }
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
