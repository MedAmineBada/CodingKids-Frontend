import Modal from "react-bootstrap/Modal";
import styles from "./ModifyTeacher.module.css";
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

export default function ModifyTeacherModal({
  show,
  teacher,
  onClose,
  onSuccess,
}) {
  const [showError, setShowError] = useState(false);
  const [name, setName] = useState("");
  const [tel, setTel] = useState("");
  const [email, setEmail] = useState("");
  const [cin, setCin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (teacher) {
      setCin(teacher.cin ?? "");
      setName(teacher.name ?? "");
      setTel(teacher.tel ?? "");
      setEmail(teacher.email ?? "");
    }
  }, [teacher]);

  const [errorMsg, setErrorMsg] = useState(null);
  const [errorCode, setErrorCode] = useState(500);

  const handleNameChange = (e) => setName(e.target.value);
  const handleTelChange = (e) => setTel(removeAllSpaces(e.target.value));
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
    if (tel && !phoneRegex.test(tel))
      return "Tel. doit contenir exactement 8 chiffres.";

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
      id: teacher.id,
      cin: removeAllSpaces(cin),
      name: capitalizeWords(cleanSpaces(name)),
      tel: removeAllSpaces(tel),
      email: removeAllSpaces(email),
    };

    try {
      const result = await updateStudent(teacher.id, newData);
      let msg = null;
      let code = null;

      if (result === 200) {
        onSuccess(newData);
        onClose();
      } else if (result === 404) {
        code = 404;
        msg = "L'enseignant à modifier n'a pas été trouvé.";
        setShowError(true);
      } else if (result === 422) {
        code = 422;
        msg =
          "Les informations de l'enseignant sont invalides. Veuillez vérifier les champs et réessayer.";
        setShowError(true);
      } else {
        msg =
          "Une erreur est survenue lors de la modification de l'enseignant. Veuillez réessayer.";
        setShowError(true);
      }

      if (code != null) setErrorCode(code);
      if (msg != null) setErrorMsg(msg);
    } catch {
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
    if (!teacher) return true;
    return (
      (capitalizeWords(cleanSpaces(name)) || "") === (teacher.name || "") &&
      (cin || "") === (teacher.cin || "") &&
      (tel || "") === (teacher.tel || "") &&
      (email || "") === (teacher.email || "")
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
              <h3>Modifier l'enseignant</h3>
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
              <span className={styles.label}>CIN</span>
              <input
                className={styles.input}
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={cin}
                onChange={(e) => setCin(e.target.value)}
              />
            </label>

            <div className={styles.row}>
              <label className={styles.fieldSmall}>
                <span className={styles.label}>Tel.</span>
                <input
                  className={styles.input}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={tel}
                  onChange={handleTelChange}
                  placeholder="8 chiffres"
                />
              </label>

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
