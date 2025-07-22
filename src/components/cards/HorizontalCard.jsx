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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      localStorage.setItem("scannedImage", reader.result);
      window.location.href = "/scan";
    };
    reader.readAsDataURL(file);
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
