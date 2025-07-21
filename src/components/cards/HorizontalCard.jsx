import { useEffect, useRef, useState } from "react";
import styles from "./HorizontalCard.module.css";

function HorizontalCard({ image, text, title, type }) {
  const [hovered, setHovered] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    clearTimeout(timerRef.current);

    if (hovered) {
      timerRef.current = setTimeout(() => setFadeIn(true), 340);
    } else {
      setFadeIn(false);
    }

    return () => clearTimeout(timerRef.current);
  }, [hovered]);

  const cardClass =
    type === "disconnect"
      ? `${styles.card} ${styles.disconnectCard}`
      : styles.card;

  return (
    <div
      className={cardClass}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
  );
}

export default HorizontalCard;
