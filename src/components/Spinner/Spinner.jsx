import Modal from "react-bootstrap/Modal";
import styles from "./Spinner.module.css";
import { Spinner } from "react-bootstrap";

function LoadSpinner({ show }) {
  return (
    <>
      <Modal show={show} centered={true} className={styles.modal}>
        <Modal.Body className={styles.body}>
          <Spinner animation="border" />
        </Modal.Body>
      </Modal>
    </>
  );
}
export default LoadSpinner;
