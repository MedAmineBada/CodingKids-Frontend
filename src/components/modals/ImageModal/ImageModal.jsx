import styles from "./ImageModal.module.css";
import Modal from "react-bootstrap/Modal";

function ImageModal({ show, onClose, url, cursor }) {
  return (
    <Modal
      className={styles.modal}
      show={show}
      size="lg"
      centered
      onHide={onClose}
    >
      <Modal.Body className={styles.body}>
        <div className={styles.image} style={{ cursor: cursor }}>
          <img src={url === null ? "/NoImage.svg" : url.replace('"', "")} />
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default ImageModal;
