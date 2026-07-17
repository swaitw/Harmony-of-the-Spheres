import React, { ReactNode, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { icon, chevronDown } from "../../theme/icons.module.css";
import {
  collapsibleSection,
  collapsibleSectionHeader,
  collapsibleSectionTitle,
  collapsibleSectionChevron,
  collapsibleSectionChevronOpen,
  collapsibleSectionContent,
  collapsibleSectionInner,
} from "./collapsible-section.module.css";

type Props = {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  contentClassName?: string;
};

const CollapsibleSection = ({
  title,
  isOpen,
  onToggle,
  children,
  contentClassName,
}: Props) => {
  const sectionRef = useRef<HTMLElement>(null);
  const wasOpenRef = useRef(isOpen);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current && sectionRef.current) {
      sectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    wasOpenRef.current = isOpen;
  }, [isOpen]);

  return (
    <section ref={sectionRef} className={collapsibleSection}>
      <button
        type="button"
        className={collapsibleSectionHeader}
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <h2 className={collapsibleSectionTitle}>{title}</h2>
        <i
          className={`${icon} ${chevronDown} ${collapsibleSectionChevron} ${
            isOpen ? collapsibleSectionChevronOpen : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            className={collapsibleSectionContent}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            <div
              className={`${collapsibleSectionInner} ${contentClassName ?? ""}`}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default CollapsibleSection;
