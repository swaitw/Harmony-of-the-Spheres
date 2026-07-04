import type { GatsbyNode } from "gatsby";
import fs from "fs";
import path from "path";
import {
  ScenariosCategoryTreeType,
  ScenarioCategoryBranchType,
} from "./src/types/category";
import { ScenarioType } from "./src/types/scenario";
import { kebabCase } from "./src/utils/text-utils";

type FetchedScenariosArray = {
  scenario: {
    name: string;
    category: {
      name: string;
      subCategory: string;
    };
  };
}[];

type FetchedScenariosJsonType = {
  scenariosJson: {
    scenarios: FetchedScenariosArray;
  };
  categoryTree: ScenariosCategoryTreeType;
};

const GATSBY_LOADER_STALE_REPLACEMENTS: ReadonlyArray<
  readonly [string, string]
> = [
  [
    "process.env.BUILD_STAGE !== `develop` || !page.payload.stale",
    "process.env.BUILD_STAGE !== `develop` || (page.payload && !page.payload.stale)",
  ],
  [
    "process.env.BUILD_STAGE !== `develop` || !pageData.stale",
    "process.env.BUILD_STAGE !== `develop` || (pageData && !pageData.stale)",
  ],
];

const patchGatsbyLoaderStaleCheck = (): void => {
  const loaderPaths = [
    path.join(process.cwd(), "node_modules/gatsby/cache-dir/loader.js"),
    path.join(
      process.cwd(),
      "node_modules/gatsby/cache-dir/commonjs/loader.js",
    ),
    path.join(process.cwd(), ".cache/loader.js"),
    path.join(process.cwd(), ".cache/commonjs/loader.js"),
  ];

  for (let i = 0; i < loaderPaths.length; i++) {
    const loaderPath = loaderPaths[i];

    if (!fs.existsSync(loaderPath)) {
      continue;
    }

    let content = fs.readFileSync(loaderPath, "utf8");
    let patched = false;

    for (let j = 0; j < GATSBY_LOADER_STALE_REPLACEMENTS.length; j++) {
      const [from, to] = GATSBY_LOADER_STALE_REPLACEMENTS[j];

      if (content.includes(from)) {
        content = content.split(from).join(to);
        patched = true;
      }
    }

    if (patched) {
      fs.writeFileSync(loaderPath, content);
    }
  }
};

patchGatsbyLoaderStaleCheck();

const onPreBootstrap: GatsbyNode["onPreBootstrap"] = () => {
  patchGatsbyLoaderStaleCheck();
};

const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = () => {
  patchGatsbyLoaderStaleCheck();
};

const onPostBootstrap: GatsbyNode["onPostBootstrap"] = () => {
  patchGatsbyLoaderStaleCheck();
};

const onCreateDevServer: GatsbyNode["onCreateDevServer"] = () => {
  patchGatsbyLoaderStaleCheck();
};

const createPages: GatsbyNode["createPages"] = async ({ actions, graphql }) => {
  const { createPage } = actions;
  const SCENARIOS_PER_PAGE = 12;

  const { data } = await graphql<FetchedScenariosJsonType>(`
    {
      scenariosJson: allScenariosJson {
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
  `);

  const categoryTree = data?.categoryTree;
  const allScenarios = data?.scenariosJson.scenarios || [];

  const allScenariosCount = allScenarios.length;
  const allNumPages = Math.ceil(allScenariosCount / SCENARIOS_PER_PAGE);

  for (let i = 0; i < allNumPages; i++) {
    createPage({
      path: i === 0 ? `/scenarios/all` : `/scenarios/all/${i + 1}`,
      component: path.resolve("./src/templates/scenarios-menu/index.tsx"),
      context: {
        category: "all",
        subCategory: "all",
        limit: SCENARIOS_PER_PAGE,
        skip: i * SCENARIOS_PER_PAGE,
        numPages: allNumPages,
        currentPage: i + 1,
      },
    });
  }

  categoryTree?.forEach(
    (scenarioCategoryBranch: ScenarioCategoryBranchType) => {
      const component = path.resolve(
        "./src/templates/scenarios-menu/index.tsx",
      );
      const { name, subCategories } = scenarioCategoryBranch;
      const withSubCategories = subCategories.length;
      const categoryRegex = `/${name}/g`;

      const categoryScenariosCount = allScenarios.filter(
        ({ scenario }) => scenario.category.name === name,
      ).length;
      const categoryNumPages = Math.ceil(
        categoryScenariosCount / SCENARIOS_PER_PAGE,
      );

      for (let i = 0; i < categoryNumPages; i++) {
        const basePath = `/scenarios/${kebabCase(name)}${
          withSubCategories ? "/all" : ""
        }`;
        createPage({
          path: i === 0 ? basePath : `${basePath}/${i + 1}`,
          component,
          context: {
            category: name,
            categoryRegex,
            subCategory: "all",
            limit: SCENARIOS_PER_PAGE,
            skip: i * SCENARIOS_PER_PAGE,
            numPages: categoryNumPages,
            currentPage: i + 1,
          },
        });
      }

      if (withSubCategories) {
        subCategories.forEach((subCategory: string) => {
          const subCategoryScenariosCount = allScenarios.filter(
            ({ scenario }) =>
              scenario.category.name === name &&
              scenario.category.subCategory === subCategory,
          ).length;

          const subCategoryNumPages = Math.ceil(
            subCategoryScenariosCount / SCENARIOS_PER_PAGE,
          );

          for (let i = 0; i < subCategoryNumPages; i++) {
            const basePath = `/scenarios/${kebabCase(name)}/${kebabCase(
              subCategory,
            )}`;

            createPage({
              path: i === 0 ? basePath : `${basePath}/${i + 1}`,
              component,
              context: {
                category: name,
                categoryRegex,
                subCategory,
                subCategoryRegex: `/${subCategory}/g`,
                limit: SCENARIOS_PER_PAGE,
                skip: i * SCENARIOS_PER_PAGE,
                numPages: subCategoryNumPages,
                currentPage: i + 1,
              },
            });
          }
        });
      }
    },
  );

  createPage({
    path: "/scenarios/custom-scenario",
    component: path.resolve("./src/templates/custom-scenario/index.tsx"),
  });

  createPage({
    path: "/scenarios/custom-scenario/run",
    component: path.resolve(
      "./src/templates/custom-planetary-scenario/index.tsx",
    ),
  });

  createPage({
    path: "/scenarios/saved",
    component: path.resolve("./src/templates/saved-scenarios-menu/index.tsx"),
  });

  createPage({
    path: "/scenarios/saved/view",
    matchPath: "/scenarios/saved/:slug",
    component: path.resolve(
      "./src/templates/saved-planetary-scenario/index.tsx",
    ),
  });

  data?.scenariosJson.scenarios.forEach(({ scenario }) => {
    const component = path.resolve(
      "./src/templates/planetary-scenario/index.tsx",
    );
    const { category, name } = scenario;

    createPage({
      path: `/scenarios/${kebabCase(category.name)}${
        category.subCategory ? `/${kebabCase(category.subCategory)}` : ""
      }/${kebabCase(name)}`,
      component,
      context: {
        scenarioName: name,
      },
    });
  });
};

const createResolvers: GatsbyNode["createResolvers"] = ({
  createResolvers,
  getNodesByType,
}) => {
  const scenarios = getNodesByType(
    "ScenariosJson",
  ) as unknown as ScenarioType[];

  const categoryTree = scenarios.reduce(
    (
      accumulator: ScenariosCategoryTreeType,
      { category: { name } },
      _index: number,
      array,
    ) => {
      const hasCategoryBeenAdded = accumulator.find(
        (category: ScenarioCategoryBranchType) => category.name === name,
      );

      if (!hasCategoryBeenAdded) {
        const subCategories = array.reduce(
          (accumulator: string[], { category }) => {
            if (
              category.name === name &&
              category.subCategory &&
              !accumulator.includes(category.subCategory)
            ) {
              accumulator.push(category.subCategory);
            }

            return accumulator;
          },
          [],
        );

        const categoryBranch = { name, subCategories };

        accumulator.push(categoryBranch);
      }

      return accumulator;
    },
    [],
  );

  createResolvers({
    Query: {
      categoryTree: {
        resolve: async () => categoryTree,
      },
    },
  });
};

const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] = ({
  actions,
}) => {
  const { createTypes } = actions;

  createTypes(`
    type CategoryBranch {
      name: String
      subCategories: [String]
    }

    type Query implements Node {
      categoryTree: [CategoryBranch]
    }

    type ScenariosJsonGraphics {
      numberOfTrailVertices: Int
    }

    type ScenariosJsonMassesGraphics {
      numberOfTrailVertices: Int
    }
`);
};

export {
  createPages,
  createResolvers,
  createSchemaCustomization,
  onPreBootstrap,
  onPostBootstrap,
  onCreateWebpackConfig,
  onCreateDevServer,
};
