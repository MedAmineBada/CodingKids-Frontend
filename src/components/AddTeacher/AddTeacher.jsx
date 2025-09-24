import Modal from "react-bootstrap/Modal";
import { useRef } from "react";
import { addTeacher } from "@/services/TeacherServices.js";

function AddTeacher({ show, onHide, onSuccess }) {
  const CINRef = useRef(null);
  const NameRef = useRef("");
  const TelRef = useRef(null);
  const EmailRef = useRef("");
  async function handleAdd() {
    const payload = {
      cin: CINRef.current.value,
      name: NameRef.current.value,
      tel: TelRef.current.value,
      email: EmailRef.current.value,
    };
    const { status, id } = await addTeacher(payload);
    onSuccess();
  }
  return (
    <>
      <Modal show={show} onHide={onHide} centered size="m">
        <Modal.Header closeButton>
          <h1>Ajouter enseignant</h1>
        </Modal.Header>
        <Modal.Body>
          <table>
            <tbody>
              <tr>
                <td>CIN</td>
                <td>
                  <input type="number" ref={CINRef} />
                </td>
              </tr>
              <tr>
                <td>Name</td>
                <td>
                  <input type="text" ref={NameRef} />
                </td>
              </tr>
              <tr>
                <td>Tel.</td>
                <td>
                  <input type="number" ref={TelRef} />
                </td>
              </tr>
              <tr>
                <td>Email</td>
                <td>
                  <input type="email" ref={EmailRef} />
                </td>
              </tr>
            </tbody>
          </table>
        </Modal.Body>
        <Modal.Footer>
          <button onClick={onHide}>Annuler</button>
          <button onClick={handleAdd}>Ajouter</button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AddTeacher;
