import React, { useRef, useState } from "react";
import Modal from "react-bootstrap/Modal";
import styles from "./AddTeacher.module.css";
import { addTeacher } from "@/services/TeacherServices.js";
import ErrorModal from "@/components/modals/ErrorModal.jsx";

export default function AddTeacher({ show, onHide, onSuccess }) {
  const CINRef = useRef(null);
  const NameRef = useRef(null);
  const TelRef = useRef(null);
  const EmailRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState("");

  const [showError, setShowError] = useState(false);
  const [errcode, setErrcode] = useState(500);
  const [errmsg, setErrmsg] = useState("");

  async function handleAdd() {
    if (isSubmitting) return;
    setFeedback("");
    const cin = CINRef.current?.value?.trim() ?? "";
    const name = NameRef.current?.value?.trim() ?? "";
    const tel = TelRef.current?.value?.trim() ?? "";
    const email = EmailRef.current?.value?.trim() ?? "";

    if (!/^\d{8}$/.test(cin)) {
      setErrors({ cin: true });
      setErrcode(422);
      setErrmsg("CIN invalide : doit contenir exactement 8 chiffres.");
      setShowError(true);
      return;
    }

    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s'\-]+$/.test(name) || name.length < 1) {
      setErrors({ name: true });
      setErrcode(422);
      setErrmsg("Nom invalide : uniquement des lettres, non-vide.");
      setShowError(true);
      return;
    }

    if (!/^\d{8}$/.test(tel)) {
      setErrors({ tel: true });
      setErrcode(422);
      setErrmsg("Numéro Tel. invalide : doit contenir exactement 8 chiffres.");
      setShowError(true);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: true });
      setErrcode(422);
      setErrmsg("Adresse e-mail invalide.");
      setShowError(true);
      return;
    }

    const payload = { cin, name, tel, email };

    setIsSubmitting(true);
    setErrors({});
    try {
      const { status } = await addTeacher(payload);

      if (status === 201) {
        if (typeof onSuccess === "function") onSuccess();
        onHide();
        return;
      }

      if (status === 422) {
        setErrcode(422);
        setErrmsg(
          "Entrée invalide reçue du serveur — vérifiez que : CIN = 8 chiffres, Nom = lettres, Tel = 8 chiffres, Email = format valide.",
        );
        setShowError(true);
        return;
      }

      if (status === 409) {
        setErrcode(409);
        setErrmsg("Conflit : cet enseignant existe déjà (CIN déjà attribué).");
        setShowError(true);
        return;
      }

      if (status === 500) {
        setErrcode(500);
        setErrmsg("Erreur serveur. Veuillez réessayer plus tard.");
        setShowError(true);
        return;
      }

      setErrcode(status || 520);
      setErrmsg("Une erreur est survenue. Code : " + (status || "inconnu"));
      setShowError(true);
    } catch (err) {
      setErrcode(500);
      setErrmsg("Erreur réseau ou serveur. Vérifiez votre connexion.");
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleHide() {
    setErrors({});
    setFeedback("");
    onHide();
  }

  return (
    <>
      <ErrorModal
        show={showError}
        onClose={() => setShowError(false)}
        code={errcode}
        message={errmsg}
      />
      <Modal show={show} onHide={handleHide} centered size="m">
        <Modal.Header closeButton className={styles.header}>
          <Modal.Title className={styles.title}>Ajouter Enseignant</Modal.Title>
        </Modal.Header>

        <Modal.Body className={styles.body}>
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              handleAdd();
            }}
            noValidate
          >
            <div className={styles.row}>
              <label htmlFor="cin" className={styles.label}>
                CIN
              </label>
              <input
                id="cin"
                name="cin"
                type="text"
                inputMode="numeric"
                ref={CINRef}
                className={`${styles.input} ${errors.cin ? styles.invalid : ""}`}
                aria-invalid={!!errors.cin}
              />
            </div>

            <div className={styles.row}>
              <label htmlFor="name" className={styles.label}>
                Nom complet
              </label>
              <input
                id="name"
                name="name"
                type="text"
                ref={NameRef}
                className={`${styles.input} ${errors.name ? styles.invalid : ""}`}
                aria-invalid={!!errors.name}
              />
            </div>

            <div className={styles.row}>
              <label htmlFor="tel" className={styles.label}>
                Tel.
              </label>
              <input
                id="tel"
                name="tel"
                type="tel"
                inputMode="tel"
                ref={TelRef}
                className={`${styles.input} ${errors.tel ? styles.invalid : ""}`}
                aria-invalid={!!errors.tel}
              />
            </div>

            <div className={styles.row}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                ref={EmailRef}
                className={`${styles.input} ${errors.email ? styles.invalid : ""}`}
                aria-invalid={!!errors.email}
              />
            </div>

            {feedback && <div className={styles.feedback}>{feedback}</div>}

            <div className={styles.footer}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={handleHide}
                disabled={isSubmitting}
              >
                Annuler
              </button>

              <button
                type="submit"
                className={`${styles.btn} ${styles.btnPrimary}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Ajout en cours..." : "Ajouter"}
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}
