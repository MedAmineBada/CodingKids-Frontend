import Modal from "react-bootstrap/Modal";
import styles from "./ConfirmModal.module.css";
import "@fontsource/quicksand/600";
import { Button } from "react-bootstrap";

function ConfirmModal({
  title,
  message,
  show = false,
  onClose,
  btn_yes,
  btn_no,
  func,
}) {
  function handleClick() {
    func();
    onClose();
  }
  return (
    <Modal
      className={styles.container}
      show={show}
      size="lg"
      centered
      onHide={onClose}
      style={{ zIndex: 99999 }}
    >
      <Modal.Header
        style={{
          border: "none",
          paddingTop: 30,
          paddingBottom: 0,
        }}
      ></Modal.Header>
      <Modal.Body
        style={{
          textAlign: "center",
          padding: 0,
          paddingTop: 20,
          paddingBottom: 0,
        }}
      >
        <h4>{title}</h4>
        <p style={{ paddingBottom: "0px" }}>{message}</p>
      </Modal.Body>
      <Modal.Footer className={styles.footer} style={{ border: "none" }}>
        <div className={styles.btns}>
          <Button variant="secondary" onClick={onClose}>
            {btn_no}
          </Button>
          <Button onClick={handleClick}>{btn_yes}</Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmModal;
