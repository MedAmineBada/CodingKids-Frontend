import Modal from "react-bootstrap/Modal";
import styles from "./QRModal.module.css";
import { saveQRToPDF } from "@/services/utils.js";

function QRModal({ show, onClose, src, title }) {
  function handlePrint() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert(
        "Fenêtre contextuelle bloquée. Veuillez autoriser les fenêtres contextuelles pour ce site afin d'imprimer..",
      );
      return;
    }

    const html = `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>Print</title>
          <style>
            html,body { height: 100%; margin: 0; }
            body { display:flex; align-items:center; justify-content:center; }
            img { max-width: 100%; max-height: 100vh; display:block; }
            @page { margin: 0.5in; } 
          </style>
        </head>
        <body>
          <img id="toPrint" src="${src}" alt="QR" />
          <script>
            (function () {
              var img = document.getElementById('toPrint');
              img.onload = function () {
                setTimeout(function () {
                  window.focus();
                  window.print();
                  setTimeout(() => window.close(), 500);
                }, 100);
              };
              img.onerror = function () {
                alert('Failed to load image for printing.');
              };
            })();
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }
  return (
    <>
      <Modal show={show} onHide={onClose} centered={true} size="m">
        <Modal.Header closeButton className={styles.header}>
          <h1>{title}</h1>
        </Modal.Header>
        <Modal.Body className={styles.body}>
          <img src={src} />
        </Modal.Body>
        <Modal.Footer className={styles.footer}>
          <button onClick={handlePrint}>Imprimer</button>
          <button onClick={() => saveQRToPDF(src)}>Sauvegarder</button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default QRModal;
