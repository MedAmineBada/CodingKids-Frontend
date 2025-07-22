import { useRef } from "react";
import styles from "./VerticalCard.module.css";

function VerticalCard({ image, text, title, type, route }) {
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

export default VerticalCard;
