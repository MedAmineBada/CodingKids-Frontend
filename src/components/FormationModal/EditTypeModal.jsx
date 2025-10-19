import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import styles from "./AddModal.module.css"; // reuse AddModal styles
import ErrorModal from "@/components/modals/GenericModals/ErrorModal.jsx";

/**
 * EditTypeModal: small modal to return a new label via onSave(label)
 * Props:
 *  - show
 *  - onClose()
 *  - initialLabel
 *  - onSave(label)
 */
// eslint-disable-next-line no-control-regex
const SAFE_LABEL_REGEX = /^[^\x00-\x1F<>\\{};`]+$/u;

function EditTypeModal({
  show,
  onClose = () => {},
  initialLabel = "",
  onSave = () => {},
}) {
  const [label, setLabel] = useState("");
  const [localError, setLocalError] = useState(null);

  const [errOpen, setErrOpen] = useState(false);
  const [errCode, setErrCode] = useState(null);
  const [errMessage, setErrMessage] = useState("");

  useEffect(() => {
    if (show) {
      setLabel(initialLabel ?? "");
      setLocalError(null);
      setErrOpen(false);
      setErrCode(null);
      setErrMessage("");
    }
  }, [show, initialLabel]);

  function showApiError(code, message) {
    setErrCode(code);
    setErrMessage(message);
    setErrOpen(true);
  }

  function validate(value) {
    const trimmed = (value || "").trim();
    if (!trimmed) return "Entrez un libellé valide.";
    if (trimmed.length > 120) return "Le libellé est trop long.";
    if (!SAFE_LABEL_REGEX.test(trimmed))
      return "Le libellé contient des caractères interdits (<> \\ { } ; `).";
    return null;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const err = validate(label);
    if (err) {
      setLocalError(err);
      return;
    }
    setLocalError(null);

    try {
      onSave(label.trim());
    } catch (err) {
      console.error("EditTypeModal onSave error:", err);
      showApiError(500, "Une erreur est survenue.");
    }
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
        style={{ zIndex: 111111 }}
      >
        <Modal.Header closeButton className={styles.header}>
          <h3 className={styles.title2}>Modifier le type</h3>
        </Modal.Header>

        <Modal.Body className={styles.body}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <label className={styles.label} htmlFor="editTypeLabel">
              Libellé
            </label>

            <input
              id="editTypeLabel"
              className={styles.input}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              autoFocus
            />

            {localError && <div className={styles.error}>{localError}</div>}

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={onClose}
              >
                Annuler
              </button>
              <button type="submit" className={styles.saveBtn}>
                Enregistrer
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default EditTypeModal;
