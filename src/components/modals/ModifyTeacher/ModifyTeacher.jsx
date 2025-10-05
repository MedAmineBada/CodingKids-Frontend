import Modal from "react-bootstrap/Modal";
import styles from "./ModifyTeacher.module.css";
import "@fontsource/quicksand/600";
import { Button } from "react-bootstrap";
import { useEffect, useRef, useState } from "react";
import {
  addCV,
  deleteCV,
  getCV,
  updateTeacher,
} from "@/services/TeacherServices.js";
import ErrorModal from "@/components/modals/GenericModals/ErrorModal.jsx";
import ConfirmModal from "@/components/modals/GenericModals/ConfirmModal.jsx";
import {
  capitalizeWords,
  cleanSpaces,
  removeAllSpaces,
} from "@/services/utils.js";

export default function ModifyTeacherModal({
  show,
  teacher,
  onClose,
  onSuccess,
  onCVDelete,
}) {
  const [showError, setShowError] = useState(false);
  const [name, setName] = useState("");
  const [tel, setTel] = useState("");
  const [email, setEmail] = useState("");
  const [cin, setCin] = useState("");

  // file handling
  const fileInputRef = useRef(null);
  const programmaticPopulateRef = useRef(false); // marks programmatic population so we don't treat it as user selection
  const originalHasCvRef = useRef(false); // whether teacher originally had CV
  const [selectedCV, setSelectedCV] = useState(null); // user-chosen file (real user)
  const [fallbackFilename, setFallbackFilename] = useState(null); // shown if programmatic population fails
  const [deletedCv, setDeletedCv] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [deletingCV, setDeletingCV] = useState(false);

  // Confirm modal state and text (French)
  const [showConf, setShowConf] = useState(false);
  const [confTitle, setConfTitle] = useState("Supprimer le CV");
  const [confMessage, setConfMessage] = useState(
    "Voulez-vous vraiment supprimer le CV de cet enseignant ? Cette action est irréversible.",
  );

  // Error modal state
  const [errorMsg, setErrorMsg] = useState(null);
  const [errorCode, setErrorCode] = useState(500);

  useEffect(() => {
    if (teacher) {
      setCin(teacher.cin ?? "");
      setName(teacher.name ?? "");
      setTel(teacher.tel ?? "");
      setEmail(teacher.email ?? "");
      setSelectedCV(null);
      setFallbackFilename(null);
      setDeletedCv(false);
      originalHasCvRef.current = Boolean(teacher.cv);

      if (fileInputRef.current) fileInputRef.current.value = null;

      // fetch CV and populate file input visually
      let cancelled = false;
      let createdObjectUrl = null;

      async function fetchAndPopulate() {
        if (!teacher.id) return;

        try {
          const raw = await getCV(teacher.id);
          if (cancelled) return;
          if (!raw) return;

          // produce Blob and filename
          let blob;
          let filename = `${teacher.id}-cv.pdf`;

          if (typeof raw === "string") {
            // server returned a URL -> fetch it
            const resp = await fetch(raw);
            blob = await resp.blob();
            try {
              const parts = raw.split("/");
              const last = parts[parts.length - 1];
              if (last) filename = decodeURIComponent(last.split("?")[0]);
            } catch {}
          } else if (raw instanceof Response) {
            blob = await raw.blob();
            const cd = raw.headers?.get?.("content-disposition");
            if (cd) {
              const match = cd.match(/filename="?([^"]+)"?/i);
              if (match) filename = match[1];
            }
          } else if (raw instanceof Blob || raw instanceof File) {
            blob = raw;
            if (raw instanceof File && raw.name) filename = raw.name;
          } else if (raw?.blob instanceof Function) {
            blob = await raw.blob();
          } else {
            return;
          }

          if (!blob) return;

          const file = new File([blob], filename, {
            type: blob.type || "application/pdf",
          });

          // Try to set the input.files using DataTransfer so the browser shows the filename
          try {
            const dt = new DataTransfer();
            dt.items.add(file);
            if (fileInputRef.current) {
              // mark that this change is programmatic
              programmaticPopulateRef.current = true;
              fileInputRef.current.files = dt.files;

              // dispatch a change event so native UI updates immediately
              const ev = new Event("change", { bubbles: true });
              fileInputRef.current.dispatchEvent(ev);

              // keep selectedCV === null (user didn't choose)
              setSelectedCV(null);
              setFallbackFilename(null);
              originalHasCvRef.current = true;
            } else {
              // fallback
              setFallbackFilename(filename);
            }
          } catch (err) {
            // fallback: show filename under input
            setFallbackFilename(filename);
          }
        } catch (err) {
          setErrorCode(500);
          setErrorMsg(
            "Impossible de récupérer le CV — vérifiez la connexion ou réessayez plus tard.",
          );
          setShowError(true);
        }
      }

      fetchAndPopulate();

      return () => {
        cancelled = true;
        if (createdObjectUrl) URL.revokeObjectURL(createdObjectUrl);
      };
    } else {
      // clear when no teacher
      setCin("");
      setName("");
      setTel("");
      setEmail("");
      setSelectedCV(null);
      setFallbackFilename(null);
      setDeletedCv(false);
      originalHasCvRef.current = false;
      if (fileInputRef.current) fileInputRef.current.value = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacher]);

  const handleNameChange = (e) => setName(e.target.value);
  const handleTelChange = (e) => setTel(removeAllSpaces(e.target.value));
  const handleEmailChange = (e) => setEmail(removeAllSpaces(e.target.value));

  function validate() {
    const trimmedName = cleanSpaces(name || "");
    if (!trimmedName) return "Le nom ne peut pas être vide.";
    if (!/^([A-Za-zÀ-ÖØ-öø-ÿ]+\s?)+$/.test(trimmedName))
      return "Le nom ne doit contenir que des lettres et des espaces.";

    if (email) {
      const em = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      if (!em.test(email)) return "L'adresse e-mail est invalide.";
    }

    const phoneRegex = /^\d{8}$/;
    if (tel && !phoneRegex.test(tel))
      return "Tel. doit contenir exactement 8 chiffres.";

    return null;
  }

  async function handleUpdate() {
    const clientError = validate();
    if (clientError) {
      setErrorCode(422);
      setErrorMsg(clientError);
      setShowError(true);
      return;
    }

    setSubmitting(true);

    // adapt to your API: may need FormData with selectedCV or a flag that CV was deleted
    let newData = {
      id: teacher.id,
      cin: removeAllSpaces(cin),
      name: capitalizeWords(cleanSpaces(name)),
      tel: removeAllSpaces(tel),
      email: removeAllSpaces(email),
    };

    try {
      const result = await updateTeacher(teacher.id, newData);
      let msg = null;
      let code = null;

      if (result === 200) {
        // If the user selected a new CV file, upload it now using addCV
        if (selectedCV) {
          try {
            const addResult = await addCV(teacher.id, selectedCV);
            if (addResult === 201) {
              // both metadata and cv uploaded successfully
              onSuccess?.({ ...newData, cv: true });
              onClose();
            } else {
              // addCV failed
              setErrorCode(addResult ?? 500);
              setErrorMsg(
                "Le téléchargement du CV a échoué — veuillez réessayer.",
              );
              setShowError(true);
            }
          } catch {
            setErrorCode(500);
            setErrorMsg(
              "Échec du téléchargement du CV — vérifiez votre connexion ou réessayez plus tard.",
            );
            setShowError(true);
          }
        } else {
          // no new CV selected => success immediately
          onSuccess(newData);
          onClose();
        }
      } else if (result === 404) {
        code = 404;
        msg = "L'enseignant à modifier n'a pas été trouvé.";
        setShowError(true);
      } else if (result === 422) {
        code = 422;
        msg =
          "Les informations de l'enseignant sont invalides. Veuillez vérifier les champs et réessayer.";
        setShowError(true);
      } else {
        msg =
          "Une erreur est survenue lors de la modification de l'enseignant. Veuillez réessayer.";
        setShowError(true);
      }

      if (code != null) setErrorCode(code);
      if (msg != null) setErrorMsg(msg);
    } catch {
      setErrorCode(500);
      setErrorMsg(
        "Échec de la requête — vérifiez votre connexion ou réessayez plus tard.",
      );
      setShowError(true);
    } finally {
      setSubmitting(false);
    }
  }

  // handle input change; ignore programmatic change
  function handleFileInputChange(e) {
    if (programmaticPopulateRef.current) {
      // This change was triggered by our code populating the input.
      // treat it as the *original* server file, not a user's new selection.
      programmaticPopulateRef.current = false;
      setSelectedCV(null);
      setFallbackFilename(null);
      originalHasCvRef.current = true;
      return;
    }

    const file = e.target.files && e.target.files[0];
    if (file) {
      setSelectedCV(file);
      originalHasCvRef.current = false; // user replaced the original
      setFallbackFilename(null);
      setDeletedCv(false);
    } else {
      setSelectedCV(null);
    }
  }

  // delete CV ConfirmModal func
  async function confirmDeleteCV() {
    if (!teacher?.id) return;

    setDeletingCV(true);
    try {
      const result = await deleteCV(teacher.id);
      if (result === 200) {
        // clear input UI
        if (fileInputRef.current) fileInputRef.current.value = null;
        setSelectedCV(null);
        setFallbackFilename(null);
        originalHasCvRef.current = false;
        setDeletedCv(true);
        setShowConf(false);
        onCVDelete?.({ ...teacher, cv: null });
      } else {
        setErrorCode(result ?? 500);
        setErrorMsg("Impossible de supprimer le CV — veuillez réessayer.");
        setShowError(true);
      }
    } catch (err) {
      setErrorCode(500);
      setErrorMsg(
        "Échec de la requête de suppression — vérifiez votre connexion ou réessayez plus tard.",
      );
      setShowError(true);
    } finally {
      setDeletingCV(false);
    }
  }

  function onClickDeleteCV() {
    setConfTitle("Supprimer le CV");
    setConfMessage(
      "Voulez-vous vraiment supprimer le CV de cet enseignant ? Cette action est irréversible.",
    );
    setShowConf(true);
  }

  const isUnchanged = () => {
    if (!teacher) return true;
    const fieldsUnchanged =
      (capitalizeWords(cleanSpaces(name)) || "") === (teacher.name || "") &&
      (cin || "") === (teacher.cin || "") &&
      (tel || "") === (teacher.tel || "") &&
      (email || "") === (teacher.email || "");
    const cvUnchanged = selectedCV === null && deletedCv === false;
    return fieldsUnchanged && cvUnchanged;
  };

  return (
    <>
      <ConfirmModal
        show={showConf}
        onClose={() => setShowConf(false)}
        title={confTitle}
        message={confMessage}
        func={confirmDeleteCV}
        loading={deletingCV}
        btn_yes={"Confirmer"}
        btn_no={"Annuler"}
      />

      <ErrorModal
        show={showError}
        {...(errorMsg != null ? { message: errorMsg } : {})}
        code={errorCode}
        onClose={() => setShowError(false)}
      />

      <Modal
        className={styles.container}
        show={show}
        size="m"
        centered
        onHide={onClose}
      >
        <div className={styles.headerWrapper}>
          <Modal.Header className={styles.header} style={{ border: "none" }}>
            <div className={styles.titleBlock}>
              <h3>Modifier l'enseignant</h3>
            </div>
          </Modal.Header>
        </div>

        <Modal.Body className={styles.body}>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.label}>
                Nom{" "}
                <span
                  style={{
                    color: "#fd9f09",
                    fontWeight: "bolder",
                    fontSize: "18px",
                  }}
                >
                  *
                </span>
              </span>
              <input
                className={styles.input}
                type="text"
                value={name}
                onChange={handleNameChange}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>
                CIN{" "}
                <span
                  style={{
                    color: "#fd9f09",
                    fontWeight: "bolder",
                    fontSize: "18px",
                  }}
                >
                  *
                </span>
              </span>
              <input
                className={styles.input}
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={cin}
                onChange={(e) => setCin(e.target.value)}
              />
            </label>

            <div className={styles.row}>
              <label className={styles.fieldSmall}>
                <span className={styles.label}>
                  Tel.{" "}
                  <span
                    style={{
                      color: "#fd9f09",
                      fontWeight: "bolder",
                      fontSize: "18px",
                    }}
                  >
                    *
                  </span>
                </span>
                <input
                  className={styles.input}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={tel}
                  onChange={handleTelChange}
                  placeholder="8 chiffres"
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>
                  E-mail{" "}
                  <span
                    style={{
                      color: "#fd9f09",
                      fontWeight: "bolder",
                      fontSize: "18px",
                    }}
                  >
                    *
                  </span>
                </span>
                <input
                  className={styles.input}
                  style={{ textTransform: "none" }}
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="exemple@domaine.com"
                />
              </label>
            </div>

            <label className={styles.field}>
              <span className={styles.label}>Fichier PDF</span>

              <div className={styles.inputfile}>
                <input
                  ref={fileInputRef}
                  className={styles.input}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileInputChange}
                />

                <button
                  type="button"
                  onClick={onClickDeleteCV}
                  aria-label="Supprimer le CV"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fill="currentColor"
                      fillRule="evenodd"
                      d="M5.75 3V1.5h4.5V3h-4.5Zm-1.5 0V1a1 1 0 0 1 1-1h5.5a1 1 0 0 1 1 1v2h2.5a.75.75 0 0 1 0 1.5h-.365l-.743 9.653A2 2 0 0 1 11.148 16H4.852a2 2 0 0 1-1.994-1.847L2.115 4.5H1.75a.75.75 0 0 1 0-1.5h2.5Zm-.63 1.5h8.76l-.734 9.538a.5.5 0 0 1-.498.462H4.852a.5.5 0 0 1-.498-.462L3.62 4.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {/* Fallback filename display (only shown when automatic population couldn't set input.files) */}
              {fallbackFilename && (
                <div style={{ marginTop: 8 }}>Fichier : {fallbackFilename}</div>
              )}
            </label>
          </div>
        </Modal.Body>

        <Modal.Footer className={styles.footer} style={{ border: "none" }}>
          <div className={styles.btns}>
            <Button
              variant="outline-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={submitting || isUnchanged()}
            >
              {submitting
                ? "Enregistrement…"
                : isUnchanged()
                  ? "Aucune modification"
                  : "Enregistrer"}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}
