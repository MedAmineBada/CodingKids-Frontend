import Modal from "react-bootstrap/Modal";
import styles from "./ModifyStudentModal.module.css";
import "@fontsource/quicksand/600";
import { Button } from "react-bootstrap";
import { useEffect, useState } from "react";
import { updateStudent } from "@/services/StudentServices.js";
import ErrorModal from "@/components/modals/GenericModals/ErrorModal.jsx";
import {
  capitalizeWords,
  cleanSpaces,
  removeAllSpaces,
} from "@/services/utils.js";

export default function ModifyStudentModal({
  show,
  student,
  onClose,
  onSuccess,
}) {
  const [showError, setShowError] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [tel1, setTel1] = useState("");
  const [tel2, setTel2] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (student) {
      setName(student.name ?? "");
      setDate(student.birth_date ?? "");
      setTel1(student.tel1 ?? "");
      setTel2(student.tel2 ?? "");
      setEmail(student.email ?? "");
    }
  }, [student]);

  const [errorMsg, setErrorMsg] = useState(null);
  const [errorCode, setErrorCode] = useState(500);

  const handleNameChange = (e) => setName(e.target.value);
  const handleTel1Change = (e) => setTel1(removeAllSpaces(e.target.value));
  const handleTel2Change = (e) => setTel2(removeAllSpaces(e.target.value));
  const handleEmailChange = (e) => setEmail(removeAllSpaces(e.target.value));

  function validate() {
    const trimmedName = cleanSpaces(name || "");
    if (!trimmedName) return "Le nom ne peut pas être vide.";
    if (!/^([A-Za-zÀ-ÖØ-öø-ÿ]+\s?)+$/.test(trimmedName))
      return "Le nom ne doit contenir que des lettres et des espaces.";

    if (email) {
      const em = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      if (!em.test(email)) return "L'adresse e-mail est invalide.";
    }

    const phoneRegex = /^\d{8}$/;
    if (tel1 && !phoneRegex.test(tel1))
      return "Tel. 1 doit contenir exactement 8 chiffres.";
    if (tel2 && !phoneRegex.test(tel2))
      return "Tel. 2 doit contenir exactement 8 chiffres.";
    if (tel1 && tel2 && tel1 === tel2)
      return "Tel. 1 et Tel. 2 doivent être différents.";

    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date))
      return "Date de naissance invalide.";

    return null;
  }

  async function handleUpdate() {
    const clientError = validate();
    if (clientError) {
      setErrorCode(422);
      setErrorMsg(clientError);
      setShowError(true);
      return;
    }

    setSubmitting(true);

    let newData = {
      id: student.id,
      name: capitalizeWords(cleanSpaces(name)),
      birth_date: date,
      tel1: removeAllSpaces(tel1),
      tel2: removeAllSpaces(tel2),
      email: removeAllSpaces(email),
    };

    try {
      const result = await updateStudent(student.id, newData);
      let msg = null;
      let code = null;

      if (result === 200) {
        onSuccess(newData);
        onClose();
      } else if (result === 404) {
        code = 404;
        msg = "L'étudiant à modifier n'a pas été trouvé.";
        setShowError(true);
      } else if (result === 422) {
        code = 422;
        msg =
          "Les informations de l'étudiant sont invalides. Veuillez vérifier les champs et réessayer.";
        setShowError(true);
      } else {
        msg =
          "Une erreur est survenue lors de la modification de l'étudiant. Veuillez réessayer.";
        setShowError(true);
      }

      if (code != null) setErrorCode(code);
      if (msg != null) setErrorMsg(msg);
    } catch (err) {
      setErrorCode(500);
      setErrorMsg(
        "Échec de la requête — vérifiez votre connexion ou réessayez plus tard.",
      );
      setShowError(true);
    } finally {
      setSubmitting(false);
    }
  }

  const isUnchanged = () => {
    if (!student) return true;
    return (
      (capitalizeWords(cleanSpaces(name)) || "") === (student.name || "") &&
      (date || "") === (student.birth_date || "") &&
      (tel1 || "") === (student.tel1 || "") &&
      (tel2 || "") === (student.tel2 || "") &&
      (email || "") === (student.email || "")
    );
  };

  return (
    <>
      <ErrorModal
        show={showError}
        {...(errorMsg != null ? { message: errorMsg } : {})}
        code={errorCode}
        onClose={() => setShowError(false)}
      />

      <Modal
        className={styles.container}
        show={show}
        size="m"
        centered
        onHide={onClose}
      >
        <div className={styles.headerWrapper}>
          <Modal.Header className={styles.header} style={{ border: "none" }}>
            <div className={styles.titleBlock}>
              <h3>Modifier l'étudiant</h3>
            </div>
          </Modal.Header>
        </div>

        <Modal.Body className={styles.body}>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.label}>Nom</span>
              <input
                className={styles.input}
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="Ex: Ahmed Ben Ali"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Date de naissance</span>
              <input
                className={styles.input}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>

            <div className={styles.row}>
              <label className={styles.fieldSmall}>
                <span className={styles.label}>Tel. 1</span>
                <input
                  className={styles.input}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={tel1}
                  onChange={handleTel1Change}
                  placeholder="8 chiffres"
                />
              </label>

              <label className={styles.fieldSmall}>
                <span className={styles.label}>Tel. 2</span>
                <input
                  className={styles.input}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={tel2}
                  onChange={handleTel2Change}
                  placeholder="8 chiffres (optionnel)"
                />
              </label>
            </div>

            <label className={styles.field}>
              <span className={styles.label}>E‑mail</span>
              <input
                className={styles.input}
                style={{ textTransform: "none" }}
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="exemple@domaine.com"
              />
            </label>
          </div>
        </Modal.Body>

        <Modal.Footer className={styles.footer} style={{ border: "none" }}>
          <div className={styles.btns}>
            <Button
              variant="outline-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={submitting || isUnchanged()}
            >
              {submitting
                ? "Enregistrement…"
                : isUnchanged()
                  ? "Aucune modification"
                  : "Enregistrer"}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}
