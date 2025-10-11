import styles from "./LoginButton.module.css";
import { Container } from "react-bootstrap";

const LoginButton = ({ type = "submit", onClick }) => {
  return (
    <Container className={styles.buttonComponent}>
      <button className={styles.connectButton} type={type} onClick={onClick}>
        Connexion
      </button>
    </Container>
  );
};

export default LoginButton;
