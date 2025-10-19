import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import {
  deleteType,
  getTypes,
  renameType,
} from "@/services/FormationServices.js";
import styles from "./TypeModal.module.css";
import EditTypeModal from "./EditTypeModal.jsx";
import ConfirmModal from "@/components/modals/GenericModals/ConfirmModal.jsx";
import SuccessModal from "@/components/modals/GenericModals/SuccessModal.jsx";
import ErrorModal from "@/components/modals/GenericModals/ErrorModal.jsx";

/**
 * Props:
 * - show
 * - onClose
 * - onSelect(type)
 * - onTypesChanged?: optional callback() called after successful rename/delete
 */
function TypeModal({ show, onClose, onSelect = () => {}, onTypesChanged }) {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorLoading, setErrorLoading] = useState(null);

  // edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  // confirm delete
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // feedback
  const [successOpen, setSuccessOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // api error modal
  const [errOpen, setErrOpen] = useState(false);
  const [errCode, setErrCode] = useState(null);
  const [errMessage, setErrMessage] = useState("");

  useEffect(() => {
    if (!show) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErrorLoading(null);
      try {
        const res = await getTypes();
        let data = [];
        if (Array.isArray(res)) data = res;
        else if (res?.data && Array.isArray(res.data)) data = res.data;
        else if (res?.items && Array.isArray(res.items)) data = res.items;
        else if (res && typeof res === "object") {
          const maybe = Object.values(res).find((v) => Array.isArray(v));
          if (Array.isArray(maybe)) data = maybe;
        }

        if (!cancelled) setTypes(data);
      } catch (err) {
        console.error("TypeModal load error:", err);
        if (!cancelled) setErrorLoading("Impossible de charger les types.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [show]);

  function refreshTypes() {
    (async () => {
      setLoading(true);
      try {
        const res = await getTypes();
        let data = [];
        if (Array.isArray(res)) data = res;
        else if (res?.data && Array.isArray(res.data)) data = res.data;
        else if (res?.items && Array.isArray(res.items)) data = res.items;
        else if (res && typeof res === "object") {
          const maybe = Object.values(res).find((v) => Array.isArray(v));
          if (Array.isArray(maybe)) data = maybe;
        }
        setTypes(data);
      } catch (err) {
        console.error("TypeModal refresh error:", err);
        setErrorLoading("Impossible de charger les types.");
      } finally {
        setLoading(false);
      }
    })();
  }

  function handleSelect(type) {
    onSelect?.(type);
    onClose?.();
  }

  function handleEditClick(e, type) {
    e.stopPropagation();
    setEditTarget(type);
    setEditOpen(true);
  }

  async function handleRename(newLabel) {
    if (!editTarget) return;
    try {
      const status = await renameType(editTarget.id, { label: newLabel });
      if (status >= 200 && status < 300) {
        setSuccessTitle("Type modifié");
        setSuccessMessage("Le type a été renommé avec succès.");
        setSuccessOpen(true);
        setEditOpen(false);
        setEditTarget(null);
        refreshTypes();

        // notify parent via callback if provided
        try {
          onTypesChanged?.();
        } catch (err) {
          // ignore
        }
        // also dispatch a global event in case other parts need to react
        try {
          window.dispatchEvent(new CustomEvent("types:updated"));
        } catch (err) {
          // ignore in older browsers
        }
      } else if (status === 422) {
        setErrCode(422);
        setErrMessage("Erreur dans les données saisies.");
        setErrOpen(true);
      } else {
        setErrCode(status ?? 500);
        setErrMessage("Une erreur est survenue lors de la modification.");
        setErrOpen(true);
      }
    } catch (err) {
      console.error("renameType error:", err);
      setErrCode(500);
      setErrMessage("Une erreur est survenue.");
      setErrOpen(true);
    }
  }

  function handleDeleteClick(e, type) {
    e.stopPropagation();
    setConfirmTarget(type);
    setConfirmOpen(true);
  }

  async function executeDelete() {
    if (!confirmTarget) return;
    setIsDeleting(true);
    try {
      const status = await deleteType(confirmTarget.id);
      if (status >= 200 && status < 300) {
        setSuccessTitle("Type supprimé");
        setSuccessMessage("Le type a été supprimé avec succès.");
        setSuccessOpen(true);
        setConfirmOpen(false);
        setConfirmTarget(null);
        refreshTypes();

        // notify parent via callback if provided
        try {
          onTypesChanged?.();
        } catch (err) {
          // ignore
        }
        // dispatch global event so Formation (and others) can react
        try {
          window.dispatchEvent(new CustomEvent("types:updated"));
        } catch (err) {
          // ignore
        }
      } else if (status === 422) {
        setErrCode(422);
        setErrMessage("Erreur dans les données saisies.");
        setErrOpen(true);
        setConfirmOpen(false);
      } else {
        setErrCode(status ?? 500);
        setErrMessage("Une erreur est survenue lors de la suppression.");
        setErrOpen(true);
        setConfirmOpen(false);
      }
    } catch (err) {
      console.error("deleteType error:", err);
      setErrCode(500);
      setErrMessage("Une erreur est survenue lors de la suppression.");
      setErrOpen(true);
      setConfirmOpen(false);
    } finally {
      setIsDeleting(false);
      setConfirmTarget(null);
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
      <SuccessModal
        show={successOpen}
        title={successTitle}
        message={successMessage}
        onClose={() => setSuccessOpen(false)}
      />

      <ConfirmModal
        show={confirmOpen}
        onClose={() => {
          if (!isDeleting) {
            setConfirmOpen(false);
            setConfirmTarget(null);
          }
        }}
        title="Confirmer la suppression"
        message={
          confirmTarget
            ? `Voulez-vous vraiment supprimer le type “${confirmTarget.label}” ? Cette action est irréversible.`
            : "Voulez-vous supprimer cet élément ?"
        }
        btn_yes="Supprimer"
        btn_no="Annuler"
        func={executeDelete}
      />

      <EditTypeModal
        show={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditTarget(null);
        }}
        initialLabel={editTarget?.label ?? ""}
        onSave={(label) => handleRename(label)}
      />

      <Modal
        show={show}
        onHide={onClose}
        size="m"
        centered
        scrollable
        className={styles.modal}
        style={{ zIndex: 99999 }}
      >
        <Modal.Header closeButton className={styles.header}>
          <h1 className={styles.title}>Types</h1>
        </Modal.Header>

        <Modal.Body>
          {loading && <p className={styles.message}>Chargement des types…</p>}
          {errorLoading && <p className={styles.error}>{errorLoading}</p>}
          {!loading && !errorLoading && types.length === 0 && (
            <p className={styles.message}>Aucun type trouvé.</p>
          )}

          <div className={styles.typeList}>
            {types.map((t) => (
              <div key={t.id} className={styles.typeRow}>
                <button
                  type="button"
                  className={styles.typeBtn}
                  onClick={() => handleSelect(t)}
                >
                  {t.label}
                </button>

                <div
                  className={styles.iconButtons}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={(e) => handleEditClick(e, t)}
                    aria-label="Modifier"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={(e) => handleDeleteClick(e, t)}
                    aria-label="Supprimer"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 6h18"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 6v14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10 11v6M14 11v6"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default TypeModal;
