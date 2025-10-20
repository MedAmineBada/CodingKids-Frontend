import styles from "./Dashboard.module.css";

import "@fontsource/inter/500";
import "@fontsource/inter/600";
import "@fontsource/inter/700";
import "@fontsource/inter/900";
import "@fontsource/quicksand/500.css";

import MediaQuery from "react-responsive";
import MobileCard from "@/components/cards/MobileCard.jsx";

import QrIcon from "@/assets/images/icons/qr.svg";
import RegisterIcon from "@/assets/images/icons/register.svg";
import StudentsIcon from "@/assets/images/icons/students.svg";
import TeacherIcon from "@/assets/images/icons/teachers.svg";
import SubjectIcon from "@/assets/images/icons/formations.svg";
import DisconnectIcon from "@/assets/images/icons/disconnect.svg";
import DesktopCard from "@/components/cards/DesktopCard.jsx";
import { useState } from "react";
import ScanResultModal from "@/components/modals/ScanResult.jsx";
import Inscription from "@/components/modals/Inscription/Inscription.jsx";
import Formation from "@/components/FormationModal/Formation.jsx";
import EditAcc from "@/components/EditAcc/editacc.jsx";

function Dashboard() {
  if (localStorage.getItem("scanResult") !== null) {
    localStorage.removeItem("scanResult");
  }
  const [showRes, setShowRes] = useState(false);
  const handleShowRes = () => setShowRes(true);
  const [showInscription, setShowInscription] = useState(false);
  const [showFormation, setShowFormation] = useState(false);

  function handleCloseRes() {
    localStorage.removeItem("scanResult");
    setShowRes(false);
  }

  return (
    <>
      <EditAcc></EditAcc>
      <Formation
        show={showFormation}
        onclose={() => setShowFormation(false)}
      ></Formation>
      <ScanResultModal show={showRes} handleClose={handleCloseRes} />
      <Inscription
        show={showInscription}
        close={() => setShowInscription(false)}
      ></Inscription>
      <div className={styles.body}>
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
              text="Inscrire un étudiant."
              clickfunc={() => setShowInscription(true)}
            ></MobileCard>
            <MobileCard
              image={StudentsIcon}
              title="Étudiants"
              text="Gérer les étudiants."
              route="/etudiants"
            ></MobileCard>
            <MobileCard
              image={TeacherIcon}
              title="Enseignants"
              text="Gérer les enseignants."
              route="/enseignants"
            ></MobileCard>
            <MobileCard
              image={SubjectIcon}
              title="Formations"
              text="Gérer les formations."
              clickfunc={() => setShowFormation(true)}
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
              text="Inscrire un étudiant."
              clickfunc={() => setShowInscription(true)}
            ></DesktopCard>
            <DesktopCard
              image={StudentsIcon}
              title="Étudiants"
              text="Gérer les étudiants."
              route="/etudiants"
            ></DesktopCard>
            <DesktopCard
              image={TeacherIcon}
              title="Enseignants"
              text="Gérer les enseignants."
              route="/enseignants"
            ></DesktopCard>
            <DesktopCard
              image={SubjectIcon}
              title="Formations"
              text="Gérer les formations."
              clickfunc={() => setShowFormation(true)}
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
      </div>
    </>
  );
}

export default Dashboard;
