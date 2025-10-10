import { Container } from "react-bootstrap";

import styles from "./LoginContainer.module.css";
import horse from "../../assets/images/icons/horse.svg";

import Logo from "../logo/Logo.jsx";
import LoginForm from "./LoginForm.jsx";

import "@fontsource/inter/700";
import "@fontsource/inter/800";
import "@fontsource/inter/900";

import "@fontsource/quicksand/400.css";
import "@fontsource/quicksand/700.css";

import MediaQuery from "react-responsive";
import HorseIcon from "./horse/HorseIcon.jsx";
import FirstLogin from "@/components/FistLogin/FirstLogin.jsx";

function LoginContainer() {
  return (
    <>
      <FirstLogin initialShow={true}></FirstLogin>
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
      <MediaQuery minWidth={576} maxWidth={899.5}>
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
      <MediaQuery maxWidth={575.5}>
        <Container fluid className={styles.wrapper}>
          <Container fluid className={styles.logoContainer}>
            <Logo className={styles.logo}></Logo>
            <Container className={styles.title}>
              <HorseIcon></HorseIcon>
              <h1 className={styles.bgTitle}>Coding Kids</h1>
              <HorseIcon></HorseIcon>
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
