import React, { useState } from "react";
import { Container, Form } from "react-bootstrap";
import styles from "./loginForm.module.css";
import EyeToggle from "./passwordEye.jsx";
import LoginButton from "./loginButton.jsx";

export default function LoginForm() {
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.replaceAll(" ", "") === "") {
      setEmailError("Veuillez entrer un email.");
      return false;
    }

    if (!validateEmail(email)) {
      setEmailError("Veuillez entrer un email valide.");
      return false;
    }
  };

  return (
    <Container className={styles.wrapper}>
      <h1 className={styles.formTitle}>Se Connecter</h1>
      <Container className={styles.topContainer} fluid>
        <Form className={styles.form} onSubmit={handleSubmit}>
          <Form.Group>
            {emailError && <p className={styles.errorMsg}>{emailError}</p>}
            <Form.Label className={styles.labels} column={true}>
              Email
            </Form.Label>
            <Form.Control
              className={styles.inputs}
              type="email"
              id="email"
              placeholder="Entrez votre email"
              value={email}
              onChange={handleEmailChange}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label className={styles.labels} column={true}>
              Mot de passe
              <EyeToggle onChange={setShowPwd} />
            </Form.Label>
            <Form.Control
              className={styles.inputs}
              type={showPwd ? "text" : "password"}
              placeholder="Entrez votre mot de passe"
            />
          </Form.Group>
          <Form.Group>
            <LoginButton></LoginButton>
          </Form.Group>
          <Form.Group className={styles.extras}>
            <div className={styles.extrasContainer}>
              <div className={styles.check}>
                <input id="rememberMe" type="checkbox" />
                <label
                  htmlFor="rememberMe"
                  style={{ userSelect: "none", cursor: "pointer" }}
                >
                  &nbsp;Rester connecté?
                </label>
              </div>
              <div>
                <a href="#" style={{ userSelect: "none", cursor: "pointer" }}>
                  Mot de passe oublié?
                </a>
              </div>
            </div>
          </Form.Group>
        </Form>
      </Container>
    </Container>
  );
}
