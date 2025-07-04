import React, { useState } from "react";
import Modal from "../ui/Modal";
import NewDebt from "./NewDebt";
import Button from "../ui/Button";

const NewDebtModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
    // Optionally refresh the debt list or show success message
    console.log("Debt added successfully!");
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Add New Debt</Button>

      <Modal isOpen={isOpen} onClose={handleCancel} size="md">
        <NewDebt onSuccess={handleSuccess} onCancel={handleCancel} />
      </Modal>
    </div>
  );
};

export default NewDebtModal;
