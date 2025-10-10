import React, { useState } from "react";
import { Container, Form } from "react-bootstrap";
import styles from "./LoginForm.module.css";
import EyeToggle from "./PasswordEye.jsx";
import LoginButton from "./button/LoginButton.jsx";
import MediaQuery from "react-responsive";

export default function LoginForm() {
  const [showPwd, setShowPwd] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (usernameError) setUsernameError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.replaceAll(" ", "") === "") {
      setUsernameError("Veuillez entrer un nom d'administrateur.");
      return false;
    }

    // success path: you can call API here or forward upwards
    return true;
  };

  return (
    <>
      <Container className={styles.wrapper}>
        <MediaQuery minWidth={1199}>
          <h1 className={styles.formTitle}>Se Connecter</h1>
        </MediaQuery>

        <MediaQuery minWidth={576} maxWidth={899.5}>
          <Container className={styles.topContainer} fluid>
            <Form className={styles.form} onSubmit={handleSubmit}>
              <MediaQuery minWidth={900} maxWidth={1199}>
                <h1 className={styles.formTitleLaptop}>Se Connecter</h1>
              </MediaQuery>

              <Form.Group>
                {usernameError && (
                  <p className={styles.errorMsg}>{usernameError}</p>
                )}
                <Form.Label className={styles.labels} column={true}>
                  Nom d'administrateur
                </Form.Label>
                <Form.Control
                  className={styles.inputs}
                  type="text"
                  id="username"
                  placeholder="Entrez votre nom d'administrateur"
                  value={username}
                  onChange={handleUsernameChange}
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
                    <a
                      href="#"
                      style={{ userSelect: "none", cursor: "pointer" }}
                    >
                      Mot de passe oublié?
                    </a>
                  </div>
                </div>
              </Form.Group>
            </Form>
          </Container>
        </MediaQuery>

        <MediaQuery minWidth={900}>
          <Container className={styles.topContainer} fluid>
            <Form className={styles.form} onSubmit={handleSubmit}>
              <MediaQuery minWidth={900} maxWidth={1199}>
                <h1 className={styles.formTitleLaptop}>Se Connecter</h1>
              </MediaQuery>

              <Form.Group>
                {usernameError && (
                  <p className={styles.errorMsg}>{usernameError}</p>
                )}
                <Form.Label className={styles.labels} column={true}>
                  Nom d'administrateur
                </Form.Label>
                <Form.Control
                  className={styles.inputs}
                  type="text"
                  id="username"
                  placeholder="Entrez votre nom d'administrateur"
                  value={username}
                  onChange={handleUsernameChange}
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
                    <a
                      href="#"
                      style={{ userSelect: "none", cursor: "pointer" }}
                    >
                      Mot de passe oublié?
                    </a>
                  </div>
                </div>
              </Form.Group>
            </Form>
          </Container>
        </MediaQuery>

        <MediaQuery maxWidth={575.5}>
          <h1>Se Connecter</h1>

          <Container fluid className={styles.top}>
            <Form onSubmit={handleSubmit}>
              <Form.Group className={styles.fields}>
                {usernameError && (
                  <p className={styles.errorMsg}>{usernameError}</p>
                )}
                <Form.Label column={true}>Nom d'administrateur</Form.Label>
                <Form.Control
                  type="text"
                  id="username"
                  placeholder="Entrez votre nom d'administrateur"
                  value={username}
                  onChange={handleUsernameChange}
                />
              </Form.Group>

              <Form.Group className={styles.fields}>
                <Form.Label column={true}>
                  Mot de passe
                  <EyeToggle onChange={setShowPwd} />
                </Form.Label>
                <Form.Control
                  type={showPwd ? "text" : "password"}
                  placeholder="Entrez votre mot de passe"
                />
              </Form.Group>

              <Form.Group className={styles.extraField}>
                <Container className={styles.rememberMeContainer}>
                  <input id="rememberMe" type="checkbox" />
                  <label
                    htmlFor="rememberMe"
                    style={{ userSelect: "none", cursor: "pointer" }}
                  >
                    &nbsp;Rester connecté?
                  </label>
                </Container>
                <Container className={styles.forgottenContainer}>
                  <a href="#" style={{ userSelect: "none", cursor: "pointer" }}>
                    Mot de passe oublié?
                  </a>
                </Container>
              </Form.Group>

              <Form.Group className={styles.fields}>
                <LoginButton></LoginButton>
              </Form.Group>
            </Form>
          </Container>
        </MediaQuery>
      </Container>
    </>
  );
}
