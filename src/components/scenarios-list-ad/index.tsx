import React, { useEffect, useRef } from "react";

import { adsense } from "../../utils/adsense";
import {
  scenariosListAd,
  scenariosListAdLayout,
  scenariosListAdLayoutInner,
} from "./scenarios-list-ad.module.css";

type Props = {
  placement: "top" | "bottom";
};

const adSlots = {
  top: adsense.scenariosListTopSlot,
  bottom: adsense.scenariosListBottomSlot,
} as const;

const ScenariosListAd = ({ placement }: Props) => {
  const adRef = useRef<HTMLModElement>(null);
  const adSlot = adSlots[placement];

  useEffect(() => {
    adsense.initializeAd(adRef.current);
  }, []);

  if (!adsense.clientId || !adSlot) {
    return null;
  }

  return (
    <div className={scenariosListAdLayout}>
      <div className={scenariosListAdLayoutInner}>
        <aside className={scenariosListAd} aria-label="Advertisement">
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client={adsense.clientId}
            data-ad-slot={adSlot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </aside>
      </div>
    </div>
  );
};

export default ScenariosListAd;
