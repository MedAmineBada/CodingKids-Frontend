import React, { useEffect, useMemo, useState } from "react";
import Modal from "react-bootstrap/Modal";
import styles from "./PaymentInfo.module.css";
import ErrorModal from "@/components/modals/ErrorModal.jsx";
import { removeAllSpaces } from "@/services/utils.js";
import { editPayment } from "@/services/PaymentService.js";

function formatAmountParts(amount, locale = "fr-FR", currencyLabel = "DT") {
  if (amount === null || amount === undefined || amount === "") return null;
  const num = Number(amount);
  if (Number.isNaN(num)) return null;
  const sign = num < 0 ? "-" : "";
  const abs = Math.abs(num);
  const integerFormatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  });
  const integer = integerFormatter.format(Math.floor(abs));
  const decimals = Math.round((abs - Math.floor(abs)) * 100)
    .toString()
    .padStart(2, "0");
  return {
    sign,
    integer,
    decimals,
    full: `${sign}${integer},${decimals} ${currencyLabel}`,
  };
}

function toLocalDateValue(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function PaymentInfo({ show, onHide, onEdit, data = {}, loading = false }) {
  const safeData = data ?? {};
  const [editing, setEditing] = useState(false);

  const initialFormState = useMemo(() => {
    const s = {};
    Object.keys(safeData).forEach((k) => {
      if (k === "payment_date") {
        s[k] = toLocalDateValue(safeData[k]);
      } else if (k === "amount") {
        s[k] =
          safeData[k] === null || safeData[k] === undefined
            ? ""
            : String(safeData[k]);
      } else {
        s[k] = safeData[k] ?? "";
      }
    });
    return s;
  }, [JSON.stringify(safeData)]);

  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    if (!editing) setForm(initialFormState);
  }, [initialFormState, editing]);

  const amtParts = formatAmountParts(safeData.amount);
  const formattedDate = safeData.payment_date
    ? new Date(safeData.payment_date).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

  const isNegative = Number(safeData.amount) < 0;

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const [showErr, setShowErr] = useState(false);
  const [errCode, setErrCode] = useState(500);
  const [errMsg, setErrMsg] = useState("");

  async function handleSaveClick() {
    const rawAmount = form.amount;
    let amountStr =
      rawAmount === null || rawAmount === undefined ? "" : String(rawAmount);
    amountStr = removeAllSpaces(amountStr).trim();

    if (amountStr === "") {
      setErrCode(400);
      setErrMsg("Le montant est requis.");
      setShowErr(true);
      return;
    }

    const normalizedAmountStr = amountStr.replace(",", ".");
    const amountNum = Number(normalizedAmountStr);

    if (!Number.isFinite(amountNum) || Number.isNaN(amountNum)) {
      setErrCode(422);
      setErrMsg("Le montant doit être un nombre réel valide.");
      setShowErr(true);
      return;
    }

    if (amountNum < 0) {
      setErrCode(422);
      setErrMsg("Le montant doit être supérieur ou égal à 0.");
      setShowErr(true);
      return;
    }

    const localDateValue = form.payment_date;
    if (localDateValue) {
      const entered = new Date(localDateValue + "T00:00:00");
      if (Number.isNaN(entered.getTime())) {
        setErrCode(400);
        setErrMsg("La date fournie n'est pas valide.");
        setShowErr(true);
        return;
      }
      const now = new Date();
      const todayMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      if (entered.getTime() > todayMidnight.getTime()) {
        setErrCode(400);
        setErrMsg("La date ne peut pas être postérieure à aujourd'hui.");
        setShowErr(true);
        return;
      }
    }

    const payload = {
      ...form,
      amount: amountNum,
      payment_date: localDateValue ? localDateValue : "",
    };

    try {
      const res = await editPayment(
        data.student_id,
        data.month,
        data.year,
        payload.payment_date,
        payload.amount,
      );
      if (res === 200 || (res && res.status === 200)) {
        setEditing(false);
        setShowErr(false);
        if (typeof onHide === "function") onHide();
        if (typeof onEdit === "function") onEdit();
        return;
      }
      const status =
        typeof res === "number" ? res : res && res.status ? res.status : null;
      if (status === 422) {
        setErrCode(422);
        setErrMsg(
          "Les champs 'date de paiement' et 'montant' doivent être valides.",
        );
        setShowErr(true);
        return;
      }
      if (status === 500) {
        setErrCode(500);
        setErrMsg(
          "Quelque chose s'est mal passé, veuillez réessayer plus tard.",
        );
        setShowErr(true);
        return;
      }
      setErrCode(status || 500);
      setErrMsg("Erreur inattendue, veuillez réessayer.");
      setShowErr(true);
    } catch (err) {
      setErrCode(500);
      setErrMsg("Quelque chose s'est mal passé, veuillez réessayer plus tard.");
      setShowErr(true);
    }
  }

  function handleClose() {
    setEditing(false);
    if (typeof onHide === "function") onHide();
  }

  return (
    <>
      <ErrorModal
        show={showErr}
        onClose={() => setShowErr(false)}
        code={errCode}
        message={errMsg}
      ></ErrorModal>
      <Modal
        show={show}
        onHide={handleClose}
        centered
        dialogClassName={styles.dialog}
        contentClassName={styles.content}
        aria-labelledby="payment-info-title"
      >
        <Modal.Header className={styles.head} closeButton>
          <h2 id="payment-info-title" className={styles.title}>
            Informations de paiement
          </h2>
        </Modal.Header>

        <Modal.Body className={styles.body}>
          {loading ? (
            <div className={styles.skeletonWrap}>
              <div className={styles.skeletonRow} />
              <div className={styles.skeletonRow} />
              <div className={styles.skeletonRowShort} />
            </div>
          ) : (
            <dl className={styles.grid}>
              <div className={styles.row}>
                <dt className={styles.label}>Date</dt>
                <dd className={styles.value}>
                  {editing && "payment_date" in form ? (
                    <input
                      type="date"
                      value={form.payment_date || ""}
                      onChange={(e) =>
                        handleChange("payment_date", e.target.value)
                      }
                      className={styles.input}
                    />
                  ) : safeData.payment_date ? (
                    <time dateTime={safeData.payment_date}>
                      {formattedDate}
                    </time>
                  ) : (
                    <span className={styles.empty}>-</span>
                  )}
                </dd>
              </div>

              <div className={styles.row}>
                <dt className={styles.label}>Montant</dt>
                <dd className={styles.value}>
                  {editing && "amount" in form ? (
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*([.,][0-9]{1,2})?"
                      value={form.amount ?? ""}
                      onChange={(e) => handleChange("amount", e.target.value)}
                      className={styles.input}
                    />
                  ) : amtParts ? (
                    <div
                      className={`${styles.amount} ${
                        isNegative ? styles.negative : ""
                      }`}
                    >
                      <div className={styles.amountMain}>
                        <span className={styles.amountInt}>
                          {amtParts.sign}
                          {amtParts.integer}
                        </span>
                        <span className={styles.amountCurrency}>DT</span>
                        <span className={styles.amountDec}>
                          ,{amtParts.decimals}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className={styles.empty}>-</span>
                  )}
                </dd>
              </div>

              {"payer" in safeData && (
                <div className={styles.row}>
                  <dt className={styles.label}>Payé par</dt>
                  <dd className={styles.value}>
                    {editing ? (
                      <input
                        type="text"
                        value={form.payer ?? ""}
                        onChange={(e) => handleChange("payer", e.target.value)}
                        className={styles.input}
                      />
                    ) : (
                      <span>
                        {safeData.payer || (
                          <span className={styles.empty}>-</span>
                        )}
                      </span>
                    )}
                  </dd>
                </div>
              )}

              {"method" in safeData && (
                <div className={styles.row}>
                  <dt className={styles.label}>Méthode</dt>
                  <dd className={styles.value}>
                    {editing ? (
                      <input
                        type="text"
                        value={form.method ?? ""}
                        onChange={(e) => handleChange("method", e.target.value)}
                        className={styles.input}
                      />
                    ) : (
                      <span>
                        {safeData.method || (
                          <span className={styles.empty}>-</span>
                        )}
                      </span>
                    )}
                  </dd>
                </div>
              )}

              {"id" in safeData && (
                <div className={styles.row}>
                  <dt className={styles.label}>Référence</dt>
                  <dd className={styles.value}>
                    {editing ? (
                      <input
                        type="text"
                        value={form.id ?? ""}
                        onChange={(e) => handleChange("id", e.target.value)}
                        className={`${styles.input} ${styles.mono}`}
                      />
                    ) : (
                      <span className={styles.mono}>
                        {safeData.id || <span className={styles.empty}>-</span>}
                      </span>
                    )}
                  </dd>
                </div>
              )}

              {"note" in safeData && (
                <div className={styles.row}>
                  <dt className={styles.label}>Note</dt>
                  <dd className={styles.value}>
                    {editing ? (
                      <textarea
                        value={form.note ?? ""}
                        onChange={(e) => handleChange("note", e.target.value)}
                        rows={3}
                        className={styles.textarea}
                      />
                    ) : (
                      <div className={styles.note}>
                        {safeData.note || (
                          <span className={styles.empty}>-</span>
                        )}
                      </div>
                    )}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </Modal.Body>

        <Modal.Footer className={styles.footer}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={handleClose}
          >
            Fermer
          </button>

          {editing ? (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={handleSaveClick}
            >
              Enregistrer
            </button>
          ) : (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => setEditing(true)}
            >
              Modifier
            </button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default PaymentInfo;
