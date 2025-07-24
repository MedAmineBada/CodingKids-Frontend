import Modal from "react-bootstrap/Modal";
import { useEffect, useState } from "react";
import ModalLoading from "@/components/loading/ModalLoading.jsx";
import StudentProfile from "@/components/studentProfile/StudentProfile.jsx";

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
        {scanResult ? (
          <StudentProfile
            data={JSON.parse(localStorage.getItem("scanResult"))}
          ></StudentProfile>
        ) : (
          <ModalLoading></ModalLoading>
        )}
      </Modal.Body>
      {/*<Modal.Footer closeButton style={{ border: "none" }}>*/}
      {/*  <Button variant="secondary" onClick={handleClearAndClose}>*/}
      {/*    Close*/}
      {/*  </Button>*/}
      {/*</Modal.Footer>*/}
    </Modal>
  );
}

export default ScanResultModal;
