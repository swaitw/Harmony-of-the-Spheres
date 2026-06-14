import React from "react";

import Modal from "../modal";
import Button from "../button";
import { SavedScenarioEntry } from "../../types/saved-scenario";
import { deleteSavedScenario } from "../../utils/saved-scenarios-storage";

import {
  storageFullMessage,
  savedScenarioItem,
  savedScenarioTitle,
  deleteButtonModifier,
} from "./saved-scenario-storage-full-modal.module.css";

type Props = {
  savedScenarios: SavedScenarioEntry[];
  onClose: () => void;
  onScenarioDeleted: () => void;
};

const SavedScenarioStorageFullModal = ({
  savedScenarios,
  onClose,
  onScenarioDeleted,
}: Props) => {
  const handleDelete = (savedScenarioId: string) => {
    deleteSavedScenario(savedScenarioId);

    onScenarioDeleted();
  };

  return (
    <Modal onClose={onClose}>
      <p className={storageFullMessage}>
        Not enough storage space to save this scenario. Please delete a saved
        scenario to free up space.
      </p>
      {savedScenarios.map(({ id: savedScenarioId, scenario }) => (
        <div key={savedScenarioId} className={savedScenarioItem}>
          <span className={savedScenarioTitle}>{scenario.name}</span>
          <Button
            callback={() => {
              handleDelete(savedScenarioId);
            }}
            cssModifier={deleteButtonModifier}
          >
            Delete
          </Button>
        </div>
      ))}
    </Modal>
  );
};

export default SavedScenarioStorageFullModal;
