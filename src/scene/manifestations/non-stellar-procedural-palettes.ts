import type {
  AtmosphereColorSourceType,
  IceGiantPaletteEntryType,
  IceGiantPaletteSelectionType,
  IceGiantPaletteType,
  PaletteCategoryType,
  PaletteRandomFunctionType,
  PaletteSelectionType,
  PlanetCategory,
  RgbType,
  SudarskiClassType,
  TerrainPaletteEntryType,
  TerrainPaletteSelectionType,
  TerrainPaletteType,
} from "../../types/planet";

const DESERT_PALETTES: TerrainPaletteEntryType[] = [
  {
    name: "saharan-golden-erg-dunes",
    palette: [
      [0.72, 0.58, 0.36, 0.0],
      [0.88, 0.72, 0.42, 0.32],
      [0.98, 0.84, 0.48, 0.48],
      [0.85, 0.68, 0.38, 0.58],
      [0.95, 0.8, 0.44, 0.68],
      [0.78, 0.62, 0.34, 0.8],
      [0.92, 0.76, 0.4, 0.92],
      [0.99, 0.92, 0.72, 1.0],
    ],
  },
  {
    name: "arabian-gravel-scrub-desert",
    palette: [
      [0.55, 0.44, 0.3, 0.0],
      [0.65, 0.52, 0.34, 0.28],
      [0.78, 0.62, 0.38, 0.45],
      [0.48, 0.38, 0.26, 0.55],
      [0.7, 0.56, 0.34, 0.65],
      [0.58, 0.46, 0.3, 0.78],
      [0.75, 0.6, 0.36, 0.9],
      [0.88, 0.78, 0.58, 1.0],
    ],
  },
  {
    name: "atacama-salt-pan-pale-mineral-flats",
    palette: [
      [0.62, 0.6, 0.56, 0.0],
      [0.72, 0.7, 0.66, 0.3],
      [0.82, 0.8, 0.76, 0.48],
      [0.58, 0.56, 0.52, 0.58],
      [0.75, 0.73, 0.68, 0.68],
      [0.65, 0.63, 0.58, 0.8],
      [0.78, 0.76, 0.7, 0.9],
      [0.9, 0.88, 0.84, 1.0],
    ],
  },
  {
    name: "mojave-red-brown-basin",
    palette: [
      [0.42, 0.26, 0.16, 0.0],
      [0.55, 0.34, 0.2, 0.28],
      [0.72, 0.44, 0.26, 0.45],
      [0.48, 0.3, 0.18, 0.55],
      [0.65, 0.4, 0.24, 0.65],
      [0.52, 0.32, 0.2, 0.78],
      [0.68, 0.42, 0.26, 0.9],
      [0.82, 0.52, 0.32, 1.0],
    ],
  },
  {
    name: "gobi-gray-gravel-plain",
    palette: [
      [0.38, 0.36, 0.32, 0.0],
      [0.48, 0.46, 0.42, 0.3],
      [0.58, 0.56, 0.5, 0.48],
      [0.42, 0.4, 0.36, 0.58],
      [0.52, 0.5, 0.44, 0.68],
      [0.46, 0.44, 0.38, 0.8],
      [0.55, 0.52, 0.46, 0.9],
      [0.68, 0.66, 0.6, 1.0],
    ],
  },
  {
    name: "simpson-desert-rose-sand-australia",
    palette: [
      [0.68, 0.48, 0.38, 0.0],
      [0.78, 0.56, 0.44, 0.3],
      [0.92, 0.66, 0.5, 0.46],
      [0.72, 0.5, 0.4, 0.56],
      [0.88, 0.62, 0.48, 0.66],
      [0.75, 0.54, 0.42, 0.78],
      [0.9, 0.68, 0.52, 0.9],
      [0.96, 0.78, 0.62, 1.0],
    ],
  },
  {
    name: "namib-orange-dune-sea",
    palette: [
      [0.58, 0.38, 0.2, 0.0],
      [0.72, 0.48, 0.24, 0.28],
      [0.9, 0.6, 0.28, 0.46],
      [0.65, 0.42, 0.22, 0.56],
      [0.82, 0.52, 0.26, 0.66],
      [0.7, 0.44, 0.22, 0.78],
      [0.85, 0.54, 0.28, 0.9],
      [0.95, 0.68, 0.38, 1.0],
    ],
  },
  {
    name: "patagonian-cold-gray-brown-steppe",
    palette: [
      [0.32, 0.3, 0.26, 0.0],
      [0.42, 0.4, 0.34, 0.3],
      [0.52, 0.48, 0.4, 0.48],
      [0.38, 0.36, 0.3, 0.58],
      [0.48, 0.44, 0.36, 0.68],
      [0.42, 0.38, 0.32, 0.8],
      [0.5, 0.46, 0.4, 0.9],
      [0.62, 0.58, 0.52, 1.0],
    ],
  },
  {
    name: "mars-like-iron-oxide-dunes",
    palette: [
      [0.45, 0.28, 0.18, 0.0],
      [0.58, 0.34, 0.22, 0.22],
      [0.72, 0.42, 0.26, 0.38],
      [0.55, 0.32, 0.2, 0.52],
      [0.68, 0.4, 0.24, 0.65],
      [0.48, 0.28, 0.17, 0.78],
      [0.62, 0.36, 0.22, 0.9],
      [0.74, 0.44, 0.28, 1.0],
    ],
  },
  {
    name: "titan-like-muted-hydrocarbon-haze",
    palette: [
      [0.42, 0.36, 0.28, 0.0],
      [0.48, 0.4, 0.32, 0.25],
      [0.55, 0.46, 0.36, 0.42],
      [0.38, 0.32, 0.26, 0.55],
      [0.5, 0.42, 0.34, 0.68],
      [0.44, 0.38, 0.3, 0.8],
      [0.58, 0.5, 0.4, 0.92],
      [0.52, 0.44, 0.36, 1.0],
    ],
  },
];

const ICE_WORLD_PALETTES: TerrainPaletteEntryType[] = [
  {
    name: "dirty-snow-over-dark-rock",
    palette: [
      [0.18, 0.16, 0.15, 0.0],
      [0.35, 0.32, 0.3, 0.2],
      [0.72, 0.68, 0.62, 0.4],
      [0.82, 0.78, 0.72, 0.52],
      [0.68, 0.64, 0.58, 0.64],
      [0.78, 0.74, 0.68, 0.76],
      [0.45, 0.38, 0.32, 0.88],
      [0.98, 0.99, 1.0, 1.0],
    ],
  },
  {
    name: "sulfur-stained-ice-muted-yellow-bands",
    palette: [
      [0.12, 0.1, 0.08, 0.0],
      [0.28, 0.24, 0.18, 0.18],
      [0.95, 0.92, 0.78, 0.38],
      [0.7, 0.42, 0.18, 0.48],
      [0.85, 0.48, 0.2, 0.58],
      [0.92, 0.9, 0.82, 0.72],
      [0.55, 0.52, 0.48, 0.86],
      [1.0, 1.0, 0.98, 1.0],
    ],
  },
  {
    name: "methane-tinted-cyan-ice",
    palette: [
      [0.08, 0.12, 0.14, 0.0],
      [0.15, 0.28, 0.32, 0.2],
      [0.45, 0.72, 0.78, 0.4],
      [0.38, 0.62, 0.7, 0.52],
      [0.82, 0.9, 0.92, 0.64],
      [0.75, 0.88, 0.9, 0.76],
      [0.4, 0.48, 0.52, 0.88],
      [0.96, 0.99, 1.0, 1.0],
    ],
  },
  {
    name: "neutral-gray-nitrogen-ice",
    palette: [
      [0.22, 0.22, 0.24, 0.0],
      [0.38, 0.38, 0.4, 0.22],
      [0.58, 0.58, 0.6, 0.42],
      [0.72, 0.72, 0.74, 0.54],
      [0.65, 0.65, 0.67, 0.66],
      [0.78, 0.78, 0.8, 0.78],
      [0.52, 0.52, 0.54, 0.9],
      [0.92, 0.94, 0.96, 1.0],
    ],
  },
  {
    name: "brown-organic-ice-titan-like",
    palette: [
      [0.2, 0.14, 0.1, 0.0],
      [0.32, 0.24, 0.18, 0.2],
      [0.55, 0.42, 0.32, 0.4],
      [0.42, 0.34, 0.26, 0.52],
      [0.62, 0.5, 0.38, 0.64],
      [0.78, 0.68, 0.52, 0.76],
      [0.35, 0.28, 0.2, 0.88],
      [0.72, 0.64, 0.52, 1.0],
    ],
  },
  {
    name: "charcoal-rock-with-patchy-snow",
    palette: [
      [0.1, 0.09, 0.08, 0.0],
      [0.22, 0.2, 0.18, 0.2],
      [0.35, 0.32, 0.3, 0.38],
      [0.28, 0.22, 0.18, 0.5],
      [0.65, 0.62, 0.58, 0.62],
      [0.72, 0.7, 0.66, 0.74],
      [0.18, 0.16, 0.14, 0.88],
      [0.88, 0.9, 0.92, 1.0],
    ],
  },
  {
    name: "ganymede-bright-ice-with-gray-grooves",
    palette: [
      [0.42, 0.44, 0.46, 0.0],
      [0.72, 0.74, 0.76, 0.3],
      [0.38, 0.4, 0.42, 0.42],
      [0.82, 0.84, 0.86, 0.55],
      [0.48, 0.5, 0.52, 0.65],
      [0.88, 0.9, 0.92, 0.78],
      [0.58, 0.6, 0.62, 0.9],
      [0.94, 0.96, 0.98, 1.0],
    ],
  },
  {
    name: "europa-bright-ice-with-brownish-fractures",
    palette: [
      [0.25, 0.22, 0.2, 0.0],
      [0.82, 0.84, 0.86, 0.3],
      [0.45, 0.38, 0.32, 0.42],
      [0.9, 0.92, 0.94, 0.55],
      [0.5, 0.42, 0.36, 0.65],
      [0.88, 0.9, 0.92, 0.78],
      [0.7, 0.72, 0.74, 0.9],
      [0.95, 0.96, 0.98, 1.0],
    ],
  },
  {
    name: "enceladus-nearly-pure-white-ice",
    palette: [
      [0.55, 0.58, 0.62, 0.0],
      [0.72, 0.75, 0.78, 0.25],
      [0.88, 0.9, 0.92, 0.45],
      [0.8, 0.82, 0.85, 0.6],
      [0.92, 0.94, 0.96, 0.72],
      [0.85, 0.87, 0.9, 0.85],
      [0.96, 0.97, 0.99, 0.94],
      [1.0, 1.0, 1.0, 1.0],
    ],
  },
  {
    name: "pluto-like-nitrogen-ice-with-dark-tholin-patches",
    palette: [
      [0.18, 0.16, 0.14, 0.0],
      [0.35, 0.32, 0.28, 0.28],
      [0.62, 0.58, 0.52, 0.45],
      [0.28, 0.25, 0.22, 0.58],
      [0.55, 0.5, 0.44, 0.7],
      [0.72, 0.68, 0.6, 0.82],
      [0.4, 0.36, 0.32, 0.92],
      [0.68, 0.64, 0.58, 1.0],
    ],
  },
];

const HABITABLE_PALETTES: TerrainPaletteEntryType[] = [
  {
    name: "earth-like-blue-shelf-green-land-brown-peaks",
    palette: [
      [0.02, 0.07, 0.42, 0.0],
      [0.04, 0.14, 0.58, 0.4],
      [0.1, 0.42, 0.2, 0.5],
      [0.18, 0.52, 0.16, 0.6],
      [0.14, 0.44, 0.14, 0.68],
      [0.32, 0.36, 0.12, 0.76],
      [0.55, 0.38, 0.2, 0.84],
      [0.78, 0.72, 0.62, 0.92],
      [0.96, 0.98, 1.0, 1.0],
    ],
  },
  {
    name: "arid-subtropical-tan-and-ochre-continents",
    palette: [
      [0.05, 0.12, 0.48, 0.0],
      [0.12, 0.22, 0.55, 0.38],
      [0.82, 0.68, 0.32, 0.48],
      [0.92, 0.76, 0.28, 0.56],
      [0.78, 0.62, 0.22, 0.64],
      [0.88, 0.72, 0.3, 0.72],
      [0.65, 0.48, 0.2, 0.82],
      [0.85, 0.78, 0.58, 0.9],
      [0.98, 0.96, 0.9, 1.0],
    ],
  },
  {
    name: "rust-red-super-earth-landmasses",
    palette: [
      [0.04, 0.08, 0.35, 0.0],
      [0.1, 0.16, 0.42, 0.38],
      [0.72, 0.28, 0.14, 0.48],
      [0.85, 0.34, 0.16, 0.56],
      [0.68, 0.26, 0.12, 0.64],
      [0.8, 0.32, 0.14, 0.72],
      [0.58, 0.22, 0.1, 0.82],
      [0.75, 0.42, 0.24, 0.9],
      [0.94, 0.9, 0.84, 1.0],
    ],
  },
  {
    name: "high-latitude-slate-ocean-muted-tundra",
    palette: [
      [0.12, 0.18, 0.45, 0.0],
      [0.28, 0.38, 0.58, 0.36],
      [0.55, 0.58, 0.52, 0.48],
      [0.42, 0.48, 0.44, 0.56],
      [0.58, 0.6, 0.5, 0.64],
      [0.48, 0.5, 0.46, 0.74],
      [0.65, 0.64, 0.58, 0.84],
      [0.82, 0.84, 0.86, 0.92],
      [0.96, 0.98, 1.0, 1.0],
    ],
  },
  {
    name: "ocean-world-deep-blue-dominates-rare-sand-spits",
    oceanWorld: true,
    palette: [
      [0.01, 0.04, 0.28, 0.0],
      [0.02, 0.08, 0.42, 0.28],
      [0.04, 0.16, 0.58, 0.48],
      [0.06, 0.24, 0.68, 0.62],
      [0.1, 0.34, 0.74, 0.74],
      [0.14, 0.42, 0.78, 0.82],
      [0.28, 0.36, 0.3, 0.9],
      [0.42, 0.38, 0.32, 0.96],
      [0.58, 0.52, 0.44, 1.0],
    ],
  },
  {
    name: "boreal-forest-dark-pine-greens",
    palette: [
      [0.03, 0.1, 0.38, 0.0],
      [0.05, 0.18, 0.45, 0.38],
      [0.08, 0.28, 0.14, 0.48],
      [0.1, 0.34, 0.12, 0.56],
      [0.12, 0.38, 0.1, 0.64],
      [0.16, 0.32, 0.08, 0.72],
      [0.28, 0.26, 0.12, 0.82],
      [0.55, 0.5, 0.42, 0.9],
      [0.9, 0.92, 0.94, 1.0],
    ],
  },
  {
    name: "golden-savanna-grassland",
    palette: [
      [0.04, 0.12, 0.45, 0.0],
      [0.08, 0.2, 0.52, 0.36],
      [0.75, 0.62, 0.22, 0.48],
      [0.88, 0.72, 0.24, 0.56],
      [0.7, 0.58, 0.2, 0.64],
      [0.82, 0.66, 0.22, 0.72],
      [0.58, 0.46, 0.18, 0.82],
      [0.8, 0.72, 0.5, 0.9],
      [0.97, 0.95, 0.88, 1.0],
    ],
  },
  {
    name: "archipelago-teal-shallows-bright-green-islets",
    palette: [
      [0.02, 0.1, 0.45, 0.0],
      [0.04, 0.18, 0.58, 0.32],
      [0.12, 0.42, 0.28, 0.48],
      [0.28, 0.55, 0.26, 0.54],
      [0.2, 0.48, 0.22, 0.62],
      [0.35, 0.44, 0.2, 0.7],
      [0.52, 0.4, 0.24, 0.8],
      [0.72, 0.66, 0.52, 0.9],
      [0.94, 0.96, 0.98, 1.0],
    ],
  },
  {
    name: "mediterranean-olive-scrub-and-limestone-coast",
    palette: [
      [0.03, 0.1, 0.4, 0.0],
      [0.06, 0.18, 0.52, 0.36],
      [0.42, 0.48, 0.22, 0.48],
      [0.55, 0.52, 0.24, 0.56],
      [0.48, 0.44, 0.2, 0.64],
      [0.58, 0.5, 0.22, 0.72],
      [0.62, 0.52, 0.28, 0.82],
      [0.82, 0.78, 0.65, 0.9],
      [0.96, 0.95, 0.92, 1.0],
    ],
  },
  {
    name: "steppe-cool-grassland-yellow-green-plains",
    palette: [
      [0.05, 0.14, 0.4, 0.0],
      [0.1, 0.24, 0.5, 0.36],
      [0.62, 0.58, 0.28, 0.48],
      [0.72, 0.66, 0.26, 0.56],
      [0.58, 0.54, 0.24, 0.64],
      [0.68, 0.6, 0.26, 0.72],
      [0.5, 0.44, 0.2, 0.82],
      [0.75, 0.7, 0.55, 0.9],
      [0.95, 0.94, 0.9, 1.0],
    ],
  },
  {
    name: "snowball-earth-global-ice-frigid-ocean-rare-exposed-rock",
    palette: [
      [0.02, 0.04, 0.1, 0.0],
      [0.04, 0.08, 0.18, 0.32],
      [0.08, 0.14, 0.26, 0.42],
      [0.28, 0.34, 0.4, 0.52],
      [0.55, 0.62, 0.68, 0.62],
      [0.78, 0.84, 0.88, 0.72],
      [0.9, 0.94, 0.96, 0.84],
      [0.97, 0.99, 1.0, 0.94],
      [1.0, 1.0, 1.0, 1.0],
    ],
  },
];

const LAVA_PALETTES: TerrainPaletteEntryType[] = [
  {
    name: "basalt-crust-with-orange-rivers",
    palette: [
      [0.06, 0.05, 0.05, 0.0],
      [0.12, 0.09, 0.08, 0.32],
      [0.2, 0.12, 0.08, 0.52],
      [0.58, 0.2, 0.02, 0.7],
      [0.95, 0.38, 0.0, 0.84],
      [1.0, 0.72, 0.04, 0.93],
      [1.0, 0.96, 0.82, 1.0],
    ],
  },
  {
    name: "iron-rich-brown-crust",
    palette: [
      [0.12, 0.07, 0.04, 0.0],
      [0.22, 0.12, 0.06, 0.3],
      [0.32, 0.16, 0.08, 0.5],
      [0.52, 0.22, 0.06, 0.68],
      [0.82, 0.32, 0.02, 0.82],
      [0.98, 0.58, 0.02, 0.92],
      [1.0, 0.9, 0.45, 1.0],
    ],
  },
  {
    name: "ash-gray-cooled-lava",
    palette: [
      [0.14, 0.13, 0.12, 0.0],
      [0.22, 0.2, 0.18, 0.32],
      [0.3, 0.26, 0.22, 0.52],
      [0.48, 0.28, 0.12, 0.68],
      [0.75, 0.35, 0.05, 0.82],
      [0.95, 0.55, 0.08, 0.92],
      [1.0, 0.85, 0.35, 1.0],
    ],
  },
  {
    name: "deep-mantle-yellow-hot",
    palette: [
      [0.05, 0.04, 0.03, 0.0],
      [0.1, 0.07, 0.05, 0.3],
      [0.18, 0.1, 0.04, 0.5],
      [0.42, 0.18, 0.02, 0.68],
      [0.88, 0.45, 0.0, 0.82],
      [1.0, 0.7, 0.0, 0.91],
      [1.0, 0.98, 0.7, 1.0],
    ],
  },
  {
    name: "subdued-ember-glow",
    palette: [
      [0.08, 0.06, 0.05, 0.0],
      [0.14, 0.1, 0.08, 0.34],
      [0.24, 0.14, 0.09, 0.54],
      [0.45, 0.16, 0.04, 0.7],
      [0.72, 0.26, 0.01, 0.83],
      [0.92, 0.5, 0.0, 0.92],
      [1.0, 0.8, 0.2, 1.0],
    ],
  },
  {
    name: "bright-silicate-melt",
    palette: [
      [0.07, 0.05, 0.04, 0.0],
      [0.13, 0.09, 0.06, 0.31],
      [0.22, 0.13, 0.07, 0.51],
      [0.5, 0.22, 0.03, 0.69],
      [0.9, 0.4, 0.0, 0.83],
      [1.0, 0.65, 0.0, 0.91],
      [1.0, 0.94, 0.75, 1.0],
    ],
  },
  {
    name: "charcoal-with-thin-lava-veins",
    palette: [
      [0.04, 0.03, 0.03, 0.0],
      [0.08, 0.06, 0.05, 0.33],
      [0.15, 0.1, 0.07, 0.53],
      [0.38, 0.14, 0.03, 0.69],
      [0.68, 0.22, 0.01, 0.82],
      [0.9, 0.45, 0.0, 0.91],
      [1.0, 0.82, 0.25, 1.0],
    ],
  },
  {
    name: "ultramafic-green-black-rock-muted-realistic",
    palette: [
      [0.05, 0.07, 0.05, 0.0],
      [0.1, 0.14, 0.1, 0.3],
      [0.16, 0.2, 0.14, 0.5],
      [0.4, 0.22, 0.08, 0.68],
      [0.78, 0.35, 0.05, 0.82],
      [0.96, 0.58, 0.02, 0.92],
      [1.0, 0.88, 0.4, 1.0],
    ],
  },
  {
    name: "io-like-sulfur-stained-crust",
    palette: [
      [0.1, 0.08, 0.04, 0.0],
      [0.18, 0.14, 0.06, 0.3],
      [0.28, 0.2, 0.08, 0.5],
      [0.55, 0.28, 0.1, 0.68],
      [0.85, 0.42, 0.08, 0.82],
      [0.98, 0.62, 0.12, 0.92],
      [1.0, 0.9, 0.55, 1.0],
    ],
  },
  {
    name: "dark-obsidian-with-white-hot-fissures",
    palette: [
      [0.02, 0.02, 0.02, 0.0],
      [0.06, 0.05, 0.05, 0.32],
      [0.12, 0.1, 0.09, 0.52],
      [0.35, 0.12, 0.02, 0.68],
      [0.75, 0.35, 0.02, 0.82],
      [0.98, 0.75, 0.15, 0.92],
      [1.0, 0.98, 0.92, 1.0],
    ],
  },
];

const BARREN_LIGHT_PALETTES: TerrainPaletteEntryType[] = [
  {
    name: "warm-lunar-highlands",
    palette: [
      [0.28, 0.24, 0.2, 0.0],
      [0.42, 0.38, 0.34, 0.34],
      [0.58, 0.54, 0.48, 0.54],
      [0.32, 0.28, 0.24, 0.64],
      [0.52, 0.48, 0.42, 0.74],
      [0.66, 0.62, 0.56, 0.86],
      [0.76, 0.72, 0.66, 1.0],
    ],
  },
  {
    name: "cool-blue-gray-airless-rock",
    palette: [
      [0.16, 0.18, 0.22, 0.0],
      [0.28, 0.3, 0.34, 0.32],
      [0.48, 0.5, 0.52, 0.52],
      [0.22, 0.24, 0.28, 0.62],
      [0.42, 0.44, 0.46, 0.72],
      [0.56, 0.58, 0.6, 0.84],
      [0.68, 0.7, 0.72, 1.0],
    ],
  },
  {
    name: "mercury-like-dark-plains",
    palette: [
      [0.18, 0.16, 0.15, 0.0],
      [0.28, 0.25, 0.23, 0.3],
      [0.42, 0.38, 0.35, 0.5],
      [0.22, 0.2, 0.18, 0.62],
      [0.38, 0.35, 0.32, 0.74],
      [0.52, 0.48, 0.44, 0.86],
      [0.62, 0.58, 0.54, 1.0],
    ],
  },
  {
    name: "bright-anorthosite-highlands",
    palette: [
      [0.52, 0.5, 0.48, 0.0],
      [0.68, 0.66, 0.64, 0.34],
      [0.82, 0.8, 0.78, 0.54],
      [0.58, 0.56, 0.54, 0.64],
      [0.74, 0.72, 0.7, 0.74],
      [0.86, 0.84, 0.82, 0.86],
      [0.94, 0.92, 0.9, 1.0],
    ],
  },
  {
    name: "eros-like-beige-dusty-regolith",
    palette: [
      [0.48, 0.42, 0.34, 0.0],
      [0.58, 0.5, 0.4, 0.32],
      [0.72, 0.62, 0.48, 0.52],
      [0.52, 0.46, 0.36, 0.62],
      [0.66, 0.58, 0.44, 0.72],
      [0.78, 0.68, 0.52, 0.84],
      [0.88, 0.78, 0.6, 1.0],
    ],
  },
  {
    name: "carbonaceous-c-type-asteroid-dark-brown-black",
    palette: [
      [0.08, 0.07, 0.06, 0.0],
      [0.14, 0.12, 0.1, 0.32],
      [0.22, 0.18, 0.14, 0.52],
      [0.1, 0.08, 0.07, 0.62],
      [0.18, 0.15, 0.12, 0.72],
      [0.26, 0.22, 0.18, 0.84],
      [0.34, 0.28, 0.22, 1.0],
    ],
  },
  {
    name: "lunar-mare-basalt-blue-gray-lowlands",
    palette: [
      [0.14, 0.15, 0.18, 0.0],
      [0.22, 0.24, 0.28, 0.32],
      [0.34, 0.36, 0.4, 0.52],
      [0.18, 0.19, 0.22, 0.62],
      [0.28, 0.3, 0.34, 0.72],
      [0.4, 0.42, 0.46, 0.84],
      [0.5, 0.52, 0.56, 1.0],
    ],
  },
  {
    name: "callisto-dirty-ice-rock-mix",
    palette: [
      [0.2, 0.22, 0.24, 0.0],
      [0.32, 0.34, 0.36, 0.32],
      [0.48, 0.5, 0.52, 0.52],
      [0.26, 0.28, 0.3, 0.62],
      [0.4, 0.42, 0.44, 0.72],
      [0.54, 0.56, 0.58, 0.84],
      [0.66, 0.68, 0.7, 1.0],
    ],
  },
  {
    name: "phobos-rubble-tan",
    palette: [
      [0.36, 0.3, 0.24, 0.0],
      [0.48, 0.4, 0.32, 0.33],
      [0.62, 0.52, 0.4, 0.53],
      [0.4, 0.34, 0.26, 0.63],
      [0.54, 0.46, 0.36, 0.73],
      [0.68, 0.58, 0.44, 0.85],
      [0.78, 0.66, 0.5, 1.0],
    ],
  },
  {
    name: "ryugu-dark-blue-carbonaceous",
    palette: [
      [0.1, 0.12, 0.16, 0.0],
      [0.16, 0.2, 0.26, 0.32],
      [0.24, 0.3, 0.38, 0.52],
      [0.12, 0.15, 0.2, 0.62],
      [0.2, 0.25, 0.32, 0.72],
      [0.28, 0.34, 0.42, 0.84],
      [0.36, 0.42, 0.5, 1.0],
    ],
  },
];

const BARREN_HEAVY_PALETTES: TerrainPaletteEntryType[] = [
  {
    name: "venus-lava-plains-tan-orange",
    palette: [
      [0.38, 0.3, 0.22, 0.0],
      [0.52, 0.4, 0.28, 0.34],
      [0.65, 0.5, 0.32, 0.52],
      [0.42, 0.34, 0.24, 0.64],
      [0.56, 0.44, 0.28, 0.76],
      [0.68, 0.54, 0.34, 0.88],
      [0.78, 0.62, 0.4, 1.0],
    ],
  },
  {
    name: "mars-like-rust",
    palette: [
      [0.28, 0.16, 0.1, 0.0],
      [0.42, 0.24, 0.14, 0.32],
      [0.55, 0.32, 0.18, 0.5],
      [0.35, 0.2, 0.12, 0.62],
      [0.48, 0.28, 0.16, 0.74],
      [0.62, 0.36, 0.2, 0.86],
      [0.72, 0.42, 0.24, 1.0],
    ],
  },
  {
    name: "mercury-volcanic-plains-lead-gray",
    palette: [
      [0.22, 0.22, 0.24, 0.0],
      [0.34, 0.34, 0.36, 0.34],
      [0.48, 0.48, 0.5, 0.52],
      [0.28, 0.28, 0.3, 0.64],
      [0.4, 0.4, 0.42, 0.76],
      [0.52, 0.52, 0.54, 0.88],
      [0.62, 0.62, 0.64, 1.0],
    ],
  },
  {
    name: "titan-tholin-haze-brown-orange",
    palette: [
      [0.32, 0.24, 0.16, 0.0],
      [0.44, 0.32, 0.2, 0.33],
      [0.58, 0.42, 0.26, 0.52],
      [0.36, 0.28, 0.18, 0.64],
      [0.5, 0.38, 0.24, 0.76],
      [0.62, 0.48, 0.3, 0.88],
      [0.72, 0.56, 0.36, 1.0],
    ],
  },
  {
    name: "flood-basalt-plain-dark-brown-green",
    palette: [
      [0.18, 0.2, 0.14, 0.0],
      [0.28, 0.3, 0.2, 0.32],
      [0.38, 0.4, 0.28, 0.5],
      [0.22, 0.24, 0.17, 0.62],
      [0.32, 0.34, 0.24, 0.74],
      [0.42, 0.44, 0.32, 0.86],
      [0.52, 0.54, 0.4, 1.0],
    ],
  },
  {
    name: "venus-highland-rock-muted-brown-gray",
    palette: [
      [0.32, 0.28, 0.24, 0.0],
      [0.44, 0.38, 0.32, 0.34],
      [0.56, 0.48, 0.4, 0.52],
      [0.38, 0.32, 0.27, 0.64],
      [0.5, 0.42, 0.36, 0.76],
      [0.6, 0.5, 0.42, 0.88],
      [0.68, 0.58, 0.48, 1.0],
    ],
  },
  {
    name: "callisto-ice-rock-blend",
    palette: [
      [0.24, 0.26, 0.28, 0.0],
      [0.36, 0.38, 0.4, 0.33],
      [0.5, 0.52, 0.54, 0.51],
      [0.3, 0.32, 0.34, 0.63],
      [0.42, 0.44, 0.46, 0.75],
      [0.54, 0.56, 0.58, 0.87],
      [0.64, 0.66, 0.68, 1.0],
    ],
  },
  {
    name: "hematite-ridge-deep-red-rock",
    palette: [
      [0.32, 0.12, 0.08, 0.0],
      [0.48, 0.18, 0.1, 0.32],
      [0.62, 0.24, 0.12, 0.5],
      [0.38, 0.14, 0.08, 0.62],
      [0.52, 0.2, 0.1, 0.74],
      [0.66, 0.26, 0.12, 0.86],
      [0.76, 0.32, 0.14, 1.0],
    ],
  },
  {
    name: "volcanic-tuff-olive-gray",
    palette: [
      [0.22, 0.24, 0.18, 0.0],
      [0.34, 0.36, 0.28, 0.33],
      [0.46, 0.48, 0.38, 0.51],
      [0.28, 0.3, 0.22, 0.63],
      [0.4, 0.42, 0.32, 0.75],
      [0.5, 0.52, 0.4, 0.87],
      [0.6, 0.62, 0.48, 1.0],
    ],
  },
  {
    name: "io-like-sulfur-stained-volcanic-yellow-brown-not-purple",
    palette: [
      [0.3, 0.26, 0.12, 0.0],
      [0.45, 0.38, 0.18, 0.32],
      [0.58, 0.48, 0.22, 0.5],
      [0.35, 0.3, 0.14, 0.62],
      [0.5, 0.42, 0.2, 0.74],
      [0.62, 0.52, 0.24, 0.86],
      [0.72, 0.6, 0.28, 1.0],
    ],
  },
];

const ICE_GIANT_PALETTES: IceGiantPaletteEntryType[] = [
  {
    name: "neptune-deep-azure-banded",
    palette: {
      deep: [0.08, 0.22, 0.58],
      mid: [0.18, 0.42, 0.82],
      bright: [0.88, 0.94, 0.99],
      stormTint: [0.04, 0.1, 0.28],
      banded: true,
    },
  },
  {
    name: "uranus-pale-cyan-smooth",
    palette: {
      deep: [0.55, 0.78, 0.82],
      mid: [0.68, 0.86, 0.88],
      bright: [0.94, 0.98, 0.99],
      banded: false,
    },
  },
  {
    name: "saturn-class-muted-gray-blue-banded",
    palette: {
      deep: [0.22, 0.32, 0.48],
      mid: [0.38, 0.48, 0.62],
      bright: [0.82, 0.88, 0.92],
      stormTint: [0.12, 0.14, 0.2],
      banded: true,
    },
  },
  {
    name: "ammonia-teal-haze-smooth",
    palette: {
      deep: [0.12, 0.42, 0.48],
      mid: [0.28, 0.58, 0.62],
      bright: [0.86, 0.94, 0.95],
      banded: false,
    },
  },
  {
    name: "methane-green-haze-uranus-like-smooth",
    palette: {
      deep: [0.18, 0.38, 0.32],
      mid: [0.32, 0.52, 0.46],
      bright: [0.84, 0.92, 0.9],
      banded: false,
    },
  },
  {
    name: "steel-blue-banded-giant",
    palette: {
      deep: [0.14, 0.28, 0.52],
      mid: [0.26, 0.44, 0.72],
      bright: [0.8, 0.88, 0.96],
      stormTint: [0.06, 0.12, 0.22],
      banded: true,
    },
  },
  {
    name: "pearl-white-ammonia-cloud-deck-smooth",
    palette: {
      deep: [0.62, 0.7, 0.74],
      mid: [0.78, 0.84, 0.86],
      bright: [0.96, 0.99, 1.0],
      banded: false,
    },
  },
  {
    name: "indigo-storm-bands",
    palette: {
      deep: [0.06, 0.12, 0.38],
      mid: [0.14, 0.28, 0.62],
      bright: [0.72, 0.82, 0.96],
      stormTint: [0.02, 0.06, 0.18],
      banded: true,
    },
  },
  {
    name: "slate-methane-ice-smooth",
    palette: {
      deep: [0.28, 0.34, 0.4],
      mid: [0.42, 0.48, 0.54],
      bright: [0.78, 0.82, 0.86],
      banded: false,
    },
  },
  {
    name: "bright-azure-neptune-bright-variant-banded",
    palette: {
      deep: [0.1, 0.32, 0.72],
      mid: [0.22, 0.52, 0.9],
      bright: [0.9, 0.96, 1.0],
      stormTint: [0.05, 0.16, 0.38],
      banded: true,
    },
  },
];

const TERRAIN_PALETTES_BY_CATEGORY: Record<
  Exclude<PaletteCategoryType, "ice-giant">,
  TerrainPaletteEntryType[]
> = {
  desert: DESERT_PALETTES,
  "ice-world": ICE_WORLD_PALETTES,
  habitable: HABITABLE_PALETTES,
  lava: LAVA_PALETTES,
  "barren-light": BARREN_LIGHT_PALETTES,
  "barren-heavy": BARREN_HEAVY_PALETTES,
};

const PALETTES_PER_TERRAIN_CATEGORY = 10;

const formatRgbAsVec3 = (color: RgbType): string =>
  `vec3(${color[0].toFixed(5)}, ${color[1].toFixed(5)}, ${color[2].toFixed(
    5,
  )})`;

const formatIceGiantColors = (palette: IceGiantPaletteType): string => {
  const deep = formatRgbAsVec3(palette.deep);
  const mid = formatRgbAsVec3(palette.mid);
  const bright = formatRgbAsVec3(palette.bright);
  const storm = palette.stormTint
    ? formatRgbAsVec3(palette.stormTint)
    : `${deep} * 0.4`;

  if (palette.banded) {
    return `
      vec3 deepBlue = ${deep};
      vec3 midBlue  = ${mid};
      vec3 wht      = ${bright};
      color = mix(deepBlue, midBlue, band * 0.6 + noise1 * 0.3);

      float dsLon  = fract(u_seed * 3.71);
      vec3  dsC    = uvToSphere(vec2(dsLon, mix(0.35, 0.55, fract(u_seed * 5.3))));
      float dsD    = length(spherePosition - dsC);
      color        = mix(color, ${storm}, smoothstep(0.30, 0.08, dsD) * 0.8);

      float streak = fbm(spherePosition * 12.0 + vec3(u_seed * 8.0));
      color        = mix(color, wht, max(0.0, streak - 0.65) * 2.5 * (1.0 - abs(latitude) * 0.6));`;
  }

  return `
      vec3 paleTeal = ${deep};
      vec3 midTeal  = ${mid};
      vec3 wht      = ${bright};
      color = mix(midTeal, paleTeal, abs(latitude) * 0.5 + noise1 * 0.15);
      color = mix(color, wht, max(0.0, abs(latitude) - 0.85) * 4.0 * 0.4);`;
};

const paletteCount = (category: PaletteCategoryType): number =>
  category === "ice-giant"
    ? ICE_GIANT_PALETTES.length
    : TERRAIN_PALETTES_BY_CATEGORY[category].length;

const assertPaletteCounts = (): void => {
  const expected = PALETTES_PER_TERRAIN_CATEGORY;
  
  const terrainCounts: [string, number, number][] = [
    ["desert", DESERT_PALETTES.length, expected],
    ["ice-world", ICE_WORLD_PALETTES.length, expected],
    ["habitable", HABITABLE_PALETTES.length, expected + 1],
    ["lava", LAVA_PALETTES.length, expected],
    ["barren-light", BARREN_LIGHT_PALETTES.length, expected],
    ["barren-heavy", BARREN_HEAVY_PALETTES.length, expected],
    ["ice-giant", ICE_GIANT_PALETTES.length, expected],
  ];

  const terrainCountsLength = terrainCounts.length;

  for (let i = 0; i < terrainCountsLength; i++) {
    const [name, count, expectedCount] = terrainCounts[i];

    if (count !== expectedCount) {
      throw new Error(
        `Expected ${expectedCount} palettes for ${name}, got ${count}`,
      );
    }
  }
};

assertPaletteCounts();

const PALETTE_SEED_MULTIPLIERS: Record<PaletteCategoryType, number> = {
  desert: 91.7,
  "ice-world": 103.3,
  habitable: 127.9,
  lava: 83.5,
  "barren-light": 109.1,
  "barren-heavy": 113.7,
  "ice-giant": 97.1,
};

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const mixRgb = (
  colorA: RgbType,
  colorB: RgbType,
  mixFactor: number,
): RgbType => {
  const interpolation = clamp01(mixFactor);

  return [
    colorA[0] + (colorB[0] - colorA[0]) * interpolation,
    colorA[1] + (colorB[1] - colorA[1]) * interpolation,
    colorA[2] + (colorB[2] - colorA[2]) * interpolation,
  ];
};

const atmosphericHaze = (
  rgb: RgbType,
  liftAmount = 0.14,
  desaturation = 0.1,
): RgbType => {
  const luminance = 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];

  return [
    clamp01(
      rgb[0] * (1 - desaturation) + luminance * desaturation + liftAmount,
    ),
    clamp01(
      rgb[1] * (1 - desaturation) + luminance * desaturation + liftAmount,
    ),
    clamp01(
      rgb[2] * (1 - desaturation) + luminance * desaturation + liftAmount,
    ),
  ];
};

const sampleTerrainPalette = (
  palette: TerrainPaletteType,
  elevation: number,
): RgbType => {
  const stops = [...palette].sort((a, b) => a[3] - b[3]);
  const clampedElevation = clamp01(elevation);
  const stopsLength = stops.length;

  for (let index = 0; index < stopsLength - 1; index++) {
    const stop0 = stops[index];
    const stop1 = stops[index + 1];
    const deltaThreshold = stop1[3] - stop0[3];

    if (deltaThreshold <= 0) {
      continue;
    }

    if (clampedElevation < stop1[3]) {
      const mixFactor = clamp01((clampedElevation - stop0[3]) / deltaThreshold);

      return mixRgb(
        [stop0[0], stop0[1], stop0[2]],
        [stop1[0], stop1[1], stop1[2]],
        mixFactor,
      );
    }
  }

  const last = stops[stops.length - 1];

  return [last[0], last[1], last[2]];
};

const SUDARSKY_ATMOSPHERE_ZONE: Record<SudarskiClassType, RgbType> = {
  1: [0.97, 0.93, 0.82],
  2: [0.98, 0.97, 0.96],
  3: [0.45, 0.7, 0.96],
  4: [0.14, 0.07, 0.06],
  5: [0.98, 0.5, 0.08],
};

const SUDARSKY_ATMOSPHERE_EQ: Record<SudarskiClassType, RgbType> = {
  1: [0.98, 0.93, 0.8],
  2: [0.99, 0.98, 0.97],
  3: [0.5, 0.74, 0.98],
  4: [0.2, 0.1, 0.07],
  5: [1.0, 0.6, 0.12],
};

const atmosphereFromSudarsky = (sudarskyClass: SudarskiClassType): RgbType =>
  atmosphericHaze(
    mixRgb(
      SUDARSKY_ATMOSPHERE_ZONE[sudarskyClass],
      SUDARSKY_ATMOSPHERE_EQ[sudarskyClass],
      0.5,
    ),
    0.08,
    0.06,
  );

const atmosphereFromIceGiantPalette = (palette: IceGiantPaletteType): RgbType =>
  atmosphericHaze(mixRgb(palette.mid, palette.bright, 0.62), 0.1, 0.08);

const atmosphereFromTerrainPalette = (
  category: Exclude<PaletteCategoryType, "ice-giant">,
  palette: TerrainPaletteType,
  oceanWorld = false,
): RgbType => {
  let baseColor: RgbType;

  switch (category) {
    case "habitable":
      baseColor = oceanWorld
        ? mixRgb(
            sampleTerrainPalette(palette, 0.22),
            sampleTerrainPalette(palette, 0.55),
            0.75,
          )
        : mixRgb(
            sampleTerrainPalette(palette, 0.12),
            sampleTerrainPalette(palette, 0.52),
            0.42,
          );

      return atmosphericHaze(baseColor, 0.16, 0.06);
    case "desert":
      baseColor = mixRgb(
        sampleTerrainPalette(palette, 0.35),
        sampleTerrainPalette(palette, 0.58),
        0.55,
      );

      return atmosphericHaze(baseColor, 0.12, 0.05);
    case "lava":
      baseColor = mixRgb(
        sampleTerrainPalette(palette, 0.72),
        sampleTerrainPalette(palette, 0.94),
        0.55,
      );

      return atmosphericHaze(baseColor, 0.06, 0.04);
    case "ice-world":
      baseColor = mixRgb(
        sampleTerrainPalette(palette, 0.45),
        sampleTerrainPalette(palette, 0.88),
        0.5,
      );

      return atmosphericHaze(baseColor, 0.18, 0.05);
    case "barren-light":
      baseColor = sampleTerrainPalette(palette, 0.48);

      return atmosphericHaze(baseColor, 0.08, 0.12);
    case "barren-heavy":
      baseColor = mixRgb(
        sampleTerrainPalette(palette, 0.38),
        sampleTerrainPalette(palette, 0.68),
        0.5,
      );

      return atmosphericHaze(baseColor, 0.08, 0.1);
    default:
      baseColor = sampleTerrainPalette(palette, 0.4);

      return atmosphericHaze(baseColor);
  }
};

const deriveAtmosphereColor = (source: AtmosphereColorSourceType): RgbType => {
  if (source.category === "gas-giant") {
    return atmosphereFromSudarsky(source.sudarskyClass);
  }

  if (source.category === "ice-giant") {
    return atmosphereFromIceGiantPalette(source.palette);
  }

  return atmosphereFromTerrainPalette(
    source.category,
    source.palette,
    source.oceanWorld ?? false,
  );
};

const selectPaletteIndex = (
  category: PaletteCategoryType,
  massSeed: number,
  paletteEpoch: number,
  random: PaletteRandomFunctionType,
): number => {
  const roll = random(
    paletteEpoch + massSeed * PALETTE_SEED_MULTIPLIERS[category],
  );

  return Math.floor(roll * paletteCount(category));
};

type SelectPaletteType = {
  (
    category: "gas-giant",
    massSeed: number,
    paletteEpoch: number,
    random: PaletteRandomFunctionType,
  ): null;
  (
    category: "ice-giant",
    massSeed: number,
    paletteEpoch: number,
    random: PaletteRandomFunctionType,
  ): { category: "ice-giant" } & IceGiantPaletteSelectionType;
  (
    category: Exclude<PaletteCategoryType, "ice-giant">,
    massSeed: number,
    paletteEpoch: number,
    random: PaletteRandomFunctionType,
  ): { category: typeof category } & TerrainPaletteSelectionType;
};

const selectPalette = ((
  category: PlanetCategory,
  massSeed: number,
  paletteEpoch: number,
  random: PaletteRandomFunctionType,
): PaletteSelectionType | null => {
  if (category === "gas-giant") {
    return null;
  }

  const index = selectPaletteIndex(category, massSeed, paletteEpoch, random);

  if (category === "ice-giant") {
    const entry = ICE_GIANT_PALETTES[index];

    return { category, name: entry.name, palette: entry.palette, index };
  }

  const entry = TERRAIN_PALETTES_BY_CATEGORY[category][index];

  return {
    category,
    name: entry.name,
    palette: entry.palette,
    index,
    ...(entry.oceanWorld ? { oceanWorld: true } : {}),
  };
}) as SelectPaletteType;

export {
  DESERT_PALETTES,
  ICE_WORLD_PALETTES,
  HABITABLE_PALETTES,
  LAVA_PALETTES,
  BARREN_LIGHT_PALETTES,
  BARREN_HEAVY_PALETTES,
  ICE_GIANT_PALETTES,
  TERRAIN_PALETTES_BY_CATEGORY,
  PALETTES_PER_TERRAIN_CATEGORY,
  formatIceGiantColors,
  deriveAtmosphereColor,
  selectPalette,
  selectPaletteIndex,
};
