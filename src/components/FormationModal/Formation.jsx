import styles from "./formation.module.css";
import Modal from "react-bootstrap/Modal";
import AddFormationCard from "@/components/FormationModal/AddFormationCard.jsx";

function Formation({ show, onclose }) {
  return (
    <>
      <Modal show={show} onHide={onclose} size="lg" centered scrollable>
        <Modal.Header closeButton className={styles.header}>
          <h1>Formations</h1>
        </Modal.Header>
        <Modal.Body>
          <AddFormationCard></AddFormationCard>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Formation;
