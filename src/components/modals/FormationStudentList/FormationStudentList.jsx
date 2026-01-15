import { useEffect, useMemo, useState } from "react";
import Modal from "react-bootstrap/Modal";
import {
  get_enrolled_students,
  remove_enrollment,
} from "@/services/FormationServices.js";
import styles from "./FormationStudentList.module.css";
import ErrorModal from "@/components/modals/GenericModals/ErrorModal.jsx";
import ConfirmModal from "@/components/modals/GenericModals/ConfirmModal.jsx";

export function FormationStudentList({ show, closeModal, formationId }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Error modal state
  const [errOpen, setErrOpen] = useState(false);
  const [errCode, setErrCode] = useState(null);
  const [errMessage, setErrMessage] = useState("");

  // Confirm modal state
  const [showActionConfirm, setShowActionConfirm] = useState(false);
  const [actionConfirmTitle, setActionConfirmTitle] = useState("");
  const [actionConfirmMessage, setActionConfirmMessage] = useState("");
  const [actionConfirmFunc, setActionConfirmFunc] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) {
      return students;
    }
    return students.filter((student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [students, searchQuery]);

  useEffect(() => {
    if (show && formationId) {
      fetchStudents();
    }
  }, [show, formationId]);

  useEffect(() => {
    if (!show) {
      setStudents([]);
      setSearchQuery("");
    }
  }, [show]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const result = await get_enrolled_students(formationId);
      if (result.status === 200) {
        setStudents(result.students || []);
      } else {
        setErrCode(result.status);
        setErrMessage(
          "Une erreur s'est produite, veuillez réessayer plus tard",
        );
        setErrOpen(true);
        setStudents([]);
      }
    } catch (err) {
      setErrCode(500);
      setErrMessage("Une erreur s'est produite, veuillez réessayer plus tard");
      setErrOpen(true);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveClick = (student) => {
    setSelectedStudentId(student.id);
    setActionConfirmTitle("Retirer l'inscription");
    setActionConfirmMessage(
      `Êtes-vous sûr de vouloir retirer ${student.name} de cette formation ?`,
    );
    setActionConfirmFunc(() => () => handleRemoveEnrollment(student.id));
    setShowActionConfirm(true);
  };

  const handleRemoveEnrollment = async (studentId) => {
    try {
      const status = await remove_enrollment(studentId, formationId);

      if (status === 200) {
        // Remove student from list
        setStudents((prevStudents) =>
          prevStudents.filter((s) => s.id !== studentId),
        );
        setShowActionConfirm(false);
      } else {
        setShowActionConfirm(false);
        setErrCode(status);
        setErrMessage(
          "Impossible de retirer l'inscription, veuillez réessayer plus tard",
        );
        setErrOpen(true);
      }
    } catch (err) {
      setShowActionConfirm(false);
      setErrCode(500);
      setErrMessage("Une erreur s'est produite, veuillez réessayer plus tard");
      setErrOpen(true);
    }
  };

  return (
    <>
      <Modal
        show={show}
        onHide={closeModal}
        centered
        className={styles.modal}
        scrollable
      >
        <Modal.Header closeButton className={styles.header}>
          <Modal.Title className={styles.title}>Étudiants Inscrits</Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.body}>
          {/* Search Bar */}
          {!loading && students.length > 0 && (
            <div className={styles.searchContainer}>
              <svg
                className={styles.searchIcon}
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Rechercher un étudiant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className={styles.clearBtn}
                  onClick={() => setSearchQuery("")}
                  type="button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {loading && (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <span>Chargement...</span>
            </div>
          )}

          {!loading && students.length === 0 && (
            <div className={styles.emptyContainer}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Aucun étudiant inscrit</span>
            </div>
          )}

          {!loading && students.length > 0 && filteredStudents.length === 0 && (
            <div className={styles.noResultsContainer}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              <span>Aucun résultat pour "{searchQuery}"</span>
            </div>
          )}

          {!loading && filteredStudents.length > 0 && (
            <div className={styles.studentList}>
              {filteredStudents.map((student) => (
                <div key={student.id} className={styles.studentCard}>
                  <span className={styles.studentName}>{student.name}</span>
                  <button
                    type="button"
                    className={styles.removeEnrollBtn}
                    onClick={() => handleRemoveClick(student)}
                    aria-label="Retirer l'inscription"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M18 6L6 18M6 6l12 12"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {!loading && students.length > 0 && (
            <div className={styles.footer}>
              <span className={styles.count}>
                {filteredStudents.length === students.length
                  ? `${students.length} étudiant${students.length !== 1 ? "s" : ""} inscrit${students.length !== 1 ? "s" : ""}`
                  : `${filteredStudents.length} sur ${students.length} étudiant${students.length !== 1 ? "s" : ""}`}
              </span>
            </div>
          )}
        </Modal.Body>
      </Modal>

      <ErrorModal
        show={errOpen}
        onClose={() => setErrOpen(false)}
        code={errCode}
        message={errMessage}
      />

      <ConfirmModal
        show={showActionConfirm}
        onClose={() => setShowActionConfirm(false)}
        title={actionConfirmTitle}
        message={actionConfirmMessage}
        btn_yes="Confirmer"
        btn_no="Annuler"
        func={actionConfirmFunc}
      />
    </>
  );
}
