import styles from "./AddFormation.module.css";
import "@fontsource/quicksand/300.css";
import "@fontsource/quicksand/400.css";

/**
 * Props:
 * - onClick: function
 * - variant: 'solid' | 'dashed'
 * - compact: boolean
 * - label: string (par défaut en français)
 */
function AddFormationCard({
  onClick = () => {},
  variant = "solid",
  compact = false,
  label = "Ajouter une formation",
}) {
  const classNames = [
    styles.card,
    variant === "dashed" ? styles.dashed : "",
    compact ? styles.compact : "",
  ].join(" ");

  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames}
      aria-label={label}
    >
      <span className={styles.icon} aria-hidden="true">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <div className={styles.content}>
        <span className={styles.label}>{label}</span>
        <span className={styles.hint}>Créer une nouvelle formation</span>
      </div>

      <span className={styles.chev} aria-hidden="true">
        ›
      </span>
    </button>
  );
}

export default AddFormationCard;
