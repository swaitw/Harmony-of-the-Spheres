import { ScenarioMassType } from "./scenario";

type PlanetCategory =
  | "gas-giant"
  | "ice-giant"
  | "lava"
  | "barren-light"
  | "barren-heavy"
  | "desert"
  | "ice-world"
  | "habitable";

type NearestStarInfoType = {
  star: ScenarioMassType | null;
  distAU: number;
};

type SudarskiClassType = 1 | 2 | 3 | 4 | 5;

type ColorStopType = [number, number, number, number];

type TerrainPaletteType = ColorStopType[];

type RgbType = [number, number, number];

type IceGiantPaletteType = {
  deep: RgbType;
  mid: RgbType;
  bright: RgbType;
  stormTint?: RgbType;
  banded: boolean;
};

type TerrainPaletteEntryType = {
  name: string;
  palette: TerrainPaletteType;
  oceanWorld?: boolean;
};

type IceGiantPaletteEntryType = {
  name: string;
  palette: IceGiantPaletteType;
};

type TerrainPaletteSelectionType = {
  name: string;
  palette: TerrainPaletteType;
  index: number;
  oceanWorld?: boolean;
};

type IceGiantPaletteSelectionType = {
  name: string;
  palette: IceGiantPaletteType;
  index: number;
};

type PaletteCategoryType = Exclude<PlanetCategory, "gas-giant">;

type PaletteSelectionType =
  | ({ category: "ice-giant" } & IceGiantPaletteSelectionType)
  | ({
      category: Exclude<PaletteCategoryType, "ice-giant">;
    } & TerrainPaletteSelectionType);

type PaletteRandomFunctionType = (seed: number) => number;

type AtmosphereColorSourceType =
  | { category: "gas-giant"; sudarskyClass: SudarskiClassType }
  | { category: "ice-giant"; palette: IceGiantPaletteType }
  | {
      category: Exclude<PaletteCategoryType, "ice-giant">;
      palette: TerrainPaletteType;
      oceanWorld?: boolean;
    };

type TerrainNoiseParamsType = {
  frequency: number;
  amplitude: number;
};

export type {
  PlanetCategory,
  NearestStarInfoType,
  SudarskiClassType,
  ColorStopType,
  TerrainPaletteType,
  RgbType,
  IceGiantPaletteType,
  TerrainPaletteEntryType,
  IceGiantPaletteEntryType,
  TerrainPaletteSelectionType,
  IceGiantPaletteSelectionType,
  PaletteCategoryType,
  PaletteSelectionType,
  PaletteRandomFunctionType,
  AtmosphereColorSourceType,
  TerrainNoiseParamsType,
};
