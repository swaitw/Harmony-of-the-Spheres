import wrapWithProvider from "./wrap-with-provider";
import { adsense } from "./src/utils/adsense";

export const onClientEntry = () => {
  adsense.loadScript();
};

export const wrapRootElement = wrapWithProvider;
