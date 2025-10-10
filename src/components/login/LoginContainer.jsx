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
import { useEffect, useState } from "react";
import { add_admin, check_admins } from "@/services/AuthServices.js";
import ErrorModal from "@/components/modals/GenericModals/ErrorModal.jsx";
import SuccessModal from "@/components/modals/GenericModals/SuccessModal.jsx";

function LoginContainer() {
  useEffect(() => {
    async function check() {
      const code = await check_admins();
      if (code === 404) {
        setshowcreate(true);
      } else if (code === 200) {
        setshowcreate(false);
      } else {
        setshowcreate(false);
        seterrmsg(
          "Une erreur s'est produite lors de la tentative de contact avec les serveurs, veuillez réessayer plus tard.",
        );
        seterrcode(code);
        setshowerror(true);
      }
    }
    check();
  }, []);

  async function signup(data) {
    const code = await add_admin(data);
    if (code === 201) {
      setsuccessmsg("Le compte administrateur a été créé avec succès.");
      setsuccesstitle("Succès");
      setshowsuccess(true);
      setshowcreate(false);
    } else if (code === 409) {
      seterrmsg(
        "Un administrateur existe déjà, impossible d'en ajouter un autre.",
      );
      seterrcode(409);
      setshowerror(true);
    } else if (code === 422) {
      seterrmsg(
        "Les données saisies sont incompatibles :\n" +
          "Le nom d’utilisateur ne peut contenir que des caractères alphabétiques.\n" +
          "Le mot de passe ne peut contenir que des caractères alphanumériques ou les symboles autorisés.",
      );
      seterrcode(422);
      setshowerror(true);
    } else {
      seterrmsg("Une erreur s'est produite, veuillez réessayer plus tard.");
      seterrcode(500);
      setshowerror(true);
    }
  }

  const [showcreate, setshowcreate] = useState(false);
  const [showerror, setshowerror] = useState(false);
  const [errmsg, seterrmsg] = useState("");
  const [errcode, seterrcode] = useState(500);

  const [showsuccess, setshowsuccess] = useState(false);
  const [successmsg, setsuccessmsg] = useState("");
  const [successtitle, setsuccesstitle] = useState(500);
  return (
    <>
      <SuccessModal
        show={showsuccess}
        onClose={() => setshowsuccess(false)}
        message={successmsg}
        title={successtitle}
      ></SuccessModal>
      <ErrorModal
        show={showerror}
        onClose={() => setshowerror(false)}
        code={errcode}
        message={errmsg}
      ></ErrorModal>
      <FirstLogin
        show={showcreate}
        onClose={() => setshowcreate(false)}
        onSubmit={signup}
      ></FirstLogin>
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
