import { Container } from "react-bootstrap";
import styles from "./loginContainer.module.css";
import Logo from "../logo/logo.jsx";
import horse from "../../assets/images/horse.svg";
import LoginForm from "./loginForm.jsx";

import "@fontsource/inter/700";
import "@fontsource/inter/800";
import "@fontsource/inter/900";

import "@fontsource/quicksand/400.css";
import "@fontsource/quicksand/700.css";

function LoginContainer() {
  return (
    <Container fluid className={styles.loginContainer}>
      <Container fluid className={styles.rowContainer}>
        <Container className={styles.leftCol}>
          <Container className={styles.logoContainer}>
            <Logo className={styles.logo}></Logo>
            <Container className={styles.title}>
              <img src={horse} alt="" />
              <h1 className={styles.bgTitle}>Coding Kids</h1>
              <img src={horse} alt="" style={{ transform: "scaleX(-1)" }} />
            </Container>
            <h2 className={styles.bgTitle2}>Administration</h2>
          </Container>
        </Container>
        <Container className={styles.rightCol}>
          <LoginForm></LoginForm>
        </Container>
      </Container>
    </Container>
  );
}

export default LoginContainer;
