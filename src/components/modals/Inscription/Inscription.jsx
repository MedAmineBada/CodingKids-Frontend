import Modal from "react-bootstrap/Modal";
import styles from "./Inscription.module.css";
import { useEffect, useRef, useState } from "react";
import AddImage from "@/components/modals/Inscription/AddImage.jsx";
import { addStudent } from "@/services/StudentServices.js";
import CropImg from "@/components/modals/CropModal/CropImg.jsx";
import { getCroppedImg, urlToFile } from "@/services/utils.js";
import { uploadImage } from "@/services/ImageServices.js";

function useScreenWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}

function Inscription({ show, close }) {
  const [imgSrc, setImgSrc] = useState(null);
  const [showCrop, setShowCrop] = useState(false);

  const nameRef = useRef();
  const emailRef = useRef();
  const dobRef = useRef();
  const tel1Ref = useRef();
  const tel2Ref = useRef();

  const width = useScreenWidth();
  const modalSize = width >= 1000 ? "lg" : "m";
  const fileInputRef = useRef(null);

  async function handleSubmit() {
    try {
      const student = {
        name: nameRef.current.value,
        email: emailRef.current.value,
        birth_date: dobRef.current.value,
        tel1: tel1Ref.current.value,
        tel2: tel2Ref.current.value,
      };

      const res = await addStudent(student);

      if (res.status === 201) {
        if (imgSrc) {
          const file = await urlToFile(imgSrc, res.id + "-tempimage.webp");
          const imgres = await uploadImage(res.id, file);

          if (imgres === 422) {
            // errthings
          } else if (imgres === 500) {
            // errthings
          }
        }
      } else if (res.status === 422) {
        // smth
      } else {
        // smth
      }
    } catch {
      // ---
    }
  }

  async function handleImageClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgSrc(URL.createObjectURL(file));
    setShowCrop(true);
  }

  async function handleCropComplete(croppedAreaPixels) {
    try {
      const blob = await getCroppedImg(imgSrc, croppedAreaPixels);
      const file = new File([blob], "cropped.webp", { type: blob.type });
      setImgSrc(URL.createObjectURL(file));
    } catch {
      console.error("Error during crop or upload");
    } finally {
      setShowCrop(false);
    }
  }

  return (
    <>
      <CropImg
        show={showCrop}
        close={() => setShowCrop(false)}
        cropComplete={handleCropComplete}
        url={imgSrc}
      ></CropImg>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{
          visibility: "hidden",
          position: "absolute",
          width: 0,
          height: 0,
        }}
        onChange={handleFileChange}
      />
      <Modal show={show} onHide={close} centered={true} size={modalSize}>
        <Modal.Header closeButton className={styles.header}>
          <h1>Inscrire un étudiant</h1>
        </Modal.Header>
        <Modal.Body>
          <div className={styles.wrapper}>
            <div className={styles.imagewrap}>
              <AddImage src={imgSrc} onClick={handleImageClick}></AddImage>
              <h1>Image</h1>
            </div>
            <table>
              <tbody>
                <tr>
                  <td>
                    Nom & Prenom <span>*</span>
                  </td>
                  <td className={styles.col2}>
                    <input
                      ref={nameRef}
                      type="text"
                      placeholder="Nom complet de l’étudiant"
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    Date de Naissance <span>*</span>
                  </td>
                  <td className={styles.col2}>
                    <input type="date" ref={dobRef} />
                  </td>
                </tr>
                <tr>
                  <td>
                    Tel. 1 <span>*</span>
                  </td>
                  <td className={styles.col2}>
                    <input
                      type="number"
                      placeholder="Numéro de téléphone 1"
                      ref={tel1Ref}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    Tel. 2 <span>*</span>
                  </td>
                  <td className={styles.col2}>
                    <input
                      type="number"
                      placeholder="Numéro de téléphone 2"
                      ref={tel2Ref}
                    />
                  </td>
                </tr>
                <tr>
                  <td>E-Mail</td>
                  <td className={styles.col2}>
                    <input
                      type="email"
                      placeholder="Adresse e-mail"
                      ref={emailRef}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <div className={styles.btn}>
              <button onClick={handleSubmit}>Ajouter</button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Inscription;
