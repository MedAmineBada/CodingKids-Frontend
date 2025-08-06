import Modal from "react-bootstrap/Modal";
import { useEffect, useState } from "react";
import ModalLoading from "@/components/loading/ModalLoading.jsx";
import StudentProfile from "@/components/studentProfile/StudentProfile.jsx";
import { clearStudentLocalStorage } from "@/services/utils.js";

function ScanResultModal({ show, handleClose }) {
  const handleClearAndClose = () => {
    setScanResult(null);
    clearStudentLocalStorage();
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
      <Modal.Header
        closeButton
        style={{
          border: "none",
          background: "transparent",
          fontSize: "20px",
          paddingBottom: 0,
          paddingLeft: 0,
        }}
      ></Modal.Header>
      <Modal.Body
        style={{
          padding: 0,
          paddingTop: "10px",
        }}
      >
        {scanResult ? (
          <StudentProfile
            data={JSON.parse(localStorage.getItem("scanResult"))}
            handleClose={handleClearAndClose}
          ></StudentProfile>
        ) : (
          <ModalLoading></ModalLoading>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default ScanResultModal;
