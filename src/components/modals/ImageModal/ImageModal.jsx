// ImageModal.jsx
import styles from "./ImageModal.module.css";
import Modal from "react-bootstrap/Modal";
import { useRef, useState } from "react";
import CropImg from "@/components/modals/CropModal/CropImg.jsx";
import { getCroppedImg } from "@/services/utils.js";
import { uploadImage } from "@/services/ImageServices.js";

function ImageModal({ id, show, onClose, url, cursor, func }) {
  const fileInputRef = useRef(null);
  const [imgUrl, setImgUrl] = useState(url);
  const [showCrop, setShowCrop] = useState(false);

  function handleModClick() {
    fileInputRef.current?.click();
  }

  async function handleCropComplete(croppedAreaPixels) {
    try {
      const blob = await getCroppedImg(imgUrl, croppedAreaPixels);
      const file = new File([blob], "cropped.webp", { type: blob.type });
      await uploadImage(id, file);
      func(new Blob([blob]));
    } catch {
      console.error("Error during crop or upload");
    } finally {
      setShowCrop(false);
    }
  }

  async function handleFileChange(e) {
    onClose();
    const file = e.target.files?.[0];
    if (!file) return;
    setImgUrl(URL.createObjectURL(file));
    setShowCrop(true);
  }

  return (
    <>
      <CropImg
        show={showCrop}
        close={() => setShowCrop(false)}
        url={imgUrl}
        cropComplete={handleCropComplete}
      />
      <Modal
        className={styles.modal}
        show={show}
        size="m"
        centered
        onHide={onClose}
      >
        <Modal.Body className={styles.body}>
          <div className={styles.image} style={{ cursor: cursor }}>
            <img src={url === null ? "/NoImage.svg" : url.replace('"', "")} />
          </div>
          <div className={styles.manageBtns}>
            <div onClick={handleModClick}>Modifier</div>
            <div>Effacer</div>
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
    </>
  );
}

export default ImageModal;
