// EditAccModal.jsx
import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import ConfirmModal from "@/components/modals/GenericModals/ConfirmModal.jsx";
import ErrorModal from "@/components/modals/GenericModals/ErrorModal.jsx";
import SuccessModal from "@/components/modals/GenericModals/SuccessModal.jsx";
import styles from "./editaccmodal.module.css";
import {
  get_admin,
  update_admin,
  update_recovery_code,
} from "@/services/AuthServices.js";

function EditAccModal({ show = false, onClose = () => {} }) {
  // admin data
  const [loading, setLoading] = useState(false);
  const [origAdminName, setOrigAdminName] = useState("");
  const [username, setUsername] = useState("");

  // staged values (saved locally when user confirms the small confirm)
  const [stagedPassword, setStagedPassword] = useState(null); // null = not staged
  const [stagedRecovery, setStagedRecovery] = useState(null);

  // local input toggles / temp inputs
  const [showPasswordBox, setShowPasswordBox] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  const [showRecoveryBox, setShowRecoveryBox] = useState(false);
  const [recoveryInput, setRecoveryInput] = useState("");

  // confirmation/feedback/error
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState(null); // {type:"save"|"pw-local"|"rec-local"}
  const [errOpen, setErrOpen] = useState(false);
  const [errCode, setErrCode] = useState(null);
  const [errMessage, setErrMessage] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadAdmin() {
      if (!show) return;
      setLoading(true);
      try {
        const res = await get_admin();
        if (cancelled) return;
        if (res?.status === 200 && res.data) {
          const name = res.data.name ?? "";
          setOrigAdminName(name);
          setUsername(name);
        } else if (res?.status) {
          setErrCode(res.status);
          setErrMessage("Impossible de charger les informations admin.");
          setErrOpen(true);
        } else {
          // fallback if get_admin returned object directly
          if (res && typeof res === "object" && res.name) {
            setOrigAdminName(res.name);
            setUsername(res.name);
          }
        }
      } catch (err) {
        console.error("get_admin error:", err);
        setErrCode(500);
        setErrMessage("Impossible de charger les informations admin.");
        setErrOpen(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadAdmin();
    return () => {
      cancelled = true;
    };
  }, [show]);

  function showError(code = 500, message = "Une erreur s'est produite") {
    setErrCode(code);
    setErrMessage(message);
    setErrOpen(true);
  }

  // Handlers for local confirm flows (password / recovery)
  function handleConfirmLocalPassword() {
    // validate: single input only
    if (!passwordInput || passwordInput.trim().length < 4) {
      showError(422, "Le mot de passe doit contenir au moins 4 caractères.");
      return;
    }

    // ask confirm: save locally
    setConfirmPayload({ type: "pw-local", value: passwordInput });
    setConfirmOpen(true);
  }

  function handleConfirmLocalRecovery() {
    if (!recoveryInput || recoveryInput.trim().length < 1) {
      showError(422, "Le code de récupération ne peut pas être vide.");
      return;
    }
    setConfirmPayload({ type: "rec-local", value: recoveryInput });
    setConfirmOpen(true);
  }

  // Final save: call server APIs for staged values
  function handleSaveAll() {
    // open confirm modal for final save
    setConfirmPayload({ type: "save-all" });
    setConfirmOpen(true);
  }

  async function executeConfirmAction() {
    if (!confirmPayload) {
      setConfirmOpen(false);
      return;
    }

    const { type, value } = confirmPayload;
    setConfirmOpen(false);

    if (type === "pw-local") {
      // store locally only
      setStagedPassword(String(value));
      setPasswordInput("");
      setShowPasswordBox(false);
      setSuccessTitle("Mot de passe prêt");
      setSuccessMessage(
        "Le mot de passe a été enregistré localement. Cliquez sur Enregistrer pour l'appliquer.",
      );
      setSuccessOpen(true);
      return;
    }

    if (type === "rec-local") {
      setStagedRecovery(String(value));
      setRecoveryInput("");
      setShowRecoveryBox(false);
      setSuccessTitle("Code de récupération prêt");
      setSuccessMessage(
        "Le code de récupération a été enregistré localement. Cliquez sur Enregistrer pour l'appliquer.",
      );
      setSuccessOpen(true);
      return;
    }

    if (type === "save-all") {
      // Perform calls: update_admin (username + password if stagedPassword != null)
      // and update_recovery_code (if stagedRecovery != null)
      setBusy(true);
      let adminOk = true;
      let recOk = true;
      try {
        // update admin (username + password) - send username and stagedPassword (can be null)
        const adminPayload = {
          username: username ?? "",
          password: stagedPassword ?? null,
        };
        const statusAdmin = await update_admin(adminPayload);

        if (!(statusAdmin >= 200 && statusAdmin < 300)) {
          adminOk = false;
          if (statusAdmin === 422) {
            setErrCode(422);
            setErrMessage("Données invalides.");
          } else {
            setErrCode(statusAdmin ?? 500);
            setErrMessage("Erreur lors de la mise à jour du compte.");
          }
        }

        // update recovery code separately if present
        if (stagedRecovery !== null) {
          const statusRec = await update_recovery_code(stagedRecovery);
          if (!(statusRec >= 200 && statusRec < 300)) {
            recOk = false;
            if (statusRec === 422) {
              setErrCode(422);
              setErrMessage("Données invalides pour le code de récupération.");
            } else {
              setErrCode(statusRec ?? 500);
              setErrMessage(
                "Erreur lors de la mise à jour du code de récupération.",
              );
            }
          }
        }

        if (adminOk && recOk) {
          setSuccessTitle("Modifications enregistrées");
          setSuccessMessage(
            "Les modifications ont été appliquées avec succès.",
          );
          setSuccessOpen(true);
          // clear staged (we might still keep username as updated)
          setStagedPassword(null);
          setStagedRecovery(null);
          // refresh original name
          setOrigAdminName(username);
        } else {
          // open error modal with the message set above
          setErrOpen(true);
        }
      } catch (err) {
        console.error("save-all error:", err);
        showError(500, "Une erreur est survenue lors de l'enregistrement.");
      } finally {
        setBusy(false);
      }
    }
  }

  return (
    <>
      <ErrorModal
        show={errOpen}
        onClose={() => setErrOpen(false)}
        code={errCode}
        message={errMessage}
      />

      <SuccessModal
        show={successOpen}
        title={successTitle}
        message={successMessage}
        onClose={() => setSuccessOpen(false)}
      />

      <ConfirmModal
        show={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        // keep title short as requested
        title="Confirmation"
        message={
          confirmPayload?.type === "save-all"
            ? "Voulez-vous appliquer ces modifications ? Cela enverra les changements au serveur."
            : confirmPayload?.type === "pw-local"
              ? "Enregistrer le mot de passe localement ?"
              : confirmPayload?.type === "rec-local"
                ? "Enregistrer le code de récupération ?"
                : "Voulez-vous continuer ?"
        }
        btn_yes="Confirmer"
        btn_no="Annuler"
        func={executeConfirmAction}
      />

      <Modal
        show={show}
        onHide={() => {
          // reset transient inputs when closing
          setShowPasswordBox(false);
          setPasswordInput("");
          setShowRecoveryBox(false);
          setRecoveryInput("");
          onClose();
        }}
        size="m"
        centered
        className={styles.modal}
      >
        <Modal.Header closeButton className={styles.header}>
          <h3 className={styles.title}>Modifier le compte admin</h3>
        </Modal.Header>

        <Modal.Body className={styles.body}>
          {loading && <div className={styles.message}>Chargement…</div>}

          {/* Username */}
          <label className={styles.label}>Nom d'Administrateur</label>
          <input
            className={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nom d'administrateur"
            autoComplete="username"
          />
          <div style={{ marginTop: 8, marginBottom: 12 }}>
            {stagedPassword !== null && (
              <span style={{ marginLeft: 8 }} className={styles.smallBadge}>
                Mot de passe prêt
              </span>
            )}
            {stagedRecovery !== null && (
              <span style={{ marginLeft: 8 }} className={styles.smallBadge}>
                Code de récupération prêt
              </span>
            )}
          </div>

          <div className="divider" />

          {/* Password block (single input only) */}
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <strong style={{ color: "#111" }} className={styles.label2}>
                Mot de passe
              </strong>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className={styles.actionBtnOutline}
                  onClick={() => {
                    setShowPasswordBox((v) => !v);
                    setPasswordInput("");
                  }}
                >
                  {showPasswordBox ? "Annuler" : "Modifier le mot de passe"}
                </button>
              </div>
            </div>

            {showPasswordBox && (
              <div style={{ marginTop: 10 }}>
                <label className={styles.label} style={{ marginTop: 6 }}>
                  Nouveau mot de passe
                </label>
                <input
                  className={styles.input}
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Nouveau mot de passe"
                />
                <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={handleConfirmLocalPassword}
                    disabled={!passwordInput || busy}
                  >
                    Confirmer
                  </button>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => {
                      setShowPasswordBox(false);
                      setPasswordInput("");
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="divider" />

          {/* Recovery code block */}
          <div style={{ marginBottom: 6 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <strong style={{ color: "#111" }} className={styles.label2}>
                Code de récupération
              </strong>
              <div>
                <button
                  type="button"
                  className={styles.actionBtnOutline}
                  onClick={() => {
                    setShowRecoveryBox((v) => !v);
                    setRecoveryInput("");
                  }}
                >
                  {showRecoveryBox ? "Annuler" : "Modifier le code"}
                </button>
              </div>
            </div>

            {showRecoveryBox && (
              <div style={{ marginTop: 10 }}>
                <label className={styles.label}>Nouveau code</label>
                <input
                  className={styles.input}
                  value={recoveryInput}
                  onChange={(e) => setRecoveryInput(e.target.value)}
                  placeholder="Nouveau code de récupération"
                />
                <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={handleConfirmLocalRecovery}
                    disabled={!recoveryInput || busy}
                  >
                    Confirmer
                  </button>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => {
                      setShowRecoveryBox(false);
                      setRecoveryInput("");
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="divider" style={{ marginTop: 10 }} />

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 8,
            }}
          >
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                gap: 8,
                justifyContent: "end",
                width: "100%",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  // reset staged local values
                  setStagedPassword(null);
                  setStagedRecovery(null);
                  setUsername(origAdminName);
                  setSuccessTitle("Annulé");
                  setSuccessMessage(
                    "Les modifications locales ont été annulées.",
                  );
                  setSuccessOpen(true);
                }}
                className={styles.cancelBtn}
                disabled={busy}
              >
                Réinitialiser
              </button>

              <button
                type="button"
                className={styles.saveBtn}
                onClick={handleSaveAll}
                disabled={busy}
              >
                {busy ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </Modal.Body>

        {/* Modal footer is handled by our body area and footer above */}
      </Modal>
    </>
  );
}

export default EditAccModal;
