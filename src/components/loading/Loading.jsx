import { Container } from "react-bootstrap";
import styles from "./Loading.module.css";
import "@fontsource/quicksand/500.css";
import { CircularLoading } from "respinner";
import MediaQuery from "react-responsive";

function Loading() {
  return (
    <Container fluid className={styles.loadingContainer}>
      <MediaQuery maxWidth={599.5}>
        <CircularLoading
          size={100}
          stroke="#fff"
          className={styles.loader}
          strokeWidth={7}
        ></CircularLoading>
      </MediaQuery>
      <MediaQuery minWidth={600}>
        <CircularLoading
          size={80}
          stroke="#fff"
          className={styles.loader}
          strokeWidth={6}
        ></CircularLoading>
      </MediaQuery>

      <h1>Chargement, veuillez patienter...</h1>
    </Container>
  );
}

export default Loading;
