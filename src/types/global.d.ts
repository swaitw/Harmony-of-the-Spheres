declare module "*.css";
declare module "three/addons/controls/OrbitControls.js";
declare module "@tweenjs/tween.js";

declare const __PATH_PREFIX__: string;

interface Window {
  adsbygoogle?: unknown[];
}

declare namespace NodeJS {
  interface ProcessEnv {
    GATSBY_GOOGLE_ANALYTICS_ID?: string;
    GATSBY_ADSENSE_CLIENT_ID?: string;
    GATSBY_ADSENSE_SCENARIOS_LIST_TOP_SLOT?: string;
    GATSBY_ADSENSE_SCENARIOS_LIST_BOTTOM_SLOT?: string;
  }
}
