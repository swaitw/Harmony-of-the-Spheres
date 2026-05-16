import React, {
  ReactElement,
  useState,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  dropdownWrapper,
  dropdownSelectedOption,
  dropdownOptionsWrapper,
  dropdownOptionsWrapperClosing,
  rotatedChevron,
} from "./dropdown.module.css";

type DropdownProps = {
  children: ReactNode;
  selectedOption: string;
};

export default ({ children, selectedOption }: DropdownProps): ReactElement => {
  const [displayOptions, setDisplayOptions] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleOpenOptions = useCallback(() => {
    if (displayOptions) {
      setIsClosing(true);
    } else {
      setDisplayOptions(true);
    }
  }, [displayOptions]);

  const handleAnimationEnd = useCallback(() => {
    if (isClosing) {
      setIsClosing(false);
      setDisplayOptions(false);
    }
  }, [isClosing]);

  const optionsWrapper = useRef(null);
  const selectedOptionRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (event.target !== selectedOptionRef.current) {
        if (displayOptions && !isClosing) {
          setIsClosing(true);
        }
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [selectedOptionRef, displayOptions, isClosing]);

  return (
    <div className={dropdownWrapper}>
      <div
        onClick={handleOpenOptions}
        className={dropdownSelectedOption}
        ref={selectedOptionRef}
      >
        {selectedOption}
        <i
          className={`fa fa-chevron-down ${
            displayOptions ? rotatedChevron : ""
          }`}
        />
      </div>
      {displayOptions && (
        <div
          ref={optionsWrapper}
          className={`${dropdownOptionsWrapper} ${
            isClosing ? dropdownOptionsWrapperClosing : ""
          }`}
          onAnimationEnd={handleAnimationEnd}
        >
          {children}
        </div>
      )}
    </div>
  );
};
