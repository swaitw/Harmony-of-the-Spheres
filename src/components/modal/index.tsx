import React, { ReactNode, MouseEvent, useEffect } from "react";

import { icon, xmark } from "../../theme/icons.module.css";
import {
  modalOverlay,
  modalContent,
  modalCloseButton,
} from "./modal.module.css";

type Props = {
  children: ReactNode;
  onClose: () => void;
};

const Modal = ({ children, onClose }: Props) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleOverlayClick = () => {
    onClose();
  };

  const handleContentClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <div
      className={modalOverlay}
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        className={modalContent}
        onClick={handleContentClick}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className={modalCloseButton}
          onClick={onClose}
          aria-label="Close"
        >
          <i className={`${icon} ${xmark}`} />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
