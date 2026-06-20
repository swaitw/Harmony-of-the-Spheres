import * as THREE from "three";
import Manifestation from "./manifestation";
import { ScenarioMassType, ScenarioMassesType } from "../../types/scenario";
import {
  EARTH_MASS_SOLAR,
  classifyPlanet,
  getNearestStarInfo,
  getSudarskiClass,
} from "../../physics/utils/misc";
import {
  deriveAtmosphereColor,
  formatIceGiantColors,
  selectPalette,
} from "./non-stellar-procedural-palettes";
import type {
  IceGiantPaletteType,
  RgbType,
  SudarskiClassType,
  TerrainNoiseParamsType,
  TerrainPaletteType,
} from "../../types/planet";

const TEXTURE_WIDTH = 5000;
const TEXTURE_HEIGHT = 2500;
const MAX_CRATERS = 150;
const MAX_VOLCANOES = 16;
const VOLCANO_LARGE_TERR_MASS = 0.5 * EARTH_MASS_SOLAR;
const VOLCANO_BARREN_MIN_MASS = 0.1 * EARTH_MASS_SOLAR;
const CRYO_VOLCANO_MIN_MASS = 0.25 * EARTH_MASS_SOLAR;
const FRACTAL_BROWNIAN_MOTION_OCTAVES = 8;

const VERT_SHADER = `
varying vec2 vUV;
void main() {
  vUV = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const NOISE_CORE_GLSL = `
precision highp float;

const float PI = 3.14159265358979;

vec4 _perm(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
vec4 _tis(vec4 r)  { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g  = step(x0.yzx, x0.xyz);
  vec3 l  = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod(i, 289.0);
  vec4 p = _perm(_perm(_perm(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float simplexSkewScale = 1.0 / 7.0;
  vec3 skewFactor = simplexSkewScale * D.wyz - D.xzx;
  vec4 j  = p - 49.0 * floor(p * skewFactor.z * skewFactor.z);
  vec4 x_ = floor(j * skewFactor.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x  = x_ * skewFactor.x + skewFactor.yyyy;
  vec4 y  = y_ * skewFactor.x + skewFactor.yyyy;
  vec4 h  = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 g0 = vec3(a0.xy, h.x);
  vec3 g1 = vec3(a0.zw, h.y);
  vec3 g2 = vec3(a1.xy, h.z);
  vec3 g3 = vec3(a1.zw, h.w);
  vec4 norm = _tis(vec4(dot(g0,g0), dot(g1,g1), dot(g2,g2), dot(g3,g3)));
  g0 *= norm.x; g1 *= norm.y; g2 *= norm.z; g3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;

  return 42.0 * dot(m * m, vec4(dot(g0,x0), dot(g1,x1), dot(g2,x2), dot(g3,x3)));
}

vec3 uvToSphere(vec2 uv) {
  float phi   = uv.x * 2.0 * PI;
  float theta = uv.y * PI;

  return vec3(sin(theta) * cos(phi), sin(theta) * sin(phi), cos(theta));
}`;

const WORLEY_GLSL = `
float worley(vec3 p) {
  vec3 ip = floor(p);
  vec3 fp = fract(p);
  float d1 = 9.0, d2 = 9.0;
  for (int xi = -1; xi <= 1; xi++) {
    for (int yi = -1; yi <= 1; yi++) {
      for (int zi = -1; zi <= 1; zi++) {
        vec3 g = vec3(float(xi), float(yi), float(zi));
        vec3 o = fract(sin(vec3(
          dot(ip + g, vec3(127.1, 311.7,  74.7)),
          dot(ip + g, vec3(269.5, 183.3, 246.1)),
          dot(ip + g, vec3(113.5, 271.9, 124.6))
        )) * 43758.5453) + g - fp;
        float d = dot(o, o);

        if (d < d1) { d2 = d1; d1 = d; }
        else if (d < d2) { d2 = d; }
      }
    }
  }

  return sqrt(d2) - sqrt(d1);
}
float worleyF1(vec3 p) {
  vec3 ip = floor(p);
  vec3 fp = fract(p);
  float d1 = 9.0;

  for (int xi = -1; xi <= 1; xi++) {
    for (int yi = -1; yi <= 1; yi++) {
      for (int zi = -1; zi <= 1; zi++) {
        vec3 g = vec3(float(xi), float(yi), float(zi));
        vec3 o = fract(sin(vec3(
          dot(ip + g, vec3(127.1, 311.7,  74.7)),
          dot(ip + g, vec3(269.5, 183.3, 246.1)),
          dot(ip + g, vec3(113.5, 271.9, 124.6))
        )) * 43758.5453) + g - fp;
        float d = dot(o, o);

        if (d < d1) { d1 = d; }
      }
    }
  }

  return sqrt(d1);
}`;

class NonStellarProceduralManifestation extends Manifestation {
  private renderer: THREE.WebGLRenderer;
  private allMasses: ScenarioMassesType;
  private paletteEpoch: number;
  private proceduralTextures: THREE.Texture[] = [];
  private terrainNoise: TerrainNoiseParamsType = { frequency: 1, amplitude: 1 };

  constructor(
    mass: ScenarioMassType,
    scale: number,
    textureLoader: THREE.TextureLoader,
    renderer: THREE.WebGLRenderer,
    allMasses: ScenarioMassesType,
    paletteEpoch: number,
    massIndex = 0,
  ) {
    super(mass, scale, textureLoader, massIndex);
    this.renderer = renderer;
    this.allMasses = allMasses;
    this.paletteEpoch = paletteEpoch;
  }

  private hashName(name: string): number {
    let hash = 5381;
    const nameLength = name.length;

    for (let i = 0; i < nameLength; i++) {
      hash = ((hash << 5) + hash + name.charCodeAt(i)) | 0;
    }

    return ((hash >>> 0) % 100000) / 100000;
  }

  private seededRandom(seed: number): number {
    const x = Math.sin(seed + 1.0) * 43758.5453123;

    return x - Math.floor(x);
  }

  private deriveTerrainNoiseParams(seed: number): TerrainNoiseParamsType {
    return {
      frequency: 0.75 + this.seededRandom(seed * 1201) * 0.5,
      amplitude: 0.7 + this.seededRandom(seed * 1303) * 0.6,
    };
  }

  private buildNoiseAndWorleyGLSL(params: TerrainNoiseParamsType): string {
    return `
${NOISE_CORE_GLSL}
const float u_noiseFreq = ${params.frequency.toFixed(6)};
const float u_noiseAmp  = ${params.amplitude.toFixed(6)};

float fbm(vec3 p) {
  float v = 0.0, a = 0.5, f = 1.0, mv = 0.0;
  for (int i = 0; i < ${FRACTAL_BROWNIAN_MOTION_OCTAVES}; i++) {
    v  += a * (snoise(p * f) * 0.5 + 0.5);
    mv += a; a *= 0.5; f *= 2.1;
  }

  return v / mv;
}

float fbmScaled(vec3 p) {
  return fbm(p * u_noiseFreq);
}

float terrainFbm(vec3 p) {
  return clamp((fbmScaled(p) - 0.5) * u_noiseAmp + 0.5, 0.0, 1.0);
}
${WORLEY_GLSL}
float worleyScaled(vec3 p) { return worley(p * u_noiseFreq); }
float worleyF1Scaled(vec3 p) { return worleyF1(p * u_noiseFreq); }
`;
  }

  private buildColorGradientGLSL(
    palette: TerrainPaletteType,
    functionName = "getTerrainColor",
  ): string {
    const stops = [...palette].sort((a, b) => a[3] - b[3]);
    let code = `vec3 ${functionName}(float elevation) {\n`;
    const stopsLength = stops.length;

    for (let index = 0; index < stopsLength - 1; index++) {
      const stop0 = stops[index];
      const stop1 = stops[index + 1];
      const deltaThreshold = stop1[3] - stop0[3];

      if (deltaThreshold <= 0) {
        continue;
      }

      code += `  if (elevation < ${stop1[3].toFixed(6)}) {\n`;
      code += `    float t = clamp((elevation - ${stop0[3].toFixed(
        6,
      )}) / ${deltaThreshold.toFixed(6)}, 0.0, 1.0);\n`;
      code += `    return mix(vec3(${stop0[0].toFixed(5)},${stop0[1].toFixed(
        5,
      )},${stop0[2].toFixed(5)}),`;
      code += `vec3(${stop1[0].toFixed(5)},${stop1[1].toFixed(
        5,
      )},${stop1[2].toFixed(5)}), t);\n`;
      code += `  }\n`;
    }

    const last = stops[stops.length - 1];
    code += `  return vec3(${last[0].toFixed(5)},${last[1].toFixed(
      5,
    )},${last[2].toFixed(5)});\n}`;

    return code;
  }

  private buildGasGiantFrag(sudarskiClass: SudarskiClassType): string {
    const classGlsl: Record<number, string> = {
      1: `

      vec3 beltDark    = vec3(0.50, 0.25, 0.08);
      vec3 beltMid     = vec3(0.70, 0.41, 0.16);
      vec3 beltBright  = vec3(0.74, 0.48, 0.20);
      vec3 zoneDark    = vec3(0.85, 0.72, 0.48);
      vec3 zoneLight   = vec3(0.97, 0.93, 0.82);
      vec3 eqHighlight = vec3(0.98, 0.93, 0.80);
      vec3 festoonTint = vec3(0.32, 0.37, 0.52);
      vec3 polarA      = vec3(0.28, 0.18, 0.11);
      vec3 polarB      = vec3(0.40, 0.28, 0.19);
      vec3 stormBright = vec3(0.95, 0.91, 0.84);
      vec3 stormDark   = vec3(0.86, 0.52, 0.18);
      vec3 greatRedSpotColor      = vec3(0.80, 0.22, 0.04);
      vec3 bargeTint   = vec3(0.35, 0.17, 0.07);
      float stormVisibility   = 1.0;`,

      2: `

      vec3 beltDark    = vec3(0.80, 0.78, 0.74);
      vec3 beltMid     = vec3(0.88, 0.85, 0.80);
      vec3 beltBright  = vec3(0.92, 0.90, 0.86);
      vec3 zoneDark    = vec3(0.92, 0.88, 0.80);
      vec3 zoneLight   = vec3(0.98, 0.97, 0.96);
      vec3 eqHighlight = vec3(0.99, 0.98, 0.97);
      vec3 festoonTint = vec3(0.73, 0.84, 0.94);
      vec3 polarA      = vec3(0.75, 0.82, 0.92);
      vec3 polarB      = vec3(0.88, 0.93, 0.98);
      vec3 stormBright = vec3(0.99, 0.98, 0.95);
      vec3 stormDark   = vec3(0.65, 0.75, 0.90);
      vec3 greatRedSpotColor      = vec3(0.60, 0.75, 0.92);
      vec3 bargeTint   = vec3(0.65, 0.78, 0.88);
      float stormVisibility   = 0.75;`,

      3: `

      vec3 beltDark    = vec3(0.18, 0.42, 0.82);
      vec3 beltMid     = vec3(0.25, 0.52, 0.88);
      vec3 beltBright  = vec3(0.35, 0.62, 0.94);
      vec3 zoneDark    = vec3(0.30, 0.58, 0.92);
      vec3 zoneLight   = vec3(0.45, 0.70, 0.96);
      vec3 eqHighlight = vec3(0.50, 0.74, 0.98);
      vec3 festoonTint = vec3(0.10, 0.28, 0.68);
      vec3 polarA      = vec3(0.10, 0.30, 0.72);
      vec3 polarB      = vec3(0.22, 0.48, 0.86);
      vec3 stormBright = vec3(0.55, 0.78, 0.98);
      vec3 stormDark   = vec3(0.08, 0.25, 0.64);
      vec3 greatRedSpotColor      = vec3(0.08, 0.20, 0.58);
      vec3 bargeTint   = vec3(0.06, 0.18, 0.52);
      float stormVisibility   = 0.55;`,

      4: `

      vec3 beltDark    = vec3(0.04, 0.03, 0.04);
      vec3 beltMid     = vec3(0.10, 0.06, 0.07);
      vec3 beltBright  = vec3(0.18, 0.08, 0.05);
      vec3 zoneDark    = vec3(0.06, 0.04, 0.05);
      vec3 zoneLight   = vec3(0.14, 0.07, 0.06);
      vec3 eqHighlight = vec3(0.20, 0.10, 0.07);
      vec3 festoonTint = vec3(0.03, 0.04, 0.10);
      vec3 polarA      = vec3(0.03, 0.02, 0.03);
      vec3 polarB      = vec3(0.06, 0.04, 0.05);
      vec3 stormBright = vec3(0.22, 0.12, 0.08);
      vec3 stormDark   = vec3(0.02, 0.01, 0.02);
      vec3 greatRedSpotColor      = vec3(0.20, 0.08, 0.05);
      vec3 bargeTint   = vec3(0.02, 0.01, 0.02);
      float stormVisibility   = 0.65;`,

      5: `

      vec3 beltDark    = vec3(0.52, 0.08, 0.02);
      vec3 beltMid     = vec3(0.72, 0.10, 0.02);
      vec3 beltBright  = vec3(0.88, 0.25, 0.04);
      vec3 zoneDark    = vec3(0.88, 0.40, 0.06);
      vec3 zoneLight   = vec3(0.98, 0.50, 0.08);
      vec3 eqHighlight = vec3(1.00, 0.60, 0.12);
      vec3 festoonTint = vec3(0.40, 0.06, 0.02);
      vec3 polarA      = vec3(0.40, 0.05, 0.01);
      vec3 polarB      = vec3(0.55, 0.10, 0.03);
      vec3 stormBright = vec3(1.00, 0.85, 0.55);
      vec3 stormDark   = vec3(0.45, 0.05, 0.01);
      vec3 greatRedSpotColor      = vec3(1.00, 0.78, 0.20);
      vec3 bargeTint   = vec3(0.30, 0.04, 0.01);
      float stormVisibility   = 0.80;`,
    };

    return `
    ${this.buildNoiseAndWorleyGLSL(this.terrainNoise)}
    varying vec2 vUV;
    uniform float u_seed;

    void main() {
      vec3  spherePosition  = uvToSphere(vUV);
      float latitude = spherePosition.z;
      vec3  color;

      ${classGlsl[sudarskiClass]}

      float absoluteLatitude = abs(latitude);
      float waveNoise1  = terrainFbm(spherePosition * 3.2  + vec3(u_seed * 4.31, u_seed * 1.78, 0.0));
      float waveNoise2  = terrainFbm(spherePosition * 9.8  + vec3(u_seed * 7.23, 0.0,           u_seed * 3.41));
      float waveNoise3  = terrainFbm(spherePosition * 24.0 + vec3(0.0,           u_seed * 5.87, u_seed * 9.34));
      float waveNoise4  = terrainFbm(spherePosition * 56.0 + vec3(u_seed * 3.15, u_seed * 8.62, 0.0));
      float jetStreamWidth  = 1.0 - smoothstep(0.0, 0.70, absoluteLatitude);
      float windTurbulence = ((waveNoise1 - 0.5) * 0.22 + (waveNoise2 - 0.5) * 0.08
                   + (waveNoise3 - 0.5) * 0.025 + (waveNoise4 - 0.5) * 0.006)
                   * (0.4 + jetStreamWidth * 0.6);
      float distortedLatitude = clamp(absoluteLatitude + windTurbulence, 0.0, 1.0);

      float phase   = distortedLatitude * PI * 5.5;
      float beltValue = 0.50 * sin(phase)
                 + 0.22 * sin(phase * 2.05 + u_seed * 2.84)
                 + 0.12 * sin(phase * 3.58 + u_seed * 5.13)
                 + 0.07 * sin(phase * 4.91 + u_seed * 1.67)
                 + 0.04 * sin(phase * 7.37 + u_seed * 3.92)
                 + 0.02 * sin(phase * 11.3  + u_seed * 6.78)
                 + 0.01 * sin(phase * 18.7  + u_seed * 4.31);

      float beltMask = smoothstep(-0.60, 0.60, beltValue);

      float highFrequencyNoiseA = terrainFbm(spherePosition * 44.0 + vec3(u_seed * 11.3, u_seed *  3.7, 0.0));
      float highFrequencyNoiseB = terrainFbm(spherePosition * 88.0 + vec3(u_seed *  2.1, u_seed *  6.8, u_seed * 9.4));

      float beltTexture  = terrainFbm(spherePosition *  2.8 + vec3(u_seed * 6.41, u_seed * 3.12, 0.0));
      float beltTextureSecondary = terrainFbm(spherePosition *  8.0 + vec3(u_seed * 1.92, u_seed * 7.43, 0.0));
      vec3  beltColor  = mix(beltDark, mix(beltMid, beltBright, beltTexture), beltTexture * 0.75);
      beltColor = mix(beltColor, beltMid, beltTextureSecondary * 0.30);
      float zoneTexture  = terrainFbm(spherePosition *  4.0 + vec3(u_seed * 1.93, u_seed * 8.14, 0.0));
      float zoneTextureSecondary = terrainFbm(spherePosition * 11.0 + vec3(u_seed * 5.67, u_seed * 2.34, 0.0));
      vec3  zoneColor  = mix(zoneDark, zoneLight, zoneTexture * 0.55 + 0.3);
      zoneColor = mix(zoneColor, zoneDark * 1.05, (1.0 - zoneTextureSecondary) * 0.20);
      color = mix(beltColor, zoneColor, beltMask);

      float edgePower = 1.0 - abs(beltMask * 2.0 - 1.0);
      color = mix(color, mix(beltColor, beltMid,   highFrequencyNoiseA), edgePower * highFrequencyNoiseA * 0.28);
      color = mix(color, mix(zoneColor, zoneLight, highFrequencyNoiseB), edgePower * highFrequencyNoiseB * beltMask * 0.18);

      color = mix(color, eqHighlight, smoothstep(0.14, 0.0, absoluteLatitude) * 0.50);

      float festoonNoise  = terrainFbm(spherePosition * 15.5 + vec3(u_seed * 8.83, u_seed * 2.31, 0.0));
      float festoonNoiseSecondary = terrainFbm(spherePosition * 32.0 + vec3(u_seed * 4.17, u_seed * 9.55, 0.0));
      color = mix(color, festoonTint,
                  edgePower * max(0.0, festoonNoise  - 0.53) * 2.6 * 0.40
                  * smoothstep(0.22, 0.0, absoluteLatitude));
      color = mix(color, festoonTint * 0.85,
                  edgePower * max(0.0, festoonNoiseSecondary - 0.58) * 2.2 * 0.25
                  * smoothstep(0.30, 0.0, absoluteLatitude));

      float poleRadius     = length(spherePosition.xy);
      float polarFactor = smoothstep(0.55, 0.90, absoluteLatitude);
      float polarNoise1 = terrainFbm(spherePosition *  7.0 + vec3(u_seed * 2.31, u_seed * 5.87, u_seed * 1.23));
      float polarNoise2 = terrainFbm(spherePosition * 15.0 + vec3(u_seed * 7.43, u_seed * 1.65, u_seed * 3.79));
      float polarNoise3 = terrainFbm(spherePosition * 30.0 + vec3(u_seed * 4.12, u_seed * 8.93, u_seed * 6.54));
      vec3 polarColor = mix(polarA, polarB, polarNoise1 * 0.7 + polarNoise2 * 0.3);
      polarColor = mix(polarColor, beltDark * 0.75,  polarNoise3 * 0.38);
      polarColor = mix(polarColor, zoneLight * 0.60, (1.0 - polarNoise1) * polarNoise2 * 0.28);
      color = mix(color, polarColor, polarFactor * 0.80);

      float vortexZone = smoothstep(0.985, 0.998, absoluteLatitude);
      float eyeRadius       = 0.08 + polarNoise1 * 0.025;
      float vortexEye  = (1.0 - smoothstep(0.0, eyeRadius, poleRadius)) * vortexZone;
      color = mix(color, polarA * 0.55, vortexEye * 0.72);
      float vortexRing = exp(-pow((poleRadius - eyeRadius * 1.2) * 14.0, 2.0)) * vortexZone;
      color = mix(color, zoneLight * 0.82, vortexRing * 0.50);

      float cyclonicPerturbationFactor = smoothstep(0.975, 0.984, absoluteLatitude) * (1.0 - smoothstep(0.997, 1.0, absoluteLatitude));
      float cyclonicPerturbationRadius = 0.12; float cyclonicPerturbationWidth = 0.028; float cyclonicPerturbationSeed = u_seed * 6.28318;
      vec2 cyclonicPerturbationPosition = spherePosition.xy; float cyclonicPerturbationValue;
      cyclonicPerturbationValue = 1.0 - smoothstep(0.0, cyclonicPerturbationWidth, length(cyclonicPerturbationPosition - vec2(cyclonicPerturbationRadius*cos(0.0000+cyclonicPerturbationSeed), cyclonicPerturbationRadius*sin(0.0000+cyclonicPerturbationSeed))));
      color = mix(color, polarA * 0.60, cyclonicPerturbationValue * cyclonicPerturbationFactor * 0.62);
      cyclonicPerturbationValue = 1.0 - smoothstep(0.0, cyclonicPerturbationWidth, length(cyclonicPerturbationPosition - vec2(cyclonicPerturbationRadius*cos(0.7854+cyclonicPerturbationSeed), cyclonicPerturbationRadius*sin(0.7854+cyclonicPerturbationSeed))));
      color = mix(color, polarA * 0.60, cyclonicPerturbationValue * cyclonicPerturbationFactor * 0.62);
      cyclonicPerturbationValue = 1.0 - smoothstep(0.0, cyclonicPerturbationWidth, length(cyclonicPerturbationPosition - vec2(cyclonicPerturbationRadius*cos(1.5708+cyclonicPerturbationSeed), cyclonicPerturbationRadius*sin(1.5708+cyclonicPerturbationSeed))));
      color = mix(color, polarA * 0.60, cyclonicPerturbationValue * cyclonicPerturbationFactor * 0.62);
      cyclonicPerturbationValue = 1.0 - smoothstep(0.0, cyclonicPerturbationWidth, length(cyclonicPerturbationPosition - vec2(cyclonicPerturbationRadius*cos(2.3562+cyclonicPerturbationSeed), cyclonicPerturbationRadius*sin(2.3562+cyclonicPerturbationSeed))));
      color = mix(color, polarA * 0.60, cyclonicPerturbationValue * cyclonicPerturbationFactor * 0.62);
      cyclonicPerturbationValue = 1.0 - smoothstep(0.0, cyclonicPerturbationWidth, length(cyclonicPerturbationPosition - vec2(cyclonicPerturbationRadius*cos(3.1416+cyclonicPerturbationSeed), cyclonicPerturbationRadius*sin(3.1416+cyclonicPerturbationSeed))));
      color = mix(color, polarA * 0.60, cyclonicPerturbationValue * cyclonicPerturbationFactor * 0.62);
      cyclonicPerturbationValue = 1.0 - smoothstep(0.0, cyclonicPerturbationWidth, length(cyclonicPerturbationPosition - vec2(cyclonicPerturbationRadius*cos(3.9270+cyclonicPerturbationSeed), cyclonicPerturbationRadius*sin(3.9270+cyclonicPerturbationSeed))));
      color = mix(color, polarA * 0.60, cyclonicPerturbationValue * cyclonicPerturbationFactor * 0.62);
      cyclonicPerturbationValue = 1.0 - smoothstep(0.0, cyclonicPerturbationWidth, length(cyclonicPerturbationPosition - vec2(cyclonicPerturbationRadius*cos(4.7124+cyclonicPerturbationSeed), cyclonicPerturbationRadius*sin(4.7124+cyclonicPerturbationSeed))));
      color = mix(color, polarA * 0.60, cyclonicPerturbationValue * cyclonicPerturbationFactor * 0.62);
      cyclonicPerturbationValue = 1.0 - smoothstep(0.0, cyclonicPerturbationWidth, length(cyclonicPerturbationPosition - vec2(cyclonicPerturbationRadius*cos(5.4978+cyclonicPerturbationSeed), cyclonicPerturbationRadius*sin(5.4978+cyclonicPerturbationSeed))));
      color = mix(color, polarA * 0.60, cyclonicPerturbationValue * cyclonicPerturbationFactor * 0.62);

      float greatRedSpotLongitude = fract(u_seed * 7.391);
      vec3  greatRedSpotCenter   = uvToSphere(vec2(greatRedSpotLongitude, 0.628));
      vec3  greatRedSpotDelta = spherePosition - greatRedSpotCenter;
      float greatRedSpotDistance  = length(greatRedSpotDelta * vec3(0.70, 1.30, 1.0));
      float greatRedSpotOuter = smoothstep(0.31, 0.12, greatRedSpotDistance);
      float greatRedSpotInner = smoothstep(0.15, 0.04, greatRedSpotDistance);
      float greatRedSpotVorticity  = terrainFbm(spherePosition * 12.5 + greatRedSpotCenter * 3.0 + vec3(u_seed * 3.14));
      color = mix(color, greatRedSpotColor,                        greatRedSpotOuter * 0.84 * stormVisibility);
      color = mix(color, mix(greatRedSpotColor, zoneLight, 0.40),  greatRedSpotVorticity * greatRedSpotInner * 0.58 * stormVisibility);
      color = mix(color, greatRedSpotColor * 0.75,                 (greatRedSpotOuter - greatRedSpotInner) * 0.44 * stormVisibility);
      color = mix(color, mix(greatRedSpotColor, zoneLight, 0.60),  greatRedSpotInner * (1.0 - greatRedSpotVorticity * 0.6) * 0.42 * stormVisibility);

      vec3  ovalStorm1Center = uvToSphere(vec2(fract(u_seed * 3.618 + 0.41), 0.683));
      float ovalStorm1  = smoothstep(0.12, 0.03, length(spherePosition - ovalStorm1Center));
      color = mix(color, stormBright, ovalStorm1 * 0.72 * stormVisibility);

      vec3  ovalStorm2Center = uvToSphere(vec2(fract(u_seed * 2.718 + 0.67), 0.356));
      float ovalStorm2  = smoothstep(0.10, 0.03, length(spherePosition - ovalStorm2Center));
      color = mix(color, stormDark, ovalStorm2 * 0.62 * stormVisibility);

      vec3  ovalStorm3Center = uvToSphere(vec2(fract(u_seed * 1.414 + 0.22), 0.600));
      float ovalStorm3  = smoothstep(0.07, 0.02, length(spherePosition - ovalStorm3Center));
      color = mix(color, stormBright, ovalStorm3 * 0.58 * stormVisibility);

      vec3  ovalStorm4Center = uvToSphere(vec2(fract(u_seed * 4.236 + 0.15), 0.450));
      float ovalStorm4  = smoothstep(0.07, 0.02, length(spherePosition - ovalStorm4Center));
      color = mix(color, stormBright * 0.95, ovalStorm4 * 0.52 * stormVisibility);

      vec3  ovalStorm5Center = uvToSphere(vec2(fract(u_seed * 5.123 + 0.88), 0.540));
      float ovalStorm5  = smoothstep(0.06, 0.02, length(spherePosition - ovalStorm5Center));
      color = mix(color, stormBright * 0.92, ovalStorm5 * 0.50 * stormVisibility);

      vec3  ovalStorm6Center = uvToSphere(vec2(fract(u_seed * 7.654 + 0.53), 0.470));
      float ovalStorm6  = smoothstep(0.05, 0.015, length(spherePosition - ovalStorm6Center));
      color = mix(color, stormBright * 0.96, ovalStorm6 * 0.48 * stormVisibility);

      vec3  barge1Delta = spherePosition - uvToSphere(vec2(fract(u_seed * 6.789 + 0.33), 0.430));
      float barge1  = smoothstep(0.10, 0.03, length(barge1Delta * vec3(0.45, 1.6, 1.0)));
      color = mix(color, bargeTint, barge1 * 0.72 * stormVisibility);

      vec3  barge2Delta = spherePosition - uvToSphere(vec2(fract(u_seed * 8.321 + 0.74), 0.435));
      float barge2  = smoothstep(0.09, 0.025, length(barge2Delta * vec3(0.45, 1.6, 1.0)));
      color = mix(color, bargeTint, barge2 * 0.68 * stormVisibility);

      color *= 1.0 - abs(latitude) * 0.12;
      gl_FragColor = vec4(color, 1.0);
    }`;
  }

  private buildIceGiantFrag(icePalette: IceGiantPaletteType): string {
    const body = formatIceGiantColors(icePalette);

    return `
    ${this.buildNoiseAndWorleyGLSL(this.terrainNoise)}
    varying vec2 vUV;
    uniform float u_seed;

    void main() {
      vec3  spherePosition   = uvToSphere(vUV);
      float latitude  = spherePosition.z;
      float displacement = (fbmScaled(spherePosition * 3.0 + vec3(u_seed * 5.1)) - 0.5) * 0.1;
      float band = fract((latitude + 1.0) * 0.5 * 4.0 + displacement);
      float noise1   = terrainFbm(spherePosition * 6.0 + vec3(u_seed * 2.3));
      vec3  color;
      ${body}
      gl_FragColor = vec4(color, 1.0);
    }`;
  }

  private buildLavaFrag(palette: TerrainPaletteType): string {
    return `
    ${this.buildNoiseAndWorleyGLSL(this.terrainNoise)}
    ${this.buildColorGradientGLSL(palette, "getTerrainColor")}
    varying vec2 vUV;
    uniform float u_seed;

    void main() {
      vec3  spherePosition     = uvToSphere(vUV);
      float height = terrainFbm(spherePosition * 3.0 + vec3(u_seed * 7.3, u_seed * 2.1, u_seed * 4.9));

      float worleyFeature       = terrainFbm(spherePosition * 6.0 + vec3(u_seed * 1.2));
      float lavaLine = 1.0 - smoothstep(0.0, 0.04, abs(worleyFeature - 0.5));
      float hotSpot  = terrainFbm(spherePosition * 14.0 + vec3(u_seed * 3.3));

      vec3 rock      = getTerrainColor(height);
      vec3 lavaHot   = getTerrainColor(0.92);
      vec3 lavaMid   = getTerrainColor(0.78);
      vec3 lavaBright = getTerrainColor(1.0);

      float glow     = lavaLine * (0.5 + hotSpot * 0.5);
      vec3 lavaColor = mix(lavaMid, lavaHot, hotSpot);
      lavaColor      = mix(lavaColor, lavaBright, max(0.0, hotSpot - 0.75) * 4.0);
      vec3 color     = mix(rock, lavaColor, clamp(glow * 1.8, 0.0, 1.0));

      float caldera  = terrainFbm(spherePosition * 20.0 + vec3(u_seed * 9.1));
      color          = mix(color, getTerrainColor(0.02), max(0.0, caldera - 0.77) * 5.0);
      color          = mix(color, lavaMid, (1.0 - smoothstep(0.0, 0.05, abs(caldera - 0.72))) * 0.5);

      gl_FragColor = vec4(color, 1.0);
    }`;
  }

  private buildLavaBumpFrag(): string {
    return `
    ${this.buildNoiseAndWorleyGLSL(this.terrainNoise)}
    varying vec2 vUV;
    uniform float u_seed;

    void main() {
      vec3 spherePosition  = uvToSphere(vUV);
      float height  = terrainFbm(spherePosition * 4.0 + vec3(u_seed * 7.3, u_seed * 2.1, u_seed * 4.9));
      float crack = 1.0 - smoothstep(0.0, 0.03, abs(fbmScaled(spherePosition * 8.0 + vec3(u_seed)) - 0.5));
      height = clamp(mix(height, 1.0, crack * 0.4), 0.0, 1.0);
      gl_FragColor = vec4(vec3(height), 1.0);
    }`;
  }

  private buildBarrenFrag(
    isHeavy: boolean,
    palette: TerrainPaletteType,
    craterPositions: THREE.Vector3[],
    craterRadii: number[],
    volcanoPositions: THREE.Vector3[] = [],
    volcanoRadii: number[] = [],
  ): string {
    const count = Math.min(craterPositions.length, MAX_CRATERS);
    const volcanoCount = Math.min(volcanoPositions.length, MAX_VOLCANOES);

    const volcanoDeclaration = this.buildVolcanoDeclGLSL(
      volcanoPositions,
      volcanoRadii,
      volcanoCount,
    );
    const volcanoElevation =
      volcanoCount > 0
        ? `${this.buildTerrestrialVolcanoElevationGLSL(
            volcanoCount,
            "elevation",
          )}`
        : "";
    const volcanoInitialization =
      volcanoCount > 0
        ? `float volcanoMask = 0.0;
      float volcanoSummit = 0.0;`
        : "";
    const volcanoColor =
      volcanoCount > 0
        ? this.buildTerrestrialVolcanoColorGLSL(
            "smoothstep(0.28, 0.52, elevation)",
          )
        : "";

    let craterDeclaration = "";

    for (let i = 0; i < count; i++) {
      const position = craterPositions[i];

      craterDeclaration += `  vec3  craterPosition${i} = vec3(${position.x.toFixed(
        6,
      )}, ${position.y.toFixed(6)}, ${position.z.toFixed(6)});\n`;
      craterDeclaration += `  float craterRadius${i} = ${craterRadii[i].toFixed(
        6,
      )};\n`;
    }

    let craterProcessingCode = "";

    for (let i = 0; i < count; i++) {
      craterProcessingCode += `
  {
    float dist = length(spherePosition - craterPosition${i});
    float normalizedRadius = dist / craterRadius${i};

    if (normalizedRadius < 1.5) {
      float bowl = -0.25 * max(0.0, 1.0 - normalizedRadius * normalizedRadius);
      float rim  =  0.12 * exp(-pow((normalizedRadius - 1.0) * 5.0, 2.0));
      elevation  += bowl + rim;
      craterMask  = max(craterMask, smoothstep(1.5, 0.5, normalizedRadius));
    }
  }`;
    }

    const colorAndCraterGlsl = isHeavy
      ? `

      float noise1  = terrainFbm(spherePosition * 4.0 + vec3(u_seed * 3.1));
      float normalVariation  = terrainFbm(spherePosition * 8.0 + vec3(u_seed * 7.5));
      color = getTerrainColor(elevation);
      color = mix(color, getTerrainColor(0.85), smoothstep(0.6, 0.75, normalVariation) * 0.5);
      color = mix(color, getTerrainColor(0.15), noise1 * 0.12);
      float floorDark = max(0.0, -elevation + 0.05) * craterMask;
      color = mix(color, color * 0.55, clamp(floorDark * 2.0, 0.0, 1.0));
      float rimBright = max(0.0, elevation - 0.02) * craterMask;
      color = mix(color, color * 1.28, clamp(rimBright * 4.0, 0.0, 1.0));`
      : `

      float mareNoise = terrainFbm(spherePosition * 1.3 + vec3(u_seed * 5.3, u_seed * 2.7, u_seed * 8.1));
      float mare      = smoothstep(0.50, 0.64, mareNoise);

      float noise1   = terrainFbm(spherePosition * 7.0  + vec3(u_seed * 3.1, u_seed * 6.5, u_seed * 1.9));
      float pittingNoise1 = terrainFbm(spherePosition * 22.0 + vec3(u_seed * 1.7, u_seed * 4.2, u_seed * 0.8));
      float pittingNoise2 = terrainFbm(spherePosition * 48.0 + vec3(u_seed * 6.1, u_seed * 2.3, u_seed * 9.4));
      float pitting = pittingNoise1 * 0.6 + pittingNoise2 * 0.4;

      vec3 highland = getTerrainColor(elevation);
      vec3 basalt   = getTerrainColor(elevation * 0.35);
      color = mix(highland, basalt, mare);

      color *= (0.80 + pitting * 0.40);

      float craterVisibility = mix(1.0, 0.35, mare);
      float floorDark = max(0.0, -elevation + 0.05) * craterMask * craterVisibility;
      color = mix(color, color * 0.45, clamp(floorDark * 2.5, 0.0, 1.0));
      float rimBright = max(0.0, elevation - 0.015) * craterMask * craterVisibility;

      vec3 ejectaColor = mix(highland * 1.25, getTerrainColor(0.95), 0.3);
      color = mix(color, ejectaColor, clamp(rimBright * 5.0, 0.0, 1.0));

      { float worleyFeature = worleyF1Scaled(spherePosition * 8.0 + vec3(u_seed * 3.7, u_seed * 9.1, u_seed * 2.3));
        float visibility = mix(1.0, 0.30, mare);
        color = mix(color, color * 0.48, smoothstep(0.40, 0.10, worleyFeature) * 0.60 * visibility);
        color = mix(color, ejectaColor * 1.10, exp(-pow((worleyFeature - 0.42) * 8.0, 2.0)) * 0.32 * visibility); }

      { float worleyFeature = worleyF1Scaled(spherePosition * 18.0 + vec3(u_seed * 5.5, u_seed * 1.8, u_seed * 7.3));
        float visibility = mix(1.0, 0.20, mare);
        color = mix(color, color * 0.50, smoothstep(0.40, 0.10, worleyFeature) * 0.50 * visibility);
        color = mix(color, ejectaColor * 1.06, exp(-pow((worleyFeature - 0.42) * 9.0, 2.0)) * 0.22 * visibility); }

      { float worleyFeature = worleyF1Scaled(spherePosition * 40.0 + vec3(u_seed * 8.2, u_seed * 3.4, u_seed * 6.6));
        float visibility = mix(1.0, 0.15, mare);
        color = mix(color, color * 0.54, smoothstep(0.40, 0.10, worleyFeature) * 0.40 * visibility);
        color = mix(color, ejectaColor, exp(-pow((worleyFeature - 0.42) * 11.0, 2.0)) * 0.14 * visibility); }

      { float worleyFeature = worleyF1Scaled(spherePosition * 90.0 + vec3(u_seed * 2.1, u_seed * 7.8, u_seed * 4.4));
        float visibility = mix(1.0, 0.10, mare);
        color = mix(color, color * 0.58, smoothstep(0.40, 0.10, worleyFeature) * 0.28 * visibility); }`;

    return `
    ${this.buildNoiseAndWorleyGLSL(this.terrainNoise)}
    ${this.buildColorGradientGLSL(palette, "getTerrainColor")}
    varying vec2 vUV;
    uniform float u_seed;

    void main() {
      vec3  spherePosition        = uvToSphere(vUV);
      ${craterDeclaration}
      ${volcanoDeclaration}
      float elevation = terrainFbm(spherePosition * 5.0 + vec3(u_seed * 2.7, u_seed * 1.3, u_seed * 4.1));
      float craterMask = 0.0;
      ${craterProcessingCode}
      ${volcanoInitialization}
      ${volcanoElevation}
      elevation = clamp(elevation, 0.0, 1.0);

      vec3 color;
      ${colorAndCraterGlsl}
      ${volcanoColor}

      gl_FragColor = vec4(color, 1.0);
    }`;
  }

  private buildBarrenBumpFrag(
    isHeavy: boolean,
    craterPositions: THREE.Vector3[],
    craterRadii: number[],
    volcanoPositions: THREE.Vector3[] = [],
    volcanoRadii: number[] = [],
  ): string {
    const count = Math.min(craterPositions.length, MAX_CRATERS);
    const volcanoCount = Math.min(volcanoPositions.length, MAX_VOLCANOES);

    const volcanoDeclaration = this.buildVolcanoDeclGLSL(
      volcanoPositions,
      volcanoRadii,
      volcanoCount,
    );
    const volcanoElevation =
      volcanoCount > 0
        ? `float volcanoMask = 0.0;
      float volcanoSummit = 0.0;
      ${this.buildTerrestrialVolcanoElevationGLSL(volcanoCount, "height")}`
        : "";

    let craterDeclaration = "";

    for (let i = 0; i < count; i++) {
      const position = craterPositions[i];

      craterDeclaration += `  vec3  craterPosition${i} = vec3(${position.x.toFixed(
        6,
      )}, ${position.y.toFixed(6)}, ${position.z.toFixed(6)});\n`;
      craterDeclaration += `  float craterRadius${i} = ${craterRadii[i].toFixed(
        6,
      )};\n`;
    }

    let craterProcessingCode = "";

    for (let i = 0; i < count; i++) {
      craterProcessingCode += `
  {
    float dist = length(spherePosition - craterPosition${i});
    float normalizedRadius = dist / craterRadius${i};

    if (normalizedRadius < 1.5) {
      height += -0.30 * max(0.0, 1.0 - normalizedRadius * normalizedRadius)
         +  0.15 * exp(-pow((normalizedRadius - 1.0) * 5.0, 2.0));
    }
  }`;
    }

    const finalGlsl = isHeavy
      ? `gl_FragColor = vec4(vec3(clamp(height * 0.5 + 0.5, 0.0, 1.0)), 1.0);`
      : `
      float mareNoise = terrainFbm(spherePosition * 1.3 + vec3(u_seed * 5.3, u_seed * 2.7, u_seed * 8.1));
      float mare      = smoothstep(0.50, 0.64, mareNoise);
      float pitting       = terrainFbm(spherePosition * 22.0 + vec3(u_seed * 1.7, u_seed * 4.2, u_seed * 0.8));
      height = mix(height, 0.0, mare * 0.65);
      height += (pitting - 0.5) * 0.18 * (1.0 - mare * 0.85);

      { float worleyFeature = worleyF1Scaled(spherePosition * 8.0  + vec3(u_seed * 3.7, u_seed * 9.1, u_seed * 2.3));
        float visibility = mix(1.0, 0.30, mare);
        height += (-0.20 * smoothstep(0.40, 0.05, worleyFeature) + 0.10 * exp(-pow((worleyFeature - 0.42) * 8.0, 2.0))) * visibility; }
      { float worleyFeature = worleyF1Scaled(spherePosition * 18.0 + vec3(u_seed * 5.5, u_seed * 1.8, u_seed * 7.3));
        float visibility = mix(1.0, 0.20, mare);
        height += (-0.14 * smoothstep(0.40, 0.05, worleyFeature) + 0.07 * exp(-pow((worleyFeature - 0.42) * 9.0, 2.0))) * visibility; }
      { float worleyFeature = worleyF1Scaled(spherePosition * 40.0 + vec3(u_seed * 8.2, u_seed * 3.4, u_seed * 6.6));
        float visibility = mix(1.0, 0.15, mare);
        height += (-0.08 * smoothstep(0.40, 0.05, worleyFeature) + 0.04 * exp(-pow((worleyFeature - 0.42) * 11.0, 2.0))) * visibility; }
      { float worleyFeature = worleyF1Scaled(spherePosition * 90.0 + vec3(u_seed * 2.1, u_seed * 7.8, u_seed * 4.4));
        float visibility = mix(1.0, 0.10, mare);
        height += -0.04 * smoothstep(0.40, 0.05, worleyFeature) * visibility; }
      gl_FragColor = vec4(vec3(clamp(height * 0.5 + 0.5, 0.0, 1.0)), 1.0);`;

    return `
    ${this.buildNoiseAndWorleyGLSL(this.terrainNoise)}
    varying vec2 vUV;
    uniform float u_seed;

    void main() {
      vec3  spherePosition = uvToSphere(vUV);
      ${craterDeclaration}
      ${volcanoDeclaration}
      float height  = terrainFbm(spherePosition * 5.0 + vec3(u_seed * 2.7, u_seed * 1.3, u_seed * 4.1));
      ${craterProcessingCode}
      ${volcanoElevation}
      ${finalGlsl}
    }`;
  }

  private buildTerrainFrag(
    palette: TerrainPaletteType,
    noiseScale: number,
    volcanoPositions: THREE.Vector3[] = [],
    volcanoRadii: number[] = [],
  ): string {
    const volcanoCount = Math.min(volcanoPositions.length, MAX_VOLCANOES);

    const volcanoDeclaration = this.buildVolcanoDeclGLSL(
      volcanoPositions,
      volcanoRadii,
      volcanoCount,
    );
    const volcanoBlock =
      volcanoCount > 0
        ? `float volcanoMask = 0.0;
      float volcanoSummit = 0.0;
      ${this.buildTerrestrialVolcanoElevationGLSL(volcanoCount, "elevation")}
      ${this.buildTerrestrialVolcanoColorGLSL(
        "smoothstep(0.32, 0.58, elevation)",
      )}`
        : "";

    return `
    ${this.buildNoiseAndWorleyGLSL(this.terrainNoise)}
    ${this.buildColorGradientGLSL(palette, "getTerrainColor")}
    varying vec2 vUV;
    uniform float u_seed;

    void main() {
      vec3  spherePosition        = uvToSphere(vUV);
      ${volcanoDeclaration}
      float elevation = terrainFbm(spherePosition * ${noiseScale.toFixed(
        2,
      )} + vec3(u_seed * 4.3, u_seed * 2.1, u_seed * 7.7));
      vec3  color     = getTerrainColor(elevation);
      ${volcanoBlock}
      gl_FragColor = vec4(color, 1.0);
    }`;
  }

  private buildTerrainBumpFrag(
    noiseScale: number,
    volcanoPositions: THREE.Vector3[] = [],
    volcanoRadii: number[] = [],
  ): string {
    const volcanoCount = Math.min(volcanoPositions.length, MAX_VOLCANOES);

    const volcanoDeclaration = this.buildVolcanoDeclGLSL(
      volcanoPositions,
      volcanoRadii,
      volcanoCount,
    );
    const volcanoElevation =
      volcanoCount > 0
        ? `float volcanoMask = 0.0;
      float volcanoSummit = 0.0;
      ${this.buildTerrestrialVolcanoElevationGLSL(volcanoCount, "height")}`
        : "";

    return `
    ${this.buildNoiseAndWorleyGLSL(this.terrainNoise)}
    varying vec2 vUV;
    uniform float u_seed;

    void main() {
      vec3  spherePosition = uvToSphere(vUV);
      ${volcanoDeclaration}
      float height  = terrainFbm(spherePosition * ${noiseScale.toFixed(
        2,
      )} + vec3(u_seed * 4.3, u_seed * 2.1, u_seed * 7.7));
      ${volcanoElevation}
      gl_FragColor = vec4(vec3(clamp(height * 0.5 + 0.5, 0.0, 1.0)), 1.0);
    }`;
  }

  private buildHabitableRoughnessFrag(
    noiseScale: number,
    landElevation: number,
  ): string {
    const landThresholdLiteral = landElevation.toFixed(3);

    return `
    ${this.buildNoiseAndWorleyGLSL(this.terrainNoise)}
    varying vec2 vUV;
    uniform float u_seed;

    void main() {
      vec3  spherePosition        = uvToSphere(vUV);
      float elevation = terrainFbm(spherePosition * ${noiseScale.toFixed(
        2,
      )} + vec3(u_seed * 4.3, u_seed * 2.1, u_seed * 7.7));

      float landThreshold  = ${landThresholdLiteral};

      float isLand = smoothstep(landThreshold - 0.02, landThreshold + 0.02, elevation);

      float latitude      = abs(uvToSphere(vUV).z);
      float polarIce = smoothstep(0.62, 0.82, latitude);
      float iceNoise = terrainFbm(spherePosition * 4.0 + vec3(u_seed * 1.3, u_seed * 5.2, u_seed * 2.9)) * 0.12;
      polarIce = clamp(polarIce + iceNoise * (1.0 - polarIce), 0.0, 1.0);
      float snowPeak = smoothstep(0.80, 0.92, elevation);
      float iceMask  = clamp(polarIce + snowPeak, 0.0, 1.0);

      float roughness = mix(0.04, 0.78, isLand);
      roughness = mix(roughness,  0.12, iceMask);
      gl_FragColor = vec4(0.0, roughness, 0.0, 1.0);
    }`;
  }

  private buildIceRoughnessFrag(noiseScale: number): string {
    return `
    ${this.buildNoiseAndWorleyGLSL(this.terrainNoise)}
    varying vec2 vUV;
    uniform float u_seed;

    void main() {
      vec3  spherePosition  = uvToSphere(vUV);
      float height   = terrainFbm(spherePosition * ${noiseScale.toFixed(
        2,
      )} + vec3(u_seed * 4.3, u_seed * 2.1, u_seed * 7.7));

      float roughness = mix(0.06, 0.80, smoothstep(0.60, 0.75, height));
      gl_FragColor = vec4(0.0, roughness, 0.0, 1.0);
    }`;
  }

  private buildIceColorFrag(
    palette: TerrainPaletteType,
    noiseScale: number,
    craterPositions: THREE.Vector3[],
    craterRadii: number[],
    volcanoPositions: THREE.Vector3[] = [],
    volcanoRadii: number[] = [],
  ): string {
    const count = Math.min(craterPositions.length, MAX_CRATERS);
    const volcanoCount = Math.min(volcanoPositions.length, MAX_VOLCANOES);

    const volcanoDeclaration = this.buildVolcanoDeclGLSL(
      volcanoPositions,
      volcanoRadii,
      volcanoCount,
    );
    const cryoVolcanoBlock =
      volcanoCount > 0
        ? `float cryoMask = 0.0;
      float cryoVent = 0.0;
      ${this.buildCryoVolcanoMaskGLSL(volcanoCount)}
      ${this.buildCryoVolcanoColorGLSL()}`
        : "";

    let craterDeclaration = "";

    for (let i = 0; i < count; i++) {
      const position = craterPositions[i];

      craterDeclaration += `  vec3  craterPosition${i} = vec3(${position.x.toFixed(
        6,
      )}, ${position.y.toFixed(6)}, ${position.z.toFixed(6)});\n`;
      craterDeclaration += `  float craterRadius${i} = ${craterRadii[i].toFixed(
        6,
      )};\n`;
    }

    let craterProcessingCode = "";

    for (let i = 0; i < count; i++) {
      craterProcessingCode += `
  {
    float dist = length(spherePosition - craterPosition${i});
    float normalizedRadius = dist / craterRadius${i};

    if (normalizedRadius < 1.5) {
      float bowl = max(0.0, 1.0 - normalizedRadius * normalizedRadius);
      float rim  = exp(-pow((normalizedRadius - 1.0) * 5.0, 2.0));

      color = mix(color, color * 0.55, bowl * 0.60);
      color = mix(color, color * 1.18, rim * 0.45);
      craterMask = max(craterMask, smoothstep(1.5, 0.5, normalizedRadius));
    }
  }`;
    }

    return `
    ${this.buildNoiseAndWorleyGLSL(this.terrainNoise)}
    ${this.buildColorGradientGLSL(palette, "getTerrainColor")}
    varying vec2 vUV;
    uniform float u_seed;

    void main() {
      vec3  spherePosition        = uvToSphere(vUV);
      ${craterDeclaration}
      ${volcanoDeclaration}
      float elevation = terrainFbm(spherePosition * ${noiseScale.toFixed(
        2,
      )} + vec3(u_seed * 4.3, u_seed * 2.1, u_seed * 7.7));
      vec3  color     = getTerrainColor(elevation);
      float craterMask = 0.0;
      ${craterProcessingCode}
      ${cryoVolcanoBlock}
      gl_FragColor = vec4(color, 1.0);
    }`;
  }

  private buildIceBumpWithCratersFrag(
    noiseScale: number,
    craterPositions: THREE.Vector3[],
    craterRadii: number[],
    volcanoPositions: THREE.Vector3[] = [],
    volcanoRadii: number[] = [],
  ): string {
    const count = Math.min(craterPositions.length, MAX_CRATERS);
    const volcanoCount = Math.min(volcanoPositions.length, MAX_VOLCANOES);

    const volcanoDeclaration = this.buildVolcanoDeclGLSL(
      volcanoPositions,
      volcanoRadii,
      volcanoCount,
    );
    const cryoElevation =
      volcanoCount > 0
        ? `float cryoMask = 0.0;
      float cryoVent = 0.0;
      ${this.buildCryoVolcanoElevationGLSL(volcanoCount, "height")}`
        : "";

    let craterDeclaration = "";

    for (let i = 0; i < count; i++) {
      const position = craterPositions[i];

      craterDeclaration += `  vec3  craterPosition${i} = vec3(${position.x.toFixed(
        6,
      )}, ${position.y.toFixed(6)}, ${position.z.toFixed(6)});\n`;
      craterDeclaration += `  float craterRadius${i} = ${craterRadii[i].toFixed(
        6,
      )};\n`;
    }

    let craterProcessingCode = "";

    for (let i = 0; i < count; i++) {
      craterProcessingCode += `
  {
    float dist = length(spherePosition - craterPosition${i});
    float normalizedRadius = dist / craterRadius${i};

    if (normalizedRadius < 1.5) {
      height += -0.22 * max(0.0, 1.0 - normalizedRadius * normalizedRadius)
         +  0.10 * exp(-pow((normalizedRadius - 1.0) * 5.0, 2.0));
    }
  }`;
    }

    return `
    ${this.buildNoiseAndWorleyGLSL(this.terrainNoise)}
    varying vec2 vUV;
    uniform float u_seed;

    void main() {
      vec3  spherePosition = uvToSphere(vUV);
      ${craterDeclaration}
      ${volcanoDeclaration}
      float height  = terrainFbm(spherePosition * ${noiseScale.toFixed(
        2,
      )} + vec3(u_seed * 4.3, u_seed * 2.1, u_seed * 7.7));
      ${craterProcessingCode}
      ${cryoElevation}
      gl_FragColor = vec4(vec3(clamp(height * 0.5 + 0.5, 0.0, 1.0)), 1.0);
    }`;
  }

  private buildHabitableFrag(
    palette: TerrainPaletteType,
    noiseScale: number,
    landElevation = 0.5,
    volcanoPositions: THREE.Vector3[] = [],
    volcanoRadii: number[] = [],
  ): string {
    const volcanoCount = Math.min(volcanoPositions.length, MAX_VOLCANOES);

    const volcanoDeclaration = this.buildVolcanoDeclGLSL(
      volcanoPositions,
      volcanoRadii,
      volcanoCount,
    );
    const volcanoElevationBlock =
      volcanoCount > 0
        ? `float volcanoMask = 0.0;
      float volcanoSummit = 0.0;
      ${this.buildTerrestrialVolcanoElevationGLSL(volcanoCount, "elevation")}`
        : "";
    const volcanoColorBlock =
      volcanoCount > 0
        ? this.buildTerrestrialVolcanoColorGLSL("landMask * (1.0 - polarIce)")
        : "";

    return `
    ${this.buildNoiseAndWorleyGLSL(this.terrainNoise)}
    ${this.buildColorGradientGLSL(palette, "getTerrainColor")}
    varying vec2 vUV;
    uniform float u_seed;

    void main() {
      vec3  spherePosition        = uvToSphere(vUV);
      ${volcanoDeclaration}
      float elevation = terrainFbm(spherePosition * ${noiseScale.toFixed(
        2,
      )} + vec3(u_seed * 4.3, u_seed * 2.1, u_seed * 7.7));
      ${volcanoElevationBlock}
      vec3  color     = getTerrainColor(elevation);

      float landThreshold = ${landElevation.toFixed(3)};

      float shelfBlend = 1.0 - smoothstep(landThreshold - 0.14, landThreshold - 0.01, elevation);

      float oceanMask  = 1.0 - smoothstep(landThreshold - 0.01, landThreshold + 0.01, elevation);
      vec3  deepBlue   = vec3(0.02, 0.07, 0.38);
      color = mix(color, deepBlue, shelfBlend * oceanMask);

      float latitude = abs(spherePosition.z);
      float polarIce = smoothstep(0.62, 0.82, latitude);
      float iceEdgeNoise = terrainFbm(spherePosition * 4.0 + vec3(u_seed * 1.3, u_seed * 5.2, u_seed * 2.9)) * 0.12;
      polarIce = clamp(polarIce + iceEdgeNoise * (1.0 - polarIce), 0.0, 1.0);

      float landMask = smoothstep(landThreshold - 0.03, landThreshold + 0.01, elevation);

      float warpOffsetA = fbmScaled(spherePosition * 2.4 + vec3(u_seed * 9.1, u_seed * 1.3, u_seed * 5.7)) - 0.5;
      float warpOffsetB = fbmScaled(spherePosition * 2.4 + vec3(u_seed * 2.7, u_seed * 6.4, u_seed * 3.8)) - 0.5;
      vec3  warp  = vec3(warpOffsetA, warpOffsetB, (warpOffsetA + warpOffsetB) * 0.5) * 0.16;

      float riverEdge  = worleyScaled((spherePosition + warp) * 2.5 + vec3(u_seed * 3.1, u_seed * 7.2, u_seed * 1.9));
      float downslope  = 1.0 - smoothstep(0.52, 0.74, elevation);
      float riverWidth = mix(0.018, 0.038, downslope);
      float riverLine  = (1.0 - smoothstep(0.0, riverWidth, riverEdge))
                       * landMask
                       * (1.0 - smoothstep(0.68, 0.80, elevation))
                       * (1.0 - polarIce);

      float lakeNoise = terrainFbm(spherePosition * 6.0 + vec3(u_seed * 5.5, u_seed * 2.9, u_seed * 8.1));
      float lakeMask  = smoothstep(0.84, 0.87, lakeNoise)
                      * landMask
                      * (1.0 - smoothstep(0.54, 0.66, elevation))
                      * (1.0 - polarIce);

      float coastLower   = landThreshold - 0.045;
      float coastUpper   = landThreshold + 0.058;
      float coastMask = smoothstep(coastLower, landThreshold - 0.002, elevation)
                      * (1.0 - smoothstep(landThreshold - 0.002, coastUpper, elevation));

      float riverProximity = 1.0 - smoothstep(0.0, 0.18, riverEdge);

      float distributionEdge = worleyScaled((spherePosition + warp * 2.6) * 10.0
                                 + vec3(u_seed * 4.8, u_seed * 9.2, u_seed * 2.5));
      float distributionLine = 1.0 - smoothstep(0.0, 0.055, distributionEdge);

      float deltaLine = clamp(riverProximity * 0.55 + distributionLine * riverProximity * 0.9, 0.0, 1.0)
                      * coastMask
                      * (1.0 - polarIce);

      vec3 waterBlue  = vec3(0.05, 0.24, 0.62);
      vec3 deltaColor = mix(waterBlue, vec3(0.20, 0.50, 0.38), 0.35);
      color = mix(color, waterBlue,   lakeMask  * 0.92);
      color = mix(color, waterBlue * 0.88, riverLine * 0.85);
      color = mix(color, deltaColor,  deltaLine * 0.82);

      float shieldVolcanoNoise   = worleyF1Scaled(spherePosition * 1.6 + vec3(u_seed * 11.3, u_seed * 4.7,  u_seed * 8.1));

      float shieldVolcanoDome = 1.0 - smoothstep(0.0, 0.34, shieldVolcanoNoise);

      float shieldVolcanoMask = shieldVolcanoDome * landMask * (1.0 - polarIce);

      vec3  shieldVolcanoRock  = vec3(0.17, 0.15, 0.13);
      vec3  shieldVolcanoVegetation   = vec3(0.13, 0.28, 0.10);
      vec3  shieldVolcanoSnow  = vec3(0.90, 0.92, 0.94);
      vec3  shieldVolcanoColor = mix(shieldVolcanoVegetation,  shieldVolcanoRock, smoothstep(0.25, 0.65, shieldVolcanoDome));
             shieldVolcanoColor = mix(shieldVolcanoColor, shieldVolcanoSnow, smoothstep(0.72, 0.90, shieldVolcanoDome));
      color = mix(color, shieldVolcanoColor, shieldVolcanoMask * 0.82);

      float plateEdge  = worleyScaled(spherePosition * 3.0 + vec3(u_seed * 6.3, u_seed * 17.4, u_seed * 0.7));
      float plateBoundary = 1.0 - smoothstep(0.0, 0.09, plateEdge);

      float inlandBand = smoothstep(landThreshold + 0.005, landThreshold + 0.06, elevation)
                       * (1.0 - smoothstep(landThreshold + 0.06, landThreshold + 0.18, elevation));
      float activeMargin = plateBoundary * inlandBand;

      float stratovolcanoNoise   = worleyF1Scaled(spherePosition * 5.5 + vec3(u_seed * 2.9, u_seed * 8.6, u_seed * 4.3));

      float cone   = 1.0 - smoothstep(0.0, 0.17, stratovolcanoNoise);

      float stratovolcanoMask = cone * cone * activeMargin * (1.0 - polarIce);

      vec3  stratovolcanoRock  = vec3(0.26, 0.23, 0.21);
      vec3  stratovolcanoSnow  = vec3(0.93, 0.94, 0.96);
      vec3  stratovolcanoColor = mix(stratovolcanoRock, stratovolcanoSnow, smoothstep(0.58, 0.82, cone));
      color = mix(color, stratovolcanoColor, stratovolcanoMask * 0.90);

      float snowPeak = smoothstep(0.82, 0.92, elevation);
      color = mix(color, vec3(0.96, 0.97, 1.0), snowPeak);

      color = mix(color, vec3(0.94, 0.96, 1.0), polarIce);

      ${volcanoColorBlock}

      gl_FragColor = vec4(color, 1.0);
    }`;
  }

  private buildHabitableBumpFrag(
    noiseScale: number,
    volcanoPositions: THREE.Vector3[] = [],
    volcanoRadii: number[] = [],
  ): string {
    const volcanoCount = Math.min(volcanoPositions.length, MAX_VOLCANOES);

    const volcanoDeclaration = this.buildVolcanoDeclGLSL(
      volcanoPositions,
      volcanoRadii,
      volcanoCount,
    );
    const volcanoElevation =
      volcanoCount > 0
        ? `float volcanoMask = 0.0;
      float volcanoSummit = 0.0;
      ${this.buildTerrestrialVolcanoElevationGLSL(volcanoCount, "height")}`
        : "";

    return `
    ${this.buildNoiseAndWorleyGLSL(this.terrainNoise)}
    varying vec2 vUV;
    uniform float u_seed;

    void main() {
      vec3  spherePosition = uvToSphere(vUV);
      ${volcanoDeclaration}
      float height  = terrainFbm(spherePosition * ${noiseScale.toFixed(
        2,
      )} + vec3(u_seed * 4.3, u_seed * 2.1, u_seed * 7.7));
      ${volcanoElevation}
      gl_FragColor = vec4(vec3(clamp(height * 0.5 + 0.5, 0.0, 1.0)), 1.0);
    }`;
  }

  private generateTexture(fragmentShader: string, seed: number): THREE.Texture {
    const renderTarget = new THREE.WebGLRenderTarget(
      TEXTURE_WIDTH,
      TEXTURE_HEIGHT,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        generateMipmaps: false,
      },
    );

    const material = new THREE.ShaderMaterial({
      vertexShader: VERT_SHADER,
      fragmentShader,
      uniforms: { u_seed: { value: seed } },
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const quadMesh = new THREE.Mesh(geometry, material);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    scene.add(quadMesh);

    const previousRenderTarget = this.renderer.getRenderTarget();

    this.renderer.setRenderTarget(renderTarget);
    this.renderer.render(scene, camera);
    this.renderer.setRenderTarget(previousRenderTarget);

    const pixels = new Uint8Array(TEXTURE_WIDTH * TEXTURE_HEIGHT * 4);

    this.renderer.readRenderTargetPixels(
      renderTarget,
      0,
      0,
      TEXTURE_WIDTH,
      TEXTURE_HEIGHT,
      pixels,
    );
    renderTarget.dispose();

    const texture = new THREE.DataTexture(
      pixels,
      TEXTURE_WIDTH,
      TEXTURE_HEIGHT,
      THREE.RGBAFormat,
    );
    texture.needsUpdate = true;
    texture.flipY = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;

    material.dispose();
    geometry.dispose();

    this.proceduralTextures.push(texture);

    return texture;
  }

  private generateCraterData(
    seed: number,
    count: number,
  ): { positions: THREE.Vector3[]; radii: number[] } {
    const positions: THREE.Vector3[] = [];
    const radii: number[] = [];

    for (let index = 0; index < count; index++) {
      const uniformRandom1 = this.seededRandom(
        seed * 1000 + index * 127.1 + 0.5,
      );
      const uniformRandom2 = this.seededRandom(
        seed * 1000 + index * 311.7 + 1.5,
      );
      const theta = Math.acos(
        Math.max(-1, Math.min(1, 1 - 2 * uniformRandom1)),
      );
      const phi = 2 * Math.PI * uniformRandom2;

      positions.push(
        new THREE.Vector3(
          Math.sin(theta) * Math.cos(phi),
          Math.sin(theta) * Math.sin(phi),
          Math.cos(theta),
        ),
      );

      const randomUnit = this.seededRandom(seed * 1000 + index * 419.2 + 2.5);

      radii.push(0.012 + 0.13 * Math.pow(randomUnit, 2.5));
    }

    return { positions, radii };
  }

  private volcanoCountForMass(
    mass: number,
    minMass: number,
    maxCount: number,
  ): number {
    if (mass < minMass || maxCount <= 0) {
      return 0;
    }

    const minimumEarthMass = minMass / EARTH_MASS_SOLAR;
    const earthRatio = mass / EARTH_MASS_SOLAR;
    const interpolationFactor = Math.min(
      1,
      Math.max(0, (earthRatio - minimumEarthMass) / 2.5),
    );

    return Math.min(
      maxCount,
      Math.round(maxCount * (0.32 + interpolationFactor * 0.68)),
    );
  }

  private generateVolcanoData(
    seed: number,
    count: number,
    kind: "terrestrial" | "cryo",
  ): { positions: THREE.Vector3[]; radii: number[] } {
    const seedBase = seed * 1000 + (kind === "cryo" ? 8800 : 7700);
    const positions: THREE.Vector3[] = [];
    const radii: number[] = [];

    for (let index = 0; index < count; index++) {
      const uniformRandom1 = this.seededRandom(seedBase + index * 127.1 + 0.5);
      const uniformRandom2 = this.seededRandom(seedBase + index * 311.7 + 1.5);
      const theta = Math.acos(
        Math.max(-1, Math.min(1, 1 - 2 * uniformRandom1)),
      );
      const phi = 2 * Math.PI * uniformRandom2;

      positions.push(
        new THREE.Vector3(
          Math.sin(theta) * Math.cos(phi),
          Math.sin(theta) * Math.sin(phi),
          Math.cos(theta),
        ),
      );

      const randomUnit = this.seededRandom(seedBase + index * 419.2 + 2.5);

      if (kind === "cryo") {
        radii.push(0.06 + 0.12 * Math.pow(randomUnit, 1.8));
      } else {
        radii.push(0.055 + 0.14 * Math.pow(randomUnit, 1.6));
      }
    }

    return { positions, radii };
  }

  private buildVolcanoDeclGLSL(
    volcanoPositions: THREE.Vector3[],
    volcanoRadii: number[],
    count: number,
  ): string {
    let volcanoDeclaration = "";

    for (let i = 0; i < count; i++) {
      const position = volcanoPositions[i];

      volcanoDeclaration += `  vec3  volcanoPosition${i} = vec3(${position.x.toFixed(
        6,
      )}, ${position.y.toFixed(6)}, ${position.z.toFixed(6)});\n`;
      volcanoDeclaration += `  float volcanoRadius${i} = ${volcanoRadii[
        i
      ].toFixed(6)};\n`;
    }

    return volcanoDeclaration;
  }

  private buildTerrestrialVolcanoElevationGLSL(
    count: number,
    heightVariable: string,
  ): string {
    let code = "";

    for (let i = 0; i < count; i++) {
      code += `
  {
    float dist = length(spherePosition - volcanoPosition${i});
    float normalizedRadius = dist / volcanoRadius${i};

    if (normalizedRadius < 2.25) {
      float shield  = 0.13 * exp(-normalizedRadius * normalizedRadius * 1.35);
      float caldera = -0.016 * exp(-normalizedRadius * normalizedRadius * 18.0);
      ${heightVariable} += shield + caldera;
      volcanoMask   = max(volcanoMask, smoothstep(2.25, 0.65, normalizedRadius));
      volcanoSummit = max(volcanoSummit, exp(-normalizedRadius * normalizedRadius * 22.0) * smoothstep(2.25, 0.35, normalizedRadius));
    }
  }`;
    }

    return code;
  }

  private buildTerrestrialVolcanoColorGLSL(landMaskExpr: string): string {
    return `
      vec3 volcanoRock = vec3(0.30, 0.20, 0.16);
      vec3 volcanoAsh  = vec3(0.40, 0.34, 0.30);
      vec3 volcanoFlow = vec3(0.55, 0.20, 0.09);
      float volcanoFlank = volcanoMask * (1.0 - volcanoSummit * 0.9);
      color = mix(color, volcanoRock, volcanoFlank * 0.72 * ${landMaskExpr});
      color = mix(color, volcanoAsh,  volcanoFlank * 0.38 * ${landMaskExpr});
      color = mix(color, volcanoFlow, volcanoSummit * 0.62 * ${landMaskExpr});`;
  }

  private buildCryoVolcanoElevationGLSL(
    count: number,
    heightVariable: string,
  ): string {
    let code = "";

    for (let i = 0; i < count; i++) {
      code += `
  {
    float dist = length(spherePosition - volcanoPosition${i});
    float normalizedRadius = dist / volcanoRadius${i};

    if (normalizedRadius < 2.4) {
      float dome    = 0.09 * exp(-normalizedRadius * normalizedRadius * 1.1);
      float caldera = -0.012 * exp(-normalizedRadius * normalizedRadius * 20.0);
      float azimuth      = atan(spherePosition.y, spherePosition.x) + float(${i}) * 1.47 + u_seed * 0.013;
      float flow    = exp(-normalizedRadius * normalizedRadius * 3.5) * (0.5 + 0.5 * sin(azimuth * 4.0 + normalizedRadius * 6.0));
      ${heightVariable} += dome + caldera + flow * 0.012 * exp(-normalizedRadius * normalizedRadius * 5.0);
      cryoMask  = max(cryoMask, smoothstep(2.4, 0.7, normalizedRadius));
      cryoVent  = max(cryoVent, exp(-normalizedRadius * normalizedRadius * 24.0));
    }
  }`;
    }

    return code;
  }

  private buildCryoVolcanoMaskGLSL(count: number): string {
    let code = "";

    for (let i = 0; i < count; i++) {
      code += `
  {
    float dist = length(spherePosition - volcanoPosition${i});
    float normalizedRadius = dist / volcanoRadius${i};

    if (normalizedRadius < 2.4) {
      cryoMask = max(cryoMask, smoothstep(2.4, 0.7, normalizedRadius));
      cryoVent = max(cryoVent, exp(-normalizedRadius * normalizedRadius * 24.0));
    }
  }`;
    }

    return code;
  }

  private buildCryoVolcanoColorGLSL(): string {
    return `
      vec3 cryoDome  = color * 1.06 + vec3(0.05, 0.07, 0.11);
      vec3 cryoPlume = vec3(0.82, 0.90, 0.96);
      vec3 cryoFlow  = vec3(0.52, 0.60, 0.72);
      color = mix(color, cryoDome,  cryoMask * 0.58);
      color = mix(color, cryoFlow,  cryoMask * (1.0 - cryoVent) * 0.42);
      color = mix(color, cryoPlume, cryoVent * 0.72);`;
  }

  private buildCloudNoiseGLSL(params: TerrainNoiseParamsType): string {
    return `
        const float u_noiseFreq = ${params.frequency.toFixed(6)};
        const float u_noiseAmp  = ${params.amplitude.toFixed(6)};
        float cloudFbm(vec3 position) {
          float value = 0.0, amplitude = 0.5, frequency = 1.0, maxValue = 0.0;
          for (int i = 0; i < ${FRACTAL_BROWNIAN_MOTION_OCTAVES}; i++) {
            value     += amplitude * (simplexNoise(position * frequency) * 0.5 + 0.5);
            maxValue  += amplitude;
            amplitude *= 0.5;
            frequency *= 2.1;
          }

          return value / maxValue;
        }
        float sampleCloudNoise(vec3 p) {
          return clamp((cloudFbm(p * u_noiseFreq) - 0.5) * u_noiseAmp + 0.5, 0.0, 1.0);
        }`;
  }

  public override createManifestation(cloudDensity = 0): void {
    const massSeed = this.hashName(this.mass.name);

    this.terrainNoise = this.deriveTerrainNoiseParams(massSeed);

    const category = classifyPlanet(this.mass, this.allMasses);
    const { star, distAU } = getNearestStarInfo(this.mass, this.allMasses);

    let proceduralAtmosphereRgb: RgbType | undefined;

    const paletteCacheKeyFor = (
      category: string,
      paletteIndex: number,
      paletteName: string,
    ) =>
      `cat-${category}-pal-${paletteIndex}-${paletteName}-ep-${this.paletteEpoch}`;

    let colorTexture: THREE.Texture;
    let bumpTexture: THREE.Texture | undefined;
    let roughnessTexture: THREE.Texture | undefined;
    let paletteCacheKey = `cat-${category}`;

    switch (category) {
      case "gas-giant": {
        const sudarskyClass = star ? getSudarskiClass(distAU, star.m) : 1;

        paletteCacheKey = `cat-gas-sudarsky-${sudarskyClass}`;
        proceduralAtmosphereRgb = deriveAtmosphereColor({
          category: "gas-giant",
          sudarskyClass: sudarskyClass,
        });
        colorTexture = this.generateTexture(
          this.buildGasGiantFrag(sudarskyClass),
          massSeed,
        );

        break;
      }

      case "ice-giant": {
        const iceSelection = selectPalette(
          "ice-giant",
          massSeed,
          this.paletteEpoch,
          this.seededRandom,
        );
        paletteCacheKey = paletteCacheKeyFor(
          category,
          iceSelection.index,
          iceSelection.name,
        );
        const { palette: icePalette } = iceSelection;
        proceduralAtmosphereRgb = deriveAtmosphereColor({
          category: "ice-giant",
          palette: icePalette,
        });
        colorTexture = this.generateTexture(
          this.buildIceGiantFrag(icePalette),
          massSeed,
        );

        break;
      }

      case "lava": {
        const lavaSelection = selectPalette(
          "lava",
          massSeed,
          this.paletteEpoch,
          this.seededRandom,
        );
        paletteCacheKey = paletteCacheKeyFor(
          category,
          lavaSelection.index,
          lavaSelection.name,
        );
        const { palette: lavaPalette } = lavaSelection;
        proceduralAtmosphereRgb = deriveAtmosphereColor({
          category: "lava",
          palette: lavaPalette,
        });
        colorTexture = this.generateTexture(
          this.buildLavaFrag(lavaPalette),
          massSeed,
        );
        bumpTexture = this.generateTexture(this.buildLavaBumpFrag(), massSeed);

        break;
      }

      case "barren-light":
      case "barren-heavy": {
        const isHeavy = category === "barren-heavy";
        const barrenSelection = selectPalette(
          isHeavy ? "barren-heavy" : "barren-light",
          massSeed,
          this.paletteEpoch,
          this.seededRandom,
        );
        paletteCacheKey = paletteCacheKeyFor(
          category,
          barrenSelection.index,
          barrenSelection.name,
        );
        const { palette: barrenPalette } = barrenSelection;
        proceduralAtmosphereRgb = deriveAtmosphereColor({
          category: isHeavy ? "barren-heavy" : "barren-light",
          palette: barrenPalette,
        });
        const massRatio = this.mass.m / EARTH_MASS_SOLAR;

        const craterCount = isHeavy
          ? Math.round(MAX_CRATERS * 0.2 * Math.max(0.15, 1.0 - massRatio))
          : Math.round(MAX_CRATERS * Math.max(0.85, 1.0 - massRatio * 2.0));
        const clampedCraterCount = Math.min(craterCount, MAX_CRATERS);
        const { positions, radii } = this.generateCraterData(
          massSeed,
          clampedCraterCount,
        );

        const barrenVolcanoCount = isHeavy
          ? this.volcanoCountForMass(
              this.mass.m,
              VOLCANO_BARREN_MIN_MASS,
              MAX_VOLCANOES,
            )
          : 0;
        const barrenVolcanoes =
          barrenVolcanoCount > 0
            ? this.generateVolcanoData(
                massSeed + 41,
                barrenVolcanoCount,
                "terrestrial",
              )
            : { positions: [] as THREE.Vector3[], radii: [] as number[] };

        if (barrenVolcanoCount > 0) {
          paletteCacheKey += `-vol-${barrenVolcanoCount}`;
        }

        colorTexture = this.generateTexture(
          this.buildBarrenFrag(
            isHeavy,
            barrenPalette,
            positions,
            radii,
            barrenVolcanoes.positions,
            barrenVolcanoes.radii,
          ),
          massSeed,
        );
        bumpTexture = this.generateTexture(
          this.buildBarrenBumpFrag(
            isHeavy,
            positions,
            radii,
            barrenVolcanoes.positions,
            barrenVolcanoes.radii,
          ),
          massSeed,
        );

        break;
      }

      case "desert": {
        const desertSelection = selectPalette(
          "desert",
          massSeed,
          this.paletteEpoch,
          this.seededRandom,
        );
        paletteCacheKey = paletteCacheKeyFor(
          category,
          desertSelection.index,
          desertSelection.name,
        );
        const { palette: desertPalette } = desertSelection;
        proceduralAtmosphereRgb = deriveAtmosphereColor({
          category: "desert",
          palette: desertPalette,
        });
        const desertVolcanoCount = this.volcanoCountForMass(
          this.mass.m,
          VOLCANO_LARGE_TERR_MASS,
          MAX_VOLCANOES,
        );
        const desertVolcanoes =
          desertVolcanoCount > 0
            ? this.generateVolcanoData(
                massSeed + 43,
                desertVolcanoCount,
                "terrestrial",
              )
            : { positions: [] as THREE.Vector3[], radii: [] as number[] };
        if (desertVolcanoCount > 0) {
          paletteCacheKey += `-vol-${desertVolcanoCount}`;
        }

        colorTexture = this.generateTexture(
          this.buildTerrainFrag(
            desertPalette,
            3.5,
            desertVolcanoes.positions,
            desertVolcanoes.radii,
          ),
          massSeed,
        );
        bumpTexture = this.generateTexture(
          this.buildTerrainBumpFrag(
            3.5,
            desertVolcanoes.positions,
            desertVolcanoes.radii,
          ),
          massSeed,
        );

        break;
      }

      case "ice-world": {
        const iceWorldSelection = selectPalette(
          "ice-world",
          massSeed,
          this.paletteEpoch,
          this.seededRandom,
        );
        paletteCacheKey = paletteCacheKeyFor(
          category,
          iceWorldSelection.index,
          iceWorldSelection.name,
        );
        const { palette: iceWorldPalette } = iceWorldSelection;
        proceduralAtmosphereRgb = deriveAtmosphereColor({
          category: "ice-world",
          palette: iceWorldPalette,
        });

        const iceCraterCount = Math.round(MAX_CRATERS * 0.3);
        const { positions: icePositions, radii: iceRadii } =
          this.generateCraterData(massSeed, iceCraterCount);
        const cryoVolcanoCount = this.volcanoCountForMass(
          this.mass.m,
          CRYO_VOLCANO_MIN_MASS,
          MAX_VOLCANOES,
        );
        const cryoVolcanoes =
          cryoVolcanoCount > 0
            ? this.generateVolcanoData(massSeed + 47, cryoVolcanoCount, "cryo")
            : { positions: [] as THREE.Vector3[], radii: [] as number[] };
        if (cryoVolcanoCount > 0) {
          paletteCacheKey += `-cryo-${cryoVolcanoCount}`;
        }

        colorTexture = this.generateTexture(
          this.buildIceColorFrag(
            iceWorldPalette,
            3.0,
            icePositions,
            iceRadii,
            cryoVolcanoes.positions,
            cryoVolcanoes.radii,
          ),
          massSeed,
        );
        bumpTexture = this.generateTexture(
          this.buildIceBumpWithCratersFrag(
            3.0,
            icePositions,
            iceRadii,
            cryoVolcanoes.positions,
            cryoVolcanoes.radii,
          ),
          massSeed,
        );
        roughnessTexture = this.generateTexture(
          this.buildIceRoughnessFrag(3.0),
          massSeed,
        );

        break;
      }

      case "habitable": {
        const habitableSelection = selectPalette(
          "habitable",
          massSeed,
          this.paletteEpoch,
          this.seededRandom,
        );
        paletteCacheKey = paletteCacheKeyFor(
          category,
          habitableSelection.index,
          habitableSelection.name,
        );
        const { palette: habitablePalette, oceanWorld } = habitableSelection;
        proceduralAtmosphereRgb = deriveAtmosphereColor({
          category: "habitable",
          palette: habitablePalette,
          ...(oceanWorld ? { oceanWorld: true } : {}),
        });

        const landElevation = oceanWorld ? 0.88 : 0.5;
        const habitableVolcanoCount = this.volcanoCountForMass(
          this.mass.m,
          VOLCANO_LARGE_TERR_MASS,
          MAX_VOLCANOES,
        );
        const habitableVolcanoes =
          habitableVolcanoCount > 0
            ? this.generateVolcanoData(
                massSeed + 49,
                habitableVolcanoCount,
                "terrestrial",
              )
            : { positions: [] as THREE.Vector3[], radii: [] as number[] };

        if (habitableVolcanoCount > 0) {
          paletteCacheKey += `-vol-${habitableVolcanoCount}`;
        }

        colorTexture = this.generateTexture(
          this.buildHabitableFrag(
            habitablePalette,
            2.8,
            landElevation,
            habitableVolcanoes.positions,
            habitableVolcanoes.radii,
          ),
          massSeed,
        );
        bumpTexture = this.generateTexture(
          this.buildHabitableBumpFrag(
            2.8,
            habitableVolcanoes.positions,
            habitableVolcanoes.radii,
          ),
          massSeed,
        );
        roughnessTexture = this.generateTexture(
          this.buildHabitableRoughnessFrag(2.8, landElevation),
          massSeed,
        );

        break;
      }
    }

    const segments = 64;
    const geometry = new THREE.SphereGeometry(
      this.mass.radius,
      segments,
      segments,
    );

    const material = new THREE.MeshStandardMaterial({
      map: colorTexture,
      roughness: 1.0,
      metalness: 0.0,
    });

    if (bumpTexture) {
      material.bumpMap = bumpTexture;
      material.bumpScale = 10;
    }

    if (roughnessTexture) {
      material.roughnessMap = roughnessTexture;
    }

    material.customProgramCacheKey = () =>
      `procedural-${
        this.mass.name
      }-${paletteCacheKey}-clouds-${cloudDensity.toFixed(4)}`;

    material.onBeforeCompile = (shader: THREE.Shader) => {
      this.ongoingImpacts = 0;

      const maxImpactAmount = 7;
      const impacts = [];

      for (let i = 0; i < maxImpactAmount; i++) {
        impacts.push({
          impactPoint: new THREE.Vector3(0, 0, 0),
          impactRadius: 0,
          impactRatio: 0.25,
        });
      }

      shader.uniforms["impacts"] = { value: impacts };

      if (cloudDensity > 0) {
        shader.uniforms["cloudDensity"] = { value: cloudDensity };
      }

      shader.vertexShader = `varying vec3 vPosition;\n${shader.vertexShader}`;
      shader.vertexShader = shader.vertexShader.replace(
        "#include <worldpos_vertex>",
        `#include <worldpos_vertex>\nvPosition = transformed.xyz;`,
      );

      const clouds =
        cloudDensity > 0
          ? `
        uniform float cloudDensity;
        vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        float simplexNoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g  = step(x0.yzx, x0.xyz);
          vec3 l  = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod(i, 289.0);
          vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float simplexSkewScale = 1.0 / 7.0;
          vec3 skewFactor = simplexSkewScale * D.wyz - D.xzx;
          vec4 j  = p - 49.0 * floor(p * skewFactor.z * skewFactor.z);
          vec4 x_ = floor(j * skewFactor.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x  = x_ * skewFactor.x + skewFactor.yyyy;
          vec4 y  = y_ * skewFactor.x + skewFactor.yyyy;
          vec4 h  = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0) * 2.0 + 1.0;
          vec4 s1 = floor(b1) * 2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
          vec3 grad0 = vec3(a0.xy, h.x);
          vec3 grad1 = vec3(a0.zw, h.y);
          vec3 grad2 = vec3(a1.xy, h.z);
          vec3 grad3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(
            dot(grad0,grad0), dot(grad1,grad1),
            dot(grad2,grad2), dot(grad3,grad3)));
          grad0 *= norm.x; grad1 *= norm.y;
          grad2 *= norm.z; grad3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m * m, vec4(
            dot(grad0,x0), dot(grad1,x1), dot(grad2,x2), dot(grad3,x3)));
        }
        ${this.buildCloudNoiseGLSL(this.terrainNoise)}`
          : "";

      shader.fragmentShader = `
        struct impact {
          vec3  impactPoint;
          float impactRadius;
          float impactRatio;
        };
        uniform impact impacts[${maxImpactAmount}];
        ${clouds}
        varying vec3 vPosition;
        ${shader.fragmentShader}`;

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
          float ringIntensity = 0.0;
          vec3  ringAccumColor = vec3(0.0);

          for (int i = 0; i < ${maxImpactAmount}; i++) {
            float impactRadius   = impacts[i].impactRadius;
            float impactRatio = impacts[i].impactRatio;

            if (impactRadius > 0.001 && impactRatio > 0.001) {
              float dist         = distance(vPosition, impacts[i].impactPoint);
              float currentRadius = impactRadius * impactRatio;
              vec3  direction = normalize(vPosition - impacts[i].impactPoint + vec3(0.0001));
              float noise1  = fract(sin(dot(direction.xy, vec2(127.1, 311.7))) * 43758.5453);
              float noise2  = fract(sin(dot(direction.yz, vec2(269.5, 183.3))) * 31415.9265);
              float noise3  = fract(sin(dot(direction.xz, vec2(419.2, 127.6))) * 27836.6349);
              float jaggedness = ((noise1 + noise2 + noise3) / 3.0 * 2.0 - 1.0) * impactRadius * 0.06;
              float ringWidth = impactRadius * 0.035;
              float softness  = max(ringWidth * 0.25, impactRadius * 0.001);
              float innerRadius = currentRadius - ringWidth * 0.5 + jaggedness;
              float outerRadius = currentRadius + ringWidth * 0.5 + jaggedness;
              float ring  = smoothstep(innerRadius - softness, innerRadius + softness, dist)
                          * (1.0 - smoothstep(outerRadius - softness, outerRadius + softness, dist));
              ring *= 1.0 - impactRatio;
              float ringPosition = 1.0 - clamp(abs(dist - currentRadius) / (ringWidth * 0.5 + softness), 0.0, 1.0);
              float heat    = clamp((ringPosition + noise1 * 0.25) * (1.0 - impactRatio * 0.5), 0.0, 1.0);
              vec3 lavaHot  = vec3(1.0,  1.0,  0.80);
              vec3 lavaMid  = vec3(1.0,  0.55, 0.05);
              vec3 lavaCool = vec3(0.80, 0.10, 0.00);
              vec3 c = mix(lavaCool, lavaMid, clamp(heat * 2.0, 0.0, 1.0));
              c      = mix(c, lavaHot, clamp(heat * 2.0 - 1.0, 0.0, 1.0));
              c     *= 1.35;
              ringIntensity  += ring;
              ringAccumColor += c * ring;
            }
          }

          ringIntensity = clamp(ringIntensity, 0.0, 1.0);

          if (ringIntensity > 0.0) {
            vec3 finalRingColor = ringAccumColor / ringIntensity;
            gl_FragColor = vec4(mix(gl_FragColor.rgb, finalRingColor, ringIntensity), gl_FragColor.a);
          }
          ${
            cloudDensity > 0
              ? `
          float cloudFrequency = mix(4.0, 2.0, cloudDensity);
          vec3  cloudPosition       = normalize(vPosition) * cloudFrequency;
          float cloudSample    = sampleCloudNoise(cloudPosition);
          float cloudThreshold = mix(0.72, 0.46, cloudDensity);
          float cloudEdge      = mix(0.06, 0.20, cloudDensity);
          float cloudAlpha     = smoothstep(cloudThreshold, cloudThreshold + cloudEdge, cloudSample)
                               * mix(0.35, 0.92, cloudDensity);
          float lightingFactor      = smoothstep(0.0, 0.15, dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114)));
          cloudAlpha          *= lightingFactor;
          gl_FragColor.rgb     = mix(gl_FragColor.rgb, vec3(1.0), cloudAlpha);`
              : ""
          }`,
      );

      this.materialShader = shader;
    };

    const sphere = new THREE.Mesh(geometry, material);

    sphere.name = "sphere";
    this.object3D.add(sphere);
    this.sphere = sphere;

    if (this.mass.atmosphere && proceduralAtmosphereRgb) {
      const [red, green, blue] = proceduralAtmosphereRgb;

      this.addAtmosphere(new THREE.Color(red, green, blue));
    }
  }

  public override dispose(): void {
    const proceduralTexturesLength = this.proceduralTextures.length;

    for (let i = 0; i < proceduralTexturesLength; i++) {
      this.proceduralTextures[i].dispose();
    }

    this.proceduralTextures = [];
    super.dispose();
  }
}

export default NonStellarProceduralManifestation;
