import styles from "./LoginButton.module.css";
import { Container } from "react-bootstrap";

const LoginButton = ({ type = "submit" }) => {
  return (
    <Container className={styles.buttonComponent}>
      <button className={styles.connectButton} type={type}>
        Connexion
      </button>
    </Container>
  );
};

export default LoginButton;
