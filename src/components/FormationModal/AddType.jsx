import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import styles from "./AddTypeModal.module.css";
import ErrorModal from "@/components/modals/GenericModals/ErrorModal.jsx";

/**
 * Valid label characters:
 * - Unicode letters (\p{L})
 * - Unicode digits (\p{N})
 * - spaces
 * - a safe set of punctuation: - _ ' . , & ( ) / :
 *
 * Regex uses the Unicode property escapes (u flag).
 */
const LABEL_REGEX = /^[\p{L}\p{N}\s_'.,&()\/:-]+$/u;

function AddTypeModal({ show, onClose, onSave }) {
  const [label, setLabel] = useState("");
  const [error, setError] = useState(null);

  // ErrorModal state
  const [errOpen, setErrOpen] = useState(false);
  const [errCode, setErrCode] = useState(null);
  const [errMessage, setErrMessage] = useState("");

  useEffect(() => {
    if (show) {
      setLabel("");
      setError(null);
      setErrOpen(false);
      setErrCode(null);
      setErrMessage("");
    }
  }, [show]);

  function showError(code, message) {
    setErrCode(code);
    setErrMessage(message);
    setErrOpen(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = (label || "").trim();
    if (!trimmed) {
      // Input error -> 422
      showError(422, "Erreur dans les données saisies.");
      return;
    }

    // Validate allowed characters
    if (!LABEL_REGEX.test(trimmed)) {
      showError(
        422,
        "Erreur dans les données saisies. Le libellé ne peut contenir que lettres, chiffres, espaces et certains symboles.",
      );
      return;
    }

    // pass label up to parent; parent will call addType() and handle API errors
    onSave(trimmed);
    onClose();
  }

  return (
    <>
      <ErrorModal
        show={errOpen}
        onClose={() => setErrOpen(false)}
        code={errCode}
        message={errMessage}
      />

      <Modal
        show={show}
        onHide={onClose}
        size="sm"
        centered
        className={styles.modal}
      >
        <Modal.Header closeButton className={styles.header}>
          <h3 className={styles.title}>Nouveau type</h3>
        </Modal.Header>

        <Modal.Body className={styles.body}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <label className={styles.label} htmlFor="newTypeLabel">
              Libellé
            </label>
            <input
              id="newTypeLabel"
              className={styles.input}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              autoFocus
            />
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={onClose}
              >
                Annuler
              </button>
              <button type="submit" className={styles.saveBtn}>
                Créer
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default AddTypeModal;
