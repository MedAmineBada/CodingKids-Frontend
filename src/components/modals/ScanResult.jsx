import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useEffect, useState } from "react";

function ScanResultModal({ show, handleClose }) {
  const handleClearAndClose = () => {
    setScanResult(null);
    handleClose();
  };

  const [scanResult, setScanResult] = useState(() => {
    return localStorage.getItem("scanResult");
  });
  useEffect(() => {
    if (scanResult) return;

    const intervalId = setInterval(() => {
      const stored = localStorage.getItem("scanResult");
      if (stored) {
        setScanResult(stored);
        clearInterval(intervalId);
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, [scanResult]);

  return (
    <Modal
      show={show}
      onHide={handleClearAndClose}
      backdrop="static"
      keyboard={false}
      centered
      fullscreen={true}
    >
      <Modal.Header closeButton style={{ border: "none" }}></Modal.Header>
      <Modal.Body>
        {/*{scanResult ? <h1>{scanResult}</h1> : <ModalLoading></ModalLoading>}*/}
      </Modal.Body>
      <Modal.Footer closeButton style={{ border: "none" }}>
        <Button variant="secondary" onClick={handleClearAndClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleClearAndClose}>
          Enregistrer
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ScanResultModal;
