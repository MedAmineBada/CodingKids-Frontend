import Modal from "react-bootstrap/Modal";
import styles from "./CropImg.module.css";
import Cropper from "react-easy-crop";
import { useCallback, useState } from "react";
import MediaQuery from "react-responsive";

function CropImg({ show, close, cropComplete, url }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropCompleteInternal = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  return (
    <Modal
      centered={true}
      show={show}
      onHide={close}
      size="m"
      className={styles.modal}
    >
      <Modal.Body className={styles.body}>
        <Cropper
          objectFit="cover"
          zoomWithScroll={true}
          image={url}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onCropComplete={onCropCompleteInternal}
          onZoomChange={setZoom}
          classes={{
            cropAreaClassName: styles.cropArea,
            containerClassName: styles.cropContainter,
            mediaClassName: styles.cropMedia,
          }}
        />
      </Modal.Body>
      <Modal.Footer className={styles.footer}>
        <MediaQuery minWidth={1000}>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="zoom-range"
          />
        </MediaQuery>
        <button
          onClick={() => {
            if (croppedAreaPixels) cropComplete(croppedAreaPixels);
          }}
        >
          Enregistrer
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default CropImg;
