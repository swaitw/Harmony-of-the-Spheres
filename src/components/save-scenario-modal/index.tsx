import React, { FormEvent, useState } from "react";

import Modal from "../modal";
import Button from "../button";

import {
  saveScenarioMessage,
  saveScenarioForm,
  saveScenarioLabel,
  saveScenarioInput,
  saveScenarioError,
  saveScenarioActions,
  saveScenarioSubmitButton,
} from "./save-scenario-modal.module.css";

type Props = {
  defaultName: string;
  onClose: () => void;
  onSave: (name: string) => void;
  nameExistsError: boolean;
  onClearNameExistsError: () => void;
};

const SaveScenarioModal = ({
  defaultName,
  onClose,
  onSave,
  nameExistsError,
  onClearNameExistsError,
}: Props) => {
  const [name, setName] = useState(defaultName);
  const [emptyNameError, setEmptyNameError] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setEmptyNameError(true);

      return;
    }

    setEmptyNameError(false);

    onSave(trimmedName);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);

    if (emptyNameError) {
      setEmptyNameError(false);
    }

    if (nameExistsError) {
      onClearNameExistsError();
    }
  };

  const handleSaveClick = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setEmptyNameError(true);

      return;
    }

    setEmptyNameError(false);

    onSave(trimmedName);
  };

  return (
    <Modal onClose={onClose}>
      <p className={saveScenarioMessage}>
        What would you like to call this scenario?
      </p>
      <form className={saveScenarioForm} onSubmit={handleSubmit}>
        <label className={saveScenarioLabel} htmlFor="save-scenario-name">
          Scenario name
        </label>
        <input
          id="save-scenario-name"
          className={saveScenarioInput}
          type="text"
          value={name}
          onChange={handleNameChange}
          autoFocus
        />
        {emptyNameError && (
          <p className={saveScenarioError}>
            Please enter a name for your scenario.
          </p>
        )}
        {nameExistsError && (
          <p className={saveScenarioError}>
            A scenario with that name already exists. Please choose a different
            name.
          </p>
        )}
        <div className={saveScenarioActions}>
          <Button
            callback={handleSaveClick}
            cssModifier={saveScenarioSubmitButton}
          >
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SaveScenarioModal;
