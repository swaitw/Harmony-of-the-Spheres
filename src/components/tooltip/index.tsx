import React, { useRef, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { tooltipWrapper, tooltipIcon, tooltipBox } from "./tooltip.module.css";

type Props = {
  text: string;
};

const TOOLTIP_WIDTH = 220;
const TOOLTIP_MARGIN = 8;

const Tooltip = ({ text }: Props) => {
  const iconRef = useRef<HTMLElement>(null);
  const [style, setStyle] = useState<React.CSSProperties | null>(null);

  const show = useCallback(() => {
    if (!iconRef.current) return;
    const rect = iconRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const rawLeft = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
    const clampedLeft = Math.max(
      TOOLTIP_MARGIN,
      Math.min(rawLeft, viewportWidth - TOOLTIP_WIDTH - TOOLTIP_MARGIN),
    );

    const spaceAbove = rect.top;
    const spaceBelow = viewportHeight - rect.bottom;
    const placement = spaceAbove >= spaceBelow ? "above" : "below";

    setStyle({
      position: "fixed",
      left: clampedLeft,
      ...(placement === "above"
        ? { bottom: viewportHeight - rect.top + TOOLTIP_MARGIN }
        : { top: rect.bottom + TOOLTIP_MARGIN }),
    });
  }, []);

  const hide = useCallback(() => setStyle(null), []);

  useEffect(() => hide, [hide]);

  const portal =
    style !== null &&
    createPortal(
      <span className={tooltipBox} style={style}>
        {text}
      </span>,
      document.body,
    );

  return (
    <span
      className={tooltipWrapper}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <i ref={iconRef} className={`fa-solid fa-circle-info ${tooltipIcon}`} />
      {portal}
    </span>
  );
};

export default Tooltip;
