import { useRef, useState } from "react";
import styles from "./VerticalCard.module.css";
import ErrorModal from "@/components/modals/ErrorModal.jsx";

function VerticalCard({
  image,
  text,
  title,
  type,
  route,
  handleShow,
  handleClose,
}) {
  const [responseCode, setResponseCode] = useState(200);
  const [message, setMessage] = useState(
    "Une erreur est survenue. Veuillez réessayer plus tard.",
  );
  const [showError, setShowError] = useState(false);

  const fileInputRef = useRef(null);

  const cardClass =
    type === "disconnect"
      ? `${styles.card} ${styles.disconnectCard}`
      : styles.card;

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
      const formData = new FormData();
      formData.append("qr", file);
      const uploadUrl = import.meta.env.VITE_API_URL + "/scan";
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (response.status === 200) {
        const data = await response.json();
        localStorage.setItem("scanResult", JSON.stringify(data));
      } else {
        const status = response.status;
        let msg = "Une erreur est survenue. Veuillez réessayer plus tard.";

        if (status === 400) {
          msg =
            "Le fichier téléchargé n’est pas une image prise en charge. Veuillez envoyer un fichier image (JPEG, PNG, …).";
        } else if (status === 404) {
          msg =
            "Aucun étudiant n’est associé à ce code QR. Vérifiez que vous scannez le bon code.";
        } else if (status === 500) {
          msg =
            "Le code QR est manquant ou illisible. Assurez-vous que l’image est nette et que le QR code est entièrement visible.";
        }

        setResponseCode(status);
        setMessage(msg);
        setShowError(true);
        handleClose();
      }
    } catch {
      setResponseCode(500);
      setShowError(true);
      handleClose();
    }
  };

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
      <div className={cardClass} onClick={handleClick}>
        <div className={styles.image}>
          <img src={image} alt="" />
        </div>
        <div className={styles.content}>
          <h1>{title}</h1>
          <p>{text}</p>
        </div>
      </div>

      {route === "/scan" && (
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
      )}
    </>
  );
}

export default VerticalCard;
