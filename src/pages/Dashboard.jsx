import styles from "./Dashboard.module.css";

import "@fontsource/inter/700";
import "@fontsource/inter/900";
import "@fontsource/quicksand/500.css";

import MediaQuery from "react-responsive";
import MobileCard from "@/components/cards/MobileCard.jsx";

import QrIcon from "@/assets/images/icons/qr.svg";
import RegisterIcon from "@/assets/images/icons/register.svg";
import StudentsIcon from "@/assets/images/icons/students.svg";
import TeacherIcon from "@/assets/images/icons/teachers.svg";
import DisconnectIcon from "@/assets/images/icons/disconnect.svg";
import DesktopCard from "@/components/cards/DesktopCard.jsx";
import { useState } from "react";
import ScanResultModal from "@/components/modals/ScanResult.jsx";

function Dashboard() {
  if (localStorage.getItem("scanResult") !== null) {
    localStorage.removeItem("scanResult");
  }
  const [showRes, setShowRes] = useState(false);
  const handleShowRes = () => setShowRes(true);

  function handleCloseRes() {
    localStorage.removeItem("scanResult");
    setShowRes(false);
  }

  return (
    <>
      <ScanResultModal show={showRes} handleClose={handleCloseRes} />
      <div className={styles.title}>
        <h1>Dashboard</h1>
      </div>
      <div className={styles.content}>
        <MediaQuery maxWidth={1199.5}>
          <MobileCard
            handleShow={handleShowRes}
            handleClose={handleCloseRes}
            image={QrIcon}
            title="Scanner"
            text="Scanner le Code QR d'un étudiant."
            route="/scan"
          ></MobileCard>
          <MobileCard
            image={RegisterIcon}
            title="Inscription"
            text="Inscrire un étudiant dans le système."
            route="/inscription"
          ></MobileCard>
          <MobileCard
            image={StudentsIcon}
            title="Étudiants"
            text="Gérer les étudiants dans le système."
            route="/etudiants"
          ></MobileCard>
          <MobileCard
            image={TeacherIcon}
            title="Enseignants"
            text="Gérer les étudiants dans le système."
            route="/enseignants"
          ></MobileCard>
          <MobileCard
            image={DisconnectIcon}
            title="Déconnecter"
            text="Se déconnecter du système."
            type="disconnect"
            route="/login"
          ></MobileCard>
        </MediaQuery>
        <MediaQuery minWidth={1200}>
          <DesktopCard
            handleShow={handleShowRes}
            handleClose={handleCloseRes}
            image={QrIcon}
            title="Scanner"
            text="Scanner le Code QR d'un étudiant."
            route="/scan"
          ></DesktopCard>
          <DesktopCard
            image={RegisterIcon}
            title="Inscription"
            text="Inscrire un étudiant dans le système."
            route="/inscription"
          ></DesktopCard>
          <DesktopCard
            image={StudentsIcon}
            title="Étudiants"
            text="Gérer les étudiants dans le système."
            route="/etudiants"
          ></DesktopCard>
          <DesktopCard
            image={TeacherIcon}
            title="Enseignants"
            text="Gérer les étudiants dans le système."
            route="/enseignants"
          ></DesktopCard>
          <DesktopCard
            image={DisconnectIcon}
            title="Déconnecter"
            text="Se déconnecter du système."
            type="disconnect"
            route="/login"
          ></DesktopCard>
        </MediaQuery>
      </div>
    </>
  );
}

export default Dashboard;
