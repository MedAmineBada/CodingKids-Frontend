import { useEffect, useRef, useState } from "react";
import styles from "./DesktopCard.module.css";
import ErrorModal from "@/components/modals/ErrorModal.jsx";
import { scanStudent } from "@/services/QRServices.js";

function DesktopCard({
  image,
  text,
  title,
  type,
  route,
  handleShow,
  handleClose,
}) {
  const [hovered, setHovered] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  const [responseCode, setResponseCode] = useState(200);
  const [message, setMessage] = useState(
    "Une erreur est survenue. Veuillez réessayer plus tard.",
  );
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    clearTimeout(timerRef.current);

    if (hovered) {
      timerRef.current = setTimeout(() => setFadeIn(true), 340);
    } else {
      setFadeIn(false);
    }

    return () => clearTimeout(timerRef.current);
  }, [hovered]);

  const handleClick = () => {
    if (route === "/scan") {
      fileInputRef.current?.click();
    } else if (route) {
      window.location.href = route;
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleShow();

    try {
      let resp;
      resp = await scanStudent(file);
      setResponseCode(resp.status);
      setMessage(resp.msg);
      setShowError(resp.showError);

      if (resp.status !== 200) {
        handleClose();
      }
    } catch {
      setResponseCode(500);
      setShowError(true);
      handleClose();
    }
  };

  const cardClass =
    type === "disconnect"
      ? `${styles.card} ${styles.disconnectCard}`
      : styles.card;

  return (
    <>
      {route === "/scan" && showError === true ? (
        <ErrorModal
          show={showError}
          message={message}
          code={responseCode}
          onClose={() => setShowError(false)}
        />
      ) : null}

      <div
        className={cardClass}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleClick}
      >
        <div className={styles.image}>
          <img src={image} alt="" />
        </div>
        <div className={styles.content}>
          <p
            style={{
              opacity: fadeIn ? 1 : 0,
              transition: "opacity 200ms ease",
            }}
          >
            {text}
          </p>
          <h1>{title}</h1>
        </div>
      </div>

      {route === "/scan" && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          style={{
            visibility: "hidden",
            position: "absolute",
            width: 0,
            height: 0,
          }}
        />
      )}
    </>
  );
}

export default DesktopCard;
