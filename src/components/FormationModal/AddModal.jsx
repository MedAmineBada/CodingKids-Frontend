import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import {
  addFormation,
  addType,
  getTypes,
} from "@/services/FormationServices.js";
import styles from "./AddModal.module.css";
import AddTypeModal from "./AddType.jsx";
import ErrorModal from "@/components/modals/GenericModals/ErrorModal.jsx";

function AddModal({ show, onClose, onSave = () => {} }) {
  const [types, setTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  const [selectedType, setSelectedType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [showAddType, setShowAddType] = useState(false);

  // Error modal state
  const [errOpen, setErrOpen] = useState(false);
  const [errCode, setErrCode] = useState(null);
  const [errMessage, setErrMessage] = useState("");

  // saving state for form submit
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!show) return;
    let cancelled = false;

    async function loadTypes() {
      setLoadingTypes(true);
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

        if (!cancelled) {
          setTypes(data);
          if (data.length > 0) setSelectedType(String(data[0].id));
        }
      } catch (err) {
        console.error("Erreur getTypes:", err);
        if (!cancelled) {
          showError(
            500,
            "Une erreur est survenue lors du chargement des types.",
          );
        }
      } finally {
        if (!cancelled) setLoadingTypes(false);
      }
    }

    loadTypes();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  function showError(code, message) {
    setErrCode(code);
    setErrMessage(message);
    setErrOpen(true);
  }

  // Called by AddTypeModal -> call addType() server side and refresh types list
  async function handleTypeSaved(newLabel) {
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

      // re-fetch authoritative list and select the new id
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
        setSelectedType(String(res.id));
        setShowAddType(false);
      } catch (err) {
        console.error("Erreur refresh types:", err);
        showError(
          500,
          "Une erreur est survenue lors de la mise à jour des types.",
        );
      }
    } catch (err) {
      console.error("Erreur addType:", err);
      showError(500, "Une erreur est survenue.");
    }
  }

  // date must not be after Dec 31 next year
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

    // validation
    if (!selectedType) {
      showError(422, "Erreur dans les données saisies.");
      return;
    }
    if (!startDate) {
      showError(422, "Erreur dans les données saisies.");
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
      const payload = { type_id: Number(selectedType), start_date: startDate };
      const res = await addFormation(payload);

      if (res.status === 201 && res.id) {
        // Success: ONLY call the onSave callback (no event dispatch)
        console.log(
          "[AddModal] Formation created successfully, calling onSave",
        );
        onSave({
          typeId: Number(selectedType),
          startDate,
          id: res.id,
          typeLabel:
            types.find((t) => t.id === Number(selectedType))?.label || "",
        });
        onClose();
      } else {
        console.error("[AddModal] Unexpected response:", res);
        if (res.status === 422) {
          showError(422, "Erreur dans les données saisies.");
        } else {
          showError(
            res.status ?? 500,
            "Une erreur est survenue lors de la création de la formation.",
          );
        }
      }
    } catch (err) {
      console.error("Erreur addFormation:", err);
      showError(500, "Une erreur est survenue.");
    } finally {
      setIsSaving(false);
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
        size="m"
        centered
        className={styles.modal}
      >
        <Modal.Header closeButton className={styles.header}>
          <h2 className={styles.title}>Nouvelle formation</h2>
        </Modal.Header>

        <Modal.Body className={styles.body}>
          <form className={styles.form} onSubmit={handleSave} noValidate>
            <label className={styles.label} htmlFor="typeSelect">
              Type de formation
            </label>

            <div className={styles.selectRow}>
              <select
                id="typeSelect"
                className={styles.select}
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                disabled={loadingTypes || types.length === 0}
              >
                {loadingTypes && <option>Chargement…</option>}
                {!loadingTypes && types.length === 0 && (
                  <option value="">Aucun type disponible</option>
                )}
                {!loadingTypes &&
                  types.map((t) => (
                    <option key={t.id} value={String(t.id)}>
                      {t.label}
                    </option>
                  ))}
              </select>

              <button
                type="button"
                className={styles.plusBtn}
                onClick={() => setShowAddType(true)}
                aria-label="Ajouter un type"
              >
                +
              </button>
            </div>

            <label className={styles.label} htmlFor="startDate">
              Date de début
            </label>
            <input
              id="startDate"
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

      <AddTypeModal
        show={showAddType}
        onClose={() => setShowAddType(false)}
        onSave={handleTypeSaved}
      />
    </>
  );
}

export default AddModal;
