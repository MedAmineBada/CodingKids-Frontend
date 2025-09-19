import React, { useEffect, useRef, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { Button } from "react-bootstrap";
import styles from "./PaymentForm.module.css";
import { addPayment } from "@/services/PaymentService.js";
import ErrorModal from "@/components/modals/ErrorModal.jsx";

function PaymentForm({ show, onClose, id, onSave }) {
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState("");
  const [datep, setDatep] = useState("");
  const [saving, setSaving] = useState(false);

  // New state variables for error modal
  const [showError, setShowError] = useState(false);
  const [errCode, setErrCode] = useState(null);
  const [errMsg, setErrMsg] = useState("");

  const monthInputRef = useRef(null);
  const [monthSupported, setMonthSupported] = useState(true);

  useEffect(() => {
    if (monthInputRef.current) {
      if (monthInputRef.current.type !== "month") setMonthSupported(false);
    }
  }, [show]);

  useEffect(() => {
    if (!show) {
      setAmount("");
      setMonth("");
      setDatep("");
      setSaving(false);
      setShowError(false);
      setErrCode(null);
      setErrMsg("");
    } else {
      const today = new Date();
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, "0");
      const day = today.getDate().toString().padStart(2, "0");

      setDatep(`${year}-${month}-${day}`);
      setMonth(`${year}-${month}`);
    }
  }, [show]);

  const handleAmountChange = (e) => {
    setAmount(e.target.value.replace(/\./g, ","));
  };

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
  };

  const handleMonthSelect = (yyyy, mm) => {
    if (!yyyy || !mm) setMonth("");
    else setMonth(`${yyyy}-${mm.toString().padStart(2, "0")}`);
  };

  const handleDateChange = (e) => {
    setDatep(e.target.value);
  };

  const _toNumber = (strWithComma) => {
    if (!strWithComma && strWithComma !== "0") return NaN;
    return Number(String(strWithComma).replace(/\s/g, "").replace(/,/g, "."));
  };

  const validate = () => {
    const e = {};
    const n = _toNumber(amount);
    if (!amount || Number.isNaN(n) || n < 0)
      e.amount = "Entrez un montant valide (≥ 0).";
    if (!month) e.month = "Sélectionnez le mois / année.";
    if (!datep) e.datep = "Sélectionnez la date de paiement.";
    return e;
  };

  const formatDT = (value) => {
    const n = _toNumber(value);
    if (Number.isNaN(n) || value === "") return "—";
    const parts = n.toFixed(3).split(".");
    const intPart = new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 0,
    }).format(parts[0]);
    return `${intPart}DT ${parts[1]}`;
  };

  const formatMonthDisplay = (yyyymm) => {
    if (!yyyymm) return "—";
    const m = yyyymm.match(/^(\d{4})-(\d{2})$/);
    if (!m) return yyyymm;
    return `${m[2]}-${m[1]}`;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrCode(400);
      setErrMsg("Veuillez remplir tous les champs correctement.");
      setShowError(true);
      return;
    }
    setSaving(true);
    try {
      const [year, mon] = month.split("-");
      const response = await addPayment(
        id,
        mon,
        year,
        datep,
        _toNumber(amount),
      );

      if (response.status === 201) {
        if (onSave) await onSave();
        onClose();
      } else if (response.status === 422) {
        setErrCode(422);
        setErrMsg(
          "Données invalides. Vérifiez que le montant est positif, que l’année de paiement n’excède pas l’année prochaine, et que la date n’est pas dans le futur.",
        );
        setShowError(true);
      } else {
        setErrCode(response.status);
        setErrMsg("Une erreur inattendue est survenue.");
        setShowError(true);
      }
    } catch (error) {
      setErrCode(500);
      setErrMsg("Erreur de connexion au serveur.");
      setShowError(true);
    }
    setSaving(false);
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  const selectedYear = month ? month.split("-")[0] : "";
  const selectedMonth = month ? month.split("-")[1] : "";

  return (
    <>
      <Modal
        show={show}
        onHide={onClose}
        scrollable
        centered
        className={styles.modal}
        size="m"
      >
        <Modal.Header closeButton className={styles.head}>
          <h1 className={styles.title}>Enregistrer un paiement</h1>
        </Modal.Header>
        <Modal.Body className={styles.body}>
          <div className={styles.field}>
            <label htmlFor="amount" className={styles.label}>
              Montant
            </label>
            <div className={styles.inputWrap}>
              <input
                id="amount"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={handleAmountChange}
                className={styles.input}
                placeholder="0,000"
              />
              <div className={`${styles.currency} ${styles.accent}`}>DT</div>
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor="month" className={styles.label}>
              Mois/Année
            </label>
            {monthSupported ? (
              <input
                id="month"
                ref={monthInputRef}
                type="month"
                value={month}
                onChange={handleMonthChange}
                className={styles.input}
              />
            ) : (
              <div style={{ display: "flex", gap: 8, width: "50%" }}>
                <select
                  value={selectedMonth}
                  onChange={(e) =>
                    handleMonthSelect(
                      selectedYear || yearOptions[5],
                      e.target.value,
                    )
                  }
                  className={styles.select}
                >
                  <option value="">Mois</option>
                  {Array.from({ length: 12 }, (_, i) => {
                    const m = (i + 1).toString().padStart(2, "0");
                    return (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    );
                  })}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) =>
                    handleMonthSelect(e.target.value, selectedMonth || "01")
                  }
                  className={styles.select}
                >
                  <option value="">Année</option>
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className={styles.field}>
            <label htmlFor="datep" className={styles.label}>
              Date de Paiement
            </label>
            <input
              id="datep"
              type="date"
              value={datep}
              onChange={handleDateChange}
              className={styles.input}
            />
          </div>
          <div className={`${styles.preview} ${styles.accentBorder}`}>
            <div className={styles.previewLabel}>Aperçu</div>
            <div className={styles.previewRow}>
              <span className={styles.previewKey}>Montant</span>
              <strong className={styles.previewValueAccent}>
                {formatDT(amount)}
              </strong>
            </div>
            <div className={styles.previewRow}>
              <span className={styles.previewKey}>Mois</span>
              <span className={styles.previewValue}>
                {formatMonthDisplay(month)}
              </span>
            </div>
            <div className={styles.previewRow}>
              <span className={styles.previewKey}>Date</span>
              <span className={styles.previewValue}>{datep || "—"}</span>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className={styles.footer}>
          <div className={styles.btns}>
            <Button variant="secondary" onClick={onClose} disabled={saving}>
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className={styles.saveBtn}
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      <ErrorModal
        show={showError}
        onClose={() => setShowError(false)}
        code={errCode}
        message={errMsg}
      />
    </>
  );
}

export default PaymentForm;
