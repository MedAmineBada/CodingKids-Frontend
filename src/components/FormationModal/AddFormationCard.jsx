import styles from "./AddFormation.module.css";
import "@fontsource/quicksand/400.css";
import "@fontsource/quicksand/600.css";
import AddModal from "@/components/FormationModal/AddModal.jsx";
import { useState } from "react";

function AddFormationCard({ onAdded }) {
  const [show, setshow] = useState(false);

  return (
    <>
      <AddModal
        show={show}
        onClose={() => setshow(false)}
        onSave={() => {
          setshow(false);
          onAdded?.();
        }}
      />
      <button
        type="button"
        className={styles.plusCard}
        onClick={() => setshow(true)}
      >
        <h1>+</h1>
      </button>
    </>
  );
}

export default AddFormationCard;
