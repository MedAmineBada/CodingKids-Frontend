import styles from "./HorizontalCard.module.css";

function HorizontalCard(props) {
  const cardClass =
    props.type === "disconnect"
      ? `${styles.card} ${styles.disconnectCard}`
      : styles.card;

  return (
    <div className={cardClass}>
      <div className={styles.image}>
        <img src={props.image} alt="" />
      </div>
      <div className={styles.content}>
        <h1>{props.title}</h1>
        <p>{props.text}</p>
      </div>
    </div>
  );
}

export default HorizontalCard;
