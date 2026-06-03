import { kebabCase } from "./text-utils";

export const buildScenariosPaginationBasePath = (
  category: string,
  subCategory: string,
): string =>
  category === "all"
    ? "/scenarios/all"
    : subCategory === "all"
    ? `/scenarios/${kebabCase(category)}/all`
    : `/scenarios/${kebabCase(category)}/${kebabCase(subCategory)}`;

export const getPaginationRange = (
  currentPage: number,
  numPages: number,
  delta = 2,
): number[] => {
  const range: number[] = [];

  let start = Math.max(1, currentPage - delta);
  let end = Math.min(numPages, currentPage + delta);

  if (end - start < 4) {
    if (start === 1) {
      end = Math.min(numPages, start + 4);
    } else if (end === numPages) {
      start = Math.max(1, end - 4);
    }
  }

  for (let i = start; i <= end; i++) {
    range.push(i);
  }

  return range;
};

export const scenariosPaginationPagePath = (
  basePath: string,
  pageNum: number,
): string => (pageNum === 1 ? basePath : `${basePath}/${pageNum}`);
