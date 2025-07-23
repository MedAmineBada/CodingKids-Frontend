import { useEffect, useRef, useState } from "react";
import styles from "./HorizontalCard.module.css";

function HorizontalCard({ image, text, title, type, route }) {
  const [hovered, setHovered] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

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

    try {
      const formData = new FormData();
      formData.append("qr", file);

      const uploadUrl = import.meta.env.VITE_API_URL + "/scan";

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }
      const data = await response.json();
      localStorage.setItem("scanResult", data);
      location.href = route;
    } catch (err) {
      if (err.status === 404) {
        alert("Erreur: Etudiant n'existe pas");
      } else {
        alert("Internal Server Error");
      }
    }
  };

  const cardClass =
    type === "disconnect"
      ? `${styles.card} ${styles.disconnectCard}`
      : styles.card;

  return (
    <>
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

export default HorizontalCard;
