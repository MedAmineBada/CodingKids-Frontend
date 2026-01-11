import Modal from "react-bootstrap/Modal";
import styles from "./SuccessModal.module.css";
import "@fontsource/quicksand/600";
import { useEffect, useState } from "react";

function SuccessModal({ title, message, show = false, onClose }) {
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    let timeoutId;

    if (show && !isHovering) {
      timeoutId = setTimeout(() => {
        onClose();
      }, 2000); // 1 second for success modal
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [show, isHovering, onClose]);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

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
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      ></Modal.Header>
      <Modal.Body
        style={{ textAlign: "center", paddingTop: 0, paddingBottom: 0 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <h4>{title}</h4>
        <p style={{ paddingBottom: "8px" }}>{message}</p>
      </Modal.Body>
    </Modal>
  );
}

export default SuccessModal;
