import styles from "./AddImage.module.css";
import { AddImg } from "@/components/modals/Inscription/addBtn.jsx";

function AddImage({ src, onClick }) {
  return (
    <div className={styles.wrapper} onClick={onClick}>
      {src ? (
        <img src={src} alt="" />
      ) : (
        <>
          <AddImg className={styles.addimg} color="#a4a4a4" />
        </>
      )}
    </div>
  );
}
export default AddImage;
