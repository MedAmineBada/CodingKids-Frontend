import Modal from "react-bootstrap/Modal";
import styles from "./ErrorModal.module.css";
import "@fontsource/quicksand/600";

function ErrorModal({
  code = 500,
  message = "Une erreur est survenue. Veuillez réessayer plus tard.",
  show = false,
  onClose,
}) {
  return (
    <Modal
      className={styles.container}
      show={show}
      size="m"
      centered
      onHide={onClose}
    >
      <Modal.Header
        closeButton
        style={{ border: "none", paddingBottom: 0 }}
      ></Modal.Header>
      <Modal.Body style={{ textAlign: "center", paddingTop: 0 }}>
        <h4>Erreur</h4>
        <p style={{ paddingBottom: "0.3%" }}>
          {message} <br /> (Code: {code})
        </p>
      </Modal.Body>
    </Modal>
  );
}

export default ErrorModal;
