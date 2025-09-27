// ImageModal.jsx
import styles from "./ImageModal.module.css";
import Modal from "react-bootstrap/Modal";
import { useRef, useState } from "react";
import CropImg from "@/components/modals/CropModal/CropImg.jsx";
import { getCroppedImg } from "@/services/utils.js";
import { deleteImage, uploadImage } from "@/services/ImageServices.js";
import ConfirmModal from "@/components/modals/GenericModals/ConfirmModal.jsx";

function ImageModal({ id, show, onClose, url, cursor, func, delfunc }) {
  const fileInputRef = useRef(null);
  const [imgUrl, setImgUrl] = useState(url);
  const [showCrop, setShowCrop] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
  function handleDelClick() {
    setShowConfirm(true);
  }
  async function handleDelete() {
    const res = await deleteImage(id);
    if (res === 200) {
      delfunc();
    }
  }

  return (
    <>
      <ConfirmModal
        show={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer l’image ?"
        btn_yes="Supprimer"
        btn_no="Annuler"
        func={handleDelete}
      ></ConfirmModal>
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
            <div onClick={handleDelClick}>Effacer</div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
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
