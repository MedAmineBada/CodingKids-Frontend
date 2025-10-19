// TeacherModal.jsx
import React from "react";
import Modal from "react-bootstrap/Modal";
import TeacherList from "./TeacherList.jsx";
import styles from "./TypeModal.module.css"; // reuse same styles for header & icons consistency

/**
 * Props:
 * - show: boolean
 * - onClose: fn
 * - onSelect: fn(teacher)
 * - selectedId: optional id to mark selected
 */
function TeacherModal({ show, onClose, onSelect, selectedId = null }) {
  function handleSelect(t) {
    onSelect?.(t);
    onClose();
  }

  return (
    <Modal
      show={show}
      onHide={onClose}
      size="m"
      centered
      scrollable
      className={styles.modal}
    >
      <Modal.Header closeButton className={styles.header}>
        <h1 className={styles.title}>Enseignants</h1>
      </Modal.Header>

      <Modal.Body>
        <TeacherList
          show={show}
          onSelect={handleSelect}
          selectedId={selectedId}
        />
      </Modal.Body>
    </Modal>
  );
}

export default TeacherModal;
