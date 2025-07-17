import { Container } from "react-bootstrap";

import styles from "./loginContainer.module.css";
import horse from "../../assets/images/horse.svg";

import Logo from "../logo/logo.jsx";
import LoginForm from "./loginForm.jsx";

import "@fontsource/inter/700";
import "@fontsource/inter/800";
import "@fontsource/inter/900";

import "@fontsource/quicksand/400.css";
import "@fontsource/quicksand/700.css";

import MediaQuery from "react-responsive";
import HorseSVG from "./horse/horseSVG.jsx";

function LoginContainer() {
  return (
    <>
      {/*<LoadingContainer></LoadingContainer>*/}
      <MediaQuery minWidth={1199}>
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
      </MediaQuery>
      <MediaQuery minWidth={900} maxWidth={1199}>
        <Container fluid className={styles.loginContainerLaptop}>
          <Container className={styles.midCol}>
            <Container className={styles.logoContainer}>
              <Logo className={styles.logo}></Logo>
              <Container className={styles.title}>
                <img src={horse} alt="" className={styles.horse} />
                <h1 className={styles.bgTitle}>Coding Kids</h1>
                <img
                  src={horse}
                  alt=""
                  className={styles.horse}
                  style={{ transform: "scaleX(-1)" }}
                />
              </Container>
              <h2 className={styles.bgTitle2}>Administration</h2>
            </Container>
            <LoginForm></LoginForm>
          </Container>
        </Container>
      </MediaQuery>
      {/*<MediaQuery minWidth={769} maxWidth={899.5}></MediaQuery>*/}
      {/*<MediaQuery minWidth={481} maxWidth={768}></MediaQuery>*/}

      <MediaQuery maxWidth={575.5}>
        <Container fluid className={styles.wrapper}>
          <Container fluid className={styles.logoContainer}>
            <Logo className={styles.logo}></Logo>
            <Container className={styles.title}>
              <HorseSVG></HorseSVG>
              <h1 className={styles.bgTitle}>Coding Kids</h1>
              <HorseSVG></HorseSVG>
            </Container>
            <h2 className={styles.bgTitle2}>Administration</h2>
          </Container>
          <LoginForm></LoginForm>
        </Container>
      </MediaQuery>
    </>
  );
}

export default LoginContainer;
