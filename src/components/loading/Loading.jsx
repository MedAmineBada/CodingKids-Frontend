import { Container } from "react-bootstrap";
import styles from "./Loading.module.css";
import "@fontsource/quicksand/500.css";
import { CircularLoading } from "respinner";

function Loading() {
  return (
    <Container fluid className={styles.loadingContainer}>
      <CircularLoading
        size={80}
        stroke="#fff"
        className={styles.loader}
        strokeWidth={6}
      ></CircularLoading>
      <h1>Chargement, veuillez patienter...</h1>
    </Container>
  );
}

export default Loading;
