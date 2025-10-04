import Modal from "react-bootstrap/Modal";
import styles from "./PDFReader.module.css";

function PDFReader({ show, onClose, url }) {
  return (
    <>
      <Modal
        show={show}
        onHide={onClose}
        centered={true}
        size={"xl"}
        scrollable={false}
        className={styles.modal}
      >
        <Modal.Header closeButton className={styles.header}></Modal.Header>
        <Modal.Body className={styles.body}>
          <iframe src={url} frameBorder={0} width="100%" height="100%" />
        </Modal.Body>
      </Modal>
    </>
  );
}
export default PDFReader;
