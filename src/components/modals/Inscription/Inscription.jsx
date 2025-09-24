import React, { useEffect, useRef, useState } from "react";
import Modal from "react-bootstrap/Modal";
import AddImage from "@/components/modals/Inscription/AddImage.jsx";
import CropImg from "@/components/modals/CropModal/CropImg.jsx";
import QRModal from "@/components/modals/QRModal/QRModal.jsx";
import ErrorModal from "@/components/modals/ErrorModal.jsx";
import LoadSpinner from "@/components/Spinner/Spinner.jsx";

import styles from "./Inscription.module.css";

import {
  getCroppedImg,
  urlToFile,
  verifyDOB,
  verifyMail,
  verifyStr,
  verifyTel,
} from "@/services/utils.js";
import { addStudent } from "@/services/StudentServices.js";
import { uploadImage } from "@/services/ImageServices.js";
import { getQR } from "@/services/QRServices.js";

function useScreenWidth() {
  const isClient = typeof window === "object";
  const [width, setWidth] = useState(isClient ? window.innerWidth : 1200);

  useEffect(() => {
    if (!isClient) return;
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isClient]);

  return width;
}

export default function Inscription({ show, close }) {
  const [imgSrc, setImgSrc] = useState(null);
  const [qrSrc, setQrSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errMsg, setErrMsg] = useState(null);
  const [errCode, setErrCode] = useState(500);
  const [showCrop, setShowCrop] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    birth_date: "",
    tel1: "",
    tel2: "",
  });
  const [touched, setTouched] = useState({});
  const [inlineErrors, setInlineErrors] = useState({});

  const width = useScreenWidth();
  const modalSize = width >= 1000 ? "lg" : "m";

  const fileInputRef = useRef(null);
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (show) setTimeout(() => firstInputRef.current?.focus(), 120);
  }, [show]);

  function updateField(name, value) {
    setForm((s) => ({ ...s, [name]: value }));
    setTouched((t) => ({ ...t, [name]: true }));
  }

  async function validateInline() {
    const errors = {};
    if (touched.name && !(await verifyStr(form.name)))
      errors.name = "Nom invalide — uniquement des lettres et espaces.";
    if (touched.birth_date && !(await verifyDOB(form.birth_date)))
      errors.birth_date = "Date invalide ou future.";
    if (touched.tel1 && !(await verifyTel(form.tel1)))
      errors.tel1 = "Téléphone 1 doit être 8 chiffres.";
    if (touched.tel2 && !(await verifyTel(form.tel2)))
      errors.tel2 = "Téléphone 2 doit être 8 chiffres.";
    if (touched.tel1 && touched.tel2 && form.tel1 === form.tel2)
      errors.tel2 = "Les numéros doivent être différents.";
    if (touched.email && !(await verifyMail(form.email)))
      errors.email = "E-mail invalide.";

    setInlineErrors(errors);
    return errors;
  }

  async function verifyInput() {
    if (!(await verifyStr(form.name))) {
      setErrCode(422);
      setErrMsg(
        "Le nom ne doit pas être vide et doit contenir uniquement des lettres alphabétiques.",
      );
      setShowError(true);
      return false;
    }
    if (!(await verifyDOB(form.birth_date))) {
      setErrCode(422);
      setErrMsg(
        "La date de naissance doit être valide et ne pas être dans le futur.",
      );
      setShowError(true);
      return false;
    }
    if (!(await verifyTel(form.tel1))) {
      setErrCode(422);
      setErrMsg(
        "Le numéro de téléphone 1 doit contenir uniquement des chiffres et comporter 8 caractères.",
      );
      setShowError(true);
      return false;
    }
    if (!(await verifyTel(form.tel2))) {
      setErrCode(422);
      setErrMsg(
        "Le numéro de téléphone 2 doit contenir uniquement des chiffres et comporter 8 caractères.",
      );
      setShowError(true);
      return false;
    }
    if (form.tel1 === form.tel2) {
      setErrCode(422);
      setErrMsg("Les numéros de téléphone 1 et 2 doivent être différents.");
      setShowError(true);
      return false;
    }
    if (!(await verifyMail(form.email))) {
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
    try {
      const { status, blob } = await getQR(id);
      if (status === 200) setQrSrc(URL.createObjectURL(blob));
      else if (status === 404) {
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
      setTouched({
        name: true,
        email: true,
        birth_date: true,
        tel1: true,
        tel2: true,
      });
      await validateInline();

      if (await verifyInput()) {
        setLoading(true);
        const student = { ...form };
        const res = await addStudent(student);

        if (res.status === 201) {
          if (imgSrc) {
            const file = await urlToFile(imgSrc, res.id + "-tempimage.webp");
            const imgres = await uploadImage(res.id, file);
            if (imgres !== 200) {
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
            }
          }

          await fetchQR(res.id);
          setShowSuccess(true);
          setForm({ name: "", email: "", birth_date: "", tel1: "", tel2: "" });
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

  function handleImageClick() {
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
    } catch (err) {
      console.error("Error during crop or upload", err);
    } finally {
      setShowCrop(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <>
      <LoadSpinner show={loading} />

      <QRModal
        show={showSuccess}
        onClose={() => setShowSuccess(false)}
        src={qrSrc}
        title="Étudiant ajouté"
      />

      <ErrorModal
        show={showError}
        onClose={() => setShowError(false)}
        code={errCode}
        message={errMsg}
      />

      <CropImg
        show={showCrop}
        close={() => setShowCrop(false)}
        cropComplete={handleCropComplete}
        url={imgSrc}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className={styles.hiddenInput}
        onChange={handleFileChange}
      />

      <Modal show={show} onHide={close} centered size={modalSize}>
        <Modal.Header className={styles.modalHeader}>
          <h2 className={styles.title}>Inscrire un étudiant</h2>
        </Modal.Header>

        <Modal.Body className={styles.modalBody}>
          <div className={styles.gridWrap}>
            <div className={styles.imageCol}>
              <div
                className={styles.imageDrop}
                role="button"
                onClick={handleImageClick}
                onKeyDown={(e) => e.key === "Enter" && handleImageClick()}
                tabIndex={0}
                aria-label="Ajouter une photo de l'étudiant"
              >
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt="Aperçu"
                    className={styles.previewImage}
                  />
                ) : (
                  <AddImage src={imgSrc} onClick={handleImageClick} />
                )}
              </div>
              <span className={styles.imageLabel}>Image (optionnelle)</span>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={handleImageClick}
              >
                Choisir / Prendre une photo
              </button>
            </div>

            <form className={styles.formCol} onKeyDown={onKeyDown}>
              <div className={styles.row}>
                <label htmlFor="name" className={styles.label}>
                  Nom &amp; Prénom <span className={styles.required}>*</span>
                </label>
                <input
                  id="name"
                  ref={firstInputRef}
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  onBlur={validateInline}
                  placeholder="Nom complet de l’étudiant"
                  className={`${styles.input} ${inlineErrors.name ? styles.inputError : ""}`}
                  aria-invalid={!!inlineErrors.name}
                />
              </div>

              <div className={styles.splitRow}>
                <div className={styles.col}>
                  <label htmlFor="birth_date" className={styles.label}>
                    Date de naissance <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="birth_date"
                    type="date"
                    value={form.birth_date}
                    onChange={(e) => updateField("birth_date", e.target.value)}
                    onBlur={validateInline}
                    className={`${styles.input} ${inlineErrors.birth_date ? styles.inputError : ""}`}
                    aria-invalid={!!inlineErrors.birth_date}
                  />
                </div>

                <div className={styles.col}>
                  <label htmlFor="tel1" className={styles.label}>
                    Tel. 1 <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="tel1"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={form.tel1}
                    onChange={(e) =>
                      updateField("tel1", e.target.value.replace(/[^0-9]/g, ""))
                    }
                    onBlur={validateInline}
                    placeholder="Téléphone 1 de l’étudiant"
                    className={`${styles.input} ${inlineErrors.tel1 ? styles.inputError : ""}`}
                    aria-invalid={!!inlineErrors.tel1}
                  />
                </div>
              </div>

              <div className={styles.splitRow}>
                <div className={styles.col}>
                  <label htmlFor="tel2" className={styles.label}>
                    Tel. 2 <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="tel2"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={form.tel2}
                    onChange={(e) =>
                      updateField("tel2", e.target.value.replace(/[^0-9]/g, ""))
                    }
                    onBlur={validateInline}
                    placeholder="Téléphone 2 de l’étudiant"
                    className={`${styles.input} ${inlineErrors.tel2 ? styles.inputError : ""}`}
                    aria-invalid={!!inlineErrors.tel2}
                  />
                </div>

                <div className={styles.col}>
                  <label htmlFor="email" className={styles.label}>
                    E-Mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    onBlur={validateInline}
                    placeholder="adresse@example.com"
                    className={`${styles.input} ${inlineErrors.email ? styles.inputError : ""}`}
                    aria-invalid={!!inlineErrors.email}
                  />
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className={styles.primaryBtn}
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
