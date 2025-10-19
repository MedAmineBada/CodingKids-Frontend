import Modal from "react-bootstrap/Modal";
import styles from "./SuccessModal.module.css";
import "@fontsource/quicksand/600";

function SuccessModal({ title, message, show = false, onClose }) {
  return (
    <Modal
      className={styles.container}
      show={show}
      size="m"
      centered
      onHide={onClose}
      style={{ zIndex: 999999 }}
    >
      <Modal.Header
        closeButton
        style={{ border: "none", paddingBottom: 0 }}
      ></Modal.Header>
      <Modal.Body
        style={{ textAlign: "center", paddingTop: 0, paddingBottom: 0 }}
      >
        <h4>{title}</h4>
        <p style={{ paddingBottom: "8px" }}>{message}</p>
      </Modal.Body>
    </Modal>
  );
}

export default SuccessModal;
