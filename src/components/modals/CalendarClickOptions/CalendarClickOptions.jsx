import Modal from "react-bootstrap/Modal";

function CalendarClickOptions(show, close, id, date, active) {
  return (
    <Modal show={show} centered={true} size="m">
      <Modal.Body>
        <h1>{date}</h1>
        <button onClick={close}>close</button>
      </Modal.Body>
    </Modal>
  );
}
export default CalendarClickOptions;
