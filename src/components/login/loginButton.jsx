import styles from "./loginButton.module.css";

const LoginButton = ({ type = "submit" }) => {
  return (
    <button className={styles.connectButton} type={type}>
      Connexion
    </button>
  );
};

export default LoginButton;
