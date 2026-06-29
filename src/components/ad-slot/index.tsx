import React, { ReactElement } from "react";

import {
  adSlot,
  adSlotBanner,
  adSlotFixed,
  adSlotRectangle,
} from "./ad-slot.module.css";

export type AdSlotVariant = "banner" | "rectangle";

type Props = {
  variant: AdSlotVariant;
  name: string;
  fixed?: boolean;
  className?: string;
};

const AdSlot = ({
  variant,
  name,
  fixed = false,
  className,
}: Props): ReactElement => {
  const variantClassName =
    variant === "banner" ? adSlotBanner : adSlotRectangle;

  return (
    <aside
      id={`ad-${name}`}
      className={`${adSlot} ${variantClassName}${
        fixed ? ` ${adSlotFixed}` : ""
      }${className ? ` ${className}` : ""}`}
      data-ad-slot={name}
      aria-label="Advertisement"
    />
  );
};

export default AdSlot;
