import React, { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { tooltipWrapper, tooltipIcon, tooltipBox } from "./tooltip.module.css";

type Props = {
  text: string;
};

const Tooltip = ({ text }: Props) => {
  const [visible, setVisible] = useState(false);

  const show = useCallback(() => setVisible(true), []);
  const hide = useCallback(() => setVisible(false), []);

  return (
    <span
      className={tooltipWrapper}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <i className={`fa-solid fa-circle-info ${tooltipIcon}`} />
      <AnimatePresence>
        {visible && (
          <motion.span
            className={tooltipBox}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};

export default Tooltip;
