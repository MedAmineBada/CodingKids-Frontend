import React, { useCallback, useEffect, useState } from "react";
import styles from "./formation.module.css";
import Modal from "react-bootstrap/Modal";
import AddFormationCard from "@/components/FormationModal/AddFormationCard.jsx";
import addStyles from "@/components/FormationModal/AddFormation.module.css";
import {
  deleteFormation,
  getFormations,
} from "@/services/FormationServices.js";
import EditFormationModal from "@/components/FormationModal/EditFormationModal.jsx";
import SuccessModal from "@/components/modals/GenericModals/SuccessModal.jsx";
import ErrorModal from "@/components/modals/GenericModals/ErrorModal.jsx";
import ConfirmModal from "@/components/modals/GenericModals/ConfirmModal.jsx";

function Formation({ show, onclose }) {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const [editingFormation, setEditingFormation] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // success modal state for delete/save feedback
  const [successOpen, setSuccessOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // error modal state for failures
  const [errOpen, setErrOpen] = useState(false);
  const [errCode, setErrCode] = useState(null);
  const [errMessage, setErrMessage] = useState("");

  // confirm delete state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadFormations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFormations();
      let data = [];

      if (Array.isArray(res)) data = res;
      else if (res?.data && Array.isArray(res.data)) data = res.data;
      else if (res?.items && Array.isArray(res.items)) data = res.items;
      else if (res && typeof res === "object") {
        const maybe = Object.values(res).find((v) => Array.isArray(v));
        if (Array.isArray(maybe)) data = maybe;
      }

      setFormations(data);
    } catch (err) {
      console.error("Failed to load formations:", err);
      setError("Impossible de charger les formations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!show) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getFormations();
        if (cancelled) return;
        let data = [];

        if (Array.isArray(res)) data = res;
        else if (res?.data && Array.isArray(res.data)) data = res.data;
        else if (res?.items && Array.isArray(res.items)) data = res.items;
        else if (res && typeof res === "object") {
          const maybe = Object.values(res).find((v) => Array.isArray(v));
          if (Array.isArray(maybe)) data = maybe;
        }

        if (!cancelled) setFormations(data);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load formations:", err);
          setError("Impossible de charger les formations.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [show, loadFormations]);

  // listen to global 'types:updated' events to refresh formations
  useEffect(() => {
    function onTypesUpdated() {
      // only refresh if modal is open (or you may want always)
      if (show) loadFormations();
    }
    window.addEventListener("types:updated", onTypesUpdated);
    return () => window.removeEventListener("types:updated", onTypesUpdated);
  }, [show, loadFormations]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  function toggleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function handleEdit(e, formation) {
    e.stopPropagation();
    setEditingFormation(formation);
    setShowEditModal(true);
  }

  // open confirm modal (called from delete button click)
  function handleDeleteClick(e, formation) {
    e.stopPropagation();
    setConfirmTarget(formation);
    setConfirmOpen(true);
  }

  // perform the deletion after user confirms
  async function executeDelete() {
    if (!confirmTarget) return;
    setIsDeleting(true);

    try {
      const status = await deleteFormation(confirmTarget.id);

      if (status >= 200 && status < 300) {
        setSuccessTitle("Formation supprimée");
        setSuccessMessage("La formation a été supprimée avec succès.");
        setSuccessOpen(true);
        setConfirmOpen(false);
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
      console.error("Erreur deleteFormation:", err);
      setErrCode(500);
      setErrMessage("Une erreur est survenue lors de la suppression.");
      setErrOpen(true);
      setConfirmOpen(false);
    } finally {
      setIsDeleting(false);
      setConfirmTarget(null);
    }
  }

  // Called after successful edit to refresh list
  async function handleEdited() {
    await loadFormations();
  }

  // when success modal closed, refresh list (for deletes)
  function onSuccessClose() {
    setSuccessOpen(false);
    setSuccessTitle("");
    setSuccessMessage("");
    loadFormations();
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
        onClose={onSuccessClose}
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
            ? `Voulez-vous vraiment supprimer la formation “${confirmTarget.label}” ? Cette action est irréversible.`
            : "Voulez-vous supprimer cet élément ?"
        }
        btn_yes="Supprimer"
        btn_no="Annuler"
        func={executeDelete}
      />

      <Modal show={show} onHide={onclose} size="lg" centered scrollable>
        <Modal.Header closeButton className={styles.header}>
          <h1>Formations</h1>
        </Modal.Header>

        <Modal.Body className={styles.body}>
          <div className={styles.container}>
            <AddFormationCard onAdded={loadFormations} />

            {loading && (
              <p className={`${styles.message} ${styles.loading}`}>
                Chargement des formations…
              </p>
            )}
            {error && (
              <p className={`${styles.message} ${styles.error}`}>{error}</p>
            )}

            <div className={styles.list}>
              {formations.length === 0 && !loading && !error && (
                <p className={styles.empty}>Aucune formation trouvée.</p>
              )}

              {formations.map((f) => {
                const isExpanded = expandedId === f.id;
                return (
                  <div
                    key={f.id}
                    className={`${addStyles.card} ${styles.formationContainer} ${
                      isExpanded ? styles.expanded : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleExpand(f.id)}
                      className={`${styles.cardHeader}`}
                      aria-label={`Ouvrir ${f.label}`}
                    >
                      <div className={styles.row}>
                        <span className={addStyles.label}>{f.label}</span>

                        <div
                          className={styles.iconButtons}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className={styles.iconBtn}
                            onClick={(e) => handleEdit(e, f)}
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
                            onClick={(e) => handleDeleteClick(e, f)}
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
                    </button>

                    <div
                      className={styles.expandedContent}
                      aria-hidden={!isExpanded}
                    >
                      <div className={styles.expandedRow}>
                        <div className={styles.field}>
                          <div className={styles.fieldLabel}>Date de début</div>
                          <div className={styles.fieldValue}>
                            {f.start_date
                              ? formatDate(f.start_date)
                              : "Date non définie"}
                          </div>
                        </div>

                        <div className={styles.field}>
                          <div className={styles.fieldLabel}>Enseigneur</div>
                          <div className={styles.fieldValue}>
                            {f.teacher_name ? f.teacher_name : "—"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <EditFormationModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        formation={editingFormation}
        onSaved={handleEdited}
      />
    </>
  );
}

export default Formation;
