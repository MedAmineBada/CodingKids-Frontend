import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import {
  addType,
  editFormation,
  getTypes,
} from "@/services/FormationServices.js";
import styles from "./AddModal.module.css"; // reuse AddModal styles
import ErrorModal from "@/components/modals/GenericModals/ErrorModal.jsx";
import SuccessModal from "@/components/modals/GenericModals/SuccessModal.jsx";
import TypeModal from "./TypeModal.jsx";
import TeacherModal from "./TeacherModal.jsx";
import AddType from "./AddType.jsx";

/**
 * Props:
 * - show: boolean
 * - onClose: fn
 * - formation: object { id, formation_type, start_date, teacher_id, teacher_name, ... }
 * - onSaved: fn() called after successful edit (use to refresh list)
 */
function EditFormationModal({
  show,
  onClose,
  formation = null,
  onSaved = () => {},
}) {
  const [types, setTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  const [selectedTypeObj, setSelectedTypeObj] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [selectedTeacherObj, setSelectedTeacherObj] = useState(null);

  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);

  // Add-type modal
  const [showAddType, setShowAddType] = useState(false);

  // Error modal state
  const [errOpen, setErrOpen] = useState(false);
  const [errCode, setErrCode] = useState(null);
  const [errMessage, setErrMessage] = useState("");

  // success modal state
  const [successOpen, setSuccessOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);

  useEffect(() => {
    if (!show) return;
    let cancelled = false;

    async function loadInitial() {
      setLoadingInitial(true);
      setErrOpen(false);
      try {
        setLoadingTypes(true);
        const res = await getTypes();
        let data = [];
        if (Array.isArray(res)) data = res;
        else if (res?.data && Array.isArray(res.data)) data = res.data;
        else if (res?.items && Array.isArray(res.items)) data = res.items;
        else if (res && typeof res === "object") {
          const maybe = Object.values(res).find((v) => Array.isArray(v));
          if (Array.isArray(maybe)) data = maybe;
        }
        if (cancelled) return;
        setTypes(data);

        // initialize fields from formation prop
        if (formation) {
          setStartDate(formation.start_date ?? "");
          const typeMatch = data.find(
            (t) =>
              String(t.id) === String(formation.formation_type) ||
              String(t.id) === String(formation.type_id),
          );
          if (typeMatch)
            setSelectedTypeObj({
              id: Number(typeMatch.id),
              label: typeMatch.label,
            });
          else if (data.length > 0)
            setSelectedTypeObj({
              id: Number(data[0].id),
              label: data[0].label,
            });
          else setSelectedTypeObj(null);

          setSelectedTeacherObj(
            formation.teacher_id
              ? { id: formation.teacher_id, name: formation.teacher_name ?? "" }
              : formation.teacher_name
                ? { id: null, name: formation.teacher_name }
                : null,
          );
        } else {
          setStartDate("");
          setSelectedTypeObj(null);
          setSelectedTeacherObj(null);
        }
      } catch (err) {
        console.error("EditFormationModal init error:", err);
        if (!cancelled) {
          setErrCode(500);
          setErrMessage("Une erreur est survenue lors du chargement.");
          setErrOpen(true);
        }
      } finally {
        if (!cancelled) {
          setLoadingTypes(false);
          setLoadingInitial(false);
        }
      }
    }

    loadInitial();

    return () => {
      cancelled = true;
    };
  }, [show, formation]);

  function showError(code, message) {
    setErrCode(code);
    setErrMessage(message);
    setErrOpen(true);
  }

  function isDateAllowed(dateStr) {
    if (!dateStr) return false;
    const selected = new Date(dateStr + "T00:00:00");
    const now = new Date();
    const max = new Date(now.getFullYear() + 1, 11, 31, 23, 59, 59, 999);
    return selected <= max;
  }

  async function handleSave(e) {
    e.preventDefault();
    if (isSaving) return;

    if (
      !selectedTypeObj ||
      selectedTypeObj.id == null ||
      Number.isNaN(Number(selectedTypeObj.id))
    ) {
      showError(422, "Erreur dans les données saisies. Type invalide.");
      return;
    }

    if (!isDateAllowed(startDate)) {
      const now = new Date();
      const maxYear = now.getFullYear() + 1;
      showError(
        422,
        `Erreur dans les données saisies. La date de début ne peut pas être postérieure au 31 décembre ${maxYear}.`,
      );
      return;
    }

    setIsSaving(true);
    try {
      // IMPORTANT: send formation_type explicitly as the API expects it
      const payload = {
        formation_type: Number(selectedTypeObj.id),
        start_date: startDate,
        teacher_id: selectedTeacherObj?.id ?? null,
      };

      const status = await editFormation(formation.id, payload);

      if (status >= 200 && status < 300) {
        setSuccessTitle("Formation modifiée");
        setSuccessMessage(
          "Les modifications ont été enregistrées avec succès.",
        );
        setSuccessOpen(true);
      } else if (status === 422) {
        showError(422, "Erreur dans les données saisies.");
      } else {
        showError(
          status ?? 500,
          "Une erreur est survenue lors de la modification.",
        );
      }
    } catch (err) {
      console.error("editFormation error:", err);
      showError(500, "Une erreur est survenue.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTypeSaved(newLabel) {
    if (!newLabel) return;
    try {
      const res = await addType(newLabel);

      if (res.status !== 201 || !res.id) {
        if (res.status === 422) {
          showError(422, "Erreur dans les données saisies.");
        } else {
          showError(
            res.status ?? 500,
            "Une erreur est survenue lors de l'ajout du type.",
          );
        }
        return;
      }

      const newTypeObj = { id: Number(res.id), label: newLabel };
      setSelectedTypeObj(newTypeObj);

      // refresh authoritative list
      try {
        const fresh = await getTypes();
        let data = [];
        if (Array.isArray(fresh)) data = fresh;
        else if (fresh?.data && Array.isArray(fresh.data)) data = fresh.data;
        else if (fresh?.items && Array.isArray(fresh.items)) data = fresh.items;
        else if (fresh && typeof fresh === "object") {
          const maybe = Object.values(fresh).find((v) => Array.isArray(v));
          if (Array.isArray(maybe)) data = maybe;
        }
        setTypes(data);
      } catch (err) {
        console.error("EditFormationModal refresh types error:", err);
        showError(500, "Type créé mais impossible de mettre à jour la liste.");
      } finally {
        setShowAddType(false);
      }
    } catch (err) {
      console.error("handleTypeSaved error:", err);
      showError(500, "Une erreur est survenue.");
    }
  }

  function onSuccessClose() {
    setSuccessOpen(false);
    setSuccessTitle("");
    setSuccessMessage("");
    // notify parent to refresh and close modal
    onSaved?.();
    onClose?.();
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

      <AddType
        show={showAddType}
        onClose={() => setShowAddType(false)}
        onSave={handleTypeSaved}
      />

      <Modal
        show={show}
        onHide={onClose}
        size="m"
        centered
        className={styles.modal}
      >
        <Modal.Header closeButton className={styles.header}>
          <h2 className={styles.title}>Modifier la formation</h2>
        </Modal.Header>

        <Modal.Body className={styles.body}>
          <form className={styles.form} onSubmit={handleSave} noValidate>
            <label className={styles.label}>Type de formation</label>
            <div className={styles.selectRow}>
              <button
                type="button"
                className={styles.selectButton}
                onClick={() => setShowTypeModal(true)}
              >
                {selectedTypeObj
                  ? selectedTypeObj.label
                  : "Sélectionner un type…"}
              </button>

              <button
                type="button"
                className={styles.plusBtn}
                onClick={() => setShowAddType(true)}
                aria-label="Ajouter un type"
              >
                +
              </button>

              <TypeModal
                show={showTypeModal}
                onClose={() => setShowTypeModal(false)}
                onSelect={(t) =>
                  setSelectedTypeObj({ id: Number(t.id), label: t.label })
                }
              />
            </div>

            <label className={styles.label} style={{ marginTop: 8 }}>
              Enseignant
            </label>
            <div className={styles.selectRow}>
              <button
                type="button"
                className={styles.selectButton}
                onClick={() => setShowTeacherModal(true)}
              >
                {selectedTeacherObj
                  ? (selectedTeacherObj.name ?? selectedTeacherObj.label)
                  : "Sélectionner un enseignant…"}
              </button>
              <TeacherModal
                show={showTeacherModal}
                onClose={() => setShowTeacherModal(false)}
                onSelect={(t) => setSelectedTeacherObj(t)}
                selectedId={selectedTeacherObj?.id ?? null}
              />
            </div>

            <label className={styles.label} htmlFor="editStartDate">
              Date de début
            </label>
            <input
              id="editStartDate"
              type="date"
              className={styles.input}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={onClose}
                disabled={isSaving}
              >
                Annuler
              </button>
              <button
                type="submit"
                className={styles.saveBtn}
                disabled={isSaving}
              >
                {isSaving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default EditFormationModal;
