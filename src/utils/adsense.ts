const clientId = process.env.GATSBY_ADSENSE_CLIENT_ID ?? "";
const scenariosListTopSlot =
  process.env.GATSBY_ADSENSE_SCENARIOS_LIST_TOP_SLOT ?? "";
const scenariosListBottomSlot =
  process.env.GATSBY_ADSENSE_SCENARIOS_LIST_BOTTOM_SLOT ?? "";

let scriptLoadPromise: Promise<void> | null = null;

const getExistingAdsenseScript = () =>
  document.querySelector<HTMLScriptElement>(
    'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]',
  );

const loadScript = (): Promise<void> => {
  if (typeof window === "undefined" || !clientId) {
    return Promise.resolve();
  }

  const existingScript = getExistingAdsenseScript();
  if (existingScript?.dataset.loaded === "true") {
    return Promise.resolve();
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise((resolve) => {
    const finish = () => resolve();

    if (existingScript) {
      if (existingScript.dataset.loaded === "true" || window.adsbygoogle) {
        existingScript.dataset.loaded = "true";
        finish();
        return;
      }

      existingScript.addEventListener("load", () => {
        existingScript.dataset.loaded = "true";
        finish();
      });
      existingScript.addEventListener("error", finish);
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      script.dataset.loaded = "true";
      finish();
    };
    script.onerror = finish;
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
};

const initializeAd = async (element: HTMLElement | null): Promise<void> => {
  if (
    !clientId ||
    !element ||
    element.getAttribute("data-adsbygoogle-status")
  ) {
    return;
  }

  await loadScript();

  if (element.getAttribute("data-adsbygoogle-status")) {
    return;
  }

  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch {
    // AdSense is unavailable during SSR or when blocked.
  }
};

export const adsense = {
  clientId,
  scenariosListTopSlot,
  scenariosListBottomSlot,
  loadScript,
  initializeAd,
};
