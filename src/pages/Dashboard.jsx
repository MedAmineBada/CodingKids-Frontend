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

function Dashboard() {
  return (
    <>
      <div className={styles.title}>
        <h1>Dashboard</h1>
      </div>
      <div className={styles.content}>
        <MediaQuery maxWidth={1199.5}>
          <VerticalCard
            image={QrIcon}
            title="Scanner"
            text="Scanner le Code QR d'un étudiant."
          ></VerticalCard>
          <VerticalCard
            image={RegisterIcon}
            title="Inscription"
            text="Inscrire un étudiant dans le système."
          ></VerticalCard>
          <VerticalCard
            image={StudentsIcon}
            title="Étudiants"
            text="Gérer les étudiants dans le système."
          ></VerticalCard>
          <VerticalCard
            image={TeacherIcon}
            title="Enseignants"
            text="Gérer les étudiants dans le système."
          ></VerticalCard>
          <VerticalCard
            image={DisconnectIcon}
            title="Déconnecter"
            text="Se déconnecter du système."
            type="disconnect"
          ></VerticalCard>
        </MediaQuery>
        <MediaQuery minWidth={1200}>
          <HorizontalCard
            image={QrIcon}
            title="Scanner"
            text="Scanner le Code QR d'un étudiant."
          ></HorizontalCard>
          <HorizontalCard
            image={RegisterIcon}
            title="Inscription"
            text="Inscrire un étudiant dans le système."
          ></HorizontalCard>
          <HorizontalCard
            image={StudentsIcon}
            title="Étudiants"
            text="Gérer les étudiants dans le système."
          ></HorizontalCard>
          <HorizontalCard
            image={TeacherIcon}
            title="Enseignants"
            text="Gérer les étudiants dans le système."
          ></HorizontalCard>
          <HorizontalCard
            image={DisconnectIcon}
            title="Déconnecter"
            text="Se déconnecter du système."
            type="disconnect"
          ></HorizontalCard>
        </MediaQuery>
      </div>
    </>
  );
}

export default Dashboard;
