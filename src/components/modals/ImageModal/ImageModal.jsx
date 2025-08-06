import styles from "./ImageModal.module.css";
import Modal from "react-bootstrap/Modal";
import { useRef } from "react";

function ImageModal({ show, onClose, url, cursor, func }) {
  const fileInputRef = useRef(null);
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    func(file);
  };
  return (
    <Modal
      className={styles.modal}
      show={show}
      size="m"
      centered
      onHide={onClose}
    >
      <Modal.Body className={styles.body}>
        <div
          className={styles.image}
          style={{ cursor: cursor }}
          onClick={handleClick}
        >
          <img src={url === null ? "/NoImage.svg" : url.replace('"', "")} />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{
            visibility: "hidden",
            position: "absolute",
            width: 0,
            height: 0,
          }}
          onChange={handleFileChange}
        />
      </Modal.Body>
    </Modal>
  );
}

export default ImageModal;
