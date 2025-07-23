import { CircularLoading } from "respinner";
import styles from "./ModalLoading.module.css";
import MediaQuery from "react-responsive";

function ModalLoading() {
  return (
    <div className={styles.container}>
      <MediaQuery maxWidth="699.5px">
        <CircularLoading
          size="12vw"
          stroke="#fd9f09"
          strokeWidth={7}
        ></CircularLoading>
        <h1>
          Scan en cours,
          <br /> veuillez patienter.
        </h1>
      </MediaQuery>
      <MediaQuery minWidth="700px" maxWidth="999.5px">
        <CircularLoading
          size="6vw"
          stroke="#fd9f09"
          strokeWidth={7}
        ></CircularLoading>
        <h1>Scan en cours, veuillez patienter.</h1>
      </MediaQuery>
      <MediaQuery minWidth="1000px">
        <CircularLoading
          size="5vw"
          stroke="#fd9f09"
          strokeWidth={7}
        ></CircularLoading>
        <h1>Scan en cours, veuillez patienter.</h1>
      </MediaQuery>
    </div>
  );
}

export default ModalLoading;
