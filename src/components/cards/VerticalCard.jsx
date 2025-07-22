import styles from "./VerticalCard.module.css";

function VerticalCard({ image, text, title, type, route }) {
  const cardClass =
    type === "disconnect"
      ? `${styles.card} ${styles.disconnectCard}`
      : styles.card;
  function handleClick() {
    if (route) {
      window.location.href = route;
    }
  }
  return (
    <div className={cardClass} onClick={handleClick}>
      <div className={styles.image}>
        <img src={image} alt="" />
      </div>
      <div className={styles.content}>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
    </div>
  );
}

export default VerticalCard;
