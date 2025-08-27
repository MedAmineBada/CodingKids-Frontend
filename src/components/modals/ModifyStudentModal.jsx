import Modal from "react-bootstrap/Modal";
import styles from "./ModifyStudentModal.module.css";
import "@fontsource/quicksand/600";
import { Button } from "react-bootstrap";
import { useEffect, useState } from "react";
import { updateStudent } from "@/services/StudentServices.js";
import ErrorModal from "@/components/modals/ErrorModal.jsx";
import {
  capitalizeWords,
  cleanSpaces,
  removeAllSpaces,
} from "@/services/utils.js";

function ModifyStudentModal({ show, student, onClose, onSuccess }) {
  const [showError, setShowError] = useState(false);

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [tel1, setTel1] = useState("");
  const [tel2, setTel2] = useState("");
  const [email, setEmail] = useState("");

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

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleTel1Change = (e) => {
    const stripped = removeAllSpaces(e.target.value);
    setTel1(stripped);
  };

  const handleTel2Change = (e) => {
    const stripped = removeAllSpaces(e.target.value);
    setTel2(stripped);
  };

  const handleEmailChange = (e) => {
    const stripped = removeAllSpaces(e.target.value);
    setEmail(stripped);
  };

  async function handleUpdate() {
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
          "Les informations de l'étudiant sont invalides. Veuillez vérifier que le nom n’est pas vide et ne contient que des lettres et des espaces, que l’adresse e-mail et la date de naissance sont valides, et que les numéros de téléphone 1 et 2 comportent exactement 8 chiffres et sont différents.";
        setShowError(true);
      } else {
        msg =
          "Une erreur est survenue lors de la modification de l'étudiant. Veuillez réessayer.";
        setShowError(true);
      }

      if (code != null) {
        setErrorCode(code);
      }
      if (msg != null) {
        setErrorMsg(msg);
      }
    } catch {
      setShowError(true);
    }
  }
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
        <Modal.Header
          className={styles.header}
          style={{ border: "none", paddingTop: 30, paddingBottom: 0 }}
        >
          Modifier l'étudiant
        </Modal.Header>
        <Modal.Body className={styles.body}>
          <div className={styles.field}>
            <label>Nom:</label>
            <input type="text" value={name} onChange={handleNameChange}></input>
          </div>
          <div className={styles.field}>
            <label>Date de Naissance:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            ></input>
          </div>
          <div className={styles.field}>
            <label>Tel. 1:</label>
            <input
              type="number"
              value={tel1}
              onChange={handleTel1Change}
            ></input>
          </div>
          <div className={styles.field}>
            <label>Tel. 2:</label>
            <input
              type="number"
              value={tel2}
              onChange={handleTel2Change}
            ></input>
          </div>
          <div className={styles.field}>
            <label>E-Mail:</label>
            <input
              style={{ textTransform: "none" }}
              type="mail"
              value={email}
              onChange={handleEmailChange}
            ></input>
          </div>
        </Modal.Body>
        <Modal.Footer className={styles.footer} style={{ border: "none" }}>
          <div className={styles.btns}>
            <Button variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleUpdate}>Enregistrer</Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ModifyStudentModal;
