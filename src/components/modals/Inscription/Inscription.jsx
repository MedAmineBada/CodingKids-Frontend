import Modal from "react-bootstrap/Modal";
import styles from "./Inscription.module.css";
import { useEffect, useRef, useState } from "react";
import AddImage from "@/components/modals/Inscription/AddImage.jsx";
import { addStudent } from "@/services/StudentServices.js";
import CropImg from "@/components/modals/CropModal/CropImg.jsx";
import {
  getCroppedImg,
  urlToFile,
  verifyDOB,
  verifyMail,
  verifyStr,
  verifyTel,
} from "@/services/utils.js";
import { uploadImage } from "@/services/ImageServices.js";
import ErrorModal from "@/components/modals/ErrorModal.jsx";
import MediaQuery from "react-responsive";
import QRModal from "@/components/modals/QRModal/QRModal.jsx";
import { getQR } from "@/services/QRServices.js";
import LoadSpinner from "@/components/Spinner/Spinner.jsx";

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
  const [qrSrc, setQrSrc] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const [errMsg, setErrMsg] = useState(null);
  const [errCode, setErrCode] = useState(500);
  const [showCrop, setShowCrop] = useState(false);

  const nameRef = useRef();
  const emailRef = useRef();
  const dobRef = useRef();
  const tel1Ref = useRef();
  const tel2Ref = useRef();

  const width = useScreenWidth();
  const modalSize = width >= 1000 ? "lg" : "m";
  const fileInputRef = useRef(null);

  async function verifyInput() {
    if (!(await verifyStr(nameRef.current.value))) {
      setErrCode(422);
      setErrMsg(
        "Le nom ne doit pas être vide et doit contenir uniquement des lettres alphabétiques.",
      );
      setShowError(true);
      return false;
    } else if (!(await verifyDOB(dobRef.current.value))) {
      setErrCode(422);
      setErrMsg(
        "La date de naissance doit être valide et ne pas être dans le futur.",
      );
      setShowError(true);
      return false;
    } else if (!(await verifyTel(tel1Ref.current.value))) {
      setErrCode(422);
      setErrMsg(
        "Le numéro de téléphone 1 doit contenir uniquement des chiffres et comporter 8 caractères.",
      );
      setShowError(true);
      return false;
    } else if (!(await verifyTel(tel2Ref.current.value))) {
      setErrCode(422);
      setErrMsg(
        "Le numéro de téléphone 2 doit contenir uniquement des chiffres et comporter 8 caractères.",
      );
      setShowError(true);
      return false;
    } else if (tel1Ref.current.value === tel2Ref.current.value) {
      setErrCode(422);
      setErrMsg("Les numéros de téléphone 1 et 2 doivent être différents.");
      setShowError(true);
      return false;
    } else if (!(await verifyMail(emailRef.current.value))) {
      setErrCode(422);
      setErrMsg(
        "L'adresse e-mail ne doit pas être vide et doit avoir un format valide.",
      );
      setShowError(true);
      return false;
    }
    return true;
  }

  async function fetchQR(id) {
    const { status, blob } = await getQR(id);
    try {
      if (status === 200) {
        setQrSrc(URL.createObjectURL(blob));
      } else if (status === 404) {
        setErrMsg(
          "Le code QR de l’étudiant n’a pas été trouvé. Veuillez réessayer.",
        );
        setErrCode(404);
        setShowError(true);
      } else {
        setErrMsg(
          "Une erreur s’est produite lors de la récupération du code QR de l’étudiant. Veuillez réessayer.",
        );
        setErrCode(500);
        setShowError(true);
      }
    } catch {
      setErrMsg(
        "Une erreur s’est produite lors de la récupération du code QR de l’étudiant. Veuillez réessayer.",
      );
      setErrCode(500);
      setShowError(true);
    }
  }
  async function handleSubmit() {
    try {
      if (await verifyInput()) {
        setLoading(true);

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

            if (imgres !== 200) {
              try {
                if (imgres === 404) {
                  setErrCode(404);
                  setErrMsg(
                    "Étudiant introuvable lors du téléchargement de l'image, essayez de modifier l'élève et d'ajouter l'image.",
                  );
                  setShowError(true);
                } else if (imgres === 422) {
                  setErrCode(422);
                  setErrMsg(
                    "Le fichier téléchargé n'est peut-être pas une image. Choisissez ou prenez une photo et réessayez.",
                  );
                  setShowError(true);
                } else {
                  setErrCode(500);
                  setErrMsg(
                    "L’étudiant a peut-être été ajouté, mais l’image n’a pas pu être téléchargée.",
                  );
                  setShowError(true);
                }
              } catch {
                setErrCode(500);
                setErrMsg(
                  "L’étudiant a peut-être été ajouté, mais l’image n’a pas pu être téléchargée.",
                );
                setShowError(true);
              }
            }
          }
          await fetchQR(res.id);
          setShowSuccess(true);
          setImgSrc(null);
          close();
        } else if (res.status === 422) {
          setErrCode(422);
          setErrMsg(
            "Les données de l'Étudiant sont manquantes ou sous une forme incorrecte. Vérifiez qu'aucun champ n'est manquant ou incorrect.",
          );
          setShowError(true);
        } else {
          setErrCode(500);
          setErrMsg(
            "Une erreur s'est produite lors de l'ajout de l'élève. Veuillez réessayer.",
          );
          setShowError(true);
        }
      }
    } catch {
      setErrCode(500);
      setErrMsg(
        "Une erreur s'est produite lors de l'ajout de l'élève. Veuillez réessayer.",
      );
      setShowError(true);
    } finally {
      setLoading(false);
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
      <LoadSpinner show={loading}></LoadSpinner>
      <QRModal
        show={showSuccess}
        onClose={() => setShowSuccess(false)}
        src={qrSrc}
        title="Étudiant Ajouté"
      ></QRModal>
      <ErrorModal
        show={showError}
        onClose={() => setShowError(false)}
        code={errCode}
        message={errMsg}
      ></ErrorModal>
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
            <MediaQuery maxWidth={999.5}>
              <div className={styles.btn}>
                <button onClick={handleSubmit}>Ajouter</button>
              </div>
            </MediaQuery>
          </div>
        </Modal.Body>
        <MediaQuery minWidth={1000}>
          <Modal.Footer>
            <div className={styles.btn}>
              <button onClick={handleSubmit}>Ajouter</button>
            </div>
          </Modal.Footer>
        </MediaQuery>
      </Modal>
    </>
  );
}

export default Inscription;
