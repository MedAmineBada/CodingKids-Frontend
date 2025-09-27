import { useRef, useState } from "react";
import styles from "./MobileCard.module.css";
import ErrorModal from "@/components/modals/GenericModals/ErrorModal.jsx";
import { scanStudent } from "@/services/QRServices.js";

function MobileCard({
  image,
  text,
  title,
  type,
  route,
  handleShow,
  handleClose,
  clickfunc,
}) {
  const [responseCode, setResponseCode] = useState(200);
  const [message, setMessage] = useState(
    "Une erreur est survenue. Veuillez réessayer plus tard.",
  );
  const [showError, setShowError] = useState(false);

  const fileInputRef = useRef(null);

  const cardClass =
    type === "disconnect"
      ? `${styles.card} ${styles.disconnectCard}`
      : styles.card;

  const handleClick = () => {
    if (route === "/scan") {
      fileInputRef.current?.click();
    } else if (clickfunc) {
      clickfunc();
    } else if (route) {
      window.location.href = route;
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleShow();

    try {
      let resp;
      resp = await scanStudent(file);
      setResponseCode(resp.status);
      setMessage(resp.msg);
      setShowError(resp.showError);

      if (resp.status !== 200) {
        handleClose();
      }
    } catch (e) {
      console.log(e);
      setResponseCode(500);
      setShowError(true);
      handleClose();
    }
  };

  return (
    <>
      {route === "/scan" && showError === true ? (
        <ErrorModal
          show={showError}
          message={message}
          code={responseCode}
          onClose={() => setShowError(false)}
        />
      ) : null}
      <div className={cardClass} onClick={handleClick}>
        <div className={styles.image}>
          <img src={image} alt="" />
        </div>
        <div className={styles.content}>
          <h1>{title}</h1>
          <p>{text}</p>
        </div>
      </div>

      {route === "/scan" && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{
            visibility: "hidden",
            position: "absolute",
            width: 0,
            height: 0,
          }}
        />
      )}
    </>
  );
}

export default MobileCard;
