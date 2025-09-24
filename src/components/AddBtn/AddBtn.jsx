import styles from "./addBtn.module.css";

function AddBtn({ func }) {
  return (
    <div className={styles.container} onClick={() => (location.href = route)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1.6em"
        height="1.6em"
        viewBox="0 0 20 20"
      >
        <path fill="currentColor" d="M11 9V4H9v5H4v2h5v5h2v-5h5V9z" />
      </svg>
    </div>
  );
}

export default AddBtn;
