import Modal from "react-bootstrap/Modal";
import styles from "./ErrorModal.module.css";
import "@fontsource/quicksand/600";
import { useEffect, useState } from "react";

function ErrorModal({
  code = 500,
  message = "Une erreur est survenue. Veuillez réessayer plus tard.",
  show = false,
  onClose,
}) {
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    let timeoutId;

    if (show && !isHovering) {
      timeoutId = setTimeout(() => {
        onClose();
      }, 2000); // 2 seconds for error modal
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
        style={{ textAlign: "center", paddingTop: 0 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <h4>Erreur</h4>
        <p style={{ paddingBottom: "0.3%" }}>
          {message} <br /> (Code: {code})
        </p>
      </Modal.Body>
    </Modal>
  );
}

export default ErrorModal;
