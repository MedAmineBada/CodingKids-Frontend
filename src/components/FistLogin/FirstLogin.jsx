import React, { useRef, useState } from "react";
import { Button, Container, Form, Modal } from "react-bootstrap";
import styles from "./fistlogin.module.css";
import EyeToggle from "@/components/login/PasswordEye.jsx";

export default function FirstLogin({ show, onSubmit, onClose }) {
  const [showPwd, setShowPwd] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const formRef = useRef(null);

  // alphabetic (allow common latin accents)
  const usernameAlphaRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ]+$/;

  // allowed password characters: letters, digits and common symbols (slash, #, !, @, etc.)
  const passwordAllowedRegex =
    /^[A-Za-z0-9\/#!@\$%\^&*\(\)\-_\+=\[\]{}|\\;:'",.<>?~]+$/;

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (usernameError) setUsernameError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError("");
  };

  const submitForm = (e) => {
    // allow calling directly (from footer button) without an event
    if (e && e.preventDefault) e.preventDefault();

    const trimmedUsername = username.trim();

    if (trimmedUsername === "") {
      setUsernameError("Veuillez entrer un nom d'administrateur.");
      return;
    }

    if (!usernameAlphaRegex.test(trimmedUsername)) {
      setUsernameError("Le nom doit contenir uniquement des lettres.");
      return;
    }

    if (password.trim() === "") {
      setPasswordError("Veuillez entrer un mot de passe.");
      return;
    }

    if (!passwordAllowedRegex.test(password)) {
      setPasswordError(
        "Le mot de passe contient des caractères non autorisés.",
      );
      return;
    }

    // valid -> forward to caller if provided
    if (typeof onSubmit === "function") {
      onSubmit({ username: trimmedUsername, password });
    } else {
      // fallback: log (remove in production)
      // eslint-disable-next-line no-console
      console.log("FirstLogin submit:", {
        username: trimmedUsername,
        password,
      });
    }

    onClose;
  };

  // unique id for remember-me to avoid collisions
  const rememberMeId = `rememberMe-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <Modal
      show={show}
      size="lg"
      onHide={onClose}
      centered
      contentClassName={styles.modalContent}
      dialogClassName={styles.modalDialog}
    >
      {/* header: no "A" logo mark anymore */}
      <Modal.Header className={styles.modalHeader}>
        <div className={styles.headerTitle}>
          <div>
            <div className={styles.titleMain}>Créer un administrateur</div>
            <small className={styles.titleSub}>
              Configurez le premier compte administrateur
            </small>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className={styles.modalBody}>
        <Container className={styles.wrapper}>
          {/* disable native submit so only footer button triggers submit */}
          <Form
            ref={formRef}
            className={styles.form}
            onSubmit={(e) => e.preventDefault()}
          >
            <Form.Group>
              <Form.Label className={styles.labels} column>
                Nom d'Administrateur
              </Form.Label>
              {usernameError && (
                <p className={styles.errorMsg}>{usernameError}</p>
              )}
              <Form.Control
                className={styles.inputs}
                type="text"
                id="username"
                placeholder="Entrez votre nom d'administrateur"
                value={username}
                onChange={handleUsernameChange}
                autoFocus
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className={styles.labels} column>
                Mot de Passe
                <span className={styles.eyeWrap}>
                  <EyeToggle onChange={setShowPwd} />
                </span>
              </Form.Label>
              {passwordError && (
                <p className={styles.errorMsg}>{passwordError}</p>
              )}
              <Form.Control
                className={styles.inputs}
                type={showPwd ? "text" : "password"}
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={handlePasswordChange}
                autoComplete="new-password"
              />
              <div className={styles.hint}>
                Autorisé : lettres, chiffres et symboles comme{" "}
                <code>/ # ! @ $ %</code>
              </div>
            </Form.Group>
          </Form>
        </Container>
      </Modal.Body>

      <Modal.Footer className={styles.modalFooter}>
        <Button variant="light" className={styles.ghostBtn} onClick={onClose}>
          Annuler
        </Button>

        {/* Footer button is the only submit trigger now */}
        <Button className={styles.primaryBtn} onClick={submitForm}>
          Confirmer
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
