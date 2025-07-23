import { useRef } from "react";
import styles from "./VerticalCard.module.css";

function VerticalCard({ image, text, title, type, route, handleShow }) {
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

      const data = await response.json();
      localStorage.setItem("scanResult", JSON.stringify(data));
    } catch (err) {
      if (err.status === 404) {
        alert("Erreur: Etudiant n'existe pas");
      } else {
        alert("Internal Server Error");
      }
    }
  };

  return (
    <>
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
          capture="environment"
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
