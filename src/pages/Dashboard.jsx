import styles from "./Dashboard.module.css";

import "@fontsource/inter/700";
import "@fontsource/inter/900";
import "@fontsource/quicksand/500.css";

import MediaQuery from "react-responsive";
import VerticalCard from "@/components/cards/VerticalCard.jsx";

import QrIcon from "@/assets/images/icons/qr.svg";
import RegisterIcon from "@/assets/images/icons/register.svg";
import StudentsIcon from "@/assets/images/icons/students.svg";
import TeacherIcon from "@/assets/images/icons/teachers.svg";
import DisconnectIcon from "@/assets/images/icons/disconnect.svg";
import HorizontalCard from "@/components/cards/HorizontalCard.jsx";
import { useState } from "react";
import ScanResultModal from "@/components/modals/ScanResult.jsx";

function Dashboard() {
  if (localStorage.getItem("scanResult") !== null) {
    localStorage.removeItem("scanResult");
  }
  const [show, setShow] = useState(false);
  const handleShow = () => setShow(true);
  function handleClose() {
    localStorage.removeItem("scanResult");
    setShow(false);
  }

  return (
    <>
      <ScanResultModal show={show} handleClose={handleClose} />
      <div className={styles.title}>
        <h1>Dashboard</h1>
      </div>
      <div className={styles.content}>
        <MediaQuery maxWidth={1199.5}>
          <VerticalCard
            handleShow={handleShow}
            image={QrIcon}
            title="Scanner"
            text="Scanner le Code QR d'un étudiant."
            route="/scan"
          ></VerticalCard>
          <VerticalCard
            image={RegisterIcon}
            title="Inscription"
            text="Inscrire un étudiant dans le système."
            route="/inscription"
          ></VerticalCard>
          <VerticalCard
            image={StudentsIcon}
            title="Étudiants"
            text="Gérer les étudiants dans le système."
            route="/etudiants"
          ></VerticalCard>
          <VerticalCard
            image={TeacherIcon}
            title="Enseignants"
            text="Gérer les étudiants dans le système."
            route="/enseignants"
          ></VerticalCard>
          <VerticalCard
            image={DisconnectIcon}
            title="Déconnecter"
            text="Se déconnecter du système."
            type="disconnect"
            route="/login"
          ></VerticalCard>
        </MediaQuery>
        <MediaQuery minWidth={1200}>
          <HorizontalCard
            handleShow={handleShow}
            image={QrIcon}
            title="Scanner"
            text="Scanner le Code QR d'un étudiant."
            route="/scan"
          ></HorizontalCard>
          <HorizontalCard
            image={RegisterIcon}
            title="Inscription"
            text="Inscrire un étudiant dans le système."
            route="/inscription"
          ></HorizontalCard>
          <HorizontalCard
            image={StudentsIcon}
            title="Étudiants"
            text="Gérer les étudiants dans le système."
            route="/etudiants"
          ></HorizontalCard>
          <HorizontalCard
            image={TeacherIcon}
            title="Enseignants"
            text="Gérer les étudiants dans le système."
            route="/enseignants"
          ></HorizontalCard>
          <HorizontalCard
            image={DisconnectIcon}
            title="Déconnecter"
            text="Se déconnecter du système."
            type="disconnect"
            route="/login"
          ></HorizontalCard>
        </MediaQuery>
      </div>
    </>
  );
}

export default Dashboard;
