// TeacherList.jsx
import React, { useEffect, useState } from "react";
import styles from "./TeacherList.module.css";
import { getAllTeachers } from "@/services/TeacherServices.js";

/**
 * Props:
 * - show: boolean (when true, the list will fetch)
 * - onSelect: function(teacher) called when a teacher row is clicked
 * - selectedId: optional number|string id to show as currently selected
 */
function TeacherList({ show = false, onSelect = () => {}, selectedId = null }) {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeId, setActiveId] = useState(selectedId);

  useEffect(() => {
    setActiveId(selectedId ?? null);
  }, [selectedId]);

  useEffect(() => {
    if (!show) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getAllTeachers();
        if (res?.status === 200 && Array.isArray(res.teachers)) {
          if (!cancelled) setTeachers(res.teachers);
        } else {
          if (!cancelled) {
            setTeachers([]);
            setError("Aucun enseignant trouvé.");
          }
        }
      } catch (err) {
        console.error("Erreur getAllTeachers:", err);
        if (!cancelled) setError("Impossible de charger les enseignants.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [show]);

  function handleClick(t) {
    setActiveId(t.id);
    onSelect?.(t);
  }

  return (
    <div className={styles.wrapper}>
      {loading && <p className={styles.message}>Chargement des enseignants…</p>}
      {error && <p className={styles.messageError}>{error}</p>}
      {!loading && !error && teachers.length === 0 && (
        <p className={styles.message}>Aucun enseignant trouvé.</p>
      )}

      <div className={styles.list}>
        {teachers.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`${styles.row} ${String(activeId) === String(t.id) ? styles.selected : ""}`}
            onClick={() => handleClick(t)}
            aria-pressed={String(activeId) === String(t.id)}
          >
            <span className={styles.name}>
              {t.name ?? t.full_name ?? t.label ?? `#${t.id}`}
            </span>
            <span className={styles.id}>CIN: {t.cin}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default TeacherList;
